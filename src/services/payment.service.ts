import { Bill, Payment } from '../types/db';

export const paymentService = {
  subscribeBills: (callback: (bills: Bill[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_bills') {
        callback([]);
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback([]);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  subscribePayments: (callback: (payments: Payment[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_payments') {
        callback([]);
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback([]);
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getBills: async (): Promise<Bill[]> => {
    return [];
  },

  getPayments: async (): Promise<Payment[]> => {
    return [];
  },

  getBillsByRoom: async (roomId: string): Promise<Bill[]> => {
    const bills = [];
    return bills.filter(b => b.roomId === roomId);
  },

  createBill: async (
    data: Omit<Bill, 'billId'>, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<string> => {
    const list = [];
    const newBill: Bill = {
      ...data,
      billId: `bill-${Date.now()}`
    };
    list.push(newBill);
    void 0;

    void 0;

    return newBill.billId;
  },

  submitPayment: async (data: {
    billId: string;
    roomId: string;
    tenantId: string;
    amount: number;
    slipUrl: string;
    transferDate: string;
  }): Promise<string> => {
    const payments = [];
    const bills = [];

    // Check if there is already a Pending payment for this bill to prevent duplicates
    const existingPending = payments.find(p => p.billId === data.billId && p.status === 'Pending');
    if (existingPending) {
      throw new Error('มีรายการชำระเงินที่อยู่ระหว่างรอการตรวจสอบแล้ว');
    }

    const newPayment: Payment = {
      paymentId: `pay-${Date.now()}`,
      billId: data.billId,
      roomId: data.roomId,
      tenantId: data.tenantId,
      amount: data.amount,
      slipUrl: data.slipUrl,
      uploadTime: new Date().toISOString(),
      transferDate: data.transferDate,
      status: 'Pending'
    };

    payments.push(newPayment);
    void 0;

    // Update corresponding Bill status to 'Pending'
    const billIndex = bills.findIndex(b => b.billId === data.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Pending';
      void 0;
    }

    void 0;

    return newPayment.paymentId;
  },

  approvePayment: async (paymentId: string, approvedBy: string): Promise<void> => {
    const payments = [];
    const bills = [];

    const paymentIndex = payments.findIndex(p => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    const payment = payments[paymentIndex];
    payment.status = 'Approved';
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date().toISOString();
    void 0;

    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Paid';
      void 0;
    }

    void 0;
  },

  rejectPayment: async (paymentId: string, remark: string, rejectedBy: string): Promise<void> => {
    const payments = [];
    const bills = [];

    const paymentIndex = payments.findIndex(p => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    const payment = payments[paymentIndex];
    payment.status = 'Rejected';
    payment.remark = remark;
    void 0;

    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Rejected'; // 'Rejected' / 'ปฏิเสธ' so student can see it has been rejected
      void 0;
    }

    void 0;
  },

  updateBill: async (
    billId: string, 
    data: Partial<Bill>, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const list = [];
    const index = list.findIndex(b => b.billId === billId);
    if (index === -1) throw new Error('ไม่พบข้อมูลบิล');
    
    const updatedBill = { ...list[index], ...data };
    list[index] = updatedBill;
    void 0;

    void 0;
  },

  deleteBill: async (
    billId: string, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const list = [];
    const bill = list.find(b => b.billId === billId);
    if (!bill) throw new Error('ไม่พบข้อมูลบิล');

    const newList = list.filter(b => b.billId !== billId);
    void 0;

    // Also remove related payments
    const payments = [];
    const newPayments = payments.filter(p => p.billId !== billId);
    void 0;

    void 0;
  },

  deletePayment: async (
    paymentId: string, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const payments = [];
    const payment = payments.find(p => p.paymentId === paymentId);
    if (!payment) throw new Error('ไม่พบข้อมูลรายการชำระเงิน');
    
    const newPayments = payments.filter(p => p.paymentId !== paymentId);
    void 0;

    // Revert corresponding Bill status to 'Unpaid'
    const bills = [];
    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Unpaid';
      void 0;
    }

    void 0;
  }
};
