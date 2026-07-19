import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Trash2,
  FileSearch,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  FileStack
} from 'lucide-react';
import { PDFAnalysis, PDFExtractionResult } from '../types/analysis';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFImportCenter() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<PDFExtractionResult | null>(null);
  const [analysis, setAnalysis] = useState<PDFAnalysis | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    findings: true,
    numbers: true,
    risks: true,
    recommendations: true,
    actions: true
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtractionResult(null);
    setAnalysis(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        fullText += strings.join(' ') + '\n';
      }

      if (!fullText.trim()) {
        throw new Error('No readable text found in PDF. OCR might be required for this document.');
      }

      const result = {
        text: fullText,
        pageCount: pdf.numPages,
        filename: file.name
      };
      
      setExtractionResult(result);
      await analyzeWithAI(result);
    } catch (err: any) {
      setError(err.message || 'Failed to process PDF.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const analyzeWithAI = async (result: PDFExtractionResult) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.text, filename: result.filename }),
      });

      if (!response.ok) {
        throw new Error('AI analysis failed.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      setError('Failed to analyze the document with AI. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = () => {
    if (!analysis) return;
    const text = `
PDF Analysis: ${extractionResult?.filename}
Executive Summary: ${analysis.executiveSummary}
Key Findings: ${analysis.keyFindings.join(', ')}
Important Numbers: ${analysis.importantNumbers.join(', ')}
Risks: ${analysis.risks.join(', ')}
Recommendations: ${analysis.recommendations.join(', ')}
Action Items: ${analysis.actionItems.join(', ')}
    `.trim();
    navigator.clipboard.writeText(text);
    alert('Analysis copied to clipboard!');
  };

  const clearAll = () => {
    setExtractionResult(null);
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileSearch className="w-8 h-8 text-blue-600" />
          PDF Import & AI Analysis
        </h1>
        <p className="mt-2 text-gray-600">
          Upload any PDF document to extract text and generate a structured AI analysis.
        </p>
      </div>

      {!extractionResult && !isExtracting && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          `}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input {...getInputProps()} />
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {isDragActive ? 'Drop PDF here' : 'Select or drag a PDF file'}
            </h3>
            <p className="mt-2 text-gray-500">Only PDF files up to 10MB are supported</p>
          </motion.div>
        </div>
      )}

      {(isExtracting || isAnalyzing) && (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">
            {isExtracting ? 'Extracting text from PDF...' : 'Analyzing content with AI...'}
          </h3>
          <p className="mt-2 text-gray-500 text-center max-w-md">
            {isExtracting 
              ? 'We are processing each page of your document to extract all readable text.' 
              : 'Our AI is processing the text to generate summaries, findings, and recommendations.'}
          </p>
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">{error}</p>
            <button 
              onClick={clearAll}
              className="mt-2 text-sm text-red-600 hover:text-red-700 font-semibold"
            >
              Try again
            </button>
          </div>
        </motion.div>
      )}

      {analysis && extractionResult && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{extractionResult.filename}</h3>
                <p className="text-sm text-gray-500">{extractionResult.pageCount} pages processed</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Result
              </button>
              <button 
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="grid grid-cols-1 gap-6">
            <AnalysisSection 
              title="Executive Summary" 
              icon={<FileStack className="w-5 h-5 text-blue-600" />}
              isExpanded={expandedSections.summary}
              onToggle={() => toggleSection('summary')}
            >
              <p className="text-gray-700 leading-relaxed">{analysis.executiveSummary}</p>
            </AnalysisSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisSection 
                title="Key Findings" 
                icon={<TrendingUp className="w-5 h-5 text-green-600" />}
                isExpanded={expandedSections.findings}
                onToggle={() => toggleSection('findings')}
              >
                <ul className="space-y-3">
                  {analysis.keyFindings.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <div className="bg-green-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>

              <AnalysisSection 
                title="Important Numbers" 
                icon={<ArrowRight className="w-5 h-5 text-purple-600" />}
                isExpanded={expandedSections.numbers}
                onToggle={() => toggleSection('numbers')}
              >
                <ul className="space-y-3">
                  {analysis.importantNumbers.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <div className="bg-purple-100 px-2 py-0.5 rounded text-xs font-bold text-purple-700 shrink-0 mt-1">#</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnalysisSection 
                title="Risks Identified" 
                icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
                isExpanded={expandedSections.risks}
                onToggle={() => toggleSection('risks')}
              >
                <ul className="space-y-3">
                  {analysis.risks.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>

              <AnalysisSection 
                title="Recommendations" 
                icon={<Lightbulb className="w-5 h-5 text-sky-600" />}
                isExpanded={expandedSections.recommendations}
                onToggle={() => toggleSection('recommendations')}
              >
                <ul className="space-y-3">
                  {analysis.recommendations.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <Lightbulb className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AnalysisSection>
            </div>

            <AnalysisSection 
              title="Action Items" 
              icon={<CheckSquare className="w-5 h-5 text-emerald-600" />}
              isExpanded={expandedSections.actions}
              onToggle={() => toggleSection('actions')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.actionItems.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-3 text-gray-700 hover:bg-emerald-50 hover:border-emerald-100 transition-colors cursor-default">
                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </AnalysisSection>

            {/* Extracted Text Preview */}
            <AnalysisSection 
              title="Extracted Text Preview" 
              icon={<FileText className="w-5 h-5 text-gray-600" />}
              isExpanded={false}
              onToggle={() => {}}
            >
              <div className="bg-gray-900 text-gray-300 p-6 rounded-xl font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap">
                {extractionResult.text}
              </div>
            </AnalysisSection>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisSection({ 
  title, 
  icon, 
  children, 
  isExpanded: controlledExpanded, 
  onToggle 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const toggle = onToggle || (() => setInternalExpanded(!internalExpanded));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={toggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gray-50 p-2 rounded-lg">
            {icon}
          </div>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
