import React, { useState, useEffect } from 'react';
import { documentService } from '../services/document.service';
import { Document } from '../types/db';
import { FileText, Plus, Download } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function DocumentManagement() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        const data = await documentService.getAll();
        setDocs(data);
        setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Document Management</h2>
        <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          <Plus className="h-4 w-4" /> Create Document
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {docs.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl border">
                <div className="flex justify-between items-start mb-2">
                    <FileText className="text-red-500" />
                    <span className="text-xs font-bold text-gray-500">{doc.category}</span>
                </div>
                <h4 className="font-bold">{doc.title}</h4>
                <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                <button className="flex items-center gap-2 text-sm text-red-600">
                    <Download className="h-4 w-4" /> Download
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
