import { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  ArrowRight, 
  User, 
  GraduationCap, 
  FileImage, 
  Compass, 
  Activity,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { loginImagesService } from "../services/loginImages.service";
import { resizeImage } from "../lib/imageUtils";

interface FileValidationError {
  field: string;
  message: string;
}

export function WelcomeSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [previewSettings, setPreviewSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FileValidationError[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load current settings from Firestore on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await loginImagesService.getAsMap();
        setSettings(data);
        setPreviewSettings(data);
      } catch (error) {
        console.error("Failed to load welcome settings:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const validateAndProcessFile = async (file: File, field: string) => {
    // Clear previous error for this field
    setErrors(prev => prev.filter(e => e.field !== field));
    setSuccessMessage(null);

    // Validate type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => [...prev, { 
        field, 
        message: "Invalid file type. Only PNG, JPG, JPEG, SVG, and WEBP are accepted." 
      }]);
      return;
    }

    // Validate size: 3MB = 3 * 1024 * 1024 bytes
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors(prev => [...prev, { 
        field, 
        message: "File exceeds 3MB limit. Please upload a smaller image." 
      }]);
      return;
    }

    // Convert file to base64
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      let finalValue = base64;

      // Compress/resize non-SVGs to optimize Firestore storage (1MB document limit)
      if (file.type !== "image/svg+xml") {
        // Resize large photos (backgrounds, cards, illustrations) to maximum 800px width/height
        finalValue = await resizeImage(base64, 800, 0.75);
      }

      // Update preview immediately
      setPreviewSettings(prev => ({
        ...prev,
        [field]: finalValue
      }));
    } catch (err) {
      console.error("Error reading file:", err);
      setErrors(prev => [...prev, { 
        field, 
        message: "Failed to read file. Please try again." 
      }]);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, field: string) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await validateAndProcessFile(e.dataTransfer.files[0], field);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      await validateAndProcessFile(e.target.files[0], field);
    }
  };

  const handleRemoveImage = (field: string) => {
    setPreviewSettings(prev => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
    setErrors(prev => prev.filter(e => e.field !== field));
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    try {
      // Find keys to delete (if they were removed in preview)
      const keysToSave = Object.keys(previewSettings);
      const keysToDelete = Object.keys(settings).filter(k => !keysToSave.includes(k));

      // Save updated keys
      for (const key of keysToSave) {
        if (previewSettings[key] !== settings[key]) {
          await loginImagesService.saveImage(key, previewSettings[key]);
        }
      }

      // Delete removed keys
      for (const key of keysToDelete) {
        await loginImagesService.removeImageRecord(key);
      }

      setSettings(previewSettings);
      setSuccessMessage("Login page images and settings saved successfully! Changes are now live.");
    } catch (error) {
      console.error("Failed to save login images:", error);
      setErrors(prev => [...prev, { field: "global", message: "Failed to save settings to Firestore." }]);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm("Are you sure you want to restore all default images and icons? This will delete your custom uploads.")) {
      return;
    }

    setSaving(true);
    setSuccessMessage(null);
    setErrors([]);
    try {
      await loginImagesService.resetAll();
      setSettings({});
      setPreviewSettings({});
      setSuccessMessage("Restored all default images and icons successfully!");
    } catch (error) {
      console.error("Failed to reset login images:", error);
      setErrors(prev => [...prev, { field: "global", message: "Failed to restore defaults." }]);
    } finally {
      setSaving(false);
    }
  };

  const renderUploadBox = (field: string, label: string, description: string, previewType: "circle" | "rect" | "icon") => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fieldError = errors.find(e => e.field === field);
    const previewValue = previewSettings[field];

    return (
      <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100/80 hover:border-slate-200/80 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">{label}</h4>
            <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-sm">{description}</p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {previewValue && (
              <button
                onClick={() => handleRemoveImage(field)}
                className="p-2 rounded-xl bg-red-50 text-[#D32F2F] hover:bg-red-100 transition-colors"
                title="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div 
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, field)}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            previewValue 
              ? "border-emerald-200 bg-emerald-50/10 hover:bg-emerald-50/20" 
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={e => handleFileSelect(e, field)}
            accept=".png,.jpg,.jpeg,.svg,.webp"
            className="hidden" 
          />

          {previewValue ? (
            <div className="flex flex-col items-center gap-3">
              {previewType === "circle" ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-md">
                  <img src={previewValue} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : previewType === "rect" ? (
                <div className="w-24 h-14 rounded-lg overflow-hidden border border-emerald-500/20 shadow-sm bg-slate-100">
                  <img src={previewValue} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-2.5">
                  <img src={previewValue} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                <Check className="h-4 w-4" />
                <span>Ready to Save</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-slate-500">
                Drag & drop or <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">PNG, JPG, SVG, WEBP up to 3MB</p>
            </div>
          )}
        </div>

        {fieldError && (
          <div className="flex items-start gap-2 text-xs text-red-600 font-bold mt-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{fieldError.message}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Settings</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Customize branding, layouts, background patterns, and role cards of the login welcome screen.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestoreDefaults}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 border border-slate-200 hover:bg-slate-50 active:scale-95 disabled:opacity-50 text-slate-600 text-sm font-bold rounded-2xl transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Restore Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary/95 active:scale-95 disabled:opacity-50 text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            {saving ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save Configuration
          </button>
        </div>
      </div>

      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm"
          >
            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="h-4 w-4" />
            </div>
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-bold">Loading configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* UPLOAD PANEL (8 Cols on large) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* BRANDING SECTION */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="h-10 w-10 rounded-xl bg-red-50 text-primary flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">1. Branding & Identity</h3>
                  <p className="text-xs text-slate-400 font-semibold">Hospital logos and custom header configurations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUploadBox("logo", "App Logo", "Replaces the red '+' logo block. Supports WEBP, PNG, JPG, or SVG vector.", "icon")}
                {renderUploadBox("medicalIcon", "Medical Icon", "Alternative icon to display inside the red logo block or beside headers.", "icon")}
              </div>
            </div>

            {/* ILLUSTRATIONS SECTION */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileImage className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">2. Layout & Art Illustration</h3>
                  <p className="text-xs text-slate-400 font-semibold">Background covers and right-hand medical art.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderUploadBox("backgroundImage", "Background Image", "Full responsive wallpaper for desktop/mobile in cover mode.", "rect")}
                {renderUploadBox("medicalIllustration", "Medical Illustration", "Large nurse artwork. Placed at right side on desktop, top on mobile.", "rect")}
              </div>
            </div>

            {/* ROLE SETTINGS SECTION */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">3. Instructor & Student Portal Roles</h3>
                  <p className="text-xs text-slate-400 font-semibold">Customize avatar headshots and small portal menu icons.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderUploadBox("teacherImage", "Teacher Headshot", "Display inside the Teacher role card. Rounded crop overlay.", "circle")}
                  {renderUploadBox("studentImage", "Student Headshot", "Display inside the Student role card. Rounded crop overlay.", "circle")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                  {renderUploadBox("teacherIcon", "Teacher Icon", "Card heading icon.", "icon")}
                  {renderUploadBox("studentIcon", "Student Icon", "Card heading icon.", "icon")}
                  {renderUploadBox("continueIcon", "Continue Icon", "Button action icon.", "icon")}
                </div>
              </div>
            </div>

          </div>

          {/* REALTIME PREVIEW PANEL (5 Cols on large) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-[2.5rem] flex items-center justify-between border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2.5">
                <Activity className="h-5 w-5 text-red-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black tracking-tight uppercase">Live Workspace Preview</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wide">Interactive mockup of Welcome page</p>
                </div>
              </div>
              <span className="text-[9px] font-black tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/20 uppercase">
                Active
              </span>
            </div>

            {/* MOCK WELCOME SCREEN */}
            <div 
              className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/5] xl:aspect-[3/4] rounded-[2.5rem] bg-gradient-to-br from-[#D9F1FF] to-[#BEE3F8] shadow-2xl relative overflow-hidden border border-slate-100 flex flex-col justify-between p-5 text-slate-800"
              style={
                previewSettings.backgroundImage
                  ? { backgroundImage: `url(${previewSettings.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : {}
              }
            >
              {previewSettings.backgroundImage && (
                <div className="absolute inset-0 bg-white/25 backdrop-blur-[1.5px] pointer-events-none z-0" />
              )}

              {/* Mock Header */}
              <div className="flex items-center gap-2 relative z-10 w-full">
                {previewSettings.logo ? (
                  <img src={previewSettings.logo} alt="Logo" className="h-6 w-6 rounded-lg object-cover shadow-sm" />
                ) : (
                  <div className="h-6 w-6 rounded-lg bg-[#D32F2F] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {previewSettings.medicalIcon ? (
                      <img src={previewSettings.medicalIcon} alt="Icon" className="h-4 w-4 object-contain" />
                    ) : (
                      <span>+</span>
                    )}
                  </div>
                )}
                <div className="flex flex-col text-[8px] leading-tight font-black">
                  <div className="flex items-center gap-0.5">
                    <span>STIN-Somdej Connect</span>
                    {previewSettings.medicalIcon && previewSettings.logo && (
                      <img src={previewSettings.medicalIcon} alt="Med" className="h-2.5 w-2.5 object-contain" />
                    )}
                  </div>
                  <span className="text-[6px] text-slate-500 font-bold">ระบบประสานงานแหล่งฝึก</span>
                </div>
              </div>

              {/* Mock Middle Grid (Cards + Art) */}
              <div className="relative z-10 flex-1 grid grid-cols-12 gap-3 items-center py-4 overflow-hidden">
                
                {/* Text and Cards */}
                <div className="col-span-8 flex flex-col justify-center h-full space-y-3">
                  <div className="space-y-0.5">
                    <h2 className="text-xs font-black text-slate-900 leading-tight">ระบบประสานงานแหล่งฝึก</h2>
                    <p className="text-[8px] font-black text-[#D32F2F] leading-tight">รพ.สมเด็จพระบรมราชเทวี ณ ศรีราชา</p>
                  </div>

                  {/* Mock Cards Stack */}
                  <div className="space-y-2 max-w-xs">
                    {/* Teacher Card */}
                    <div className="bg-white/95 rounded-2xl p-2.5 shadow-md flex items-center gap-3 border border-white/50">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 shrink-0 shadow-sm">
                        <img 
                          src={previewSettings.teacherImage || "/src/assets/images/teacher.jpg"} 
                          alt="Teacher" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = "/src/assets/images/nursing_instructor_icon_1784479023431.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          {previewSettings.teacherIcon ? (
                            <img src={previewSettings.teacherIcon} alt="Teacher Icon" className="h-3.5 w-3.5 object-contain" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#D32F2F]" />
                          )}
                          <span className="text-[10px] font-black text-slate-800">Teacher</span>
                        </div>
                        <p className="text-[6px] text-slate-400 font-bold leading-tight">Instructors & Admins</p>
                      </div>
                      <div className="h-6 px-2 rounded-lg bg-primary text-white text-[8px] font-black flex items-center gap-1 shadow-sm">
                        <span>Go</span>
                        {previewSettings.continueIcon ? (
                          <img src={previewSettings.continueIcon} alt="Go" className="h-2 w-2 object-contain invert brightness-0" />
                        ) : (
                          <ArrowRight className="h-2.5 w-2.5" />
                        )}
                      </div>
                    </div>

                    {/* Student Card */}
                    <div className="bg-white/95 rounded-2xl p-2.5 shadow-md flex items-center gap-3 border border-white/50">
                      <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 shrink-0 shadow-sm">
                        <img 
                          src={previewSettings.studentImage || "/src/assets/images/student.jpg"} 
                          alt="Student" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/src/assets/images/student.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          {previewSettings.studentIcon ? (
                            <img src={previewSettings.studentIcon} alt="Student Icon" className="h-3.5 w-3.5 object-contain" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-[#D32F2F]" />
                          )}
                          <span className="text-[10px] font-black text-slate-800">Student</span>
                        </div>
                        <p className="text-[6px] text-slate-400 font-bold leading-tight">Nursing Students</p>
                      </div>
                      <div className="h-6 px-2 rounded-lg bg-primary text-white text-[8px] font-black flex items-center gap-1 shadow-sm">
                        <span>Go</span>
                        {previewSettings.continueIcon ? (
                          <img src={previewSettings.continueIcon} alt="Go" className="h-2 w-2 object-contain invert brightness-0" />
                        ) : (
                          <ArrowRight className="h-2.5 w-2.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Medical Art (Mock Right Side) */}
                <div className="col-span-4 h-full flex items-center justify-center bg-[#FFF4EC] rounded-2xl p-2 border border-orange-50/20 relative shadow-sm overflow-hidden">
                  <div className="absolute top-4 -right-4 w-12 h-12 rounded-full bg-[#FFE4D6] blur-lg opacity-60" />
                  <img 
                    src={previewSettings.medicalIllustration || "/src/assets/images/medical_premium_background_1784633086843.jpg"} 
                    alt="Art" 
                    className="max-h-full max-w-full object-contain drop-shadow-md" 
                    onError={(e) => {
                      e.currentTarget.src = "/src/assets/images/medical_premium_background_1784633086843.jpg";
                    }}
                  />
                </div>

              </div>

              {/* Mock Footer */}
              <div className="flex items-center gap-3 text-slate-400 text-[6px] font-black uppercase tracking-wider relative z-10 w-full border-t border-slate-100/15 pt-2">
                <span className="text-blue-500">Secure</span>
                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                <span>Reliable</span>
                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                <span>Efficient</span>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
