import { useEffect, useState } from "react";
import { vanTripService, vanService, studentService } from "../services/app.service";
import { VanTrip, Van, Student } from "../types/app";
import { Bus, MapPin, Clock, Calendar, Phone, User, Info, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function MyTransportation() {
  const [trips, setTrips] = useState<VanTrip[]>([]);
  const [vans, setVans] = useState<Van[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let tripsUnsub = () => {};
    let vansUnsub = () => {};
    let studentsUnsub = () => {};

    // Load Student ("dev-student-id" as default for preview)
    studentsUnsub = studentService.onSnapshot([], (studentsList) => {
      const currentStudent = studentsList.find(s => s.id === "dev-student-id") || studentsList[0];
      if (currentStudent) {
        setStudent(currentStudent);
      }
    });

    // Load Van Trips
    tripsUnsub = vanTripService.onSnapshot([], (tripsList) => {
      setTrips(tripsList);
    });

    // Load Vans
    vansUnsub = vanService.onSnapshot([], (vansList) => {
      setVans(vansList);
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      tripsUnsub();
      vansUnsub();
      studentsUnsub();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[40px] border border-slate-50 shadow-sm">
        <div className="h-12 w-12 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing transit registry...</p>
      </div>
    );
  }

  // Filter trips where current student is a passenger
  const myTrips = trips.filter(trip => 
    student && trip.passengers.some(p => p.personId === student.id)
  ).sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            My Transportation
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Clinical rotation shuttle schedules and vehicle assignment details.
          </p>
        </div>
        <div className="bg-medical-blue/10 px-6 py-3 rounded-2xl flex items-center gap-3">
          <Bus className="h-5 w-5 text-medical-blue" />
          <span className="text-xs font-bold text-medical-blue uppercase tracking-widest">{myTrips.length} Active Trips</span>
        </div>
      </div>

      {myTrips.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-slate-100 p-20 text-center space-y-6 shadow-sm">
          <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
            <Bus className="h-10 w-10 text-slate-200" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">No transportation schedule available.</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              You are currently not assigned to any institutional transport circuits for the upcoming clinical cycle.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {myTrips.map((trip) => {
            const van = vans.find(v => v.id === trip.vanId);
            const statusColor = {
              scheduled: "bg-medical-blue/10 text-medical-blue border-medical-blue/10",
              in_progress: "bg-medical-orange/10 text-medical-orange border-medical-orange/10 animate-pulse",
              completed: "bg-medical-green/10 text-medical-green border-medical-green/10",
              cancelled: "bg-medical-red/10 text-medical-red border-medical-red/10"
            }[trip.status || 'scheduled'];

            return (
              <div key={trip.id} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col">
                {/* Trip Header */}
                <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-medical-blue/10 p-3 rounded-2xl text-medical-blue group-hover:scale-110 transition-transform">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trip Deployment</p>
                        <h4 className="text-xl font-bold text-slate-900">{format(typeof trip.tripDate === 'string' ? new Date(trip.tripDate) : (trip.tripDate as any).toDate(), 'EEEE, MMMM do')}</h4>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${statusColor}`}>
                        {trip.status ? trip.status.replace('_', ' ') : 'Scheduled'}
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-500">
                        {trip.subject}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-medical-blue mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-lg font-bold">{trip.departureTime}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Return: {trip.returnTime}</p>
                  </div>
                </div>

                {/* Departure & Return Routes */}
                <div className="p-8 bg-slate-50/30 flex flex-col gap-6 relative overflow-hidden border-b border-slate-50">
                  {/* Departure Route Section */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      Departure Schedule ({trip.departureTime})
                    </h5>
                    <div className="pl-4 border-l-2 border-indigo-100 space-y-4 relative">
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">From Location</span>
                          <p className="text-sm font-bold text-slate-800">{trip.departureLocation || trip.pickupLocation || "STIN Main Campus"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider">To Destination</span>
                          <p className="text-sm font-bold text-slate-800">{trip.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return Route Section */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Return Schedule ({trip.returnTime})
                    </h5>
                    <div className="pl-4 border-l-2 border-emerald-100 space-y-4 relative">
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pickup From</span>
                          <p className="text-sm font-bold text-slate-800">{trip.returnPickupLocation || trip.destination || "Clinical Site"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Return Destination</span>
                          <p className="text-sm font-bold text-slate-800">{trip.returnDestination || trip.dropoffLocation || "STIN Residential Hall"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Van & Driver Info */}
                <div className="p-8 mt-auto bg-white border-t border-slate-50 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-medical-blue/5 flex items-center justify-center text-medical-blue">
                        <Bus className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned Unit</p>
                        <p className="text-sm font-bold text-slate-800">Van #{van?.vanNumber || "TBD"}</p>
                        <p className="text-xs font-mono font-bold text-medical-blue">{van?.plateNumber || "Pending"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-medical-teal/5 flex items-center justify-center text-medical-teal">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Operator</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{van?.driverName || "Assigning..."}</p>
                        {van?.driverPhone && (
                          <a href={`tel:${van.driverPhone}`} className="text-xs font-bold text-medical-teal hover:underline flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {van.driverPhone}
                          </a>
                        )}
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
              <h4 className="text-lg font-bold">Transit Protocol & Contingencies</h4>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Arrival at the departure station is required 15 minutes prior to deployment. For emergency cancellations or shuttle discrepancies, please contact the Clinical Coordination Office immediately.
            </p>
          </div>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-bold transition-all border border-white/10 backdrop-blur-md">
            View Transit Rules
          </button>
        </div>
      </div>
    </div>
  );
}
