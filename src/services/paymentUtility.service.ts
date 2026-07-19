import { mockDB } from './mockData';
import { UtilityShare, PaymentProof } from '../types/db';

export const paymentUtilityService = {
  getShares: async (utilityRecordId?: string): Promise<UtilityShare[]> => {
    const list = mockDB.getUtilityShares();
    return utilityRecordId ? list.filter(s => s.utilityRecordId === utilityRecordId) : list;
  },
  getProofs: async (utilityShareId?: string): Promise<PaymentProof[]> => {
    const list = mockDB.getPaymentProofs();
    return utilityShareId ? list.filter(p => p.utilityShareId === utilityShareId) : list;
  },
  addProof: async (data: Omit<PaymentProof, 'id' | 'createdAt'>): Promise<string> => {
    const list = mockDB.getPaymentProofs();
    const newProof: PaymentProof = { 
        ...data, 
        id: `p-${Date.now()}`, 
        createdAt: new Date().toISOString() 
    };
    list.push(newProof);
    mockDB.savePaymentProofs(list);
    return newProof.id;
  },
  verifyProof: async (proofId: string, verifiedBy: string): Promise<void> => {
    let list = mockDB.getPaymentProofs();
    list = list.map(p => p.id === proofId ? {...p, status: 'verified', verifiedBy, verifiedAt: new Date().toISOString()} : p);
    mockDB.savePaymentProofs(list);
  }
};
