import React, { useState, useEffect } from "react";
import { Heart, Stethoscope, Pill, Activity, ClipboardList, Shield, Sparkles } from "lucide-react";
import { appImageService } from "../services/app.service";

// Image default constants
export const CUTE_MEDICAL_IMAGES = {
  nurseDoctor: "/src/assets/images/cute_nurse_doctor_1784646632209.jpg",
  hospitalBanner: "/src/assets/images/cute_medical_banner_1784646645332.jpg",
  emptyClipboard: "/src/assets/images/cute_hospital_empty_1784647230778.jpg",
  nursingStudent: "/src/assets/images/student_vector_avatar.svg",
  cuteClipboard3d: "/src/assets/images/cute_hospital_empty_1784647230778.jpg",
  loginNurseHospital: "/src/assets/images/login_medical_flat_left_1784648165379.jpg"
};

// Custom hook to get dynamic images from appImages Firestore collection
export function useDynamicImage(imageType: string, defaultSrc: string): string {
  const [src, setSrc] = useState<string>(defaultSrc);

  useEffect(() => {
    let isMounted = true;
    appImageService.getAll().then((images) => {
      if (!isMounted) return;
      const found = images.find(img => img.imageType === imageType && img.imageUrl);
      if (found && found.imageUrl) {
        setSrc(found.imageUrl);
      } else {
        setSrc(defaultSrc);
      }
    }).catch((err) => {
      console.error("Error loading custom app image:", err);
    });
    return () => { isMounted = false; };
  }, [imageType, defaultSrc]);

  return src;
}

// 1. Cute Medical Pill/Badge Component
export interface CuteMedicalBadgeProps {
  icon?: "heart" | "stethoscope" | "pill" | "activity" | "sparkles";
  text: string;
  variant?: "rose" | "teal" | "blue" | "amber" | "indigo";
  className?: string;
}

export function CuteMedicalBadge({ icon = "heart", text, variant = "rose", className = "" }: CuteMedicalBadgeProps) {
  const colorStyles = {
    rose: "bg-rose-50 text-rose-600 border-rose-200/80 shadow-rose-100",
    teal: "bg-teal-50 text-teal-600 border-teal-200/80 shadow-teal-100",
    blue: "bg-sky-50 text-sky-600 border-sky-200/80 shadow-sky-100",
    amber: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200/80 shadow-indigo-100",
  };

  const icons = {
    heart: <Heart className="h-3.5 w-3.5 fill-current animate-pulse shrink-0" />,
    stethoscope: <Stethoscope className="h-3.5 w-3.5 shrink-0" />,
    pill: <Pill className="h-3.5 w-3.5 shrink-0" />,
    activity: <Activity className="h-3.5 w-3.5 shrink-0" />,
    sparkles: <Sparkles className="h-3.5 w-3.5 shrink-0" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border shadow-xs transition-all hover:scale-105 ${colorStyles[variant]} ${className}`}
    >
      {icons[icon]}
      <span>{text}</span>
    </span>
  );
}

// 2. Cute Nurse & Doctor Character Feature Box
export interface CuteCharacterBoxProps {
  size?: "sm" | "md" | "lg";
  role?: "doctor" | "student" | "clipboard" | "login" | "welcome" | "dashboard_banner";
  caption?: string;
  className?: string;
}

export function CuteCharacterBox({ size = "md", role = "doctor", caption, className = "" }: CuteCharacterBoxProps) {
  const dimensions = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-52 h-52 sm:w-64 sm:h-64",
  };

  const defaultImageSrc = role === "student" 
    ? CUTE_MEDICAL_IMAGES.nursingStudent 
    : role === "clipboard" 
      ? CUTE_MEDICAL_IMAGES.cuteClipboard3d 
      : role === "login"
        ? CUTE_MEDICAL_IMAGES.loginNurseHospital
        : role === "welcome"
          ? CUTE_MEDICAL_IMAGES.hospitalBanner
          : CUTE_MEDICAL_IMAGES.nurseDoctor;

  const imageTypeKey = role === "login"
    ? "login"
    : role === "welcome"
      ? "welcome"
      : role === "dashboard_banner"
        ? "dashboard_banner"
        : "medical_illustration";

  const imageSrc = useDynamicImage(imageTypeKey, defaultImageSrc);

  return (
    <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
      {/* Soft pastel background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-100 via-sky-100 to-teal-100 rounded-3xl blur-md opacity-70 animate-pulse"></div>
      
      {/* Cute Character Image Frame */}
      <div className={`relative ${dimensions[size]} rounded-3xl p-2 bg-white/90 backdrop-blur-md shadow-xl border-2 border-rose-100 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-300`}>
        <img
          src={imageSrc}
          alt="Cute Medical Illustration"
          className="w-full h-full object-cover rounded-2xl"
          referrerPolicy="no-referrer"
        />
        {/* Floating Heart Decor */}
        <div className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full shadow-md animate-bounce">
          <Heart className="h-3 w-3 fill-white" />
        </div>
      </div>
      {caption && (
        <p className="relative z-10 text-[10px] font-black text-rose-100 bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full mt-2 tracking-wide">
          {caption}
        </p>
      )}
    </div>
  );
}

// 2b. Cute Wide Image Banner for Login/Welcome
export function CuteImageBanner({ imageType = "login", className = "" }: { imageType?: string; className?: string }) {
  const defaultSrc = imageType === "login"
    ? CUTE_MEDICAL_IMAGES.loginNurseHospital
    : CUTE_MEDICAL_IMAGES.hospitalBanner;

  const imageSrc = useDynamicImage(imageType, defaultSrc);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-white/90 backdrop-blur-md transition-all hover:shadow-3xl ${className}`}>
      <img
        src={imageSrc}
        alt="Medical Flatlay Illustration"
        className="w-full h-48 sm:h-56 object-cover object-left rounded-2xl"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-sm flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
        <Sparkles className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-spin" />
        <span>STIN Medical Care</span>
      </div>
    </div>
  );
}

