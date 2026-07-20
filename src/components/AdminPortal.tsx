import React, { useState, useEffect } from 'react';
import { 
  Users, Bed, CreditCard, Bell, Wrench, Settings, LogOut, Plus, Trash2, 
  Edit2, Check, X, FileSpreadsheet, Eye, Save, AlertTriangle, KeyRound, 
  Search, RefreshCw, ChevronRight, UserPlus
} from 'lucide-react';
import { dbService, Student, Room, Payment, Announcement, Issue } from '../services/db.service';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'rooms' | 'payments' | 'announcements' | 'issues' | 'settings'>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentPin, setCurrentPin] = useState<string>('');

  // Active student editing / creation
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    yearLevel: 'ชั้นปีที่ 1',
    classGroup: 'กลุ่ม A',
    phone: '',
    roomNumber: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Active room editing / creation
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState<boolean>(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
    floor: '1',
    gender: 'female' as 'male' | 'female' | 'any',
    capacity: 4
  });

  // Active announcement editing / creation
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [showAddAnnModal, setShowAddAnnModal] = useState<boolean>(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    category: 'general' as 'general' | 'urgent' | 'maintenance' | 'event'
  });

  // Active Payment Inspection
  const [inspectingPayment, setInspectingPayment] = useState<Payment | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>('');

  // Bulk Import text parser
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkResults, setBulkResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // PIN settings
  const [pinForm, setPinForm] = useState({
    newPin: '',
    confirmPin: ''
  });
  const [pinMessage, setPinMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Search/Filters
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Load everything
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allStudents, allRooms, allPayments, allAnns, allIssues, pin] = await Promise.all([
        dbService.getStudents(),
        dbService.getRooms(),
        dbService.getPayments(),
        dbService.getAnnouncements(),
        dbService.getIssues(),
        dbService.getAdminPin()
      ]);
      setStudents(allStudents);
      setRooms(allRooms);
      setPayments(allPayments);
      setAnnouncements(allAnns);
      setIssues(allIssues);
      setCurrentPin(pin);
    } catch (err) {
      console.error('Error loading admin portal database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Student Actions
  const handleStudentFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.studentId || !studentForm.firstName || !studentForm.lastName) return;

    setIsProcessing(true);
    try {
      if (editingStudent) {
        await dbService.updateStudent(editingStudent.id!, studentForm);
      } else {
        await dbService.createStudent(studentForm);
      }
      setStudentForm({
        studentId: '',
        firstName: '',
        lastName: '',
        yearLevel: 'ชั้นปีที่ 1',
        classGroup: 'กลุ่ม A',
        phone: '',
        roomNumber: '',
        status: 'active'
      });
      setEditingStudent(null);
      setShowAddStudentModal(false);
      await loadAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลนักศึกษา');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditStudent = (st: Student) => {
    setEditingStudent(st);
    setStudentForm({
      studentId: st.studentId,
      firstName: st.firstName,
      lastName: st.lastName,
      yearLevel: st.yearLevel,
      classGroup: st.classGroup,
      phone: st.phone || '',
      roomNumber: st.roomNumber || '',
      status: st.status
    });
    setShowAddStudentModal(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('คุณต้องการลบรายชื่อนักศึกษาท่านนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนคืนได้')) {
      try {
        await dbService.deleteStudent(id);
        loadAllData();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบข้อมูล');
      }
    }
  };

  // Bulk Excel/CSV Copy-Paste Parser
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setBulkLoading(true);
    setBulkResults(null);

    // Parse pasted content (supports Tab separated from Excel or Comma separated CSV)
    const lines = bulkText.trim().split(/\r?\n/);
    const parsedStudents: any[] = [];

    // Parse line by line: studentId, firstName, lastName, yearLevel, classGroup, phone, roomNumber
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Detect separator: Tab (\t) is default when copying cells directly from Excel, fallback to Comma (,)
      const sep = line.includes('\t') ? '\t' : ',';
      const cols = line.split(sep).map(col => col.trim());

      if (cols.length >= 3) {
        parsedStudents.push({
          studentId: cols[0],
          firstName: cols[1],
          lastName: cols[2],
          fullName: `${cols[1]} ${cols[2]}`.trim(),
          yearLevel: cols[3] || 'ชั้นปีที่ 1',
          classGroup: cols[4] || 'กลุ่ม A',
          phone: cols[5] || '',
          roomNumber: cols[6] || ''
        });
      }
    }

    if (parsedStudents.length === 0) {
      setBulkResults({
        success: 0,
        errors: ['ไม่พบข้อมูลที่ถูกต้อง กรุณาป้อนรูปแบบ: รหัสนักศึกษา, ชื่อ, นามสกุล, ชั้นปี, กลุ่ม, เบอร์โทร, เลขห้อง']
      });
      setBulkLoading(false);
      return;
    }

    try {
      const res = await dbService.bulkImportStudents(parsedStudents);
      setBulkResults({
        success: res.successful,
        errors: res.errors
      });
      setBulkText('');
      loadAllData();
    } catch (err: any) {
      setBulkResults({
        success: 0,
        errors: ['เกิดข้อผิดพลาดรุนแรงในการนำเข้าแบบกลุ่ม: ' + err.message]
      });
    } finally {
      setBulkLoading(false);
    }
  };

  // Room Actions
  const handleRoomFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.roomNumber || !roomForm.capacity) return;

    setIsProcessing(true);
    try {
      if (editingRoom) {
        await dbService.updateRoom(editingRoom.id!, roomForm);
      } else {
        await dbService.createRoom({
          ...roomForm,
          studentIds: []
        });
      }
      setRoomForm({
        roomNumber: '',
        building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
        floor: '1',
        gender: 'female',
        capacity: 4
      });
      setEditingRoom(null);
      setShowAddRoomModal(false);
      await loadAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการจัดเก็บข้อมูลห้องพัก');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditRoom = (rm: Room) => {
    setEditingRoom(rm);
    setRoomForm({
      roomNumber: rm.roomNumber,
      building: rm.building,
      floor: rm.floor,
      gender: rm.gender,
      capacity: rm.capacity
    });
    setShowAddRoomModal(true);
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('คุณแน่ใจว่าต้องการลบห้องพักนี้?')) {
      try {
        await dbService.deleteRoom(id);
        loadAllData();
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการลบห้องพัก');
      }
    }
  };

  // Payment Actions
  const verifyPayment = async (status: 'approved' | 'rejected') => {
    if (!inspectingPayment) return;
    if (status === 'rejected' && !rejectNotes.trim()) {
      alert('กรุณาระบุหมายเหตุหรือเหตุผลการปฏิเสธหลักฐานชำระเงิน');
      return;
    }

    setIsProcessing(true);
    try {
      await dbService.updatePaymentStatus(inspectingPayment.id!, status, rejectNotes);
      setInspectingPayment(null);
      setRejectNotes('');
      await loadAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะการเงิน');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (confirm('คุณแน่ใจว่าต้องการลบสลิปประวัติการเงินนี้?')) {
      try {
        await dbService.deletePayment(id);
        loadAllData();
      } catch (err) {
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  // Announcement Actions
  const handleAnnFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;

    setIsProcessing(true);
    try {
      if (editingAnn) {
        await dbService.updateAnnouncement(editingAnn.id!, annForm);
      } else {
        await dbService.createAnnouncement(annForm);
      }
      setAnnForm({
        title: '',
        content: '',
        category: 'general'
      });
      setEditingAnn(null);
      setShowAddAnnModal(false);
      await loadAllData();
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการประกาศข้อมูลข่าวสาร');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnForm({
      title: ann.title,
      content: ann.content,
      category: ann.category
    });
    setShowAddAnnModal(true);
  };

  const handleDeleteAnn = async (id: string) => {
    if (confirm('ยืนยันลบประกาศข้อความนี้ออกจากบอร์ดนักศึกษาใช่หรือไม่?')) {
      try {
        await dbService.deleteAnnouncement(id);
        loadAllData();
      } catch (err) {
        alert('ไม่สามารถลบข้อมูลได้');
      }
    }
  };

  // Issue status changer
  const changeIssueStatus = async (id: string, nextStatus: 'pending' | 'investigating' | 'resolved') => {
    try {
      await dbService.updateIssueStatus(id, nextStatus);
      loadAllData();
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะได้');
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (confirm('ต้องการลบประวัติคำร้องเรียนนี้หรือไม่?')) {
      try {
        await dbService.deleteIssue(id);
        loadAllData();
      } catch (err) {
        alert('ไม่สามารถลบได้');
      }
    }
  };

  // PIN Changer Actions
  const handlePinChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);

    if (pinForm.newPin.length < 4 || pinForm.newPin.length > 10) {
      setPinMessage({ text: 'รหัสผ่าน PIN ใหม่ต้องมีความยาว 4 - 10 ตัวอักษร', isError: true });
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinMessage({ text: 'รหัสผ่านยืนยันไม่ตรงกับรหัสผ่าน PIN ใหม่', isError: true });
      return;
    }

    try {
      await dbService.updateAdminPin(pinForm.newPin);
      setPinMessage({ text: '✓ เปลี่ยนรหัสผ่าน Admin PIN หอพักเสร็จสมบูรณ์แล้ว!', isError: false });
      setCurrentPin(pinForm.newPin);
      setPinForm({ newPin: '', confirmPin: '' });
    } catch (err) {
      setPinMessage({ text: 'เกิดข้อผิดพลาดในการบันทึกรหัสใหม่ลงระบบคลาวด์', isError: true });
    }
  };

  // Translate helpers
  const getExpenseLabel = (type: string) => {
    switch(type) {
      case 'water': return 'ค่าน้ำประปา';
      case 'electricity': return 'ค่าไฟฟ้า';
      case 'rent': return 'ค่าห้องพัก';
      default: return 'ค่าใช้จ่ายอื่นๆ';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ปฏิเสธ (รูปไม่ชัด/ยอดไม่ตรง)';
      default: return 'รอดำเนินการตรวจสอบ';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'urgent': return '🔴 ด่วนที่สุด';
      case 'maintenance': return '🔧 ซ่อมบำรุง';
      case 'event': return '🔵 กิจกรรม';
      default: return '📢 ข่าวสารทั่วไป';
    }
  };

  const getIssueStatusLabel = (status: string) => {
    switch(status) {
      case 'resolved': return '✓ แก้ไขเสร็จสิ้น';
      case 'investigating': return '⚙ กำลังซ่อมบำรุง';
      default: return '⏳ รอดำเนินการ';
    }
  };

  // Filters logic
  const filteredStudents = students.filter(s => {
    const term = studentSearch.toLowerCase();
    return s.fullName.toLowerCase().includes(term) || 
      s.studentId.includes(term) || 
      (s.roomNumber && s.roomNumber.includes(term));
  });

  const filteredRooms = rooms.filter(r => r.roomNumber.includes(roomSearch));

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'all') return true;
    return p.status === paymentFilter;
  });

  // KPI math
  const totalOccupancy = rooms.reduce((sum, r) => sum + students.filter(s => s.roomNumber === r.roomNumber).length, 0);
  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex transition-all duration-300">
      
      {/* 🧭 Vertical Control Sidebar for Desktop, scrollbar rail for Mobile */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex-col shrink-0 hidden md:flex border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-white text-lg font-black shadow-md">
              +
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white">แผงควบคุมอาจารย์</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">หอพักวิทยาลัยพยาบาล</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            ภาพรวมข้อมูลระบบ
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === 'students' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            จัดการข้อมูลนักศึกษา
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === 'rooms' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bed className="w-4 h-4" />
            จัดการห้องพักและอาคาร
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer relative ${
              activeTab === 'payments' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            ตรวจสอบหลักฐานโอนเงิน
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="absolute right-3 bg-rose-500 text-white text-[9px] font-black h-5 px-1.5 rounded-full flex items-center justify-center animate-bounce">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === 'announcements' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            จัดการประกาศข่าวสาร
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer relative ${
              activeTab === 'issues' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            ใบแจ้งปัญหาร้องเรียน
            {issues.filter(i => i.status === 'pending').length > 0 && (
              <span className="absolute right-3 bg-amber-500 text-white text-[9px] font-black h-5 px-1.5 rounded-full flex items-center justify-center">
                {issues.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black rounded-xl transition cursor-pointer ${
              activeTab === 'settings' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            ตั้งค่าความปลอดภัย PIN
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            ออกจากระบบแอดมิน
          </button>
        </div>
      </aside>

      {/* 📦 Main Frame content area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Row for mobile menu trigger */}
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-black">+</div >
            <h1 className="font-extrabold text-sm text-gray-900 dark:text-white">แผงอาจารย์</h1>
          </div>
          <div className="hidden md:block">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {activeTab === 'dashboard' && 'แดชบอร์ดสรุปภาพรวมหอพัก'}
              {activeTab === 'students' && 'จัดการประวัตินักศึกษาและลงทะเบียน'}
              {activeTab === 'rooms' && 'จัดสรรอาคารและห้องพักนักศึกษา'}
              {activeTab === 'payments' && 'แท่นตรวจสอบสลิปและอนุมัติการชำระเงิน'}
              {activeTab === 'announcements' && 'เขียนแก้ไขบอร์ดประกาศประชาสัมพันธ์'}
              {activeTab === 'issues' && 'รายการรับเรื่องแจ้งปัญหาจากนักศึกษา'}
              {activeTab === 'settings' && 'การตั้งค่ารหัสระบบรักษาความปลอดภัย'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-gray-400 bg-gray-100 dark:bg-zinc-800 py-1.5 px-3 rounded-lg border">
              ADMIN PIN: {currentPin}
            </span>
            <button
              onClick={onLogout}
              className="md:hidden p-2 text-gray-500 hover:text-red-600 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={loadAllData}
              title="ดึงข้อมูลล่าสุด"
              className="p-2 text-gray-500 hover:text-red-600 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-red-50 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Bar */}
        <nav className="md:hidden bg-slate-900 text-slate-100 px-2 overflow-x-auto flex gap-1 border-b border-slate-800 py-1.5 sticky top-[65px] z-30">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === 'students' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            จัดการนักศึกษา
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === 'rooms' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            จัดการห้องพัก
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 relative ${activeTab === 'payments' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            สลิป ({payments.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === 'announcements' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            จัดการประกาศ
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 relative ${activeTab === 'issues' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            ซ่อมแซม ({issues.filter(i => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 ${activeTab === 'settings' ? 'bg-red-600 text-white' : 'text-slate-300'}`}
          >
            ตั้งค่า PIN
          </button>
        </nav>

        {/* Main Admin Scroll Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400">กำลังเชื่อมฐานข้อมูลคลาวด์...</p>
            </div>
          ) : (
            <div>
              
              {/* ADMIN TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* KPI Panels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">นักศึกษาหญิงทั้งหมด</span>
                        <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">{students.length} คน</h3>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded-xl text-red-600 dark:text-red-400">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">อัตราการเข้าพัก</span>
                        <h3 className="text-2xl font-black mt-1 text-gray-900 dark:text-white">
                          {occupancyPercentage}% ({totalOccupancy}/{totalCapacity} คน)
                        </h3>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                        <Bed className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">สลิปรออนุมัติ</span>
                        <h3 className="text-2xl font-black mt-1 text-rose-600 dark:text-rose-400">
                          {payments.filter(p => p.status === 'pending').length} รายการ
                        </h3>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-950 p-3 rounded-xl text-rose-600 dark:text-rose-400">
                        <CreditCard className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ปัญหาแจ้งซ่อมแซม</span>
                        <h3 className="text-2xl font-black mt-1 text-indigo-600 dark:text-indigo-400">
                          {issues.filter(i => i.status !== 'resolved').length} เรื่อง
                        </h3>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Wrench className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Alert Banner */}
                  {payments.filter(p => p.status === 'pending').length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-amber-900">มีสลิปเงินชำระค่าน้ำค่าไฟของนักศึกษารอการอนุมัติอยู่!</p>
                          <p className="text-xs text-amber-700">กรุณาตรวจสอบความถูกต้องของสลิปหลักฐานและอนุมัติสถานะการชำระเงินของนักศึกษา</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('payments')}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black py-2 px-4 rounded-xl transition cursor-pointer"
                      >
                        ไปตรวจสอบสลิปทันที
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent issues */}
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-red-600" />
                          คำร้องแจ้งซ่อมล่าสุด
                        </h3>
                        <button onClick={() => setActiveTab('issues')} className="text-xs font-bold text-red-600 hover:underline cursor-pointer">
                          ดูทั้งหมด
                        </button>
                      </div>
                      {issues.slice(0, 3).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-6">ไม่มีรายการส่งแจ้งปัญหา</p>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                          {issues.slice(0, 3).map(iss => (
                            <div key={iss.id} className="py-2.5 flex justify-between items-center">
                              <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white">{iss.title}</p>
                                <p className="text-[10px] text-gray-400">ห้อง {iss.roomNumber} • โดย {iss.fullName}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                iss.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {getIssueStatusLabel(iss.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick setting info */}
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-red-600" />
                          สถานะความปลอดภัยของระบบ
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          ระบบหอพักเปลี่ยนมาใช้รหัสผ่านแบบ <span className="font-extrabold text-red-600">Admin PIN</span> ในการล็อกอินแผงควบคุมฝ่ายปกครอง และไม่ต้องทำการเชื่อม Firebase Auth ในการเข้าถึงพอร์ทัลนักศึกษาเพื่อความสะดวกสูงสุดในการใช้งานผ่านสมาร์ทโฟนของทุกคน
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-400">รหัสผ่านปัจจุบัน:</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentPin}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN TAB 2: STUDENT MANAGEMENT */}
              {activeTab === 'students' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top Control Options */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                    <div className="relative w-full lg:w-96">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="พิมพ์ค้นหาตามรหัสนักศึกษา ชื่อ หรือเลขห้อง..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:border-red-600 focus:outline-hidden dark:text-white"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                      <button
                        onClick={() => {
                          setEditingStudent(null);
                          setStudentForm({
                            studentId: '',
                            firstName: '',
                            lastName: '',
                            yearLevel: 'ชั้นปีที่ 1',
                            classGroup: 'กลุ่ม A',
                            phone: '',
                            roomNumber: '',
                            status: 'active'
                          });
                          setShowAddStudentModal(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-4 h-4" />
                        เพิ่มนักศึกษาเดี่ยว
                      </button>
                    </div>
                  </div>

                  {/* Bulk Paste Excel Import panel */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      นำเข้าข้อมูลนักศึกษาแบบกลุ่มจาก Excel / CSV
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      คัดลอกตารางจาก Excel แล้ววางด้านล่าง รูปแบบคอลัมน์: <span className="font-extrabold text-slate-700">รหัสนักศึกษา | ชื่อ | นามสกุล | ชั้นปี | กลุ่มเรียน | เบอร์โทร | เลขห้องพัก</span>
                    </p>

                    <form onSubmit={handleBulkImport} className="space-y-4">
                      <textarea
                        rows={4}
                        placeholder="6612005&#9;จิตรา&#9;รักการพยาบาล&#9;ชั้นปีที่ 2&#9;กลุ่ม A&#9;0851112222&#9;201&#10;6612006&#9;นงลักษณ์&#9;โชคดี&#9;ชั้นปีที่ 2&#9;กลุ่ม B&#9;0862223333&#9;202"
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-mono focus:border-red-600 focus:outline-hidden dark:text-white"
                      />
                      <div className="flex justify-between items-center">
                        <button
                          type="submit"
                          disabled={bulkLoading || !bulkText.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {bulkLoading ? 'กำลังอัปโหลด...' : 'เริ่มนำเข้าข้อมูลเข้าระบบ'}
                        </button>
                        {bulkResults && (
                          <span className="text-xs font-bold text-emerald-600">
                            ✓ สำเร็จ {bulkResults.success} รายการ | ข้อผิดพลาด {bulkResults.errors.length} รายการ
                          </span>
                        )}
                      </div>
                    </form>
                    {bulkResults && bulkResults.errors.length > 0 && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-semibold mt-4 space-y-1">
                        <p className="font-bold">รายละเอียดข้อผิดพลาดในการนำเข้า:</p>
                        {bulkResults.errors.slice(0, 5).map((e, index) => <p key={index}>• {e}</p>)}
                      </div>
                    )}
                  </div>

                  {/* List of students */}
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <th className="p-4">รหัสนักศึกษา</th>
                            <th className="p-4">ชื่อ-นามสกุล</th>
                            <th className="p-4">ระดับชั้น</th>
                            <th className="p-4">กลุ่มเรียน</th>
                            <th className="p-4">เบอร์โทรศัพท์</th>
                            <th className="p-4 text-center">ห้องพัก</th>
                            <th className="p-4 text-center">สถานะ</th>
                            <th className="p-4 text-right">เครื่องมือ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center p-10 text-gray-400">ไม่พบข้อมูลนักศึกษาที่ระบุ</td>
                            </tr>
                          ) : (
                            filteredStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                                <td className="p-4 font-bold text-gray-900 dark:text-white">{st.studentId}</td>
                                <td className="p-4 font-semibold text-gray-800 dark:text-zinc-200">{st.fullName}</td>
                                <td className="p-4 text-xs text-gray-500">{st.yearLevel}</td>
                                <td className="p-4 text-xs text-gray-500">{st.classGroup}</td>
                                <td className="p-4 text-xs text-gray-500">{st.phone || '-'}</td>
                                <td className="p-4 text-center font-bold text-red-600">{st.roomNumber || '-'}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    st.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {st.status === 'active' ? 'ปกติ' : 'พักเรียน'}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-1.5 shrink-0">
                                  <button 
                                    onClick={() => handleEditStudent(st)}
                                    className="p-1.5 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition text-gray-400 cursor-pointer"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteStudent(st.id!)}
                                    className="p-1.5 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition text-gray-400 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add / Edit Student Modal */}
                  {showAddStudentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg p-6 border shadow-2xl relative">
                        <button 
                          onClick={() => setShowAddStudentModal(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-5 border-b pb-2">
                          {editingStudent ? '✓ แก้ไขข้อมูลนักศึกษา' : '+ เพิ่มรายชื่อนักศึกษาใหม่'}
                        </h3>
                        <form onSubmit={handleStudentFormSubmit} className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">รหัสนักศึกษา</label>
                              <input 
                                type="text"
                                required
                                value={studentForm.studentId}
                                onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">เบอร์โทรศัพท์</label>
                              <input 
                                type="text"
                                value={studentForm.phone}
                                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">ชื่อจริง</label>
                              <input 
                                type="text"
                                required
                                value={studentForm.firstName}
                                onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">นามสกุล</label>
                              <input 
                                type="text"
                                required
                                value={studentForm.lastName}
                                onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">ระดับชั้นปี</label>
                              <input 
                                type="text"
                                value={studentForm.yearLevel}
                                onChange={(e) => setStudentForm({ ...studentForm, yearLevel: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">กลุ่มเรียน (Class Group)</label>
                              <input 
                                type="text"
                                value={studentForm.classGroup}
                                onChange={(e) => setStudentForm({ ...studentForm, classGroup: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">จัดสรรเลขห้องพัก</label>
                              <input 
                                type="text"
                                placeholder="เช่น 101 (ปล่อยว่างหากยังไม่มี)"
                                value={studentForm.roomNumber}
                                onChange={(e) => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">สถานะผู้เข้าพัก</label>
                              <select
                                value={studentForm.status}
                                onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white focus:outline-hidden"
                              >
                                <option value="active">ปกติ / เข้าพัก</option>
                                <option value="inactive">พักเรียน / ยกเลิก</option>
                              </select>
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end gap-2.5">
                            <button 
                              type="button" 
                              onClick={() => setShowAddStudentModal(false)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold rounded-xl cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                            <button 
                              type="submit" 
                              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              บันทึกข้อมูล
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ADMIN TAB 3: ROOM MANAGEMENT */}
              {activeTab === 'rooms' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Top Control Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="พิมพ์ค้นเลขห้อง เช่น 101..."
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:border-red-600 focus:outline-hidden dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingRoom(null);
                        setRoomForm({
                          roomNumber: '',
                          building: 'อาคารหอพักหญิง 1 (เรือนรักกัลยา)',
                          floor: '1',
                          gender: 'female',
                          capacity: 4
                        });
                        setShowAddRoomModal(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มห้องพักใหม่
                    </button>
                  </div>

                  {/* List of rooms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.map((room) => {
                      // Find actual students currently in this room
                      const roommates = students.filter(s => s.roomNumber === room.roomNumber);
                      
                      return (
                        <div 
                          key={room.id}
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden"
                        >
                          <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-semibold text-slate-300">{room.building}</span>
                              <h3 className="text-lg font-black">ห้อง {room.roomNumber}</h3>
                            </div>
                            <span className="bg-slate-700 text-xs py-1 px-2.5 rounded-lg border border-slate-600 font-bold">
                              {room.gender === 'female' ? 'หญิง' : 'ชาย'}
                            </span>
                          </div>
                          
                          <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                              <span>ผู้เข้าพักที่ลงทะเบียน</span>
                              <span>{roommates.length} / {room.capacity} คน</span>
                            </div>

                            {roommates.length === 0 ? (
                              <p className="text-xs text-gray-400 italic text-center py-2">ว่าง / ไม่มีคนพัก</p>
                            ) : (
                              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {roommates.map(st => (
                                  <div key={st.id} className="py-2 text-xs flex justify-between">
                                    <span className="font-bold text-gray-700 dark:text-zinc-200">{st.fullName}</span>
                                    <span className="text-gray-400">รหัส {st.studentId}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="px-3 py-1.5 text-xs font-bold bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 border rounded-lg text-gray-600 dark:text-zinc-300 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                แก้ไข
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id!)}
                                className="px-3 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                ลบ
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add / Edit Room Modal */}
                  {showAddRoomModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md p-6 border shadow-2xl relative">
                        <button onClick={() => setShowAddRoomModal(false)} className="absolute top-4 right-4 text-gray-400">
                          <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-4 border-b pb-2">
                          {editingRoom ? 'แก้ไขข้อมูลห้องพัก' : 'เพิ่มห้องพักใหม่'}
                        </h3>
                        <form onSubmit={handleRoomFormSubmit} className="space-y-4 text-sm">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">เลขห้องพัก</label>
                            <input 
                              type="text"
                              required
                              placeholder="เช่น 101, 204"
                              value={roomForm.roomNumber}
                              onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">อาคารพักอาศัย</label>
                            <input 
                              type="text"
                              required
                              value={roomForm.building}
                              onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">ชั้นที่</label>
                              <input 
                                type="text"
                                required
                                value={roomForm.floor}
                                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">ประเภทหอ</label>
                              <select
                                value={roomForm.gender}
                                onChange={(e) => setRoomForm({ ...roomForm, gender: e.target.value as any })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white focus:outline-hidden"
                              >
                                <option value="female">หญิง</option>
                                <option value="male">ชาย</option>
                                <option value="any">รวม</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1">ความจุ (คน)</label>
                              <input 
                                type="number"
                                required
                                min="1"
                                value={roomForm.capacity}
                                onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 0 })}
                                className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                              />
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end gap-2">
                            <button 
                              type="button" 
                              onClick={() => setShowAddRoomModal(false)}
                              className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 rounded-xl font-bold cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                            <button 
                              type="submit" 
                              className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              บันทึกห้อง
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ADMIN TAB 4: SLIP VERIFICATION */}
              {activeTab === 'payments' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex gap-2 border-b border-gray-200 pb-3">
                    <button
                      onClick={() => setPaymentFilter('all')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition ${paymentFilter === 'all' ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      ทั้งหมด ({payments.length})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('pending')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition relative ${paymentFilter === 'pending' ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      รอดำเนินการ ({payments.filter(p => p.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('approved')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition ${paymentFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      อนุมัติแล้ว ({payments.filter(p => p.status === 'approved').length})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('rejected')}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition ${paymentFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                      ปฏิเสธแล้ว ({payments.filter(p => p.status === 'rejected').length})
                    </button>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <th className="p-4">นักศึกษาผู้แจ้ง</th>
                            <th className="p-4">ห้อง</th>
                            <th className="p-4">ประเภทค่าใช้จ่าย</th>
                            <th className="p-4">รอบเดือน</th>
                            <th className="p-4 text-right">จำนวนเงิน</th>
                            <th className="p-4 text-center">สลิป</th>
                            <th className="p-4 text-center">สถานะ</th>
                            <th className="p-4 text-right">เครื่องมือ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-sm">
                          {filteredPayments.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center p-10 text-gray-400">ไม่มีสลิปการเงินในหมวดหมู่นี้</td>
                            </tr>
                          ) : (
                            filteredPayments.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-bold">
                                  {p.fullName}
                                  <p className="text-[10px] text-gray-400 font-semibold">รหัส {p.studentId}</p>
                                </td>
                                <td className="p-4 font-bold text-gray-800 dark:text-zinc-200">{p.roomNumber}</td>
                                <td className="p-4 font-semibold text-xs text-gray-500">{getExpenseLabel(p.expenseType)}</td>
                                <td className="p-4 text-xs text-gray-500">{p.month}</td>
                                <td className="p-4 text-right font-bold text-gray-950 dark:text-white">
                                  {p.amount.toLocaleString()} บาท
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => {
                                      setInspectingPayment(p);
                                      setRejectNotes(p.notes || '');
                                    }}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusColor(p.status)}`}>
                                    {getStatusLabel(p.status)}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleDeletePayment(p.id!)}
                                    className="p-1.5 hover:text-rose-600 hover:bg-gray-100 rounded-lg text-gray-400 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Inspect Lightbox Modal */}
                  {inspectingPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-3xl p-6 border shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">
                        <button 
                          onClick={() => setInspectingPayment(null)} 
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        
                        {/* Slip Image Panel */}
                        <div className="flex-1 bg-gray-100 dark:bg-zinc-950 rounded-2xl p-2 flex items-center justify-center border min-h-[300px]">
                          <img 
                            src={inspectingPayment.slipUrl} 
                            alt="Slip transfer proof" 
                            className="max-h-[60vh] object-contain rounded-lg"
                          />
                        </div>

                        {/* Detail Controls Panel */}
                        <div className="w-full md:w-80 flex flex-col justify-between">
                          <div className="space-y-4">
                            <h3 className="font-black text-lg text-gray-900 dark:text-white border-b pb-2">
                              ตรวจสอบสลิปการเงิน
                            </h3>
                            <div className="space-y-2 text-xs">
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">นักศึกษา:</span> 
                                <span className="font-extrabold text-gray-800 dark:text-zinc-200">{inspectingPayment.fullName}</span>
                              </p>
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">รหัส:</span> 
                                <span className="font-extrabold text-gray-800 dark:text-zinc-200">{inspectingPayment.studentId}</span>
                              </p>
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">ห้องพัก:</span> 
                                <span className="font-extrabold text-red-600">{inspectingPayment.roomNumber}</span>
                              </p>
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">รอบเดือน:</span> 
                                <span className="font-extrabold text-gray-800 dark:text-zinc-200">{inspectingPayment.month}</span>
                              </p>
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">ประเภท:</span> 
                                <span className="font-extrabold text-gray-800 dark:text-zinc-200">{getExpenseLabel(inspectingPayment.expenseType)}</span>
                              </p>
                              <p className="flex justify-between border-b pb-1">
                                <span className="text-gray-400 font-bold">จำนวนเงินชำระ:</span> 
                                <span className="font-black text-gray-950 dark:text-white text-sm">{inspectingPayment.amount.toLocaleString()} บาท</span>
                              </p>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-gray-400 mb-1.5">หมายเหตุเพิ่มหากมีการปฏิเสธ</label>
                              <textarea
                                rows={2}
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="เช่น ยอดโอนไม่ถูกต้อง, รูปภาพสลิปไม่ชัดเจน รบกวนส่งใหม่"
                                className="w-full p-2.5 bg-gray-50 border rounded-xl text-xs focus:outline-hidden"
                              />
                            </div>
                          </div>

                          <div className="space-y-2.5 pt-6 border-t mt-4">
                            <button
                              onClick={() => verifyPayment('approved')}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Check className="w-4 h-4" />
                              อนุมัติสถานะชำระเงินสำเร็จ
                            </button>
                            <button
                              onClick={() => verifyPayment('rejected')}
                              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <X className="w-4 h-4" />
                              ปฏิเสธรายการ / ไม่อนุมัติ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ADMIN TAB 5: ANNOUNCEMENTS MANAGER */}
              {activeTab === 'announcements' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setEditingAnn(null);
                        setAnnForm({
                          title: '',
                          content: '',
                          category: 'general'
                        });
                        setShowAddAnnModal(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      เขียนประกาศใหม่
                    </button>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border p-10 rounded-2xl text-center text-gray-400">
                      ไม่มีประกาศในบอร์ดประชาสัมพันธ์ขณะนี้
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {announcements.map((ann) => (
                        <div 
                          key={ann.id} 
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex justify-between gap-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400">
                                {getCategoryLabel(ann.category)}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                • {new Date(ann.createdAt).toLocaleString('th-TH')}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{ann.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-wrap">{ann.content}</p>
                          </div>
                          
                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => handleEditAnn(ann)}
                              className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 rounded-xl text-gray-500 transition cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnn(ann.id!)}
                              className="p-2 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Edit Announcement Modal */}
                  {showAddAnnModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-xl p-6 border shadow-2xl relative">
                        <button onClick={() => setShowAddAnnModal(false)} className="absolute top-4 right-4 text-gray-400">
                          <X className="w-5 h-5" />
                        </button>
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-4 border-b pb-2">
                          {editingAnn ? 'แก้ไขประกาศประชาสัมพันธ์' : 'เขียนประกาศสถาบันใหม่'}
                        </h3>
                        <form onSubmit={handleAnnFormSubmit} className="space-y-4 text-sm">
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">หมวดหมู่ข่าวสาร</label>
                            <select
                              value={annForm.category}
                              onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as any })}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white focus:outline-hidden"
                            >
                              <option value="general">ประชาสัมพันธ์ทั่วไป</option>
                              <option value="urgent">🔴 ด่วนที่สุด (คำเตือน/กำหนดการสำคัญ)</option>
                              <option value="maintenance">🔧 ซ่อมบำรุงอาคาร/ไฟฟ้า/ประปา</option>
                              <option value="event">🔵 กิจกรรมหอพักนักศึกษา</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">หัวข้อประกาศ</label>
                            <input 
                              type="text"
                              required
                              value={annForm.title}
                              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1">รายละเอียดประกาศ</label>
                            <textarea 
                              required
                              rows={5}
                              value={annForm.content}
                              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-sm dark:text-white resize-none"
                            />
                          </div>

                          <div className="pt-4 flex justify-end gap-2">
                            <button 
                              type="button" 
                              onClick={() => setShowAddAnnModal(false)}
                              className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 rounded-xl font-bold cursor-pointer"
                            >
                              ยกเลิก
                            </button>
                            <button 
                              type="submit" 
                              className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              โพสต์ข่าวสาร
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ADMIN TAB 6: REPORT ISSUES */}
              {activeTab === 'issues' && (
                <div className="space-y-6 animate-fadeIn">
                  {issues.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border p-10 rounded-2xl text-center text-gray-400">
                      ไม่มีใบรับเรื่องแจ้งปัญหาจากระบบ
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {issues.map((iss) => (
                        <div 
                          key={iss.id} 
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs relative flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-3">
                              <span className="text-xs text-red-600 font-extrabold">ห้องพัก {iss.roomNumber}</span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                {new Date(iss.createdAt).toLocaleString('th-TH')}
                              </span>
                            </div>
                            <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-2">{iss.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed mb-6">{iss.description}</p>
                          </div>

                          <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-semibold">ผู้แจ้ง: {iss.fullName} (รหัส {iss.studentId})</span>
                            <div className="flex flex-wrap gap-1">
                              <button
                                onClick={() => changeIssueStatus(iss.id!, 'pending')}
                                className={`px-2 py-1 text-[9px] font-bold rounded ${iss.status === 'pending' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                              >
                                รอทำ
                              </button>
                              <button
                                onClick={() => changeIssueStatus(iss.id!, 'investigating')}
                                className={`px-2 py-1 text-[9px] font-bold rounded ${iss.status === 'investigating' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                              >
                                กำลังทำ
                              </button>
                              <button
                                onClick={() => changeIssueStatus(iss.id!, 'resolved')}
                                className={`px-2 py-1 text-[9px] font-bold rounded ${iss.status === 'resolved' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                              >
                                เสร็จแล้ว
                              </button>
                              <button
                                onClick={() => handleDeleteIssue(iss.id!)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN TAB 7: SETTINGS & PIN RESET */}
              {activeTab === 'settings' && (
                <div className="max-w-md mx-auto animate-fadeIn">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-5">
                      <KeyRound className="w-5 h-5 text-red-600" />
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">เปลี่ยนรหัสผ่านแอดมิน (Admin PIN)</h2>
                    </div>

                    <form onSubmit={handlePinChangeSubmit} className="space-y-4">
                      {pinMessage && (
                        <div className={`p-3 rounded-xl text-xs font-bold ${pinMessage.isError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {pinMessage.text}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">รหัสผ่านปัจจุบัน</label>
                        <input 
                          type="text" 
                          disabled 
                          value={currentPin}
                          className="w-full bg-gray-100 border p-2.5 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">รหัสผ่านใหม่ (4 - 10 ตัวเลข/อักษร)</label>
                        <input 
                          type="password" 
                          required
                          value={pinForm.newPin}
                          onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-xs font-mono dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-1">ยืนยันรหัสผ่านใหม่</label>
                        <input 
                          type="password" 
                          required
                          value={pinForm.confirmPin}
                          onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border p-2.5 rounded-xl text-xs font-mono dark:text-white"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>บันทึกเปลี่ยนรหัสผ่าน PIN ใหม่</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>
    </div>
  );
};
