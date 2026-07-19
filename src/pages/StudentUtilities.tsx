import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { weeklyBillService, paymentSlipService, notificationService, roomService, dormitoryService } from '../services/app.service';
import { WeeklyBill, PaymentSlip, Room, Dormitory } from '../types/app';
import { Upload, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Droplets, Zap } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Modal } from '../components/Modal';

export function StudentUtilities() {
  const { user } = useAuth();
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<WeeklyBill | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slipFile, setSlipFile] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [billsData, slipsData, roomsData, dormsData] = await Promise.all([
      weeklyBillService.getAll(),
      paymentSlipService.getAll(),
      roomService.getAll(),
      dormitoryService.getAll()
    ]);
    
    // Filter for current student
    const studentBills = billsData.filter(b => b.studentId === user.uid || b.studentId === 'dev-student-id');
    setBills(studentBills);
    setSlips(slipsData);
    setRooms(roomsData);
    setDormitories(dormsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedBill || !slipFile) return;
    setUploading(true);
    
    // Check if slip already exists for this bill
    const existingSlip = slips.find(s => s.billId === selectedBill.id);
    
    if (existingSlip) {
      await paymentSlipService.update(existingSlip.id, {
        fileUrl: slipFile,
        uploadedAt: new Date(),
        verificationStatus: 'pending',
        updatedAt: new Date()
      });
    } else {
      await paymentSlipService.create({
        billId: selectedBill.id,
        fileUrl: slipFile,
        uploadedAt: new Date(),
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }

    await weeklyBillService.update(selectedBill.id, {
      paymentStatus: 'waiting_verification'
    });

    // Notify admin (mock notification to "admin" or just log)
    await notificationService.create({
      userId: 'admin',
      title: "มีการอัปโหลดหลักฐานการชำระเงิน",
      message: `นักศึกษาได้อัปโหลดหลักฐานการชำระเงินสำหรับบิลสัปดาห์ ${selectedBill.billingWeek}`,
      type: "payment",
      isRead: false,
      createdAt: new Date()
    } as any);

    setUploading(false);
    setIsUploadModalOpen(false);
    setSlipFile(null);
    fetchData();
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">บิลค่าน้ำ-ค่าไฟของฉัน</h2>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
          <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-sm font-bold text-zinc-500">ไม่พบข้อมูลใบแจ้งหนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.sort((a, b) => b.billingWeek.localeCompare(a.billingWeek)).map(bill => {
            const slip = slips.find(s => s.billId === bill.id);
            const room = rooms.find(r => r.id === bill.roomId);
            const dormitory = dormitories.find(d => d.id === room?.dormitoryId);

            return (
              <DashboardCard 
                key={bill.id} 
                title={`สัปดาห์ที่ ${bill.billingWeek}`}
                subtitle={`${dormitory?.dormitoryName || ''} - ห้อง ${room?.roomNumber || "N/A"}`}
              >
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold">ค่าน้ำ</span>
                    <span className="font-black text-red-600 flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> {bill.waterCharge.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-bold">ค่าไฟ</span>
                    <span className="font-black text-red-600 flex items-center gap-1">
                      <Zap className="h-3 w-3" /> {bill.electricityCharge.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">ยอดรวม</span>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">
                      {bill.totalAmount.toLocaleString()} ฿
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {bill.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-black uppercase">
                        <CheckCircle2 className="h-3.5 w-3.5" /> ชำระแล้ว
                      </div>
                    ) : bill.paymentStatus === 'waiting_verification' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                        <Clock className="h-3.5 w-3.5" /> รอตรวจสอบ
                      </div>
                    ) : bill.paymentStatus === 'rejected' ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-[10px] font-black uppercase">
                        <AlertTriangle className="h-3.5 w-3.5" /> ถูกปฏิเสธ
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 text-zinc-700 rounded-lg text-[10px] font-black uppercase">
                        <Clock className="h-3.5 w-3.5" /> รอดำเนินการ
                      </div>
                    )}
                  </div>

                  {bill.paymentStatus !== 'paid' && (
                    <button 
                      onClick={() => {
                        setSelectedBill(bill);
                        setIsUploadModalOpen(true);
                        setSlipFile(slip?.fileUrl || null);
                      }}
                      className="w-full mt-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm shadow-red-100"
                    >
                      <Upload className="h-4 w-4" /> 
                      {bill.paymentStatus === 'waiting_verification' || bill.paymentStatus === 'rejected' ? 'แก้ไขหลักฐาน' : 'แจ้งชำระเงิน'}
                    </button>
                  )}
                  
                  {slip?.adminRemark && bill.paymentStatus === 'rejected' && (
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
            <p className="text-xs text-red-700 dark:text-red-400 font-bold">สัปดาห์: {selectedBill?.billingWeek}</p>
            <p className="text-lg font-black text-red-900 dark:text-red-200 mt-2">ยอดรวม: {selectedBill?.totalAmount.toLocaleString()} ฿</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">อัปโหลดหลักฐานการโอนเงิน</label>
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="slip-upload"
              />
              <label 
                htmlFor="slip-upload"
                className="flex flex-col items-center justify-center w-full aspect-[3/4] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50 dark:bg-zinc-900 cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all overflow-hidden"
              >
                {slipFile ? (
                  <img src={slipFile} alt="Preview" className="w-full h-full object-contain" />
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
    </div>
  );
}
