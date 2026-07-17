import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio, Box, Typography } from '@mui/material';
import { Printer } from 'lucide-react';

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  elementId: string;
}

export function PrintDialog({ open, onClose, elementId }: PrintDialogProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const handlePrint = () => {
    const printContent = document.getElementById(elementId);
    if (!printContent) {
      alert('Report content could not be found to print.');
      return;
    }

    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { margin: 1.5cm; }
        @page { size: A4 ${orientation}; }
        header, footer, nav, aside, .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;

    // Clean up and reload to restore React state cleanly
    document.head.removeChild(style);
    window.location.reload();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-bold text-slate-800 dark:text-slate-100 pb-2">
        Print Configuration
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" className="mb-4">
          Configure print orientation for standard A4 page sizes.
        </Typography>

        <RadioGroup value={orientation} onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}>
          <Box className="flex flex-col gap-2">
            <FormControlLabel
              value="portrait"
              control={<Radio color="primary" />}
              label={<Typography variant="body2" className="font-medium">Portrait (A4 Vertical)</Typography>}
            />
            <FormControlLabel
              value="landscape"
              control={<Radio color="primary" />}
              label={<Typography variant="body2" className="font-medium">Landscape (A4 Horizontal)</Typography>}
            />
          </Box>
        </RadioGroup>
      </DialogContent>
      <DialogActions className="p-4 border-t border-slate-50 dark:border-zinc-800">
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button 
          onClick={handlePrint} 
          variant="contained" 
          color="primary"
          startIcon={<Printer size={16} />}
        >
          Print Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
