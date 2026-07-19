import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { practiceScheduleService } from '../../services/practiceScheduleService';

export const ScheduleUploadBox = ({ onImport }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const records = await practiceScheduleService.parseScheduleFile(selectedFile);
      const validation = await practiceScheduleService.validateScheduleData(records);
      onImport(validation);
    }
  };

  return (
    <div className="border-2 border-dashed border-zinc-300 rounded-lg p-8 text-center">
      <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 text-zinc-400 mx-auto" />
        <p className="mt-2 text-sm text-zinc-600">Click to upload CSV or XLSX schedule</p>
      </label>
    </div>
  );
};
