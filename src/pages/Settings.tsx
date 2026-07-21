import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Save, Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw, Link as LinkIcon, Sparkles } from "lucide-react";
import { appImageService } from "../services/app.service";
import { AppImage } from "../types/app";
import { DEFAULT_IMAGE_SLUGS } from "../services/appImage.service";

interface ImageSlotState {
  id?: string;
  imageName: string;
  imageType: 'login' | 'welcome' | 'dashboard_banner' | 'medical_illustration' | 'empty_state';
  imageUrl: string;
  previewUrl: string;
  isCustomUrlInput: boolean;
  fileError?: string;
}

export function Settings() {
  const [imagesMap, setImagesMap] = useState<Record<string, ImageSlotState>>({});
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadImages = async () => {
    try {
      setLoading(true);
      const existingDocs = await appImageService.getAll();
      
      const newMap: Record<string, ImageSlotState> = {};
      
      DEFAULT_IMAGE_SLUGS.forEach(slug => {
        const found = existingDocs.find(doc => doc.imageType === slug.type);
        newMap[slug.type] = {
          id: found?.id,
          imageName: found?.imageName || slug.label,
          imageType: slug.type as any,
          imageUrl: found?.imageUrl || slug.defaultUrl,
          previewUrl: found?.imageUrl || slug.defaultUrl,
          isCustomUrlInput: false,
        };
      });

      setImagesMap(newMap);
    } catch (err) {
      console.error("Error loading app images:", err);
      setMessage({ text: "Failed to load image configurations.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (PNG/JPG/JPEG)
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setMessage({ text: `Invalid file format for ${file.name}. Only PNG and JPG images are allowed.`, type: "error" });
      return;
    }

    // Validate size (max 2MB for Base64 in Firestore Spark Plan)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: `File ${file.name} is too large. Maximum allowed size is 2MB.`, type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        const base64Url = event.target.result;
        setImagesMap(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            previewUrl: base64Url,
            imageUrl: base64Url,
            imageName: file.name,
            fileError: undefined,
          }
        }));
        setMessage({ text: `Selected image "${file.name}" for ${type}. Click Save to apply.`, type: "success" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInputChange = (type: string, url: string) => {
    setImagesMap(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        previewUrl: url,
        imageUrl: url,
      }
    }));
  };

  const handleSaveSlot = async (type: string) => {
    const slot = imagesMap[type];
    if (!slot) return;

    try {
      setSavingType(type);
      setMessage(null);

      const payload: Partial<AppImage> = {
        imageName: slot.imageName || type,
        imageType: slot.imageType,
        imageUrl: slot.imageUrl,
        updatedAt: new Date(),
      };

      if (slot.id) {
        await appImageService.update(slot.id, payload);
      } else {
        const createdId = await appImageService.create(payload as AppImage);
        slot.id = createdId;
      }

      setMessage({ text: `Successfully updated image for ${DEFAULT_IMAGE_SLUGS.find(s => s.type === type)?.label}!`, type: "success" });
      await loadImages();
    } catch (err) {
      console.error(`Error saving image slot ${type}:`, err);
      setMessage({ text: `Failed to save image settings for ${type}.`, type: "error" });
    } finally {
      setSavingType(null);
    }
  };

  const handleDeleteSlot = async (type: string) => {
    const slot = imagesMap[type];
    const defaultSlug = DEFAULT_IMAGE_SLUGS.find(s => s.type === type);
    if (!slot || !defaultSlug) return;

    if (!window.confirm(`Are you sure you want to reset "${defaultSlug.label}" to default?`)) return;

    try {
      setSavingType(type);
      if (slot.id) {
        await appImageService.delete(slot.id);
      }

      setImagesMap(prev => ({
        ...prev,
        [type]: {
          id: undefined,
          imageName: defaultSlug.label,
          imageType: type as any,
          imageUrl: defaultSlug.defaultUrl,
          previewUrl: defaultSlug.defaultUrl,
          isCustomUrlInput: false,
        }
      }));

      setMessage({ text: `Reset ${defaultSlug.label} to system default image.`, type: "success" });
    } catch (err) {
      console.error(`Error deleting image slot ${type}:`, err);
      setMessage({ text: `Failed to reset image for ${type}.`, type: "error" });
    } finally {
      setSavingType(null);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <RefreshCw className="h-8 w-8 text-rose-500 animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">Loading System Image Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-black rounded-full border border-rose-100 uppercase tracking-widest">
            Visual Assets Admin
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Image Upload & Asset Management</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Upload and manage custom visual images (Login, Welcome, Dashboard Banner, Illustrations & Empty States) stored in Firestore <code className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">appImages</code>.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-bold shadow-xs transition-all ${
          message.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-60 hover:opacity-100 font-black">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {DEFAULT_IMAGE_SLUGS.map(slug => {
          const slot = imagesMap[slug.type];
          if (!slot) return null;

          const isDefault = slot.previewUrl === slug.defaultUrl;

          return (
            <div key={slug.type} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                
                {/* Left: Preview thumbnail */}
                <div className="w-full md:w-56 shrink-0 space-y-2">
                  <div className="aspect-[4/3] rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative shadow-inner group">
                    <img 
                      src={slot.previewUrl} 
                      alt={slug.label} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = slug.defaultUrl;
                      }}
                    />
                    {isDefault ? (
                      <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                        Default Asset
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Custom Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400 text-center truncate">
                    Type: <span className="text-slate-700 font-mono font-bold">{slug.type}</span>
                  </p>
                </div>

                {/* Right: Controls & Details */}
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-rose-500" />
                      {slug.label}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{slug.description}</p>
                  </div>

                  {/* Input Source Selector */}
                  <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>Image Source Options (Max 2MB Base64 or Drive Link)</span>
                      <button 
                        type="button"
                        onClick={() => setImagesMap(prev => ({
                          ...prev,
                          [slug.type]: {
                            ...prev[slug.type],
                            isCustomUrlInput: !prev[slug.type].isCustomUrlInput
                          }
                        }))}
                        className="text-rose-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <LinkIcon className="h-3 w-3" />
                        {slot.isCustomUrlInput ? "Switch to File Upload" : "Use Google Drive / URL"}
                      </button>
                    </div>

                    {!slot.isCustomUrlInput ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[slug.type]?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5 text-rose-500" />
                          Choose PNG / JPG File
                        </button>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                          ref={el => { fileInputRefs.current[slug.type] = el; }}
                          onChange={(e) => handleFileChange(slug.type, e)}
                        />
                        <span className="text-[11px] font-semibold text-slate-400">
                          {slot.imageName !== slug.label ? slot.imageName : "PNG, JPG up to 2MB"}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <input
                          type="url"
                          placeholder="Paste image direct URL or Google Drive view link..."
                          value={slot.imageUrl}
                          onChange={(e) => handleUrlInputChange(slug.type, e.target.value)}
                          className="w-full text-xs px-3.5 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 font-mono text-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveSlot(slug.type)}
                        disabled={savingType === slug.type}
                        className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {savingType === slug.type ? "Saving..." : "Save Setting"}
                      </button>

                      {!isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSlot(slug.type)}
                          disabled={savingType === slug.type}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Reset to Default
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Firestore Collection: <span className="font-mono text-rose-500">appImages</span>
                    </p>
                  </div>

                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

