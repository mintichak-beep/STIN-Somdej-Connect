import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getDb } from '../firebase/firebase';
import { Student, Hospital, Room, Announcement, Trip, PracticeSchedule } from '../types/db';
import { 
  User, BookOpen, Calendar, MapPin, Home, Users, 
  Truck, Bell, AlertTriangle, ArrowLeft, Building2, Clock
} from 'lucide-react';

export function StudentProfile() {
  const [searchParams] = useSearchParams();
  const studentDocId = searchParams.get('id');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [student, setStudent] = useState<Student | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [roommates, setRoommates] = useState<Student[]>([]);
  const [assignedTrips, setAssignedTrips] = useState<Trip[]>([]);
  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (!studentDocId) {
      setError('ไม่พบรหัสนักศึกษาในลิงก์ กรุณากลับไปค้นหาอีกครั้ง');
      setLoading(false);
      return;
    }

    async function loadStudentData() {
      setLoading(true);
      setError(null);
      const db = getDb();

      try {
        // 1. Fetch Student Doc
        const studentRef = doc(db, 'students', studentDocId);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          setError('ไม่พบประวัตินักศึกษาในระบบ กรุณาตรวจสอบรหัสนักศึกษาอีกครั้ง');
          setLoading(false);
          return;
        }

        const studentData = { id: studentSnap.id, ...studentSnap.data() } as Student;
        setStudent(studentData);

        // 2. Fetch Hospital Details if hospitalId exists, or fallback to name
        if (studentData.hospitalId) {
          const hospRef = doc(db, 'hospitals', studentData.hospitalId);
          const hospSnap = await getDoc(hospRef);
          if (hospSnap.exists()) {
            setHospital({ id: hospSnap.id, ...hospSnap.data() } as Hospital);
          }
        } else if (studentData.hospital) {
          // Fallback: search hospital by name
          const hospQuery = query(collection(db, 'hospitals'), where('name', '==', studentData.hospital), limit(1));
          const hospSnap = await getDocs(hospQuery);
          if (!hospSnap.empty) {
            setHospital({ id: hospSnap.docs[0].id, ...hospSnap.docs[0].data() } as Hospital);
          }
        }

        // 3. Fetch Room & Roommates
        const targetRoomId = studentData.roomId;
        if (targetRoomId) {
          const roomRef = doc(db, 'rooms', targetRoomId);
          const roomSnap = await getDoc(roomRef);
          if (roomSnap.exists()) {
            setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
          }

          // Fetch roommate list sharing same roomId
          const roommatesQuery = query(
            collection(db, 'students'),
            where('roomId', '==', targetRoomId)
          );
          const roommatesSnap = await getDocs(roommatesQuery);
          const list: Student[] = [];
          roommatesSnap.forEach((d) => {
            const data = { id: d.id, ...d.data() } as Student;
            if (data.studentId !== studentData.studentId) {
              list.push(data);
            }
          });
          setRoommates(list);
        }

        // 4. Fetch Practice Schedules
        const scheduleQuery = query(collection(db, 'practiceSchedules'));
        const scheduleSnap = await getDocs(scheduleQuery);
        const schedList: PracticeSchedule[] = [];
        scheduleSnap.forEach((d) => {
          const data = { id: d.id, ...d.data() } as PracticeSchedule;
          // Filter dynamically based on course or group or hospital
          if (
            (studentData.courseId && data.courseId === studentData.courseId) ||
            (studentData.practiceGroupId && data.practiceGroupId === studentData.practiceGroupId) ||
            (studentData.hospitalId && data.hospitalId === studentData.hospitalId)
          ) {
            schedList.push(data);
          }
        });
        setSchedules(schedList);

        // 5. Fetch Transportation Trips
        const tripQuery = query(collection(db, 'trips'));
        const tripSnap = await getDocs(tripQuery);
        const matchedTrips: Trip[] = [];
        tripSnap.forEach((d) => {
          const t = { id: d.id, ...d.data() } as Trip;
          if (t.assignedStudents?.includes(studentData.studentId) || t.assignedStudents?.includes(studentData.id)) {
            matchedTrips.push(t);
          }
        });
        setAssignedTrips(matchedTrips);

        // 6. Fetch Targeted Announcements
        const annQuery = query(collection(db, 'announcements'));
        const annSnap = await getDocs(annQuery);
        const annList: Announcement[] = [];
        annSnap.forEach((d) => {
          const ann = { id: d.id, ...d.data() } as Announcement;
          if (
            ann.targetType === 'all' ||
            (ann.targetType === 'student' && ann.targetId === studentData.studentId) ||
            (ann.targetType === 'course' && ann.targetId === studentData.courseId) ||
            (ann.targetType === 'hospital' && ann.targetId === studentData.hospitalId)
          ) {
            annList.push(ann);
          }
        });
        setAnnouncements(annList);

      } catch (err: any) {
        console.error('Error fetching student details:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลนักศึกษา กรุณาติดต่ออาจารย์ผู้ควบคุมระบบ');
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [studentDocId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-gray-500">กำลังดึงข้อมูลนักศึกษา...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 p-6">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800 text-center space-y-6 shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">ไม่สำเร็จ (Load Failed)</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{error || 'ไม่พบข้อมูลนักศึกษา'}</p>
          <button
            onClick={() => navigate('/student')}
            className="inline-flex items-center gap-2 justify-center py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปค้นหาใหม่
          </button>
        </div>
      </div>
    );
  }

  // Formatting helper
  const getFullName = () => {
    if (student.fullName) return student.fullName;
    if (student.firstName || student.lastName) return `${student.firstName || ''} ${student.lastName || ''}`.trim();
    return student.studentName || 'ไม่ระบุชื่อ';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-50 transition-colors duration-300 pb-16">
      {/* Dynamic Student Banner */}
      <header className="bg-gradient-to-r from-red-700 via-red-800 to-red-950 text-white py-10 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/5 blur-3xl"></div>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white border border-white/25">
              <User className="h-9 w-9" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block text-red-100 tracking-wider">
                รหัสนักศึกษา: {student.studentId}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {getFullName()}
              </h1>
              <p className="text-sm text-red-200">
                สถาบันการพยาบาลศรีสวรินทิรา สภากาชาดไทย
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/student')}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            ค้นหารหัสอื่น (New Search)
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Read-Only Banner Warning */}
        <div className="mb-8 rounded-xl bg-amber-50 border border-amber-200 p-4 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-xs sm:text-sm font-medium">
            <strong>โหมดอ่านอย่างเดียว (Read Only Access)</strong> ข้อมูลนี้จัดสรรโดยตรงโดยคณาจารย์ผู้ควบคุม หากพบข้อมูลคลาดเคลื่อน กรุณาแจ้งฝ่ายฝึกปฏิบัติทางคลินิก
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: General Info & Placements */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General & Academy Status */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <BookOpen className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold">ข้อมูลการศึกษาทั่วไป (Educational Status)</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">ชั้นปีการศึกษา (Year Level)</p>
                  <p className="font-bold text-gray-800 dark:text-zinc-200 text-base">{student.yearLevel || student.academicYear || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">กลุ่มเรียน (Section)</p>
                  <p className="font-bold text-gray-800 dark:text-zinc-200 text-base">{student.section || 'กลุ่ม A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">หลักสูตร (Program / Course)</p>
                  <p className="font-bold text-gray-800 dark:text-zinc-200 text-base">{student.program || 'พยาบาลศาสตรบัณฑิต'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">เบอร์โทรศัพท์ (Contact Phone)</p>
                  <p className="font-bold text-gray-800 dark:text-zinc-200 text-base">{student.phone || '-'}</p>
                </div>
              </div>
            </section>

            {/* Clinical Site and Ward Allocation */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold">สถานที่ฝึกและตารางปฏิบัติงาน (Clinical Placement)</h2>
              </div>

              <div className="space-y-6">
                {/* Hospital Card details */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">โรงพยาบาลแหล่งฝึกหลัก (Hospital Affiliate)</p>
                    <p className="font-bold text-gray-800 dark:text-zinc-200 text-lg">
                      {hospital ? hospital.name : student.hospital || 'รพ. สมเด็จพระบรมราชเทวี ณ ศรีราชา'}
                    </p>
                    {hospital?.address && (
                      <p className="text-xs text-gray-500">{hospital.address} จ. {hospital.province}</p>
                    )}
                  </div>
                </div>

                {/* Ward and Practice schedules */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    ตารางเวรและกลุ่มงานคลินิก (Rotations & Schedules)
                  </h3>

                  {schedules.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 dark:bg-zinc-950/20">
                      ไม่มีตารางฝึกที่กำหนดในระบบขณะนี้
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {schedules.map((sched) => (
                        <div key={sched.id} className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full dark:bg-red-950/40">
                              วอร์ด: {sched.ward || 'General Medicine'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">เวร: {sched.shift || 'เช้า-บ่าย'}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-zinc-400">
                            <p><strong>ระยะเวลา:</strong> {sched.startDate} - {sched.endDate}</p>
                            <p><strong>กลุ่มฝึก:</strong> {student.rotationGroup || 'Group B2'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Travel and Transit Schedules */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <Truck className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold">ตารางรถเดินทาง (Transit & Logistics)</h2>
              </div>

              {assignedTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-zinc-950/20 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center space-y-2">
                  <Truck className="h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500 dark:text-zinc-400">ไม่พบตารางจัดรถรับส่งเฉพาะเจาะจงในขณะนี้</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedTrips.map((trip) => (
                    <div key={trip.id} className="p-4 bg-gray-50 dark:bg-zinc-950/40 border border-gray-100 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 uppercase">เส้นทางเดินรถ</p>
                        <p className="font-bold text-gray-800 dark:text-zinc-200 text-sm">
                          {trip.pickupLocation} ➔ {trip.destination}
                        </p>
                        {trip.notes && <p className="text-xs text-gray-500">{trip.notes}</p>}
                      </div>
                      <div className="space-y-1 sm:text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase">วันเวลาและรถที่จัด</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                          วันที่: {trip.date} เวลา: {trip.departureTime} น.
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 font-bold">
                          รถทะเบียน/รหัส: {trip.plateNumber || trip.vehicleId || 'รถส่วนกลางสถาบัน'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Right Column: Dormitory, Roommates, Announcements */}
          <div className="space-y-8">
            
            {/* Room Allocation and Roommates */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <Home className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold">หอพักและการจัดห้องพัก (Housing)</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">ห้องพักที่ได้รับมอบหมาย</p>
                  <p className="text-xl font-black text-red-700 dark:text-red-400">
                    Room {room ? room.roomNumber : student.roomId || 'ยังไม่ได้ระบุหอพัก'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ขนาดความจุ: {room ? `${room.capacity} เตียง` : 'ไม่ระบุขนาดความจุ'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    เพื่อนร่วมห้องพัก (Roommates)
                  </h3>

                  {roommates.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">ไม่มีเพื่อนร่วมห้องคนอื่นในระบบห้องเดียวกัน</p>
                  ) : (
                    <div className="space-y-2">
                      {roommates.map((mate) => (
                        <div key={mate.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xs font-bold dark:bg-zinc-800 dark:text-zinc-400">
                            {mate.firstName ? mate.firstName[0] : 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                              {mate.firstName} {mate.lastName}
                            </p>
                            <p className="text-[10px] text-gray-400">รหัสนักศึกษา: {mate.studentId}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Announcements */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <Bell className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold">ประกาศสำคัญ (Announcements)</h2>
              </div>

              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4">ไม่มีประกาศสำคัญส่งถึงคุณในขณะนี้</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {announcements.map((ann) => (
                    <div 
                      key={ann.id} 
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        ann.priority === 'urgent' 
                          ? 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/30' 
                          : ann.priority === 'important'
                          ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30'
                          : 'bg-gray-50/50 border-gray-100 dark:bg-zinc-950/20 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          ann.priority === 'urgent' 
                            ? 'bg-red-100 text-red-700' 
                            : ann.priority === 'important'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ann.priority}
                        </span>
                        <span className="text-[10px] text-gray-400">{ann.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{ann.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-line leading-relaxed">{ann.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
