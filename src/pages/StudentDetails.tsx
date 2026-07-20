import { useState, useEffect } from "react";
import { studentService, roomService, weeklyBillService, vanTripService, subjectService, allocationService, vanService, studentPaymentService } from "../services/app.service";
import { Student, Room, WeeklyBill, VanTrip, Subject, Allocation, Van, StudentPayment } from "../types/app";
import { ArrowLeft, User, Home, Receipt, Bus, BookOpen, FileText, Plus, Trash2, Edit2, Eye } from "lucide-react";
import { Modal } from "../components/Modal";

export function StudentDetails({ studentId, onBack }: { studentId: string, onBack: () => void }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  
  const [roomAllocations, setRoomAllocations] = useState<Allocation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [trips, setTrips] = useState<VanTrip[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
  const [allocationFormData, setAllocationFormData] = useState({ roomId: "", startDate: "", endDate: "" });
  
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const s = await studentService.getById(studentId);
      setStudent(s);
      
      if (s) {
        if (s.subjectId) {
            const sub = await subjectService.getById(s.subjectId);
            setSubject(sub || null);
        }
        
        const allAllocations = await allocationService.getAll();
        setRoomAllocations(allAllocations.filter(a => a.studentId === studentId));
        
        const allRooms = await roomService.getAll();
        setRooms(allRooms);
        
        const allPayments = await studentPaymentService.getAll();
        setPayments(allPayments.filter(p => p.studentId === studentId));
        
        const allTrips = await vanTripService.getAll();
        setTrips(allTrips.filter(t => t.passengers.some(p => p.personId === studentId)));
        
        const allVans = await vanService.getAll();
        setVans(allVans);
      }
      setLoading(false);
    };
    fetchData();
  }, [studentId]);

  const handleSaveAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...allocationFormData, studentId, hospitalId: "", teacherId: "", vanId: "", createdAt: new Date(), updatedAt: new Date() };
    if (selectedAllocation) {
        await allocationService.update(selectedAllocation.id, data);
    } else {
        await allocationService.create(data as any);
    }
    setIsAllocationModalOpen(false);
    const all = await allocationService.getAll();
    setRoomAllocations(all.filter(a => a.studentId === studentId));
  };

  const deleteAllocation = async (id: string) => {
      await allocationService.delete(id);
      setRoomAllocations(prev => prev.filter(a => a.id !== id));
  };

  if (loading || !student) return <div>Loading...</div>;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "room", label: "Weekly Room", icon: Home },
    { id: "bills", label: "Utility Bills", icon: Receipt },
    { id: "trips", label: "Van Trips", icon: Bus },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "notes", label: "Notes", icon: FileText },
  ];

  return (
    <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 font-bold text-sm"><ArrowLeft className="w-4 h-4"/> ย้อนกลับ</button>
        <div className="flex items-center gap-4">
            <div className="bg-red-100 p-4 rounded-full"><User className="w-8 h-8 text-red-600"/></div>
            <div>
                <h1 className="text-2xl font-black text-zinc-900">{student.fullName}</h1>
                <p className="text-zinc-500 font-bold text-sm">{student.studentId} | ชั้นปี {student.yearLevel} | กลุ่ม {student.classGroup}</p>
            </div>
        </div>
        <div className="flex border-b border-slate-100">
            {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-3 font-bold text-sm flex items-center gap-2 ${activeTab === tab.id ? 'border-b-2 border-red-600 text-red-600' : 'text-zinc-500'}`}>
                    <tab.icon className="w-4 h-4"/> {tab.label}
                </button>
            ))}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100">
            {activeTab === 'profile' && (
                <div className="space-y-4">
                    <p>ชื่อ: {student.firstName} {student.lastName}</p>
                    <p>รหัสนักศึกษา: {student.studentId}</p>
                    <p>เบอร์โทร: {student.phone}</p>
                    <p>สถานะ: {student.status}</p>
                </div>
            )}
            {activeTab === 'room' && (
                <div className="space-y-4">
                    <button onClick={() => { setSelectedAllocation(null); setAllocationFormData({ roomId: "", startDate: "", endDate: "" }); setIsAllocationModalOpen(true); }} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold"><Plus className="w-4 h-4"/> เพิ่มห้อง</button>
                    <table className="w-full text-sm">
                        <thead><tr><th>อาคาร</th><th>ห้อง</th><th>เริ่ม</th><th>สิ้นสุด</th><th>สถานะ</th><th></th></tr></thead>
                        <tbody>
                            {roomAllocations.map(a => {
                                const room = rooms.find(r => r.id === a.roomId);
                                const start = new Date(a.startDate);
                                const end = new Date(a.endDate);
                                const now = new Date();
                                const status = now < start ? "ยังไม่เริ่ม" : now > end ? "สิ้นสุด" : "กำลังใช้งาน";
                                return (
                                    <tr key={a.id}>
                                        <td>{room?.building || "-"}</td>
                                        <td>{room?.roomNumber || "-"}</td>
                                        <td>{start.toLocaleDateString()}</td>
                                        <td>{end.toLocaleDateString()}</td>
                                        <td>{status}</td>
                                        <td className="flex gap-2">
                                            <button onClick={() => { setSelectedAllocation(a); setAllocationFormData({ roomId: a.roomId, startDate: a.startDate, endDate: a.endDate }); setIsAllocationModalOpen(true); }}><Edit2 className="w-4 h-4"/></button>
                                            <button onClick={() => deleteAllocation(a.id)}><Trash2 className="w-4 h-4 text-red-500"/></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'bills' && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs font-black text-zinc-500 uppercase">
                            <th className="p-2">สัปดาห์</th>
                            <th className="p-2">ยอดของคุณ</th>
                            <th className="p-2">สถานะ</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id} className="border-t border-slate-100">
                                <td className="p-2">{p.billingWeek}</td>
                                <td className="p-2 font-black text-red-600">{p.individualAmount}</td>
                                <td className="p-2">{p.paymentStatus}</td>
                                <td className="p-2">
                                    <button onClick={() => { setSelectedPayment(p); setIsBillModalOpen(true); }}><Eye className="w-4 h-4 text-blue-500"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {activeTab === 'trips' && (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-xs font-black text-zinc-500 uppercase">
                            <th className="p-2">วันที่</th>
                            <th className="p-2">จุดหมาย</th>
                            <th className="p-2">เรื่อง</th>
                            <th className="p-2">รถตู้</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trips.map(t => {
                            const van = vans.find(v => v.id === t.vanId);
                            return (
                                <tr key={t.id} className="border-t border-slate-100">
                                    <td className="p-2">{t.tripDate}</td>
                                    <td className="p-2">{t.destination}</td>
                                    <td className="p-2">{t.subject}</td>
                                    <td className="p-2">{van?.plateNumber || "-"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
            {activeTab === 'subjects' && (
                subject ? <div>วิชา: {subject.subjectName} ({subject.subjectCode})</div> : <p>ไม่พบข้อมูลวิชา</p>
            )}
            {activeTab === 'notes' && (
                <textarea className="w-full h-32 border rounded-lg p-2" value={student.notes || ""} onChange={async (e) => {
                    const newNotes = e.target.value;
                    setStudent({...student, notes: newNotes});
                    await studentService.update(student.id, {...student, notes: newNotes});
                }}/>
            )}
        </div>
        <Modal isOpen={isAllocationModalOpen} onClose={() => setIsAllocationModalOpen(false)} title={selectedAllocation ? "แก้ไขการจองห้อง" : "เพิ่มการจองห้อง"}>
            <form onSubmit={handleSaveAllocation} className="space-y-4">
                <select required value={allocationFormData.roomId} onChange={e => setAllocationFormData({...allocationFormData, roomId: e.target.value})} className="w-full p-2 border rounded">
                    <option value="">เลือกห้อง...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.building} - {r.roomNumber}</option>)}
                </select>
                <input type="date" required value={allocationFormData.startDate} onChange={e => setAllocationFormData({...allocationFormData, startDate: e.target.value})} className="w-full p-2 border rounded"/>
                <input type="date" required value={allocationFormData.endDate} onChange={e => setAllocationFormData({...allocationFormData, endDate: e.target.value})} className="w-full p-2 border rounded"/>
                <button type="submit" className="w-full bg-red-600 text-white p-2 rounded">บันทึก</button>
            </form>
        </Modal>

        <Modal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)} title="รายละเอียดการชำระเงินรายบุคคล">
            {selectedPayment && (
                <div className="space-y-3 text-sm">
                    <p><span className="font-bold">สัปดาห์:</span> {selectedPayment.billingWeek}</p>
                    <p className="border-t pt-2 font-black text-red-600"><span className="text-zinc-900">ยอดที่ต้องจ่าย:</span> {selectedPayment.individualAmount}</p>
                    <p><span className="font-bold">สถานะ:</span> {selectedPayment.paymentStatus}</p>
                </div>
            )}
        </Modal>
    </div>
  );
}
