import { Document, DocumentSubmission } from '../types/db';

export const documentService = {
  getAll: async (): Promise<Document[]> => [],
  create: async (data: Omit<Document, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newDoc: Document = { 
        ...data, 
        id: `d-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newDoc);
    void 0;
    return newDoc.id;
  },
  getSubmissions: async (documentId?: string): Promise<DocumentSubmission[]> => {
    const list = [];
    return documentId ? list.filter(s => s.documentId === documentId) : list;
  },
  submit: async (data: Omit<DocumentSubmission, 'id' | 'submittedAt'>): Promise<string> => {
    const list = [];
    const newSub: DocumentSubmission = { 
        ...data, 
        id: `sub-${Date.now()}`, 
        submittedAt: new Date().toISOString() 
    };
    list.push(newSub);
    void 0;
    return newSub.id;
  }
};
