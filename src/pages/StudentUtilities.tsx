import React, { useState, useEffect } from 'react';
import { DashboardCard } from '../components/DashboardCard';
import { studentPaymentService, weeklyBillService, paymentSlipService, notificationService, roomService, dormitoryService, bankAccountService, studentService } from '../services/app.service';
import { StudentPayment, WeeklyBill, PaymentSlip, Room, Dormitory, BankAccountConfig, Student } from '../types/app';
import { Upload, CheckCircle2, XCircle, Clock, AlertTriangle, FileText, Droplets, Zap, Printer, Download, QrCode, CreditCard, Building } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import { AssetImage } from '../components/AssetImage';

export function StudentUtilities({ studentId }: { studentId: string }) {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccountConfig | null>(null);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<{ payment: StudentPayment; bill: WeeklyBill; room: Room; dormitory: Dormitory; slip?: PaymentSlip } | null>(null);
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
    let bankLoaded = false;

    const checkLoading = () => {
      if (billsLoaded && slipsLoaded && roomsLoaded && dormsLoaded && bankLoaded) {
        setLoading(false);
      }
    };

    studentService.getAll().then(students => {
      const s = students.find(st => st.id === studentId || st.studentId === studentId);
      if (s) setStudentInfo(s);
    }).catch(console.error);

    const unsubscribePayments = studentPaymentService.onSnapshot([], (data) => {
      const studentPayments = data.filter(p => p.studentId === studentId);
      setPayments(studentPayments);
      billsLoaded = true;
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

    const unsubscribeBank = bankAccountService.onSnapshot([], (data) => {
      if (data.length > 0) {
        setBankAccount(data[0]);
      }
      bankLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribePayments();
      unsubscribeBills();
      unsubscribeSlips();
      unsubscribeRooms();
      unsubscribeDorms();
      unsubscribeBank();
    };
  }, [studentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        showToast("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP) หรือ PDF เท่านั้น", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (file.type === "application/pdf") {
          setSlipFile(result);
        } else {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const MAX_SIZE = 800;
            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            setSlipFile(canvas.toDataURL("image/jpeg", 0.6));
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedPayment || !slipFile) {
      showToast("กรุณาอัปโหลดหลักฐานการโอนเงินก่อนส่ง", "error");
      return;
    }
    setUploading(true);
    
    try {
      const existingSlip = slips.find(s => s.billId === selectedPayment.id);
      const now = new Date();
      const uploadDate = format(now, 'yyyy-MM-dd');
      const uploadTime = format(now, 'HH:mm:ss');
      
      const slipData = {
        billId: selectedPayment.id,
        studentId: studentId,
        studentName: studentInfo?.fullName || studentId,
        studentCode: studentInfo?.studentId || studentId,
        invoiceNumber: selectedPayment.invoiceNumber,
        fileUrl: slipFile,
        uploadedAt: now,
        uploadDate,
        uploadTime,
        verificationStatus: 'pending' as const,
        updatedAt: now
      };

      if (existingSlip) {
        await paymentSlipService.update(existingSlip.id, slipData);
      } else {
        await paymentSlipService.create({
          ...slipData,
          createdAt: now
        } as any);
      }

      await studentPaymentService.update(selectedPayment.id, {
        paymentStatus: 'payment_slip_uploaded'
      });

      await notificationService.create({
        userId: 'admin',
        title: "มีการอัปโหลดหลักฐานการชำระเงิน",
        message: `นักศึกษา ${studentInfo?.fullName || studentId} ได้อัปโหลดสลิปสำหรับบิล ${selectedPayment.invoiceNumber} (เวลา: ${uploadDate} ${uploadTime})`,
        type: "payment",
        isRead: false,
        createdAt: now
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
        <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-50">ใบแจ้งหนี้ค่าน้ำ-ค่าไฟและค่าห้องพัก</h2>
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

            const roomFeeItem = payment.roomFee !== undefined ? payment.roomFee : ((bill?.roomFee || 0) / (bill?.occupantsCount || 1));
            const waterItem = payment.waterCharge !== undefined ? payment.waterCharge : ((bill?.waterCharge || 0) / (bill?.occupantsCount || 1));
            const elecItem = payment.electricityCharge !== undefined ? payment.electricityCharge : ((bill?.electricityCharge || 0) / (bill?.occupantsCount || 1));
            const otherItem = payment.otherCharges !== undefined ? payment.otherCharges : ((bill?.otherCharges || 0) / (bill?.occupantsCount || 1));

            return (
              <DashboardCard 
                key={payment.id} 
                title={`สัปดาห์ที่ ${payment.billingWeek}`}
                subtitle={`${dormitory?.dormitoryName || ''} - ห้อง ${room?.roomNumber || "N/A"}`}
              >
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Invoice: {payment.invoiceNumber || bill?.invoiceNumber || "INV-NEW"}</span>
                    <button 
                      onClick={() => {
                        setSelectedInvoice({ payment, bill: bill!, room: room!, dormitory: dormitory!, slip });
                        setIsInvoiceModalOpen(true);
                      }}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" /> ดูใบแจ้งหนี้
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">ค่าห้องพัก (Room Fee)</span>
                      <span className="font-bold text-slate-700">{roomFeeItem.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">ค่าน้ำ (Water Charge)</span>
                      <span className="font-bold text-slate-700">{waterItem.toLocaleString()} ฿</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">ค่าไฟ (Electricity)</span>
                      <span className="font-bold text-slate-700">{elecItem.toLocaleString()} ฿</span>
                    </div>
                    {otherItem > 0 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">ค่าใช้จ่ายอื่นๆ (Other)</span>
                        <span className="font-bold text-slate-700">{otherItem.toLocaleString()} ฿</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">ยอดที่คุณต้องจ่าย</span>
                    <span className="text-xl font-black text-red-600">
                      {payment.individualAmount.toLocaleString()} ฿
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
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
                      {payment.paymentStatus === 'waiting_verification' || payment.paymentStatus === 'rejected' ? 'แก้ไขหลักฐานการโอน' : 'แจ้งชำระเงิน / แนบสลิป'}
                    </button>
                  )}
                  
                  {slip?.adminRemark && payment.paymentStatus === 'rejected' && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg text-[10px] text-red-700 font-bold border border-red-100">
                      เหตุผลจากผู้ดูแล: {slip.adminRemark}
                    </div>
                  )}
                </div>
              </DashboardCard>
            );
          })}
        </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="ใบแจ้งหนี้ / Invoice"
      >
        {selectedInvoice && (
          <div className="space-y-6 print:p-6" id="printable-invoice">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">ใบแจ้งหนี้ค่าใช้จ่ายหอพักนักศึกษา</h3>
                <p className="text-xs font-bold text-slate-500">Invoice No: {selectedInvoice.payment.invoiceNumber || selectedInvoice.bill.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-600">วันที่ออก: {format(new Date(), "dd/MM/yyyy", { locale: th })}</p>
                <p className="text-xs font-bold text-red-600">กำหนดชำระ: {selectedInvoice.bill.dueDate ? format(new Date(selectedInvoice.bill.dueDate.seconds ? selectedInvoice.bill.dueDate.seconds * 1000 : selectedInvoice.bill.dueDate), "dd/MM/yyyy") : "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <p className="text-slate-400 font-bold uppercase">ข้อมูลหอพัก</p>
                <p className="font-bold text-slate-900 mt-1">{selectedInvoice.dormitory?.dormitoryName} - ห้อง {selectedInvoice.room?.roomNumber}</p>
                <p className="text-slate-500">อาคาร: {selectedInvoice.room?.building} ชั้น {selectedInvoice.room?.floor}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase">รอบการเรียกเก็บ</p>
                <p className="font-bold text-slate-900 mt-1">สัปดาห์ที่ {selectedInvoice.payment.billingWeek}</p>
                <p className="text-slate-500">จำนวนผู้พัก: {selectedInvoice.bill.occupantsCount} คน</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-400">รายการค่าใช้จ่าย (หารเฉลี่ยต่อคน)</h4>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500">
                    <tr>
                      <th className="p-3">รายการ</th>
                      <th className="p-3 text-right">ยอดรวมห้อง</th>
                      <th className="p-3 text-right">ยอดของคุณ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-medium">ค่าห้องพัก (Room Fee)</td>
                      <td className="p-3 text-right font-bold">{selectedInvoice.bill.roomFee?.toLocaleString() || 0} ฿</td>
                      <td className="p-3 text-right font-bold text-primary">{((selectedInvoice.bill.roomFee || 0) / (selectedInvoice.bill.occupantsCount || 1)).toLocaleString()} ฿</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">ค่าน้ำ (Water Charge)</td>
                      <td className="p-3 text-right font-bold">{selectedInvoice.bill.waterCharge?.toLocaleString() || 0} ฿</td>
                      <td className="p-3 text-right font-bold text-primary">{((selectedInvoice.bill.waterCharge || 0) / (selectedInvoice.bill.occupantsCount || 1)).toLocaleString()} ฿</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">ค่าไฟฟ้า (Electricity Charge) - {selectedInvoice.bill.electricityUsage || 0} หน่วย</td>
                      <td className="p-3 text-right font-bold">{selectedInvoice.bill.electricityCharge?.toLocaleString() || 0} ฿</td>
                      <td className="p-3 text-right font-bold text-primary">{((selectedInvoice.bill.electricityCharge || 0) / (selectedInvoice.bill.occupantsCount || 1)).toLocaleString()} ฿</td>
                    </tr>
                    {(selectedInvoice.bill.otherCharges || 0) > 0 && (
                      <tr>
                        <td className="p-3 font-medium">ค่าบริการอื่นๆ (Other Charges)</td>
                        <td className="p-3 text-right font-bold">{selectedInvoice.bill.otherCharges?.toLocaleString()} ฿</td>
                        <td className="p-3 text-right font-bold text-primary">{((selectedInvoice.bill.otherCharges || 0) / (selectedInvoice.bill.occupantsCount || 1)).toLocaleString()} ฿</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 font-black">
                    <tr>
                      <td className="p-3">ยอดรวมทั้งสิ้น</td>
                      <td className="p-3 text-right">{selectedInvoice.bill.totalAmount?.toLocaleString()} ฿</td>
                      <td className="p-3 text-right text-red-600 text-sm">{selectedInvoice.payment.individualAmount?.toLocaleString()} ฿</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Printer className="h-4 w-4" /> พิมพ์ / บันทึก PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment & Bank Transfer Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="แจ้งชำระเงินและข้อมูลโอนเงิน"
      >
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <h4 className="text-sm font-black text-red-800 dark:text-red-300 mb-1">ยอดชำระของคุณ</h4>
            <p className="text-xs text-red-700 dark:text-red-400 font-bold">สัปดาห์: {selectedPayment?.billingWeek}</p>
            <p className="text-xl font-black text-red-900 dark:text-red-200 mt-2">฿{selectedPayment?.individualAmount.toLocaleString()}</p>
          </div>

          {/* Bank Account Information */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Building className="h-4 w-4 text-primary" />
              <span>ข้อมูลบัญชีธนาคารสำหรับโอนเงิน</span>
            </div>
            {bankAccount ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1 text-xs">
                  <p className="text-slate-500">ธนาคาร: <strong className="text-slate-800">{bankAccount.bankName}</strong></p>
                  <p className="text-slate-500">ชื่อบัญชี: <strong className="text-slate-800">{bankAccount.accountName}</strong></p>
                  <p className="text-slate-500">เลขที่บัญชี: <strong className="text-slate-800 text-sm font-mono">{bankAccount.accountNumber}</strong></p>
                </div>
                {bankAccount.qrCodeUrl && (
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl border shadow-sm flex items-center justify-center">
                      <AssetImage src={bankAccount.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" fallbackType="slip" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">ยังไม่ได้ตั้งค่าบัญชีธนาคาร (โปรดติดต่อผู้ดูแลระบบ)</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">อัปโหลดหลักฐานการโอนเงิน (สลิป)</label>
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
                className="flex flex-col items-center justify-center w-full aspect-[4/3] border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-slate-50 dark:bg-zinc-900 cursor-pointer hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all overflow-hidden"
              >
                {slipFile ? (
                  <AssetImage src={slipFile} alt="Preview" className="w-full h-full object-contain" fallbackType="slip" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-full shadow-sm">
                      <Upload className="h-6 w-6 text-zinc-400" />
                    </div>
                    <span className="text-xs font-black text-zinc-400">คลิกเพื่ออัปโหลดหรือเลือกรูปภาพสลิป</span>
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
            {uploading ? 'กำลังบันทึก...' : 'ยืนยันการส่งหลักฐานการชำระเงิน'}
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
