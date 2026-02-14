import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import type { Dayjs } from 'dayjs';

type DateTimePickerProps = {
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  label?: string;
};

export default function DateTimePickerComponent({ value, onChange, label = "Select Date & Time" }: DateTimePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer
      components={['DateTimePicker']}>
        <DateTimePicker
          onChange={(newValue)=>onChange(newValue)}
          label={label}
          disablePast={true}
          slotProps={{
          textField: {
            fullWidth: true,
            size: "small",
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              }
            }
          },
          popper: {
            placement: 'auto',
            sx: {
              zIndex: 9999,
            },
            modifiers: [
              {
                name: 'preventOverflow',
                enabled: true,
                options: {
                  boundary: 'viewport',
                },
              },
            ],
          },
          desktopPaper: {
            sx: {
              marginTop: '8px', // Add some spacing from the input
            }
          }
        }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
