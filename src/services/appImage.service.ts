import { appImageService } from "./app.service";
import { AppImage } from "../types/app";

export const DEFAULT_IMAGE_SLUGS = [
  { type: "login", label: "Login Page Image", defaultUrl: "/src/assets/images/login_medical_flat_left_1784648165379.jpg", description: "รูปภาพหน้าจอ Login หลักของระบบ" },
  { type: "welcome", label: "Welcome Section Image", defaultUrl: "/src/assets/images/cute_medical_banner_1784646645332.jpg", description: "รูปภาพแบนเนอร์ส่วน Welcome Page / Header" },
  { type: "dashboard_banner", label: "Dashboard Banner Image", defaultUrl: "/src/assets/images/cute_nurse_doctor_1784646632209.jpg", description: "รูปภาพแบนเนอร์บนหน้า Dashboard สำหรับอาจารย์และนักศึกษา" },
  { type: "medical_illustration", label: "Medical Illustration Images", defaultUrl: "/src/assets/images/student_vector_avatar.svg", description: "ภาพการ์ตูนประกอบทางการพยาบาล ตัวละครนักศึกษาและอาจารย์" },
  { type: "empty_state", label: "Empty State Images", defaultUrl: "/src/assets/images/cute_hospital_empty_1784647230778.jpg", description: "ภาพประกอบเมื่อไม่พบข้อมูล (No Data / Empty States)" }
];

export async function fetchAppImagesMap(): Promise<Record<string, string>> {
  try {
    const images = await appImageService.getAll();
    const map: Record<string, string> = {};
    images.forEach(img => {
      if (img.imageType && img.imageUrl) {
        map[img.imageType] = img.imageUrl;
      }
    });
    return map;
  } catch (err) {
    console.error("Error fetching app images:", err);
    return {};
  }
}
