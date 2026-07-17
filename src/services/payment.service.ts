import { mockDB } from './mockData';
import { Bill, Payment } from '../types/db';

export const paymentService = {
  subscribeBills: (callback: (bills: Bill[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_bills') {
        callback(mockDB.getBills());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback(mockDB.getBills());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  subscribePayments: (callback: (payments: Payment[]) => void) => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'cpatms_payments') {
        callback(mockDB.getPayments());
      }
    };
    window.addEventListener('cpatms_db_update', handleUpdate);
    // Initial call
    callback(mockDB.getPayments());
    return () => window.removeEventListener('cpatms_db_update', handleUpdate);
  },

  getBills: async (): Promise<Bill[]> => {
    return mockDB.getBills();
  },

  getPayments: async (): Promise<Payment[]> => {
    return mockDB.getPayments();
  },

  getBillsByRoom: async (roomId: string): Promise<Bill[]> => {
    const bills = mockDB.getBills();
    return bills.filter(b => b.roomId === roomId);
  },

  createBill: async (
    data: Omit<Bill, 'billId'>, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<string> => {
    const list = mockDB.getBills();
    const newBill: Bill = {
      ...data,
      billId: `bill-${Date.now()}`
    };
    list.push(newBill);
    mockDB.saveBills(list);

    mockDB.addActivity({
      type: 'room_assign', // Standard type from RecentActivity
      title: 'สร้างบิลค่าบริการใหม่',
      description: `สร้างบิลค่าบริการห้อง ${newBill.roomId} ประจำเดือน ${newBill.month} ${newBill.year} เป็นยอดเงินรวม ฿${newBill.totalAmount}`,
      userId: adminId,
      userDisplayName: adminName
    });

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
    const payments = mockDB.getPayments();
    const bills = mockDB.getBills();

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
    mockDB.savePayments(payments);

    // Update corresponding Bill status to 'Pending'
    const billIndex = bills.findIndex(b => b.billId === data.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Pending';
      mockDB.saveBills(bills);
    }

    mockDB.addActivity({
      type: 'room_assign', // or custom, but let's stick to existing RecentActivity types
      title: 'แจ้งชำระค่าน้ำ/ค่าไฟ',
      description: `ผู้เช่าห้อง ${data.roomId} ได้อัปโหลดสลิปชำระเงินจำนวน ฿${data.amount}`,
      userId: data.tenantId,
      userDisplayName: `Student ${data.tenantId}`
    });

    return newPayment.paymentId;
  },

  approvePayment: async (paymentId: string, approvedBy: string): Promise<void> => {
    const payments = mockDB.getPayments();
    const bills = mockDB.getBills();

    const paymentIndex = payments.findIndex(p => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    const payment = payments[paymentIndex];
    payment.status = 'Approved';
    payment.approvedBy = approvedBy;
    payment.approvedAt = new Date().toISOString();
    mockDB.savePayments(payments);

    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Paid';
      mockDB.saveBills(bills);
    }

    mockDB.addActivity({
      type: 'room_assign',
      title: 'อนุมัติการชำระเงิน',
      description: `อนุมัติการชำระค่าน้ำ/ค่าไฟห้อง ${payment.roomId} เรียบร้อยแล้ว`,
      userId: approvedBy,
      userDisplayName: 'ผู้ดูแลระบบ'
    });
  },

  rejectPayment: async (paymentId: string, remark: string, rejectedBy: string): Promise<void> => {
    const payments = mockDB.getPayments();
    const bills = mockDB.getBills();

    const paymentIndex = payments.findIndex(p => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      throw new Error('ไม่พบข้อมูลการชำระเงิน');
    }

    const payment = payments[paymentIndex];
    payment.status = 'Rejected';
    payment.remark = remark;
    mockDB.savePayments(payments);

    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Rejected'; // 'Rejected' / 'ปฏิเสธ' so student can see it has been rejected
      mockDB.saveBills(bills);
    }

    mockDB.addActivity({
      type: 'room_assign',
      title: 'ปฏิเสธการชำระเงิน',
      description: `ปฏิเสธการชำระเงินห้อง ${payment.roomId} เนื่องจาก: ${remark}`,
      userId: rejectedBy,
      userDisplayName: 'ผู้ดูแลระบบ'
    });
  },

  updateBill: async (
    billId: string, 
    data: Partial<Bill>, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const list = mockDB.getBills();
    const index = list.findIndex(b => b.billId === billId);
    if (index === -1) throw new Error('ไม่พบข้อมูลบิล');
    
    const updatedBill = { ...list[index], ...data };
    list[index] = updatedBill;
    mockDB.saveBills(list);

    mockDB.addActivity({
      type: 'edited_bill',
      title: 'แก้ไขบิลค่าบริการ',
      description: `แก้ไขบิลของห้อง ${updatedBill.roomId} ประจำเดือน ${updatedBill.month} ${updatedBill.year} เป็นยอด ฿${updatedBill.totalAmount}`,
      userId: adminId,
      userDisplayName: adminName
    });
  },

  deleteBill: async (
    billId: string, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const list = mockDB.getBills();
    const bill = list.find(b => b.billId === billId);
    if (!bill) throw new Error('ไม่พบข้อมูลบิล');

    const newList = list.filter(b => b.billId !== billId);
    mockDB.saveBills(newList);

    // Also remove related payments
    const payments = mockDB.getPayments();
    const newPayments = payments.filter(p => p.billId !== billId);
    mockDB.savePayments(newPayments);

    mockDB.addActivity({
      type: 'deleted_bill',
      title: 'ลบบิลเรียกเก็บเงิน',
      description: `ลบบิลเรียกเก็บเงินของห้อง ${bill.roomId} รอบเดือน ${bill.month} ${bill.year}`,
      userId: adminId,
      userDisplayName: adminName
    });
  },

  deletePayment: async (
    paymentId: string, 
    adminName: string = 'ผู้ดูแลระบบ', 
    adminId: string = 'admin-123'
  ): Promise<void> => {
    const payments = mockDB.getPayments();
    const payment = payments.find(p => p.paymentId === paymentId);
    if (!payment) throw new Error('ไม่พบข้อมูลรายการชำระเงิน');
    
    const newPayments = payments.filter(p => p.paymentId !== paymentId);
    mockDB.savePayments(newPayments);

    // Revert corresponding Bill status to 'Unpaid'
    const bills = mockDB.getBills();
    const billIndex = bills.findIndex(b => b.billId === payment.billId);
    if (billIndex !== -1) {
      bills[billIndex].status = 'Unpaid';
      mockDB.saveBills(bills);
    }

    mockDB.addActivity({
      type: 'deleted_payment',
      title: 'ลบรายการชำระเงิน',
      description: `ลบหลักฐานการโอนของห้อง ${payment.roomId} ยอดเงิน ฿${payment.amount}`,
      userId: adminId,
      userDisplayName: adminName
    });
  }
};
