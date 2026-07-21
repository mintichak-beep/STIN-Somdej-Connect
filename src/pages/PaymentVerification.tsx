import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { studentPaymentService, weeklyBillService, roomService, studentService, paymentSlipService, notificationService, dormitoryService } from "../services/app.service";
import { StudentPayment, WeeklyBill, Room, Student, PaymentSlip, Dormitory } from "../types/app";
import { CheckCircle, XCircle, Eye, AlertCircle, Search, Clock, MapPin, User, CreditCard } from "lucide-react";
import { StatusChip } from "../components/StatusChip";
import { motion, AnimatePresence } from "motion/react";
import { AssetImage } from "../components/AssetImage";

export function PaymentVerification() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [slips, setSlips] = useState<PaymentSlip[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [remark, setRemark] = useState("");
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
    let roomsLoaded = false;
    let studentsLoaded = false;
    let dormsLoaded = false;
    let slipsLoaded = false;

    const checkLoading = () => {
      if (billsLoaded && roomsLoaded && studentsLoaded && dormsLoaded && slipsLoaded) {
        setLoading(false);
      }
    };

    const unsubscribePayments = studentPaymentService.onSnapshot([], (data) => {
      setPayments(data);
      billsLoaded = true; // Use this as one of the loaded flags
      checkLoading();
    });

    const unsubscribeBills = weeklyBillService.onSnapshot([], (data) => {
      setBills(data);
      checkLoading();
    });

    const unsubscribeRooms = roomService.onSnapshot([], (data) => {
      setRooms(data);
      roomsLoaded = true;
      checkLoading();
    });

    const unsubscribeStudents = studentService.onSnapshot([], (data) => {
      setStudents(data);
      studentsLoaded = true;
      checkLoading();
    });

    const unsubscribeDorms = dormitoryService.onSnapshot([], (data) => {
      setDormitories(data);
      dormsLoaded = true;
      checkLoading();
    });

    const unsubscribeSlips = paymentSlipService.onSnapshot([], (data) => {
      setSlips(data);
      slipsLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribePayments();
      unsubscribeBills();
      unsubscribeRooms();
      unsubscribeStudents();
      unsubscribeDorms();
      unsubscribeSlips();
    };
  }, []);

  const handleOpenSlip = (payment: StudentPayment) => {
    setSelectedPayment(payment);
    const paymentSlip = slips.find(s => s.billId === payment.id);
    if (paymentSlip) {
      setSelectedSlip(paymentSlip);
      setRemark(paymentSlip.adminRemark || "");
      setIsSlipModalOpen(true);
    } else {
      showToast("ไม่พบไฟล์สลิปหลักฐานการชำระเงิน", "error");
    }
  };

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (!selectedSlip || !selectedPayment) return;

    try {
      setIsSaving(true);
      await paymentSlipService.update(selectedSlip.id, {
        verificationStatus: status,
        verifiedAt: new Date(),
        adminRemark: remark
      });

      await studentPaymentService.update(selectedPayment.id, {
        paymentStatus: status === 'approved' ? 'paid' : 'rejected'
      });

      try {
        await notificationService.create({
          userId: selectedPayment.studentId,
          title: status === 'approved' ? "ชำระเงินสำเร็จ" : "การชำระเงินถูกปฏิเสธ",
          message: status === 'approved' 
            ? `การชำระเงินสำหรับสัปดาห์ ${selectedPayment.billingWeek} ได้รับการอนุมัติแล้ว`
            : `การชำระเงินสำหรับสัปดาห์ ${selectedPayment.billingWeek} ถูกปฏิเสธ: ${remark}`,
          type: status === 'approved' ? "approval" : "rejection",
          isRead: false,
          createdAt: new Date()
        } as any);
      } catch (notifErr) {
        console.error("Failed to create notification:", notifErr);
      }

      showToast(status === 'approved' ? "อนุมัติการชำระเงินเรียบร้อยแล้ว" : "ปฏิเสธการชำระเงินเรียบร้อยแล้ว");
      setIsSlipModalOpen(false);
      setRemark("");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "เกิดข้อผิดพลาดในการทำรายการ", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const verificationsData = payments
    .filter(p => p.paymentStatus === 'payment_slip_uploaded' || p.paymentStatus === 'waiting_verification' || slips.some(s => s.billId === p.id))
    .map(p => {
      const room = rooms.find(r => r.id === p.roomId);
      const dormitory = dormitories.find(d => d.id === room?.dormitoryId);
      const student = students.find(s => s.id === p.studentId);
      const slip = slips.find(s => s.billId === p.id);

      return {
        ...p,
        roomInfo: `${dormitory?.dormitoryName || ''} - ${room?.roomNumber || 'N/A'}`,
        location: `${room?.building || ''} ชั้น ${room?.floor || ''}`,
        studentName: slip?.studentName || student?.fullName || "N/A",
        studentCode: slip?.studentCode || student?.studentId || "N/A",
        invoiceNumber: p.invoiceNumber || slip?.invoiceNumber || "N/A",
        total: p.individualAmount.toLocaleString() + " ฿",
        hasSlip: !!slip,
        slipDate: slip?.uploadDate && slip?.uploadTime ? `${slip.uploadDate} ${slip.uploadTime}` : (slip?.uploadedAt ? new Date(slip.uploadedAt.seconds ? slip.uploadedAt.seconds * 1000 : slip.uploadedAt).toLocaleString('th-TH') : "N/A")
      };
    });

  return (
    <div className="space-y-6">
      <DataTable
        title="รายการสลิปหลักฐานการชำระเงินของนักศึกษา"
        data={verificationsData}
        searchFields={["roomInfo", "studentName", "billingWeek", "studentCode", "invoiceNumber"]}
        columns={[
          { 
            header: "เลขที่ใบแจ้งหนี้ / รอบ", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-slate-900">{item.invoiceNumber}</span>
                <span className="text-[10px] font-bold text-slate-400">สัปดาห์ที่ {item.billingWeek}</span>
              </div>
            )
          },
          { 
            header: "ข้อมูลนักศึกษา", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.studentName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.studentCode}</span>
              </div>
            )
          },
          { 
            header: "หอพัก / ห้อง", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">{item.roomInfo}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</span>
              </div>
            )
          },
          { 
            header: "ยอดเงิน", 
            accessor: (item) => <span className="font-bold text-primary">{item.total}</span>
          },
          { 
            header: "วันที่และเวลาที่อัปโหลด", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-600">{item.slipDate}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Timestamp</span>
              </div>
            )
          },
          { 
            header: "สถานะ", 
            accessor: (item) => (
              <StatusChip 
                status="Payment Slip Uploaded" 
                variant="info"
              />
            )
          },
          {
            header: "จัดการ",
            accessor: (item) => (
              <button
                disabled={!item.hasSlip}
                onClick={() => handleOpenSlip(item as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  item.hasSlip 
                    ? "text-primary bg-primary-container/50 hover:bg-primary-container" 
                    : "text-slate-300 bg-slate-50 cursor-not-allowed"
                }`}
              >
                <Eye className="h-4 w-4" />
                <span>เปิดดูสลิป</span>
              </button>
            )
          }
        ]}
      />

      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="ตรวจสอบหลักฐานการโอนเงิน (Payment Slip)"
      >
        <div className="space-y-6">
          <div className="aspect-[4/5] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group shadow-inner">
            {selectedSlip?.fileUrl ? (
              <AssetImage src={selectedSlip.fileUrl} alt="Payment Slip" className="w-full h-full object-contain" fallbackType="slip" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <AlertCircle className="h-10 w-10 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">ไม่พบไฟล์หลักฐาน</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ชื่อนักศึกษา</span>
              <p className="text-sm font-bold text-slate-900">{selectedSlip?.studentName || students.find(s => s.id === selectedPayment?.studentId)?.fullName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">รหัสนักศึกษา</span>
              <p className="text-sm font-bold text-slate-900">{selectedSlip?.studentCode || students.find(s => s.id === selectedPayment?.studentId)?.studentId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เลขที่ใบแจ้งหนี้</span>
              <p className="text-sm font-bold text-slate-900 font-mono">{selectedSlip?.invoiceNumber || selectedPayment?.invoiceNumber}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ยอดชำระ</span>
              <p className="text-lg font-bold text-primary">฿{selectedPayment?.individualAmount.toLocaleString()}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">เวลาที่อัปโหลด</span>
              <p className="text-sm font-bold text-slate-700">{selectedSlip?.uploadDate && selectedSlip?.uploadTime ? `${selectedSlip.uploadDate} ${selectedSlip.uploadTime}` : "N/A"}</p>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => setIsSlipModalOpen(false)}
              className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
