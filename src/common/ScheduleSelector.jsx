import React from 'react'
import {
  Box, Typography, ToggleButton, ToggleButtonGroup, FormControl,
  InputLabel, Select, MenuItem, TextField, RadioGroup, FormControlLabel,
  Radio, Paper
} from '@mui/material'
import EventRepeatIcon from '@mui/icons-material/EventRepeat'

/**
 * Reusable scheduling control shared by CustomServiceModal and the
 * built-in service request flow.
 *
 * value shape:
 * {
 *   schedule_type: 'one_time' | 'daily' | 'weekly' | 'monthly',
 *   weekly_day: 0..6 (Mon..Sun),
 *   monthly_date: 1..28,
 *   end_mode: 'manual' | 'date',      // for daily/weekly/monthly: when recurrence stops
 *   end_date: 'YYYY-MM-DD' | '',      // used by end_mode='date' AND by range_mode='range'
 *   range_mode: 'single' | 'range',   // only relevant when schedule_type === 'one_time'
 *   start_date: 'YYYY-MM-DD' | ''     // used by range_mode='range'
 * }
 */

export const defaultSchedule = {
  schedule_type: 'one_time',
  weekly_day: 0,
  monthly_date: 1,
  end_mode: 'manual',
  end_date: '',
  range_mode: 'single',
  start_date: ''
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

const todayStr = () => new Date().toISOString().slice(0, 10)

/**
 * Preview-only estimate of how many days a schedule's amount will cover.
 * The backend recomputes this authoritatively on submit — this is just so
 * the customer can see the total before confirming.
 */
export const computePeriodDays = (schedule) => {
  const s = schedule || defaultSchedule

  if (s.schedule_type === 'daily') return 1
  if (s.schedule_type === 'weekly') return 7

  if (s.schedule_type === 'monthly') {
    const now = new Date()
    const wantedDay = Math.min(Math.max(parseInt(s.monthly_date || now.getDate(), 10) || 1, 1), 28)
    let year = now.getFullYear()
    let month = now.getMonth() // 0-indexed
    if (wantedDay < now.getDate()) {
      month += 1
      if (month > 11) { month = 0; year += 1 }
    }
    // Day 0 of "next" month gives the last day of the target month
    return new Date(year, month + 1, 0).getDate()
  }

  if (s.schedule_type === 'one_time' && s.range_mode === 'range' && s.start_date && s.end_date) {
    const start = new Date(s.start_date)
    const end = new Date(s.end_date)
    const diff = Math.round((end - start) / 86400000) + 1
    return diff > 0 ? diff : 1
  }

  return 1
}

/**
 * Whether this configuration needs the recurring-schedule endpoint (POST /schedules)
 * instead of a plain one-off request (POST /requests). True for daily/weekly/monthly,
 * and for a one_time schedule where the customer picked a multi-day custom range.
 */
export const usesScheduleEndpoint = (schedule) => {
  const s = schedule || defaultSchedule
  if (s.schedule_type !== 'one_time') return true
  return s.range_mode === 'range' && !!s.start_date && !!s.end_date
}

/** Human-readable one-line description of the recurrence, for lists/summaries. */
export const describeFrequency = (schedule) => {
  const s = schedule || defaultSchedule
  if (s.schedule_type === 'daily') return 'Every day'
  if (s.schedule_type === 'weekly') return `Every ${WEEKDAYS[s.weekly_day]?.label || ''}`.trim()
  if (s.schedule_type === 'monthly') return `Day ${s.monthly_date} of each month`
  if (s.schedule_type === 'one_time' && s.range_mode === 'range' && s.start_date && s.end_date) {
    return 'Custom date range'
  }
  return 'One-time visit'
}

const ScheduleSelector = ({ value, onChange, perDayAmount = 0 }) => {
  const v = value || defaultSchedule
  const set = (patch) => onChange({ ...v, ...patch })

  const isRecurring = v.schedule_type !== 'one_time'
  const isCustomRange = v.schedule_type === 'one_time' && v.range_mode === 'range'
  const periodDays = computePeriodDays(v)
  const amount = (perDayAmount || 0) * periodDays
  const rangeIncomplete = isCustomRange && (!v.start_date || !v.end_date)
  const rangeInvalid = isCustomRange && v.start_date && v.end_date && new Date(v.end_date) < new Date(v.start_date)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        mt: 2,
        borderRadius: 2,
        borderColor: '#e2e8f0'
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
      >
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
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            py: { xs: 0.5, sm: 0.75 },
            px: { xs: 1, sm: 1.5 },
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

      {/* One-time: choose a single visit or a custom multi-day range */}
      {v.schedule_type === 'one_time' && (
        <Box sx={{ mt: 2 }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={v.range_mode || 'single'}
            onChange={(e, next) => { if (next) set({ range_mode: next }) }}
            sx={{
              flexWrap: 'wrap',
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e2e8f0',
                fontSize: { xs: '0.72rem', sm: '0.8125rem' },
                py: { xs: 0.5, sm: 0.75 },
                '&.Mui-selected': {
                  bgcolor: '#e0f2fe',
                  color: '#0284c7',
                  '&:hover': { bgcolor: '#bae6fd' }
                }
              }
            }}
          >
            <ToggleButton value="single">Single visit</ToggleButton>
            <ToggleButton value="range">Custom date range</ToggleButton>
          </ToggleButtonGroup>

          {v.range_mode === 'range' && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                type="date"
                label="Start date"
                fullWidth
                size="small"
                value={v.start_date || ''}
                onChange={(e) => set({ start_date: e.target.value })}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: todayStr() } }}
              />
              <TextField
                type="date"
                label="End date"
                fullWidth
                size="small"
                value={v.end_date || ''}
                onChange={(e) => set({ end_date: e.target.value })}
                error={rangeInvalid}
                helperText={rangeInvalid ? 'End date must be after start date' : ' '}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: v.start_date || todayStr() } }}
              />
            </Box>
          )}
        </Box>
      )}

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
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', mb: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            When should it stop?
          </Typography>
          <RadioGroup
            value={v.end_mode}
            onChange={(e) => set({ end_mode: e.target.value })}
          >
            <FormControlLabel
              value="manual"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label={<Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Keep running until I stop it</Typography>}
            />
            <FormControlLabel
              value="date"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label={<Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Stop on a specific date</Typography>}
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
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: todayStr() } }}
            />
          )}
        </Box>
      )}

      {/* Price breakdown summary — visible whenever we know a per-day price */}
      {perDayAmount > 0 && !rangeIncomplete && !rangeInvalid && (
        <Box
          sx={{
            mt: 2.5,
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            bgcolor: '#f0fdf4',
            border: '1px solid #bbf7d0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <EventRepeatIcon sx={{ fontSize: 18, color: '#059669' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {describeFrequency(v)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 0.5
            }}
          >
            <Typography variant="body2" sx={{ color: '#334155', fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
              GH₵{perDayAmount.toFixed(2)} per day &nbsp;×&nbsp; {periodDays} day{periodDays > 1 ? 's' : ''}
            </Typography>
            <Typography variant="h6" fontWeight="800" sx={{ color: '#059669', fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
              = GH₵{amount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      )}

      {rangeIncomplete && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          Pick a start and end date to see the total price.
        </Typography>
      )}
    </Paper>
  )
}

export default ScheduleSelector
