"use client";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { Dayjs } from 'dayjs';

interface BasicTimePickerProps {
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  label?: string;
  error?: boolean;
}

export default function BasicTimePicker({ value, onChange, label, error }: BasicTimePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MobileTimePicker 
        label={label}
        value={value} 
        onChange={onChange}
        openTo="hours" 
        slotProps={{
          textField: {
            size: "small",
            error: error,
            sx: { 
              width: '100%',
              '& .MuiOutlinedInput-root': { 
                borderRadius: '0.75rem', 
                backgroundColor: 'white' 
              } 
            }
          }
        }}
      />
    </LocalizationProvider>
  );
}