import React, { useState, useEffect } from "react";
import { studentService } from "../services/student.service";
import { Student } from "../types/db";
import {
  Users,
  Upload,
  Download,
  Search,
  CheckCircle,
  XCircle,
  X,
  Edit2,
} from "lucide-react";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: any[];
  } | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});

  const fetchStudents = async () => {
    const data = await studentService.getAll();
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n").filter((line) => line.trim() !== "");
      const headers = lines[0].split(",");

      const studentsToImport: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        if (values.length >= 7) {
          studentsToImport.push({
            studentId: values[0].trim(),
            firstName: values[1].trim(),
            lastName: values[2].trim(),
            email: values[3].trim(),
            yearLevel: values[4].trim(),
            classGroup: values[5].trim(),
            phone: values[6].trim(),
          });
        }
      }

      const results = await studentService.bulkImport(studentsToImport);
      setImportResults(results);
      setIsImporting(false);
      fetchStudents();
    };
    reader.readAsText(file);
  };

  const exportCSV = () => {
    const headers = "Student ID,Name,Year,Email,Status\n";
    const csvData = students
      .map(
        (s) =>
          `${s.studentId},${s.fullName},${s.yearLevel},${s.email},${s.status}`,
      )
      .join("\n");
    const blob = new Blob([headers + csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    await studentService.update(selectedStudent.id, editFormData);
    setIsEditing(false);
    fetchStudents();
    setSelectedStudent({ ...selectedStudent, ...editFormData } as Student);
  };

  const handleStatusChange = async (studentId: string, newStatus: any) => {
    await studentService.update(studentId, { status: newStatus });
    fetchStudents();
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, status: newStatus });
    }
  };

  if (loading) return <LoadingSkeleton />;

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.studentId.includes(searchTerm) || s.fullName?.includes(searchTerm);
    const matchYear = filterYear ? s.yearLevel === filterYear : true;
    const matchClass = filterClass ? s.classGroup === filterClass : true;
    const matchStatus = filterStatus ? s.status === filterStatus : true;
    return matchSearch && matchYear && matchClass && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Student Management</h2>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer">
            <Upload className="h-4 w-4" /> Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isImporting}
            />
          </label>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {importResults && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border mb-6">
          <h3 className="font-bold text-lg mb-2">Import Results</h3>
          <p>
            Total processed: {importResults.successful + importResults.failed}
          </p>
          <p className="text-green-600">
            Successful: {importResults.successful}
          </p>
          <p className="text-red-600">Failed: {importResults.failed}</p>
          {importResults.errors.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <p className="font-bold mb-2">Errors:</p>
              <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
                {importResults.errors.map((e, i) => (
                  <li key={i}>
                    ID: {e.studentId} - {e.problem}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            className="pl-9 pr-4 py-2 w-full border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="">All Classes</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-zinc-900 p-4 rounded-xl border"
            >
              <div className="flex justify-between items-start mb-2">
                <Users className="text-blue-500" />
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${student.status === "active" ? "bg-green-100 text-green-800" : student.status === "inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {student.status}
                </span>
              </div>
              <h4 className="font-bold">{student.fullName}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {student.studentId}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Email: {student.email}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Year: {student.yearLevel} | Class: {student.classGroup}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="text-sm bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                  View Profile
                </button>
                {student.status !== "active" && (
                  <button
                    onClick={() => handleStatusChange(student.id, "active")}
                    className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200"
                  >
                    Activate
                  </button>
                )}
                {student.status === "active" && (
                  <button
                    onClick={() => handleStatusChange(student.id, "inactive")}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No data available
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h3 className="text-xl font-bold">Student Profile</h3>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setIsEditing(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {selectedStudent.fullName?.charAt(0) ||
                      selectedStudent.studentId.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedStudent.fullName}
                    </h2>
                    <p className="text-gray-500">
                      ID: {selectedStudent.studentId}
                    </p>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditFormData(selectedStudent);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateStudent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold border-b pb-2">Basic Information</h4>
                  {!isEditing ? (
                    <>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Full Name
                        </span>
                        {selectedStudent.fullName || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Email
                        </span>
                        {selectedStudent.email || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Phone
                        </span>
                        {selectedStudent.phone || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Year Level
                        </span>
                        {selectedStudent.yearLevel || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Class Group
                        </span>
                        {selectedStudent.classGroup || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Program
                        </span>
                        {selectedStudent.program || "-"}
                      </div>
                      <div>
                        <span className="text-gray-500 block text-sm">
                          Status
                        </span>
                        <span
                          className={`inline-block mt-1 text-xs font-bold px-2 py-1 rounded ${selectedStudent.status === "active" ? "bg-green-100 text-green-800" : selectedStudent.status === "inactive" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {selectedStudent.status}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-gray-500 block text-sm">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                          value={editFormData.fullName || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              fullName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 block text-sm">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                          value={editFormData.email || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 block text-sm">
                          Phone
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                          value={editFormData.phone || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-gray-500 block text-sm">
                            Year Level
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                            value={editFormData.yearLevel || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                yearLevel: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 block text-sm">
                            Class Group
                          </label>
                          <input
                            type="text"
                            className="w-full border rounded p-2 dark:bg-zinc-800 dark:border-zinc-700"
                            value={editFormData.classGroup || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                classGroup: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold border-b pb-2">
                    Practice & Activity Data
                  </h4>
                  <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg space-y-3">
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Current Practice Course
                      </span>
                      -
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Hospital
                      </span>
                      -
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Dormitory Room
                      </span>
                      -
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">
                        Transportation Route
                      </span>
                      -
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
