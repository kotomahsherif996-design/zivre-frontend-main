import React from 'react'
import {
  Box, Typography, ToggleButton, ToggleButtonGroup, FormControl,
  InputLabel, Select, MenuItem, TextField, RadioGroup, FormControlLabel,
  Radio, Paper
} from '@mui/material'

/**
 * Reusable scheduling control shared by CustomServiceModal and the
 * built-in service request flow.
 *
 * value shape:
 * {
 *   schedule_type: 'one_time' | 'daily' | 'weekly' | 'monthly',
 *   weekly_day: 0..6 (Mon..Sun),
 *   monthly_date: 1..28,
 *   end_mode: 'manual' | 'date',
 *   end_date: 'YYYY-MM-DD' | ''
 * }
 */

export const defaultSchedule = {
  schedule_type: 'one_time',
  weekly_day: 0,
  monthly_date: 1,
  end_mode: 'manual',
  end_date: ''
}

const WEEKDAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
]

const ScheduleSelector = ({ value, onChange }) => {
  const v = value || defaultSchedule
  const set = (patch) => onChange({ ...v, ...patch })

  const isRecurring = v.schedule_type !== 'one_time'

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mt: 2, borderRadius: 2, borderColor: '#e2e8f0' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
        Service Frequency
      </Typography>

      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={v.schedule_type}
        onChange={(e, next) => { if (next) set({ schedule_type: next }) }}
        sx={{
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#e2e8f0',
            '&.Mui-selected': {
              bgcolor: '#10b981',
              color: 'white',
              '&:hover': { bgcolor: '#059669' }
            }
          }
        }}
      >
        <ToggleButton value="one_time">One-time</ToggleButton>
        <ToggleButton value="daily">Daily</ToggleButton>
        <ToggleButton value="weekly">Weekly</ToggleButton>
        <ToggleButton value="monthly">Monthly</ToggleButton>
      </ToggleButtonGroup>

      {v.schedule_type === 'weekly' && (
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel>Repeat on</InputLabel>
          <Select
            label="Repeat on"
            value={v.weekly_day}
            onChange={(e) => set({ weekly_day: e.target.value })}
          >
            {WEEKDAYS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
          </Select>
        </FormControl>
      )}

      {v.schedule_type === 'monthly' && (
        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel>Day of month</InputLabel>
          <Select
            label="Day of month"
            value={v.monthly_date}
            onChange={(e) => set({ monthly_date: e.target.value })}
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Limited to 1–28 so it works in every month.
          </Typography>
        </FormControl>
      )}

      {isRecurring && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
            When should it stop?
          </Typography>
          <RadioGroup
            value={v.end_mode}
            onChange={(e) => set({ end_mode: e.target.value })}
          >
            <FormControlLabel
              value="manual"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label="Keep running until I stop it"
            />
            <FormControlLabel
              value="date"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label="Stop on a specific date"
            />
          </RadioGroup>
          {v.end_mode === 'date' && (
            <TextField
              type="date"
              fullWidth
              size="small"
              value={v.end_date}
              onChange={(e) => set({ end_date: e.target.value })}
              sx={{ mt: 1 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </Box>
      )}
    </Paper>
  )
}

export default ScheduleSelector
