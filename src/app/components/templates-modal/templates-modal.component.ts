import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TEMPLATES } from '../../services/templates.data';
import { PdfService } from '../../services/pdf.service';
import { PdfTemplate } from '../../types';

@Component({
  selector: 'app-templates-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" (click)="close.emit()">
      <div class="bg-[#181825] border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              PDFMake Templates Library
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Select a pre-built document definition to jumpstart your PDF design.</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Grid of Templates -->
        <div class="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (tpl of templates; track tpl.id) {
            <div
              (click)="selectTemplate(tpl)"
              class="group p-4 bg-[#1e1e2e] hover:bg-[#252538] border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {{ tpl.category }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">id: {{ tpl.id }}</span>
                </div>
                <h3 class="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                  {{ tpl.title }}
                </h3>
                <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {{ tpl.description }}
                </p>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium group-hover:translate-x-0.5 transition">
                <span>Load into Editor</span>
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class TemplatesModalComponent {
  @Output() close = new EventEmitter<void>();

  private pdfService = inject(PdfService);
  public templates = TEMPLATES;

  public selectTemplate(tpl: PdfTemplate): void {
    if (confirm(`Load template "${tpl.title}"? This will replace your current editor code.`)) {
      this.pdfService.loadTemplate(tpl.id);
      this.close.emit();
    }
  }
}
