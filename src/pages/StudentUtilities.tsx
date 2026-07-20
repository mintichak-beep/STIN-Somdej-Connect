import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { studentPaymentService, weeklyBillService, paymentSlipService, notificationService, roomService, dormitoryService } from '../services/app.service';
import { StudentPayment, WeeklyBill, PaymentSlip, Room, Dormitory } from '../types/app';
import { Upload, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Droplets, Zap } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Modal } from '../components/Modal';

export function StudentUtilities({ studentId }: { studentId: string }) {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slipFile, setSlipFile] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    setLoading(true);

    let billsLoaded = false;
    let slipsLoaded = false;
    let roomsLoaded = false;
    let dormsLoaded = false;

    const checkLoading = () => {
      if (billsLoaded && slipsLoaded && roomsLoaded && dormsLoaded) {
        setLoading(false);
      }
    };

    const unsubscribePayments = studentPaymentService.onSnapshot([], (data) => {
      const studentPayments = data.filter(p => p.studentId === studentId);
      setPayments(studentPayments);
      billsLoaded = true; // Use as flag
      checkLoading();
    });

    const unsubscribeBills = weeklyBillService.onSnapshot([], (data) => {
      setBills(data);
      checkLoading();
    });

    const unsubscribeSlips = paymentSlipService.onSnapshot([], (data) => {
      setSlips(data);
      slipsLoaded = true;
      checkLoading();
    });

    const unsubscribeRooms = roomService.onSnapshot([], (data) => {
      setRooms(data);
      roomsLoaded = true;
      checkLoading();
    });

    const unsubscribeDorms = dormitoryService.onSnapshot([], (data) => {
      setDormitories(data);
      dormsLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribePayments();
      unsubscribeBills();
      unsubscribeSlips();
      unsubscribeRooms();
      unsubscribeDorms();
    };
  }, [studentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showToast("กรุณาเลือกไฟล์รูปภาพรูปแบบ JPG, PNG หรือ WEBP เท่านั้น", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedPayment || !slipFile) return;
    setUploading(true);
    
    try {
      // Check if slip already exists for this payment record
      // We use the StudentPayment ID as the billId in PaymentSlip for consistency
      const existingSlip = slips.find(s => s.billId === selectedPayment.id);
      
      if (existingSlip) {
        await paymentSlipService.update(existingSlip.id, {
          fileUrl: slipFile,
          uploadedAt: new Date(),
          verificationStatus: 'pending',
          updatedAt: new Date()
        });
      } else {
        await paymentSlipService.create({
          billId: selectedPayment.id,
          fileUrl: slipFile,
          uploadedAt: new Date(),
          verificationStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      await studentPaymentService.update(selectedPayment.id, {
        paymentStatus: 'waiting_verification'
      });

      // Notify admin
      await notificationService.create({
        userId: 'admin',
        title: "มีการอัปโหลดหลักฐานการชำระเงิน",
        message: `นักศึกษาได้อัปโหลดหลักฐานการชำระเงินสำหรับบิลสัปดาห์ ${selectedPayment.billingWeek}`,
        type: "payment",
        isRead: false,
        createdAt: new Date()
      } as any);

      showToast("อัปโหลดหลักฐานการชำระเงินสำเร็จแล้ว");
      setIsUploadModalOpen(false);
      setSlipFile(null);
    } catch (err: any) {
      console.error("Failed to upload slip:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการอัปโหลดหลักฐาน", "error");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">บิลค่าน้ำ-ค่าไฟของฉัน</h2>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
          <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-sm font-bold text-zinc-500">ไม่พบข้อมูลใบแจ้งหนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.sort((a, b) => b.billingWeek.localeCompare(a.billingWeek)).map(payment => {
            const slip = slips.find(s => s.billId === payment.id);
            const room = rooms.find(r => r.id === payment.roomId);
            const dormitory = dormitories.find(d => d.id === room?.dormitoryId);
            const bill = bills.find(b => b.id === payment.billId);

            return (
              <DashboardCard 
                key={payment.id} 
                title={`สัปดาห์ที่ ${payment.billingWeek}`}
                subtitle={`${dormitory?.dormitoryName || ''} - ห้อง ${room?.roomNumber || "N/A"}`}
              >
                <div className="space-y-4 mt-2">
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                      <span>Room Total Details</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-zinc-500">Water Total</span>
                      <span className="font-bold text-slate-700">{bill?.waterCharge.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Elec Total</span>
                      <span className="font-bold text-slate-700">{bill?.electricityCharge.toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">ยอดที่คุณต้องจ่าย</span>
                    <span className="text-xl font-black text-red-600">
                      {payment.individualAmount.toLocaleString()} ฿
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {payment.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase">
                        <CheckCircle2 className="h-3.5 w-3.5" /> ชำระแล้ว
                      </div>
                    ) : payment.paymentStatus === 'waiting_verification' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                        <Clock className="h-3.5 w-3.5" /> รอตรวจสอบ
                      </div>
                    ) : payment.paymentStatus === 'rejected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" /> ถูกปฏิเสธ
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 text-zinc-700 rounded-lg text-[10px] font-black uppercase">
                        <Clock className="h-3.5 w-3.5" /> รอดำเนินการ
                      </div>
                    )}
                  </div>

                  {payment.paymentStatus !== 'paid' && (
                    <button 
                      onClick={() => {
                        setSelectedPayment(payment);
                        setIsUploadModalOpen(true);
                        setSlipFile(slip?.fileUrl || null);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm shadow-red-100"
                    >
                      <Upload className="h-4 w-4" /> 
                      {payment.paymentStatus === 'waiting_verification' || payment.paymentStatus === 'rejected' ? 'แก้ไขหลักฐาน' : 'แจ้งชำระเงิน'}
                    </button>
                  )}
                  
                  {slip?.adminRemark && payment.paymentStatus === 'rejected' && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg text-[10px] text-red-700 font-bold border border-red-100">
                      เหตุผล: {slip.adminRemark}
                    </div>
                  )}
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="แจ้งชำระเงิน"
      >
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <h4 className="text-sm font-black text-red-800 dark:text-red-300 mb-1">ข้อมูลการชำระเงิน</h4>
            <p className="text-xs text-red-700 dark:text-red-400 font-bold">สัปดาห์: {selectedPayment?.billingWeek}</p>
            <p className="text-lg font-black text-red-900 dark:text-red-200 mt-2">ยอดของคุณ: {selectedPayment?.individualAmount.toLocaleString()} ฿</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">อัปโหลดหลักฐานการโอนเงิน</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="slip-upload"
              />
              <label 
                htmlFor="slip-upload"
                className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50 dark:bg-zinc-900 cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all overflow-hidden"
              >
                {slipFile ? (
                  <img src={slipFile} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-full shadow-sm">
                      <Upload className="h-6 w-6 text-zinc-400" />
                    </div>
                    <span className="text-xs font-black text-zinc-400">เลือกไฟล์รูปภาพ</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!slipFile || uploading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-100 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {uploading ? 'กำลังบันทึก...' : 'ส่งหลักฐานการชำระเงิน'}
          </button>
        </div>
      </Modal>

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === 'error' 
            ? 'bg-red-50 text-red-800 border-red-100 dark:bg-red-950/20 dark:text-red-200 dark:border-red-900/30' 
            : 'bg-green-50 text-green-800 border-green-100 dark:bg-green-950/20 dark:text-green-200 dark:border-green-900/30'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
