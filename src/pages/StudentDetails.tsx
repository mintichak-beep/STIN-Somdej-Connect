import { useState, useEffect } from "react";
import { studentService, roomService, weeklyBillService, vanTripService, subjectService, allocationService, vanService, studentPaymentService, weeklyRoomAssignmentService } from "../services/app.service";
import { Student, Room, WeeklyBill, VanTrip, Subject, Allocation, Van, StudentPayment, WeeklyRoomAssignment } from "../types/app";
import { ArrowLeft, User, Home, Receipt, Bus, BookOpen, FileText, Plus, Trash2, Edit2, Eye, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { Modal } from "../components/Modal";

export function StudentDetails({ studentId, onBack }: { studentId: string, onBack: () => void }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  
  const [roomAllocations, setRoomAllocations] = useState<WeeklyRoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
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
        
        const allAllocations = await weeklyRoomAssignmentService.getAll();
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
    const data = { 
      ...allocationFormData, 
      studentId, 
      status: 'active' as const,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    if (selectedAllocation) {
        await weeklyRoomAssignmentService.update(selectedAllocation.id, data);
    } else {
        await weeklyRoomAssignmentService.create(data as any);
    }
    setIsAllocationModalOpen(false);
    const all = await weeklyRoomAssignmentService.getAll();
    setRoomAllocations(all.filter(a => a.studentId === studentId));
  };

  const deleteAllocation = async (id: string) => {
      await weeklyRoomAssignmentService.delete(id);
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
                <p className="text-zinc-500 font-bold text-sm">{student.studentId}</p>
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
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-black text-zinc-900">Room Assignments</h3>
                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2 px-3">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Week</span>
                            </div>
                            <input 
                                type="date"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-900 outline-none pr-4"
                            />
                        </div>
                    </div>

                    <div className="md-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="p-4">Dormitory / Room</th>
                                    <th className="p-4">Period</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomAllocations.map(a => {
                                    const room = rooms.find(r => r.id === a.roomId);
                                    const start = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
                                    const end = a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate);
                                    const weekStart = parseISO(selectedWeek);
                                    const isCurrent = isWithinInterval(weekStart, { start, end });
                                    
                                    return (
                                        <tr key={a.id} className={`border-t border-slate-100 ${isCurrent ? 'bg-primary/5' : ''}`}>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-900">Room {room?.roomNumber || "-"}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{room?.building || "-"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {format(start, 'dd/MM/yyyy')} - {format(end, 'dd/MM/yyyy')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                                                    {isCurrent ? "Current Week" : "Other Week"}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => { 
                                                        setSelectedAllocation(a as any); 
                                                        setAllocationFormData({ 
                                                            roomId: a.roomId, 
                                                            startDate: format(start, 'yyyy-MM-dd'), 
                                                            endDate: format(end, 'yyyy-MM-dd') 
                                                        }); 
                                                        setIsAllocationModalOpen(true); 
                                                    }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                                                    <button onClick={() => deleteAllocation(a.id)} className="p-2 text-medical-red hover:bg-medical-red/5 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {roomAllocations.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            No room assignments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={() => { 
                        setSelectedAllocation(null); 
                        setAllocationFormData({ 
                            roomId: "", 
                            startDate: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), 
                            endDate: format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd') 
                        }); 
                        setIsAllocationModalOpen(true); 
                    }} className="md-button-filled flex items-center gap-3 py-3 px-6"><Plus className="w-4 h-4"/> Add Assignment</button>
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
