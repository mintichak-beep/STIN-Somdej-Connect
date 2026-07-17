import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { paymentService } from '../../services/payment.service';
import { studentService } from '../../services/student.service';
import { mockDB } from '../../services/mockData';
import { Bill, Payment, Student } from '../../types/db';
import { 
  Droplet, Zap, CreditCard, Receipt, UploadCloud, Check, X, 
  Search, Filter, ArrowUpDown, FileText, AlertCircle, Calendar,
  ChevronLeft, ChevronRight, Eye, RefreshCw, Landmark, ThumbsUp, ThumbsDown
} from 'lucide-react';

export function UtilityPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator' || user?.role === 'Teacher';
  
  // Shared States
  const [bills, setBills] = useState<Bill[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tenant/Student States
  const [myStudentProfile, setMyStudentProfile] = useState<Student | null>(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState<Bill | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipBase64, setSlipBase64] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmittingSlip, setIsSubmittingSlip] = useState<boolean>(false);
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);

  // Admin States
  const [adminSearch, setAdminSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'room' | 'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPaymentForReview, setSelectedPaymentForReview] = useState<Payment | null>(null);
  const [rejectionRemark, setRejectionRemark] = useState<string>('');
  const [showRejectionForm, setShowRejectionForm] = useState<boolean>(false);
  const [isReviewingAction, setIsReviewingAction] = useState<boolean>(false);
  
  // New Bill Creator States (Admin Feature for Convenience)
  const [showBillCreator, setShowBillCreator] = useState<boolean>(false);
  const [newBillRoomId, setNewBillRoomId] = useState<string>('');
  const [newBillMonth, setNewBillMonth] = useState<string>('สิงหาคม');
  const [newBillYear, setNewBillYear] = useState<string>('2569');
  const [newBillWaterUnit, setNewBillWaterUnit] = useState<number>(0);
  const [newBillElectricUnit, setNewBillElectricUnit] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 8;

  // Show toast notification helper
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load Initial Data and Subscriptions
  useEffect(() => {
    setLoading(true);
    
    // Subscribe to database changes
    const unsubscribeBills = paymentService.subscribeBills((updatedBills) => {
      setBills(updatedBills);
    });

    const unsubscribePayments = paymentService.subscribePayments((updatedPayments) => {
      setPayments(updatedPayments);
    });

    const unsubscribeStudents = studentService.subscribe((updatedStudents) => {
      setStudents(updatedStudents);
    });

    // Fetch static room entries
    const roomList = mockDB.getRooms();
    setRooms(roomList);
    setLoading(false);

    return () => {
      unsubscribeBills();
      unsubscribePayments();
      unsubscribeStudents();
    };
  }, []);

  // Sync Student profile based on current logged in user
  useEffect(() => {
    if (students.length > 0 && user) {
      const found = students.find(s => s.email === user.email || s.studentId === user.uid || s.studentNumber === user.uid);
      if (found) {
        setMyStudentProfile(found);
      } else if (user.role === 'Student') {
        // Fallback or link profile
        const firstStudent = students[0];
        setMyStudentProfile(firstStudent);
      }
    }
  }, [students, user]);

  const activeRoomId = isAdmin ? '' : (myStudentProfile?.roomId || 'r-dormA-101');
  const myBills = bills.filter(b => b.roomId === activeRoomId);
  const unpaidMyBills = myBills.filter(b => b.status === 'Unpaid' || b.status === 'Rejected');
  const totalOutstanding = unpaidMyBills.reduce((acc, b) => acc + b.totalAmount, 0);

  // File Handlers for upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('กรุณาอัปโหลดไฟล์รูปภาพ JPG, JPEG หรือ PNG เท่านั้น', 'error');
      return;
    }
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
      return;
    }

    setSlipFile(file);

    // Convert to Base64 preview & storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit payment handler
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay) return;
    if (!slipBase64) {
      showToast('กรุณาอัปโหลดรูปภาพสลิปชำระเงิน', 'error');
      return;
    }

    setIsSubmittingSlip(true);
    try {
      await paymentService.submitPayment({
        billId: selectedBillForPay.billId,
        roomId: selectedBillForPay.roomId,
        tenantId: myStudentProfile?.studentId || 'st-1',
        amount: selectedBillForPay.totalAmount,
        slipUrl: slipBase64,
        transferDate: transferDate
      });
      showToast('อัปโหลดสลิปและส่งหลักฐานชำระเงินเรียบร้อยแล้ว รอดำเนินการตรวจสอบ', 'success');
      
      // Reset state
      setSelectedBillForPay(null);
      setSlipFile(null);
      setSlipBase64('');
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการส่งหลักฐานชำระเงิน', 'error');
    } finally {
      setIsSubmittingSlip(false);
    }
  };

  // Admin approval / rejection handlers
  const handleApprove = async (paymentId: string) => {
    if (!user) return;
    setIsReviewingAction(true);
    try {
      await paymentService.approvePayment(paymentId, user.displayName || user.email);
      showToast('อนุมัติการชำระเงินเรียบร้อยแล้ว', 'success');
      setSelectedPaymentForReview(null);
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setIsReviewingAction(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForReview || !rejectionRemark.trim() || !user) {
      showToast('กรุณากรอกเหตุผลที่ปฏิเสธ', 'error');
      return;
    }
    setIsReviewingAction(true);
    try {
      await paymentService.rejectPayment(
        selectedPaymentForReview.paymentId, 
        rejectionRemark, 
        user.displayName || user.email
      );
      showToast('ปฏิเสธการชำระเงินและแจ้งผลไปยังผู้เช่าแล้ว', 'success');
      setSelectedPaymentForReview(null);
      setRejectionRemark('');
      setShowRejectionForm(false);
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setIsReviewingAction(false);
    }
  };

  // Admin: create a new bill
  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBillRoomId) {
      showToast('กรุณาเลือกห้องพัก', 'error');
      return;
    }

    // Water rates: 5 THB per unit, Electricity rates: 4 THB per unit (simple formula as requested or fixed multiplication)
    const waterAmount = newBillWaterUnit * 5;
    const electricAmount = newBillElectricUnit * 4;
    const totalAmount = waterAmount + electricAmount;

    try {
      // Find tenant of the room
      const assignedTenant = students.find(s => s.roomId === newBillRoomId);
      const tenantId = assignedTenant?.studentId || 'unassigned';

      await paymentService.createBill({
        roomId: newBillRoomId,
        tenantId: tenantId,
        month: newBillMonth,
        year: newBillYear,
        waterUnit: newBillWaterUnit,
        electricUnit: newBillElectricUnit,
        waterAmount: waterAmount,
        electricAmount: electricAmount,
        totalAmount: totalAmount,
        dueDate: `${newBillYear === '2569' ? '2026' : '2027'}-${newBillMonth === 'สิงหาคม' ? '09' : '08'}-05`, // mock due date
        status: 'Unpaid'
      });

      showToast(`สร้างบิลสำหรับห้อง ${newBillRoomId} เรียบร้อย ยอดรวม ฿${totalAmount}`, 'success');
      setShowBillCreator(false);
      setNewBillRoomId('');
      setNewBillWaterUnit(0);
      setNewBillElectricUnit(0);
    } catch (err: any) {
      showToast('เกิดข้อผิดพลาดในการสร้างบิล', 'error');
    }
  };

  // Filter & Sort logic for Admin
  const filteredPayments = payments.filter(p => {
    const studentObj = students.find(s => s.studentId === p.tenantId);
    const studentName = studentObj?.studentName || '';
    const roomObj = rooms.find(r => r.id === p.roomId);
    const roomNum = roomObj?.roomNumber || p.roomId;
    const associatedBill = bills.find(b => b.billId === p.billId);
    const billMonth = associatedBill?.month || '';

    const matchesSearch = 
      roomNum.toLowerCase().includes(adminSearch.toLowerCase()) ||
      studentName.toLowerCase().includes(adminSearch.toLowerCase()) ||
      billMonth.toLowerCase().includes(adminSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesMonth = monthFilter === 'All' || billMonth === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Sort logic
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    let valueA: any = '';
    let valueB: any = '';

    if (sortBy === 'room') {
      const roomA = rooms.find(r => r.id === a.roomId)?.roomNumber || a.roomId;
      const roomB = rooms.find(r => r.id === b.roomId)?.roomNumber || b.roomId;
      valueA = roomA;
      valueB = roomB;
    } else if (sortBy === 'date') {
      valueA = new Date(a.uploadTime).getTime();
      valueB = new Date(b.uploadTime).getTime();
    } else if (sortBy === 'amount') {
      valueA = a.amount;
      valueB = b.amount;
    }

    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedPayments.length / itemsPerPage) || 1;
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats calculation for Admin Dashboard Widgets
  const totalUnpaidBills = bills.filter(b => b.status === 'Unpaid' || b.status === 'Rejected');
  const sumUnpaidAmount = totalUnpaidBills.reduce((sum, b) => sum + b.totalAmount, 0);
  
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const totalReceivedThisMonth = payments
    .filter(p => p.status === 'Approved')
    .reduce((sum, p) => sum + p.amount, 0);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [adminSearch, statusFilter, monthFilter, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-bold text-gray-500">กำลังดาวน์โหลดข้อมูลค่าบริการ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 dark:bg-zinc-950 font-sans">
      {/* Toast Notice */}
      {toast && (
        <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg transition-all border ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/90 dark:border-rose-800 dark:text-rose-200'
        }`}>
          {toast.type === 'success' ? <Check className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500">ระบบหอพักนักศึกษา</span>
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-zinc-50 sm:text-2xl">
            {isAdmin ? 'ศูนย์ตรวจสอบค่าน้ำและค่าไฟฟ้า' : 'บริการค่าน้ำประปาและไฟฟ้า'}
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            {isAdmin 
              ? 'ระบบสแกนตรวจสอบหลักฐานสลิปการโอนเงิน บัญชีรายรับ และการประเมินหนี้สินหอพักสตรี' 
              : `ห้องพักเลขที่ ${rooms.find(r => r.id === activeRoomId)?.roomNumber || '101'} • สมาชิกในสิทธิ์: ${myStudentProfile?.studentName || user?.displayName}`}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            id="btn-create-bill"
            onClick={() => setShowBillCreator(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white hover:bg-red-700 transition shadow-xs cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>สร้างบิลค่าบริการรายเดือน</span>
          </button>
        )}
      </div>

      {/* ==========================================
          TENANT VIEW (STUDENT ROLE)
         ========================================== */}
      {!isAdmin && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Summary outstanding card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="absolute right-4 top-4 rounded-xl bg-red-50 p-2 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">ยอดค้างชำระทั้งหมด</span>
                <p className="mt-2 text-3xl font-black text-red-600 dark:text-red-500">
                  ฿{totalOutstanding.toLocaleString()}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>กรุณาชำระเงินก่อนวันที่ 5 ของทุกเดือนเพื่อหลีกเลี่ยงค่าปรับ</span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="absolute right-4 top-4 rounded-xl bg-gray-50 p-2 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                  <Landmark className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">ข้อมูลห้องพัก</span>
                <p className="mt-2 text-2xl font-black text-gray-900 dark:text-zinc-100">
                  ห้อง {rooms.find(r => r.id === activeRoomId)?.roomNumber || '101'}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-1">
                  {myStudentProfile?.hospital || 'วิทยาเขตศิริราช'} • {myStudentProfile?.rotationGroup || 'หอพักสตรี'}
                </p>
              </div>
            </div>

            {/* List of my bills */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-gray-50 px-6 py-4 dark:border-zinc-800/60">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <span>ประวัติรายการบิลประจำหอพัก</span>
                </h3>
              </div>

              {myBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-xs font-bold text-gray-500">ไม่พบรายการจัดเก็บค่าน้ำค่าไฟฟ้าสำหรับห้องของท่าน</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:border-zinc-800 dark:bg-zinc-800/30">
                        <th className="px-6 py-3">ประจำเดือน</th>
                        <th className="px-6 py-3">ประปา (หน่วย)</th>
                        <th className="px-6 py-3">ไฟฟ้า (หน่วย)</th>
                        <th className="px-6 py-3">ยอดรวมสุทธิ</th>
                        <th className="px-6 py-3">สถานะการชำระ</th>
                        <th className="px-6 py-3 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs dark:divide-zinc-800">
                      {myBills.map((bill) => {
                        const hasSlip = payments.find(p => p.billId === bill.billId);
                        return (
                          <tr key={bill.billId} className="hover:bg-gray-50/40 dark:hover:bg-zinc-900/30">
                            <td className="px-6 py-4 font-bold text-gray-900 dark:text-zinc-100">
                              {bill.month} {bill.year}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Droplet className="h-3.5 w-3.5 text-blue-500" />
                                <span>{bill.waterUnit} หน่วย (฿{bill.waterAmount})</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                <span>{bill.electricUnit} หน่วย (฿{bill.electricAmount})</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 font-black text-gray-900 dark:text-zinc-100">
                              ฿{bill.totalAmount}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                bill.status === 'Paid' 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : bill.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                                  : bill.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {bill.status === 'Paid' && 'ชำระแล้ว'}
                                {bill.status === 'Pending' && 'รอตรวจสอบ'}
                                {bill.status === 'Rejected' && 'หลักฐานไม่ผ่าน'}
                                {bill.status === 'Unpaid' && 'ยังไม่ชำระ'}
                              </span>
                              
                              {bill.status === 'Rejected' && hasSlip?.remark && (
                                <p className="mt-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                                  เหตุผล: {hasSlip.remark}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {bill.status === 'Unpaid' || bill.status === 'Rejected' ? (
                                <button
                                  id={`btn-pay-${bill.billId}`}
                                  onClick={() => setSelectedBillForPay(bill)}
                                  className="rounded-xl bg-red-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-red-700 transition cursor-pointer"
                                >
                                  ชำระเงิน
                                </button>
                              ) : hasSlip ? (
                                <button
                                  id={`btn-view-slip-${bill.billId}`}
                                  onClick={() => setViewingSlipUrl(hasSlip.slipUrl)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>ดูสลิป</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400">เรียบร้อย</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                <Landmark className="h-4 w-4 text-red-600" />
                <span>ช่องทางชำระค่าน้ำและค่าไฟฟ้า</span>
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/40">
                  <p className="font-extrabold text-gray-700 dark:text-zinc-300 mb-1">โอนผ่านบัญชีธนาคาร</p>
                  <div className="space-y-1 text-gray-500 dark:text-zinc-400">
                    <p>ธนาคาร: <strong>กรุงไทย (KTB)</strong></p>
                    <p>เลขที่บัญชี: <strong className="text-gray-900 dark:text-zinc-100">012-3-45678-9</strong></p>
                    <p>ชื่อบัญชี: <strong className="text-gray-900 dark:text-zinc-100">วิทยาลัยพยาบาลบรมราชชนนี จักรีรัช</strong></p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-t border-gray-50 pt-4 dark:border-zinc-800">
                  <span className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wide">สแกนชำระผ่าน PromptPay QR</span>
                  {/* Visual QR code block */}
                  <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-md dark:border-zinc-800 dark:bg-white flex flex-col items-center">
                    <div className="w-40 h-40 bg-zinc-100 border border-zinc-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {/* Realistic simulated PromptPay visual */}
                      <svg viewBox="0 0 100 100" className="w-36 h-36 text-blue-900">
                        <rect x="0" y="0" width="100" height="100" fill="#fff" />
                        {/* PromptPay Top Bar */}
                        <rect x="5" y="5" width="90" height="12" fill="#1e3a8a" rx="2" />
                        <text x="50" y="14" fill="#fff" fontSize="6" fontWeight="bold" textAnchor="middle">PROMPTPAY</text>
                        {/* Mock QR lines */}
                        <path d="M20,25 h15 v15 h-15 z M25,30 h5 v5 h-5 z" fill="currentColor" />
                        <path d="M65,25 h15 v15 h-15 z M70,30 h5 v5 h-5 z" fill="currentColor" />
                        <path d="M20,65 h15 v15 h-15 z M25,70 h5 v5 h-5 z" fill="currentColor" />
                        <path d="M45,45 h10 v10 h-10 z" fill="currentColor" />
                        {/* Random QR pixels */}
                        <rect x="40" y="25" width="5" height="5" fill="currentColor" />
                        <rect x="50" y="30" width="5" height="5" fill="currentColor" />
                        <rect x="45" y="35" width="5" height="5" fill="currentColor" />
                        <rect x="25" y="45" width="5" height="10" fill="currentColor" />
                        <rect x="35" y="50" width="10" height="5" fill="currentColor" />
                        <rect x="65" y="50" width="15" height="5" fill="currentColor" />
                        <rect x="50" y="60" width="5" height="15" fill="currentColor" />
                        <rect x="60" y="65" width="15" height="5" fill="currentColor" />
                        <rect x="75" y="70" width="5" height="10" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="mt-2 text-[9px] font-extrabold text-blue-900 leading-none">THAI QR PAYMENT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          ADMINISTRATOR VIEW (ADMIN / TEACHER ROLE)
         ========================================== */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">บิลค้างชำระทั้งหมด</span>
              <p className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-500">
                ฿{sumUnpaidAmount.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] font-bold text-gray-400">
                จาก {totalUnpaidBills.length} ห้องพักที่ค้างส่งยอด
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-500">หลักฐานรอการตรวจสอบ</span>
              <p className="mt-2 text-2xl font-black text-amber-500 dark:text-amber-400">
                {pendingPayments.length} รายการ
              </p>
              <p className="mt-1 text-[11px] font-bold text-gray-400">
                กรุณารีวิวและอนุมัติในตารางด้านล่าง
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">ยอดรับชำระเงินเดือนนี้</span>
              <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-500">
                ฿{totalReceivedThisMonth.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] font-bold text-gray-400">
                อิงจากสลิปโอนเงินที่อนุมัติแล้ว
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">อัตราการชำระเสร็จสิ้น</span>
              <p className="mt-2 text-2xl font-black text-gray-900 dark:text-zinc-50">
                {bills.length > 0 ? Math.round((bills.filter(b => b.status === 'Paid').length / bills.length) * 100) : 0}%
              </p>
              <p className="mt-1 text-[11px] font-bold text-gray-400">
                สำเร็จ {bills.filter(b => b.status === 'Paid').length} จากทั้งหมด {bills.length} บิล
              </p>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            {/* Filter controls */}
            <div className="flex flex-col gap-4 border-b border-gray-50 p-6 dark:border-zinc-800/60 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขห้องพัก, ชื่อผู้เช่า หรือเดือน..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-medium placeholder-gray-400 outline-hidden transition focus:border-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">กรองสถานะ</span>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="All">ทั้งหมด</option>
                  <option value="Pending">รอตรวจสอบ</option>
                  <option value="Approved">อนุมัติแล้ว</option>
                  <option value="Rejected">ปฏิเสธสลิป</option>
                </select>

                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="All">ทุกเดือน</option>
                  <option value="มิถุนายน">มิถุนายน</option>
                  <option value="กรกฎาคม">กรกฎาคม</option>
                  <option value="สิงหาคม">สิงหาคม</option>
                </select>

                <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800"></div>

                {/* Sort logic togglers */}
                <button
                  onClick={() => {
                    if (sortBy === 'room') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('room'); setSortOrder('asc'); }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    sortBy === 'room' ? 'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span>เรียงตามเลขห้อง</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('date'); setSortOrder('desc'); }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    sortBy === 'date' ? 'bg-gray-100 text-gray-900 dark:bg-zinc-800 dark:text-zinc-100' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span>เรียงตามวันที่ส่ง</span>
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Verification Table */}
            {paginatedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <Receipt className="h-14 w-14 text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-500">ไม่พบข้อมูลใบเสร็จหรือหลักฐานโอนเงินตามเงื่อนไขที่เลือก</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/50 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:border-zinc-800 dark:bg-zinc-800/30">
                        <th className="px-6 py-4">ห้องพัก</th>
                        <th className="px-6 py-4">ชื่อผู้ส่งเงิน (ผู้เช่า)</th>
                        <th className="px-6 py-4">บิลรอบประจำเดือน</th>
                        <th className="px-6 py-4">ยอดเงินแจ้งโอน</th>
                        <th className="px-6 py-4">วันเวลาแจ้งอัปโหลด</th>
                        <th className="px-6 py-4">วันที่แจ้งโอน</th>
                        <th className="px-6 py-4">สถานะสลิป</th>
                        <th className="px-6 py-4 text-center">ตรวจสอบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs dark:divide-zinc-800">
                      {paginatedPayments.map((pay) => {
                        const studentObj = students.find(s => s.studentId === pay.tenantId);
                        const billObj = bills.find(b => b.billId === pay.billId);
                        const roomObj = rooms.find(r => r.id === pay.roomId);
                        
                        return (
                          <tr key={pay.paymentId} className="hover:bg-gray-50/40 dark:hover:bg-zinc-900/30">
                            <td className="px-6 py-4 font-black text-gray-900 dark:text-zinc-50">
                              ห้อง {roomObj?.roomNumber || pay.roomId}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-700 dark:text-zinc-200">
                              {studentObj?.studentName || `นักศึกษา S-${pay.tenantId}`}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                              {billObj?.month} {billObj?.year}
                            </td>
                            <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-500">
                              ฿{pay.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                              {new Date(pay.uploadTime).toLocaleString('th-TH')}
                            </td>
                            <td className="px-6 py-4 text-gray-500 dark:text-zinc-400 font-medium">
                              {pay.transferDate}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                pay.status === 'Approved' 
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                  : pay.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 animate-pulse'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                              }`}>
                                {pay.status === 'Approved' && 'อนุมัติเรียบร้อย'}
                                {pay.status === 'Pending' && 'รอตรวจสอบสลิป'}
                                {pay.status === 'Rejected' && 'หลักฐานไม่ถูกต้อง'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                id={`btn-review-${pay.paymentId}`}
                                onClick={() => {
                                  setSelectedPaymentForReview(pay);
                                  setShowRejectionForm(false);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-[11px] font-black text-white hover:bg-red-700 transition cursor-pointer"
                              >
                                <span>รีวิวใบสลิป</span>
                                <Eye className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-50 p-6 dark:border-zinc-800/60">
                    <span className="text-[11px] text-gray-500">
                      แสดงรายการที่ {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedPayments.length)} จากทั้งหมด {sortedPayments.length} รายการ
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                        หน้า {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS & DIALOGS
         ========================================== */}

      {/* MODAL: Pay Bill (Tenant Slip Upload) */}
      {selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-zinc-800/60">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-500 tracking-wider">ชำระเงินค่าส่วนกลางหอพัก</span>
                <h3 className="text-base font-black text-gray-900 dark:text-zinc-100">
                  ห้องพัก {rooms.find(r => r.id === selectedBillForPay.roomId)?.roomNumber || '101'} • รอบบิล {selectedBillForPay.month} {selectedBillForPay.year}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedBillForPay(null);
                  setSlipFile(null);
                  setSlipBase64('');
                }}
                className="rounded-xl bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handlePaymentSubmit}>
              <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5 text-xs">
                {/* Cost Summary Box */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">สรุปรายละเอียดค่าใช้จ่ายประจำเดือน</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                      <span>ค่าน้ำประปา ({selectedBillForPay.waterUnit} หน่วย x ฿5)</span>
                      <span className="font-extrabold text-gray-900 dark:text-zinc-200">฿{selectedBillForPay.waterAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600 dark:text-zinc-400">
                      <span>ค่าไฟฟ้า ({selectedBillForPay.electricUnit} หน่วย x ฿4)</span>
                      <span className="font-extrabold text-gray-900 dark:text-zinc-200">฿{selectedBillForPay.electricAmount}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2 pt-2 dark:border-zinc-700 flex justify-between items-center text-sm font-black text-gray-900 dark:text-zinc-50">
                      <span>ยอดชำระสุทธิสุทธิ</span>
                      <span className="text-red-600 dark:text-red-500 text-lg">฿{selectedBillForPay.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Transfer date picker */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                    วันที่โอนเงินตามสลิป
                  </label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden transition focus:border-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Drag and Drop slip file uploader */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                    อัปโหลดสลิปธนาคาร (รองรับ JPG, JPEG, PNG ขนาดไม่เกิน 5MB)
                  </label>
                  
                  {!slipBase64 ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                        dragActive 
                          ? 'border-red-600 bg-red-50/20 dark:border-red-500 dark:bg-red-950/10' 
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="font-black text-gray-700 dark:text-zinc-300">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด</p>
                      <p className="text-[10px] text-gray-400 mt-1">ไฟล์จะต้องไม่เกิน 5MB และเป็นรูปถ่ายสลิปชัดเจน</p>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <button
                        type="button"
                        onClick={() => {
                          setSlipFile(null);
                          setSlipBase64('');
                        }}
                        className="absolute right-3 top-3 z-10 rounded-xl bg-zinc-900/80 p-1.5 text-white hover:bg-zinc-900 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="flex flex-col items-center justify-center">
                        <img 
                          src={slipBase64} 
                          alt="Slip Preview" 
                          className="max-h-60 rounded-lg object-contain shadow-xs border border-gray-200 dark:border-zinc-700"
                        />
                        <p className="mt-2 text-[10px] font-bold text-gray-500">
                          {slipFile?.name} ({(slipFile!.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-50 bg-gray-50/55 px-6 py-4 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBillForPay(null);
                    setSlipFile(null);
                    setSlipBase64('');
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSlip}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSlip ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>ยืนยันการชำระเงิน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Slip (Tenant View uploaded receipt) */}
      {viewingSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-4 shadow-2xl dark:bg-zinc-900">
            <button
              onClick={() => setViewingSlipUrl(null)}
              className="absolute right-4 top-4 rounded-full bg-zinc-950/60 p-2 text-white hover:bg-zinc-950/80 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center justify-center pt-8">
              <span className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">หลักฐานสลิปการโอนเงิน</span>
              <img 
                src={viewingSlipUrl} 
                alt="Uploaded Payment Slip" 
                className="max-h-[75vh] w-full rounded-2xl object-contain shadow-xs border border-gray-100 dark:border-zinc-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Review Slip (Admin verification panel) */}
      {selectedPaymentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-zinc-800/60">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-500 tracking-wider">แผงรีวิวและอนุมัติหลักฐานสลิป</span>
                <h3 className="text-base font-black text-gray-900 dark:text-zinc-100">
                  ตรวจสอบสลิปห้อง {rooms.find(r => r.id === selectedPaymentForReview.roomId)?.roomNumber || selectedPaymentForReview.roomId}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedPaymentForReview(null);
                  setShowRejectionForm(false);
                  setRejectionRemark('');
                }}
                className="rounded-xl bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body Grid */}
            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2 text-xs">
              {/* Left Column: Slip Image */}
              <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-2xl dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase mb-3">รูปภาพสลิปที่แนบมา</span>
                <a 
                  href={selectedPaymentForReview.slipUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  title="คลิกเพื่อดูรูปภาพสลิปขนาดเต็ม"
                  className="group relative block overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700 hover:opacity-90 transition"
                >
                  <img 
                    src={selectedPaymentForReview.slipUrl} 
                    alt="Payment Slip" 
                    className="max-h-80 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-xs font-bold text-white">ดูภาพเต็ม ↗</span>
                  </div>
                </a>
              </div>

              {/* Right Column: Billing Details & Action triggers */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">ข้อมูลผู้ส่งและยอดค้าง</h4>
                  <div className="space-y-1.5">
                    <p className="font-extrabold text-gray-900 dark:text-zinc-200">
                      ผู้เช่า: <span className="font-normal">{students.find(s => s.studentId === selectedPaymentForReview.tenantId)?.studentName || `Student ${selectedPaymentForReview.tenantId}`}</span>
                    </p>
                    <p className="font-extrabold text-gray-900 dark:text-zinc-200">
                      ห้องพัก: <span className="font-normal">ห้อง {rooms.find(r => r.id === selectedPaymentForReview.roomId)?.roomNumber || selectedPaymentForReview.roomId}</span>
                    </p>
                    <p className="font-extrabold text-gray-900 dark:text-zinc-200">
                      ยอดแจ้งโอน: <span className="font-black text-emerald-600 dark:text-emerald-500">฿{selectedPaymentForReview.amount}</span>
                    </p>
                    <p className="font-extrabold text-gray-900 dark:text-zinc-200">
                      วันเวลาอัปโหลด: <span className="font-normal">{new Date(selectedPaymentForReview.uploadTime).toLocaleString('th-TH')}</span>
                    </p>
                    <p className="font-extrabold text-gray-900 dark:text-zinc-200">
                      ระบุวันที่โอน: <span className="font-normal">{selectedPaymentForReview.transferDate}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">รายละเอียดบิลรอบเดือน</h4>
                  {(() => {
                    const associatedBill = bills.find(b => b.billId === selectedPaymentForReview.billId);
                    if (!associatedBill) return <p className="text-[11px] text-gray-400">ไม่พบบิลที่เชื่อมโยง</p>;
                    return (
                      <div className="space-y-1">
                        <p className="font-bold text-gray-900 dark:text-zinc-200">{associatedBill.month} {associatedBill.year}</p>
                        <p className="text-gray-500 dark:text-zinc-400">ค่าน้ำประปา: {associatedBill.waterUnit} หน่วย (฿{associatedBill.waterAmount})</p>
                        <p className="text-gray-500 dark:text-zinc-400">ค่าไฟฟ้า: {associatedBill.electricUnit} หน่วย (฿{associatedBill.electricAmount})</p>
                        <p className="font-black text-gray-900 dark:text-zinc-200">ยอดรวมบิลสุทธิ: ฿{associatedBill.totalAmount}</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2 py-1">
                  <span className="font-bold text-gray-500">สถานะปัจจุบัน:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    selectedPaymentForReview.status === 'Approved' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30'
                      : selectedPaymentForReview.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30'
                  }`}>
                    {selectedPaymentForReview.status === 'Approved' && 'อนุมัติเรียบร้อย'}
                    {selectedPaymentForReview.status === 'Pending' && 'รอดำเนินการรีวิว'}
                    {selectedPaymentForReview.status === 'Rejected' && 'หลักฐานโดนปฏิเสธ'}
                  </span>
                </div>

                {/* Reject Remark form */}
                {showRejectionForm && (
                  <form onSubmit={handleReject} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-rose-600 tracking-wider mb-1.5">
                        เหตุผลการปฏิเสธสลิป (นักศึกษาจะมองเห็นข้อมูลนี้)
                      </label>
                      <textarea
                        required
                        placeholder="เช่น ภาพถ่ายสลิปไม่ชัดเจน, ยอดเงินไม่ตรงกับบิล, บัญชีผู้โอนไม่ถูกต้อง..."
                        value={rejectionRemark}
                        onChange={(e) => setRejectionRemark(e.target.value)}
                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs outline-hidden transition focus:border-rose-600 dark:border-rose-900 dark:bg-zinc-900 dark:text-zinc-100"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isReviewingAction}
                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-700 transition cursor-pointer"
                      >
                        ยืนยันการปฏิเสธสลิป
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectionForm(false)}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            {!showRejectionForm && selectedPaymentForReview.status === 'Pending' && (
              <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/55 px-6 py-4 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 transition dark:border-rose-900 dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-950/20 cursor-pointer"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>ปฏิเสธหลักฐานโอนเงิน</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentForReview(null);
                      setShowRejectionForm(false);
                      setRejectionRemark('');
                    }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
                  >
                    ปิดหน้าต่าง
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedPaymentForReview.paymentId)}
                    disabled={isReviewingAction}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>อนุมัติการชำระเงิน</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Bill Creator (Admin Utility) */}
      {showBillCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/65 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 px-6 py-4 dark:border-zinc-800/60">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-500 tracking-wider">ส่วนบริการผู้ดูแลระบบ</span>
                <h3 className="text-base font-black text-gray-900 dark:text-zinc-100">
                  บันทึกค่าน้ำและไฟฟ้าประจำเดือน
                </h3>
              </div>
              <button 
                onClick={() => setShowBillCreator(false)}
                className="rounded-xl bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateBill}>
              <div className="p-6 space-y-4 text-xs">
                {/* Select Room */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                    เลือกห้องพัก
                  </label>
                  <select
                    required
                    value={newBillRoomId}
                    onChange={(e) => setNewBillRoomId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden transition focus:border-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">-- เลือกห้องพักที่มีอยู่ --</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>
                        ห้อง {r.roomNumber} ({r.gender === 'Female' ? 'หอสตรี' : 'หอพักผสม'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month and Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      ประจำเดือน
                    </label>
                    <select
                      value={newBillMonth}
                      onChange={(e) => setNewBillMonth(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="มิถุนายน">มิถุนายน</option>
                      <option value="กรกฎาคม">กรกฎาคม</option>
                      <option value="สิงหาคม">สิงหาคม</option>
                      <option value="กันยายน">กันยายน</option>
                      <option value="ตุลาคม">ตุลาคม</option>
                      <option value="พฤศจิกายน">พฤศจิกายน</option>
                      <option value="ธันวาคม">ธันวาคม</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      ปี (พ.ศ.)
                    </label>
                    <select
                      value={newBillYear}
                      onChange={(e) => setNewBillYear(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="2569">2569</option>
                      <option value="2570">2570</option>
                    </select>
                  </div>
                </div>

                {/* Units input */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      จำนวนหน่วยน้ำประปาที่ใช้
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newBillWaterUnit}
                      onChange={(e) => setNewBillWaterUnit(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden transition focus:border-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">คิดอัตราหน่วยละ ฿5</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
                      จำนวนหน่วยไฟฟ้าที่ใช้
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newBillElectricUnit}
                      onChange={(e) => setNewBillElectricUnit(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold outline-hidden transition focus:border-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">คิดอัตราหน่วยละ ฿4</span>
                  </div>
                </div>

                {/* Calculated preview */}
                <div className="rounded-xl bg-gray-50 p-3.5 border border-gray-100 dark:bg-zinc-800/40 dark:border-zinc-800">
                  <p className="font-extrabold text-gray-600 dark:text-zinc-400 mb-1">คำนวณยอดเงินเบื้องต้น:</p>
                  <p className="font-black text-gray-900 dark:text-zinc-100">
                    ค่าน้ำประปา: ฿{newBillWaterUnit * 5} • ค่าไฟฟ้า: ฿{newBillElectricUnit * 4}
                  </p>
                  <p className="font-black text-red-600 dark:text-red-500 mt-1">
                    ยอดรวมสุทธิที่จะจัดเก็บ: ฿{newBillWaterUnit * 5 + newBillElectricUnit * 4}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-50 bg-gray-50/55 px-6 py-4 dark:border-zinc-800/60 dark:bg-zinc-900/30">
                <button
                  type="button"
                  onClick={() => setShowBillCreator(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-50 transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-700 transition cursor-pointer"
                >
                  ออกบิลเรียกเก็บเงิน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
