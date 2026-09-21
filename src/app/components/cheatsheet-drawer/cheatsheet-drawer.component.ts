import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { COMMON_SNIPPETS } from '../../services/templates.data';
import { Snippet } from '../../types';

@Component({
  selector: 'app-cheatsheet-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#181825] border-l border-slate-700/80 shadow-2xl flex flex-col animate-slide-left">
      <!-- Header -->
      <div class="h-14 px-5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2 text-white font-bold text-sm">
          <svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          PDFMake Cheatsheet & Snippets
        </div>
        <button (click)="close.emit()" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Quick syntax reference card -->
        <div class="p-3.5 bg-[#1e1e2e] border border-slate-800 rounded-xl text-xs space-y-2">
          <h4 class="font-bold text-indigo-300">Quick Properties</h4>
          <div class="grid grid-cols-2 gap-1.5 text-slate-300 font-mono text-[11px]">
            <div><span class="text-sky-400">fontSize:</span> 12</div>
            <div><span class="text-sky-400">bold:</span> true</div>
            <div><span class="text-sky-400">italics:</span> true</div>
            <div><span class="text-sky-400">color:</span> "#0f172a"</div>
            <div><span class="text-sky-400">alignment:</span> "center"</div>
            <div><span class="text-sky-400">margin:</span> [L, T, R, B]</div>
            <div><span class="text-sky-400">pageSize:</span> "A4" | "LETTER"</div>
            <div><span class="text-sky-400">pageOrientation:</span> "landscape"</div>
          </div>
        </div>

        <!-- Snippets List -->
        @for (snippet of snippets; track snippet.name) {
          <div class="p-3.5 bg-[#1e1e2e] border border-slate-800 rounded-xl flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-200">{{ snippet.name }}</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {{ snippet.category }}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">{{ snippet.description }}</p>

            <pre class="p-2.5 bg-[#11111b] border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-300 overflow-x-auto select-all max-h-36"><code>{{ snippet.snippet }}</code></pre>

            <div class="flex justify-end gap-2 pt-1">
              <button
                (click)="copySnippet(snippet.snippet)"
                class="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition flex items-center gap-1 active:scale-95"
              >
                <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
              <button
                (click)="insert.emit(snippet.snippet)"
                class="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition flex items-center gap-1 active:scale-95"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Insert
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class CheatsheetDrawerComponent {
  @Output() close = new EventEmitter<void>();
  @Output() insert = new EventEmitter<string>();

  public snippets = COMMON_SNIPPETS;

  public copySnippet(code: string): void {
    navigator.clipboard.writeText(code);
  }
}
