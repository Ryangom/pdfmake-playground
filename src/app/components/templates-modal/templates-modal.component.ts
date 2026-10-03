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
      <div class="bg-[#181825] border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
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
              PDFMake Starter Templates
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">Select a runner template to instantly load into the playground.</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- 3 Template Cards Grid (JSON, JavaScript, TypeScript) -->
        <div class="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (tpl of templates; track tpl.id) {
            <div
              (click)="selectTemplate(tpl)"
              class="group p-4 bg-[#1e1e2e] hover:bg-[#252538] border border-slate-800 hover:border-indigo-500/50 rounded-xl cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <div class="flex items-center gap-1.5">
                    @if (tpl.mode === 'ts') {
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                        TypeScript
                      </span>
                    } @else if (tpl.mode === 'js') {
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        JavaScript
                      </span>
                    } @else {
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                        JSON
                      </span>
                    }
                  </div>
                  <span class="text-[11px] text-slate-400 font-mono">{{ tpl.category }}</span>
                </div>

                <div class="flex items-start gap-2.5 mb-2">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    [ngClass]="{
                      'bg-indigo-950/80 text-indigo-400 border border-indigo-800/60': tpl.mode === 'json',
                      'bg-amber-950/80 text-amber-400 border border-amber-800/60': tpl.mode === 'js',
                      'bg-sky-950/80 text-sky-400 border border-sky-800/60': tpl.mode === 'ts'
                    }">
                    @if (tpl.mode === 'ts') {
                      <span class="text-xs font-mono font-black">TS</span>
                    } @else if (tpl.mode === 'js') {
                      <span class="text-xs font-mono font-black">JS</span>
                    } @else {
                      <span class="text-xs font-mono font-black">&#123; &#125;</span>
                    }
                  </div>
                  <h3 class="text-sm font-bold text-white group-hover:text-indigo-300 transition leading-snug">
                    {{ tpl.title }}
                  </h3>
                </div>

                <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                  {{ tpl.description }}
                </p>
              </div>

              <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium group-hover:translate-x-0.5 transition"
                [ngClass]="{
                  'text-indigo-400': tpl.mode === 'json',
                  'text-amber-400': tpl.mode === 'js',
                  'text-sky-400': tpl.mode === 'ts'
                }">
                <span>Load Runner</span>
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
    if (confirm(`Load "${tpl.title}" template? This will replace your current editor code.`)) {
      this.pdfService.loadTemplate(tpl.id);
      this.close.emit();
    }
  }
}
