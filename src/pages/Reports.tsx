import { useState, useEffect } from "react";
import { BarChart3, Download, FileText, PieChart, TrendingUp, Calendar, ArrowRight, DollarSign, CheckCircle2, Clock, AlertTriangle, Printer } from "lucide-react";
import { motion } from "motion/react";
import { studentPaymentService, weeklyBillService, roomService, studentService, teacherService, dormitoryService } from "../services/app.service";
import { StudentPayment, WeeklyBill, Room, Student, Teacher, Dormitory } from "../types/app";
import { Modal } from "../components/Modal";

export function Reports() {
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [bills, setBills] = useState<WeeklyBill[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dormitories, setDormitories] = useState<Dormitory[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pData, bData, rData, sData, tData, dData] = await Promise.all([
          studentPaymentService.getAll(),
          weeklyBillService.getAll(),
          roomService.getAll(),
          studentService.getAll(),
          teacherService.getAll(),
          dormitoryService.getAll()
        ]);
        setPayments(pData);
        setBills(bData);
        setRooms(rData);
        setStudents(sData);
        setTeachers(tData);
        setDormitories(dData);
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const reports = [
    { 
      id: "payment-report",
      title: "Payment Report", 
      description: "Comprehensive summary of all verified and pending student payments across all rooms and billing cycles.", 
      icon: CheckCircle2,
      category: "Financial",
      lastUpdated: "Real-time"
    },
    { 
      id: "outstanding-report",
      title: "Outstanding Report", 
      description: "Detailed list of unpaid and overdue invoices requiring follow-up or administrative action.", 
      icon: AlertTriangle,
      category: "Financial",
      lastUpdated: "Real-time"
    },
    { 
      id: "student-history",
      title: "Student Payment History", 
      description: "Individual transaction history and payment status tracking for every registered student.", 
      icon: FileText,
      category: "Student",
      lastUpdated: "Real-time"
    },
    { 
      id: "teacher-collection",
      title: "Teacher Collection Report", 
      description: "Summary of collection status and payment verifications supervised by faculty members.", 
      icon: TrendingUp,
      category: "Supervision",
      lastUpdated: "Real-time"
    },
    { 
      id: "accommodation-revenue",
      title: "Accommodation Revenue Report", 
      description: "Total revenue generated from room fees, water, and electricity charges grouped by building and dormitory.", 
      icon: BarChart3,
      category: "Facilities",
      lastUpdated: "Real-time"
    },
  ];

  const totalPaidAmount = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.individualAmount, 0);
  const totalOutstandingAmount = payments.filter(p => p.paymentStatus !== 'paid').reduce((sum, p) => sum + p.individualAmount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accommodation & Payment Reports</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Generate and export institutional financial reports and accommodation statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/25 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-primary-container text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-slate-50 text-[10px] font-bold text-slate-500 rounded-full border border-slate-100 uppercase tracking-widest">{report.category}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{report.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar className="h-3 w-3" />
                  {report.lastUpdated}
                </div>
                <button 
                  onClick={() => setSelectedReportType(report.id)}
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:translate-x-1 transition-transform cursor-pointer"
                >
                  Generate Report
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={Boolean(selectedReportType)}
        onClose={() => setSelectedReportType(null)}
        title={reports.find(r => r.id === selectedReportType)?.title || "Report Details"}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Generated On</p>
              <p className="text-sm font-bold text-slate-800">{new Date().toLocaleString()}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
          </div>

          {selectedReportType === 'payment-report' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Paid Revenue</span>
                <span className="text-lg font-bold text-green-600">฿{totalPaidAmount.toLocaleString()}</span>
              </div>
              <div className="border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Billing Week</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.filter(p => p.paymentStatus === 'paid').map(p => {
                      const student = students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id}>
                          <td className="p-3 font-mono font-bold">{p.invoiceNumber}</td>
                          <td className="p-3 font-medium">{student?.fullName || 'N/A'}</td>
                          <td className="p-3">{p.billingWeek}</td>
                          <td className="p-3 text-right font-bold text-primary">฿{p.individualAmount.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold">Paid</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReportType === 'outstanding-report' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Outstanding Balance</span>
                <span className="text-lg font-bold text-red-600">฿{totalOutstandingAmount.toLocaleString()}</span>
              </div>
              <div className="border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Billing Week</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.filter(p => p.paymentStatus !== 'paid').map(p => {
                      const student = students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id}>
                          <td className="p-3 font-mono font-bold">{p.invoiceNumber}</td>
                          <td className="p-3 font-medium">{student?.fullName || 'N/A'}</td>
                          <td className="p-3">{p.billingWeek}</td>
                          <td className="p-3 text-right font-bold text-red-600">฿{p.individualAmount.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase">{p.paymentStatus}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReportType === 'student-history' && (
            <div className="space-y-4">
              <div className="border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3">Student ID & Name</th>
                      <th className="p-3">Invoices Count</th>
                      <th className="p-3 text-right">Total Billed</th>
                      <th className="p-3 text-right">Total Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(s => {
                      const sPayments = payments.filter(p => p.studentId === s.id);
                      const totalBilled = sPayments.reduce((sum, p) => sum + p.individualAmount, 0);
                      const totalPaid = sPayments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.individualAmount, 0);
                      return (
                        <tr key={s.id}>
                          <td className="p-3">
                            <p className="font-bold text-slate-900">{s.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{s.studentId}</p>
                          </td>
                          <td className="p-3 font-bold">{sPayments.length}</td>
                          <td className="p-3 text-right font-bold">฿{totalBilled.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-green-600">฿{totalPaid.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReportType === 'teacher-collection' && (
            <div className="space-y-4">
              <div className="border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3">Teacher Name</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Supervision Status</th>
                      <th className="p-3 text-right">Collection Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {teachers.map(t => {
                      return (
                        <tr key={t.id}>
                          <td className="p-3 font-bold text-slate-900">{t.name}</td>
                          <td className="p-3">{t.department}</td>
                          <td className="p-3 text-center font-bold">Active</td>
                          <td className="p-3 text-right font-bold text-primary">100%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedReportType === 'accommodation-revenue' && (
            <div className="space-y-4">
              <div className="border rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b text-slate-500 sticky top-0">
                    <tr>
                      <th className="p-3">Dormitory / Building</th>
                      <th className="p-3">Room Number</th>
                      <th className="p-3 text-right">Monthly Rent</th>
                      <th className="p-3 text-right">Total Bills Issued</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rooms.map(r => {
                      const dorm = dormitories.find(d => d.id === r.dormitoryId);
                      const rBills = bills.filter(b => b.roomId === r.id);
                      const rev = rBills.reduce((sum, b) => sum + b.totalAmount, 0);
                      return (
                        <tr key={r.id}>
                          <td className="p-3 font-bold">{dorm?.dormitoryName || 'Dorm'} - {r.building}</td>
                          <td className="p-3 font-mono">Room {r.roomNumber}</td>
                          <td className="p-3 text-right font-bold">฿{r.monthlyRent || 500}</td>
                          <td className="p-3 text-right font-bold text-primary">฿{rev.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <div className="p-8 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-slate-900/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-bold tracking-tight">Need a Custom Report?</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Our administrative team can generate specialized datasets tailored to your specific auditing needs.</p>
        </div>
        <button className="relative z-10 px-8 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer">
          Request Specialized Data
        </button>
      </div>
    </div>
  );
}
