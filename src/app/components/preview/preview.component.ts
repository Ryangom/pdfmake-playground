import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfService } from '../../services/pdf.service';
import { RenderStatus } from '../../types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full bg-[#11111b] relative overflow-hidden">
      <!-- Preview Header Toolbar -->
      <div class="h-11 px-3 border-b border-slate-800 bg-[#181825] flex items-center justify-between select-none">
        <div class="flex items-center gap-2.5">
          <div class="flex items-center gap-1.5 font-semibold text-xs text-slate-200">
            <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Instant PDF View
          </div>

          <!-- Status Badge -->
          @if (status().state === 'generating') {
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
              Generating...
            </span>
          } @else if (status().state === 'success') {
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {{ status().renderTimeMs }}ms • {{ formatFileSize(status().fileSizeBytes) }}
            </span>
          } @else if (status().state === 'error') {
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Invalid
            </span>
          }
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-1.5">
          <!-- Refresh / Run button -->
          <button
            id="run-now-btn"
            (click)="runNow()"
            title="Force immediate PDF re-render"
            class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded transition flex items-center gap-1 active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-sky-400" [class.animate-spin]="status().state === 'generating'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
            <span class="hidden sm:inline">Run</span>
          </button>

          <!-- Open in New Tab -->
          <button
            id="open-tab-btn"
            (click)="openInNewTab()"
            [disabled]="!hasPdf()"
            title="Open raw PDF document in a new browser tab"
            class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 rounded transition flex items-center gap-1 active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span class="hidden md:inline">Pop Out</span>
          </button>

          <!-- Print PDF -->
          <button
            id="print-pdf-btn"
            (click)="printPdf()"
            [disabled]="!hasPdf()"
            title="Direct print dialog"
            class="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/60 rounded transition flex items-center gap-1 active:scale-95"
          >
            <svg class="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span class="hidden md:inline">Print</span>
          </button>

          <!-- Download PDF -->
          <button
            id="download-pdf-btn"
            (click)="downloadPdf()"
            [disabled]="!hasPdf()"
            title="Download compiled PDF file"
            class="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded shadow-sm shadow-indigo-900/30 transition flex items-center gap-1.5 active:scale-95"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </button>
        </div>
      </div>

      <!-- PDF Canvas Viewport -->
      <div class="flex-1 w-full h-full relative bg-[#2a2b36] flex items-center justify-center overflow-hidden">
        @if (pdfUrl(); as url) {
          <iframe
            [src]="url"
            title="PDFMake Instant Live Document Preview"
            class="w-full h-full border-0 shadow-2xl bg-white"
          ></iframe>
        } @else {
          <!-- Empty / Initial Placeholder -->
          <div class="flex flex-col items-center justify-center p-8 text-center max-w-sm text-slate-400">
            <div class="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-slate-200 mb-1">Awaiting PDF Generation</h3>
            <p class="text-xs text-slate-400">Write or paste your docDefinition JSON in the editor to immediately generate the PDF document.</p>
          </div>
        }

        <!-- Minor Subtle Loading Spinner Overlay -->
        @if (status().state === 'generating') {
          <div class="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 z-30 pointer-events-none">
            <div class="w-3.5 h-3.5 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin"></div>
            <span>Compiling PDF...</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class PreviewComponent implements OnInit, OnDestroy {
  private pdfService = inject(PdfService);
  private sub = new Subscription();

  public pdfUrl = signal<SafeResourceUrl | null>(null);
  public status = signal<RenderStatus>({ state: 'idle' });
  public hasPdf = signal(false);

  ngOnInit(): void {
    this.sub.add(
      this.pdfService.pdfUrl$.subscribe((url) => {
        this.pdfUrl.set(url);
        this.hasPdf.set(!!url);
      })
    );

    this.sub.add(
      this.pdfService.status$.subscribe((st) => {
        this.status.set(st);
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public runNow(): void {
    this.pdfService.runNow();
  }

  public openInNewTab(): void {
    this.pdfService.openInNewTab();
  }

  public printPdf(): void {
    this.pdfService.printCurrent();
  }

  public downloadPdf(): void {
    this.pdfService.downloadCurrent('pdfmake-document.pdf');
  }

  public formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
