import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Chip, IconButton, 
  Snackbar, Alert, Grid, MenuItem, Tooltip, Avatar
} from '@mui/material';
import { Sidebar } from '../../components/Sidebar';
import { 
  Edit, Plus, Trash2, Calendar, BookOpen, Check, X, Tag, 
  Layers, Users, Activity, MapPin, Award, ArrowRight, HelpCircle, Eye
} from 'lucide-react';
import { mockDB } from '../../services/mockData';
import { ClinicalWardSchedule } from '../../types/db';
import { motion, AnimatePresence } from 'motion/react';

export function ClinicalWardsPage() {
  const [schedules, setSchedules] = useState<ClinicalWardSchedule[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>(['2569', '2570']);
  const [selectedAY, setSelectedAY] = useState<string>('2569');
  const [activeTab, setActiveTab] = useState<'matrix' | 'list'>('matrix');
  
  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClinicalWardSchedule | null>(null);
  
  // Form values
  const [courseName, setCourseName] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [days, setDays] = useState('');
  const [semester, setSemester] = useState('1');
  const [wardsInput, setWardsInput] = useState('');
  const [wardsList, setWardsList] = useState<string[]>([]);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Selected cell info for interactive modal
  const [selectedCellInfo, setSelectedCellInfo] = useState<{
    course: string;
    ward: string;
    month: string;
    week: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const loaded = mockDB.getClinicalWardSchedules();
    setSchedules(loaded);
  }, []);

  const handleOpenEdit = (schedule: ClinicalWardSchedule) => {
    setEditingSchedule(schedule);
    setCourseName(schedule.courseName);
    setDateRange(schedule.dateRange);
    setDays(schedule.days);
    setSemester(schedule.semester);
    setWardsList(schedule.wards);
    setWardsInput('');
    setOpenDialog(true);
  };

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setCourseName('');
    setDateRange('');
    setDays('');
    setSemester('1');
    setWardsList([]);
    setWardsInput('');
    setOpenDialog(true);
  };

  const handleAddWard = () => {
    const trimmed = wardsInput.trim();
    if (trimmed && !wardsList.includes(trimmed)) {
      setWardsList([...wardsList, trimmed]);
      setWardsInput('');
    }
  };

  const handleRemoveWard = (wardToRemove: string) => {
    setWardsList(wardsList.filter(w => w !== wardToRemove));
  };

  const handleSave = () => {
    if (!courseName.trim() || !dateRange.trim() || !days.trim() || wardsList.length === 0) {
      setSnackbar({ open: true, message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและระบุแผนกอย่างน้อย 1 แผนก', severity: 'error' });
      return;
    }

    let updatedSchedules: ClinicalWardSchedule[] = [];

    if (editingSchedule) {
      updatedSchedules = schedules.map(s => {
        if (s.id === editingSchedule.id) {
          return {
            ...s,
            courseName: courseName.trim(),
            dateRange: dateRange.trim(),
            days: days.trim(),
            semester: semester,
            wards: wardsList
          };
        }
        return s;
      });
      setSnackbar({ open: true, message: 'แก้ไขข้อมูลตารางฝึกเรียบร้อยแล้ว', severity: 'success' });
    } else {
      const newSchedule: ClinicalWardSchedule = {
        id: `cws-${Date.now()}`,
        academicYear: selectedAY,
        semester: semester,
        courseName: courseName.trim(),
        dateRange: dateRange.trim(),
        days: days.trim(),
        wards: wardsList
      };
      updatedSchedules = [...schedules, newSchedule];
      setSnackbar({ open: true, message: 'เพิ่มตารางฝึกใหม่เรียบร้อยแล้ว', severity: 'success' });
    }

    setSchedules(updatedSchedules);
    mockDB.saveClinicalWardSchedules(updatedSchedules);
    setOpenDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลตารางฝึกปฏิบัติงานนี้?')) {
      const updated = schedules.filter(s => s.id !== id);
      setSchedules(updated);
      mockDB.saveClinicalWardSchedules(updated);
      setSnackbar({ open: true, message: 'ลบข้อมูลตารางฝึกเรียบร้อยแล้ว', severity: 'success' });
    }
  };

  const filteredSchedules = schedules.filter(s => s.academicYear === selectedAY);

  // Total calculated metrics
  const totalCourses = filteredSchedules.length;
  const totalWards = Array.from(new Set(filteredSchedules.flatMap(s => s.wards))).length;
  const totalStudentsCapacity = 16 * totalWards; // Realistic dummy calculation

  // Predefined custom matrix data matching the uploaded image exactly!
  const matrixData = {
    term1: {
      months: [
        { name: 'สิงหาคม 2569', weeks: ['10-14', '19-21', '26-28'] },
        { name: 'กันยายน 2569', weeks: ['31 ส.ค.- 4 ก.ย.', '7-11', '14-18', '21-25'] },
        { name: 'ตุลาคม 2569', weeks: ['28 ก.ย.- 2 ต.ค.', '5-9', '12-16', '19-23', '26-30'] },
        { name: 'พฤศจิกายน 2569', weeks: ['2-6', '9-13', '16-20', '23-27'] },
        { name: 'ธันวาคม 2569', weeks: ['30 พ.ย.- 4 ธ.ค.', '7-11', '14-18'] }
      ],
      courses: [
        {
          id: 'c1',
          name: 'รายวิชา ปฏิบัติมารดาฯ 1',
          color: 'emerald',
          scheduleText: '11 ส.ค. - 18 ธ.ค. 2569 (อังคาร-ศุกร์)',
          wards: [
            {
              name: 'ฝากครรภ์ (ANC)',
              allocations: [16, 8, 8, 15, 16, 16, 8, 8, 8, 16, 16, 16, 0, 8, 16, 16, 16, 16]
            },
            {
              name: 'ห้องคลอด (DR)',
              allocations: [16, 16, 8, 8, 15, 16, 16, 8, 8, 8, 16, 16, 16, 0, 16, 8, 16, 16]
            }
          ]
        },
        {
          id: 'c2',
          name: 'รายวิชาปฏิบัติการพยาบาลสุขภาพจิตและจิตเวช',
          color: 'teal',
          scheduleText: '12 ต.ค. 2569 - 22 ม.ค. 2570 (จันทร์-ศุกร์)',
          wards: [
            {
              name: 'คลินิกซอซี',
              allocations: [0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 0, 0, 8, 8, 8, 0, 8, 0]
            }
          ]
        }
      ]
    },
    term2: {
      months: [
        { name: 'มกราคม 2570', weeks: ['11-15', '18-22', '25-29'] },
        { name: 'กุมภาพันธ์ 2570', weeks: ['1-5', '8-12', '15-19', '22-26'] },
        { name: 'มีนาคม 2570', weeks: ['1-5', '8-12', '15-19', '22-26', '29 มี.ค.- 2 เม.ย.'] },
        { name: 'เมษายน 2570', weeks: ['5-9', '12-16', '19-23', '26-30'] },
        { name: 'พฤษภาคม 2570', weeks: ['3-7', '10-14', '17-21', '24-28', '31 พ.ค.- 4 มิ.ย.'] }
      ],
      courses: [
        {
          id: 'c2_mental_cont',
          name: 'รายวิชาปฏิบัติการพยาบาลสุขภาพจิตและจิตเวช',
          color: 'teal',
          scheduleText: '12 ต.ค. 2569 - 22 ม.ค. 2570 (จันทร์-ศุกร์)',
          wards: [
            {
              name: 'คลินิกซอซี',
              allocations: [8, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          ]
        },
        {
          id: 'c3',
          name: 'รายวิชา ปฏิบัติมารดาฯ 2',
          color: 'amber',
          scheduleText: '13 ม.ค. - 4 มิ.ย. 2570 (พุธ-ศุกร์)',
          wards: [
            {
              name: 'ห้องคลอด (DR)',
              allocations: [15, 8, 8, 16, 16, 16, 0, 0, 16, 8, 16, 8, 16, 0, 8, 0, 0, 16, 16, 16, 16]
            }
          ]
        },
        {
          id: 'c4',
          name: 'ปฏิบัติการรักษาโรคเบื้องต้น',
          color: 'orange',
          scheduleText: '12 ม.ค. - 9 เม.ย. 2570 (อังคาร-ศุกร์)',
          wards: [
            {
              name: 'แผนกเวชปฏิบัติทั่วไป (OPD) อาคารอนุสรณ์ 100 ปี ชั้น 1',
              allocations: [8, 8, 8, 8, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
              name: 'แผนกอุบัติเหตุและฉุกเฉิน (ER)',
              allocations: [8, 8, 8, 8, 0, 8, 8, 8, 8, 8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0]
            }
          ]
        }
      ]
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Top Header */}
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                <Calendar size={24} />
              </span>
              <Typography variant="h4" className="font-extrabold tracking-tight text-slate-900 dark:text-zinc-50">
                ตารางฝึกปฏิบัติงานคลินิก (Clinical Wards & Rotations)
              </Typography>
            </div>
            <Typography variant="body2" className="text-slate-500 dark:text-zinc-400">
              จัดการและตรวจสอบรายละเอียดแผนกฝึกปฏิบัติงานของนักศึกษาพยาบาล (ANC, DR, คลินิกซอซี, OPD, ER) และสัดส่วนกำลังพลรายสัปดาห์
            </Typography>
          </div>

          <Button 
            variant="contained" 
            startIcon={<Plus size={16} />} 
            onClick={handleOpenCreate}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md py-2.5 px-5 normal-case text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            เพิ่มวิชาฝึกคลินิกใหม่
          </Button>
        </Box>

        {/* Dashboard Quick Stats Card */}
        <Grid container spacing={3} className="mb-8">
          <Grid item xs={12} sm={6} md={3}>
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <BookOpen size={20} />
              </div>
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block">รายวิชาฝึกปฏิบัติ</Typography>
                <Typography variant="h5" className="font-extrabold text-slate-950 dark:text-zinc-50">{totalCourses} วิชา</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
                <MapPin size={20} />
              </div>
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block">แหล่งฝึก (Active Wards)</Typography>
                <Typography variant="h5" className="font-extrabold text-slate-950 dark:text-zinc-50">{totalWards} แหล่งฝึก</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block">อัตราจัดสรรเฉลี่ย</Typography>
                <Typography variant="h5" className="font-extrabold text-slate-950 dark:text-zinc-50">8 - 16 คน/สัปดาห์</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <Award size={20} />
              </div>
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block">ปีการศึกษาที่เลือก</Typography>
                <Typography variant="h5" className="font-extrabold text-slate-950 dark:text-zinc-50">ปีการศึกษา {selectedAY}</Typography>
              </div>
            </div>
          </Grid>
        </Grid>

        {/* Dynamic Navigation Mode Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-zinc-800 mb-6 pb-2 gap-4">
          <div className="flex bg-slate-100/80 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'matrix' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              📊 ตารางสรุปการปฏิบัติงาน (Calendar Matrix View)
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'list' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
            >
              ⚙️ จัดการข้อมูลวิชา (Course Config List)
            </button>
          </div>

          {/* Academic Year Selection Dropdown */}
          <Box className="flex items-center gap-2">
            <Typography variant="body2" className="text-xs font-bold text-slate-500 dark:text-zinc-400">
              ปีการศึกษา:
            </Typography>
            <TextField
              select
              size="small"
              value={selectedAY}
              onChange={(e) => setSelectedAY(e.target.value)}
              className="bg-white dark:bg-zinc-900"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', height: '36px', fontSize: '12px' } }}
            >
              {academicYears.map(year => (
                <MenuItem key={year} value={year}>
                  ปีการศึกษา {year}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </div>

        {/* Tabs Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'matrix' ? (
            <motion.div
              key="matrix-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Semester 1 Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/60 shadow-xs p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-zinc-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <Typography className="text-sm font-black text-slate-900 dark:text-zinc-50">
                      ภาคการศึกษาต้น (Semester 1 / 2569)
                    </Typography>
                  </div>
                  <Chip label="อิงตามแผนความต้องการกำลังพล" size="small" className="text-[10px] font-bold bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400" />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800">
                        <th className="p-3 font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] border-r border-slate-100 dark:border-zinc-800" rowSpan={2} style={{ minWidth: '180px' }}>รายวิชา / แหล่งฝึก</th>
                        {matrixData.term1.months.map((m, idx) => (
                          <th key={idx} className="p-2 font-black text-center text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-zinc-800 bg-slate-100/40 dark:bg-zinc-800/30" colSpan={m.weeks.length}>
                            {m.name}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/30 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
                        {matrixData.term1.months.flatMap(m => m.weeks).map((w, idx) => (
                          <th key={idx} className="p-2 text-center text-[10px] font-medium text-slate-400 dark:text-zinc-400 border-r border-slate-100 dark:border-zinc-800" style={{ minWidth: '55px' }}>
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.term1.courses.flatMap((course) => 
                        course.wards.map((ward, wardIdx) => {
                          const totalWeeksCount = matrixData.term1.months.reduce((acc, m) => acc + m.weeks.length, 0);
                          return (
                            <tr key={`${course.id}-${ward.name}`} className="border-b border-slate-50 dark:border-zinc-800/30 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-all">
                              {wardIdx === 0 ? (
                                <td className="p-3 font-bold border-r border-slate-100 dark:border-zinc-800 align-middle" rowSpan={course.wards.length} style={{ backgroundColor: 'rgba(248, 250, 252, 0.4)' }}>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-slate-900 dark:text-zinc-50 leading-tight block">{course.name}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{course.scheduleText}</span>
                                  </div>
                                </td>
                              ) : null}
                              
                              {/* Ward Name nested within course */}
                              <td className="p-2 font-medium text-slate-600 dark:text-zinc-300 border-r border-slate-100 dark:border-zinc-800 bg-slate-50/10" style={{ position: 'sticky', left: 0 }}>
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${course.color === 'emerald' ? 'bg-emerald-500' : 'bg-teal-500'}`}></span>
                                  <span>{ward.name}</span>
                                </div>
                              </td>

                              {/* Student Allocation capacity per cell */}
                              {Array.from({ length: totalWeeksCount }).map((_, weekIdx) => {
                                const allocation = ward.allocations[weekIdx] || 0;
                                return (
                                  <td 
                                    key={weekIdx} 
                                    onClick={() => {
                                      if (allocation > 0) {
                                        setSelectedCellInfo({
                                          course: course.name,
                                          ward: ward.name,
                                          month: 'ภาคการศึกษาต้น',
                                          week: `สัปดาห์ที่ ${weekIdx + 1}`,
                                          count: allocation
                                        });
                                      }
                                    }}
                                    className={`p-2 text-center border-r border-slate-100 dark:border-zinc-800 cursor-pointer transition-all ${allocation > 0 ? 'hover:scale-105 hover:shadow-xs' : ''}`}
                                  >
                                    {allocation > 0 ? (
                                      <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                        allocation >= 15 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                                      }`}>
                                        {allocation}
                                      </span>
                                    ) : (
                                      <span className="text-slate-200 dark:text-zinc-800">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Semester 2 Section */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/60 shadow-xs p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-zinc-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <Typography className="text-sm font-black text-slate-900 dark:text-zinc-50">
                      ภาคการศึกษาปลาย (Semester 2 / 2570)
                    </Typography>
                  </div>
                  <Chip label="อิงตามแผนความต้องการกำลังพล" size="small" className="text-[10px] font-bold bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400" />
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50/70 dark:bg-zinc-900/80 border-b border-slate-100 dark:border-zinc-800">
                        <th className="p-3 font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[11px] border-r border-slate-100 dark:border-zinc-800" rowSpan={2} style={{ minWidth: '180px' }}>รายวิชา / แหล่งฝึก</th>
                        {matrixData.term2.months.map((m, idx) => (
                          <th key={idx} className="p-2 font-black text-center text-slate-700 dark:text-zinc-300 border-r border-slate-100 dark:border-zinc-800 bg-slate-100/40 dark:bg-zinc-800/30" colSpan={m.weeks.length}>
                            {m.name}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-slate-50/30 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
                        {matrixData.term2.months.flatMap(m => m.weeks).map((w, idx) => (
                          <th key={idx} className="p-2 text-center text-[10px] font-medium text-slate-400 dark:text-zinc-400 border-r border-slate-100 dark:border-zinc-800" style={{ minWidth: '55px' }}>
                            {w}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrixData.term2.courses.flatMap((course) => 
                        course.wards.map((ward, wardIdx) => {
                          const totalWeeksCount = matrixData.term2.months.reduce((acc, m) => acc + m.weeks.length, 0);
                          return (
                            <tr key={`${course.id}-${ward.name}`} className="border-b border-slate-50 dark:border-zinc-800/30 hover:bg-slate-50/40 dark:hover:bg-zinc-800/20 transition-all">
                              {wardIdx === 0 ? (
                                <td className="p-3 font-bold border-r border-slate-100 dark:border-zinc-800 align-middle" rowSpan={course.wards.length} style={{ backgroundColor: 'rgba(248, 250, 252, 0.4)' }}>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-slate-900 dark:text-zinc-50 leading-tight block">{course.name}</span>
                                    <span className="text-[10px] text-slate-400 font-normal">{course.scheduleText}</span>
                                  </div>
                                </td>
                              ) : null}
                              
                              {/* Ward Name nested within course */}
                              <td className="p-2 font-medium text-slate-600 dark:text-zinc-300 border-r border-slate-100 dark:border-zinc-800 bg-slate-50/10" style={{ position: 'sticky', left: 0 }}>
                                <div className="flex items-center gap-1">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    course.color === 'teal' ? 'bg-teal-500' :
                                    course.color === 'amber' ? 'bg-amber-500' : 'bg-orange-500'
                                  }`}></span>
                                  <span>{ward.name}</span>
                                </div>
                              </td>

                              {/* Student Allocation capacity per cell */}
                              {Array.from({ length: totalWeeksCount }).map((_, weekIdx) => {
                                const allocation = ward.allocations[weekIdx] || 0;
                                return (
                                  <td 
                                    key={weekIdx} 
                                    onClick={() => {
                                      if (allocation > 0) {
                                        setSelectedCellInfo({
                                          course: course.name,
                                          ward: ward.name,
                                          month: 'ภาคการศึกษาปลาย',
                                          week: `สัปดาห์ที่ ${weekIdx + 1}`,
                                          count: allocation
                                        });
                                      }
                                    }}
                                    className={`p-2 text-center border-r border-slate-100 dark:border-zinc-800 cursor-pointer transition-all ${allocation > 0 ? 'hover:scale-105 hover:shadow-xs' : ''}`}
                                  >
                                    {allocation > 0 ? (
                                      <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                                        course.color === 'amber' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                        course.color === 'orange' ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                                        'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                                      }`}>
                                        {allocation}
                                      </span>
                                    ) : (
                                      <span className="text-slate-200 dark:text-zinc-800">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Rotation Table List for Management Console */}
              <TableContainer component={Paper} className="rounded-3xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
                <Table>
                  <TableHead className="bg-slate-50/50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableCell className="font-black text-slate-500 dark:text-zinc-400 text-xs uppercase" sx={{ width: '15%' }}>ภาคการศึกษา</TableCell>
                      <TableCell className="font-black text-slate-500 dark:text-zinc-400 text-xs uppercase" sx={{ width: '30%' }}>วิชาและระยะเวลาฝึกปฏิบัติ</TableCell>
                      <TableCell className="font-black text-slate-500 dark:text-zinc-400 text-xs uppercase" sx={{ width: '35%' }}>แผนก / หอผู้ป่วย (Training Wards)</TableCell>
                      <TableCell className="font-black text-slate-500 dark:text-zinc-400 text-xs uppercase" sx={{ width: '10%' }}>วันฝึกปฏิบัติ</TableCell>
                      <TableCell className="font-black text-slate-500 dark:text-zinc-400 text-xs uppercase" sx={{ width: '10%' }} align="right">การจัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSchedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" className="py-12">
                          <Typography className="text-slate-400 dark:text-zinc-500 text-sm font-medium">
                            ไม่พบข้อมูลวิชาฝึกปฏิบัติงานในปีการศึกษา {selectedAY}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSchedules.map((schedule) => (
                        <TableRow key={schedule.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-900/30 transition-all">
                          
                          {/* Semester */}
                          <TableCell>
                            <Chip 
                              label={schedule.semester === '1' ? 'ภาคการศึกษาต้น' : 'ภาคการศึกษาปลาย'} 
                              size="small" 
                              className={`text-[11px] font-bold ${schedule.semester === '1' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}
                            />
                          </TableCell>
                          
                          {/* Course Name & Range */}
                          <TableCell>
                            <Box className="flex flex-col gap-0.5">
                              <Typography className="font-bold text-slate-950 dark:text-zinc-50 text-xs leading-relaxed flex items-center gap-1.5">
                                <BookOpen size={13} className="text-slate-400" />
                                {schedule.courseName}
                              </Typography>
                              <Typography className="text-[11px] text-slate-400 dark:text-zinc-400 flex items-center gap-1">
                                <Calendar size={12} className="text-slate-400" />
                                {schedule.dateRange}
                              </Typography>
                            </Box>
                          </TableCell>
                          
                          {/* Wards Tag cloud */}
                          <TableCell>
                            <Box className="flex flex-wrap gap-1">
                              {schedule.wards.map((ward, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={ward} 
                                  size="small" 
                                  variant="outlined" 
                                  className="text-[11px] font-bold border-gray-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 bg-slate-50/50 dark:bg-zinc-900"
                                />
                              ))}
                            </Box>
                          </TableCell>
                          
                          {/* Active Days */}
                          <TableCell>
                            <Typography className="font-bold text-slate-600 dark:text-zinc-300 text-xs">
                              {schedule.days}
                            </Typography>
                          </TableCell>
                          
                          {/* Actions */}
                          <TableCell align="right">
                            <Box display="flex" justifyContent="flex-end" gap={0.5}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleOpenEdit(schedule)}
                                className="text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              >
                                <Edit size={14} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDelete(schedule.id)}
                                className="text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-zinc-800"
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Cell Info Drawer / Modal */}
        <Dialog
          open={!!selectedCellInfo}
          onClose={() => setSelectedCellInfo(null)}
          PaperProps={{ className: "rounded-3xl border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900 p-2" }}
        >
          {selectedCellInfo && (
            <>
              <DialogTitle className="font-black text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                <Activity size={20} className="text-red-600 animate-pulse" />
                รายละเอียดการจัดกำลังนักศึกษา
              </DialogTitle>
              <DialogContent className="space-y-3">
                <Box className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">รายวิชาฝึก</span>
                    <Chip label={selectedCellInfo.month} size="small" className="text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/20" />
                  </div>
                  <Typography className="font-extrabold text-slate-900 dark:text-zinc-50 text-sm mb-1">
                    {selectedCellInfo.course}
                  </Typography>
                  <Typography className="text-xs text-slate-500">
                    แผนกฝึกปฏิบัติ: <span className="font-bold text-red-600 dark:text-red-400">{selectedCellInfo.ward}</span>
                  </Typography>
                </Box>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl">
                    <Typography className="text-[10px] text-slate-400 block">ช่วงระยะเวลา</Typography>
                    <Typography className="font-bold text-xs text-slate-700 dark:text-zinc-300 mt-1">{selectedCellInfo.week}</Typography>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-xl flex flex-col justify-center">
                    <Typography className="text-[10px] text-slate-400 block">จำนวนนักศึกษาฝึก</Typography>
                    <Typography className="font-black text-sm text-emerald-600 dark:text-emerald-400 mt-1">{selectedCellInfo.count} คน</Typography>
                  </div>
                </div>

                <Typography variant="caption" className="text-slate-400 leading-normal block pt-2 text-center">
                  * ข้อมูลดังกล่าวอิงตามแผนความต้องการฝึกปฏิบัติงานวิชาชีพพยาบาล สภากาชาดไทย
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedCellInfo(null)} className="font-bold text-xs text-slate-500">
                  ปิดหน้าต่าง
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Dialog for Creating & Editing */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: "rounded-3xl border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900 p-2" }}
        >
          <DialogTitle className="font-black text-lg text-slate-900 dark:text-zinc-50 flex items-center gap-2 border-b border-slate-50 dark:border-zinc-800/50 pb-3">
            {editingSchedule ? <Edit size={20} className="text-red-600" /> : <Plus size={20} className="text-red-600" />}
            {editingSchedule ? 'แก้ไขตารางรายวิชาฝึกคลินิก' : 'เพิ่มตารางรายวิชาฝึกคลินิกใหม่'}
          </DialogTitle>
          <DialogContent className="space-y-4 pt-6">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="ภาคการศึกษา (Semester Term)"
                  fullWidth
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-2"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="1">ภาคการศึกษาต้น (Semester 1)</MenuItem>
                  <MenuItem value="2">ภาคการศึกษาปลาย (Semester 2)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ปีการศึกษา (Academic Year)"
                  fullWidth
                  disabled
                  value={selectedAY}
                  className="mt-2"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            <TextField
              label="ชื่อรายวิชาฝึกปฏิบัติงาน"
              fullWidth
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="เช่น รายวิชา ปฏิบัติมารดาฯ 1"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="วันที่ฝึกปฏิบัติงาน (Date Period)"
                  fullWidth
                  required
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="เช่น 11 ส.ค. - 18 ธ.ค. 2569"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="วันฝึกปฏิบัติงานประจำสัปดาห์"
                  fullWidth
                  required
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="เช่น อังคาร-ศุกร์"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            {/* Wards/Placements input */}
            <Box className="space-y-2">
              <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-wider block">
                แผนก / หอผู้ป่วยฝึกปฏิบัติงาน (Training Wards & Placements)
              </Typography>
              
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="ชื่อแผนก/วอร์ด"
                  value={wardsInput}
                  onChange={(e) => setWardsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWard())}
                  placeholder="เช่น ฝากครรภ์ (ANC)"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
                <Button 
                  onClick={handleAddWard} 
                  variant="outlined" 
                  className="border-red-600 hover:border-red-700 text-red-600 dark:border-red-500 dark:text-red-400 font-bold rounded-xl px-5"
                >
                  เพิ่มแผนก
                </Button>
              </Box>

              {/* Display Wards List */}
              <Box display="flex" flexWrap="wrap" gap={1} pt={1} className="min-h-[60px] p-2 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                {wardsList.length === 0 ? (
                  <Typography variant="caption" className="text-gray-400 block m-auto">
                    ยังไม่มีแผนกฝึกถูกเพิ่มเข้ามา พิมพ์ชื่อและกดเพิ่มแผนกด้านบน
                  </Typography>
                ) : (
                  wardsList.map((ward, index) => (
                    <Chip
                      key={index}
                      label={ward}
                      onDelete={() => handleRemoveWard(ward)}
                      className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs"
                    />
                  ))
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions className="p-4 border-t border-slate-50 dark:border-zinc-800/40 mt-4">
            <Button 
              onClick={() => setOpenDialog(false)} 
              startIcon={<X size={14} />}
              className="text-slate-500 dark:text-zinc-400 font-bold uppercase text-xs"
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              startIcon={<Check size={14} />}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs py-2 px-4 normal-case text-xs font-bold"
            >
              บันทึกข้อมูล
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success / Error snackbar */}
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </main>
    </div>
  );
}
