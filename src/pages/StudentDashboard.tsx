import { useEffect, useState } from "react";
import { studentService, roomService, dormitoryService, studentPaymentService, weeklyRoomAssignmentService, vanTripService, dutyScheduleService } from "../services/app.service";
import { Student, Room, Dormitory, StudentPayment, WeeklyRoomAssignment, VanTrip, DutySchedule } from "../types/app";
import { User, Home, Users, AlertCircle, Droplets, Zap, FileText, ArrowRight, Bus, MapPin, Clock, Calendar, Phone, Navigation } from "lucide-react";
import { startOfWeek, isWithinInterval, format, parseISO } from "date-fns";
import { CuteMedicalBadge, CuteEmptyState, CuteMedicalLoadingCard, CUTE_MEDICAL_IMAGES } from "../components/CuteMedicalIllustration";

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
  const [myTrips, setMyTrips] = useState<VanTrip[]>([]);
  const [myDuties, setMyDuties] = useState<DutySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let studentsUnsub = () => {};
    let roomsUnsub = () => {};
    let dormsUnsub = () => {};
    let billsUnsub = () => {};
    let assignmentsUnsub = () => {};
    let tripsUnsub = () => {};
    let dutiesUnsub = () => {};

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

    // Load Van Trips for this student
    tripsUnsub = vanTripService.onSnapshot([], (tripsList) => {
      const studentTrips = tripsList.filter(trip => 
        trip.studentIds?.includes(studentId)
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMyTrips(studentTrips);
    });

    // Load Duties
    dutiesUnsub = dutyScheduleService.onSnapshot([], (list) => {
      setMyDuties(list.filter(d => d.assignedStudents.includes(studentId) && d.status === 'Upcoming'));
    });

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
      tripsUnsub();
      dutiesUnsub();
      clearTimeout(timer);
    };
  }, []);

  // Default Fallbacks if Firestore is not fully seeded yet
  const displayStudent = student || {
    studentId: "6612001",
    fullName: "มินทรา รักษ์ดี",
    phone: "081-234-5678",
    status: "active" as "active" | "inactive"
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
      <div className="py-20">
        <CuteMedicalLoadingCard text="กำลังโหลดข้อมูลระบบนักศึกษาพยาบาล..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-medical-blue to-indigo-900 rounded-[40px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-medical-blue/20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-medical-teal/10 blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-50 border border-white/10 backdrop-blur-md">
              Student Portal • Institutional Access
            </div>
            <CuteMedicalBadge icon="heart" text="Nursing Student" variant="rose" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {displayStudent.fullName}
            </h1>
            <p className="text-sm sm:text-base text-blue-100/90 font-bold">
              Student ID: {displayStudent.studentId}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onChangeStudent}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-all cursor-pointer border border-white/20 shadow-xs"
            >
              Change Student / สลับบัญชีนักศึกษา
            </button>
          </div>
          <p className="text-sm text-blue-100/80 max-w-2xl leading-relaxed">
            Access your institutional profile, dormitory assignments, and manage utility transactions through this centralized clinical education portal.
          </p>
        </div>

        {/* Banner Character Thumbnail */}
        <div className="relative z-10 shrink-0 hidden sm:block">
          <div className="w-36 h-36 rounded-3xl p-1 bg-white/20 backdrop-blur-md border border-white/40 shadow-xl overflow-hidden flex items-center justify-center">
            <img 
              src={CUTE_MEDICAL_IMAGES.nurseDoctor}
              alt="Cute Nurse and Doctor"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
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

          {/* My Transportation Section */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-medical-orange/10 rounded-2xl flex items-center justify-center text-medical-orange">
                <Bus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Shuttle Service</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Assigned Shuttle Trips</p>
              </div>
            </div>

            {myTrips.length === 0 ? (
              <CuteEmptyState
                title="ไม่มีตารางรถตู้รับ-ส่งในขณะนี้"
                description="ติดต่อเจ้าหน้าที่หรือตรวจสอบตารางการฝึกปฏิบัติงานเพื่อดูข้อมูลเพิ่มเติม"
                className="py-8"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myTrips.map((trip) => {
                  return (
                    <div key={trip.id} className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-8 space-y-6 group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 text-blue-500`}>
                            {trip.status || 'Scheduled'} Trip
                          </span>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight">{trip.destination}</h4>
                          <span className="text-xs font-semibold text-slate-500 mt-1">{trip.date || (trip as any).tripDate}</span>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Navigation className="h-6 w-6" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <Bus className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Plate</span>
                            <span className="text-sm font-black text-slate-900">{trip.licensePlate || "N/A"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                          <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Details</span>
                            <span className="text-sm font-black text-slate-900">{trip.driverName || "Assigning..."}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-slate-50 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Departure</span>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-sm font-black text-slate-900">{trip.departureTime}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Return</span>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-sm font-black text-slate-900">{trip.returnTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Roommates list & Bills summary */}
        <div className="space-y-8">
          
          {/* Duty Schedule Summary */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Duty Schedule</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Next Assignment</p>
              </div>
            </div>

            {myDuties.length > 0 ? (
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{myDuties[0].dutyType}</p>
                    <p className="text-sm font-black text-slate-900">{format(parseISO(myDuties[0].dutyDate), 'EEEE, MMM do')}</p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{myDuties[0].dutyLocation}</span>
                </div>
                <div className="text-[10px] font-black text-slate-900 bg-white p-2 rounded-xl border border-slate-100 text-center">
                  {myDuties[0].startTime} - {myDuties[0].endTime}
                </div>
              </div>
            ) : (
              <CuteEmptyState
                title="ไม่มีเวรปฏิบัติงาน"
                description="ยังไม่มีตารางเวรที่ได้รับมอบหมายในขณะนี้"
                className="py-6 border-none bg-transparent shadow-none"
              />
            )}
            
            <button
              onClick={() => {}} // This will be handled by sidebar navigation
              className="w-full py-4 text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Full Schedule <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
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
              <div className="space-y-4">
                <CuteEmptyState
                  title="ไม่มีรายการค้างชำระ"
                  description="ยอดค่าใช้จ่ายสำหรับหอพักและสาธารณูปโภคเรียบร้อยแล้ว"
                  className="py-6 border-none bg-transparent shadow-none"
                />
                <button
                  onClick={onNavigateToBills}
                  className="w-full py-3 text-[10px] font-bold text-medical-blue bg-medical-blue/5 hover:bg-medical-blue/10 rounded-2xl uppercase tracking-widest transition-all cursor-pointer"
                >
                  ดูประวัติการชำระเงิน
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
