import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { buildingStorageService } from '../services/building.storage';

interface BuildingImageUploaderProps {
  id?: string;
  value?: string;
  onChange: (url: string) => void;
  onUploadSuccess?: () => void;
  onValidationError?: (err: string) => void;
}

export function BuildingImageUploader({
  id,
  value,
  onChange,
  onUploadSuccess,
  onValidationError,
}: BuildingImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      if (onValidationError) onValidationError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }
    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (onValidationError) onValidationError('Image file size must be under 5MB.');
      return;
    }

    try {
      setLoading(true);
      const url = await buildingStorageService.uploadImage(file);
      onChange(url);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      if (onValidationError) onValidationError(err?.message || 'Failed to upload building image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div id={id || 'building-image-uploader'} className="space-y-2">
      <label className="text-xs font-extrabold text-gray-700 dark:text-zinc-300">
        Building Image
      </label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 group aspect-video">
          <img
            src={value}
            alt="Uploaded Building"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition aspect-video ${
            dragActive
              ? 'border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/20'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={loading}
          />

          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin dark:text-indigo-400" />
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 animate-pulse">
                Uploading image...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="p-3 bg-white shadow-xs rounded-xl border border-slate-100 dark:bg-zinc-800 dark:border-zinc-700 text-slate-400 dark:text-zinc-300">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  Click to upload
                </span>{' '}
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  or drag and drop
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                PNG, JPG or WEBP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
