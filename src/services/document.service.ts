import { mockDB } from './mockData';
import { Document, DocumentSubmission } from '../types/db';

export const documentService = {
  getAll: async (): Promise<Document[]> => mockDB.getDocuments(),
  create: async (data: Omit<Document, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getDocuments();
    const newDoc: Document = { 
        ...data, 
        id: `d-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newDoc);
    mockDB.saveDocuments(list);
    return newDoc.id;
  },
  getSubmissions: async (documentId?: string): Promise<DocumentSubmission[]> => {
    const list = mockDB.getDocumentSubmissions();
    return documentId ? list.filter(s => s.documentId === documentId) : list;
  },
  submit: async (data: Omit<DocumentSubmission, 'id' | 'submittedAt'>): Promise<string> => {
    const list = mockDB.getDocumentSubmissions();
    const newSub: DocumentSubmission = { 
        ...data, 
        id: `sub-${Date.now()}`, 
        submittedAt: new Date().toISOString() 
    };
    list.push(newSub);
    mockDB.saveDocumentSubmissions(list);
    return newSub.id;
  }
};
