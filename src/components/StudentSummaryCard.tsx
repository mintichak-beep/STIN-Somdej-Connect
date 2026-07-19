import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Building, MapPin, Car, Phone, User, Calendar, ShieldCheck, 
  HelpCircle, Home, UserCheck, Clock 
} from 'lucide-react';

export function StudentSummaryCard() {
  const { user } = useAuth();

  // Find student matching the current user's email
  const studentData = useMemo(() => {
    if (!user) return null;
    const students = [];
    return students.find(s => s.email.toLowerCase() === user.email.toLowerCase()) || null;
  }, [user]);

  // Find Hospital, Room, and Transport Assignment matching this student
  const studentDetails = useMemo(() => {
    if (!studentData) return null;

    const hospitals = [];
    const courses = [];
    const rooms = [];
    const buildings = [];
    const schedules = [];
    const transAssignments = [];
    const vehicles = [];
    const drivers = [];

    const hospital = hospitals.find(h => h.id === studentData.hospitalId) || null;
    const course = courses.find(c => c.id === studentData.courseId) || null;
    
    // Accommodation
    let roomDetails = null;
    if (studentData.roomId) {
      const room = rooms.find(r => r.id === studentData.roomId);
      const building = room ? buildings.find(b => b.id === room.buildingId) : null;
      if (room && building) {
        roomDetails = {
          roomNumber: room.roomNumber,
          buildingName: building.name,
          capacity: room.capacity,
          occupiedCount: room.occupiedCount
        };
      }
    }

    // Transport
    const myTransAssignment = transAssignments.find(a => a.studentId === studentData.id && a.status === 'active');
    let transportDetails = null;
    if (myTransAssignment) {
      const schedule = schedules.find(s => s.id === myTransAssignment.scheduleId);
      const vehicle = schedule ? vehicles.find(v => v.id === schedule.vehicleId) : null;
      const driver = schedule ? drivers.find(d => d.id === schedule.driverId) : null;
      if (schedule && vehicle && driver) {
        transportDetails = {
          route: schedule.route,
          departureTime: schedule.departureTime,
          vehicleModel: vehicle.model,
          plateNumber: vehicle.plateNumber,
          driverName: driver.name,
          driverPhone: driver.phone,
          pickupLocation: myTransAssignment.pickupLocation,
          dropoffLocation: myTransAssignment.dropoffLocation
        };
      }
    }

    return {
      hospital,
      course,
      roomDetails,
      transportDetails
    };
  }, [studentData]);

  if (!user || !studentData || !studentDetails) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <HelpCircle className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
        <h3 className="mt-4 text-sm font-bold text-gray-800 dark:text-zinc-200">No Placement Profile Found</h3>
        <p className="mt-1 text-xs text-gray-400">Your email ({user?.email}) is not linked to an active clinical student record.</p>
      </div>
    );
  }

  const { hospital, course, roomDetails, transportDetails } = studentDetails;

  return (
    <div className="space-y-6">
      {/* Visual Header Grid for Student */}
      <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-600/5 via-transparent to-transparent p-6 dark:border-zinc-800/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 uppercase dark:bg-red-950/40 dark:text-red-400">
                Placement Account Verified
              </span>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </div>
            <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-50">
              {studentData.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              ID: {studentData.studentId} • Registered Term: AY 2569 Semester 1
            </p>
          </div>
          <div className="flex flex-col text-xs text-gray-500 sm:text-right dark:text-zinc-400">
            <span>Contact Support:</span>
            <span className="font-bold text-gray-800 dark:text-zinc-200">02-234-5678 (STIN IT Ward)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* MY CLINICAL PLACEMENT CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
          <div className="mb-4 flex items-center gap-3 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
              My Clinical Placement
            </h3>
          </div>

          {hospital ? (
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Hospital Ward Location</p>
                <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{hospital.name}</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{hospital.address}</p>
              </div>

              <div className="border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Course Assessment</p>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">
                  {course ? `${course.code} - ${course.name}` : 'Clinical Nursing Course'}
                </p>
              </div>

              <div className="border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Hospital Coordinator</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                  <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{hospital.contactName}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={`tel:${hospital.contactPhone}`} className="hover:underline text-red-600 font-semibold">{hospital.contactPhone}</a>
                </div>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-gray-400">No hospital placement currently assigned.</p>
          )}
        </div>

        {/* MY DORMITORY ROOM CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />
          <div className="mb-4 flex items-center gap-3 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Home className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
              My Room & Housing
            </h3>
          </div>

          {roomDetails ? (
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Dormitory Residence</p>
                <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{roomDetails.buildingName}</h4>
              </div>

              <div className="border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Assigned Room Number</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                  Room {roomDetails.roomNumber}
                </p>
              </div>

              <div className="border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Roommates Utilization Ratio</p>
                <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5 font-medium">
                  Currently hosting {roomDetails.occupiedCount} out of {roomDetails.capacity} student beds.
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                  <div 
                    className="h-full bg-emerald-600 rounded-full" 
                    style={{ width: `${(roomDetails.occupiedCount / roomDetails.capacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-gray-400">No Dormitory Accommodation Currently Assigned.</p>
              <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">Please contact STIN Housing Unit for allocation.</p>
            </div>
          )}
        </div>

        {/* MY TRANSPORTATION CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/70">
          <div className="absolute top-0 left-0 right-0 h-1 bg-sky-600" />
          <div className="mb-4 flex items-center gap-3 border-b border-gray-50 pb-3 dark:border-zinc-800/60">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
              <Car className="h-4 w-4" />
            </div>
            <h3 className="font-sans text-xs font-black tracking-wider text-gray-500 uppercase dark:text-zinc-400">
              My Transportation
            </h3>
          </div>

          {transportDetails ? (
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Commuter Route Route</p>
                <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200 mt-0.5">{transportDetails.route}</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Departure Time</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 font-extrabold font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{transportDetails.departureTime} AM</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Vehicle Model</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-zinc-300 mt-1">{transportDetails.plateNumber}</p>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-2.5 dark:border-zinc-800/40">
                <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Assigned Driver</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                  <UserCheck className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span>{transportDetails.driverName}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-400">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <a href={`tel:${transportDetails.driverPhone}`} className="hover:underline text-red-600 font-semibold">{transportDetails.driverPhone}</a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs text-gray-400">No Shuttle Schedule Seat Assigned.</p>
              <p className="text-[10px] text-gray-300 dark:text-zinc-600 mt-1">Check route departure timetables on public boards.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
