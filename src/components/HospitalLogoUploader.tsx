import React, { useState, useRef } from 'react';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';
import { hospitalStorageService } from '../services/hospital.storage';
import { AssetImage } from './AssetImage';

interface HospitalLogoUploaderProps {
  id?: string;
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function HospitalLogoUploader({ id, value, onChange, disabled }: HospitalLogoUploaderProps) {
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
      const url = await hospitalStorageService.uploadLogo(file);
      onChange(url);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload logo.');
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

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id={id || 'logo-uploader-container'} className="flex flex-col items-center gap-3">
      <div
        className={`relative group flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed overflow-hidden transition-all duration-200 ${
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
              alt="Hospital Logo"
              className="w-full h-full object-cover"
              fallbackType="hospital"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2 text-zinc-400 dark:text-zinc-500">
            {uploading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
            ) : (
              <>
                <Upload className="w-5 h-5 mb-1 text-zinc-400" />
                <span className="text-[10px] font-medium">Upload Logo</span>
              </>
            )}
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
          </div>
        )}
      </div>

      {value && !disabled && (
        <button
          type="button"
          onClick={removeLogo}
          className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Remove Logo
        </button>
      )}

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
