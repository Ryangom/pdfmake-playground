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
import { RenderStatus } from '../../types';
import { Subscription } from 'rxjs';
import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-[#1e1e2e] border-r border-slate-800 relative">
      <!-- Editor Top Bar -->
      <div class="h-11 px-3 border-b border-slate-800 bg-[#181825] flex items-center justify-between select-none">
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-950/60 border border-indigo-700/40 text-indigo-300 rounded text-xs font-semibold tracking-wide">
            <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            docDefinition.json
          </span>
          <span class="text-[11px] text-slate-400 hidden sm:inline-block">
            Line {{ currentCursorLine() }}, Col {{ currentCursorCol() }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Format Button -->
          <button
            id="format-json-btn"
            (click)="formatDoc()"
            title="Prettify and format code indentation"
            class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1.5 active:scale-95"
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
            title="Save code as JSON file"
            class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1.5 active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span class="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      <!-- CodeMirror Container -->
      <div #editorHost class="flex-1 w-full overflow-hidden text-sm"></div>

      <!-- Syntax Error Banner at Bottom -->
      @if (status().state === 'error') {
        <div class="p-2.5 bg-rose-950/90 border-t border-rose-800 text-rose-200 text-xs font-mono flex items-start justify-between gap-3 animate-fade-in z-20">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div class="leading-relaxed break-words">
              <span class="font-bold text-rose-300">Syntax / Definition Error:</span>
              {{ status().errorMessage }}
            </div>
          </div>
          @if (status().errorLine) {
            <button
              (click)="jumpToLine(status().errorLine!)"
              class="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-[11px] shrink-0 transition"
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
          <span>JSON/JavaScript</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        overflow: hidden;
      }
      :host ::ng-deep .cm-editor {
        height: 100%;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        line-height: 1.55;
      }
      :host ::ng-deep .cm-scroller {
        overflow: auto;
      }
      :host ::ng-deep .cm-focused {
        outline: none !important;
      }
    `
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  private pdfService = inject(PdfService);
  private sub = new Subscription();

  private editorView?: EditorView;
  private isUpdatingFromService = false;

  public status = signal<RenderStatus>({ state: 'idle' });
  public currentCursorLine = signal(1);
  public currentCursorCol = signal(1);
  public lineCount = signal(1);
  public charCount = signal(0);

  ngOnInit(): void {
    this.initCodeMirror();

    // Listen to code changes from external actions (e.g. template selection, formatting)
    this.sub.add(
      this.pdfService.code$.subscribe((code) => {
        if (!this.editorView) return;
        const currentEditorText = this.editorView.state.doc.toString();
        if (currentEditorText !== code) {
          this.isUpdatingFromService = true;
          this.editorView.dispatch({
            changes: { from: 0, to: currentEditorText.length, insert: code }
          });
          this.isUpdatingFromService = false;
          this.updateMetrics();
        }
      })
    );

    // Track status
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
    const initialText = this.pdfService.getCode();

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !this.isUpdatingFromService) {
        const newCode = update.state.doc.toString();
        this.pdfService.setCode(newCode, true);
        this.updateMetrics();
      }

      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head;
        const line = update.state.doc.lineAt(pos);
        this.currentCursorLine.set(line.number);
        this.currentCursorCol.set(pos - line.from + 1);
      }
    });

    const startState = EditorState.create({
      doc: initialText,
      extensions: [
        basicSetup,
        json(),
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

  private updateMetrics(): void {
    if (!this.editorView) return;
    const doc = this.editorView.state.doc;
    this.lineCount.set(doc.lines);
    this.charCount.set(doc.length);
  }

  public formatDoc(): void {
    const res = this.pdfService.formatCode();
    if (!res.success && res.error) {
      alert(`Formatting error: ${res.error}`);
    }
  }

  public insertSnippet(snippetText: string): void {
    if (!this.editorView) return;
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
        this.pdfService.setCode(text, true);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  public downloadCodeFile(): void {
    const code = this.pdfService.getCode();
    const blob = new Blob([code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docDefinition.json';
    a.click();
    URL.revokeObjectURL(url);
  }
}
