import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BehaviorSubject, Subject, debounce, distinctUntilChanged, timer } from 'rxjs';
import { RenderStatus } from '../types';
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

const STORAGE_KEY = 'pdfmake_runner_saved_code_v1';

function safeParseDocDefinition(raw: unknown): any {
  if (typeof raw !== 'string') {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  // Try strict JSON parse first
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Try evaluation fallback for JS object literals (functions, comments, unquoted keys)
    try {
      const evaluated = new Function(`"use strict"; return (${trimmed});`)();
      if (evaluated && typeof evaluated === 'object') {
        return evaluated;
      }
    } catch {
      return null;
    }
  }
  return null;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private sanitizer = inject(DomSanitizer);

  // Initial code from localStorage or default starter
  private initialCode = this.loadInitialCode();

  private codeSubject = new BehaviorSubject<string>(this.initialCode);
  public code$ = this.codeSubject.asObservable();

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
    // Setup reactive pipeline with debounce.
    // NOTE: `debounceTime(ms)` evaluates its duration ONCE at subscription time,
    // so changing `debounceTimeSubject` later has no effect on the pipeline.
    // Instead we use `debounce(durationSelector)` — the selector is invoked
    // on every emission, so it reads the latest debounce time from the
    // BehaviorSubject and applies it to that specific emission. This is what
    // makes the "Debounce: 200/400/800ms" dropdown actually work at runtime.
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

  private loadInitialCode(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && typeof saved === 'string') {
        const trimmed = saved.trim();
        if (trimmed !== '' && trimmed !== 'undefined' && trimmed !== 'null' && trimmed.length > 5) {
          const doc = safeParseDocDefinition(trimmed);
          if (doc && typeof doc === 'object') {
            return trimmed;
          }
        }
      }
    } catch {
      // Local storage unavailable or parsing failed
    }
    return TEMPLATES[0].code;
  }

  public setCode(newCode: string, triggerAutoCompile = true): void {
    if (newCode === undefined || newCode === null || typeof newCode !== 'string') {
      newCode = TEMPLATES[0].code;
    }
    this.codeSubject.next(newCode);
    try {
      if (typeof newCode === 'string' && newCode.trim() !== '' && newCode !== 'undefined' && newCode !== 'null') {
        localStorage.setItem(STORAGE_KEY, newCode);
      }
    } catch {
      // Ignore storage errors
    }

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
    this.loadTemplate(TEMPLATES[0].id);
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
    const doc = safeParseDocDefinition(raw);
    if (doc && typeof doc === 'object') {
      try {
        const formatted = JSON.stringify(doc, null, 2);
        this.setCode(formatted, true);
        return { success: true, formatted };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Unable to format definition.' };
      }
    }
    return { success: false, error: 'Unable to parse document definition for formatting.' };
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

    try {
      let docDefinition = safeParseDocDefinition(codeString);

      if (!docDefinition || typeof docDefinition !== 'object') {
        const trimmed = codeString.trim();
        if (trimmed === 'undefined' || trimmed === 'null' || !trimmed) {
          this.statusSubject.next({
            state: 'error',
            errorMessage: 'Document definition cannot be undefined, null, or empty.'
          });
          return;
        }

        // Run explicit try/catch to extract syntax line numbers for the error display
        try {
          JSON.parse(trimmed);
        } catch (jsonErr: any) {
          const rawMsg = jsonErr?.message || 'Invalid JSON syntax';
          const lineMatch = rawMsg.match(/position (\d+)/i);
          let errorLine: number | undefined;
          if (lineMatch && lineMatch[1]) {
            const pos = parseInt(lineMatch[1], 10);
            errorLine = trimmed.slice(0, pos).split('\n').length;
          }
          this.statusSubject.next({
            state: 'error',
            errorMessage: `Syntax Error: ${rawMsg}`,
            errorLine
          });
          return;
        }

        this.statusSubject.next({
          state: 'error',
          errorMessage: 'Definition must be a valid document definition object (e.g. { content: [...] })'
        });
        return;
      }

      // Generate PDF
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);

      const handleBlob = (blob: Blob) => {
        const renderTime = Math.round(performance.now() - startTime);

        // Revoke previous blob to avoid browser memory leaks
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
            errorMessage: err?.message || 'PDF Generation failed during processing.'
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
      const docDefinition = safeParseDocDefinition(raw);
      if (!docDefinition) {
        throw new Error('Invalid document definition');
      }
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
      if (typeof pdfDoc.download === 'function') {
        pdfDoc.download(filename);
      } else {
        throw new Error('download method unavailable');
      }
    } catch (e: any) {
      console.warn('Direct download failed, falling back to blob download:', e);
      // Fallback: download the existing blob
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
      const docDefinition = safeParseDocDefinition(raw);
      if (!docDefinition) {
        throw new Error('Invalid document definition');
      }
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
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
