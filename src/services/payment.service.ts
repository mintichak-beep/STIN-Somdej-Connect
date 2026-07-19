import { Bill, Payment } from '../types/db';
import { FirestoreService } from './firestore.service';
import { orderBy, where, QueryConstraint } from 'firebase/firestore';

const billFS = new FirestoreService<Bill>('weeklyBills');
const paymentFS = new FirestoreService<Payment>('paymentSlips');

export const paymentService = {
  subscribeBills: (callback: (bills: Bill[]) => void) => {
    return billFS.onSnapshot([orderBy('dueDate', 'desc')], callback);
  },

  subscribePayments: (callback: (payments: Payment[]) => void) => {
    return paymentFS.onSnapshot([orderBy('uploadTime', 'desc')], callback);
  },

  getBills: async (): Promise<Bill[]> => {
    return billFS.getAll([orderBy('dueDate', 'desc')]);
  },

  getPayments: async (): Promise<Payment[]> => {
    return paymentFS.getAll([orderBy('uploadTime', 'desc')]);
  },

  getBillsByRoom: async (roomId: string): Promise<Bill[]> => {
    return billFS.getAll([where('roomId', '==', roomId), orderBy('dueDate', 'desc')]);
  },

  createBill: async (
    data: Omit<Bill, 'billId'>
  ): Promise<string> => {
    const billId = await billFS.create(data as any);
    return billId;
  },

  submitPayment: async (data: {
    billId: string;
    roomId: string;
    tenantId: string;
    amount: number;
    slipUrl: string;
    transferDate: string;
  }): Promise<string> => {
    // Check if there is already a Pending payment for this bill
    const payments = await paymentFS.getAll([
      where('billId', '==', data.billId),
      where('status', '==', 'Pending')
    ]);
    
    if (payments.length > 0) {
      throw new Error('มีรายการชำระเงินที่อยู่ระหว่างรอการตรวจสอบแล้ว');
    }

    const paymentData: Omit<Payment, 'paymentId'> = {
      billId: data.billId,
      roomId: data.roomId,
      tenantId: data.tenantId,
      amount: data.amount,
      slipUrl: data.slipUrl,
      uploadTime: new Date().toISOString(),
      transferDate: data.transferDate,
      status: 'Pending'
    };

    const paymentId = await paymentFS.create(paymentData as any);

    // Update corresponding Bill status to 'Pending'
    await billFS.update(data.billId, { status: 'Pending' } as any);

    return paymentId;
  },

  approvePayment: async (paymentId: string, approvedBy: string): Promise<void> => {
    const payment = await paymentFS.getById(paymentId);
    if (!payment) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    await paymentFS.update(paymentId, {
      status: 'Approved',
      approvedBy,
      approvedAt: new Date().toISOString()
    } as any);

    await billFS.update(payment.billId, { status: 'Paid' } as any);
  },

  rejectPayment: async (paymentId: string, remark: string): Promise<void> => {
    const payment = await paymentFS.getById(paymentId);
    if (!payment) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    await paymentFS.update(paymentId, {
      status: 'Rejected',
      remark
    } as any);

    await billFS.update(payment.billId, { status: 'Rejected' } as any);
  },

  updateBill: async (
    billId: string, 
    data: Partial<Bill>
  ): Promise<void> => {
    await billFS.update(billId, data);
  },

  deleteBill: async (
    billId: string
  ): Promise<void> => {
    await billFS.delete(billId);
    
    // Also remove related payments
    const payments = await paymentFS.getAll([where('billId', '==', billId)]);
    for (const p of payments) {
      if (p.id) await paymentFS.delete(p.id);
    }
  },

  deletePayment: async (
    paymentId: string
  ): Promise<void> => {
    const payment = await paymentFS.getById(paymentId);
    if (!payment) {
      throw new Error('ไม่พบข้อมูลรายการชำระเงิน');
    }
    
    await paymentFS.delete(paymentId);

    // Revert corresponding Bill status to 'Unpaid'
    await billFS.update(payment.billId, { status: 'Unpaid' } as any);
  }
};