// 3. Cute Empty State Card Component
export interface CuteEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function CuteEmptyState({
  title = "ไม่มีข้อมูลในขณะนี้ (No Data Found)",
  description = "ยังไม่มีข้อมูลในระบบ หรือคุณยังไม่ได้ทำการลงทะเบียนข้อมูลในส่วนนี้",
  actionText,
  onAction,
  icon,
  className = "",
}: CuteEmptyStateProps) {
  const dynamicEmptyImage = useDynamicImage("empty_state", CUTE_MEDICAL_IMAGES.cuteClipboard3d);

  return (
    <div className={`p-8 sm:p-12 text-center bg-gradient-to-b from-slate-50/80 via-rose-50/30 to-sky-50/20 rounded-3xl border border-rose-100/60 shadow-sm space-y-4 flex flex-col items-center justify-center ${className}`}>
      {/* Cute Clipboard Illustration Thumbnail */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-sky-200 rounded-2xl blur-xs opacity-70 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative h-24 w-24 rounded-2xl bg-white p-2 shadow-md border border-rose-100 flex items-center justify-center overflow-hidden">
          {icon ? (
            icon
          ) : (
            <img
              src={dynamicEmptyImage}
              alt="No Data"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
        <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-sm">
          <Heart className="h-3.5 w-3.5 fill-white" />
        </div>
      </div>

      <div className="max-w-md space-y-1.5">
        <h4 className="text-base font-black text-slate-800 tracking-tight">{title}</h4>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {actionText}
        </button>
      )}
    </div>
  );
}

// 4. Cute Medical Loading Card
export function CuteMedicalLoadingCard({ text = "กำลังโหลดข้อมูลระบบพยาบาล..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 shadow-xl space-y-4 max-w-sm mx-auto">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 h-16 w-16 rounded-full bg-rose-400/20 animate-ping"></div>
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
          <Heart className="h-7 w-7 fill-white animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 bg-sky-400 p-1 rounded-full text-white shadow-sm">
          <Stethoscope className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-black text-slate-800">{text}</p>
        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center justify-center gap-1">
          <Activity className="h-3 w-3 animate-spin" /> STIN Nursing Connect
        </p>
      </div>
    </div>
  );
}

