import { Component, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './components/editor/editor.component';
import { PreviewComponent } from './components/preview/preview.component';
import { TemplatesModalComponent } from './components/templates-modal/templates-modal.component';
import { CheatsheetDrawerComponent } from './components/cheatsheet-drawer/cheatsheet-drawer.component';
import { PdfService } from './services/pdf.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    EditorComponent,
    PreviewComponent,
    TemplatesModalComponent,
    CheatsheetDrawerComponent
  ],
  template: `
    <div class="h-screen w-screen flex flex-col bg-[#11111b] text-slate-100 font-sans overflow-hidden select-none">
      <!-- Global Top Navbar -->
      <header class="h-14 px-4 bg-[#181825] border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-900/30">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-bold text-sm text-white tracking-tight">PDF<span class="text-indigo-400">Make</span> Runner</h1>
              <span class="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-semibold">
                Angular 19
              </span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">Live code runner & instant PDF renderer</p>
          </div>
        </div>

        <!-- Center Controls: Auto-compile toggle & debounce speed -->
        <div class="hidden md:flex items-center gap-3 px-3 py-1 bg-[#1e1e2e] border border-slate-800 rounded-lg text-xs">
          <!-- Auto-compile toggle -->
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              [checked]="autoCompile()"
              (change)="toggleAutoCompile($event)"
              class="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800 w-3.5 h-3.5"
            />
            <span class="text-slate-300">Live Auto-Sync</span>
          </label>

          <span class="text-slate-700">|</span>

          <!-- Debounce speed selector -->
          <div class="flex items-center gap-1.5 text-slate-400">
            <span>Debounce:</span>
            <select
              [value]="debounceTime()"
              (change)="onDebounceChange($event)"
              class="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="200">200ms (Fast)</option>
              <option value="400">400ms (Normal)</option>
              <option value="800">800ms (Eco)</option>
            </select>
          </div>
        </div>

        <!-- Right Action Group -->
        <div class="flex items-center gap-2">
          <!-- Templates Button -->
          <button
            id="templates-btn"
            (click)="showTemplates.set(true)"
            class="px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Templates</span>
          </button>

          <!-- Snippets & Cheatsheet -->
          <button
            id="cheatsheet-btn"
            (click)="showCheatsheet.set(true)"
            class="px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span class="hidden sm:inline">Cheatsheet</span>
          </button>

          <!-- Reset Code -->
          <button
            id="reset-code-btn"
            (click)="resetCode()"
            title="Reset to starter document definition"
            class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>

          <!-- Layout Split Toggles -->
          <div class="hidden lg:flex items-center bg-[#1e1e2e] border border-slate-800 rounded-lg p-0.5 ml-1">
            <button
              (click)="layoutMode.set('editor')"
              title="Editor Only"
              [class.bg-slate-700]="layoutMode() === 'editor'"
              [class.text-white]="layoutMode() === 'editor'"
              class="p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <button
              (click)="layoutMode.set('split')"
              title="Split View (50/50)"
              [class.bg-slate-700]="layoutMode() === 'split'"
              [class.text-white]="layoutMode() === 'split'"
              class="p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="3" x2="12" y2="21"></line>
              </svg>
            </button>
            <button
              (click)="layoutMode.set('preview')"
              title="Preview Only"
              [class.bg-slate-700]="layoutMode() === 'preview'"
              [class.text-white]="layoutMode() === 'preview'"
              class="p-1.5 rounded text-slate-400 hover:text-slate-200 transition"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="15" y1="3" x2="15" y2="21"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workspace Split Pane -->
      <main class="flex-1 w-full flex overflow-hidden relative">
        <!-- Editor Pane -->
        @if (layoutMode() !== 'preview') {
          <section
            [class.w-full]="layoutMode() === 'editor'"
            [class.flex-1]="layoutMode() === 'split'"
            class="h-full flex flex-col transition-all duration-150"
          >
            <app-editor #editor></app-editor>
          </section>
        }

        <!-- Preview Pane -->
        @if (layoutMode() !== 'editor') {
          <section
            [class.w-full]="layoutMode() === 'preview'"
            [class.flex-1]="layoutMode() === 'split'"
            class="h-full flex flex-col transition-all duration-150 border-l border-slate-800"
          >
            <app-preview></app-preview>
          </section>
        }
      </main>

      <!-- Templates Modal -->
      @if (showTemplates()) {
        <app-templates-modal (close)="showTemplates.set(false)"></app-templates-modal>
      }

      <!-- Cheatsheet Drawer -->
      @if (showCheatsheet()) {
        <app-cheatsheet-drawer
          (close)="showCheatsheet.set(false)"
          (insert)="onSnippetInsert($event)"
        ></app-cheatsheet-drawer>
      }
    </div>
  `
})
export class AppComponent {
  @ViewChild('editor') editorComponent?: EditorComponent;

  private pdfService = inject(PdfService);

  public showTemplates = signal(false);
  public showCheatsheet = signal(false);
  public layoutMode = signal<'split' | 'editor' | 'preview'>('split');
  public autoCompile = signal(true);
  public debounceTime = signal(400);

  public toggleAutoCompile(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.autoCompile.set(checked);
    this.pdfService.setAutoCompile(checked);
  }

  public onDebounceChange(event: Event): void {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    this.debounceTime.set(val);
    this.pdfService.setDebounceTime(val);
  }

  public resetCode(): void {
    if (confirm('Reset editor to the starter playground template?')) {
      this.pdfService.resetToDefault();
    }
  }

  public onSnippetInsert(snippet: string): void {
    // If the editor pane is currently hidden (preview-only layout), bring it
    // back before inserting. Otherwise `@ViewChild('editor')` will be
    // `undefined` (the component was destroyed by `@if`) and the snippet
    // would be silently dropped. Switching to 'split' brings the editor
    // back into the DOM; we then wait one Angular change-detection cycle
    // (via setTimeout) for the ViewChild to bind before inserting.
    if (this.layoutMode() === 'preview') {
      this.layoutMode.set('split');
      setTimeout(() => {
        this.editorComponent?.insertSnippet(snippet);
      }, 0);
    } else if (this.editorComponent) {
      this.editorComponent.insertSnippet(snippet);
    }
    this.showCheatsheet.set(false);
  }
}
