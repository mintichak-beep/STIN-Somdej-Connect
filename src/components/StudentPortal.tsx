import React, { useState, useEffect } from 'react';
import { 
  Home, Bed, CreditCard, UploadCloud, Wrench, Bell, 
  Search, CheckCircle, AlertTriangle, RefreshCw, Eye, X, Send, BookOpen
} from 'lucide-react';
import { dbService, Student, Room, Payment, Announcement, Issue } from '../services/db.service';

interface StudentPortalProps {
  onAdminClick: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onAdminClick }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'rooms' | 'payments' | 'upload' | 'issues'>('home');
  const [loading, setLoading] = useState<boolean>(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  // Search and filter states
  const [roomSearch, setRoomSearch] = useState<string>('');
  const [roomGenderFilter, setRoomGenderFilter] = useState<string>('all');
  const [studentIdSearch, setStudentIdSearch] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [historySearched, setHistorySearched] = useState<boolean>(false);

  // Form states - Upload Slip
  const [uploadForm, setUploadForm] = useState({
    studentId: '',
    fullName: '',
    roomNumber: '',
    month: new Date().toISOString().substring(0, 7), // YYYY-MM
    expenseType: 'water' as 'water' | 'electricity' | 'rent' | 'other',
    amount: '',
    slipUrl: ''
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form states - Issue Report
  const [issueForm, setIssueForm] = useState({
    studentId: '',
    fullName: '',
    roomNumber: '',
    title: '',
    description: ''
  });
  const [issueSubmitting, setIssueSubmitting] = useState<boolean>(false);
  const [issueSuccess, setIssueSuccess] = useState<boolean>(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Load portal data
  const loadData = async () => {
    setLoading(true);
    try {
      const [allAnns, allRooms, allStudents, allPayments, allIssues] = await Promise.all([
        dbService.getAnnouncements(),
        dbService.getRooms(),
        dbService.getStudents(),
        dbService.getPayments(),
        dbService.getIssues()
      ]);
      setAnnouncements(allAnns);
      setRooms(allRooms);
      setStudents(allStudents);
      setPayments(allPayments);
      setIssues(allIssues);
    } catch (err) {
      console.error('Error loading student portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Student ID Lookup in Upload Slip & Issue Forms to auto-fill details
  const handleStudentIdLookup = (id: string, type: 'upload' | 'issue') => {
    const student = students.find(s => s.studentId === id);
    if (student) {
      if (type === 'upload') {
        setUploadForm(prev => ({
          ...prev,
          studentId: id,
          fullName: student.fullName,
          roomNumber: student.roomNumber
        }));
      } else {
        setIssueForm(prev => ({
          ...prev,
          studentId: id,
          fullName: student.fullName,
          roomNumber: student.roomNumber
        }));
      }
    } else {
      if (type === 'upload') {
        setUploadForm(prev => ({ ...prev, studentId: id }));
      } else {
        setIssueForm(prev => ({ ...prev, studentId: id }));
      }
    }
  };

  // Convert uploaded image to Base64 dataUrl
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setUploadError('ขนาดไฟล์ต้องไม่เกิน 1.5MB เนื่องจากข้อจำกัดของระบบคลาวด์');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm(prev => ({ ...prev, slipUrl: reader.result as string }));
        setUploadError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit payment slip
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.studentId || !uploadForm.fullName || !uploadForm.roomNumber || !uploadForm.amount || !uploadForm.slipUrl) {
      setUploadError('กรุณากรอกข้อมูลให้ครบถ้วนและอัปโหลดสลิปหลักฐาน');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await dbService.createPayment({
        studentId: uploadForm.studentId,
        fullName: uploadForm.fullName,
        roomNumber: uploadForm.roomNumber,
        month: uploadForm.month,
        expenseType: uploadForm.expenseType,
        amount: parseFloat(uploadForm.amount),
        slipUrl: uploadForm.slipUrl,
        status: 'pending'
      });
      setUploadSuccess(true);
      setUploadForm({
        studentId: '',
        fullName: '',
        roomNumber: '',
        month: new Date().toISOString().substring(0, 7),
        expenseType: 'water',
        amount: '',
        slipUrl: ''
      });
      await loadData(); // Refresh history
    } catch (err: any) {
      setUploadError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดหลักฐาน');
    } finally {
      setUploading(false);
    }
  };

  // Submit facility issue ticket
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.studentId || !issueForm.fullName || !issueForm.roomNumber || !issueForm.title || !issueForm.description) {
      setIssueError('กรุณากรอกข้อมูลแจ้งปัญหาให้ครบถ้วนทุกช่อง');
      return;
    }
    setIssueSubmitting(true);
    setIssueError(null);
    try {
      await dbService.createIssue({
        studentId: issueForm.studentId,
        fullName: issueForm.fullName,
        roomNumber: issueForm.roomNumber,
        title: issueForm.title,
        description: issueForm.description,
        status: 'pending'
      });
      setIssueSuccess(true);
      setIssueForm({
        studentId: '',
        fullName: '',
        roomNumber: '',
        title: '',
        description: ''
      });
      await loadData(); // Refresh issues list
    } catch (err: any) {
      setIssueError(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูลแจ้งปัญหา');
    } finally {
      setIssueSubmitting(false);
    }
  };

  // Search personal payment history by student ID
  const searchPaymentHistory = () => {
    if (!studentIdSearch.trim()) return;
    const history = payments.filter(p => p.studentId.trim() === studentIdSearch.trim());
    setPaymentHistory(history);
    setHistorySearched(true);
  };

  // Helper translations for UI
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
      case 'approved': return 'อนุมัติแล้ว (สำเร็จ)';
      case 'rejected': return 'ปฏิเสธ (ตรวจสอบใหม่)';
      default: return 'รอดำเนินการ';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400';
      case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400';
    }
  };

  const getIssueStatusLabel = (status: string) => {
    switch(status) {
      case 'resolved': return 'แก้ไขเสร็จสิ้น';
      case 'investigating': return 'กำลังดำเนินการซ่อมบำรุง';
      default: return 'รอดำเนินการ';
    }
  };

  const getIssueStatusColor = (status: string) => {
    switch(status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'investigating': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'urgent': return 'bg-rose-500 text-white';
      case 'maintenance': return 'bg-amber-500 text-white';
      case 'event': return 'bg-sky-500 text-white';
      default: return 'bg-zinc-500 text-white';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'urgent': return 'ด่วนที่สุด';
      case 'maintenance': return 'ประกาศซ่อมบำรุง';
      case 'event': return 'ข่าวสารกิจกรรม';
      default: return 'ทั่วไป';
    }
  };

  // Filtered rooms logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.includes(roomSearch) || 
      (students.filter(s => s.roomNumber === room.roomNumber).some(s => s.fullName.includes(roomSearch)));
    const matchesGender = roomGenderFilter === 'all' || room.gender === roomGenderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* 🏥 Top Header Bar (Branded for Srisavarindhira Thai Red Cross Institute of Nursing) */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-700 to-red-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full shadow-inner flex items-center justify-center">
              {/* Red Cross emblem placeholder style */}
              <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-xs">
                +
              </div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">STIN-Somdej Connect</h1>
              <p className="text-xs text-red-100 font-semibold tracking-wide uppercase">
                ระบบบริการหอพักนักศึกษา • สถาบันการพยาบาลศรีสวรินทิรา สภากาชาดไทย
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
              onClick={onAdminClick}
              className="flex items-center gap-2 bg-red-900/40 hover:bg-red-900/60 text-white text-sm font-bold py-2 px-4 rounded-xl border border-red-500/30 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-red-200" />
              <span>แผงควบคุมอาจารย์ / Admin PIN</span>
            </button>
            <button 
              onClick={loadData}
              title="ดึงข้อมูลใหม่"
              className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Sub-Navigation Tab Rail */}
      <nav className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-[72px] md:top-[80px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-2 overflow-x-auto flex gap-1 scrollbar-hide py-1.5">
          <button
            onClick={() => { setActiveTab('home'); setUploadSuccess(false); setIssueSuccess(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'home' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Home className="w-4 h-4" />
            หน้าแรก & ประกาศ
          </button>
          <button
            onClick={() => { setActiveTab('rooms'); setUploadSuccess(false); setIssueSuccess(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'rooms' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Bed className="w-4 h-4" />
            ข้อมูลห้องพัก
          </button>
          <button
            onClick={() => { setActiveTab('payments'); setUploadSuccess(false); setIssueSuccess(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            ตรวจสอบค่าใช้จ่าย
          </button>
          <button
            onClick={() => { setActiveTab('upload'); setUploadSuccess(false); setIssueSuccess(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'upload' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            อัปโหลดสลิปชำระเงิน
          </button>
          <button
            onClick={() => { setActiveTab('issues'); setUploadSuccess(false); setIssueSuccess(false); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'issues' 
                ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                : 'text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            แจ้งเรื่องร้องเรียน/ซ่อมแซม
          </button>
        </div>
      </nav>

      {/* 📦 Main Body Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">กำลังโหลดฐานข้อมูลหอพักสถาบัน...</p>
          </div>
        ) : (
          <div>
            {/* TAB 1: HOME & ANNOUNCEMENTS */}
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Statistics Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex items-center gap-5">
                    <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-xl text-red-600 dark:text-red-400">
                      <Bed className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">ห้องพักทั้งหมด</h3>
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{rooms.length} ห้อง</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex items-center gap-5">
                    <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-xl text-red-600 dark:text-red-400">
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">สลิปที่รอดำเนินการ</h3>
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                        {payments.filter(p => p.status === 'pending').length} รายการ
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex items-center gap-5">
                    <div className="bg-red-50 dark:bg-red-950/50 p-4 rounded-xl text-red-600 dark:text-red-400">
                      <Wrench className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">รายการแจ้งซ่อม</h3>
                      <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                        {issues.filter(i => i.status !== 'resolved').length} เรื่อง
                      </p>
                    </div>
                  </div>
                </div>

                {/* Left Side: Announcements */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 font-extrabold text-lg text-gray-900 dark:text-white">
                    <Bell className="w-5 h-5 text-red-600" />
                    <h2>ข่าวประชาสัมพันธ์ & ประกาศจากผู้ดูแลหอพัก</h2>
                  </div>

                  {announcements.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-gray-500">
                      ยังไม่มีประกาศจากหอพักในขณะนี้
                    </div>
                  ) : (
                    announcements.map((ann) => (
                      <div 
                        key={ann.id} 
                        className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-xs relative overflow-hidden transition hover:border-gray-300 dark:hover:border-zinc-700 ${
                          ann.category === 'urgent' ? 'border-l-4 border-l-rose-500 border-gray-200 dark:border-zinc-800' : 'border-gray-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(ann.category)}`}>
                            {getCategoryLabel(ann.category)}
                          </span>
                          <span className="text-xs text-gray-400 font-semibold">
                            {new Date(ann.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{ann.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {ann.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Right Side: Quick Info Panel */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-extrabold text-lg text-gray-900 dark:text-white">
                    <BookOpen className="w-5 h-5 text-red-600" />
                    <h2>ข้อมูลและกฎระเบียบทั่วไป</h2>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-200">💰 อัตราค่าใช้จ่ายหอพัก</h4>
                      <ul className="text-xs text-gray-500 dark:text-zinc-400 mt-1.5 space-y-1">
                        <li>• ค่าห้องพัก: 1,500 บาท / เดือน / คน</li>
                        <li>• ค่าน้ำประปา: อัตราเหมา 150 บาท / เดือน</li>
                        <li>• ค่าไฟฟ้า: คิดตามมิเตอร์จริง หน่วยละ 6 บาท</li>
                      </ul>
                    </div>
                    <div className="border-b border-gray-100 dark:border-zinc-800 pb-3">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-200">⏰ เวลาเปิด-ปิดหอพัก</h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                        หอพักเปิดเวลา 05:00 น. และปิดประตูทางเข้าหลักเวลา 21:00 น. นักศึกษาพยาบาลที่เข้าเวรฝึกปฏิบัติงานราชการคลินิกกรุณาพกบัตรประจำตัวเพื่อแสดงต่อเจ้าหน้าที่รปภ.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-200">📞 ติดต่อผู้ดูแลหอพัก</h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                        ฝ่ายปกครองและจัดการหอพักหญิง อาคาร 1: โทร 02-123-4567 ต่อ 1010 ในเวลาราชการ
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ROOM LIST & ROOMMATES */}
            {activeTab === 'rooms' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="ค้นหาตามเลขห้องพัก หรือชื่อเพื่อนร่วมห้อง..."
                      value={roomSearch}
                      onChange={(e) => setRoomSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:border-red-600 focus:outline-hidden dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <select
                      value={roomGenderFilter}
                      onChange={(e) => setRoomGenderFilter(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-zinc-300 focus:outline-hidden"
                    >
                      <option value="all">ทั้งหมด (ชาย/หญิง)</option>
                      <option value="female">เฉพาะหอพักหญิง</option>
                      <option value="male">เฉพาะหอพักชาย</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => {
                    // Find actual students currently in this room based on student roomNumber
                    const roommates = students.filter(s => s.roomNumber === room.roomNumber);
                    
                    return (
                      <div 
                        key={room.id}
                        className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden hover:shadow-md transition duration-200"
                      >
                        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-red-100 uppercase tracking-wider">{room.building}</span>
                            <h3 className="text-xl font-black mt-0.5">ห้อง {room.roomNumber}</h3>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-red-700`}>
                            ชั้น {room.floor} • หอพัก{room.gender === 'female' ? 'หญิง' : 'ชาย'}
                          </span>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              <span>รายชื่อสมาชิกภายในห้องพัก</span>
                              <span>{roommates.length} / {room.capacity} คน</span>
                            </div>
                            
                            {roommates.length === 0 ? (
                              <p className="text-sm text-gray-400 dark:text-zinc-500 italic py-2 text-center">ยังไม่มีผู้เข้าพัก</p>
                            ) : (
                              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {roommates.map((st) => (
                                  <div key={st.id} className="py-2.5 flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">{st.fullName}</p>
                                      <p className="text-xs text-gray-500 dark:text-zinc-400">รหัสนักศึกษา {st.studentId} • {st.yearLevel}</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
                                      {st.classGroup}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CHECK EXPENSES & BILLS */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">🔍 ตรวจสอบสถานะสลิปที่อัปโหลด</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-5">
                    ป้อนรหัสประจำตัวนักศึกษาของคุณเพื่อตรวจสอบหลักฐานการเงิน ประวัติ และหมายเหตุจากผู้ดูแลระบบหอพัก
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="ป้อนรหัสประจำตัวนักศึกษา (เช่น 6612001)"
                      value={studentIdSearch}
                      onChange={(e) => setStudentIdSearch(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                    />
                    <button 
                      onClick={searchPaymentHistory}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition cursor-pointer"
                    >
                      ค้นหาประวัติชำระเงิน
                    </button>
                  </div>
                </div>

                {historySearched && (
                  <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs animate-fadeIn">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4">
                      ผลการค้นหาสำหรับรหัสประจำตัว {studentIdSearch} ({paymentHistory.length} รายการ)
                    </h3>

                    {paymentHistory.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 dark:text-zinc-500 font-semibold">
                        ไม่พบประวัติการอัปโหลดสลิปของรหัสนักศึกษานี้ในระบบ
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-400">
                              <th className="pb-3">ประเภท</th>
                              <th className="pb-3">รอบประจำเดือน</th>
                              <th className="pb-3 text-right">จำนวนเงิน</th>
                              <th className="pb-3 text-center">สถานะ</th>
                              <th className="pb-3">บันทึกเพิ่มเติมจากอาจารย์</th>
                              <th className="pb-3 text-right">วันเวลาอัปโหลด</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                            {paymentHistory.map((p) => (
                              <tr key={p.id} className="text-sm">
                                <td className="py-3.5 font-bold text-gray-800 dark:text-zinc-200">
                                  {getExpenseLabel(p.expenseType)}
                                </td>
                                <td className="py-3.5 text-gray-600 dark:text-zinc-300">{p.month}</td>
                                <td className="py-3.5 text-right font-semibold text-gray-950 dark:text-white">
                                  {p.amount.toLocaleString()} บาท
                                </td>
                                <td className="py-3.5 text-center">
                                  <span className={`px-2.5 py-1 border rounded-md text-xs font-bold ${getStatusColor(p.status)}`}>
                                    {getStatusLabel(p.status)}
                                  </span>
                                </td>
                                <td className="py-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                                  {p.notes || '-'}
                                </td>
                                <td className="py-3.5 text-right text-xs text-gray-400">
                                  {new Date(p.createdAt).toLocaleDateString('th-TH')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: UPLOAD PAYMENT SLIP */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto animate-fadeIn">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md">
                  <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4 mb-6">
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-xl text-red-600 dark:text-red-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">อัปโหลดหลักฐานสลิปการชำระเงิน</h2>
                      <p className="text-xs text-gray-400 dark:text-zinc-400">กรอกข้อมูลผู้ชำระให้ถูกต้อง สลิปจะถูกบันทึกเข้าระบบเพื่อให้ผู้ดูแลหอพักตรวจสอบ</p>
                    </div>
                  </div>

                  {uploadSuccess ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">อัปโหลดหลักฐานสำเร็จ!</h3>
                      <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                        สลิปชำระเงินถูกบันทึกเข้าระบบเรียบร้อยแล้ว อาจารย์ผู้ดูแลจะดำเนินการตรวจสอบสถานะ และคุณสามารถใช้เมนูตรวจสอบประวัติเพื่อเช็คผล
                      </p>
                      <button 
                        onClick={() => setUploadSuccess(false)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition mt-4 cursor-pointer"
                      >
                        อัปโหลดรายการอื่นเพิ่ม
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} className="space-y-5">
                      {uploadError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">รหัสประจำตัวนักศึกษา (Lookup)</label>
                          <input 
                            type="text"
                            required
                            placeholder="เช่น 6612001"
                            value={uploadForm.studentId}
                            onChange={(e) => handleStudentIdLookup(e.target.value, 'upload')}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">พิมพ์รหัสเพื่อระบบตรวจสอบชื่อ-ห้องอัตโนมัติ</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">ชื่อ-นามสกุล</label>
                          <input 
                            type="text"
                            required
                            placeholder="ป้อนชื่อผู้เข้าพัก"
                            value={uploadForm.fullName}
                            onChange={(e) => setUploadForm({ ...uploadForm, fullName: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">เลขห้องพัก</label>
                          <input 
                            type="text"
                            required
                            placeholder="เช่น 101"
                            value={uploadForm.roomNumber}
                            onChange={(e) => setUploadForm({ ...uploadForm, roomNumber: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">ค่าใช้จ่ายรอบประจำเดือน</label>
                          <input 
                            type="month"
                            required
                            value={uploadForm.month}
                            onChange={(e) => setUploadForm({ ...uploadForm, month: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">ประเภทค่าใช้จ่าย</label>
                          <select
                            value={uploadForm.expenseType}
                            onChange={(e) => setUploadForm({ ...uploadForm, expenseType: e.target.value as any })}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-hidden dark:text-white"
                          >
                            <option value="water">ค่าน้ำประปา</option>
                            <option value="electricity">ค่าไฟฟ้า</option>
                            <option value="rent">ค่าห้องพัก</option>
                            <option value="other">ค่าใช้จ่ายอื่นๆ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">จำนวนเงินชำระจริง (บาท)</label>
                          <input 
                            type="number"
                            required
                            min="1"
                            step="any"
                            placeholder="0.00"
                            value={uploadForm.amount}
                            onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">แนบรูปภาพสลิปชำระเงิน (.JPG / .PNG)</label>
                        <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-4 text-center cursor-pointer hover:border-red-500 transition relative">
                          <input 
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {uploadForm.slipUrl ? (
                            <div className="space-y-2">
                              <img src={uploadForm.slipUrl} alt="Slip preview" className="max-h-40 mx-auto rounded-lg shadow-md border" />
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓ สแกนสำเร็จและเตรียมนำเข้าข้อมูลเรียบร้อยแล้ว</p>
                            </div>
                          ) : (
                            <div className="space-y-1 py-4">
                              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto" />
                              <p className="text-sm font-bold text-gray-600 dark:text-zinc-300">ลากไฟล์สลิปมาวางที่นี่ หรือคลิกเพื่อค้นหา</p>
                              <p className="text-[10px] text-gray-400">รูปภาพชัดเจน ขนาดไม่เกิน 1.5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {uploading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'ส่งหลักฐานให้หอพักอนุมัติ'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: REPORT COMPLAINTS & REPAIRS */}
            {activeTab === 'issues' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                
                {/* Left Form Column */}
                <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-md h-fit">
                  <div className="flex items-center gap-3 border-b border-gray-100 dark:border-zinc-800 pb-3 mb-5">
                    <Wrench className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">ส่งเรื่องร้องเรียน / แจ้งซ่อมแซม</h2>
                  </div>

                  {issueSuccess ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">ส่งข้อมูลแจ้งซ่อมสำเร็จ!</h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        ฝ่ายอาคารหอพักจะรีบมอบหมายให้ช่างอาคารเข้าตรวจสอบและดำเนินการ คุณสามารถติดตามสถานะแก้ไขในตารางด้านข้างได้
                      </p>
                      <button 
                        onClick={() => setIssueSuccess(false)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition cursor-pointer"
                      >
                        ส่งเรื่องแจ้งซ่อมเพิ่มเติม
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleIssueSubmit} className="space-y-4">
                      {issueError && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-semibold">
                          {issueError}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">รหัสนักศึกษา (Lookup)</label>
                        <input 
                          type="text"
                          required
                          placeholder="พิมพ์รหัสนักศึกษาเพื่อช่วยค้นชื่อ"
                          value={issueForm.studentId}
                          onChange={(e) => handleStudentIdLookup(e.target.value, 'issue')}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">ชื่อผู้แจ้ง</label>
                        <input 
                          type="text"
                          required
                          value={issueForm.fullName}
                          onChange={(e) => setIssueForm({ ...issueForm, fullName: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">เลขห้องพักที่ชำรุด</label>
                        <input 
                          type="text"
                          required
                          placeholder="เช่น 101"
                          value={issueForm.roomNumber}
                          onChange={(e) => setIssueForm({ ...issueForm, roomNumber: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">หัวข้อปัญหาที่ชำรุด</label>
                        <input 
                          type="text"
                          required
                          placeholder="เช่น ท่อน้ำห้องน้ำรั่วซึม, หลอดไฟเสีย"
                          value={issueForm.title}
                          onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">รายละเอียดเพิ่มเติม</label>
                        <textarea 
                          required
                          rows={3}
                          placeholder="อธิบายรายละเอียดหรือลักษณะชำรุดเบื้องต้นเพื่อให้ทีมงานเตรียมเครื่องมือให้ตรงจุด"
                          value={issueForm.description}
                          onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-semibold focus:border-red-600 focus:outline-hidden dark:text-white resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={issueSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-55 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>ส่งเรื่องประสานงานช่าง</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Right Realtime Tracker Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 font-extrabold text-lg text-gray-900 dark:text-white">
                    <Wrench className="w-5 h-5 text-red-600" />
                    <h2>สถานะเรื่องแจ้งซ่อมแซมล่าสุด</h2>
                  </div>

                  {issues.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-gray-400">
                      ยังไม่มีรายการแจ้งซ่อมบำรุงเข้ามาในระบบ
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {issues.map((iss) => (
                        <div 
                          key={iss.id} 
                          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs relative flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <span className="text-xs text-gray-400 font-semibold">ห้อง {iss.roomNumber}</span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${getIssueStatusColor(iss.status)}`}>
                                {getIssueStatusLabel(iss.status)}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1.5">{iss.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">{iss.description}</p>
                          </div>
                          <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-[10px] text-gray-400">
                            <span>ผู้รายงาน: {iss.fullName}</span>
                            <span>{new Date(iss.createdAt).toLocaleDateString('th-TH')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* 🍁 Pure footer */}
      <footer className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 mt-20 py-8 text-center text-xs text-gray-400 font-medium">
        <p>© {new Date().getFullYear()} STIN-Somdej Connect. All Rights Reserved.</p>
        <p className="mt-1 text-gray-400/75">สถาบันการพยาบาลศรีสวรินทิรา สภากาชาดไทย (Boromarajonani Nursing College Platform)</p>
      </footer>
    </div>
  );
};
