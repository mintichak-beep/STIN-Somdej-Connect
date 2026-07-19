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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Practice Assignment Center</h2>
        {!showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Assignment
          </button>
        )}
      </div>

      {showWizard && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h3 className="font-bold text-lg">New Practice Assignment</h3>
            <div className="flex items-center text-sm gap-2">
              <span
                className={`px-2 py-1 rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                1. Course
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span
                className={`px-2 py-1 rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                2. Location
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span
                className={`px-2 py-1 rounded-full ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                3. Details
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span
                className={`px-2 py-1 rounded-full ${step >= 4 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                4. Students
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span
                className={`px-2 py-1 rounded-full ${step >= 5 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
              >
                5. Confirm
              </span>
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
              {errorMsg}
            </p>
          )}

          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Course Name / ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. การพยาบาลผู้ใหญ่ 2"
                    className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                    value={wizardData.courseId}
                    onChange={(e) =>
                      setWizardData({ ...wizardData, courseId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Practice Group *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Group A1"
                    className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
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
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Hospital / Training Site *
                  </label>
                  <select
                    className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                    value={wizardData.trainingSiteId}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        trainingSiteId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Hospital --</option>
                    {trainingSites.map((ts) => (
                      <option key={ts.id} value={ts.name}>
                        {ts.name}
                      </option>
                    ))}
                    <option value="โรงพยาบาลสมเด็จ">โรงพยาบาลสมเด็จ</option>
                    <option value="โรงพยาบาลจุฬาลงกรณ์">
                      โรงพยาบาลจุฬาลงกรณ์
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ward / Department *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. หอผู้ป่วยอายุรกรรม"
                    className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
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
              <div className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supervising Teacher *
                  </label>
                  <select
                    className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                    value={wizardData.teacherId}
                    onChange={(e) =>
                      setWizardData({
                        ...wizardData,
                        teacherId: e.target.value,
                      })
                    }
                  >
                    <option value="">-- Select Teacher --</option>
                    {teachers.map((t) => (
                      <option key={t.uid} value={t.name || t.email}>
                        {t.name || t.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                      value={wizardData.startDate}
                      onChange={(e) =>
                        setWizardData({
                          ...wizardData,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
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
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    Select Students ({wizardData.selectedStudentIds.length}{" "}
                    selected)
                  </p>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border rounded pl-8 pr-2 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg dark:border-zinc-700 divide-y dark:divide-zinc-700">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={wizardData.selectedStudentIds.includes(
                            s.studentId,
                          )}
                          onChange={() => toggleStudentSelection(s.studentId)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {s.fullName} ({s.studentId})
                          </p>
                          <p className="text-xs text-gray-500">
                            Year {s.yearLevel} | Class {s.classGroup}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="p-4 text-center text-sm text-gray-500">
                      No active students found.
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4 max-w-xl mx-auto bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border">
                <h4 className="font-bold text-lg text-center mb-4 border-b pb-2">
                  Confirm Assignment
                </h4>
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div className="text-gray-500">Course</div>
                  <div className="font-medium">{wizardData.courseId}</div>
                  <div className="text-gray-500">Group</div>
                  <div className="font-medium">
                    {wizardData.practiceGroupId}
                  </div>
                  <div className="text-gray-500">Hospital & Ward</div>
                  <div className="font-medium">
                    {wizardData.trainingSiteId} - {wizardData.wardDepartment}
                  </div>
                  <div className="text-gray-500">Teacher</div>
                  <div className="font-medium">{wizardData.teacherId}</div>
                  <div className="text-gray-500">Period</div>
                  <div className="font-medium">
                    {wizardData.startDate} to {wizardData.endDate}
                  </div>
                  <div className="text-gray-500">Students</div>
                  <div className="font-medium">
                    {wizardData.selectedStudentIds.length} students selected
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-4 border-t">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={() => setShowWizard(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="w-4 h-4" /> Confirm Assignment
              </button>
            )}
          </div>
        </div>
      )}

      {!showWizard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.length > 0 ? (
            assignments.map((a) => (
              <div
                key={a.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border relative group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-blue-500" />
                    <h4 className="font-bold text-lg">{a.courseId}</h4>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-800`}
                  >
                    {a.status || "assigned"}
                  </span>
                </div>
                <div className="space-y-1 mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Group:</span>{" "}
                    {a.practiceGroupId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Student ID:</span>{" "}
                    {a.studentId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Site:</span>{" "}
                    {a.trainingSiteId}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ward:</span>{" "}
                    {a.wardDepartment}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Teacher:</span> {a.teacherId}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 dark:bg-zinc-800 rounded">
                    {a.startDate} to {a.endDate}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 border-t pt-3">
                  <button
                    onClick={() => {
                      setEditingAssignment(a);
                      setEditFormData(a);
                    }}
                    className="text-blue-600 flex items-center gap-1 text-sm hover:bg-blue-50 p-1 px-2 rounded"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-500 flex items-center gap-1 text-sm hover:bg-red-50 p-1 px-2 rounded"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No practice assignments yet.</p>
              <p className="text-sm">
                Click "Create Assignment" to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                Edit Assignment (Move Student)
              </h3>
              <button
                onClick={() => setEditingAssignment(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg mb-4">
                Editing placement for Student ID:{" "}
                <span className="font-bold">{editingAssignment.studentId}</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Practice Group
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Hospital / Site
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Ward / Department
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Supervising Teacher
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
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

              <div>
                <label className="block text-sm font-medium mb-1">
                  Reason for Change *
                </label>
                <textarea
                  className="w-full border rounded p-2"
                  placeholder="e.g. Swapped with another student, hospital requested change..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  required
                  rows={3}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  This change will be recorded in the assignment history log.
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
