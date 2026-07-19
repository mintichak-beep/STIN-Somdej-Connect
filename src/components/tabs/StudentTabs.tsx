import { useState, useEffect } from "react";
import {
  Users,
  MapPin,
  Bed,
  Bus,
  Zap,
  FileText,
  Megaphone,
  User,
  Check,
  Upload,
  ArrowUpRight,
  Calendar,
  Phone,
  Mail,
  Globe,
  ShieldAlert,
  Award,
  FileSpreadsheet,
  Droplets,
  Eye,
  Home,
} from "lucide-react";
import { Bill, Payment, PracticeAssignment } from "../../types/db";
import { mockDB } from "../../services/mockData";
import { useTrainingGroups } from "../../hooks/useTrainingGroups";
import { useAuth } from "../../hooks/useAuth";
import { practiceAssignmentService } from "../../services/practiceAssignment.service";

interface StudentTabsProps {
  activeTab: string;
}

export function StudentTabs({ activeTab }: StudentTabsProps) {
  const { user } = useAuth();
  const [practiceAssignments, setPracticeAssignments] = useState<
    PracticeAssignment[]
  >([]);

  useEffect(() => {
    async function fetchAssignments() {
      if (user?.uid) {
        const mockStudentId = user.email?.split("@")[0] || "";
        const allData = await practiceAssignmentService.getAll();
        const studentAssignments = allData.filter(
          (a) =>
            a.studentId === mockStudentId || mockStudentId.includes("student"),
        );
        setPracticeAssignments(studentAssignments);
      }
    }
    fetchAssignments();
  }, [user]);

  // ---- Local Persistence States ----
  const { trainingGroups: groups } = useTrainingGroups();

  const [dbStudents, setDbStudents] = useState(() => mockDB.getStudents());
  const [dbRooms, setDbRooms] = useState(() => mockDB.getRooms());
  const [dbBuildings, setDbBuildings] = useState(() => mockDB.getBuildings());
  const [dbAssignments, setDbAssignments] = useState(() =>
    mockDB.getRoomAssignments(),
  );
  const [dbVehicles, setDbVehicles] = useState(() => mockDB.getVehicles());
  const [dbTransportSchedules, setDbTransportSchedules] = useState(() =>
    mockDB.getTransportSchedules(),
  );
  const [dbTransportAssignments, setDbTransportAssignments] = useState(() =>
    mockDB.getTransportAssignments(),
  );
  const [dbBills, setDbBills] = useState<Bill[]>(() => mockDB.getBills());
  const [dbPayments, setDbPayments] = useState<Payment[]>(() =>
    mockDB.getPayments(),
  );

  useEffect(() => {
    const handleUpdate = () => {
      setDbStudents(mockDB.getStudents());
      setDbRooms(mockDB.getRooms());
      setDbBuildings(mockDB.getBuildings());
      setDbAssignments(mockDB.getRoomAssignments());
      setDbVehicles(mockDB.getVehicles());
      setDbTransportSchedules(mockDB.getTransportSchedules());
      setDbTransportAssignments(mockDB.getTransportAssignments());
      setDbBills(mockDB.getBills());
      setDbPayments(mockDB.getPayments());
    };
    window.addEventListener("cpatms_db_update", handleUpdate);
    return () => window.removeEventListener("cpatms_db_update", handleUpdate);
  }, []);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("stin_student_profile");
    return saved
      ? JSON.parse(saved)
      : {
          name: "Nong Somchai",
          studentId: "STIN-2026-0899",
          year: "First-Year Nursing Student",
          email: "student@stin.ac.th",
          phone: "099-876-5432",
          photoURL:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        };
  });

  // Find Student matching logged-in student profile's email
  const dbStudent = dbStudents.find((s) => s.email === profile.email);
  const myGroup = dbStudent
    ? groups.find((g) => g.studentIds && g.studentIds.includes(dbStudent.id))
    : null;

  // Resolve objects for active group
  const teacher = myGroup
    ? mockDB.getTeachers().find((t) => t.id === myGroup.teacherId)
    : null;
  const hospital = myGroup
    ? mockDB
        .getHospitals()
        .find(
          (h) =>
            h.id === myGroup.hospital ||
            h.hospitalNameEN === myGroup.hospital ||
            h.hospitalNameTH === myGroup.hospital,
        )
    : null;
  const transit = myGroup
    ? mockDB
        .getTransportSchedules()
        .find((ts) => ts.id === myGroup.transportationId)
    : null;
  const vehicle = transit
    ? mockDB.getVehicles().find((v) => v.id === transit.vehicleId)
    : null;
  const driver = transit
    ? mockDB.getDrivers().find((d) => d.id === transit.driverId)
    : null;

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [bill, setBill] = useState(() => {
    const saved = localStorage.getItem("stin_student_bill");
    return saved
      ? JSON.parse(saved)
      : {
          id: "101",
          room: "101",
          month: "June",
          year: "2026",
          waterUnit: 14,
          electricUnit: 156,
          total: 642,
          status: "Unpaid",
          slip: null as string | null,
        };
  });

  const [announcements, setAnnouncements] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_announcements");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "1",
            title: "Urgent: Water system maintenance in Building A",
            content:
              "There will be a scheduled water shutdown for maintenance in Building A on July 20th from 09:00 to 12:00. Please prepare accordingly.",
            date: "18 July 2026",
            priority: "Urgent",
            author: "Ajarn Somsri",
          },
          {
            id: "2",
            title: "Clinical Placement guidelines for Semester 1/2026",
            content:
              "All nursing students enrolled in Semester 1 placements are requested to download the updated evaluation logbook from the documents tab.",
            date: "15 July 2026",
            priority: "General",
            author: "Ajarn Somchai",
          },
        ];
  });

  const [studentDocs, setStudentDocs] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_student_uploaded_docs");
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("stin_student_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("stin_student_bill", JSON.stringify(bill));
  }, [bill]);

  useEffect(() => {
    localStorage.setItem(
      "stin_student_uploaded_docs",
      JSON.stringify(studentDocs),
    );
  }, [studentDocs]);

  const triggerToast = (message: string) => {
    setToast({ message, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Water & Electricity payment slip upload handler ----
  const [dragActive, setDragActive] = useState(false);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processSlip = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSlipPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSlip(e.dataTransfer.files[0]);
    }
  };

  const [activeBillId, setActiveBillId] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSlip(e.target.files[0]);
    }
  };

  const handleSubmitSlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipPreview) {
      triggerToast("Please upload a bank transfer slip image first");
      return;
    }

    const currentStudent = dbStudents.find((s) => s.email === profile.email);
    if (!currentStudent) {
      triggerToast("Error: Student profile not found in database");
      return;
    }

    const myBills = dbBills.filter((b) => b.tenantId === currentStudent.id);
    const currentBill =
      myBills.find((b) => b.billId === activeBillId) || myBills[0];

    if (!currentBill) {
      triggerToast("Error: No target bill found for payment upload");
      return;
    }

    const payments = mockDB.getPayments();
    const paymentId = `pay-${Date.now()}`;
    const newPayment: Payment = {
      paymentId,
      billId: currentBill.billId,
      roomId: currentBill.roomId,
      tenantId: currentStudent.id,
      amount: currentBill.totalAmount,
      transferDate: new Date().toISOString().split("T")[0],
      slipUrl: slipPreview,
      status: "Pending",
      uploadTime: new Date().toISOString(),
    };

    payments.push(newPayment);
    mockDB.savePayments(payments);

    // Update bill status to Pending
    const billsList = mockDB.getBills();
    const billIdx = billsList.findIndex((b) => b.billId === currentBill.billId);
    if (billIdx !== -1) {
      billsList[billIdx].status = "Pending";
      mockDB.saveBills(billsList);
    }

    mockDB.addActivity({
      type: "room_assign",
      title: "Submitted Payment Slip",
      description: `Student ${currentStudent.studentName} uploaded a slip for Room ${currentBill.roomId} totaling ฿${currentBill.totalAmount}`,
      userId: currentStudent.id,
      userDisplayName: currentStudent.studentName,
    });

    setSlipPreview(null);
    window.dispatchEvent(
      new CustomEvent("cpatms_db_update", {
        detail: { key: "cpatms_payments" },
      }),
    );
    triggerToast(
      "Payment slip uploaded successfully! Status: Pending verification.",
    );
  };

  // ---- Profile Update handler ----
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      ...profile,
      email: editEmail,
      phone: editPhone,
    });
    triggerToast("Contact profile successfully updated.");
  };

  // ---- Compliance Document uploader ----
  const [docFile, setDocFile] = useState<string | null>(null);
  const [docName, setDocName] = useState("");

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    const item = {
      id: Date.now().toString(),
      name: docName.endsWith(".pdf") ? docName : `${docName}.pdf`,
      uploadedAt: new Date().toLocaleDateString("en-GB"),
    };
    setStudentDocs([item, ...studentDocs]);
    setDocName("");
    triggerToast("Compliance form uploaded.");
  };

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-xl dark:bg-white dark:text-zinc-950 animate-bounce flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ==================== 1. DASHBOARD TAB ==================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              Sawadee, {profile.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Welcome to your personal Srisavarindhira Thai Red Cross Nursing
              student dashboard.
            </p>
          </div>

          {/* Mini placements summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 text-red-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Clinical Site
                </span>
                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {hospital ? hospital.hospitalNameTH : "Unassigned Hospital"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 text-red-600">
                <Bed className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Dorm Room
                </span>
                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {myGroup &&
                  myGroup.dormitoryIds &&
                  myGroup.dormitoryIds.length > 0
                    ? myGroup.dormitoryIds
                        .map((id) => {
                          const room = mockDB
                            .getRooms()
                            .find((r) => r.id === id);
                          return room ? `Room ${room.roomNumber}` : id;
                        })
                        .join(", ")
                    : "No Dorm Room assigned"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-2 text-red-600">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Transportation Route
                </span>
                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {transit ? transit.route : "Self-commute / Unassigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick status cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Announcements brief */}
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider mb-4">
                Urgent Announcements
              </h3>
              <div className="space-y-4">
                {announcements.slice(0, 1).map((a) => (
                  <div key={a.id} className="border-l-4 border-red-600 pl-4">
                    <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                      {a.priority}
                    </span>
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-1">
                      {a.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Utility status brief */}
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider mb-4">
                Lodging Utility Bill
              </h3>
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-zinc-950/30 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    June Room Bill
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-bold mt-0.5">
                    Water & Power charges
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-zinc-900 dark:text-white">
                    ฿{bill.total}
                  </p>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${bill.status === "Paid" ? "bg-emerald-50 text-emerald-700" : bill.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                  >
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. TRAINING INFORMATION TAB ==================== */}
      {activeTab === "training-info" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Hospital Clinical Placement
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Details and guidelines for your clinical posting rotation.
            </p>

            {myGroup ? (
              <div className="space-y-6">
                {/* Visual Banner */}
                <div className="rounded-xl border border-red-100 dark:border-zinc-800 p-5 bg-red-50/10 dark:bg-zinc-950/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      <Award className="h-3 w-3" /> Assigned Group:{" "}
                      {myGroup.name}
                    </span>
                    <h4 className="text-base font-black text-zinc-900 dark:text-white mt-2.5 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      {hospital ? hospital.hospitalNameTH : myGroup.hospital}
                    </h4>
                    {hospital && (
                      <p className="text-xs text-zinc-400 font-bold mt-0.5">
                        {hospital.hospitalNameEN} •{" "}
                        {hospital.affiliation || "University Hospital"}
                      </p>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 md:text-right">
                    <span className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                      Rotation Duration
                    </span>
                    <span className="mt-1 block text-zinc-800 dark:text-white font-bold flex items-center md:justify-end gap-1.5">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      {myGroup.startDate} to {myGroup.endDate}
                    </span>
                  </div>
                </div>

                {/* Sub-grid of detailed cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Supervisor Details */}
                  <div className="border border-slate-100 dark:border-zinc-800 p-5 rounded-xl bg-white dark:bg-zinc-950/10 space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-slate-50 dark:border-zinc-800 pb-2">
                      Supervising Faculty Instructor
                    </h5>
                    {teacher ? (
                      <div>
                        <p className="text-xs font-black text-zinc-800 dark:text-white">
                          {teacher.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-bold">
                          {teacher.department}
                        </p>

                        <div className="space-y-2 mt-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{teacher.email || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{teacher.phone || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        No instructor is allocated for this rotation yet.
                      </p>
                    )}
                  </div>

                  {/* Hospital Placement Details */}
                  <div className="border border-slate-100 dark:border-zinc-800 p-5 rounded-xl bg-white dark:bg-zinc-950/10 space-y-3">
                    <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-slate-50 dark:border-zinc-800 pb-2">
                      Clinical Placement Partner Info
                    </h5>
                    {hospital ? (
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 font-bold block">
                            Hospital Province
                          </span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block">
                            {hospital.province || "Bangkok"}
                          </span>
                        </div>
                        {hospital.telephone && (
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-bold">
                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                            <span>{hospital.telephone}</span>
                          </div>
                        )}
                        {hospital.website && (
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-bold">
                            <Globe className="h-3.5 w-3.5 text-zinc-400" />
                            <a
                              href={hospital.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-red-600 dark:text-red-400 hover:underline"
                            >
                              Visit Hospital Webpage
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        No detailed partner information is available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Cohort student list */}
                <div className="border border-slate-100 dark:border-zinc-800 p-5 rounded-xl bg-slate-50/20 dark:bg-zinc-950/5">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 border-b border-slate-100 dark:border-zinc-800/80 pb-2 mb-3">
                    Your Cohort Group Members
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {myGroup.studentIds && myGroup.studentIds.length > 0 ? (
                      myGroup.studentIds.map((id) => {
                        const stud = mockDB
                          .getStudents()
                          .find((s) => s.id === id);
                        const isMe = stud?.email === profile.email;
                        return (
                          <div
                            key={id}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isMe ? "bg-red-50/20 border-red-100 dark:bg-red-950/10 dark:border-red-900/40" : "bg-white border-slate-100 dark:bg-zinc-900 dark:border-zinc-800"}`}
                          >
                            <div>
                              <p className="font-black text-zinc-800 dark:text-zinc-200">
                                {stud?.studentName || id}{" "}
                                {isMe && (
                                  <span className="text-red-500 font-black ml-1">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                                Section {stud?.section || "1"} • Year{" "}
                                {stud?.academicYear || "2569"}
                              </p>
                            </div>
                            <span className="text-[10px] text-zinc-400 font-bold">
                              ID: {stud?.studentNumber || "STIN"}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-400 italic">
                        No group members are allocated yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                <ShieldAlert className="h-10 w-10 text-zinc-300 mb-3" />
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">
                  No Active Placement Assigned
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-md text-center">
                  You are not assigned to any nursing training cohort at the
                  moment. Please contact the Faculty Coordinator or Supervisor
                  to verify your deployment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. DORMITORY TAB ==================== */}
      {activeTab === "dormitory" &&
        (() => {
          // Resolve student's direct room assignment
          let activeRoom = dbRooms.find((r) => r.id === dbStudent?.roomId);
          let activeDorm = activeRoom
            ? dbBuildings.find((b) => b.id === activeRoom.buildingId)
            : null;

          // Find roommates in the exact same room
          let activeRoommates = activeRoom
            ? dbStudents.filter(
                (s) => s.roomId === activeRoom!.id && s.id !== dbStudent?.id,
              )
            : [];

          // Fallback to group room assignment if no direct room is assigned to student yet
          if (
            !activeRoom &&
            myGroup &&
            myGroup.dormitoryIds &&
            myGroup.dormitoryIds.length > 0
          ) {
            const firstGroupId = myGroup.dormitoryIds[0];
            activeRoom = dbRooms.find((r) => r.id === firstGroupId);
            activeDorm = activeRoom
              ? dbBuildings.find((b) => b.id === activeRoom.buildingId)
              : null;
            activeRoommates = myGroup.studentIds
              ? myGroup.studentIds
                  .filter((sid) => sid !== dbStudent?.id)
                  .map((sid) => dbStudents.find((s) => s.id === sid))
                  .filter((s): s is NonNullable<typeof s> => !!s)
              : [];
          }

          if (activeRoom && activeDorm) {
            const occupancyRate =
              Math.round(
                (activeRoom.occupiedCount / activeRoom.capacity) * 100,
              ) || 0;
            return (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-50 dark:border-zinc-800 pb-5 mb-6">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        <Bed className="h-5 w-5 text-red-600" /> Dorm Room
                        Assignment
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Your assigned residential housing, roommates
                        coordinates, and dormitory statistics.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full border border-emerald-100/30">
                        ● Active Placement
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Assigned Room Ticket */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-linear-to-br from-slate-50/40 to-slate-100/10 dark:from-zinc-950/20 dark:to-zinc-900/10 p-6 space-y-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                              Room {activeRoom.roomNumber}
                            </span>
                            <h4 className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                              {activeDorm.buildingName}
                            </h4>
                            <p className="text-xs text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{" "}
                              {activeDorm.address || "Academic Residence Area"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-zinc-400 block tracking-widest">
                              Occupancy
                            </span>
                            <span className="text-xl font-black text-zinc-800 dark:text-zinc-200 block mt-1">
                              {activeRoom.occupiedCount} / {activeRoom.capacity}{" "}
                              Beds
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Indicator */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-zinc-500">
                            <span>Room Fill Progress</span>
                            <span>{occupancyRate}% Full</span>
                          </div>
                          <div className="h-2.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                occupancyRate >= 100
                                  ? "bg-red-500"
                                  : occupancyRate >= 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Physical Bed Map */}
                        <div className="pt-3">
                          <span className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-3">
                            Room Bed layout
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Array.from({ length: activeRoom.capacity }).map(
                              (_, idx) => {
                                const isMyBed = idx === 0; // Simulate first bed as active student's
                                const isOccupied =
                                  idx < activeRoom.occupiedCount;
                                return (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl border text-center space-y-1.5 ${
                                      isMyBed
                                        ? "bg-red-50/50 border-red-200 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                                        : isOccupied
                                          ? "bg-zinc-50 border-slate-100 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                                          : "bg-white border-dashed border-slate-200 text-zinc-400 dark:bg-zinc-900/10 dark:border-zinc-800/60"
                                    }`}
                                  >
                                    <Bed
                                      className={`h-5 w-5 mx-auto ${isMyBed ? "animate-pulse" : ""}`}
                                    />
                                    <span className="block text-[10px] font-black">
                                      Bed {idx + 1}
                                    </span>
                                    <span className="block text-[8px] font-bold uppercase tracking-wider opacity-85">
                                      {isMyBed
                                        ? "You"
                                        : isOccupied
                                          ? "Occupied"
                                          : "Empty"}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Roommates Coordinates */}
                      <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 space-y-4">
                        <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                          My Roommates ({activeRoommates.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {activeRoommates.length > 0 ? (
                            activeRoommates.map((mate: any) => (
                              <div
                                key={mate.id}
                                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-50 dark:border-zinc-800/50 bg-slate-50/30 dark:bg-zinc-950/20"
                              >
                                <div className="h-10 w-10 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 flex items-center justify-center font-black text-xs">
                                  {mate.studentName
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate">
                                    {mate.studentName}
                                  </span>
                                  <span className="block text-[10px] text-zinc-400 mt-0.5 truncate">
                                    ID: {mate.studentNumber} • Sec{" "}
                                    {mate.section}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 py-6 text-center">
                              <p className="text-xs text-zinc-400 italic">
                                You currently do not have any registered
                                roommates in this room.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Dormitory Information & Guidelines */}
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 space-y-5">
                        <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-50 dark:border-zinc-800">
                          Dormitory Information
                        </h4>
                        <div className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-400">
                          <div>
                            <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              Building Code
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                              {activeDorm.buildingCode}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              Designated Wing
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                              {activeDorm.gender} Wing Only
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              Floors Count
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                              {activeDorm.numberOfFloors} Residential Floors
                            </span>
                          </div>
                          {activeDorm.description && (
                            <div>
                              <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                Description
                              </span>
                              <p className="mt-1 leading-relaxed">
                                {activeDorm.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-6 bg-red-50/5 dark:bg-zinc-950/10 space-y-4">
                        <h4 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">
                          Residential Guidelines
                        </h4>
                        <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-2.5 font-medium">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 font-bold">
                              •
                            </span>
                            <span>
                              <strong>Quiet Hours:</strong> Curfew starts at
                              22:00 until 06:00. Maintain conversational noise
                              volumes.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 font-bold">
                              •
                            </span>
                            <span>
                              <strong>Guest Regulations:</strong> No overnight
                              non-residents permitted without written supervisor
                              authorization.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5 font-bold">
                              •
                            </span>
                            <span>
                              <strong>Utility Integrity:</strong> Report all
                              water leaks, aircon issues, or electricity faults
                              under the Utilities tab.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                Dorm Room Assignment
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Assigned residential lodging building and roommate coordinates.
              </p>
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                <Bed className="h-12 w-12 text-zinc-300 mb-4 animate-pulse" />
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">
                  No Housing Assigned
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 max-w-sm text-center font-medium leading-relaxed">
                  You do not have any assigned dormitory rooms for this training
                  cycle. If housing was requested, please coordinate with
                  Srisavarindhira clinical operations supervisors.
                </p>
              </div>
            </div>
          );
        })()}

      {/* ==================== 4. TRANSPORTATION TAB ==================== */}
      {activeTab === "transportation" && (
        <div className="space-y-6">
          {/* 1. PERSONAL BOARDING PASS TICKET */}
          {(() => {
            if (!dbStudent) return null;
            const myAssignment = dbTransportAssignments.find(
              (a) => a.studentId === dbStudent.id && a.status === "active",
            );
            if (!myAssignment) {
              return (
                <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 flex items-center gap-4">
                  <div className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 p-3 rounded-xl">
                    <Bus className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                      No Seat Reserved Yet
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      You are not currently assigned to a specific seat on any
                      active shuttle route. Please coordinate with your faculty
                      supervisor to reserve a seat.
                    </p>
                  </div>
                </div>
              );
            }

            const trip = dbTransportSchedules.find(
              (t) => t.id === myAssignment.scheduleId,
            );
            const van = trip
              ? dbVehicles.find((v) => v.id === trip.vehicleId)
              : null;
            const driverObj = trip
              ? mockDB.getDrivers().find((d) => d.id === trip.driverId)
              : null;

            return (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Srisavarindhira Transit Ticket
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-black uppercase">
                    ACTIVE BOARDING PASS
                  </span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                      Route
                    </span>
                    <h4 className="text-base font-black text-zinc-900 dark:text-white">
                      {trip?.route}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-red-500" /> Pickup:{" "}
                      {myAssignment.pickupLocation || "STIN Residence Lobby"}
                    </p>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 md:pl-6 space-y-2">
                    <div>
                      <span className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Departure Time
                      </span>
                      <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">
                        {trip?.departureTime} Daily
                      </p>
                    </div>
                    <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      <p>
                        Vehicle: {van?.model || "Shuttle"} • Plate:{" "}
                        <span className="text-zinc-800 dark:text-white">
                          {van?.plateNumber || "T-999"}
                        </span>
                      </p>
                      <p className="mt-1">
                        Driver: {driverObj?.name || "Driver"} (
                        {driverObj?.phone || "09x-xxxx"})
                      </p>
                    </div>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 md:pl-6 flex flex-col items-start md:items-end justify-center">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1">
                      Your Seat Assignment
                    </span>
                    <div className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 px-4 py-2.5 rounded-2xl flex items-center gap-2">
                      <span className="text-xs font-bold">Seat No.</span>
                      <span className="text-2xl font-black">
                        {myAssignment.seatNumber || "#"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. CHOOSE TRIP TO VIEW PASSENGER MANIFEST & SEAT MAP */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Shuttle Transit Schedules & Manifests
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Browse all available hospital commute shifts, review real-time
              seat occupancy levels, and check clinical training roommates/room
              list on each shuttle.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Schedules */}
              <div className="lg:col-span-5 space-y-3">
                {dbTransportSchedules.map((t) => {
                  const bookingsCount = dbTransportAssignments.filter(
                    (a) => a.scheduleId === t.id && a.status === "active",
                  ).length;
                  const van = dbVehicles.find((v) => v.id === t.vehicleId);
                  const cap = van?.capacity || 14;
                  const fillPercent = Math.min(
                    100,
                    Math.round((bookingsCount / cap) * 100),
                  );

                  return (
                    <div
                      key={t.id}
                      className={`border rounded-xl p-4 transition cursor-pointer ${
                        selectedTripId === t.id
                          ? "border-red-500 bg-red-50/5"
                          : "border-slate-100 hover:border-slate-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                      }`}
                      onClick={() => setSelectedTripId(t.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 dark:text-white">
                            {t.route}
                          </h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5 font-bold flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Pickup:{" "}
                            {t.pickupLocation || "STIN Hub"}
                          </p>
                        </div>
                        <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                          {t.departureTime}
                        </span>
                      </div>

                      {/* Seat indicator progress bar */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase text-zinc-500">
                          <span>Seat Occupancy</span>
                          <span>
                            {bookingsCount} / {cap} Seats used
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-850">
                          <div
                            style={{ width: `${fillPercent}%` }}
                            className={`h-full rounded-full transition-all ${
                              fillPercent >= 100
                                ? "bg-red-500"
                                : fillPercent >= 75
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-slate-50 dark:border-zinc-800/50 flex items-center justify-between text-[10px] font-semibold text-zinc-400">
                        <span>Fleet: {van?.model || "Shuttle"}</span>
                        <span className="text-red-600 dark:text-red-400 font-bold hover:underline">
                          View Passenger List &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Visual Cabin and Passengers directory */}
              <div className="lg:col-span-7">
                {selectedTripId ? (
                  (() => {
                    const trip = dbTransportSchedules.find(
                      (t) => t.id === selectedTripId,
                    );
                    if (!trip) return null;
                    const van = dbVehicles.find((v) => v.id === trip.vehicleId);
                    const driverObj = mockDB
                      .getDrivers()
                      .find((d) => d.id === trip.driverId);
                    const bookings = dbTransportAssignments.filter(
                      (a) =>
                        a.scheduleId === selectedTripId &&
                        a.status === "active",
                    );
                    const totalSeats = van?.capacity || 14;

                    return (
                      <div className="border border-slate-100 p-5 rounded-xl dark:border-zinc-800 bg-slate-50/5 space-y-6">
                        <div className="border-b border-slate-100 pb-3 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                              MANIFEST VIEWER
                            </span>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">
                              {trip.route}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-bold">
                              Departure: {trip.departureTime} • Driver:{" "}
                              {driverObj?.name || "Faculty Staff"}
                            </p>
                          </div>
                          <div className="text-right text-[11px] font-black text-zinc-500">
                            Seat Booking: {bookings.length} / {totalSeats} Used
                          </div>
                        </div>

                        {/* Visual Cabin Grid */}
                        <div>
                          <p className="text-[10px] font-black uppercase text-zinc-400 mb-3 tracking-widest text-center">
                            🚐 FRONT WINDSHIELD
                          </p>
                          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                            {/* Driver captain seat placeholder */}
                            <div className="col-span-1 bg-slate-100 dark:bg-zinc-800 border border-dashed border-slate-300 dark:border-zinc-700 p-2 rounded-lg flex flex-col items-center justify-center opacity-60 h-14">
                              <span className="text-[8px] font-black text-zinc-400">
                                DRIVER
                              </span>
                              <span className="text-[10px] font-bold text-zinc-500">
                                👨‍✈️ Capt
                              </span>
                            </div>

                            <div className="col-span-1" />

                            {/* Render all passenger seat assignments */}
                            {(() => {
                              const gridSeats = [];
                              for (let i = 1; i <= totalSeats; i++) {
                                const b = bookings.find(
                                  (a) => a.seatNumber === i,
                                );
                                const passenger = b
                                  ? dbStudents.find((s) => s.id === b.studentId)
                                  : null;
                                const isMe =
                                  passenger &&
                                  dbStudent &&
                                  passenger.id === dbStudent.id;

                                gridSeats.push(
                                  <div key={i} className="col-span-1">
                                    {passenger ? (
                                      <div
                                        className={`p-2 rounded-lg text-center h-14 flex flex-col justify-center border transition ${
                                          isMe
                                            ? "bg-red-600 border-red-700 text-white"
                                            : "bg-zinc-900 border-zinc-850 text-white dark:bg-zinc-950 dark:border-zinc-800"
                                        }`}
                                      >
                                        <span className="text-[8px] font-black text-zinc-400 block mb-0.5">
                                          Seat #{i}
                                        </span>
                                        <p className="text-[10px] font-black truncate px-0.5">
                                          {isMe
                                            ? "YOU"
                                            : passenger.studentName
                                                .split(" ")
                                                .slice(1)
                                                .join(" ") ||
                                              passenger.studentName}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="bg-white border-2 border-dashed border-slate-100 p-2 rounded-lg text-center h-14 flex flex-col justify-center text-zinc-300 dark:bg-zinc-900 dark:border-zinc-850">
                                        <span className="text-[8px] font-black text-zinc-400 block mb-0.5">
                                          Seat #{i}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-zinc-400">
                                          Free
                                        </span>
                                      </div>
                                    )}
                                  </div>,
                                );
                              }
                              return gridSeats;
                            })()}
                          </div>
                        </div>

                        {/* Passenger list roster with names and ID */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">
                            Passenger Manifest List ({bookings.length} Students)
                          </span>
                          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                            {bookings.map((b) => {
                              const passenger = dbStudents.find(
                                (s) => s.id === b.studentId,
                              );
                              if (!passenger) return null;
                              const isMe =
                                dbStudent && passenger.id === dbStudent.id;

                              return (
                                <div
                                  key={b.id}
                                  className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 p-2.5 rounded-xl flex items-center justify-between text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                        isMe
                                          ? "bg-red-600 text-white"
                                          : "bg-slate-100 text-zinc-600 dark:bg-zinc-850 dark:text-zinc-300"
                                      }`}
                                    >
                                      Seat #{b.seatNumber || "?"}
                                    </span>
                                    <div>
                                      <p className="font-bold text-zinc-800 dark:text-zinc-200">
                                        {passenger.studentName}{" "}
                                        {isMe && (
                                          <span className="text-red-500 font-black italic ml-1">
                                            (YOU)
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-[9px] text-zinc-400 font-bold">
                                        ID: {passenger.studentNumber} • Section:{" "}
                                        {passenger.section}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-black text-zinc-400">
                                    {passenger.academicYear}
                                  </span>
                                </div>
                              );
                            })}
                            {bookings.length === 0 && (
                              <p className="text-xs text-zinc-400 text-center py-4 italic">
                                No passengers assigned yet.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200 dark:border-zinc-850 bg-white rounded-xl dark:bg-zinc-900 text-center">
                    <Bus className="h-8 w-8 text-zinc-300 mb-2" />
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
                      No Trip Selected
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 max-w-xs">
                      Click any of the scheduled commutes on the left to inspect
                      the visual seat layout and passenger manifest.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. WATER & ELECTRICITY TAB ==================== */}
      {activeTab === "utilities" &&
        (() => {
          const currentStudent = dbStudents.find(
            (s) => s.email === profile.email,
          );
          const myBills = currentStudent
            ? dbBills.filter((b) => b.tenantId === currentStudent.id)
            : [];
          const currentBill =
            myBills.find((b) => b.billId === activeBillId) || myBills[0];

          return (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-500" /> Water &
                      Electricity Billing
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Review your monthly shared room utilities and upload bank
                      payment receipts.
                    </p>
                  </div>
                  {myBills.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400">
                        Select Month:
                      </span>
                      <select
                        value={currentBill?.billId || ""}
                        onChange={(e) => setActiveBillId(e.target.value)}
                        className="rounded-lg border border-slate-100 bg-white px-2 py-1 text-xs font-semibold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                      >
                        {myBills.map((b) => (
                          <option key={b.billId} value={b.billId}>
                            {b.month} {b.year} (฿{b.totalAmount.toFixed(0)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {!currentBill ? (
                  <div className="text-center py-12 border border-dashed rounded-xl">
                    <span className="text-3xl">🎉</span>
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-wider mt-2">
                      All settled up!
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1">
                      No utility bills have been generated for you yet. Enjoy
                      your stay!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Cost Breakdown Card */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="rounded-2xl border border-slate-100 p-5 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-950/20 space-y-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                              Room{" "}
                              {dbRooms.find((r) => r.id === currentBill.roomId)
                                ?.roomNumber || currentBill.roomId}{" "}
                              • {currentBill.month} {currentBill.year}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                currentBill.status === "Paid"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                  : currentBill.status === "Pending"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                                    : currentBill.status === "Rejected"
                                      ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800"
                              }`}
                            >
                              {currentBill.status}
                            </span>
                          </div>
                          <h4 className="text-3xl font-black text-zinc-900 dark:text-white mt-2">
                            ฿{currentBill.totalAmount.toFixed(2)}
                          </h4>
                        </div>

                        {/* Line Item breakdown */}
                        <div className="space-y-2.5 text-xs font-semibold text-zinc-500 border-t pt-4 dark:border-zinc-800">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5">
                              <Droplets className="h-3.5 w-3.5 text-blue-500" />{" "}
                              Water Share ({currentBill.waterUnit} units)
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-white">
                              ฿{currentBill.waterAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5">
                              <Zap className="h-3.5 w-3.5 text-amber-500" />{" "}
                              Electricity Share ({currentBill.electricUnit}{" "}
                              kW/h)
                            </span>
                            <span className="font-bold text-zinc-800 dark:text-white">
                              ฿{currentBill.electricAmount.toFixed(2)}
                            </span>
                          </div>

                          {/* Adjustments (if any) */}
                          {currentBill.adjustmentAmount !== 0 && (
                            <div className="flex justify-between items-center text-red-600 dark:text-red-400 bg-red-50/20 dark:bg-red-950/10 p-2 rounded-lg border border-red-100/50">
                              <span className="font-black text-[10px] uppercase">
                                Adjustment / Subsidy (
                                {currentBill.adjustmentNote || "Staff Adj"})
                              </span>
                              <span className="font-black">
                                {currentBill.adjustmentAmount > 0 ? "+" : ""}฿
                                {currentBill.adjustmentAmount.toFixed(2)}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-3 flex justify-between font-bold text-sm text-zinc-900 dark:text-white">
                            <span>Final Total Cost</span>
                            <span className="font-black text-red-600">
                              ฿{currentBill.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Admin feedback if rejected */}
                        {currentBill.status === "Rejected" &&
                          currentBill.rejectionNote && (
                            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">
                                Rejection Reason From Admin
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-bold">
                                {currentBill.rejectionNote}
                              </p>
                            </div>
                          )}
                      </div>

                      {/* QR Code static prompt */}
                      <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-2xl border text-center space-y-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                          Standard PromptPay QR
                        </span>
                        <div className="w-32 h-32 bg-white p-1 rounded-xl mx-auto border flex items-center justify-center">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-STIN-UTILITIES"
                            alt="PromptPay Scan"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-bold">
                          STIN Dorm Room QR Generator
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Upload Payment Receipt Slip */}
                    <div className="lg:col-span-7 space-y-4">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        Upload Payment Verification Slip
                      </span>

                      {currentBill.status === "Paid" ? (
                        <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-8 text-center space-y-3 dark:border-emerald-950/30">
                          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <Check className="h-6 w-6" />
                          </div>
                          <h4 className="text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                            Bill Fully Paid
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                            Payment has been approved and audited by
                            supervisors. Thank you for your cooperation!
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitSlip} className="space-y-4">
                          <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition text-center cursor-pointer ${
                              dragActive
                                ? "border-red-600 bg-red-50/5"
                                : "border-slate-200 dark:border-zinc-800"
                            }`}
                          >
                            {slipPreview ? (
                              <div className="space-y-3">
                                <img
                                  src={slipPreview}
                                  alt="Slip slip preview"
                                  className="max-h-60 object-contain mx-auto border rounded-lg"
                                />
                                <p className="text-xs text-emerald-600 font-bold">
                                  Transfer Slip cataloged. Ready to upload.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3 py-4">
                                <Upload className="h-10 w-10 text-zinc-300 mx-auto animate-bounce" />
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">
                                  Drag and drop bank slip or click to browse
                                </p>
                                <p className="text-[10px] text-zinc-400 font-semibold">
                                  Supports PNG, JPG, JPEG up to 5MB
                                </p>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              id="slip-upload-file"
                            />
                            {!slipPreview && (
                              <label
                                htmlFor="slip-upload-file"
                                className="mt-2 inline-block rounded-xl bg-zinc-950 text-white px-4 py-1.5 text-xs font-black hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 cursor-pointer"
                              >
                                Browse File
                              </label>
                            )}
                          </div>

                          {slipPreview && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setSlipPreview(null)}
                                className="bg-slate-100 hover:bg-slate-200 text-zinc-800 font-black text-xs px-4 py-2.5 rounded-xl transition cursor-pointer dark:bg-zinc-800 dark:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 text-white font-black text-xs py-2.5 rounded-xl hover:bg-red-500 transition cursor-pointer shadow-sm"
                              >
                                <Check className="h-4 w-4" /> Submit Payment
                                Slip
                              </button>
                            </div>
                          )}
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

      {/* ==================== 6. DOCUMENTS TAB ==================== */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Upload Placement Records
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Publish clinical evaluation timesheets or logs back to your
              academic teacher.
            </p>

            <form onSubmit={handleUploadDoc} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Log or Timesheet Title"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-red-600 text-white font-black text-xs px-4 py-2 rounded-xl hover:bg-red-500 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Upload Log
              </button>
            </form>

            <div className="space-y-3">
              {studentDocs.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-100 p-3.5 dark:border-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {d.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold">
                    {d.uploadedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. ANNOUNCEMENTS TAB ==================== */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Announcements Noticeboard
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Latest notifications from Srisavarindhira clinical operations
              faculty.
            </p>

            <div className="space-y-4">
              {announcements
                .filter((a: any) => {
                  if (!a.targetType || a.targetType === "all") return true;
                  if (!practiceAssignments || practiceAssignments.length === 0)
                    return false;
                  return practiceAssignments.some((pa) => {
                    if (a.targetType === "course")
                      return pa.courseId === a.targetId;
                    if (a.targetType === "group")
                      return pa.practiceGroupId === a.targetId;
                    if (a.targetType === "hospital")
                      return pa.trainingSiteId === a.targetId;
                    return false;
                  });
                })
                .map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-slate-100 p-5 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${a.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
                        >
                          {a.priority}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-bold">
                          Posted by {a.author}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-bold">
                        {a.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white mt-3">
                      {a.title}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                      {a.content}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 8. PROFILE TAB ==================== */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Student Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Update contact particulars and visual avatar reference.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover border border-red-200"
                />
                <div>
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-zinc-400 font-semibold">
                    {profile.studentId} • {profile.year}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1 bg-red-600 text-white font-black text-xs px-4 py-2.5 rounded-xl hover:bg-red-500 transition cursor-pointer shadow-sm"
              >
                <Check className="h-4 w-4" /> Save Profile Updates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
