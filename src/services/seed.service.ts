import { doc, setDoc, getDocs, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export async function seedDatabaseIfEmpty() {
  try {
    // Check if students collection is empty
    const studentsSnapshot = await getDocs(collection(db, "students"));
    if (!studentsSnapshot.empty) {
      console.log("Firestore already contains data. Skipping auto-seeding.");
      return;
    }

    console.log("Firestore is empty. Beginning database seeding...");

    // 1. Seed Dormitory
    const dormRef = doc(db, "dormitories", "dorm-1");
    await setDoc(dormRef, {
      dormitoryName: "หอพักหญิง 1 (เรือนรักกัลยา)",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // 2. Seed Students
    const students = [
      {
        id: "dev-student-id",
        studentId: "6612001",
        firstName: "มินทรา",
        lastName: "รักษ์ดี",
        fullName: "มินทรา รักษ์ดี",
        yearLevel: "2",
        classGroup: "กลุ่ม A",
        phone: "081-234-5678",
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "stud-2",
        studentId: "6612002",
        firstName: "ณิชา",
        lastName: "แก้วมณี",
        fullName: "ณิชา แก้วมณี",
        yearLevel: "2",
        classGroup: "กลุ่ม A",
        phone: "082-345-6789",
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "stud-3",
        studentId: "6612003",
        firstName: "สิริมา",
        lastName: "ใจใส",
        fullName: "สิริมา ใจใส",
        yearLevel: "2",
        classGroup: "กลุ่ม B",
        phone: "083-456-7890",
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const student of students) {
      await setDoc(doc(db, "students", student.id), student);
    }

    // 3. Seed Rooms
    const rooms = [
      {
        id: "room-1",
        dormitoryId: "dorm-1",
        building: "ตึก A",
        floor: "1",
        roomNumber: "101",
        capacity: 4,
        currentOccupancy: 2,
        studentId: "dev-student-id",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "room-2",
        dormitoryId: "dorm-1",
        building: "ตึก A",
        floor: "1",
        roomNumber: "102",
        capacity: 4,
        currentOccupancy: 1,
        studentId: "stud-3",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const room of rooms) {
      await setDoc(doc(db, "rooms", room.id), room);
    }

    // 4. Seed Teachers
    const teachers = [
      {
        id: "teacher-1",
        name: "อาจารย์ ดร.มณีรัตน์ แสนดี",
        department: "วิชาการพยาบาลครอบครัวและผดุงครรภ์",
        phone: "089-111-2222",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "teacher-2",
        name: "อาจารย์ ปิยะนันท์ รุ่งเรือง",
        department: "วิชาการพยาบาลเด็กและวัยรุ่น",
        phone: "089-333-4444",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const teacher of teachers) {
      await setDoc(doc(db, "teachers", teacher.id), teacher);
    }

    // 5. Seed Hospitals
    const hospitals = [
      {
        id: "hosp-1",
        name: "โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา",
        quota: 20,
        address: "291 ถนนเจิมจอมพล อำเภอศรีราชา จังหวัดชลบุรี 20110",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "hosp-2",
        name: "โรงพยาบาลพุทธชินราช พิษณุโลก",
        quota: 10,
        address: "90 ถนนศรีธรรมไตรปิฎก อำเภอเมือง จังหวัดพิษณุโลก 65000",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const hospital of hospitals) {
      await setDoc(doc(db, "hospitals", hospital.id), hospital);
    }

    // 6. Seed Vans
    const vans = [
      {
        id: "van-1",
        plateNumber: "30-1234 ชลบุรี",
        seats: 12,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "van-2",
        plateNumber: "30-5678 ชลบุรี",
        seats: 12,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const van of vans) {
      await setDoc(doc(db, "vans", van.id), van);
    }

    // 7. Seed Allocations
    const allocations = [
      {
        id: "alloc-1",
        studentId: "dev-student-id",
        hospitalId: "hosp-1",
        teacherId: "teacher-1",
        roomId: "room-1",
        vanId: "van-1",
        startDate: Timestamp.fromDate(new Date("2026-07-01")),
        endDate: Timestamp.fromDate(new Date("2026-07-31")),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "alloc-2",
        studentId: "stud-2",
        hospitalId: "hosp-1",
        teacherId: "teacher-1",
        roomId: "room-1",
        vanId: "van-1",
        startDate: Timestamp.fromDate(new Date("2026-07-01")),
        endDate: Timestamp.fromDate(new Date("2026-07-31")),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "alloc-3",
        studentId: "stud-3",
        hospitalId: "hosp-2",
        teacherId: "teacher-2",
        roomId: "room-2",
        vanId: "van-2",
        startDate: Timestamp.fromDate(new Date("2026-07-01")),
        endDate: Timestamp.fromDate(new Date("2026-07-31")),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const allocation of allocations) {
      await setDoc(doc(db, "allocations", allocation.id), allocation);
    }

    // 8. Seed WeeklyBills
    const bills = [
      {
        id: "bill-1",
        roomId: "room-1",
        studentId: "dev-student-id",
        billingWeek: "2026-W29",
        startDate: Timestamp.fromDate(new Date("2026-07-13")),
        endDate: Timestamp.fromDate(new Date("2026-07-19")),
        waterUsage: 5,
        electricityUsage: 25,
        waterCharge: 100,
        electricityCharge: 250,
        otherCharges: 0,
        totalAmount: 350,
        dueDate: Timestamp.fromDate(new Date("2026-07-26")),
        paymentStatus: "pending",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: "bill-2",
        roomId: "room-1",
        studentId: "dev-student-id",
        billingWeek: "2026-W28",
        startDate: Timestamp.fromDate(new Date("2026-07-06")),
        endDate: Timestamp.fromDate(new Date("2026-07-12")),
        waterUsage: 6,
        electricityUsage: 30,
        waterCharge: 120,
        electricityCharge: 300,
        otherCharges: 0,
        totalAmount: 420,
        dueDate: Timestamp.fromDate(new Date("2026-07-19")),
        paymentStatus: "paid",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const bill of bills) {
      await setDoc(doc(db, "weeklyBills", bill.id), bill);
    }

    // 9. Seed PaymentSlip
    const slips = [
      {
        id: "slip-2",
        billId: "bill-2",
        fileUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=300",
        uploadedAt: Timestamp.fromDate(new Date("2026-07-12")),
        verificationStatus: "approved",
        verifiedAt: Timestamp.fromDate(new Date("2026-07-13")),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    for (const slip of slips) {
      await setDoc(doc(db, "paymentSlips", slip.id), slip);
    }

    // 10. Seed Notifications
    const notifications = [
      {
        id: "noti-1",
        userId: "dev-student-id",
        title: "ใบแจ้งหนี้สัปดาห์ใหม่ 2026-W29",
        message: "ระบบได้ออกใบแจ้งหนี้ค่าน้ำ-ค่าไฟประจำสัปดาห์ 2026-W29 ยอดรวม 350 บาท เรียบร้อยแล้ว",
        type: "bill",
        isRead: false,
        createdAt: Timestamp.now()
      },
      {
        id: "noti-2",
        userId: "dev-student-id",
        title: "อนุมัติการชำระเงินสัปดาห์ 2026-W28",
        message: "การชำระเงินค่าสาธารณูปโภคสัปดาห์ 2026-W28 ได้รับการตรวจสอบและอนุมัติแล้ว",
        type: "approval",
        isRead: true,
        createdAt: Timestamp.now()
      }
    ];

    for (const noti of notifications) {
      await setDoc(doc(db, "notifications", noti.id), noti);
    }

    console.log("Database successfully seeded!");
  } catch (error) {
    console.error("Error seeding Firestore database:", error);
  }
}
