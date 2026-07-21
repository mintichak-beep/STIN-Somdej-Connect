import { useState, useEffect, useMemo } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { weeklyBillService, roomService, studentService, paymentSlipService, notificationService, dormitoryService, allocationService, studentPaymentService, bankAccountService } from "../services/app.service";
import { WeeklyBill, Room, Student, PaymentSlip, Dormitory, Allocation, StudentPayment, BankAccountConfig } from "../types/app";
import { Droplets, Zap, Plus, CheckCircle, XCircle, Eye, FileText, Calendar, Clock, MapPin, AlertCircle, Search, Info, Users, DollarSign, AlertTriangle, Building, QrCode } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { motion, AnimatePresence } from "motion/react";
import { StatusChip } from "../components/StatusChip";
import { AssetImage } from "../components/AssetImage";
import { deduplicationService } from "../services/deduplication.service";

export function UtilityBilling() {
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const [bankAccount, setBankAccount] = useState<BankAccountConfig | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
    qrCodeUrl: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<WeeklyBill | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [remark, setRemark] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<WeeklyBill | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);

  const [formData, setFormData] = useState({
    roomId: "",
    billingWeek: format(new Date(), "yyyy-'W'II"),
    startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
    roomFee: 500,
    waterCharge: 0,
    prevElectricMeter: 0,
    currElectricMeter: 0,
    electricRate: 5,
    otherCharges: 0,
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });

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
    let allocsLoaded = false;
    let paymentsLoaded = false;
    let bankLoaded = false;

    const checkLoading = () => {
      if (billsLoaded && roomsLoaded && studentsLoaded && dormsLoaded && allocsLoaded && paymentsLoaded && bankLoaded) {
        setLoading(false);
      }
    };

    const unsubscribeBills = weeklyBillService.onSnapshot([], (data) => {
      setBills(data);
      billsLoaded = true;
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

    const unsubscribeAllocs = allocationService.onSnapshot([], (data) => {
      setAllocations(data);
      allocsLoaded = true;
      checkLoading();
    });

    const unsubscribePayments = studentPaymentService.onSnapshot([], (data) => {
      setStudentPayments(data);
      paymentsLoaded = true;
      checkLoading();
    });

    const unsubscribeBank = bankAccountService.onSnapshot([], (data) => {
      if (data.length > 0) {
        setBankAccount(data[0]);
        setBankForm({
          accountName: data[0].accountName,
          bankName: data[0].bankName,
          accountNumber: data[0].accountNumber,
          qrCodeUrl: data[0].qrCodeUrl
        });
      }
      bankLoaded = true;
      checkLoading();
    });

    return () => {
      unsubscribeBills();
      unsubscribeRooms();
      unsubscribeStudents();
      unsubscribeDorms();
      unsubscribeAllocs();
      unsubscribePayments();
      unsubscribeBank();
    };
  }, []);

  const handleOpenAdd = () => {
    setSelectedBill(null);
    setFormData({
      roomId: "",
      billingWeek: format(new Date(), "yyyy-'W'II"),
      startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
      roomFee: 500,
      waterCharge: 0,
      prevElectricMeter: 0,
      currElectricMeter: 0,
      electricRate: 5,
      otherCharges: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  // Helper to get occupants for a specific room and week
  const currentOccupants = useMemo(() => {
    if (!formData.roomId || !formData.startDate || !formData.endDate) return [];
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    // Filter allocations that overlap with this period for this room
    const roomAllocations = allocations.filter(alloc => {
      if (alloc.roomId !== formData.roomId) return false;
      
      const allocStart = alloc.startDate.toDate ? alloc.startDate.toDate() : new Date(alloc.startDate);
      const allocEnd = alloc.endDate.toDate ? alloc.endDate.toDate() : new Date(alloc.endDate);
      
      // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
      return (allocStart <= end && allocEnd >= start);
    });

    const occupantIds = Array.from(new Set(roomAllocations.map(a => a.studentId)));
    return students.filter(s => occupantIds.includes(s.id));
  }, [formData.roomId, formData.startDate, formData.endDate, allocations, students]);

  
  const handleOpenEdit = (bill: WeeklyBill) => {
    setSelectedBill(bill);
    setFormData({
      roomId: bill.roomId,
      billingWeek: bill.billingWeek,
      startDate: format(new Date(bill.startDate.seconds ? bill.startDate.seconds * 1000 : bill.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(bill.endDate.seconds ? bill.endDate.seconds * 1000 : bill.endDate), "yyyy-MM-dd"),
      roomFee: bill.roomFee !== undefined ? bill.roomFee : 500,
      waterCharge: bill.waterCharge,
      prevElectricMeter: bill.prevElectricMeter,
      currElectricMeter: bill.currElectricMeter,
      electricRate: bill.electricRate,
      otherCharges: bill.otherCharges !== undefined ? bill.otherCharges : 0,
      dueDate: format(new Date(bill.dueDate.seconds ? bill.dueDate.seconds * 1000 : bill.dueDate), "yyyy-MM-dd"),
    });
    setDuplicateWarning(null);
    setBypassDuplicate(false);
    setIsModalOpen(true);
  };

  const validateFormData = () => {
    if (!formData.roomId) return "กรุณาเลือกห้องพัก";
    if (!formData.billingWeek) return "กรุณาระบุสัปดาห์ที่เรียกเก็บ";
    if (!formData.startDate) return "กรุณาระบุวันที่เริ่มต้น";
    if (!formData.endDate) return "กรุณาระบุวันที่สิ้นสุด";
    if (new Date(formData.startDate) > new Date(formData.endDate)) return "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด";
    if (!formData.dueDate) return "กรุณาระบุวันครบกำหนดชำระเงิน";
    if (formData.roomFee < 0) return "ค่าห้องพักต้องไม่เป็นค่าติดลบ";
    if (formData.prevElectricMeter < 0) return "มิเตอร์ไฟครั้งก่อนต้องไม่เป็นค่าติดลบ";
    if (formData.currElectricMeter < formData.prevElectricMeter) return "มิเตอร์ไฟครั้งนี้ต้องไม่น้อยกว่ามิเตอร์ไฟครั้งก่อน";
    if (formData.electricRate <= 0) return "อัตราค่าไฟต้องมากกว่า 0 บาท/หน่วย";
    if (formData.waterCharge < 0) return "ค่าใช้น้ำต้องไม่น้อยกว่า 0 บาท";
    if (formData.otherCharges < 0) return "ค่าใช้จ่ายอื่นๆ ต้องไม่น้อยกว่า 0 บาท";
    if (currentOccupants.length === 0) return "ไม่พบนักศึกษาที่พักในห้องนี้ในช่วงเวลาที่ระบุ";
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateFormData();
    if (errorMsg) {
      showToast(errorMsg, "error");
      return;
    }

    try {
      if (!bypassDuplicate) {
        setIsSaving(true);
        const dup = await deduplicationService.checkDuplicateBeforeSave("utilityBills", formData, selectedBill?.id);
        if (dup) {
          const room = rooms.find(r => r.id === formData.roomId);
          setDuplicateWarning(`A utility bill for room "${room?.roomNumber || 'Selected Room'}" during week ${formData.billingWeek} already exists. Do you want to proceed and create a duplicate?`);
          setIsSaving(false);
          return;
        }
      }

      setIsSaving(true);
      
      const occupantsCount = currentOccupants.length;
      const electricityUsage = Math.max(0, formData.currElectricMeter - formData.prevElectricMeter);
      const electricityCharge = electricityUsage * formData.electricRate;
      const totalAmount = formData.roomFee + formData.waterCharge + electricityCharge + formData.otherCharges;
      const individualAmount = occupantsCount > 0 ? totalAmount / occupantsCount : 0;
      const invoiceNumber = selectedBill?.invoiceNumber || `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const billData: Omit<WeeklyBill, "id"> = {
        roomId: formData.roomId,
        invoiceNumber,
        billingWeek: formData.billingWeek,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        occupantsCount,
        waterUsage: occupantsCount,
        electricityUsage,
        roomFee: formData.roomFee,
        waterCharge: formData.waterCharge,
        electricityCharge,
        otherCharges: formData.otherCharges,
        totalAmount,
        dueDate: new Date(formData.dueDate),
        paymentStatus: "pending",
        prevElectricMeter: formData.prevElectricMeter,
        currElectricMeter: formData.currElectricMeter,
        electricRate: formData.electricRate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let billId = selectedBill?.id;
      if (selectedBill) {
        await weeklyBillService.update(selectedBill.id, billData as any);
      } else {
        billId = (await weeklyBillService.create(billData as any)) as string;
      }
      
      const paymentPromises = currentOccupants.map(student => {
        const existingPayment = studentPayments.find(p => p.billId === billId && p.studentId === student.id);
        if (existingPayment) {
            return studentPaymentService.update(existingPayment.id, {
                roomId: formData.roomId,
                invoiceNumber,
                billingWeek: formData.billingWeek,
                roomFee: formData.roomFee / occupantsCount,
                waterCharge: formData.waterCharge / occupantsCount,
                electricityCharge: electricityCharge / occupantsCount,
                otherCharges: formData.otherCharges / occupantsCount,
                individualAmount,
                updatedAt: new Date()
            } as any);
        } else {
            const paymentData: Omit<StudentPayment, "id"> = {
              billId: billId!,
              studentId: student.id,
              roomId: formData.roomId,
              invoiceNumber,
              billingWeek: formData.billingWeek,
              roomFee: formData.roomFee / occupantsCount,
              waterCharge: formData.waterCharge / occupantsCount,
              electricityCharge: electricityCharge / occupantsCount,
              otherCharges: formData.otherCharges / occupantsCount,
              individualAmount,
              paymentStatus: "pending",
              createdAt: new Date(),
              updatedAt: new Date()
            };

            return studentPaymentService.create(paymentData as any).then(() => {
              return notificationService.create({
                userId: student.id,
                title: "ใบแจ้งหนี้ค่าน้ำ-ค่าไฟ-ค่าห้องพักใหม่",
                message: `คุณมีใบแจ้งหนี้ใหม่ (เลขอ้างอิง ${invoiceNumber}) สำหรับสัปดาห์ ${formData.billingWeek} ยอดส่วนตัวของคุณคือ ${individualAmount.toLocaleString()} บาท`,
                type: "bill",
                isRead: false,
                createdAt: new Date()
              } as any).catch(err => console.error("Notification failed for", student.id, err));
            });
        }
      });

      if (selectedBill) {
         const currentStudentIds = currentOccupants.map(s => s.id);
         const obsoletePayments = studentPayments.filter(p => p.billId === billId && !currentStudentIds.includes(p.studentId));
         for (const ob of obsoletePayments) {
            paymentPromises.push(studentPaymentService.delete(ob.id));
         }
      }
      await Promise.all(paymentPromises);

      showToast("บันทึกใบแจ้งหนี้และสร้างยอดชำระรายบุคคลสำเร็จ");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save utility bill:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBypassAndSave = async () => {
    setDuplicateWarning(null);
    setBypassDuplicate(true);
    setIsSaving(true);
    try {
      const occupantsCount = currentOccupants.length;
      const electricityUsage = Math.max(0, formData.currElectricMeter - formData.prevElectricMeter);
      const electricityCharge = electricityUsage * formData.electricRate;
      const totalAmount = formData.roomFee + formData.waterCharge + electricityCharge + formData.otherCharges;
      const individualAmount = occupantsCount > 0 ? totalAmount / occupantsCount : 0;
      const invoiceNumber = selectedBill?.invoiceNumber || `INV-${format(new Date(), "yyyyMMdd")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const billData: Omit<WeeklyBill, "id"> = {
        roomId: formData.roomId,
        invoiceNumber,
        billingWeek: formData.billingWeek,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        occupantsCount,
        waterUsage: occupantsCount,
        electricityUsage,
        roomFee: formData.roomFee,
        waterCharge: formData.waterCharge,
        electricityCharge,
        otherCharges: formData.otherCharges,
        totalAmount,
        dueDate: new Date(formData.dueDate),
        paymentStatus: "pending",
        prevElectricMeter: formData.prevElectricMeter,
        currElectricMeter: formData.currElectricMeter,
        electricRate: formData.electricRate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      let billId = selectedBill?.id;
      if (selectedBill) {
        await weeklyBillService.update(selectedBill.id, billData as any);
      } else {
        billId = (await weeklyBillService.create(billData as any)) as string;
      }
      
      const paymentPromises = currentOccupants.map(student => {
        const existingPayment = studentPayments.find(p => p.billId === billId && p.studentId === student.id);
        if (existingPayment) {
            return studentPaymentService.update(existingPayment.id, {
                roomId: formData.roomId,
                invoiceNumber,
                billingWeek: formData.billingWeek,
                roomFee: formData.roomFee / occupantsCount,
                waterCharge: formData.waterCharge / occupantsCount,
                electricityCharge: electricityCharge / occupantsCount,
                otherCharges: formData.otherCharges / occupantsCount,
                individualAmount,
                updatedAt: new Date()
            } as any);
        } else {
            const paymentData: Omit<StudentPayment, "id"> = {
              billId: billId!,
              studentId: student.id,
              roomId: formData.roomId,
              invoiceNumber,
              billingWeek: formData.billingWeek,
              roomFee: formData.roomFee / occupantsCount,
              waterCharge: formData.waterCharge / occupantsCount,
              electricityCharge: electricityCharge / occupantsCount,
              otherCharges: formData.otherCharges / occupantsCount,
              individualAmount,
              paymentStatus: "pending",
              createdAt: new Date(),
              updatedAt: new Date()
            };

            return studentPaymentService.create(paymentData as any).then(() => {
              return notificationService.create({
                userId: student.id,
                title: "ใบแจ้งหนี้ค่าน้ำ-ค่าไฟ-ค่าห้องพักใหม่",
                message: `คุณมีใบแจ้งหนี้ใหม่ (เลขอ้างอิง ${invoiceNumber}) สำหรับสัปดาห์ ${formData.billingWeek} ยอดส่วนตัวของคุณคือ ${individualAmount.toLocaleString()} บาท`,
                type: "bill",
                isRead: false,
                createdAt: new Date()
              } as any).catch(err => console.error("Notification failed for", student.id, err));
            });
        }
      });

      if (selectedBill) {
         const currentStudentIds = currentOccupants.map(s => s.id);
         const obsoletePayments = studentPayments.filter(p => p.billId === billId && !currentStudentIds.includes(p.studentId));
         for (const ob of obsoletePayments) {
            paymentPromises.push(studentPaymentService.delete(ob.id));
         }
      }
      await Promise.all(paymentPromises);

      showToast("บันทึกใบแจ้งหนี้และสร้างยอดชำระรายบุคคลสำเร็จ");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to save utility bill:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", "error");
    } finally {
      setIsSaving(false);
      setBypassDuplicate(false);
    }
  };

  const handleOpenDelete = (bill: WeeklyBill) => {
    setBillToDelete(bill);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    try {
      setLoading(true);
      
      // Also delete related student payments
      const relatedPayments = studentPayments.filter(p => p.billId === billToDelete.id);
      await Promise.all(relatedPayments.map(p => studentPaymentService.delete(p.id)));
      
      await weeklyBillService.delete(billToDelete.id);
      showToast("ลบใบแจ้งหนี้และข้อมูลการชำระเงินที่เกี่ยวข้องสำเร็จแล้ว");
    } catch (err: any) {
      console.error("Failed to delete bill:", err);
      showToast(err.message || "เกิดข้อผิดพลาดในการลบใบแจ้งหนี้", "error");
    } finally {
      setLoading(false);
      setBillToDelete(null);
    }
  };

  const handleViewSlip = async (bill: WeeklyBill) => {
    try {
      setSelectedBill(bill);
      const slips = await paymentSlipService.getAll();
      const billSlip = slips.find(s => s.billId === bill.id);
      if (billSlip) {
        setSelectedSlip(billSlip);
        setIsSlipModalOpen(true);
      } else {
        showToast("ยังไม่มีการอัปโหลดหลักฐานการชำระเงิน", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("ไม่สามารถโหลดหลักฐานการชำระเงินได้", "error");
    }
  };

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (!selectedSlip || !selectedBill) return;

    try {
      setIsSaving(true);
      await paymentSlipService.update(selectedSlip.id, {
        verificationStatus: status,
        verifiedAt: new Date(),
        adminRemark: remark
      });

      // Update room bill status
      await weeklyBillService.update(selectedBill.id, {
        paymentStatus: status === 'approved' ? 'paid' : 'rejected'
      });

      // Update all related student payments to match
      const relatedPayments = studentPayments.filter(p => p.billId === selectedBill.id);
      await Promise.all(relatedPayments.map(p => 
        studentPaymentService.update(p.id, {
          paymentStatus: status === 'approved' ? 'paid' : 'rejected'
        })
      ));

      // Notify all students
      await Promise.all(relatedPayments.map(p => 
        notificationService.create({
          userId: p.studentId,
          title: status === 'approved' ? "ชำระเงินสำเร็จ" : "การชำระเงินถูกปฏิเสธ",
          message: status === 'approved' 
            ? `การชำระเงินสำหรับห้องของคุณในสัปดาห์ ${selectedBill.billingWeek} ได้รับการอนุมัติแล้ว`
            : `การชำระเงินสำหรับห้องของคุณในสัปดาห์ ${selectedBill.billingWeek} ถูกปฏิเสธ: ${remark}`,
          type: status === 'approved' ? "approval" : "rejection",
          isRead: false,
          createdAt: new Date()
        } as any).catch(err => console.error("Notification failed", err))
      ));

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

  const computedElectricityUsage = Math.max(0, formData.currElectricMeter - formData.prevElectricMeter);
  const computedElectricityCharge = computedElectricityUsage * formData.electricRate;
  const computedWaterCharge = formData.waterCharge;
  const computedTotalAmount = computedWaterCharge + computedElectricityCharge;
  const computedIndividualAmount = currentOccupants.length > 0 ? computedTotalAmount / currentOccupants.length : 0;

  return (
    <div className="space-y-6">
      <DataTable
        title="Room Utility Billing"
        data={bills.map(b => {
          const room = rooms.find(r => r.id === b.roomId);
          const dormitory = dormitories.find(d => d.id === room?.dormitoryId);
          return {
            ...b,
            roomInfo: `${dormitory?.dormitoryName || ''} - ${room?.roomNumber || 'N/A'}`,
            location: `${room?.building || ''} ชั้น ${room?.floor || ''}`,
            occupants: `${b.occupantsCount} Students`,
            total: b.totalAmount.toLocaleString() + " ฿"
          };
        })}
        searchFields={["roomInfo", "billingWeek", "location"]}
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
            header: "Residence", 
            accessor: (item) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.roomInfo}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.location}</span>
              </div>
            )
          },
          { 
            header: "Occupancy", 
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="font-bold text-slate-700">{item.occupants}</span>
              </div>
            )
          },
          { 
            header: "Total Room Bill", 
            accessor: (item) => <span className="font-bold text-primary">{item.total}</span>
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
        ]}
        onAdd={handleOpenAdd}
        onEdit={(bill) => handleOpenEdit(bill as WeeklyBill)}
        onDelete={(bill) => handleOpenDelete(bill as WeeklyBill)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title="Issue New Room Invoice"
      >
        <form onSubmit={handleSave} className="space-y-6">
          {duplicateWarning && (
            <div className="p-5 bg-amber-50 text-amber-800 text-sm font-medium rounded-2xl border border-amber-200 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-500" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">Duplicate Utility Bill Warning</p>
                  <p className="text-xs leading-relaxed">{duplicateWarning}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={handleBypassAndSave}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-extrabold hover:bg-amber-700 transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
                >
                  Confirm & Create
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-extrabold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Room</label>
              <select
                required
                disabled={isSaving}
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="">-- Choose Room --</option>
                {rooms.map(r => {
                  const dorm = dormitories.find(d => d.id === r.dormitoryId);
                  return (
                    <option key={r.id} value={r.id}>{dorm?.dormitoryName} - {r.roomNumber} ({r.building})</option>
                  );
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Billing Cycle (Week)</label>
              <input
                type="week"
                required
                disabled={isSaving}
                value={formData.billingWeek}
                onChange={(e) => setFormData({ ...formData, billingWeek: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
              <input
                type="date"
                required
                disabled={isSaving}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
              <input
                type="date"
                required
                disabled={isSaving}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Due Date</label>
              <input
                type="date"
                required
                disabled={isSaving}
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Water Charge</label>
              <input
                type="number"
                required
                disabled={isSaving}
                value={formData.waterCharge}
                onChange={(e) => setFormData({ ...formData, waterCharge: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Electricity Metrics</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prev Meter</label>
                <input
                  type="number"
                  required
                  value={formData.prevElectricMeter}
                  onChange={(e) => setFormData({ ...formData, prevElectricMeter: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Curr Meter</label>
                <input
                  type="number"
                  required
                  value={formData.currElectricMeter}
                  onChange={(e) => setFormData({ ...formData, currElectricMeter: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate (฿/unit)</label>
                <input
                  type="number"
                  required
                  value={formData.electricRate}
                  onChange={(e) => setFormData({ ...formData, electricRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {currentOccupants.length > 0 && (
            <div className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Student Manifesto ({currentOccupants.length})</h4>
                </div>
                <div className="px-3 py-1 bg-primary/5 rounded-full text-[10px] font-bold text-primary border border-primary/10">
                   ฿{computedIndividualAmount.toLocaleString()} per student
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                {currentOccupants.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {student.fullName.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-700 leading-tight">{student.fullName}</span>
                      <span className="text-[9px] font-bold text-slate-400 leading-tight uppercase tracking-tighter">{student.studentId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 p-6 bg-primary-container/30 rounded-2xl border border-primary/10 shadow-sm shadow-primary/5">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-500">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Water Charge</span>
               </div>
               <span className="text-xs font-bold text-slate-900">฿{computedWaterCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-500">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Electricity Charge</span>
               </div>
               <span className="text-xs font-bold text-slate-900">฿{computedElectricityCharge.toLocaleString()}</span>
            </div>
            <div className="h-px bg-primary/10 my-1" />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Room Amount</h4>
                <p className="text-[9px] font-medium text-slate-400 mt-0.5">Automated Calculation Engine</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary tracking-tight">฿{computedTotalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4">
            <button type="button" disabled={isSaving} onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              {isSaving ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText className="h-4 w-4" />}
              {isSaving ? "Issuing..." : "Issue Invoices"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => !isSaving && setIsSlipModalOpen(false)}
        title="Payment Verification"
      >
        <div className="space-y-6">
          <div className="aspect-[4/5] w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
            {selectedSlip?.fileUrl ? (
              <AssetImage src={selectedSlip.fileUrl} alt="Payment Slip" className="w-full h-full object-contain" fallbackType="slip" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <XCircle className="h-10 w-10 mb-2 opacity-20" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">No Slip Uploaded</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Remarks</label>
            <textarea
              disabled={isSaving}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Internal notes or reason for rejection..."
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

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Void Invoice"
        message="Are you sure you want to void this invoice? This will also remove individual payment records for all occupants."
      />
    </div>
  );
}
