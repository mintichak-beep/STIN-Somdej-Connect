import { UtilityShare, PaymentProof } from '../types/db';

export const paymentUtilityService = {
  getShares: async (utilityRecordId?: string): Promise<UtilityShare[]> => {
    const list = [];
    return utilityRecordId ? list.filter(s => s.utilityRecordId === utilityRecordId) : list;
  },
  getProofs: async (utilityShareId?: string): Promise<PaymentProof[]> => {
    const list = [];
    return utilityShareId ? list.filter(p => p.utilityShareId === utilityShareId) : list;
  },
  addProof: async (data: Omit<PaymentProof, 'id' | 'createdAt'>): Promise<string> => {
    const list = [];
    const newProof: PaymentProof = { 
        ...data, 
        id: `p-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newProof);
    void 0;
    return newProof.id;
  },
  verifyProof: async (proofId: string, verifiedBy: string): Promise<void> => {
    let list = [];
    list = list.map(p => p.id === proofId ? {...p, status: 'verified', verifiedBy, verifiedAt: new Date().toISOString()} : p);
    void 0;
  }
};
