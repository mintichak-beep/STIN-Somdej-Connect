import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio, Box, Typography, TextField } from '@mui/material';
import { FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { useExportReport } from '../../hooks/useExportReport';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: any[];
}

export function ExportDialog({ open, onClose, title, data }: ExportDialogProps) {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [fileName, setFileName] = useState(title);
  const { exportExcel, exportPDF, exporting } = useExportReport();

  const handleExport = async () => {
    if (format === 'excel') {
      await exportExcel(fileName, data);
    } else {
      await exportPDF(fileName, data);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100 pb-2">
        Export Report
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" className="mb-4">
          Choose your preferred format and file name to generate the report.
        </Typography>

        <TextField
          fullWidth
          label="File Name"
          variant="outlined"
          size="small"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="mb-4"
          sx={{ mb: 3 }}
        />

        <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as 'excel' | 'pdf')}>
          <Box className="flex flex-col gap-2">
            <FormControlLabel
              value="excel"
              control={<Radio color="primary" />}
              label={
                <Box className="flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-600" />
                  <Typography variant="body2" className="font-medium">Excel Spreadsheet (.xlsx)</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="pdf"
              control={<Radio color="primary" />}
              label={
                <Box className="flex items-center gap-2">
                  <FileText size={18} className="text-rose-600" />
                  <Typography variant="body2" className="font-medium">Portable Document Format (.pdf)</Typography>
                </Box>
              }
            />
          </Box>
        </RadioGroup>
      </DialogContent>
      <DialogActions className="p-4 border-t border-slate-50 dark:border-zinc-800">
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handleExport} 
          variant="contained" 
          color="primary"
          startIcon={<FileDown size={16} />}
          disabled={exporting}
        >
          {exporting ? 'Generating...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
