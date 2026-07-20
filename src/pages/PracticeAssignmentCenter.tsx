import React, { useState, useEffect } from "react";
import { practiceAssignmentService } from "../services/practiceAssignment.service";
import { assignmentHistoryService } from "../services/assignmentHistory.service";
import { PracticeAssignment, Student, TrainingSite, User } from "../types/db";
import { studentService } from "../services/student.service";
import { trainingSiteService } from "../services/trainingSite.service";
import { UserService } from "../services/user.service";
import {
  MapPin,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Users,
  Search,
  Edit2,
  X,
  AlertCircle
} from "lucide-react";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export function PracticeAssignmentCenter() {
  const [assignments, setAssignments] = useState<PracticeAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainingSites, setTrainingSites] = useState<TrainingSite[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const [wizardData, setWizardData] = useState({
    courseId: "",
    practiceGroupId: "",
    trainingSiteId: "",
    wardDepartment: "",
    teacherId: "",
    startDate: "",
    endDate: "",
    selectedStudentIds: [] as string[],
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [editingAssignment, setEditingAssignment] =
    useState<PracticeAssignment | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<PracticeAssignment>>(
    {},
  );
  const [changeReason, setChangeReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aData, sData, tsData, uData] = await Promise.all([
        practiceAssignmentService.getAll(),
        studentService.getAll(),
        trainingSiteService.getAll(),
        UserService.getAll(),
      ]);
      setAssignments(aData);
      setStudents(sData);
      setTrainingSites(tsData);
      setTeachers(uData.filter((u) => u.role === "teacher"));
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1 && (!wizardData.courseId || !wizardData.practiceGroupId)) {
      setErrorMsg("Please fill in Course and Practice Group.");
      return;
    }
    if (
      step === 2 &&
      (!wizardData.trainingSiteId || !wizardData.wardDepartment)
    ) {
      setErrorMsg("กรุณาเลือกแหล่งฝึก และหอผู้ป่วย");
      return;
    }
    if (
      step === 3 &&
      (!wizardData.teacherId || !wizardData.startDate || !wizardData.endDate)
    ) {
      setErrorMsg("Please select teacher and period.");
      return;
    }
    if (step === 4 && wizardData.selectedStudentIds.length === 0) {
      setErrorMsg("Please select at least one student.");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    setStep(step - 1);
  };

  const handleConfirm = async () => {
    setErrorMsg("");
    try {
      // Process all students
      let failed = 0;
      for (const sId of wizardData.selectedStudentIds) {
        try {
          await practiceAssignmentService.create({
            studentId: sId,
            courseId: wizardData.courseId,
            practiceGroupId: wizardData.practiceGroupId,
            trainingSiteId: wizardData.trainingSiteId,
            wardDepartment: wizardData.wardDepartment,
            teacherId: wizardData.teacherId,
            startDate: wizardData.startDate,
            endDate: wizardData.endDate,
            status: "assigned",
          });
        } catch (err: any) {
          failed++;
          console.error(err);
          if (
            err.message.includes("ตารางฝึกซ้ำ") ||
            err.message.includes("Duplicate")
          ) {
            alert(`Error assigning student ${sId}: ${err.message}`);
          }
        }
      }

      if (failed === 0) {
        alert("Assignment successful!");
      } else {
        alert(
          `Assignment completed with ${failed} errors. Check console or duplicate alerts.`,
        );
      }

      setShowWizard(false);
      setStep(1);
      setWizardData({
        courseId: "",
        practiceGroupId: "",
        trainingSiteId: "",
        wardDepartment: "",
        teacherId: "",
        startDate: "",
        endDate: "",
        selectedStudentIds: [],
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this assignment?")) {
      await practiceAssignmentService.delete(id);
      fetchData();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;

    try {
      // Update assignment
      await practiceAssignmentService.update(
        editingAssignment.id,
        editFormData,
      );

      // Log history
      await assignmentHistoryService.create({
        studentId: editingAssignment.studentId,
        oldAssignment: JSON.stringify(editingAssignment),
        newAssignment: JSON.stringify({
          ...editingAssignment,
          ...editFormData,
        }),
        changedBy: "Admin",
        reason: changeReason || "Placement changed by teacher",
      });

      setEditingAssignment(null);
      setChangeReason("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  const toggleStudentSelection = (id: string) => {
    setWizardData((prev) => {
      const isSelected = prev.selectedStudentIds.includes(id);
      return {
        ...prev,
        selectedStudentIds: isSelected
          ? prev.selectedStudentIds.filter((sid) => sid !== id)
          : [...prev.selectedStudentIds, id],
      };
    });
  };

  if (loading) return <LoadingSkeleton />;

  const filteredStudents = students.filter(
    (s) =>
      (s.studentId?.includes(searchTerm) || s.fullName?.includes(searchTerm)) &&
      s.status === "active",
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clinical Placement Hub</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Coordinate and manage student clinical practice rotations across healthcare sites.</p>
        </div>
        {!showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="px-6 py-3 text-sm font-bold text-white bg-medical-blue rounded-xl shadow-lg shadow-medical-blue/20 hover:bg-blue-700 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {showWizard && (
        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 animate-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">New Clinical Assignment</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Follow the steps to register a new rotation group.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: "Course", icon: "1" },
                { label: "Site", icon: "2" },
                { label: "Faculty", icon: "3" },
                { label: "Residents", icon: "4" },
                { label: "Review", icon: "5" }
              ].map((s, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > idx + 1 ? "bg-medical-green text-white shadow-lg shadow-medical-green/20" : step === idx + 1 ? "bg-medical-blue text-white shadow-lg shadow-medical-blue/20" : "bg-slate-100 text-slate-400"}`}>
                      {step > idx + 1 ? <Check className="h-4 w-4" /> : s.icon}
                    </span>
                    <span className={`text-xs font-bold hidden sm:inline ${step === idx + 1 ? "text-slate-900" : "text-slate-400"}`}>{s.label}</span>
                  </div>
                  {idx < 4 && <ChevronRight className="w-4 h-4 text-slate-200 hidden sm:block" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 bg-medical-red/10 text-medical-red text-xs font-bold rounded-2xl border border-medical-red/20 flex items-center gap-3 animate-shake">
              <X className="h-5 w-5" />
              {errorMsg}
            </div>
          )}

          <div className="min-h-[350px]">
            {step === 1 && (
              <div className="space-y-8 max-w-lg mx-auto py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Curriculum / Course</label>
                  <input
                    type="text"
                    placeholder="e.g. Adult Nursing II (NS-302)"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={wizardData.courseId}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, courseId: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Practice Cohort Group</label>
                  <input
                    type="text"
                    placeholder="e.g. Clinical Group B-12"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={wizardData.practiceGroupId}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        practiceGroupId: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 max-w-lg mx-auto py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Clinical Training Site</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all appearance-none"
                    value={wizardData.trainingSiteId}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        trainingSiteId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Healthcare Facility --</option>
                    {trainingSites.map((ts) => (
                      <option key={ts.id} value={ts.name}>
                        {ts.name}
                      </option>
                    ))}
                    <option value="แหล่งฝึกสมเด็จ">แหล่งฝึกสมเด็จ</option>
                    <option value="แหล่งฝึกจุฬาลงกรณ์">แหล่งฝึกจุฬาลงกรณ์</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Medical Ward / Department</label>
                  <input
                    type="text"
                    placeholder="e.g. ICU, Pediatric Ward, OR"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={wizardData.wardDepartment}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        wardDepartment: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 max-w-lg mx-auto py-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preceptor / Supervising Faculty</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all appearance-none"
                    value={wizardData.teacherId}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        teacherId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Instructor --</option>
                    {teachers.map((t) => (
                      <option key={t.uid} value={t.name || t.email}>
                        {t.name || t.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rotation Start</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                      value={wizardData.startDate}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rotation End</label>
                    <input
                      type="date"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                      value={wizardData.endDate}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 max-w-2xl mx-auto py-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-6 rounded-[24px]">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Eligible Residents
                    </p>
                    <p className="text-xs text-slate-400 font-medium">{wizardData.selectedStudentIds.length} members selected for rotation</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search residents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-medical-blue/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${wizardData.selectedStudentIds.includes(s.studentId) ? "bg-medical-blue/5 border-medical-blue ring-1 ring-medical-blue/10" : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100"}`}
                      >
                        <div className="mt-1">
                          <input
                            type="checkbox"
                            checked={wizardData.selectedStudentIds.includes(
                              s.studentId,
                            )}
                            onChange={() => toggleStudentSelection(s.studentId)}
                            className="w-5 h-5 rounded-md border-slate-300 text-medical-blue focus:ring-medical-blue"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-slate-800 group-hover:text-medical-blue transition-colors">
                            {s.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{s.studentId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                            <span>Y{s.yearLevel}</span>
                          </div>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="col-span-full py-16 text-center">
                      <Users className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest opacity-40">No available residents found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="max-w-xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50/50 p-10 rounded-[32px] border border-slate-100 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-medical-blue/5 rounded-full -mr-10 -mt-10" />
                  
                  <div className="text-center space-y-2">
                    <div className="bg-medical-blue/10 p-3 rounded-2xl inline-block text-medical-blue mb-2">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Review Clinical Rotation</h4>
                    <p className="text-xs text-slate-400 font-medium">Verify deployment details before finalizing</p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 border-t border-slate-100 pt-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Course</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.courseId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Practice Group</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.practiceGroupId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Training Facility</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.trainingSiteId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ward / Unit</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.wardDepartment}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Lead</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.teacherId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rotation Cycle</p>
                      <p className="text-sm font-bold text-slate-800">{wizardData.startDate} — {wizardData.endDate}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-medical-green/10 p-2 rounded-lg text-medical-green">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">Residents Deployed</span>
                    </div>
                    <span className="px-4 py-1.5 bg-medical-green text-white text-sm font-bold rounded-full shadow-lg shadow-medical-green/20">
                      {wizardData.selectedStudentIds.length} Total
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={() => setShowWizard(false)}
                className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Dismiss
              </button>
            )}

            <div className="flex items-center gap-4">
              {step < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-10 py-3.5 bg-medical-blue text-white text-sm font-bold rounded-xl shadow-lg shadow-medical-blue/20 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-3 px-10 py-3.5 bg-medical-green text-white text-sm font-bold rounded-xl shadow-lg shadow-medical-green/20 hover:bg-green-600 transition-all cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>Finalize Rotation</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!showWizard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {assignments.length > 0 ? (
            assignments.map((a) => (
              <div
                key={a.id}
                className="bg-white p-8 rounded-[28px] border border-slate-100 relative group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-medical-blue/10 p-2.5 rounded-2xl text-medical-blue group-hover:scale-110 transition-transform duration-500">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-medical-blue transition-colors">{a.courseId}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.practiceGroupId}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${a.status === 'assigned' || !a.status ? "bg-medical-blue/10 text-medical-blue border-medical-blue/10" : "bg-medical-green/10 text-medical-green border-medical-green/10"}`}
                  >
                    {a.status || "Assigned"}
                  </span>
                </div>
                
                <div className="space-y-4 py-4 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Training Site</span>
                    <span className="text-sm font-bold text-slate-700">{a.trainingSiteId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Unit</span>
                    <span className="text-sm font-bold text-slate-700">{a.wardDepartment}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty Lead</span>
                    <span className="text-sm font-bold text-slate-700">{a.teacherId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resident ID</span>
                    <span className="text-sm font-bold text-slate-700">{a.studentId}</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rotation Schedule</p>
                  <p className="text-xs font-bold text-slate-600">{a.startDate} — {a.endDate}</p>
                </div>

                <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => {
                      setEditingAssignment(a);
                      setEditFormData(a);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-medical-blue bg-medical-blue/10 hover:bg-medical-blue/20 rounded-xl transition-all"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-medical-red bg-medical-red/10 hover:bg-medical-red/20 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm border-dashed">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No Rotation Groups</h3>
              <p className="text-sm text-slate-400 font-medium mt-2 max-w-xs mx-auto">
                Establish a new clinical practice rotation for students by clicking create.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Relocate Resident</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Adjust rotation parameters for student {editingAssignment.studentId}</p>
              </div>
              <button
                onClick={() => setEditingAssignment(null)}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-10 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Practice Group</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={editFormData.practiceGroupId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        practiceGroupId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Training Site</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={editFormData.trainingSiteId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        trainingSiteId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ward / Unit</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={editFormData.wardDepartment}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        wardDepartment: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Faculty Lead</label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all"
                    value={editFormData.teacherId}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        teacherId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Justification for Change *</label>
                <textarea
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-4 focus:ring-medical-blue/10 focus:border-medical-blue outline-none transition-all min-h-[120px]"
                  placeholder="State the clinical or administrative reason for relocation..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  required
                ></textarea>
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-600 rounded-xl mt-2 border border-amber-100">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-[10px] font-bold">This adjustment will be recorded in the official audit log.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10 pt-8 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-6 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-10 py-3.5 bg-medical-blue text-white text-sm font-bold rounded-xl shadow-lg shadow-medical-blue/20 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Finalize Relocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
