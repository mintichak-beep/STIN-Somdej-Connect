import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { studentPaymentService, weeklyBillService, roomService, studentService, paymentSlipService, notificationService, dormitoryService } from "../services/app.service";
import { StudentPayment, WeeklyBill, Room, Student, PaymentSlip, Dormitory } from "../types/app";
import { CheckCircle, XCircle, Eye, AlertCircle, Search, Clock, MapPin, User, CreditCard } from "lucide-react";
import { StatusChip } from "../components/StatusChip";
import { motion, AnimatePresence } from "motion/react";

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
    .filter(p => p.paymentStatus === 'waiting_verification' || p.paymentStatus === 'paid' || p.paymentStatus === 'rejected')
    .map(p => {
      const room = rooms.find(r => r.id === p.roomId);
      const dormitory = dormitories.find(d => d.id === room?.dormitoryId);
      const student = students.find(s => s.id === p.studentId);
      const slip = slips.find(s => s.billId === p.id);

      return {
        ...p,
        roomInfo: `${dormitory?.dormitoryName || ''} - ${room?.roomNumber || 'N/A'}`,
        location: `${room?.building || ''} ชั้น ${room?.floor || ''}`,
        studentName: student?.fullName || "N/A",
        studentCode: student?.studentId || "N/A",
        total: p.individualAmount.toLocaleString() + " ฿",
        hasSlip: !!slip,
        slipDate: slip?.uploadedAt ? new Date(slip.uploadedAt.seconds ? slip.uploadedAt.seconds * 1000 : slip.uploadedAt).toLocaleString('th-TH') : "N/A"
      };
    });

  return (
    <div className="space-y-6">
      <DataTable
        title="Payment Verification Queue"
        data={verificationsData}
        searchFields={["roomInfo", "studentName", "billingWeek", "studentCode"]}
        columns={[
          { 
            header: "Cycle", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold text-slate-900">{item.billingWeek}</span>
                <span className="text-[10px] font-bold text-slate-400">Week ID</span>
              </div>
            )
          },
          { 
            header: "Resident Info", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.studentName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.studentCode}</span>
              </div>
            )
          },
          { 
            header: "Location", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">{item.roomInfo}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</span>
              </div>
            )
          },
          { 
            header: "Amount", 
            accessor: (item) => <span className="font-bold text-primary">{item.total}</span>
          },
          { 
            header: "Submission", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-600">{item.slipDate}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Date</span>
              </div>
            )
          },
          { 
            header: "Status", 
            accessor: (item) => (
              <StatusChip 
                status={item.paymentStatus === 'waiting_verification' ? 'Pending Review' : item.paymentStatus} 
                variant={
                  item.paymentStatus === 'paid' ? 'success' : 
                  item.paymentStatus === 'waiting_verification' ? 'warning' : 
                  item.paymentStatus === 'rejected' ? 'error' : 'info'
                }
              />
            )
          },
          {
            header: "Actions",
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
                <span>Verify</span>
              </button>
            )
          }
        ]}
      />

      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => !isSaving && setIsSlipModalOpen(false)}
        title="Transaction Proof Audit"
      >
        <div className="space-y-6">
          <div className="aspect-[4/5] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group shadow-inner">
            {selectedSlip?.fileUrl ? (
              <img src={selectedSlip.fileUrl} alt="Payment Slip" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                <AlertCircle className="h-10 w-10 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Proof document not found</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resident</span>
              <p className="text-sm font-bold text-slate-900">{students.find(s => s.id === selectedPayment?.studentId)?.fullName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dormitory Unit</span>
              <p className="text-sm font-bold text-slate-900">Room {rooms.find(r => r.id === selectedPayment?.roomId)?.roomNumber}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle Week</span>
              <p className="text-sm font-bold text-slate-900 font-mono">{selectedPayment?.billingWeek}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
              <p className="text-lg font-bold text-primary">฿{selectedPayment?.individualAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Auditor Remarks</label>
            <textarea
              disabled={isSaving}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="State the reason for approval or rejection..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              disabled={isSaving}
              onClick={() => handleVerify('rejected')}
              className="flex-1 py-4 text-sm font-bold text-error bg-error/10 hover:bg-error/20 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="h-4 w-4" /> Decline
            </button>
            <button 
              disabled={isSaving}
              onClick={() => handleVerify('approved')}
              className="flex-1 py-4 text-sm font-bold text-white bg-success hover:bg-success/90 rounded-xl shadow-lg shadow-success/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" /> Approve
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
