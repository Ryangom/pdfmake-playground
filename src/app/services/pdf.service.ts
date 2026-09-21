import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Subject, debounce, distinctUntilChanged, timer } from 'rxjs';
import { EditorMode, RenderStatus } from '../types';
import { TEMPLATES } from './templates.data';

// Import pdfmake and its virtual font file
import pdfMakeModule from 'pdfmake/build/pdfmake.js';
import pdfFontsModule from 'pdfmake/build/vfs_fonts.js';

// Resolve pdfMake instance and virtual fonts correctly
const pdfMake: any = (pdfMakeModule as any).default || pdfMakeModule;
const pdfFonts: any = (pdfFontsModule as any).default || pdfFontsModule;

const vfsData = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;
if (typeof pdfMake.addVirtualFileSystem === 'function') {
  pdfMake.addVirtualFileSystem(vfsData);
}
if (!pdfMake.vfs) {
  pdfMake.vfs = vfsData;
}

const STORAGE_KEY_LEGACY = 'pdfmake_runner_saved_code_v1';
const STORAGE_KEY_MODE = 'pdfmake_runner_active_mode_v1';
const STORAGE_KEY_JSON = 'pdfmake_runner_json_code_v1';
const STORAGE_KEY_JS = 'pdfmake_runner_js_code_v1';

export const DEFAULT_JS_STARTER = `// PDFMake JavaScript Mode
// Define helper functions, loops, and dynamic calculations!

function verticalHeader(label, height = 200) {
  return {
    svg: \`
      <svg width="24" height="\${height}">
        <text x="15" y="\${height / 2}"
              text-anchor="middle"
              font-size="10"
              font-family="Roboto"
              font-weight="bold"
              transform="rotate(-90 15 \${height / 2})">
          \${label}
        </text>
      </svg>\`,
    width: 24,
  };
}

const docDefinition = {
  pageOrientation: 'landscape',
  pageSize: { width: 1000, height: 700 },
  header: {
    text: 'Academic Term Grade Sheet • Dynamic JS Mode',
    alignment: 'right',
    fontSize: 9,
    color: '#94a3b8',
    margin: [40, 20]
  },
  content: [
    {
      text: 'Semester Grade Sheet & Evaluation',
      fontSize: 18,
      bold: true,
      margin: [0, 0, 0, 16],
      color: '#1e293b'
    },
    {
      table: {
        headerRows: 1,
        widths: [40, 90, 140, 24, 24, 24, 60, 60],
        body: [
          // Header row with rotated vertical SVG headers
          [
            { text: 'Sl.No', bold: true, alignment: 'center' },
            { text: 'Student ID', bold: true },
            { text: 'Name', bold: true },
            verticalHeader('ΣCi×Gi in this Term'),
            verticalHeader('Marks Obtained in this Term'),
            verticalHeader('Total Credits Taken in this Term'),
            { text: 'GPA', bold: true, alignment: 'center' },
            { text: 'Status', bold: true, alignment: 'center' }
          ],
          // Sample Student Rows
          [
            { text: '1', alignment: 'center' },
            '2023001',
            'Sadman Rahman',
            { text: '68.4', alignment: 'center' },
            { text: '85', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.80', alignment: 'center', bold: true, color: '#16a34a' },
            { text: 'Passed', alignment: 'center', color: '#16a34a' }
          ],
          [
            { text: '2', alignment: 'center' },
            '2023002',
            'Tasnim Ahmed',
            { text: '70.2', alignment: 'center' },
            { text: '88', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.90', alignment: 'center', bold: true, color: '#16a34a' },
            { text: 'Passed', alignment: 'center', color: '#16a34a' }
          ],
          [
            { text: '3', alignment: 'center' },
            '2023003',
            'Nusrat Jahan',
            { text: '63.0', alignment: 'center' },
            { text: '78', alignment: 'center' },
            { text: '18', alignment: 'center' },
            { text: '3.50', alignment: 'center', bold: true, color: '#0284c7' },
            { text: 'Passed', alignment: 'center', color: '#0284c7' }
          ]
        ]
      },
      layout: 'lightHorizontalLines'
    }
  ]
};

return docDefinition;
`;

export interface EvaluationResult {
  success: boolean;
  docDefinition?: any;
  error?: string;
  errorLine?: number;
}

