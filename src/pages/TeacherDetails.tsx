import { useState, useEffect } from "react";
import { User, Phone, BookOpen, ArrowLeft, Camera, X, Home, Calendar } from "lucide-react";
import { teacherService, weeklyRoomAssignmentService, roomService, dormitoryService } from "../services/app.service";
import { Teacher, WeeklyRoomAssignment, Room, Dormitory } from "../types/app";
import { motion } from "motion/react";
import { AssetImage } from "../components/AssetImage";
import { format } from "date-fns";

interface TeacherDetailsProps {
  teacherId: string;
  onBack: () => void;
}

export function TeacherDetails({ teacherId, onBack }: TeacherDetailsProps) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [roomAssignments, setRoomAssignments] = useState<WeeklyRoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      const [tData, assignmentsData, roomsData, dormsData] = await Promise.all([
        teacherService.getById(teacherId),
        weeklyRoomAssignmentService.getAll(),
        roomService.getAll(),
        dormitoryService.getAll()
      ]);
      setTeacher(tData);
      setRoomAssignments(assignmentsData.filter(a => a.instructorIds?.includes(teacherId) && a.status === 'active'));
      setRooms(roomsData);
      setDormitories(dormsData);
      setLoading(false);
    };
    fetchTeacher();
  }, [teacherId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && teacher) {
      if (file.size > 1024 * 1024) {
        alert("Image size too large. Please select an image under 1MB.");
        return;
      }
      setIsUpdating(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoUrl = reader.result as string;
        await teacherService.update(teacher.id, { photoUrl });
        setTeacher({ ...teacher, photoUrl });
        setIsUpdating(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    if (teacher) {
      setIsUpdating(true);
      await teacherService.update(teacher.id, { photoUrl: "" });
      setTeacher({ ...teacher, photoUrl: "" });
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Instructor Details...</p>
    </div>
  );

  if (!teacher) return <div>Teacher not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold uppercase text-[10px] tracking-widest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </button>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="h-40 bg-gradient-to-r from-primary to-primary-container relative">
          <div className="absolute -bottom-16 left-10">
            <div className="relative group">
              <div className="h-40 w-40 rounded-full border-8 border-white bg-slate-50 shadow-2xl overflow-hidden flex items-center justify-center">
                {teacher.photoUrl ? (
                  <AssetImage src={teacher.photoUrl} alt={teacher.name} className="h-full w-full object-cover" fallbackType="teacher" />
                ) : (
                  <User className="h-16 w-16 text-slate-300" />
                )}
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full shadow-xl cursor-pointer hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group-hover:ring-4 ring-primary/20">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              {teacher.photoUrl && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-medical-red text-white rounded-full shadow-lg hover:bg-medical-red/90 transition-all hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-24 pb-12 px-10 space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{teacher.name}</h2>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-1">Nursing Faculty • {teacher.department}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Details</p>
                  <p className="font-extrabold text-slate-900">{teacher.phone}</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</p>
                  <p className="font-extrabold text-slate-900">{teacher.department}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accommodation Info */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Assigned Accommodation</h3>
            </div>
            {roomAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomAssignments.map(a => {
                  const room = rooms.find(r => r.id === a.roomId);
                  const dorm = dormitories.find(d => d.id === room?.dormitoryId);
                  const startDate = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
                  const endDate = a.endDate?.toDate ? a.endDate.toDate() : new Date(a.endDate);
                  return (
                    <div key={a.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">Unit {room?.roomNumber || 'N/A'}</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {dorm?.dormitoryName || 'N/A'} • Building {room?.building || 'N/A'}, Floor {room?.floor || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-200/60">
                        <Calendar className="h-3 w-3" />
                        <span>{format(startDate, 'dd MMM yyyy')} - {format(endDate, 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No room assignments currently active for this instructor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
