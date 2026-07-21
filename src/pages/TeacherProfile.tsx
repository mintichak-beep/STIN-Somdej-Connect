import { useState } from "react";
import { User, Phone, BookOpen, Camera, X, Shield, Mail, Calendar } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { motion } from "motion/react";
import { resizeImage } from "../lib/imageUtils";
import { AssetImage } from "../components/AssetImage";

export function TeacherProfile() {
  const { user, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUpdating(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          // Resize and compress to stay under Firestore limits
          const photoURL = await resizeImage(base64, 400, 0.7);
          await updateProfile({ photoURL });
        } catch (err) {
          console.error("Image processing error:", err);
          alert("Failed to process image. Please try another one.");
        } finally {
          setIsUpdating(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    if (user) {
      setIsUpdating(true);
      await updateProfile({ photoURL: "" });
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage your professional identity and account security.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary via-primary/80 to-primary-container relative">
          <div className="absolute -bottom-16 left-10">
            <div className="relative group">
              <div className="h-40 w-40 rounded-full border-8 border-white bg-slate-50 shadow-2xl overflow-hidden flex items-center justify-center">
                {user.photoURL ? (
                  <AssetImage src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" fallbackType="teacher" />
                ) : (
                  <User className="h-16 w-16 text-slate-300" />
                )}
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full shadow-xl cursor-pointer hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group-hover:ring-4 ring-primary/20">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
              {user.photoURL && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-medical-red text-white rounded-full shadow-lg hover:bg-medical-red/90 transition-all hover:scale-110"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-24 pb-12 px-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.displayName}</h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                  {user.role}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              </div>
            </div>
            <button className="md-button-filled px-8 py-3.5 flex items-center gap-3">
              <Shield className="h-5 w-5" />
              Security Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ProfileStatCard 
              label="Account Created" 
              value={new Date(user.createdAt || "").toLocaleDateString()} 
              icon={Calendar} 
            />
            <ProfileStatCard 
              label="Auth Method" 
              value="Standard" 
              icon={Shield} 
            />
            <ProfileStatCard 
              label="Member ID" 
              value={user.uid.slice(0, 8).toUpperCase()} 
              icon={User} 
            />
          </div>

          <div className="border-t border-slate-100 pt-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InfoRow label="Email Address" value={user.email} />
              <InfoRow label="User UID" value={user.uid} />
              <InfoRow label="Access Role" value={user.role} />
              <InfoRow label="Status" value={user.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-primary/20 transition-all">
      <div className="p-3 bg-white rounded-2xl shadow-sm text-primary group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="font-extrabold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="font-bold text-slate-700">{value}</p>
    </div>
  );
}
