export interface PdfTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Finance' | 'Legal' | 'Creative' | 'General';
  icon: string;
  code: string;
}

export interface RenderStatus {
  state: 'idle' | 'generating' | 'success' | 'error';
  errorMessage?: string;
  errorLine?: number;
  renderTimeMs?: number;
  fileSizeBytes?: number;
  pageCount?: number;
}

export interface Snippet {
  name: string;
  category: string;
  description: string;
  snippet: string;
}
