import { useState, useEffect } from "react";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { weeklyBillService, roomService, studentService, paymentSlipService, notificationService, dormitoryService } from "../services/app.service";
import { WeeklyBill, Room, Student, PaymentSlip, Dormitory } from "../types/app";
import { Droplets, Zap, Plus, CheckCircle, XCircle, Eye, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export function UtilityBilling() {
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<WeeklyBill | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");

  const [formData, setFormData] = useState({
    roomId: "",
    studentId: "",
    billingWeek: "",
    startDate: "",
    endDate: "",
    waterUsage: 0,
    electricityUsage: 0,
    waterCharge: 0,
    electricityCharge: 0,
    otherCharges: 0,
    dueDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [billsData, roomsData, studentsData, dormsData] = await Promise.all([
      weeklyBillService.getAll(),
      roomService.getAll(),
      studentService.getAll(),
      dormitoryService.getAll()
    ]);
    setBills(billsData);
    setRooms(roomsData);
    setStudents(studentsData);
    setDormitories(dormsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      roomId: "",
      studentId: "",
      billingWeek: format(new Date(), "yyyy-'W'ww"),
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
      waterUsage: 0,
      electricityUsage: 0,
      waterCharge: 0,
      electricityCharge: 0,
      otherCharges: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = formData.waterCharge + formData.electricityCharge + (formData.otherCharges || 0);
    const billData: Omit<WeeklyBill, "id"> = {
      ...formData,
      totalAmount,
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await weeklyBillService.create(billData as any);
    
    // Notify student
    await notificationService.create({
      userId: formData.studentId,
      title: "ใบแจ้งหนี้ค่าน้ำ-ค่าไฟใหม่",
      message: `คุณมีใบแจ้งหนี้ใหม่สำหรับสัปดาห์ ${formData.billingWeek} จำนวน ${totalAmount} บาท`,
      type: "bill",
      isRead: false,
      createdAt: new Date()
    } as any);

    setIsModalOpen(false);
    fetchData();
  };

  const handleViewSlip = async (bill: WeeklyBill) => {
    setSelectedBill(bill);
    const slips = await paymentSlipService.getAll();
    const billSlip = slips.find(s => s.billId === bill.id);
    if (billSlip) {
      setSelectedSlip(billSlip);
      setIsSlipModalOpen(true);
    } else {
      alert("ยังไม่มีการอัปโหลดหลักฐานการชำระเงิน");
    }
  };

  const handleVerify = async (status: 'approved' | 'rejected') => {
    if (!selectedSlip || !selectedBill) return;

    await paymentSlipService.update(selectedSlip.id, {
      verificationStatus: status,
      verifiedAt: new Date(),
      adminRemark: remark
    });

    await weeklyBillService.update(selectedBill.id, {
      paymentStatus: status === 'approved' ? 'paid' : 'rejected'
    });

    // Notify student
    await notificationService.create({
      userId: selectedBill.studentId,
      title: status === 'approved' ? "ชำระเงินสำเร็จ" : "การชำระเงินถูกปฏิเสธ",
      message: status === 'approved' 
        ? `การชำระเงินสำหรับสัปดาห์ ${selectedBill.billingWeek} ได้รับการอนุมัติแล้ว`
        : `การชำระเงินสำหรับสัปดาห์ ${selectedBill.billingWeek} ถูกปฏิเสธ: ${remark}`,
      type: status === 'approved' ? "approval" : "rejection",
      isRead: false,
      createdAt: new Date()
    } as any);

    setIsSlipModalOpen(false);
    setRemark("");
    fetchData();
  };

  return (
    <div className="space-y-6">
      <DataTable
        title="จัดการค่าน้ำ-ค่าไฟรายสัปดาห์"
        data={bills.map(b => {
          const room = rooms.find(r => r.id === b.roomId);
          const dormitory = dormitories.find(d => d.id === room?.dormitoryId);
          return {
            ...b,
            roomInfo: `${dormitory?.dormitoryName || ''} - ${room?.roomNumber || 'N/A'}`,
            location: `${room?.building || ''} ชั้น ${room?.floor || ''}`,
            studentName: students.find(s => s.id === b.studentId)?.fullName || "N/A",
            total: b.totalAmount.toLocaleString() + " ฿"
          };
        })}
        searchFields={["roomInfo", "studentName", "billingWeek", "location"]}
        columns={[
          { header: "สัปดาห์", accessor: "billingWeek" },
          { header: "หอพัก/ห้อง", accessor: "roomInfo" },
          { header: "อาคาร/ชั้น", accessor: "location" },
          { header: "นักศึกษา", accessor: "studentName" },
          { header: "ยอดรวม", accessor: "total" },
          { 
            header: "สถานะ", 
            accessor: (item) => (
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                item.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                item.paymentStatus === 'waiting_verification' ? 'bg-amber-100 text-amber-700' :
                item.paymentStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-zinc-100 text-zinc-700'
              }`}>
                {item.paymentStatus === 'paid' ? 'ชำระแล้ว' : 
                 item.paymentStatus === 'waiting_verification' ? 'รอตรวจสอบ' :
                 item.paymentStatus === 'rejected' ? 'ปฏิเสธ' : 'รอดำเนินการ'}
              </span>
            )
          },
        ]}
        onAdd={handleOpenAdd}
        onEdit={(bill) => handleViewSlip(bill as WeeklyBill)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ออกใบแจ้งหนี้รายสัปดาห์"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">ห้องพัก</label>
              <select
                required
                value={formData.roomId}
                onChange={(e) => {
                  const room = rooms.find(r => r.id === e.target.value);
                  setFormData({ ...formData, roomId: e.target.value, studentId: room?.studentId || "" });
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              >
                <option value="">เลือกห้อง...</option>
                {rooms.filter(r => r.studentId).map(r => (
                  <option key={r.id} value={r.id}>{r.roomNumber}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">นักศึกษา</label>
              <input
                disabled
                value={students.find(s => s.id === formData.studentId)?.fullName || ""}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border-none rounded-xl text-sm font-bold opacity-70"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">สัปดาห์ที่</label>
              <input
                type="week"
                required
                value={formData.billingWeek}
                onChange={(e) => setFormData({ ...formData, billingWeek: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">วันครบกำหนด</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-zinc-800 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Droplets className="h-3 w-3 text-red-500" /> ค่าน้ำ
              </label>
              <input
                type="number"
                required
                value={formData.waterCharge}
                onChange={(e) => setFormData({ ...formData, waterCharge: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Zap className="h-3 w-3 text-red-500" /> ค่าไฟ
              </label>
              <input
                type="number"
                required
                value={formData.electricityCharge}
                onChange={(e) => setFormData({ ...formData, electricityCharge: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-sm font-black text-zinc-500">ยกเลิก</button>
            <button type="submit" className="px-6 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl shadow-sm shadow-red-100">บันทึก</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        title="ตรวจสอบหลักฐานการชำระเงิน"
      >
        <div className="space-y-6">
          <div className="aspect-[3/4] w-full bg-slate-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800">
            {selectedSlip?.fileUrl ? (
              <img src={selectedSlip.fileUrl} alt="Payment Slip" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">ไม่พบไฟล์</div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">หมายเหตุ/เหตุผลที่ปฏิเสธ</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="ระบุหมายเหตุหากมีการปฏิเสธการชำระเงิน..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-red-600/20 transition-all min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => handleVerify('rejected')}
              className="flex-1 px-6 py-3 text-sm font-black text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800"
            >
              ปฏิเสธ
            </button>
            <button 
              onClick={() => handleVerify('approved')}
              className="flex-1 px-6 py-3 text-sm font-black text-white bg-green-600 rounded-xl shadow-sm shadow-green-100"
            >
              อนุมัติ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
