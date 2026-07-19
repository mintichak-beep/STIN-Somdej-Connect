import { FirestoreService } from "./firestore.service";
import { Student, Teacher, Hospital, Room, Van, Allocation, Dormitory, WeeklyBill, PaymentSlip, Notification } from "../types/app";

export const studentService = new FirestoreService<Student>("students");
export const teacherService = new FirestoreService<Teacher>("teachers");
export const hospitalService = new FirestoreService<Hospital>("hospitals");
export const dormitoryService = new FirestoreService<Dormitory>("dormitories");
export const roomService = new FirestoreService<Room>("rooms");
export const vanService = new FirestoreService<Van>("vans");
export const allocationService = new FirestoreService<Allocation>("allocations");
export const weeklyBillService = new FirestoreService<WeeklyBill>("weeklyBills");
export const paymentSlipService = new FirestoreService<PaymentSlip>("paymentSlips");
export const notificationService = new FirestoreService<Notification>("notifications");
