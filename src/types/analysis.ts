export interface PDFAnalysis {
  executiveSummary: string;
  keyFindings: string[];
  importantNumbers: string[];
  risks: string[];
  recommendations: string[];
  actionItems: string[];
}

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  filename: string;
}
