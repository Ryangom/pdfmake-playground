import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfService } from '../../services/pdf.service';
import { EditorMode, RenderStatus } from '../../types';
import { Subscription } from 'rxjs';
import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { Compartment, EditorState } from '@codemirror/state';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-[#1e1e2e] border-r border-slate-800 relative">
      <!-- Editor Top Bar -->
      <div class="h-11 px-3 border-b border-slate-800 bg-[#181825] flex items-center justify-between select-none">
        <!-- Left: Mode Tabs & Cursor Position -->
        <div class="flex items-center gap-3">
          <!-- Segmented Mode Tabs -->
          <div class="flex items-center gap-0.5 bg-[#11111b] p-0.5 rounded-lg border border-slate-800/80">
            <!-- JSON Tab -->
            <button
              id="tab-mode-json"
              (click)="switchMode('json')"
              title="JSON Mode (Pure document definition)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition cursor-pointer"
              [ngClass]="activeMode() === 'json' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-[11px] font-mono leading-none">&#123; &#125;</span>
              <span>JSON</span>
            </button>

            <!-- JS Tab -->
            <button
              id="tab-mode-js"
              (click)="switchMode('js')"
              title="JavaScript Mode (Functions, loops, dynamic headers)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition cursor-pointer"
              [ngClass]="activeMode() === 'js' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <span class="text-[10px] font-mono font-black px-1 py-0.2 bg-slate-900/30 rounded leading-none">JS</span>
              <span>JavaScript</span>
            </button>

            <!-- Compiled Tab -->
            <button
              id="tab-mode-compiled"
              (click)="switchMode('compiled')"
              title="Compiled JSON output sent to pdfMake"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition cursor-pointer"
              [ngClass]="activeMode() === 'compiled' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'"
            >
              <svg class="w-3 h-3 text-emerald-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>Compiled</span>
            </button>
          </div>

          <!-- Position or Mode Indicator -->
          <div class="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            @if (activeMode() === 'compiled') {
              <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                READ-ONLY COMPILED
              </span>
            } @else {
              <span>Line {{ currentCursorLine() }}, Col {{ currentCursorCol() }}</span>
            }
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-1.5">
          @if (activeMode() === 'compiled') {
            <!-- Copy Compiled JSON Button -->
            <button
              id="copy-compiled-btn"
              (click)="copyCompiledJson()"
              title="Copy compiled document definition to clipboard"
              class="px-2.5 py-1 text-xs font-medium text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 rounded transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>{{ copiedRecently() ? 'Copied!' : 'Copy JSON' }}</span>
            </button>

            <!-- Load Compiled into JSON Editor -->
            <button
              id="use-as-json-btn"
              (click)="useCompiledAsJson()"
              title="Load this compiled JSON into the JSON editor tab"
              class="px-2.5 py-1 text-xs font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/60 rounded transition flex items-center gap-1.5 active:scale-95 cursor-pointer hidden md:flex"
            >
              <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 14 4 9 9 4"></polyline>
                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
              </svg>
              <span>Send to JSON</span>
            </button>

            <!-- Export Compiled JSON File -->
            <button
              id="export-compiled-btn"
              (click)="downloadCodeFile()"
              title="Save compiled definition as .json"
              class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span class="hidden md:inline">Export</span>
            </button>
          } @else {
            <!-- Format Button -->
            <button
              id="format-code-btn"
              (click)="formatDoc()"
              title="Prettify and format code indentation"
              class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10H7"></path>
                <path d="M21 6H3"></path>
                <path d="M21 14H3"></path>
                <path d="M21 18H7"></path>
              </svg>
              Format
            </button>

            <!-- Upload / Open file -->
            <label
              title="Open local .json or .js docDefinition"
              class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded cursor-pointer transition flex items-center gap-1.5 active:scale-95"
            >
              <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span class="hidden md:inline">Open</span>
              <input type="file" accept=".json,.js,.txt" (change)="onFileUpload($event)" class="hidden" />
            </label>

            <!-- Download Code -->
            <button
              id="download-code-btn"
              (click)="downloadCodeFile()"
              [title]="activeMode() === 'js' ? 'Save code as .js file' : 'Save code as .json file'"
              class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span class="hidden md:inline">Export</span>
            </button>
          }
        </div>
      </div>

      <!-- CodeMirror Container -->
      <div #editorHost class="flex-1 w-full overflow-hidden text-sm"></div>

      <!-- Syntax / Definition Error Banner at Bottom -->
      @if (status().state === 'error') {
        <div class="p-2.5 bg-rose-950/90 border-t border-rose-800 text-rose-200 text-xs font-mono flex items-start justify-between gap-3 animate-fade-in z-20">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="leading-relaxed break-words">
              <span class="font-bold text-rose-300">
                {{ activeMode() === 'js' ? 'JavaScript Execution Error:' : 'Syntax Error:' }}
              </span>
              {{ status().errorMessage }}
            </div>
          </div>
          @if (status().errorLine && activeMode() !== 'compiled') {
            <button
              (click)="jumpToLine(status().errorLine!)"
              class="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] shrink-0 transition cursor-pointer"
            >
              Go to Line {{ status().errorLine }}
            </button>
          }
        </div>
      }

      <!-- Editor Bottom Footer -->
      <div class="h-7 px-3 bg-[#11111b] border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div class="flex items-center gap-3">
          <span>{{ lineCount() }} lines</span>
          <span>{{ charCount() }} chars</span>
        </div>
        <div class="flex items-center gap-2">
          <span>UTF-8</span>
          <span class="text-slate-600">•</span>
          <span class="font-medium text-slate-300">
            @if (activeMode() === 'js') {
              JavaScript Mode (ES6+)
            } @else if (activeMode() === 'compiled') {
              Compiled JSON AST
            } @else {
              JSON Mode
            }
          </span>
        </div>
      </div>
    </div>
  `,
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  private pdfService = inject(PdfService);
  private sub = new Subscription();

  private editorView?: EditorView;
  private isUpdatingFromService = false;

  private languageCompartment = new Compartment();
  private readOnlyCompartment = new Compartment();

  public status = signal<RenderStatus>({ state: 'idle' });
  public activeMode = signal<EditorMode>('json');
  public currentCursorLine = signal(1);
  public currentCursorCol = signal(1);
  public lineCount = signal(1);
  public charCount = signal(0);
  public copiedRecently = signal(false);

  private latestCompiledJson = '';

  ngOnInit(): void {
    this.initCodeMirror();

    // Listen to mode changes
    this.sub.add(
      this.pdfService.mode$.subscribe((mode) => {
        this.activeMode.set(mode);
        this.applyModeToEditor(mode);
      })
    );

    // Listen to code changes from external actions (e.g. templates, file upload)
    this.sub.add(
      this.pdfService.code$.subscribe((code) => {
        if (this.activeMode() !== 'compiled') {
          this.setEditorContent(code);
        }
      })
    );

    // Track compiled JSON output
    this.sub.add(
      this.pdfService.compiledJson$.subscribe((compiled) => {
        this.latestCompiledJson = compiled;
        if (this.activeMode() === 'compiled') {
          this.setEditorContent(compiled);
        }
      })
    );

    // Track render status
    this.sub.add(
      this.pdfService.status$.subscribe((st) => {
        this.status.set(st as any);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.editorView?.destroy();
  }

  private initCodeMirror(): void {
    const initialMode = this.pdfService.getMode();
    const initialText =
      initialMode === 'compiled'
        ? this.latestCompiledJson
        : this.pdfService.getCode();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !this.isUpdatingFromService) {
        if (this.activeMode() !== 'compiled') {
          const newCode = update.state.doc.toString();
          this.pdfService.setCode(newCode, true);
          this.updateMetrics();
        }
      }

      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        this.currentCursorLine.set(line.number);
        this.currentCursorCol.set(pos - line.from + 1);
      }
    });

    const langExtension =
      initialMode === 'js' ? javascript() : json();
    const isReadOnly = initialMode === 'compiled';

    const startState = EditorState.create({
      doc: initialText,
      extensions: [
        basicSetup,
        this.languageCompartment.of(langExtension),
        this.readOnlyCompartment.of(EditorState.readOnly.of(isReadOnly)),
        oneDark,
        updateListener,
        EditorView.lineWrapping,
        EditorView.theme({
          '&': {
            backgroundColor: '#181825',
            color: '#cdd6f4'
          },
          '.cm-gutters': {
            backgroundColor: '#11111b',
            color: '#6c7086',
            borderRight: '1px solid #313244'
          },
          '.cm-activeLine': {
            backgroundColor: '#232338'
          },
          '.cm-activeLineGutter': {
            backgroundColor: '#28283d',
            color: '#89b4fa'
          }
        })
      ]
    });

    this.editorView = new EditorView({
      state: startState,
      parent: this.editorHost.nativeElement
    });

    this.updateMetrics();
  }

  private applyModeToEditor(mode: EditorMode): void {
    if (!this.editorView) return;

    if (mode === 'js') {
      this.editorView.dispatch({
        effects: [
          this.languageCompartment.reconfigure(javascript()),
          this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(false))
        ]
      });
      this.setEditorContent(this.pdfService.getCode());
    } else if (mode === 'compiled') {
      this.editorView.dispatch({
        effects: [
          this.languageCompartment.reconfigure(json()),
          this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(true))
        ]
      });
      this.setEditorContent(this.latestCompiledJson);
    } else {
      // JSON mode
      this.editorView.dispatch({
        effects: [
          this.languageCompartment.reconfigure(json()),
          this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(false))
        ]
      });
      this.setEditorContent(this.pdfService.getCode());
    }
  }

  private setEditorContent(text: string): void {
    if (!this.editorView) return;
    const currentText = this.editorView.state.doc.toString();
    if (currentText !== text) {
      this.isUpdatingFromService = true;
      this.editorView.dispatch({
        changes: { from: 0, to: currentText.length, insert: text }
      });
      this.isUpdatingFromService = false;
      this.updateMetrics();
    }
  }

  private updateMetrics(): void {
    if (!this.editorView) return;
    const doc = this.editorView.state.doc;
    this.lineCount.set(doc.lines);
    this.charCount.set(doc.length);
  }

  public switchMode(mode: EditorMode): void {
    this.pdfService.setMode(mode);
  }

  public copyCompiledJson(): void {
    const text = this.latestCompiledJson || this.editorView?.state.doc.toString() || '';
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedRecently.set(true);
      setTimeout(() => this.copiedRecently.set(false), 2200);
    });
  }

  public useCompiledAsJson(): void {
    if (!this.latestCompiledJson) return;
    this.pdfService.setMode('json');
    this.pdfService.setCode(this.latestCompiledJson, true);
  }

  public formatDoc(): void {
    const res = this.pdfService.formatCode();
    if (!res.success && res.error) {
      alert(`Formatting error: ${res.error}`);
    }
  }

  public insertSnippet(snippetText: string): void {
    if (!this.editorView || this.activeMode() === 'compiled') return;
    const state = this.editorView.state;
    const selection = state.selection.main;
    this.editorView.dispatch({
      changes: { from: selection.from, to: selection.to, insert: snippetText },
      selection: { anchor: selection.from + snippetText.length }
    });
    this.editorView.focus();
  }

  public jumpToLine(lineNumber: number): void {
    if (!this.editorView) return;
    const doc = this.editorView.state.doc;
    if (lineNumber > 0 && lineNumber <= doc.lines) {
      const line = doc.line(lineNumber);
      this.editorView.dispatch({
        selection: { anchor: line.from },
        scrollIntoView: true
      });
      this.editorView.focus();
    }
  }

  public onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        if (file.name.endsWith('.js') && this.activeMode() !== 'js') {
          this.pdfService.setMode('js');
        } else if (file.name.endsWith('.json') && this.activeMode() !== 'json') {
          this.pdfService.setMode('json');
        }
        this.pdfService.setCode(text, true);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  public downloadCodeFile(): void {
    let code: string;
    let filename: string;

    if (this.activeMode() === 'compiled') {
      code = this.latestCompiledJson;
      filename = 'docDefinition.compiled.json';
    } else if (this.activeMode() === 'js') {
      code = this.pdfService.getCode();
      filename = 'docDefinition.js';
    } else {
      code = this.pdfService.getCode();
      filename = 'docDefinition.json';
    }

    const mimeType = filename.endsWith('.js') ? 'text/javascript' : 'application/json';
    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
