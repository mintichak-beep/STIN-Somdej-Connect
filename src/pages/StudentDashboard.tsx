import { useEffect, useState } from "react";
import { studentService, roomService, dormitoryService, weeklyBillService, studentPaymentService, weeklyRoomAssignmentService } from "../services/app.service";
import { Student, Room, Dormitory, WeeklyBill, StudentPayment, WeeklyRoomAssignment } from "../types/app";
import { User, Home, Users, AlertCircle, Droplets, Zap, FileText, ArrowRight } from "lucide-react";
import { startOfWeek, isWithinInterval } from "date-fns";

interface StudentDashboardProps {
  onNavigateToBills: () => void;
  studentId: string;
  onChangeStudent: () => void;
}

export function StudentDashboard({ onNavigateToBills, studentId, onChangeStudent }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [dormitory, setDormitory] = useState<Dormitory | null>(null);
  const [roommates, setRoommates] = useState<Student[]>([]);
  const [latestPayment, setLatestPayment] = useState<StudentPayment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let studentsUnsub = () => {};
    let roomsUnsub = () => {};
    let dormsUnsub = () => {};
    let billsUnsub = () => {};
    let assignmentsUnsub = () => {};

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    // Load Student
    studentsUnsub = studentService.onSnapshot([], (studentsList) => {
      const currentStudent = studentsList.find(s => s.id === studentId);
      if (currentStudent) {
        setStudent(currentStudent);
        // ... (rest of the logic remains the same, but using currentStudent.id)
        assignmentsUnsub = weeklyRoomAssignmentService.onSnapshot([], (assignments) => {
          const myAssignment = assignments.find(a => 
            a.studentId === currentStudent.id && 
            a.status === 'active' &&
            isWithinInterval(weekStart, { 
              start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
              end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
            })
          );

          if (myAssignment) {
            roomsUnsub = roomService.onSnapshot([], (roomsList) => {
              const currentRoom = roomsList.find(r => r.id === myAssignment.roomId);
              if (currentRoom) {
                setRoom(currentRoom);
                
                dormsUnsub = dormitoryService.onSnapshot([], (dormsList) => {
                  const currentDorm = dormsList.find(d => d.id === currentRoom.dormitoryId);
                  if (currentDorm) {
                    setDormitory(currentDorm);
                  }
                });

                const roommateAssignments = assignments.filter(a => 
                  a.roomId === myAssignment.roomId && 
                  a.studentId !== currentStudent.id &&
                  a.status === 'active' &&
                  isWithinInterval(weekStart, { 
                    start: a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate), 
                    end: a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate) 
                  })
                );

                const mates = studentsList.filter(s => roommateAssignments.some(ra => ra.studentId === s.id));
                setRoommates(mates);
              }
            });
          }
        });
      }
    });

    // Load Latest Payment
    billsUnsub = studentPaymentService.onSnapshot([], (paymentsList) => {
      const studentPayments = paymentsList.filter(p => p.studentId === studentId);
      if (studentPayments.length > 0) {
        const sorted = studentPayments.sort((a, b) => b.billingWeek.localeCompare(a.billingWeek));
        setLatestPayment(sorted[0]);
      }
    });
    // ...

    // Set loading to false after a slight timeout to ensure snapshots register
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      studentsUnsub();
      roomsUnsub();
      dormsUnsub();
      billsUnsub();
      assignmentsUnsub();
      clearTimeout(timer);
    };
  }, []);

  // Default Fallbacks if Firestore is not fully seeded yet
  const displayStudent = student || {
    studentId: "6612001",
    fullName: "มินทรา รักษ์ดี",
    yearLevel: "2",
    classGroup: "กลุ่ม A",
    phone: "081-234-5678",
    status: "active"
  };

  const displayDorm = dormitory?.dormitoryName || "หอพักหญิง 1 (เรือนรักกัลยา)";
  const displayRoom = room || {
    roomNumber: "101",
    building: "ตึก A",
    floor: "1",
    capacity: 4
  };

  const displayRoommates = roommates.length > 0 ? roommates : [
    { id: "stud-2", studentId: "6612002", fullName: "ณิชา แก้วมณี" },
    { id: "stud-3", studentId: "6612003", fullName: "สิริมา ใจใส" }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
        <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">กำลังโหลดข้อมูลระบบนักศึกษา...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-medical-blue rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-medical-blue/20">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-medical-teal/10 blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-50 border border-white/10 backdrop-blur-md">
            Student Portal • Institutional Access
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {displayStudent.fullName}
            </h1>
            <p className="text-sm sm:text-base text-blue-100/80 font-medium">
              ID: {displayStudent.studentId} • Year {displayStudent.yearLevel} {displayStudent.classGroup} • Nursing Major
            </p>
          </div>
          <button 
            onClick={onChangeStudent}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all cursor-pointer border border-white/10"
          >
            Change Student
          </button>
          <p className="text-sm text-blue-100/60 max-w-2xl leading-relaxed">
            Access your institutional profile, dormitory assignments, and manage utility transactions through this centralized clinical education portal.
          </p>
        </div>
      </div>

      {/* Info Warning banner */}
      <div className="rounded-[32px] bg-white border border-slate-100 p-8 text-slate-600 shadow-sm flex items-start gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-2 h-full bg-medical-orange/40" />
        <div className="bg-medical-orange/10 p-3 rounded-2xl text-medical-orange">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-900">Administrative Notice: Profile Synchronization</h4>
          <p className="text-xs font-medium leading-relaxed text-slate-400">
            Personal data and residential allocations are synchronized with the central STIN administrative ledger. Discrepancies should be reported to the Dormitory Administration Office.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card & Roommates */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info section */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-medical-blue/10 rounded-2xl flex items-center justify-center text-medical-blue">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Institutional Profile</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authenticated Identity Details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">{displayStudent.fullName}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Student Identifier</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-mono text-sm font-bold text-slate-700">{displayStudent.studentId}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Program</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">Bachelor of Nursing (STIN)</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Protocol</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">{displayStudent.phone || "Not Registered"}</div>
              </div>
            </div>
          </div>

          {/* Dormitory Details Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-medical-teal/10 rounded-2xl flex items-center justify-center text-medical-teal">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Residential Allocation</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Campus Housing Details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Facility Name</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">{displayDorm}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-medical-blue uppercase tracking-widest ml-1">Unit Number</span>
                <div className="p-5 bg-medical-blue/5 rounded-2xl border border-medical-blue/10 font-bold text-medical-blue text-center text-lg">Room {displayRoom.roomNumber}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Building Wing</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">{displayRoom.building}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Floor Level</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">Level {displayRoom.floor}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Capacity</span>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-50 font-bold text-slate-700">{displayRoom.capacity} Beds</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Roommates list & Bills summary */}
        <div className="space-y-8">
          
          {/* Roommates Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-medical-green/10 rounded-xl flex items-center justify-center text-medical-green">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Co-Residents</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shared Unit Occupants</p>
              </div>
            </div>

            <div className="space-y-4">
              {displayRoommates.map((mate) => (
                <div key={mate.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 text-medical-blue font-bold text-sm flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {mate.fullName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{mate.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest font-mono">{mate.studentId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Utility Bill Summary Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-medical-red/10 rounded-xl flex items-center justify-center text-medical-red">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Financial Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Individual Payment</p>
              </div>
            </div>

            {latestPayment ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cycle Week</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{latestPayment.billingWeek}</span>
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Your share of room utilities</p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount Due</span>
                  <span className="text-xl font-bold text-medical-red">฿{latestPayment.individualAmount.toLocaleString()}</span>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <div className={`px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border text-center transition-all ${
                    latestPayment.paymentStatus === 'paid' ? 'bg-medical-green/10 text-medical-green border-medical-green/10' :
                    latestPayment.paymentStatus === 'waiting_verification' ? 'bg-medical-orange/10 text-medical-orange border-medical-orange/10 animate-pulse' :
                    latestPayment.paymentStatus === 'rejected' ? 'bg-medical-red/10 text-medical-red border-medical-red/10' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {latestPayment.paymentStatus === 'paid' ? 'Verified & Paid' : 
                     latestPayment.paymentStatus === 'waiting_verification' ? 'Audit in Progress' :
                     latestPayment.paymentStatus === 'rejected' ? 'Slip Rejected' : 'Payment Pending'}
                  </div>

                  <button
                    onClick={onNavigateToBills}
                    className="w-full py-4 text-[10px] font-bold text-medical-blue bg-medical-blue/5 hover:bg-medical-blue/10 rounded-2xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Manage Transactions <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Invoices</p>
                  <p className="text-[10px] text-slate-300 font-medium">Utility ledger for this unit is currently clear.</p>
                </div>
                <button
                  onClick={onNavigateToBills}
                  className="w-full py-4 text-[10px] font-bold text-medical-blue bg-medical-blue/5 hover:bg-medical-blue/10 rounded-2xl uppercase tracking-widest transition-all cursor-pointer"
                >
                  View History
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
