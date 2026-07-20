import { useState, useEffect } from "react";
const mockDB = {
  getHospitals: () => [],
  getVehicles: () => [],
  getDrivers: () => [],
  getBuildings: () => [],
  getRooms: () => [],
  getStudents: () => [],
  getTransportSchedules: () => [],
} as any;
import {
  Users,
  MapPin,
  Bed,
  Bus,
  Zap,
  FileText,
  Megaphone,
  BarChart3,
  Settings,
  Plus,
  Check,
  X,
  FileDown,
  Upload,
  Trash2,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Edit2,
  Calendar,
  Trash,
  ClipboardList,
  Droplets,
  Eye,
  Home,
} from "lucide-react";
import { useTrainingGroups } from "../../hooks/useTrainingGroups";
import {
  Building,
  Room,
  RoomAssignment,
  Student,
  Vehicle,
  Driver,
  TransportSchedule,
  TransportAssignment,
  Bill,
  Payment,
} from "../../types/db";

interface TeacherTabsProps {
  activeTab: string;
}

export function TeacherTabs({ activeTab }: TeacherTabsProps) {
  // ---- Local Persistence States ----
  const {
    trainingGroups: groups,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useTrainingGroups();

  const [sites, setSites] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_training_sites");
    return saved ? JSON.parse(saved) : [];
  });

  const [dorms, setDorms] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_dorm_rooms");
    return saved ? JSON.parse(saved) : [];
  });

  const [vehicles, setVehicles] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_vehicles");
    return saved ? JSON.parse(saved) : [];
  });

  const [bills, setBills] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_utility_bills");
    return saved ? JSON.parse(saved) : [];
  });

  const [documents, setDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_documents");
    return saved ? JSON.parse(saved) : [];
  });

  const [announcements, setAnnouncements] = useState<any[]>(() => {
    const saved = localStorage.getItem("stin_announcements");
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-sync states to localStorage
  useEffect(() => {
    localStorage.setItem("stin_training_sites", JSON.stringify(sites));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem("stin_dorm_rooms", JSON.stringify(dorms));
  }, [dorms]);

  useEffect(() => {
    localStorage.setItem("stin_vehicles", JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem("stin_utility_bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem("stin_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("stin_announcements", JSON.stringify(announcements));
  }, [announcements]);

  const triggerToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Sub-tab interactive handlers ----
  const [searchQuery, setSearchQuery] = useState("");

  // ---- Real-time Database States ----
  const [dbBuildings, setDbBuildings] = useState<Building[]>(() =>
    [],
  );
  const [dbRooms, setDbRooms] = useState<Room[]>(() => []);
  const [dbAssignments, setDbAssignments] = useState<RoomAssignment[]>(() =>
    [],
  );
  const [dbStudents, setDbStudents] = useState<Student[]>(() =>
    [],
  );
  const [dbVehicles, setDbVehicles] = useState<Vehicle[]>(() =>
    [],
  );
  const [dbDrivers, setDbDrivers] = useState<Driver[]>(() =>
    [],
  );
  const [dbTransportSchedules, setDbTransportSchedules] = useState<
    TransportSchedule[]
  >(() => []);
  const [dbTransportAssignments, setDbTransportAssignments] = useState<
    TransportAssignment[]
  >(() => []);
  const [dbBills, setDbBills] = useState<Bill[]>(() => []);
  const [dbPayments, setDbPayments] = useState<Payment[]>(() =>
    [],
  );

  useEffect(() => {
    const handleUpdate = () => {
      setDbBuildings([]);
      setDbRooms([]);
      setDbAssignments([]);
      setDbStudents([]);
      setDbVehicles([]);
      setDbDrivers([]);
      setDbTransportSchedules([]);
      setDbTransportAssignments([]);
      setDbBills([]);
      setDbPayments([]);
    };
    window.addEventListener("cpatms_db_update", handleUpdate);
    return () => window.removeEventListener("cpatms_db_update", handleUpdate);
  }, []);

  // ---- New Utilities Tab States ----
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("สิงหาคม");
  const [selectedYear, setSelectedYear] = useState<string>("2569");

  // Water Meter States
  const [waterRate, setWaterRate] = useState<number>(10);
  const [prevWaterMeter, setPrevWaterMeter] = useState<number>(0);
  const [currWaterMeter, setCurrWaterMeter] = useState<number>(0);
  const [waterAmountOverride, setWaterAmountOverride] = useState<string>("");

  // Electricity Meter States
  const [electricRate, setElectricRate] = useState<number>(5);
  const [prevElectricMeter, setPrevElectricMeter] = useState<number>(0);
  const [currElectricMeter, setCurrElectricMeter] = useState<number>(0);
  const [electricAmountOverride, setElectricAmountOverride] =
    useState<string>("");

  const [otherCharges, setOtherCharges] = useState<number>(0);
  const [roomBillNotes, setRoomBillNotes] = useState<string>("");

  // Individual Student Adjustments
  // Map of studentId -> { adjustment: number, note: string }
  const [adjustments, setAdjustments] = useState<
    Record<string, { adjustment: number; note: string }>
  >({});

  // Active sub-tab inside Utilities Tab
  const [utilitiesSubTab, setUtilitiesSubTab] = useState<
    "record" | "rooms" | "ledger"
  >("record");

  // Ledger Filter states
  const [ledgerMonth, setLedgerMonth] = useState<string>("");
  const [ledgerYear, setLedgerYear] = useState<string>("");
  const [ledgerRoomId, setLedgerRoomId] = useState<string>("");
  const [ledgerStatus, setLedgerStatus] = useState<string>("");

  // Active slip verification
  const [verifyingPayment, setVerifyingPayment] = useState<Payment | null>(
    null,
  );
  const [rejectionRemark, setRejectionRemark] = useState<string>("");

  // Compact Room Assignment helper states
  const [assignRoomSelectedStudentId, setAssignRoomSelectedStudentId] =
    useState<string>("");

  // Simple Room Assignment Handlers
  const handleAssignRoom = (studentId: string, roomId: string) => {
    if (!studentId || !roomId) return;
    const students = [];
    const student = students.find((s) => s.id === studentId);
    if (student) {
      student.roomId = roomId;
      void 0;

    }
  };

  const handleGenerateBills = (e: any) => {
    e.preventDefault();
    // Reset Form
    setPrevWaterMeter(0);
    setCurrWaterMeter(0);
    setWaterAmountOverride("");
    setPrevElectricMeter(0);
    setCurrElectricMeter(0);
    setElectricAmountOverride("");
    setOtherCharges(0);
    setRoomBillNotes("");
    setAdjustments({});

    window.dispatchEvent(
      new CustomEvent("cpatms_db_update", { detail: { key: "cpatms_bills" } }),
    );
    triggerToast("สร้างบิลและเฉลี่ยค่าน้ำ/ค่าไฟเรียบร้อยแล้ว");
    setUtilitiesSubTab("ledger");
  };

  const handleApproveSlip = (paymentId: string) => {
    const payments = [];
    const billsList = [];

    const paymentIndex = payments.findIndex((p) => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      triggerToast("ไม่พบข้อมูลการชำระเงิน", "error");
      return;
    }

    const payment = payments[paymentIndex];
    payment.status = "Approved";
    payment.approvedBy = "admin-123";
    payment.approvedAt = new Date().toISOString();
    void 0;

    const billIndex = billsList.findIndex((b) => b.billId === payment.billId);
    if (billIndex !== -1) {
      billsList[billIndex].status = "Paid";
      void 0;
    }

    void 0;

    setVerifyingPayment(null);
    window.dispatchEvent(
      new CustomEvent("cpatms_db_update", {
        detail: { key: "cpatms_payments" },
      }),
    );
    triggerToast("อนุมัติยอดชำระเงินเรียบร้อยแล้ว");
  };

  const handleRejectSlip = (paymentId: string) => {
    if (!rejectionRemark.trim()) {
      triggerToast("กรุณาระบุเหตุผลการปฏิเสธ", "error");
      return;
    }

    const payments = [];
    const billsList = [];

    const paymentIndex = payments.findIndex((p) => p.paymentId === paymentId);
    if (paymentIndex === -1) {
      triggerToast("ไม่พบข้อมูลการชำระเงิน", "error");
      return;
    }

    const payment = payments[paymentIndex];
    payment.status = "Rejected";
    payment.remark = rejectionRemark;
    void 0;

    const billIndex = billsList.findIndex((b) => b.billId === payment.billId);
    if (billIndex !== -1) {
      billsList[billIndex].status = "Rejected";
      void 0;
    }

    void 0;

    setVerifyingPayment(null);
    setRejectionRemark("");
    window.dispatchEvent(
      new CustomEvent("cpatms_db_update", {
        detail: { key: "cpatms_payments" },
      }),
    );
    triggerToast("ปฏิเสธยอดชำระเงินเรียบร้อยแล้ว");
  };

  const handleDeleteTeacherBill = (billId: string) => {
    const list = [];
    const bill = list.find((b) => b.billId === billId);
    if (!bill) {
      triggerToast("ไม่พบข้อมูลบิล", "error");
      return;
    }

    const newList = list.filter((b) => b.billId !== billId);
    void 0;

    const payments = [];
    const newPayments = payments.filter((p) => p.billId !== billId);
    void 0;

    void 0;

    window.dispatchEvent(
      new CustomEvent("cpatms_db_update", { detail: { key: "cpatms_bills" } }),
    );
    triggerToast("ลบรายการบิลเรียบร้อยแล้ว");
  };

  // Create Dormitory Form State
  const [showCreateDormForm, setShowCreateDormForm] = useState(false);
  const [newDormName, setNewDormName] = useState("");
  const [newDormCode, setNewDormCode] = useState("");
  const [newDormGender, setNewDormGender] = useState<
    "Male" | "Female" | "Mixed"
  >("Mixed");
  const [newDormFloors, setNewDormFloors] = useState(3);
  const [newDormAddress, setNewDormAddress] = useState("");
  const [newDormDesc, setNewDormDesc] = useState("");

  // Create Room Form State
  const [showCreateRoomForm, setShowCreateRoomForm] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomDormId, setNewRoomDormId] = useState("");
  const [newRoomGender, setNewRoomGender] = useState<
    "Male" | "Female" | "Mixed"
  >("Mixed");
  const [newRoomCapacity, setNewRoomCapacity] = useState(4);

  // Assignment/Move States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRoomForAssign, setSelectedRoomForAssign] =
    useState<Room | null>(null);
  const [assignStudentId, setAssignStudentId] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [studentToMove, setStudentToMove] = useState<Student | null>(null);
  const [moveFromRoom, setMoveFromRoom] = useState<Room | null>(null);
  const [moveToRoomId, setMoveToRoomId] = useState("");

  // Editing Capacity
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingCapacityValue, setEditingCapacityValue] = useState<
    number | null
  >(null);

  // Filters
  const [selectedDormId, setSelectedDormId] = useState<string>("all");
  const [selectedRoomGender, setSelectedRoomGender] = useState<string>("all");

  // ---- Transportation Management States ----
  const [showCreateVanForm, setShowCreateVanForm] = useState(false);
  const [newVanPlate, setNewVanPlate] = useState("");
  const [newVanModel, setNewVanModel] = useState("");
  const [newVanCapacity, setNewVanCapacity] = useState(14);
  const [newVanStatus, setNewVanStatus] = useState<
    "active" | "maintenance" | "inactive"
  >("active");

  const [showCreateTripForm, setShowCreateTripForm] = useState(false);
  const [newTripRoute, setNewTripRoute] = useState("");
  const [newTripPickup, setNewTripPickup] = useState("");
  const [newTripDeparture, setNewTripDeparture] = useState("");
  const [newTripVehicleId, setNewTripVehicleId] = useState("");
  const [newTripDriverId, setNewTripDriverId] = useState("");
  const [newTripStatus, setNewTripStatus] = useState<
    "scheduled" | "in-progress" | "completed" | "cancelled"
  >("scheduled");

  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [assigningSeatNumber, setAssigningSeatNumber] = useState<number | null>(
    null,
  );
  const [showAssignSeatModal, setShowAssignSeatModal] = useState(false);
  const [selectedStudentForSeat, setSelectedStudentForSeat] = useState("");
  const [studentAssignSearch, setStudentAssignSearch] = useState("");

  // Core Dormitory & Room Management Handlers
  const handleCreateDormitory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDormName || !newDormCode) {
      triggerToast("Dormitory Name and Code are required.", "error");
      return;
    }
    const list = [];
    const newDorm: Building = {
      id: `b-dorm-${Date.now()}`,
      hospitalId: "h-siriraj",
      buildingCode: newDormCode,
      buildingName: newDormName,
      buildingType: "Dormitory",
      numberOfFloors: Number(newDormFloors),
      totalRooms: 0,
      totalBeds: 0,
      gender: newDormGender,
      address: newDormAddress,
      description: newDormDesc,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "teacher",
      updatedBy: "teacher",
    };
    list.unshift(newDorm);
    void 0;

    triggerToast("Dormitory created successfully!");
    setShowCreateDormForm(false);
    setNewDormName("");
    setNewDormCode("");
    setNewDormFloors(3);
    setNewDormAddress("");
    setNewDormDesc("");
  };

  const handleDeleteDormitory = (dormId: string) => {
    // Confirm delete and clean up rooms associated
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this dormitory? All rooms inside will be orphaned or must be deleted.",
    );
    if (!confirmDelete) return;

    // Check if rooms inside are occupied
    const roomsInDorm = dbRooms.filter((r) => r.buildingId === dormId);
    const hasOccupancy = roomsInDorm.some((r) => r.occupiedCount > 0);
    if (hasOccupancy) {
      triggerToast(
        "Cannot delete dormitory: Some rooms contain currently assigned students.",
        "error",
      );
      return;
    }

    // Delete rooms in dorm
    const allRooms = [];
    const updatedRooms = allRooms.filter((r) => r.buildingId !== dormId);
    void 0;

    // Delete building
    const allBuildings = [];
    const updatedBuildings = allBuildings.filter((b) => b.id !== dormId);
    void 0;

    triggerToast("Dormitory and associated empty rooms deleted successfully.");
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomDormId) {
      triggerToast(
        "Room Number and Dormitory selection are required.",
        "error",
      );
      return;
    }
    const capVal = Number(newRoomCapacity);
    if (capVal <= 0 || capVal > 8) {
      triggerToast(
        "Room capacity cannot exceed the maximum safety limit of 8 bed spaces.",
        "error",
      );
      return;
    }

    const roomsList = [];
    const isDuplicate = roomsList.some(
      (r) => r.buildingId === newRoomDormId && r.roomNumber === newRoomNumber,
    );
    if (isDuplicate) {
      triggerToast("Room number already exists in this dormitory.", "error");
      return;
    }

    const newRoom: Room = {
      id: `r-dorm-${Date.now()}`,
      roomNumber: newRoomNumber,
      buildingId: newRoomDormId,
      gender: newRoomGender,
      capacity: capVal,
      occupiedCount: 0,
      status: "active",
    };
    roomsList.push(newRoom);
    void 0;

    // Update associated building stats
    const buildingsList = [];
    const bIndex = buildingsList.findIndex((b) => b.id === newRoomDormId);
    if (bIndex !== -1) {
      buildingsList[bIndex] = {
        ...buildingsList[bIndex],
        totalRooms: (buildingsList[bIndex].totalRooms || 0) + 1,
        totalBeds: (buildingsList[bIndex].totalBeds || 0) + capVal,
      };
      void 0;
    }

    triggerToast(
      `Room ${newRoomNumber} created successfully with capacity of ${capVal}!`,
    );
    setShowCreateRoomForm(false);
    setNewRoomNumber("");
    setNewRoomCapacity(4);
  };

  const handleDeleteRoom = (roomId: string) => {
    const targetRoom = dbRooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    if (targetRoom.occupiedCount > 0) {
      triggerToast(
        "Cannot delete room: Room is currently occupied. Please unassign students first.",
        "error",
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete Room ${targetRoom.roomNumber}?`,
    );
    if (!confirmDelete) return;

    const allRooms = [];
    const updatedRooms = allRooms.filter((r) => r.id !== roomId);
    void 0;

    // Update building stats
    const buildingsList = [];
    const bIndex = buildingsList.findIndex(
      (b) => b.id === targetRoom.buildingId,
    );
    if (bIndex !== -1) {
      buildingsList[bIndex] = {
        ...buildingsList[bIndex],
        totalRooms: Math.max(0, (buildingsList[bIndex].totalRooms || 1) - 1),
        totalBeds: Math.max(
          0,
          (buildingsList[bIndex].totalBeds || targetRoom.capacity) -
            targetRoom.capacity,
        ),
      };
      void 0;
    }

    triggerToast(`Room ${targetRoom.roomNumber} deleted successfully.`);
  };

  const handleSetCapacity = (roomId: string, newCap: number) => {
    if (newCap <= 0 || newCap > 8) {
      triggerToast(
        "Room capacity cannot exceed the maximum safety limit of 8 bed spaces.",
        "error",
      );
      return;
    }

    const roomsList = [];
    const rIndex = roomsList.findIndex((r) => r.id === roomId);
    if (rIndex === -1) return;

    const currentRoom = roomsList[rIndex];
    if (newCap < currentRoom.occupiedCount) {
      triggerToast(
        `Cannot decrease capacity below current occupancy of ${currentRoom.occupiedCount} students.`,
        "error",
      );
      return;
    }

    const oldCap = currentRoom.capacity;
    currentRoom.capacity = newCap;
    if (currentRoom.occupiedCount >= newCap) {
      currentRoom.status = "full";
    } else {
      currentRoom.status = "active";
    }
    void 0;

    const buildingsList = [];
    const bIndex = buildingsList.findIndex(
      (b) => b.id === currentRoom.buildingId,
    );
    if (bIndex !== -1) {
      buildingsList[bIndex] = {
        ...buildingsList[bIndex],
        totalBeds: (buildingsList[bIndex].totalBeds || 0) - oldCap + newCap,
      };
      void 0;
    }

    triggerToast(
      `Room ${currentRoom.roomNumber} capacity updated to ${newCap}!`,
    );
    setEditingRoomId(null);
  };

  const handleAssignStudent = () => {
    if (!assignStudentId || !selectedRoomForAssign) {
      triggerToast("Please select a student to assign.", "error");
      return;
    }

    const roomsList = [];
    const rIndex = roomsList.findIndex(
      (r) => r.id === selectedRoomForAssign.id,
    );
    if (rIndex === -1) return;

    const room = roomsList[rIndex];
    if (room.occupiedCount >= room.capacity) {
      triggerToast("This room is already at full capacity.", "error");
      return;
    }

    const studentsList = [];
    const sIndex = studentsList.findIndex((s) => s.id === assignStudentId);
    if (sIndex === -1) return;

    const student = studentsList[sIndex];
    student.roomId = room.id;
    student.updatedAt = new Date().toISOString();
    void 0;

    room.occupiedCount = (room.occupiedCount || 0) + 1;
    if (room.occupiedCount >= room.capacity) {
      room.status = "full";
    }
    void 0;

    const assignmentList = [];
    const newAssignment: RoomAssignment = {
      id: `ra-${Date.now()}`,
      roomId: room.id,
      studentId: student.id,
      academicYearId: "ay-2569",
      semester: "1",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "2026-10-31",
      status: "active",
    };
    assignmentList.push(newAssignment);
    void 0;

    triggerToast(`Assigned ${student.studentName} to Room ${room.roomNumber}!`);
    setShowAssignModal(false);
    setAssignStudentId("");
    setSelectedRoomForAssign(null);
  };

  const handleMoveStudent = () => {
    if (!studentToMove || !moveToRoomId) {
      triggerToast("Please select a destination room.", "error");
      return;
    }

    const roomsList = [];
    const oldRoomIndex = roomsList.findIndex(
      (r) => r.id === studentToMove.roomId,
    );
    const newRoomIndex = roomsList.findIndex((r) => r.id === moveToRoomId);

    if (newRoomIndex === -1) return;
    const newRoom = roomsList[newRoomIndex];

    if (newRoom.occupiedCount >= newRoom.capacity) {
      triggerToast("The destination room is at full capacity.", "error");
      return;
    }

    const studentsList = [];
    const sIndex = studentsList.findIndex((s) => s.id === studentToMove.id);
    if (sIndex === -1) return;

    const student = studentsList[sIndex];
    student.roomId = newRoom.id;
    student.updatedAt = new Date().toISOString();
    void 0;

    if (oldRoomIndex !== -1) {
      const oldRoom = roomsList[oldRoomIndex];
      oldRoom.occupiedCount = Math.max(0, (oldRoom.occupiedCount || 1) - 1);
      oldRoom.status = "active";
    }

    newRoom.occupiedCount = (newRoom.occupiedCount || 0) + 1;
    if (newRoom.occupiedCount >= newRoom.capacity) {
      newRoom.status = "full";
    }

    void 0;

    const assignmentList = [];
    assignmentList.forEach((a) => {
      if (a.studentId === student.id && a.status === "active") {
        a.status = "completed";
      }
    });

    const newAssignment: RoomAssignment = {
      id: `ra-${Date.now()}`,
      roomId: newRoom.id,
      studentId: student.id,
      academicYearId: "ay-2569",
      semester: "1",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "2026-10-31",
      status: "active",
    };
    assignmentList.push(newAssignment);
    void 0;

    triggerToast(
      `Successfully moved ${student.studentName} to Room ${newRoom.roomNumber}!`,
    );
    setShowMoveModal(false);
    setStudentToMove(null);
    setMoveFromRoom(null);
    setMoveToRoomId("");
  };

  const handleRemoveStudentFromRoom = (studentId: string, roomId: string) => {
    const studentsList = [];
    const sIndex = studentsList.findIndex((s) => s.id === studentId);
    if (sIndex === -1) return;

    const student = studentsList[sIndex];
    student.roomId = undefined;
    student.bedId = undefined;
    student.updatedAt = new Date().toISOString();
    void 0;

    const roomsList = [];
    const rIndex = roomsList.findIndex((r) => r.id === roomId);
    if (rIndex !== -1) {
      const room = roomsList[rIndex];
      room.occupiedCount = Math.max(0, (room.occupiedCount || 1) - 1);
      room.status = "active";
      void 0;
    }

    const assignmentList = [];
    assignmentList.forEach((a) => {
      if (
        a.studentId === studentId &&
        a.roomId === roomId &&
        a.status === "active"
      ) {
        a.status = "completed";
      }
    });
    void 0;

    triggerToast(`Checked out student from Room.`);
  };

  const handleUnassignRoom = (studentId: string) => {
    const student = dbStudents.find((s) => s.id === studentId);
    if (student && student.roomId) {
      handleRemoveStudentFromRoom(studentId, student.roomId);
    }
  };

  // ---- Transportation Management Handlers ----
  const handleCreateVan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVanPlate || !newVanModel) {
      triggerToast("Plate number and Model are required.", "error");
      return;
    }
    const currentVans = [];
    const newVan: Vehicle = {
      id: `v-${Date.now()}`,
      plateNumber: newVanPlate,
      model: newVanModel,
      capacity: Number(newVanCapacity) || 14,
      status: newVanStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    currentVans.push(newVan);
    void 0;

    triggerToast(`Van ${newVanPlate} created successfully!`);
    setShowCreateVanForm(false);
    setNewVanPlate("");
    setNewVanModel("");
    setNewVanCapacity(14);
    setNewVanStatus("active");
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newTripRoute ||
      !newTripPickup ||
      !newTripDeparture ||
      !newTripVehicleId
    ) {
      triggerToast(
        "Route, Pickup Point, Departure Time, and Van selection are required.",
        "error",
      );
      return;
    }

    const currentTrips = [];
    const newTrip: TransportSchedule = {
      id: `ts-${Date.now()}`,
      vehicleId: newTripVehicleId,
      driverId: newTripDriverId || "d-somchai",
      route: newTripRoute,
      departureTime: newTripDeparture,
      status: newTripStatus,
    };

    (newTrip as any).pickupLocation = newTripPickup;

    currentTrips.push(newTrip);
    void 0;

    triggerToast(`Trip to ${newTripRoute} created successfully!`);
    setShowCreateTripForm(false);
    setNewTripRoute("");
    setNewTripPickup("");
    setNewTripDeparture("");
    setNewTripVehicleId("");
    setNewTripDriverId("");
    setNewTripStatus("scheduled");
  };

  const handleAssignStudentToSeat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeTripId || !assigningSeatNumber || !selectedStudentForSeat) {
      triggerToast("Please select a student and seat.", "error");
      return;
    }

    const trip = dbTransportSchedules.find((t) => t.id === activeTripId);
    if (!trip) return;

    const vehicle = dbVehicles.find((v) => v.id === trip.vehicleId);
    if (!vehicle) return;

    const bookingsForTrip = dbTransportAssignments.filter(
      (a) => a.scheduleId === activeTripId && a.status === "active",
    );

    const studentAlreadyBooked = bookingsForTrip.find(
      (b) => b.studentId === selectedStudentForSeat,
    );
    const existingOccupantOnSeat = bookingsForTrip.find(
      (b) => b.seatNumber === assigningSeatNumber,
    );

    if (
      existingOccupantOnSeat &&
      existingOccupantOnSeat.studentId !== selectedStudentForSeat
    ) {
      triggerToast(`Seat ${assigningSeatNumber} is already occupied.`, "error");
      return;
    }

    if (!studentAlreadyBooked && bookingsForTrip.length >= vehicle.capacity) {
      triggerToast(
        `Cannot assign student. Van capacity (${vehicle.capacity}) exceeded.`,
        "error",
      );
      return;
    }

    let currentBookings = [];

    currentBookings = currentBookings.filter(
      (b) =>
        !(
          b.studentId === selectedStudentForSeat &&
          b.scheduleId === activeTripId
        ),
    );

    const newBooking: TransportAssignment = {
      id: `ta-${Date.now()}`,
      scheduleId: activeTripId,
      studentId: selectedStudentForSeat,
      pickupLocation: (trip as any).pickupLocation || "STIN Campus Residence",
      dropoffLocation: trip.route.split(" ⇄ ")[1] || "Siriraj Hospital",
      status: "active",
    };
    (newBooking as any).seatNumber = assigningSeatNumber;

    currentBookings.push(newBooking);
    void 0;

    const studentObj = dbStudents.find((s) => s.id === selectedStudentForSeat);
    triggerToast(
      `Assigned ${studentObj?.studentName || "Student"} to Seat #${assigningSeatNumber}!`,
    );
    setShowAssignSeatModal(false);
    setSelectedStudentForSeat("");
    setAssigningSeatNumber(null);
    setStudentAssignSearch("");
  };

  const handleUnassignSeat = (bookingId: string) => {
    let currentBookings = [];
    currentBookings = currentBookings.filter((b) => b.id !== bookingId);
    void 0;
    triggerToast("Passenger removed from trip.");
  };

  // 2. Sites Handler
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteLoc, setNewSiteLoc] = useState("");
  const [newSiteCap, setNewSiteCap] = useState(20);
  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteLoc) return;
    const item = {
      id: Date.now().toString(),
      name: newSiteName,
      location: newSiteLoc,
      capacity: Number(newSiteCap),
      occupied: 0,
      status: "Active",
    };
    setSites([...sites, item]);
    setNewSiteName("");
    setNewSiteLoc("");
    triggerToast("Clinical Site added successfully!");
  };

  // 3. Dorm allocation trigger
  const handleAssignBed = (roomId: string, bedIdx: number) => {
    const updated = dorms.map((r) => {
      if (r.id === roomId) {
        const newBeds = [...r.beds];
        const isOccupied = newBeds[bedIdx] === "Occupied";
        newBeds[bedIdx] = isOccupied ? "Available" : "Occupied";
        const occCount = newBeds.filter((b) => b === "Occupied").length;
        return { ...r, beds: newBeds, occupied: occCount };
      }
      return r;
    });
    setDorms(updated);
    triggerToast("Room bed occupancy updated.");
  };

  // 4. Billing Verification handler
  const handleVerifyBill = (billId: string, action: "Approve" | "Reject") => {
    const updated = bills.map((b) => {
      if (b.id === billId) {
        return { ...b, status: action === "Approve" ? "Paid" : "Rejected" };
      }
      return b;
    });
    setBills(updated);
    triggerToast(`Utility slip verification: ${action}d successfully`);
  };

  // 5. Document uploader mock
  const [newDocName, setNewDocName] = useState("");
  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    const item = {
      id: Date.now().toString(),
      name: newDocName.endsWith(".pdf") ? newDocName : `${newDocName}.pdf`,
      size: "1.2 MB",
      date: new Date().toLocaleDateString("en-GB"),
      category: "Guides",
    };
    setDocuments([item, ...documents]);
    setNewDocName("");
    triggerToast("Guidelines document cataloged.");
  };

  // 6. Announcement trigger
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annPriority, setAnnPriority] = useState("General");
  const [annTargetType, setAnnTargetType] = useState("all");
  const [annTargetId, setAnnTargetId] = useState("");
  const handleAddAnn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    const item = {
      id: Date.now().toString(),
      title: annTitle,
      content: annContent,
      date: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      priority: annPriority,
      targetType: annTargetType,
      targetId: annTargetId,
      author: "Lead Instructor Ajarn Somsri",
    };
    setAnnouncements([item, ...announcements]);
    setAnnTitle("");
    setAnnContent("");
    setAnnTargetId("");
    triggerToast("Announcement bulletin posted!");
  };

  // 7. System Settings
  const [systemSemester, setSystemSemester] = useState("1/2569");
  const [enableDormChecks, setEnableDormChecks] = useState(true);

  // --- Training Groups State Management ---
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [tgName, setTgName] = useState("");
  const [tgTeacherId, setTgTeacherId] = useState("");
  const [tgHospital, setTgHospital] = useState("");
  const [tgStartDate, setTgStartDate] = useState("");
  const [tgEndDate, setTgEndDate] = useState("");
  const [tgDormitoryIds, setTgDormitoryIds] = useState<string[]>([]);
  const [tgTransportationId, setTgTransportationId] = useState("");
  const [tgStudentIds, setTgStudentIds] = useState<string[]>([]);

  // Search & Filters
  const [tgSearch, setTgSearch] = useState("");
  const [tgFilterHospital, setTgFilterHospital] = useState("");

  const resetGroupForm = () => {
    setTgName("");
    setTgTeacherId("");
    setTgHospital("");
    setTgStartDate("");
    setTgEndDate("");
    setTgDormitoryIds([]);
    setTgTransportationId("");
    setTgStudentIds([]);
    setEditingGroupId(null);
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgName || !tgHospital || !tgTeacherId || !tgStartDate || !tgEndDate) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      const payload = {
        name: tgName,
        teacherId: tgTeacherId,
        hospital: tgHospital,
        startDate: tgStartDate,
        endDate: tgEndDate,
        dormitoryIds: tgDormitoryIds,
        transportationId: tgTransportationId,
        studentIds: tgStudentIds,
      };

      if (editingGroupId) {
        await updateGroup(editingGroupId, payload);
        triggerToast("Training group updated successfully!");
      } else {
        await createGroup(payload);
        triggerToast("Training group created successfully!");
      }
      resetGroupForm();
      setIsGroupFormOpen(false);
    } catch (err: any) {
      triggerToast(err.message || "Error saving group.", "error");
    }
  };

  const handleEditGroupClick = (group: any) => {
    setEditingGroupId(group.id);
    setTgName(group.name || "");
    setTgTeacherId(group.teacherId || "");
    setTgHospital(group.hospital || "");
    setTgStartDate(group.startDate || "");
    setTgEndDate(group.endDate || "");
    setTgDormitoryIds(group.dormitoryIds || []);
    setTgTransportationId(group.transportationId || "");
    setTgStudentIds(group.studentIds || []);
    setIsGroupFormOpen(true);
  };

  const handleDeleteGroupClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this training group?")) {
      try {
        await deleteGroup(id);
        triggerToast("Training group deleted successfully.");
      } catch (err: any) {
        triggerToast(err.message || "Error deleting group.", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white shadow-xl dark:bg-white dark:text-zinc-950 animate-bounce flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ==================== 1. DASHBOARD TAB ==================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="rounded-2xl bg-white p-6 shadow-xs border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-red-600" />
              Teacher Internship Management Console
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Srisavarindhira Thai Red Cross Institute of Nursing Clinical
              Operations Hub.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Active Placements
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  35
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                  +4 new
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Total Host Sites
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  {sites.length}
                </span>
                <span className="text-xs font-bold text-zinc-500">
                  Chonburi Hub
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Dorm Beds Occupancy
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  {(() => {
                    const totalOccupied = dbRooms.reduce(
                      (acc, curr) => acc + (curr.occupiedCount || 0),
                      0,
                    );
                    const totalCapacity = dbRooms.reduce(
                      (acc, curr) => acc + (curr.capacity || 0),
                      0,
                    );
                    return `${totalOccupied} / ${totalCapacity}`;
                  })()}
                </span>
                <span className="text-xs font-bold text-red-600">
                  {(() => {
                    const totalOccupied = dbRooms.reduce(
                      (acc, curr) => acc + (curr.occupiedCount || 0),
                      0,
                    );
                    const totalCapacity = dbRooms.reduce(
                      (acc, curr) => acc + (curr.capacity || 0),
                      0,
                    );
                    const pct =
                      totalCapacity > 0
                        ? Math.round((totalOccupied / totalCapacity) * 100)
                        : 0;
                    return `${pct}% occupied`;
                  })()}
                </span>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                Pending Bills slips
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  {bills.filter((b) => b.status === "Pending").length}
                </span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md">
                  Action Required
                </span>
              </div>
            </div>
          </div>

          {/* Core Interactive Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Groups roster preview */}
              <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Operational Training Groups
                  </h3>
                  <Users className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="space-y-3">
                  {groups.map((g) => {
                    const hospitalObj = mockDB
                      .getHospitals()
                      .find(
                        (h) =>
                          h.id === g.hospital ||
                          h.hospitalNameEN === g.hospital ||
                          h.hospitalNameTH === g.hospital,
                      );
                    const hospitalName = hospitalObj
                      ? hospitalObj.hospitalNameTH
                      : g.hospital || "General";
                    const studentCount = g.studentIds ? g.studentIds.length : 0;
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 border border-slate-100/50 dark:bg-zinc-900/40 dark:border-zinc-800"
                      >
                        <div>
                          <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                            {g.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                            {hospitalName} • {g.startDate} to {g.endDate}
                          </p>
                        </div>
                        <span className="rounded-lg bg-red-50 dark:bg-red-950/20 px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400">
                          {studentCount} Students
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Announcements roll */}
              <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    Latest Bulletin Posts
                  </h3>
                  <Megaphone className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="space-y-4">
                  {announcements.slice(0, 2).map((a) => (
                    <div
                      key={a.id}
                      className="border-l-4 border-red-600 pl-4 py-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${a.priority === "Urgent" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
                        >
                          {a.priority}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-bold">
                          {a.date}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-1">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {a.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar quick links and utilities inside Dashboard */}
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800">
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider mb-4">
                  Quick Task Portal
                </h3>
                <div className="space-y-2">
                  <div className="p-3 bg-red-50/40 rounded-xl border border-red-100/50 text-[11px] font-bold text-red-600 leading-normal dark:bg-red-950/10 dark:border-red-900/20">
                    One-Click allocation of dorms, buses, and evaluation
                    checklists is operational. Use dedicated tabs below to
                    manage.
                  </div>
                  <div className="border border-slate-50 dark:border-zinc-800 p-3 rounded-xl flex items-center justify-between bg-white dark:bg-zinc-950">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      Current Term
                    </span>
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      {systemSemester}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. TRAINING GROUPS TAB ==================== */}
      {activeTab === "groups" && (
        <div className="space-y-6">
          {/* Header Action Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                Training Cohorts & Group Coordination
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Administer student deployments, assign teachers, verify hospital
                placements, and provision dormitories & transit.
              </p>
            </div>
            {!isGroupFormOpen && (
              <button
                onClick={() => {
                  resetGroupForm();
                  setIsGroupFormOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white hover:bg-red-500 transition shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create Training Group
              </button>
            )}
          </div>

          {/* Create or Edit Group Drawer/Form */}
          {isGroupFormOpen && (
            <div className="rounded-2xl bg-white border border-red-100 dark:border-zinc-800 p-6 dark:bg-zinc-900 shadow-md transition-all duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-red-600" />
                  {editingGroupId
                    ? "Edit Training Group Parameters"
                    : "Provision New Training Group"}
                </h4>
                <button
                  onClick={() => {
                    resetGroupForm();
                    setIsGroupFormOpen(false);
                  }}
                  className="rounded-lg p-1 text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-zinc-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGroup} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Group Name */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Group Title / Rotation Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cohort 2026 - Siriraj ER Special"
                      value={tgName}
                      onChange={(e) => setTgName(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      required
                    />
                  </div>

                  {/* Hospital */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Hospital Clinical Placement *
                    </label>
                    <select
                      value={tgHospital}
                      onChange={(e) => setTgHospital(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      required
                    >
                      <option value="">-- Choose Hospital Partner --</option>
                      {[].map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.hospitalNameTH} ({h.hospitalNameEN})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Supervising Instructor *
                    </label>
                    <select
                      value={tgTeacherId}
                      onChange={(e) => setTgTeacherId(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      required
                    >
                      <option value="">-- Assign Teacher/Supervisor --</option>
                      {[].map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} - {t.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Deployment Start Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={tgStartDate}
                        onChange={(e) => setTgStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Deployment End Date *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={tgEndDate}
                        onChange={(e) => setTgEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  {/* Transportation */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                      Transit Schedule & Vehicle Allocation
                    </label>
                    <select
                      value={tgTransportationId}
                      onChange={(e) => setTgTransportationId(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                    >
                      <option value="">
                        -- No Transportation (Self Travel) --
                      </option>
                      {[].map((ts) => {
                        const vehicle = mockDB
                          .getVehicles()
                          .find((v) => v.id === ts.vehicleId);
                        const driver = mockDB
                          .getDrivers()
                          .find((d) => d.id === ts.driverId);
                        return (
                          <option key={ts.id} value={ts.id}>
                            {ts.route} ({ts.departureTime}) -{" "}
                            {vehicle?.model || "Shuttle"} •{" "}
                            {driver?.name || "Driver"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Dormitories selection */}
                  <div className="border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl bg-slate-50/30 dark:bg-zinc-950/20">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">
                      Dormitory Room Allocation (Multiple Select)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {[].map((room) => {
                        const bldg = mockDB
                          .getBuildings()
                          .find((b) => b.id === room.buildingId);
                        const isSelected = tgDormitoryIds.includes(room.id);
                        return (
                          <label
                            key={room.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setTgDormitoryIds(
                                      tgDormitoryIds.filter(
                                        (id) => id !== room.id,
                                      ),
                                    );
                                  } else {
                                    setTgDormitoryIds([
                                      ...tgDormitoryIds,
                                      room.id,
                                    ]);
                                  }
                                }}
                                className="rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5"
                              />
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                                Room {room.roomNumber} ({room.gender})
                              </div>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-bold">
                              {bldg?.buildingName || "Main Campus Dorm"} •
                              Capacity: {room.capacity}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Student list selection */}
                  <div className="border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl bg-slate-50/30 dark:bg-zinc-950/20">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">
                      Nursing Students Enrollment (Multiple Select)
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {[].map((stud) => {
                        const isSelected = tgStudentIds.includes(stud.id);
                        return (
                          <label
                            key={stud.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setTgStudentIds(
                                      tgStudentIds.filter(
                                        (id) => id !== stud.id,
                                      ),
                                    );
                                  } else {
                                    setTgStudentIds([...tgStudentIds, stud.id]);
                                  }
                                }}
                                className="rounded text-red-600 focus:ring-red-500 h-3.5 w-3.5"
                              />
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {stud.studentName}
                              </div>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-bold">
                              ID: {stud.studentNumber} • Section {stud.section}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetGroupForm();
                      setIsGroupFormOpen(false);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-black text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-500 transition shadow-sm cursor-pointer"
                  >
                    {editingGroupId ? "Save Changes" : "Confirm Cohort"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search, Filters, and Table Grid */}
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Active Training Roster ({groups.length})
              </h3>

              {/* Search & Filter Inputs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by name or site..."
                    value={tgSearch}
                    onChange={(e) => setTgSearch(e.target.value)}
                    className="w-full sm:w-60 pl-9 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <select
                  value={tgFilterHospital}
                  onChange={(e) => setTgFilterHospital(e.target.value)}
                  className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                >
                  <option value="">All Hospitals</option>
                  {[].map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.shortName || h.hospitalNameEN}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Roster Grid */}
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl">
                <Users className="h-10 w-10 text-zinc-300 mb-2" />
                <p className="text-xs font-semibold text-zinc-400 uppercase">
                  No cohorts registered
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Click 'Create Training Group' to start deploying nursing
                  students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {groups
                  .filter((g) => {
                    const hospitalObj = mockDB
                      .getHospitals()
                      .find(
                        (h) =>
                          h.id === g.hospital ||
                          h.hospitalNameEN === g.hospital ||
                          h.hospitalNameTH === g.hospital,
                      );
                    const hospitalName = hospitalObj
                      ? `${hospitalObj.hospitalNameTH} ${hospitalObj.hospitalNameEN}`
                      : g.hospital;
                    const matchesSearch =
                      (g.name || '').toLowerCase().includes(tgSearch.toLowerCase()) ||
                      (hospitalName || '')
                        .toLowerCase()
                        .includes(tgSearch.toLowerCase());
                    const matchesFilter = tgFilterHospital
                      ? g.hospital === tgFilterHospital
                      : true;
                    return matchesSearch && matchesFilter;
                  })
                  .map((g) => {
                    const teacher = mockDB
                      .getTeachers()
                      .find((t) => t.id === g.teacherId);
                    const hospital = mockDB
                      .getHospitals()
                      .find((h) => h.id === g.hospital);
                    const transit = mockDB
                      .getTransportSchedules()
                      .find((ts) => ts.id === g.transportationId);
                    const studentsCount = g.studentIds
                      ? g.studentIds.length
                      : 0;

                    return (
                      <div
                        key={g.id}
                        className="relative group overflow-hidden border border-slate-100 dark:border-zinc-800 rounded-2xl p-5 bg-slate-50/20 dark:bg-zinc-950/15 hover:border-red-100 dark:hover:border-red-900/40 transition duration-300"
                      >
                        {/* Upper row */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                              Active Cohort
                            </span>
                            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 mt-2">
                              {g.name}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-semibold flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-red-500" />
                              {hospital?.hospitalNameTH || g.hospital} •{" "}
                              {hospital?.province || "Hospital Placement"}
                            </p>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-1.5 sm:self-start">
                            <button
                              onClick={() => handleEditGroupClick(g)}
                              className="rounded-xl p-2 text-zinc-500 hover:bg-white hover:text-red-600 hover:shadow-xs border border-transparent hover:border-slate-100 transition dark:hover:bg-zinc-900 dark:hover:border-zinc-800 cursor-pointer"
                              title="Edit parameters"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGroupClick(g.id)}
                              className="rounded-xl p-2 text-zinc-500 hover:bg-white hover:text-red-600 hover:shadow-xs border border-transparent hover:border-slate-100 transition dark:hover:bg-zinc-900 dark:hover:border-zinc-800 cursor-pointer"
                              title="Dissolve group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Mid Row - Detail Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                          <div>
                            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              Supervisor
                            </span>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block">
                              {teacher?.name || "Unassigned Instructor"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {teacher?.department || "Faculty of Nursing"}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              Term Period
                            </span>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-zinc-400" />
                              {g.startDate} to {g.endDate}
                            </span>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              Clinical practice cycle
                            </span>
                          </div>

                          <div>
                            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              Lodging / Dormitories
                            </span>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block flex items-center gap-1">
                              <Bed className="h-3.5 w-3.5 text-zinc-400" />
                              {g.dormitoryIds && g.dormitoryIds.length > 0 ? (
                                <span>
                                  {g.dormitoryIds.length} Rooms Assigned
                                </span>
                              ) : (
                                <span className="text-zinc-400 italic">
                                  No rooms provisioned
                                </span>
                              )}
                            </span>
                            {g.dormitoryIds && g.dormitoryIds.length > 0 && (
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                Rooms:{" "}
                                {g.dormitoryIds
                                  .map((id) => {
                                    const room = mockDB
                                      .getRooms()
                                      .find((r) => r.id === id);
                                    return room ? room.roomNumber : id;
                                  })
                                  .join(", ")}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                              Transportation
                            </span>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5 block flex items-center gap-1">
                              <Bus className="h-3.5 w-3.5 text-zinc-400" />
                              {transit ? (
                                transit.route
                              ) : (
                                <span className="text-zinc-400 italic">
                                  Self-commute
                                </span>
                              )}
                            </span>
                            {transit && (
                              <span className="text-[10px] text-zinc-400 block mt-0.5">
                                Shuttle departs at {transit.departureTime}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Students Assigned Badges */}
                        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-1">
                            Students ({studentsCount}):
                          </span>
                          {g.studentIds && g.studentIds.length > 0 ? (
                            g.studentIds.map((id) => {
                              const student = mockDB
                                .getStudents()
                                .find((s) => s.id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300 border border-slate-200/40 dark:border-zinc-700/50"
                                >
                                  {student?.studentName || id}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-zinc-400 italic">
                              No students allocated yet.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. TRAINING SITES TAB ==================== */}
      {activeTab === "sites" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Hospital Partners & Wards
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Manage approved healthcare clinical centers and student
              capacities.
            </p>

            {/* Add Site Form */}
            <form
              onSubmit={handleAddSite}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50/50 dark:bg-zinc-950/30 rounded-2xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                  Hospital / Clinic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangkok Metropolitan Hospital"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                  Location Province
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bangkok"
                  value={newSiteLoc}
                  onChange={(e) => setNewSiteLoc(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-600 text-xs font-black text-white py-2.5 shadow-sm hover:bg-red-500 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Site
                </button>
              </div>
            </form>

            {sites.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                ยังไม่มีข้อมูล - เริ่มสร้างรายการแรก
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sites.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/10 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-red-600">
                          {s.location}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${s.status === "Active" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20" : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"}`}
                        >
                          {s.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white mt-2">
                        {s.name}
                      </h4>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-zinc-800 flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-400">Total Placements</span>
                      <span className="text-zinc-900 dark:text-zinc-200">
                        {s.occupied} / {s.capacity} Students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 4. DORMITORIES TAB ==================== */}
      {activeTab === "dorms" &&
        (() => {
          const dormitories = dbBuildings.filter(
            (b) => b.buildingType === "Dormitory",
          );
          const totalDormitoriesCount = dormitories.length;

          // Filter rooms based on selections
          const filteredRooms = dbRooms.filter((room) => {
            // Verify room belongs to a dormitory
            const belongsToDorm = dormitories.some(
              (d) => d.id === room.buildingId,
            );
            if (!belongsToDorm) return false;

            // Dorm filter
            if (selectedDormId !== "all" && room.buildingId !== selectedDormId)
              return false;

            // Gender filter
            if (
              selectedRoomGender !== "all" &&
              room.gender !== selectedRoomGender
            )
              return false;

            // Room search
            if (searchQuery.trim() !== "") {
              return (room.roomNumber || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            }

            return true;
          });

          // Compute overall dormitory metrics
          const totalCapacity = dbRooms
            .filter((r) => dormitories.some((d) => d.id === r.buildingId))
            .reduce((acc, curr) => acc + (curr.capacity || 0), 0);
          const totalOccupied = dbRooms
            .filter((r) => dormitories.some((d) => d.id === r.buildingId))
            .reduce((acc, curr) => acc + (curr.occupiedCount || 0), 0);
          const overallOccupancyPercent =
            totalCapacity > 0
              ? Math.round((totalOccupied / totalCapacity) * 100)
              : 0;

          // Resolve unassigned students
          const unassignedStudents = dbStudents.filter(
            (s) => !s.roomId && s.status === "active",
          );

          // Resolve students currently in a room
          const getStudentsInRoom = (roomId: string) => {
            return dbStudents.filter((s) => s.roomId === roomId);
          };

          return (
            <div className="space-y-6">
              {/* 4.1. DORMITORY METRICS DASHBOARD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    Total Dormitories
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {totalDormitoriesCount}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500">
                      Buildings Configured
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    Total Rooms
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {
                        dbRooms.filter((r) =>
                          dormitories.some((d) => d.id === r.buildingId),
                        ).length
                      }
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Active Residential Units
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    Bed Capacity
                  </span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white">
                      {totalOccupied} / {totalCapacity}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500">
                      Beds Assigned
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      Overall Occupancy Rate
                    </span>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-2xl font-black text-zinc-900 dark:text-white">
                        {overallOccupancyPercent}%
                      </span>
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                        Live stats
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${overallOccupancyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4.2. ACTIONS HEADER & CONFIG TOOLS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 dark:bg-zinc-950/20 dark:border-zinc-800">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    Residential Configurator
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Create new dorms, add housing units, set bed capacities, and
                    supervise placements.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setShowCreateDormForm(!showCreateDormForm);
                      setShowCreateRoomForm(false);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer ${
                      showCreateDormForm
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                        : "bg-white border border-slate-100 text-zinc-800 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                    }`}
                  >
                    <Plus className="h-4 w-4" /> Create Dormitory
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateRoomForm(!showCreateRoomForm);
                      setShowCreateDormForm(false);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer ${
                      showCreateRoomForm
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                        : "bg-white border border-slate-100 text-zinc-800 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                    }`}
                  >
                    <Plus className="h-4 w-4" /> Create Room
                  </button>
                </div>
              </div>

              {/* 4.3. CREATION FORMS */}
              {showCreateDormForm && (
                <form
                  onSubmit={handleCreateDormitory}
                  className="p-6 rounded-2xl bg-white border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800 space-y-4 shadow-sm animate-fadeIn"
                >
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-zinc-800 pb-3">
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-red-600" /> New Dormitory
                      Building
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCreateDormForm(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Building Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DORM-A"
                        value={newDormCode}
                        onChange={(e) => setNewDormCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Building Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. STIN Female Residence Hall A"
                        value={newDormName}
                        onChange={(e) => setNewDormName(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Gender Wing Designation
                      </label>
                      <select
                        value={newDormGender}
                        onChange={(e) =>
                          setNewDormGender(e.target.value as any)
                        }
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      >
                        <option value="Female">Female Only Wing</option>
                        <option value="Male">Male Only Wing</option>
                        <option value="Mixed">Co-Ed / Mixed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Residential Floors
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newDormFloors}
                        onChange={(e) =>
                          setNewDormFloors(Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Address / Location Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Campus North Area, opposite Health Sciences Library"
                        value={newDormAddress}
                        onChange={(e) => setNewDormAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                      General Notes & Guidelines
                    </label>
                    <textarea
                      placeholder="Describe dormitory logistics, wifi codes, or keycard security protocols..."
                      value={newDormDesc}
                      onChange={(e) => setNewDormDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateDormForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Save Dormitory Building
                    </button>
                  </div>
                </form>
              )}

              {showCreateRoomForm && (
                <form
                  onSubmit={handleCreateRoom}
                  className="p-6 rounded-2xl bg-white border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800 space-y-4 shadow-sm animate-fadeIn"
                >
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-zinc-800 pb-3">
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="h-4 w-4 text-red-600" /> New Residential
                      Room Unit
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCreateRoomForm(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Select Dormitory
                      </label>
                      <select
                        value={newRoomDormId}
                        onChange={(e) => {
                          setNewRoomDormId(e.target.value);
                          const selectedDorm = dormitories.find(
                            (d) => d.id === e.target.value,
                          );
                          if (selectedDorm) {
                            setNewRoomGender(selectedDorm.gender);
                          }
                        }}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      >
                        <option value="">-- Choose Dorm --</option>
                        {dormitories.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.buildingName} ({d.buildingCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Room Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 101, 102, 201"
                        value={newRoomNumber}
                        onChange={(e) => setNewRoomNumber(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Gender Restriction
                      </label>
                      <select
                        value={newRoomGender}
                        onChange={(e) =>
                          setNewRoomGender(e.target.value as any)
                        }
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                      >
                        <option value="Female">Female Unit</option>
                        <option value="Male">Male Unit</option>
                        <option value="Mixed">Mixed / Co-Ed Unit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Bed Capacity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        value={newRoomCapacity}
                        onChange={(e) =>
                          setNewRoomCapacity(Number(e.target.value))
                        }
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                        required
                      />
                      <span className="block text-[9px] text-zinc-400 mt-1 font-semibold">
                        Maximum limit: 8 beds per room
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-50 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateRoomForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Save Housing Room
                    </button>
                  </div>
                </form>
              )}

              {/* 4.4. SEARCH & FILTERS ROOSTER */}
              <div className="rounded-2xl bg-white border border-slate-100 p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search Room number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-white text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] font-black uppercase text-zinc-400 shrink-0">
                      Dormitory:
                    </span>
                    <select
                      value={selectedDormId}
                      onChange={(e) => setSelectedDormId(e.target.value)}
                      className="w-full sm:w-auto rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    >
                      <option value="all">All Buildings</option>
                      {dormitories.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.buildingName} ({d.buildingCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto">
                    <span className="text-[10px] font-black uppercase text-zinc-400 shrink-0">
                      Gender restriction:
                    </span>
                    <select
                      value={selectedRoomGender}
                      onChange={(e) => setSelectedRoomGender(e.target.value)}
                      className="w-full sm:w-auto rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    >
                      <option value="all">All Genders</option>
                      <option value="Female">Female Only</option>
                      <option value="Male">Male Only</option>
                      <option value="Mixed">Mixed / Co-Ed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4.5. FILTERED ROOMS GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const dorm = dormitories.find(
                      (d) => d.id === room.buildingId,
                    );
                    const roomStudents = getStudentsInRoom(room.id);
                    const occupancyRate = Math.round(
                      (room.occupiedCount / room.capacity) * 100,
                    );

                    return (
                      <div
                        key={room.id}
                        className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between border-b border-slate-50 dark:border-zinc-800 pb-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                                  Room {room.roomNumber}
                                </h4>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    room.gender === "Female"
                                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                                      : room.gender === "Male"
                                        ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                        : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                  }`}
                                >
                                  {room.gender}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-bold mt-1">
                                {dorm?.buildingName || "Main Residence Hall"}
                              </p>
                            </div>

                            {/* Set Room Capacity Actions */}
                            <div className="flex items-center gap-1.5">
                              {editingRoomId === room.id ? (
                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg dark:bg-zinc-950">
                                  <input
                                    type="number"
                                    min="1"
                                    max="8"
                                    value={
                                      editingCapacityValue !== null
                                        ? editingCapacityValue
                                        : room.capacity
                                    }
                                    onChange={(e) =>
                                      setEditingCapacityValue(
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-12 text-center text-xs font-bold py-1 px-1 bg-white border border-slate-100 rounded-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-1 focus:ring-red-600"
                                  />
                                  <button
                                    onClick={() =>
                                      handleSetCapacity(
                                        room.id,
                                        editingCapacityValue !== null
                                          ? editingCapacityValue
                                          : room.capacity,
                                      )
                                    }
                                    className="p-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingRoomId(null);
                                      setEditingCapacityValue(null);
                                    }}
                                    className="p-1 rounded-md bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 transition"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                                    {room.occupiedCount} / {room.capacity} Beds
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingRoomId(room.id);
                                      setEditingCapacityValue(room.capacity);
                                    }}
                                    className="p-1.5 rounded-lg border border-slate-50 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
                                    title="Edit Room Capacity"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRoom(room.id)}
                                    className="p-1.5 rounded-lg border border-slate-50 hover:bg-red-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-600 transition"
                                    title="Delete Room"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Occupancy Indicator Progress Bar */}
                          <div className="space-y-1.5 mb-4">
                            <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-wide">
                              <span>Bed space Fill rate</span>
                              <span>{occupancyRate}% Filled</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-slate-100/10">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  occupancyRate >= 100
                                    ? "bg-red-500"
                                    : occupancyRate >= 75
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, occupancyRate)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Dynamic Bed Layout */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {Array.from({ length: room.capacity }).map(
                              (_, idx) => {
                                const student = roomStudents[idx];
                                return (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl border text-center transition ${
                                      student
                                        ? "bg-red-50/30 border-red-100 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400"
                                        : "bg-white border-dashed border-slate-100 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800"
                                    }`}
                                  >
                                    <Bed className="h-4 w-4 mx-auto mb-1" />
                                    <span className="block text-[9px] font-black">
                                      Bed {idx + 1}
                                    </span>
                                    <span className="block text-[8px] font-bold truncate max-w-[80px] mx-auto mt-1 uppercase">
                                      {student
                                        ? student.studentName.split(" ")[0]
                                        : "Available"}
                                    </span>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>

                        {/* Room Occupants / Bed Actions List */}
                        <div className="border-t border-slate-50 dark:border-zinc-800 pt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                              Assigned Roommates
                            </span>
                            {room.occupiedCount < room.capacity && (
                              <button
                                onClick={() => {
                                  setSelectedRoomForAssign(room);
                                  setShowAssignModal(true);
                                }}
                                className="text-[10px] font-black text-red-600 hover:text-red-500 flex items-center gap-1 dark:text-red-400 hover:underline"
                              >
                                <Plus className="h-3 w-3" /> Assign Student
                              </button>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            {roomStudents.length > 0 ? (
                              roomStudents.map((stud) => (
                                <div
                                  key={stud.id}
                                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-100/10"
                                >
                                  <div className="min-w-0">
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                                      {stud.studentName}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 block mt-0.5">
                                      ID: {stud.studentNumber} • Sec{" "}
                                      {stud.section}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setStudentToMove(stud);
                                        setMoveFromRoom(room);
                                        setShowMoveModal(true);
                                      }}
                                      className="px-2 py-1 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 text-[10px] font-black uppercase transition"
                                    >
                                      Move
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRemoveStudentFromRoom(
                                          stud.id,
                                          room.id,
                                        )
                                      }
                                      className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 text-[10px] font-black uppercase transition"
                                    >
                                      Check-out
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-zinc-400 italic py-2 text-center">
                                Empty Unit. Bed spaces are completely available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-16 border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                    <Bed className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">
                      No lodging rooms match your filters.
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1 max-w-sm mx-auto">
                      Try resetting the room filters or search query, or
                      configure a new residential unit.
                    </p>
                  </div>
                )}
              </div>

              {/* 4.6. ASSIGN STUDENT MODAL DIALOG */}
              {showAssignModal && selectedRoomForAssign && (
                <div className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 w-full max-w-md p-6 space-y-5 shadow-lg">
                    <div className="flex justify-between items-center border-b border-slate-50 dark:border-zinc-800 pb-3">
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                        Assign Student to Room{" "}
                        {selectedRoomForAssign.roomNumber}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAssignModal(false);
                          setSelectedRoomForAssign(null);
                          setAssignStudentId("");
                          setStudentSearchQuery("");
                        }}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                          Search Unassigned Students
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Type student name or ID..."
                            value={studentSearchQuery}
                            onChange={(e) =>
                              setStudentSearchQuery(e.target.value)
                            }
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-100 bg-white text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-50 dark:border-zinc-800 p-2 rounded-xl bg-slate-50/30 dark:bg-zinc-950/20">
                        {unassignedStudents
                          .filter((s) => {
                            if (!studentSearchQuery) return true;
                            return (
                              (s.studentName || '')
                                .toLowerCase()
                                .includes(studentSearchQuery.toLowerCase()) ||
                              (s.studentNumber || '')
                                .toLowerCase()
                                .includes(studentSearchQuery.toLowerCase())
                            );
                          })
                          .map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setAssignStudentId(s.id)}
                              className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                                assignStudentId === s.id
                                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400"
                                  : "bg-white border-slate-100 text-zinc-800 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                              }`}
                            >
                              <div>
                                <span className="block font-bold text-xs">
                                  {s.studentName}
                                </span>
                                <span className="block text-[10px] text-zinc-400 mt-0.5">
                                  ID: {s.studentNumber} • Sec {s.section}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-zinc-400">
                                {s.academicYear}
                              </span>
                            </button>
                          ))}

                        {unassignedStudents.filter((s) => {
                          if (!studentSearchQuery) return true;
                          return (
                            (s.studentName || '')
                              .toLowerCase()
                              .includes(studentSearchQuery.toLowerCase()) ||
                            (s.studentNumber || '')
                              .toLowerCase()
                              .includes(studentSearchQuery.toLowerCase())
                          );
                        }).length === 0 && (
                          <p className="text-xs text-zinc-400 text-center py-6 italic">
                            No unassigned active students found.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-50 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAssignModal(false);
                          setSelectedRoomForAssign(null);
                          setAssignStudentId("");
                          setStudentSearchQuery("");
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAssignStudent}
                        disabled={!assignStudentId}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <Check className="h-4 w-4" /> Confirm Placement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.7. MOVE STUDENT MODAL DIALOG */}
              {showMoveModal && studentToMove && moveFromRoom && (
                <div className="fixed inset-0 bg-zinc-900/40 dark:bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 w-full max-w-md p-6 space-y-5 shadow-lg">
                    <div className="flex justify-between items-center border-b border-slate-50 dark:border-zinc-800 pb-3">
                      <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                        Relocate Student: {studentToMove.studentName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoveModal(false);
                          setStudentToMove(null);
                          setMoveFromRoom(null);
                          setMoveToRoomId("");
                        }}
                        className="text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3.5 bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800 rounded-xl space-y-2">
                        <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          Current Placement
                        </span>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Room {moveFromRoom.roomNumber} •{" "}
                          {
                            dormitories.find(
                              (d) => d.id === moveFromRoom.buildingId,
                            )?.buildingName
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1.5">
                          Select Destination Room
                        </label>
                        <select
                          value={moveToRoomId}
                          onChange={(e) => setMoveToRoomId(e.target.value)}
                          className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden focus:ring-1 focus:ring-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                          required
                        >
                          <option value="">
                            -- Choose Available Destination Room --
                          </option>
                          {dbRooms
                            .filter((r) => {
                              // Room belongs to a dormitory
                              const belongs = dormitories.some(
                                (d) => d.id === r.buildingId,
                              );
                              // Avoid current room
                              const isDifferent = r.id !== moveFromRoom.id;
                              // Has space available
                              const hasSpace =
                                (r.occupiedCount || 0) < r.capacity;
                              return belongs && isDifferent && hasSpace;
                            })
                            .map((r) => {
                              const bd = dormitories.find(
                                (d) => d.id === r.buildingId,
                              );
                              return (
                                <option key={r.id} value={r.id}>
                                  Room {r.roomNumber} ({bd?.buildingCode}) -{" "}
                                  {r.occupiedCount}/{r.capacity} beds (
                                  {r.gender})
                                </option>
                              );
                            })}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-50 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoveModal(false);
                          setStudentToMove(null);
                          setMoveFromRoom(null);
                          setMoveToRoomId("");
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleMoveStudent}
                        disabled={!moveToRoomId}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <Check className="h-4 w-4" /> Relocate Student
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      {/* ==================== 5. TRANSPORTATION TAB ==================== */}
      {activeTab === "transport" && (
        <div className="space-y-6">
          {/* Header Dashboard & Action Panel */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
            <div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Bus className="h-5 w-5 text-red-600" /> Transportation
                Management
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Configure transit fleets, plan commute schedules, assign student
                seats, and monitor occupancy limit validation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowCreateVanForm(!showCreateVanForm);
                  setShowCreateTripForm(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-slate-100 text-zinc-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Van
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTripForm(!showCreateTripForm);
                  setShowCreateVanForm(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 shadow-sm transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Trip
              </button>
            </div>
          </div>

          {/* Quick Statistics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Total Fleet Size
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {dbVehicles.length} Vans
              </p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Active Routes
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {
                  dbTransportSchedules.filter((t) => t.status !== "cancelled")
                    .length
                }{" "}
                Trips
              </p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Booked Passengers
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {dbTransportAssignments.length} Students
              </p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-xl dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Average Occupancy
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
                {(() => {
                  const totalCapacity = dbVehicles.reduce(
                    (acc, v) => acc + (v.capacity || 0),
                    0,
                  );
                  if (!totalCapacity) return "0%";
                  return `${Math.round((dbTransportAssignments.length / totalCapacity) * 100)}%`;
                })()}
              </p>
            </div>
          </div>

          {/* CREATE VAN FORM */}
          {showCreateVanForm && (
            <form
              onSubmit={handleCreateVan}
              className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 dark:bg-zinc-900 dark:border-zinc-850"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                <h4 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-250 tracking-wider">
                  Create New Fleet Vehicle (Van)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCreateVanForm(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 3กค-4567"
                    value={newVanPlate}
                    onChange={(e) => setNewVanPlate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Toyota Commuter (White)"
                    value={newVanModel}
                    onChange={(e) => setNewVanModel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={newVanCapacity}
                    onChange={(e) => setNewVanCapacity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Operational Status
                  </label>
                  <select
                    value={newVanStatus}
                    onChange={(e: any) => setNewVanStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="active">Active & Available</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive / Out of Fleet</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateVanForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-550"
                >
                  Register Van
                </button>
              </div>
            </form>
          )}

          {/* CREATE TRIP FORM */}
          {showCreateTripForm && (
            <form
              onSubmit={handleCreateTrip}
              className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 dark:bg-zinc-900 dark:border-zinc-850"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                <h4 className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-250 tracking-wider">
                  Schedule New Route Trip
                </h4>
                <button
                  type="button"
                  onClick={() => setShowCreateTripForm(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Route Name (Origin ⇄ Destination)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., STIN Campus ⇄ Siriraj Hospital"
                    value={newTripRoute}
                    onChange={(e) => setNewTripRoute(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Pickup Point
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Main Residence Lobby"
                    value={newTripPickup}
                    onChange={(e) => setNewTripPickup(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Departure Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 06:30 Daily"
                    value={newTripDeparture}
                    onChange={(e) => setNewTripDeparture(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Assign Fleets (Van)
                  </label>
                  <select
                    required
                    value={newTripVehicleId}
                    onChange={(e) => setNewTripVehicleId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">-- Choose available Van --</option>
                    {dbVehicles.map((v) => (
                      <option
                        key={v.id}
                        value={v.id}
                        disabled={v.status !== "active"}
                      >
                        {v.model} ({v.plateNumber}) - Cap {v.capacity}{" "}
                        {v.status !== "active" ? "[Maint]" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Assign Driver
                  </label>
                  <select
                    value={newTripDriverId}
                    onChange={(e) => setNewTripDriverId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="">-- Select Driver --</option>
                    {dbDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Trip Status
                  </label>
                  <select
                    value={newTripStatus}
                    onChange={(e: any) => setNewTripStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTripForm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-550"
                >
                  Schedule Trip
                </button>
              </div>
            </form>
          )}

          {/* Primary Split Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Fleet and Trips directory */}
            <div className="lg:col-span-5 space-y-6">
              {/* FLEET DIRECTORY CARD */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Fleets
                  (Vans)
                </h4>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {dbVehicles.map((v) => {
                    const statusColors =
                      v.status === "active"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                        : v.status === "maintenance"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";

                    return (
                      <div
                        key={v.id}
                        className="border border-slate-100 rounded-xl p-3 flex items-center justify-between dark:border-zinc-800/80"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-zinc-900 dark:text-white">
                              {v.model}
                            </span>
                            <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {v.plateNumber}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-bold">
                            Capacity: {v.capacity} Seats
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${statusColors}`}
                        >
                          {v.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TRIPS LIST CARD */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-red-600" /> Commute Trips
                </h4>
                <div className="space-y-3">
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
                        className={`border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                          activeTripId === t.id
                            ? "border-red-500 bg-red-50/5 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                        }`}
                        onClick={() => setActiveTripId(t.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-black text-zinc-800 dark:text-white">
                              {t.route}
                            </h5>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-bold flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Pickup:{" "}
                              {(t as any).pickupLocation || "Campus Lobby"}
                            </p>
                          </div>
                          <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded">
                            {t.departureTime}
                          </span>
                        </div>

                        {/* Seat Indicator */}
                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                            <span>Seat Occupancy</span>
                            <span
                              className={
                                bookingsCount >= cap
                                  ? "text-red-500"
                                  : "text-zinc-600 dark:text-zinc-300"
                              }
                            >
                              {bookingsCount} / {cap} Seats
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden dark:bg-zinc-800">
                            <div
                              style={{ width: `${fillPercent}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                fillPercent >= 100
                                  ? "bg-red-500"
                                  : fillPercent >= 75
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-2.5 dark:border-zinc-800/60">
                          <span className="text-[10px] text-zinc-400 font-semibold">
                            Fleet: {van?.model || "Shuttle"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTripId(t.id);
                            }}
                            className="text-[10px] font-black text-red-600 dark:text-red-400 hover:underline"
                          >
                            Manage Seats &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Seat Grid & Booking Supervisor */}
            <div className="lg:col-span-7">
              {activeTripId ? (
                (() => {
                  const trip = dbTransportSchedules.find(
                    (t) => t.id === activeTripId,
                  );
                  if (!trip) return null;
                  const vehicle = dbVehicles.find(
                    (v) => v.id === trip.vehicleId,
                  );
                  const bookingsForTrip = dbTransportAssignments.filter(
                    (a) =>
                      a.scheduleId === activeTripId && a.status === "active",
                  );
                  const totalSeats = vehicle?.capacity || 14;

                  return (
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
                      {/* Selected Trip Details Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-zinc-800">
                        <div>
                          <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                            Active Cabin Supervisor
                          </span>
                          <h4 className="text-base font-black text-zinc-950 dark:text-white mt-0.5">
                            {trip.route}
                          </h4>
                          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                            Departure: {trip.departureTime} • Pickup:{" "}
                            {(trip as any).pickupLocation || "Campus Hub"}
                          </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-850 text-xs font-bold text-zinc-500">
                          <p>
                            Fleet:{" "}
                            <span className="text-zinc-800 dark:text-white">
                              {vehicle?.model}
                            </span>
                          </p>
                          <p className="mt-0.5">
                            Plate:{" "}
                            <span className="text-zinc-800 dark:text-white">
                              {vehicle?.plateNumber}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Interactive Cabin Grid Representation */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-black text-zinc-800 dark:text-white flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-zinc-500" />{" "}
                            Interactive Cabin Layout
                          </span>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400">
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />{" "}
                              Free
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-zinc-800 inline-block" />{" "}
                              Occupied
                            </span>
                          </div>
                        </div>

                        {/* Seat Map Visualizer Frame */}
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 dark:bg-zinc-950/40 dark:border-zinc-850 flex flex-col items-center">
                          {/* Windshield / Dashboard Front Frame */}
                          <div className="w-full max-w-sm border-2 border-slate-200 dark:border-zinc-800 rounded-t-xl bg-slate-100/50 dark:bg-zinc-900/60 p-2 text-center text-[10px] font-black text-zinc-400 tracking-widest uppercase mb-6 flex justify-between px-6">
                            <span>🚐 WINDSHIELD</span>
                            <span className="text-red-500">STEERING ⚙️</span>
                          </div>

                          {/* Seats Row Grid */}
                          <div className="grid grid-cols-3 gap-3.5 w-full max-w-sm">
                            {/* Driver Row (steering wheel + extra empty or Seat 1 depending on layout) */}
                            <div className="col-span-1 bg-zinc-100 dark:bg-zinc-900/40 border border-dashed border-slate-300 dark:border-zinc-800 p-2.5 rounded-xl flex flex-col items-center justify-center opacity-60">
                              <span className="text-[9px] font-black text-zinc-400">
                                DRIVER
                              </span>
                              <span className="text-xs font-black text-zinc-500 mt-1">
                                👨‍✈️ Captain
                              </span>
                            </div>
                            <div className="col-span-1" />{" "}
                            {/* Center Walkway */}
                            {/* Render all passenger seat positions from 1 to C */}
                            {(() => {
                              const seatElements = [];
                              for (let i = 1; i <= totalSeats; i++) {
                                const booking = bookingsForTrip.find(
                                  (b) => b.seatNumber === i,
                                );
                                const passenger = booking
                                  ? dbStudents.find(
                                      (s) => s.id === booking.studentId,
                                    )
                                  : null;

                                seatElements.push(
                                  <div key={i} className="col-span-1 relative">
                                    {booking && passenger ? (
                                      /* Occupied Seat Card */
                                      <div className="bg-zinc-900 border border-zinc-800 text-white p-2.5 rounded-xl flex flex-col justify-between h-[82px] shadow-sm relative dark:bg-zinc-950">
                                        <div className="flex justify-between items-start">
                                          <span className="text-[10px] font-black bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded">
                                            #{i}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleUnassignSeat(booking.id)
                                            }
                                            className="text-zinc-400 hover:text-red-400 transition cursor-pointer"
                                            title="Remove student assignment"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                        <p
                                          className="text-[10px] font-black truncate mt-1.5"
                                          title={passenger.studentName}
                                        >
                                          {passenger.studentName
                                            .split(" ")
                                            .slice(1)
                                            .join(" ") || passenger.studentName}
                                        </p>
                                        <p className="text-[8px] text-zinc-400 font-bold truncate">
                                          ID: {passenger.studentNumber}
                                        </p>
                                      </div>
                                    ) : (
                                      /* Empty Seat Button */
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAssigningSeatNumber(i);
                                          setShowAssignSeatModal(true);
                                        }}
                                        className="w-full bg-white hover:bg-emerald-50 border-2 border-dashed border-slate-200 hover:border-emerald-300 p-2.5 rounded-xl flex flex-col items-center justify-between h-[82px] text-zinc-400 hover:text-emerald-600 transition-all dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-emerald-950/30"
                                      >
                                        <span className="text-[10px] font-black bg-slate-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-400 px-1.5 py-0.5 rounded self-start">
                                          #{i}
                                        </span>
                                        <span className="text-[10px] font-black tracking-wider block mt-1.5 uppercase">
                                          FREE
                                        </span>
                                        <span className="text-[8px] text-zinc-400 font-bold">
                                          Book Seat
                                        </span>
                                      </button>
                                    )}
                                  </div>,
                                );
                              }
                              return seatElements;
                            })()}
                          </div>

                          {/* Back bumper space */}
                          <div className="w-full max-w-sm mt-6 border-b-4 border-slate-200 dark:border-zinc-800 text-center text-[8px] text-zinc-300 tracking-widest pt-2">
                            REAR BUMPER
                          </div>
                        </div>
                      </div>

                      {/* Passenger Manifest Directory */}
                      <div>
                        <h4 className="text-xs font-black text-zinc-800 dark:text-white mb-3 uppercase tracking-wider">
                          Trip Passenger Manifest ({bookingsForTrip.length}{" "}
                          Students)
                        </h4>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto">
                          {bookingsForTrip.map((b) => {
                            const s = dbStudents.find(
                              (stud) => stud.id === b.studentId,
                            );
                            if (!s) return null;
                            return (
                              <div
                                key={b.id}
                                className="border border-slate-50 bg-slate-50/20 p-2.5 rounded-xl flex items-center justify-between text-xs dark:border-zinc-800 dark:bg-zinc-950/40"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="font-bold text-[11px] bg-zinc-800 text-white px-2 py-0.5 rounded dark:bg-zinc-800">
                                    Seat #{b.seatNumber || "?"}
                                  </span>
                                  <div>
                                    <p className="font-bold text-zinc-800 dark:text-zinc-200">
                                      {s.studentName}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-medium">
                                      Student ID: {s.studentNumber} • Sec{" "}
                                      {s.section}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnassignSeat(b.id)}
                                  className="text-zinc-400 hover:text-red-500 font-semibold p-1.5 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          {bookingsForTrip.length === 0 && (
                            <p className="text-xs text-zinc-400 text-center py-6 italic">
                              No passengers assigned to this trip yet. Click an
                              empty seat above to assign students.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-2xl bg-white dark:bg-zinc-900 dark:border-zinc-800">
                  <Bus className="h-10 w-10 text-zinc-300 mb-3" />
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">
                    No Trip Selected
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 max-w-sm text-center">
                    Please select a scheduled trip from the commutes panel on
                    the left to review passenger assignments and manage seats.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* CHOOSE STUDENT MODAL FOR ASSIGNING SEAT */}
          {showAssignSeatModal && activeTripId && assigningSeatNumber && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div>
                    <h3 className="text-base font-black text-zinc-950 dark:text-white">
                      Book Passenger: Seat #{assigningSeatNumber}
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                      Assign student to this specific seat.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignSeatModal(false);
                      setAssigningSeatNumber(null);
                      setSelectedStudentForSeat("");
                      setStudentAssignSearch("");
                    }}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search student by name or ID..."
                      value={studentAssignSearch}
                      onChange={(e) => setStudentAssignSearch(e.target.value)}
                      className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-200 bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />
                  </div>

                  {/* Student list */}
                  <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1">
                    {(() => {
                      const trip = dbTransportSchedules.find(
                        (t) => t.id === activeTripId,
                      );
                      const currentBookings = dbTransportAssignments.filter(
                        (b) =>
                          b.scheduleId === activeTripId &&
                          b.status === "active",
                      );

                      // List of students that aren't already booked on this trip's other seats
                      const candidateStudents = dbStudents.filter((s) => {
                        const matchesSearch =
                          (s.studentName || '')
                            .toLowerCase()
                            .includes(studentAssignSearch.toLowerCase()) ||
                          (s.studentNumber || '')
                            .toLowerCase()
                            .includes(studentAssignSearch.toLowerCase());
                        const isAlreadyBookedOnAnotherSeat =
                          currentBookings.some(
                            (b) =>
                              b.studentId === s.id &&
                              b.seatNumber !== assigningSeatNumber,
                          );
                        return matchesSearch && !isAlreadyBookedOnAnotherSeat;
                      });

                      return (
                        <>
                          {candidateStudents.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedStudentForSeat(s.id)}
                              className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                                selectedStudentForSeat === s.id
                                  ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-900/30 dark:text-red-400"
                                  : "bg-white border-slate-100 text-zinc-800 hover:bg-slate-50 dark:bg-zinc-950 dark:border-zinc-850 dark:text-white"
                              }`}
                            >
                              <div>
                                <span className="block font-bold text-xs">
                                  {s.studentName}
                                </span>
                                <span className="block text-[9px] text-zinc-400 mt-0.5">
                                  ID: {s.studentNumber} • Sec {s.section}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-zinc-400">
                                {s.academicYear}
                              </span>
                            </button>
                          ))}
                          {candidateStudents.length === 0 && (
                            <p className="text-xs text-zinc-400 text-center py-6 italic">
                              No matching eligible students found.
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-50 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignSeatModal(false);
                      setAssigningSeatNumber(null);
                      setSelectedStudentForSeat("");
                      setStudentAssignSearch("");
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-black text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssignStudentToSeat()}
                    disabled={!selectedStudentForSeat}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    Assign Seat #{assigningSeatNumber}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 6. WATER & ELECTRICITY TAB ==================== */}
      {activeTab === "utilities" && (
        <div className="space-y-6">
          {/* Sub-tab navigation */}
          <div className="flex border-b border-slate-100 dark:border-zinc-800">
            <button
              onClick={() => setUtilitiesSubTab("record")}
              className={`pb-3 text-xs font-black uppercase tracking-wider px-4 border-b-2 transition ${
                utilitiesSubTab === "record"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Record & Split Bills
            </button>
            <button
              onClick={() => setUtilitiesSubTab("rooms")}
              className={`pb-3 text-xs font-black uppercase tracking-wider px-4 border-b-2 transition ${
                utilitiesSubTab === "rooms"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Dorm Room Assign
            </button>
            <button
              onClick={() => setUtilitiesSubTab("ledger")}
              className={`pb-3 text-xs font-black uppercase tracking-wider px-4 border-b-2 transition ${
                utilitiesSubTab === "ledger"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Monthly History & Slips
            </button>
          </div>

          {/* Sub-tab 1: RECORD & SPLIT BILLS */}
          {utilitiesSubTab === "record" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form */}
              <form
                onSubmit={handleGenerateBills}
                className="lg:col-span-8 space-y-6"
              >
                <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                  <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    1. Room & Period Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Target Room
                      </label>
                      <select
                        value={selectedRoomId}
                        onChange={(e) => {
                          setSelectedRoomId(e.target.value);
                          setAdjustments({});
                        }}
                        required
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="">-- Choose Room --</option>
                        {dbRooms.map((r) => {
                          const occupants = dbStudents.filter(
                            (s) => s.roomId === r.id,
                          );
                          return (
                            <option key={r.id} value={r.id}>
                              Room {r.roomNumber} ({occupants.length} occupants)
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Billing Month
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        {[
                          "มกราคม",
                          "กุมภาพันธ์",
                          "มีนาคม",
                          "เมษายน",
                          "พฤษภาคม",
                          "มิถุนายน",
                          "กรกฎาคม",
                          "สิงหาคม",
                          "กันยายน",
                          "ตุลาคม",
                          "พฤศจิกายน",
                          "ธันวาคม",
                        ].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Billing Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <option value="2569">2569</option>
                        <option value="2570">2570</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                  <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                    2. Consumption Parameters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Water Bill */}
                    <div className="p-4 rounded-xl bg-red-50/10 border border-red-100/50 space-y-3">
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1">
                        <Droplets className="h-4 w-4" /> Water Supply (ค่าน้ำ)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Previous Meter
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={prevWaterMeter}
                            onChange={(e) =>
                              setPrevWaterMeter(parseInt(e.target.value) || 0)
                            }
                            disabled={!!waterAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Current Meter
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currWaterMeter}
                            onChange={(e) =>
                              setCurrWaterMeter(parseInt(e.target.value) || 0)
                            }
                            disabled={!!waterAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Rate (฿/unit)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={waterRate}
                            onChange={(e) =>
                              setWaterRate(parseFloat(e.target.value) || 0)
                            }
                            disabled={!!waterAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Direct Cost Override (฿)
                          </label>
                          <input
                            type="text"
                            placeholder="Direct input"
                            value={waterAmountOverride}
                            onChange={(e) =>
                              setWaterAmountOverride(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Electricity Bill */}
                    <div className="p-4 rounded-xl bg-amber-50/10 border border-amber-100/50 space-y-3">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                        <Zap className="h-4 w-4" /> Electricity Supply (ค่าไฟ)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Previous Meter
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={prevElectricMeter}
                            onChange={(e) =>
                              setPrevElectricMeter(
                                parseInt(e.target.value) || 0,
                              )
                            }
                            disabled={!!electricAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Current Meter
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={currElectricMeter}
                            onChange={(e) =>
                              setCurrElectricMeter(
                                parseInt(e.target.value) || 0,
                              )
                            }
                            disabled={!!electricAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Rate (฿/unit)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={electricRate}
                            onChange={(e) =>
                              setElectricRate(parseFloat(e.target.value) || 0)
                            }
                            disabled={!!electricAmountOverride}
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-zinc-400 uppercase">
                            Direct Cost Override (฿)
                          </label>
                          <input
                            type="text"
                            placeholder="Direct input"
                            value={electricAmountOverride}
                            onChange={(e) =>
                              setElectricAmountOverride(e.target.value)
                            }
                            className="w-full rounded-lg border border-slate-100 bg-white px-2.5 py-1.5 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Other Surcharges (฿)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={otherCharges}
                        onChange={(e) =>
                          setOtherCharges(parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                        Billing Notes / Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AC service fee included"
                        value={roomBillNotes}
                        onChange={(e) => setRoomBillNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Occupancy and Automatic Split adjustments */}
                {selectedRoomId ? (
                  (() => {
                    const occupants = dbStudents.filter(
                      (s) => s.roomId === selectedRoomId,
                    );
                    const calcWaterUnits = Math.max(
                      0,
                      currWaterMeter - prevWaterMeter,
                    );
                    const waterCost = waterAmountOverride
                      ? parseFloat(waterAmountOverride) || 0
                      : calcWaterUnits * waterRate;

                    const calcElectricUnits = Math.max(
                      0,
                      currElectricMeter - prevElectricMeter,
                    );
                    const electricCost = electricAmountOverride
                      ? parseFloat(electricAmountOverride) || 0
                      : calcElectricUnits * electricRate;

                    const totalRoomBill =
                      waterCost + electricCost + otherCharges;
                    const baseSplitAmount =
                      occupants.length > 0
                        ? totalRoomBill / occupants.length
                        : 0;

                    return (
                      <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:bg-zinc-800 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                          <h4 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">
                            3. Occupancy Split & Custom Adjustment
                          </h4>
                          <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
                            {occupants.length} Occupants
                          </span>
                        </div>

                        {occupants.length === 0 ? (
                          <div className="text-center py-6 border border-dashed rounded-xl">
                            <p className="text-xs text-zinc-500 font-bold">
                              No active roommates assigned to this room yet.
                            </p>
                            <button
                              type="button"
                              onClick={() => setUtilitiesSubTab("rooms")}
                              className="mt-2 text-xs font-black text-red-600 hover:underline"
                            >
                              Assign roommates now &rarr;
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold text-zinc-500 bg-slate-50 dark:bg-zinc-950 p-3 rounded-xl border">
                              <span>
                                Base Room Bill: ฿{totalRoomBill.toFixed(2)}
                              </span>
                              <span>
                                Auto Split Cost:{" "}
                                <span className="text-red-600 font-black">
                                  ฿{baseSplitAmount.toFixed(2)} / student
                                </span>
                              </span>
                            </div>

                            <div className="space-y-3">
                              {occupants.map((student) => {
                                const studentAdj = adjustments[student.id] || {
                                  adjustment: 0,
                                  note: "",
                                };
                                const finalAmount = Math.max(
                                  0,
                                  baseSplitAmount + studentAdj.adjustment,
                                );

                                return (
                                  <div
                                    key={student.id}
                                    className="p-3 border border-slate-100 dark:border-zinc-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 text-xs">
                                        {student.studentName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-black text-zinc-900 dark:text-white">
                                          {student.studentName}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 font-bold">
                                          ID: {student.studentNumber} • Section:{" "}
                                          {student.section}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                      {/* Direct adjustment selector */}
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-zinc-400">
                                          Adj (฿):
                                        </span>
                                        <input
                                          type="number"
                                          placeholder="0"
                                          value={
                                            studentAdj.adjustment === 0
                                              ? ""
                                              : studentAdj.adjustment
                                          }
                                          onChange={(e) => {
                                            const val =
                                              parseFloat(e.target.value) || 0;
                                            setAdjustments((prev) => ({
                                              ...prev,
                                              [student.id]: {
                                                ...studentAdj,
                                                adjustment: val,
                                              },
                                            }));
                                          }}
                                          className="w-20 rounded-lg border px-2 py-1 text-xs text-center font-bold"
                                        />
                                      </div>

                                      {/* Adjustment reason note */}
                                      <div>
                                        <input
                                          type="text"
                                          placeholder="Note/Reason"
                                          value={studentAdj.note}
                                          onChange={(e) => {
                                            setAdjustments((prev) => ({
                                              ...prev,
                                              [student.id]: {
                                                ...studentAdj,
                                                note: e.target.value,
                                              },
                                            }));
                                          }}
                                          className="w-32 sm:w-44 rounded-lg border px-2 py-1 text-xs text-zinc-800 dark:text-zinc-200"
                                        />
                                      </div>

                                      {/* Total calculated student bill */}
                                      <div className="text-right min-w-[70px]">
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase">
                                          Final Cost
                                        </p>
                                        <p className="text-xs font-black text-zinc-900 dark:text-white">
                                          ฿{finalAmount.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                              <button
                                type="submit"
                                className="bg-red-600 text-white hover:bg-red-500 font-black text-xs px-6 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                              >
                                <Check className="h-4 w-4" /> Save & Publish
                                Room Bills
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="bg-white border border-slate-100 p-8 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 text-center text-zinc-400">
                    <p className="text-xs font-bold">
                      Please select a target room above to proceed with bill
                      split calculation.
                    </p>
                  </div>
                )}
              </form>

              {/* Right Column: Billing Policy Rules */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-4">
                  <h4 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-widest">
                    Billing Rules & Guidance
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Electricity and water meter values are read monthly by
                    dormitory supervisors. The system automatically divides the
                    total costs of the room equally based on occupancy.
                  </p>
                  <div className="p-3.5 bg-slate-50 dark:bg-zinc-950 rounded-xl border text-[11px] space-y-2 text-zinc-600 dark:text-zinc-400">
                    <p className="font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                      Standard Rates:
                    </p>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li>Water: ฿10 per cubic meter unit</li>
                      <li>Electric: ฿5 per kW/h unit</li>
                      <li>
                        Adjustment overrides will reflect in students ledger.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: DORM ROOM ASSIGN */}
          {utilitiesSubTab === "rooms" && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800 space-y-6">
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white mb-1">
                  Dormitory Rooms Assignment Manager
                </h3>
                <p className="text-xs text-zinc-500">
                  Quickly coordinate student occupancy inside rooms. Click
                  remove to unassign, or select an unassigned student to assign
                  them to a room.
                </p>
              </div>

              {/* Grid of rooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dbRooms.map((room) => {
                  const occupants = dbStudents.filter(
                    (s) => s.roomId === room.id,
                  );
                  const unassigned = dbStudents.filter(
                    (s) => !s.roomId && s.status === "active",
                  );

                  return (
                    <div
                      key={room.id}
                      className="border border-slate-100 rounded-2xl p-5 dark:border-zinc-800 bg-slate-50/10 space-y-4 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-black text-zinc-800 dark:text-white flex items-center gap-1.5">
                              <Home className="h-4 w-4 text-zinc-400" /> Room{" "}
                              {room.roomNumber}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                              Floor {room.floorId || "Default"} • Cap:{" "}
                              {room.capacity || 4} Beds
                            </p>
                          </div>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${occupants.length >= (room.capacity || 4) ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                          >
                            {occupants.length} / {room.capacity || 4} Occupied
                          </span>
                        </div>

                        {/* Occupant list roster */}
                        <div className="mt-4 space-y-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                            Current Occupants
                          </span>
                          {occupants.map((student) => (
                            <div
                              key={student.id}
                              className="bg-white dark:bg-zinc-950 p-2 rounded-xl border border-slate-100 dark:border-zinc-850 flex justify-between items-center"
                            >
                              <div className="flex items-center gap-1.5 text-xs">
                                <div className="h-5 w-5 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center font-bold text-[10px]">
                                  {student.studentName.charAt(0)}
                                </div>
                                <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                                  {student.studentName}
                                </span>
                              </div>
                              <button
                                onClick={() => handleUnassignRoom(student.id)}
                                className="text-[9px] font-black text-red-600 bg-red-50 hover:bg-red-100 px-1.5 py-0.5 rounded-lg transition"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {occupants.length === 0 && (
                            <p className="text-[11px] text-zinc-400 italic py-2">
                              No students assigned to this room yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Add occupant selector */}
                      {occupants.length < (room.capacity || 4) && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-850 flex gap-1.5 items-center">
                          <select
                            value={assignRoomSelectedStudentId}
                            onChange={(e) =>
                              setAssignRoomSelectedStudentId(e.target.value)
                            }
                            className="flex-1 rounded-lg border border-slate-100 bg-white px-2 py-1.5 text-[10px] outline-hidden dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="">-- Choose Student --</option>
                            {unassigned.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.studentName} ({s.studentNumber})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              if (!assignRoomSelectedStudentId) {
                                triggerToast(
                                  "Please select a student",
                                  "error",
                                );
                                return;
                              }
                              handleAssignRoom(
                                assignRoomSelectedStudentId,
                                room.id,
                              );
                              setAssignRoomSelectedStudentId("");
                            }}
                            className="bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 px-3 py-1.5 rounded-lg text-[10px] font-black hover:opacity-90 transition cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-tab 3: MONTHLY HISTORY & SLIPS LEDGER */}
          {utilitiesSubTab === "ledger" && (
            <div className="space-y-6">
              {/* Slip Verifications Drawer / Detail Modal */}
              {verifyingPayment &&
                (() => {
                  const correspondingBill = dbBills.find(
                    (b) => b.billId === verifyingPayment.billId,
                  );
                  const studentProfile = dbStudents.find(
                    (s) => s.id === verifyingPayment.tenantId,
                  );

                  return (
                    <div className="bg-zinc-950/40 backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 text-white flex justify-between items-center">
                          <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="h-5 w-5" /> Bank Payment Slip
                            Verification
                          </h4>
                          <button
                            onClick={() => {
                              setVerifyingPayment(null);
                              setRejectionRemark("");
                            }}
                            className="text-white hover:text-red-200 transition"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column: Real Upload Preview */}
                          <div className="space-y-2 border-r pr-6 dark:border-zinc-800">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                              Student Upload Preview
                            </span>
                            {verifyingPayment.slipUrl ? (
                              <div className="border rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-950 p-2 flex items-center justify-center h-72">
                                <img
                                  src={verifyingPayment.slipUrl}
                                  alt="Payment Transfer Receipt Preview"
                                  className="max-h-full max-w-full object-contain mx-auto"
                                />
                              </div>
                            ) : (
                              <div className="border border-dashed rounded-xl h-72 flex flex-col items-center justify-center text-zinc-400">
                                <FileText className="h-10 w-10 text-zinc-300" />
                                <p className="text-xs font-bold mt-2">
                                  No slip preview image found.
                                </p>
                              </div>
                            )}
                            <div className="text-[11px] text-zinc-400 flex justify-between pt-1">
                              <span>
                                Uploaded:{" "}
                                {new Date(
                                  verifyingPayment.uploadTime,
                                ).toLocaleString()}
                              </span>
                              <span>
                                Transferred: {verifyingPayment.transferDate}
                              </span>
                            </div>
                          </div>

                          {/* Right Column: Calculations & Action Panel */}
                          <div className="space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                                Bill & Payer Details
                              </span>

                              <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border text-xs space-y-1.5 text-zinc-800 dark:text-zinc-200">
                                <p className="font-bold">
                                  Student:{" "}
                                  <span className="font-black text-zinc-950 dark:text-white">
                                    {studentProfile?.studentName ||
                                      verifyingPayment.tenantId}
                                  </span>
                                </p>
                                <p>
                                  Student ID: {studentProfile?.studentNumber} •
                                  Section: {studentProfile?.section}
                                </p>
                                <p className="border-t pt-1.5 mt-1 text-red-600 dark:text-red-400 font-black text-[11px]">
                                  Room{" "}
                                  {correspondingBill?.roomId ||
                                    verifyingPayment.roomId}{" "}
                                  Bill • {correspondingBill?.month}{" "}
                                  {correspondingBill?.year}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 pt-1">
                                  <p>
                                    Water Split: ฿
                                    {correspondingBill?.waterAmount}
                                  </p>
                                  <p>
                                    Electric Split: ฿
                                    {correspondingBill?.electricAmount}
                                  </p>
                                </div>
                              </div>

                              <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100">
                                <p className="text-[10px] font-black text-red-600 uppercase">
                                  Paid Transfer Amount
                                </p>
                                <p className="text-2xl font-black text-red-700">
                                  ฿{verifyingPayment.amount.toFixed(2)}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase">
                                  Rejection Reason Remark
                                </label>
                                <input
                                  type="text"
                                  placeholder="Explain why slip is incorrect / incomplete"
                                  value={rejectionRemark}
                                  onChange={(e) =>
                                    setRejectionRemark(e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                              <button
                                onClick={() =>
                                  handleRejectSlip(verifyingPayment.paymentId)
                                }
                                className="bg-slate-100 hover:bg-slate-200 text-zinc-800 font-black text-xs py-2.5 rounded-xl transition cursor-pointer text-center dark:bg-zinc-800 dark:text-white"
                              >
                                Reject Slip
                              </button>
                              <button
                                onClick={() =>
                                  handleApproveSlip(verifyingPayment.paymentId)
                                }
                                className="bg-red-600 hover:bg-red-500 text-white font-black text-xs py-2.5 rounded-xl transition cursor-pointer text-center"
                              >
                                Approve Payment
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* Filtering Ledger bar */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    Monthly Billing History & Ledger
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={ledgerRoomId}
                      onChange={(e) => setLedgerRoomId(e.target.value)}
                      className="rounded-lg border border-slate-100 bg-white px-2 py-1 text-xs font-semibold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">-- All Rooms --</option>
                      {dbRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.roomNumber}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ledgerMonth}
                      onChange={(e) => setLedgerMonth(e.target.value)}
                      className="rounded-lg border border-slate-100 bg-white px-2 py-1 text-xs font-semibold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">-- All Months --</option>
                      {[
                        "มิถุนายน",
                        "กรกฎาคม",
                        "สิงหาคม",
                        "กันยายน",
                        "ตุลาคม",
                        "พฤศจิกายน",
                        "ธันวาคม",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={ledgerStatus}
                      onChange={(e) => setLedgerStatus(e.target.value)}
                      className="rounded-lg border border-slate-100 bg-white px-2 py-1 text-xs font-semibold outline-hidden dark:border-zinc-800 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="">-- All Status --</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Pending">Pending Validation</option>
                      <option value="Paid">Paid</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Ledger Listing table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-50 dark:border-zinc-800 text-zinc-400 font-black uppercase text-[10px]">
                        <th className="pb-3 pl-3">Room</th>
                        <th className="pb-3">Month/Year</th>
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Water Portion</th>
                        <th className="pb-3">Power Portion</th>
                        <th className="pb-3">Total Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/50 dark:divide-zinc-800/40">
                      {dbBills
                        .filter(
                          (b) => !ledgerRoomId || b.roomId === ledgerRoomId,
                        )
                        .filter((b) => !ledgerMonth || b.month === ledgerMonth)
                        .filter(
                          (b) => !ledgerStatus || b.status === ledgerStatus,
                        )
                        .map((b) => {
                          const studentObj = dbStudents.find(
                            (s) => s.id === b.tenantId,
                          );
                          const matchingPayment = dbPayments.find(
                            (p) =>
                              p.billId === b.billId && p.status === "Pending",
                          );

                          return (
                            <tr
                              key={b.billId}
                              className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/30"
                            >
                              <td className="py-3 pl-3 font-black text-zinc-900 dark:text-white">
                                Room{" "}
                                {dbRooms.find((r) => r.id === b.roomId)
                                  ?.roomNumber || b.roomId}
                              </td>
                              <td className="py-3 font-semibold text-zinc-500">
                                {b.month} {b.year}
                              </td>
                              <td className="py-3">
                                <p className="font-bold text-zinc-800 dark:text-zinc-200">
                                  {studentObj?.studentName || b.tenantId}
                                </p>
                                <p className="text-[9px] text-zinc-400 font-semibold">
                                  ID: {studentObj?.studentNumber}
                                </p>
                              </td>
                              <td className="py-3 text-zinc-500 font-semibold">
                                {b.waterUnit} units • ฿{b.waterAmount}
                              </td>
                              <td className="py-3 text-zinc-500 font-semibold">
                                {b.electricUnit} units • ฿{b.electricAmount}
                              </td>
                              <td className="py-3 font-black text-zinc-950 dark:text-white">
                                ฿{b.totalAmount.toFixed(2)}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    b.status === "Paid"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                                      : b.status === "Pending"
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 animate-pulse"
                                        : b.status === "Rejected"
                                          ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3 pr-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  {b.status === "Pending" &&
                                    matchingPayment && (
                                      <button
                                        onClick={() =>
                                          setVerifyingPayment(matchingPayment)
                                        }
                                        className="rounded-lg bg-red-600 text-white font-black text-[10px] px-2.5 py-1 hover:bg-red-500 transition cursor-pointer flex items-center gap-1"
                                        title="Inspect Slip"
                                      >
                                        <Eye className="h-3 w-3" /> Verify
                                      </button>
                                    )}
                                  <button
                                    onClick={() =>
                                      handleDeleteTeacherBill(b.billId)
                                    }
                                    className="text-zinc-400 hover:text-red-600 p-1 rounded-lg transition cursor-pointer"
                                    title="Delete Bill"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                      {dbBills.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="py-8 text-center text-zinc-400 italic font-semibold"
                          >
                            No student bills have been recorded or generated
                            yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 7. DOCUMENTS TAB ==================== */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Academic Placement Guidelines
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Distribute evaluation logbooks, consent forms, and guidelines
              manuals to students.
            </p>

            <form onSubmit={handleAddDoc} className="flex gap-3 mb-6">
              <input
                type="text"
                placeholder="Guidelines or Form Title"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
              />
              <button
                type="submit"
                className="flex items-center gap-1 bg-red-600 px-4 py-2 text-xs font-black text-white rounded-xl shadow-xs hover:bg-red-500 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" /> Distribute
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-50 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                    <th className="pb-3 pl-3">Document Name</th>
                    <th className="pb-3">Folder Category</th>
                    <th className="pb-3">File Size</th>
                    <th className="pb-3 pr-3 text-right">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50/50 dark:divide-zinc-800/40">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs font-sans">
                        ยังไม่มีข้อมูล - เริ่มสร้างรายการแรก
                      </td>
                    </tr>
                  ) : (
                    documents.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/30"
                      >
                        <td className="py-3 pl-3 font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-red-600" />
                          {d.name}
                        </td>
                        <td className="py-3 text-zinc-500">{d.category}</td>
                        <td className="py-3 text-zinc-400 font-bold">{d.size}</td>
                        <td className="py-3 pr-3 text-right text-zinc-400">
                          {d.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 8. ANNOUNCEMENTS TAB ==================== */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Bulletin Announcement Board
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Post updates and critical schedule news directly onto students
              dashboards.
            </p>

            <form
              onSubmit={handleAddAnn}
              className="space-y-4 mb-8 p-4 bg-slate-50/50 dark:bg-zinc-950/30 rounded-2xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                    Headline Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mandatory briefing tomorrow"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                    Target Group
                  </label>
                  <select
                    value={annTargetType}
                    onChange={(e) => setAnnTargetType(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <option value="all">All Students</option>
                    <option value="course">Specific Course</option>
                    <option value="group">Practice Group</option>
                    <option value="hospital">Hospital</option>
                  </select>
                </div>
                {annTargetType !== "all" && (
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                      Target ID / Name
                    </label>
                    <input
                      type="text"
                      placeholder={
                        annTargetType === "course"
                          ? "e.g. การพยาบาลผู้ใหญ่ 2"
                          : annTargetType === "hospital"
                            ? "e.g. แหล่งฝึกสมเด็จ"
                            : "e.g. Group A1"
                      }
                      value={annTargetId}
                      onChange={(e) => setAnnTargetId(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <option value="General">General News</option>
                    <option value="Urgent">Urgent / Alert</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-zinc-400 uppercase mb-1">
                  Notice Content
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide precise details, guidelines, and contacts."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-red-600 px-4 py-2.5 text-xs font-black text-white rounded-xl shadow-xs hover:bg-red-500 transition cursor-pointer"
              >
                <Megaphone className="h-4 w-4" /> Post Bulletin
              </button>
            </form>

            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs bg-slate-50/50 dark:bg-zinc-950/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 font-sans">
                  ยังไม่มีข้อมูล - เริ่มสร้างรายการแรก
                </div>
              ) : (
                announcements.map((a) => (
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
                        {a.targetType && a.targetType !== "all" && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                            To: {a.targetType} {a.targetId}
                          </span>
                        )}
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
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 9. REPORTS TAB ==================== */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              Srisavarindhira Operational Reports
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Download clinical logs, dormitory checklists, or utility
              statements as high-quality CSV/Excel formats.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Clinical Cohort Placement.csv
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Export groups, sites, and supervising instructors logs.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast("CSV exported")}
                  className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white p-2.5 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  <FileDown className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/20 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                    Lodging Rooms & Beds Roster.xlsx
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Export student dormitory assignments and vacancies.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast("Excel exported")}
                  className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white p-2.5 cursor-pointer dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  <FileDown className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 10. SETTINGS TAB ==================== */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
              System Configurations
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Manage system defaults and placement parameters.
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Active Semester Term
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Current calendar cycle for new placements
                  </p>
                </div>
                <select
                  value={systemSemester}
                  onChange={(e) => setSystemSemester(e.target.value)}
                  className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold outline-hidden dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <option value="1/2569">Semester 1/2569</option>
                  <option value="2/2569">Semester 2/2569</option>
                  <option value="Summer/2569">Summer Term 2569</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    Automatic Lodging Allocation
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Require automated system checks during student check-ins
                  </p>
                </div>
                <button
                  onClick={() => setEnableDormChecks(!enableDormChecks)}
                  className={`px-4 py-1.5 text-xs font-black rounded-xl transition ${enableDormChecks ? "bg-red-600 text-white" : "bg-slate-100 text-zinc-400 dark:bg-zinc-800"}`}
                >
                  {enableDormChecks ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