export function evaluateDocDefinition(raw: unknown, mode: 'json' | 'js'): EvaluationResult {
  if (typeof raw !== 'string') {
    return { success: false, error: 'Document definition must be a string.' };
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return { success: false, error: 'Document definition cannot be empty.' };
  }

  // Strict JSON evaluation with JS fallback for pdfmake object literals/callbacks
  if (mode === 'json') {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return { success: true, docDefinition: parsed };
      }
      return { success: false, error: 'JSON definition must be an object (e.g. { "content": [...] })' };
    } catch (jsonErr: any) {
      // Fallback: evaluate as JS object literal (supports functions like footer, layout callbacks, unquoted keys)
      try {
        const evaluated = new Function(`"use strict"; return (${trimmed});`)();
        if (evaluated && typeof evaluated === 'object') {
          return { success: true, docDefinition: evaluated };
        }
      } catch {
        // If JS fallback also fails, report the original JSON syntax error
      }

      const rawMsg = jsonErr?.message || 'Invalid JSON syntax';
      const lineMatch = rawMsg.match(/position (\d+)/i);
      let errorLine: number | undefined;
      if (lineMatch && lineMatch[1]) {
        const pos = parseInt(lineMatch[1], 10);
        errorLine = trimmed.slice(0, pos).split('\n').length;
      }
      return { success: false, error: `Syntax Error: ${rawMsg}`, errorLine };
    }
  }

  // JS Mode: Full JavaScript evaluation
  try {
    let evaluated: any;
    let evalError: any;

    // 1. Try running as a script block (with return or const docDefinition)
    try {
      const runner = new Function(`
        "use strict";
        ${trimmed}
        ;if (typeof docDefinition !== "undefined") return docDefinition;
      `);
      evaluated = runner();
    } catch (e: any) {
      evalError = e;
    }

    // 2. Fallback: try expression evaluation (e.g. raw object literal or IIFE)
    if (evaluated === undefined) {
      try {
        evaluated = new Function(`"use strict"; return (${trimmed});`)();
        evalError = null;
      } catch {
        // Keep the original evalError if available
      }
    }

    if (evalError && evaluated === undefined) {
      const msg = evalError?.message || 'JavaScript execution error';
      let errorLine: number | undefined;
      if (evalError?.stack) {
        const match = evalError.stack.match(/<anonymous>:(\d+):(\d+)/);
        if (match && match[1]) {
          const line = parseInt(match[1], 10) - 2; // offset wrapper lines
          if (line > 0) errorLine = line;
        }
      }
      return { success: false, error: `JS Error: ${msg}`, errorLine };
    }

    if (!evaluated || typeof evaluated !== 'object') {
      return {
        success: false,
        error: 'Script must return or declare a document definition object (e.g. "return docDefinition;" or "return { content: [...] };")'
      };
    }

    return { success: true, docDefinition: evaluated };
  } catch (err: any) {
    return {
      success: false,
      error: `Execution Error: ${err?.message || 'Failed to evaluate JavaScript.'}`
    };
  }
}

