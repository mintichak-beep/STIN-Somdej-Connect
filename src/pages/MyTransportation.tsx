import { useState, useEffect } from "react";
import { vanTripService, studentService, teacherService } from "../services/app.service";
import { VanTrip, Student, Teacher } from "../types/app";
import { Calendar, Clock, MapPin, Bus, User, Users, Info, AlertCircle, Navigation } from "lucide-react";

export function MyTransportation({ userId, role }: { userId?: string, role?: string }) {
  const [trips, setTrips] = useState<VanTrip[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const tripData = await vanTripService.getAll();
        const studentData = await studentService.getAll();
        const teacherData = await teacherService.getAll();
        
        setStudents(studentData);
        setTeachers(teacherData);
        
        // In a real app we'd filter by the actual logged-in user
        // For now, let's just show trips that have at least one student, or all trips if we want to preview
        setTrips(tripData.filter(t => (role === "Student" ? t.studentIds?.includes(userId || "") : t.instructorIds?.includes(userId || ""))));
      } catch (err) {
        console.error("Error fetching transportation:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
          <span className="text-sm font-bold uppercase tracking-widest">Loading Transportation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Shuttle Van</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Your upcoming clinical transportation schedules</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed">
          <Bus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Upcoming Trips</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
            You do not have any shuttle van assignments at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const assignedStudents = students
              .filter(s => trip.studentIds?.includes(s.id))
              .map(s => s.firstName || 'Unknown');
              
            const assignedInstructors = teachers
              .filter(t => trip.instructorIds?.includes(t.id))
              .map(t => t.name || 'Unknown');

            return (
              <div key={trip.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                
                {/* Header & Status */}
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Travel Date</p>
                        <h4 className="text-lg font-black text-slate-900">{trip.date || (trip as any).tripDate}</h4>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                      trip.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                      trip.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <span className="relative flex h-2 w-2">
                        {trip.status === 'Scheduled' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          trip.status === 'Completed' ? 'bg-emerald-500' :
                          trip.status === 'Cancelled' ? 'bg-red-500' : 'bg-indigo-500'
                        }`}></span>
                      </span>
                      {trip.status || 'Scheduled'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        Outbound Trip
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Departure Time</span>
                            <p className="text-sm font-bold text-slate-800">{trip.departureTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Return Trip
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Return Time</span>
                            <p className="text-sm font-bold text-slate-800">{trip.returnTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-start gap-3">
                      <Navigation className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Destination</span>
                        <p className="text-sm font-bold text-slate-800">{trip.destination}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info List */}
                <div className="p-8 bg-white border-b border-slate-50 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-3">
                        <User className="h-4 w-4 text-teal-500" />
                        Instructor Name(s)
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {assignedInstructors.length > 0 ? assignedInstructors.map((name, i) => (
                          <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-lg border border-teal-100">
                            {name}
                          </span>
                        )) : <span className="text-[10px] text-slate-400 font-bold uppercase italic">No instructor</span>}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-3">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Student List ({assignedStudents.length})
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {assignedStudents.map((name, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {trip.notes && (
                    <div className="pt-4 border-t border-slate-50">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary" />
                        Trip Notes
                      </h5>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {trip.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Van & Driver Info */}
                <div className="p-8 mt-auto bg-slate-50/50 grid grid-cols-2 gap-8 border-t border-slate-50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-medical-blue shadow-sm border border-slate-100">
                        <Bus className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">License Plate</p>
                        <p className="text-sm font-bold text-slate-800">{trip.licensePlate || "TBD"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-medical-teal shadow-sm border border-slate-100">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Name</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{trip.driverName || "Assigning..."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Emergency Notice */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-medical-red">
              <AlertCircle className="h-6 w-6" />
              <h4 className="text-lg font-bold">Transit Protocol</h4>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Arrival at the departure station is required 15 minutes prior to deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
