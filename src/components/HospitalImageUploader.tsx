import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, RefreshCw } from 'lucide-react';
import { hospitalStorageService } from '../services/hospital.storage';
import { AssetImage } from './AssetImage';

interface HospitalImageUploaderProps {
  id?: string;
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function HospitalImageUploader({ id, value, onChange, disabled }: HospitalImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    try {
      setUploading(true);
      setError(null);
      const url = await hospitalStorageService.uploadImage(file);
      onChange(url);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id={id || 'image-uploader-container'} className="w-full">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10'
            : value
            ? 'border-zinc-200 dark:border-zinc-700'
            : 'border-zinc-300 hover:border-indigo-400 dark:border-zinc-700'
        }`}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        style={{ cursor: disabled || uploading ? 'not-allowed' : 'pointer' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled || uploading}
        />

        {value ? (
          <>
            <AssetImage
              src={value}
              alt="Hospital Cover"
              className="w-full h-full object-cover"
              fallbackType="hospital"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity duration-200">
                <Upload className="w-6 h-6" />
                <span className="text-xs font-semibold">Change Cover Image</span>
              </div>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 text-zinc-400 dark:text-zinc-500">
            {uploading ? (
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  Drag & Drop hospital cover image
                </span>
                <span className="text-xs mt-1">or click to browse files</span>
              </>
            )}
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-500 mt-2 text-left">{error}</p>}
    </div>
  );
}