export function serializeCompiledDoc(doc: any): string {
  try {
    return JSON.stringify(
      doc,
      (_key, value) => {
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'callback'}]`;
        }
        return value;
      },
      2
    );
  } catch (err: any) {
    return `// Failed to serialize compiled document: ${err?.message || 'Unknown error'}`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private sanitizer = inject(DomSanitizer);

  // Active Editor Mode: 'json' | 'js' | 'compiled'
  private initialMode = this.loadInitialMode();
  private modeSubject = new BehaviorSubject<EditorMode>(this.initialMode);
  public mode$ = this.modeSubject.asObservable();

  // Code buffers
  private jsonCode = this.loadInitialJsonCode();
  private jsCode = this.loadInitialJsCode();

  private codeSubject = new BehaviorSubject<string>(
    this.initialMode === 'js' ? this.jsCode : this.jsonCode
  );
  public code$ = this.codeSubject.asObservable();

  // Compiled JSON definition
  private compiledJsonSubject = new BehaviorSubject<string>('');
  public compiledJson$ = this.compiledJsonSubject.asObservable();

  private pdfUrlSubject = new BehaviorSubject<SafeResourceUrl | null>(null);
  public pdfUrl$ = this.pdfUrlSubject.asObservable();

  private rawBlobSubject = new BehaviorSubject<Blob | null>(null);
  public rawBlob$ = this.rawBlobSubject.asObservable();

  private rawBlobUrlSubject = new BehaviorSubject<string | null>(null);
  public rawBlobUrl$ = this.rawBlobUrlSubject.asObservable();

  private statusSubject = new BehaviorSubject<RenderStatus>({
    state: 'idle'
  });
  public status$ = this.statusSubject.asObservable();

  private autoCompileSubject = new BehaviorSubject<boolean>(true);
  public autoCompile$ = this.autoCompileSubject.asObservable();

  private debounceTimeSubject = new BehaviorSubject<number>(400);
  public debounceTime$ = this.debounceTimeSubject.asObservable();

  private currentBlobUrl: string | null = null;
  private codePipeline$ = new Subject<string>();

  constructor() {
    this.codePipeline$
      .pipe(
        debounce(() => timer(this.debounceTimeSubject.value)),
        distinctUntilChanged()
      )
      .subscribe((code) => {
        if (this.autoCompileSubject.value) {
          this.executeRender(code);
        }
      });

    // Initial render
    setTimeout(() => {
      this.executeRender(this.codeSubject.value);
    }, 50);
  }

  private loadInitialMode(): EditorMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MODE) as EditorMode;
      if (saved === 'json' || saved === 'js' || saved === 'compiled') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'json';
  }

  private loadInitialJsonCode(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JSON) || localStorage.getItem(STORAGE_KEY_LEGACY);
      if (saved && typeof saved === 'string' && saved.trim().length > 5) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return TEMPLATES[0].code;
  }

  private loadInitialJsCode(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JS);
      if (saved && typeof saved === 'string' && saved.trim().length > 5) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_JS_STARTER;
  }

  public getMode(): EditorMode {
    return this.modeSubject.value;
  }

  public setMode(newMode: EditorMode): void {
    if (newMode === this.modeSubject.value) return;

    const prevMode = this.modeSubject.value;

    // Save active code before switching
    if (prevMode === 'json') {
      this.jsonCode = this.codeSubject.value;
      try {
        localStorage.setItem(STORAGE_KEY_JSON, this.jsonCode);
      } catch {}
    } else if (prevMode === 'js') {
      this.jsCode = this.codeSubject.value;
      try {
        localStorage.setItem(STORAGE_KEY_JS, this.jsCode);
      } catch {}
    }

    this.modeSubject.next(newMode);
    try {
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
    } catch {}

    if (newMode === 'json') {
      this.codeSubject.next(this.jsonCode);
      this.executeRender(this.jsonCode);
    } else if (newMode === 'js') {
      this.codeSubject.next(this.jsCode);
      this.executeRender(this.jsCode);
    }
    // If newMode === 'compiled', we keep current code and render state intact
  }

  public setCode(newCode: string, triggerAutoCompile = true): void {
    if (newCode === undefined || newCode === null || typeof newCode !== 'string') {
      newCode = this.modeSubject.value === 'js' ? DEFAULT_JS_STARTER : TEMPLATES[0].code;
    }

    const currentMode = this.modeSubject.value;
    if (currentMode === 'json') {
      this.jsonCode = newCode;
      try {
        localStorage.setItem(STORAGE_KEY_JSON, newCode);
      } catch {}
    } else if (currentMode === 'js') {
      this.jsCode = newCode;
      try {
        localStorage.setItem(STORAGE_KEY_JS, newCode);
      } catch {}
    }

    this.codeSubject.next(newCode);

    if (triggerAutoCompile && this.autoCompileSubject.value) {
      this.codePipeline$.next(newCode);
    }
  }

  public getCode(): string {
    return this.codeSubject.value;
  }

  public setAutoCompile(enabled: boolean): void {
    this.autoCompileSubject.next(enabled);
    if (enabled) {
      this.executeRender(this.codeSubject.value);
    }
  }

  public setDebounceTime(ms: number): void {
    this.debounceTimeSubject.next(ms);
  }

  public runNow(): void {
    this.executeRender(this.codeSubject.value);
  }

  public resetToDefault(): void {
    if (this.modeSubject.value === 'js') {
      this.setCode(DEFAULT_JS_STARTER, true);
    } else {
      this.loadTemplate(TEMPLATES[0].id);
    }
  }

  public loadTemplate(templateId: string): void {
    const found = TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      this.setCode(found.code, true);
      this.executeRender(found.code);
    }
  }

  public formatCode(): { success: boolean; formatted?: string; error?: string } {
    const raw = this.codeSubject.value;
    if (typeof raw !== 'string' || !raw.trim()) {
      return { success: false, error: 'Document definition is empty.' };
    }

    const mode = this.modeSubject.value === 'js' ? 'js' : 'json';
    const evalResult = evaluateDocDefinition(raw, mode);

    if (!evalResult.success || !evalResult.docDefinition) {
      return { success: false, error: evalResult.error || 'Unable to parse document definition for formatting.' };
    }

    if (mode === 'json') {
      try {
        const formatted = JSON.stringify(evalResult.docDefinition, null, 2);
        this.setCode(formatted, true);
        return { success: true, formatted };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Formatting failed.' };
      }
    } else {
      // In JS mode, we avoid JSON.stringify to preserve functions, but we can verify it parses
      return { success: true, formatted: raw };
    }
  }

  private executeRender(codeString: string): void {
    if (typeof codeString !== 'string' || !codeString.trim() || codeString.trim() === 'undefined' || codeString.trim() === 'null') {
      this.statusSubject.next({
        state: 'error',
        errorMessage: 'Document definition cannot be empty.'
      });
      return;
    }

    this.statusSubject.next({
      state: 'generating'
    });

    const startTime = performance.now();
    const effectiveMode = this.modeSubject.value === 'js' ? 'js' : 'json';
    const evalResult = evaluateDocDefinition(codeString, effectiveMode);

    if (!evalResult.success || !evalResult.docDefinition) {
      this.statusSubject.next({
        state: 'error',
        errorMessage: evalResult.error || 'Definition evaluation failed.',
        errorLine: evalResult.errorLine
      });
      return;
    }

    const docDefinition = evalResult.docDefinition;

    // Update compiled JSON view
    this.compiledJsonSubject.next(serializeCompiledDoc(docDefinition));

    try {
      // Generate PDF
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);

      const handleBlob = (blob: Blob) => {
        const renderTime = Math.round(performance.now() - startTime);

        if (this.currentBlobUrl) {
          URL.revokeObjectURL(this.currentBlobUrl);
        }

        const newUrl = URL.createObjectURL(blob);
        this.currentBlobUrl = newUrl;

        this.rawBlobSubject.next(blob);
        this.rawBlobUrlSubject.next(newUrl);
        this.pdfUrlSubject.next(this.sanitizer.bypassSecurityTrustResourceUrl(newUrl));

        this.statusSubject.next({
          state: 'success',
          renderTimeMs: renderTime,
          fileSizeBytes: blob.size
        });
      };

      const result = pdfDoc.getBlob(handleBlob);
      if (result && typeof result.then === 'function') {
        result.then((blob: Blob) => {
          handleBlob(blob);
        }).catch((err: any) => {
          this.statusSubject.next({
            state: 'error',
            errorMessage: err?.message || 'PDF generation failed during processing.'
          });
        });
      }
    } catch (renderErr: any) {
      this.statusSubject.next({
        state: 'error',
        errorMessage: renderErr?.message || 'PDF Generation failed. Check content syntax.'
      });
    }
  }

  public downloadCurrent(filename = 'document.pdf'): void {
    const raw = this.codeSubject.value;
    try {
      const mode = this.modeSubject.value === 'js' ? 'js' : 'json';
      const evalResult = evaluateDocDefinition(raw, mode);
      if (!evalResult.success || !evalResult.docDefinition) {
        throw new Error(evalResult.error || 'Invalid document definition');
      }
      const pdfDoc = (pdfMake as any).createPdf(evalResult.docDefinition);
      if (typeof pdfDoc.download === 'function') {
        pdfDoc.download(filename);
      } else {
        throw new Error('download method unavailable');
      }
    } catch (e: any) {
      console.warn('Direct download failed, falling back to blob download:', e);
      const blob = this.rawBlobSubject.value;
      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      }
    }
  }

  public printCurrent(): void {
    const raw = this.codeSubject.value;
    try {
      const mode = this.modeSubject.value === 'js' ? 'js' : 'json';
      const evalResult = evaluateDocDefinition(raw, mode);
      if (!evalResult.success || !evalResult.docDefinition) {
        throw new Error(evalResult.error || 'Invalid document definition');
      }
      const pdfDoc = (pdfMake as any).createPdf(evalResult.docDefinition);
      if (typeof pdfDoc.print === 'function') {
        pdfDoc.print();
      } else {
        throw new Error('print method unavailable');
      }
    } catch (e: any) {
      console.warn('Direct print failed:', e);
      const url = this.rawBlobUrlSubject.value;
      if (url) {
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.focus();
        }
      }
    }
  }

  public openInNewTab(): void {
    const url = this.rawBlobUrlSubject.value;
    if (url) {
      window.open(url, '_blank');
    }
  }
}
