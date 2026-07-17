import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, Button } from '@mui/material';
import { CloudUpload } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  label: string;
}

export function FileUpload({ onUpload, label }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) onUpload(acceptedFiles[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } });

  return (
    <Paper {...getRootProps()} className="p-6 border-2 border-dashed border-zinc-300 text-center cursor-pointer hover:border-zinc-500">
      <input {...getInputProps()} />
      <CloudUpload className="mx-auto mb-2 text-zinc-400" size={32} />
      <Typography variant="body1">{isDragActive ? "Drop the file here" : label}</Typography>
    </Paper>
  );
}
