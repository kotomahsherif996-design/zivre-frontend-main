import React, { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem,
  FormControl, InputLabel, TextField, Box, Typography, IconButton, CircularProgress,
  Stepper, Step, StepLabel, Alert, useMediaQuery, useTheme, Paper
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { getServices, getServiceComponents, createRequest, createSchedule } from '../api/client'
import ScheduleSelector, { defaultSchedule, usesScheduleEndpoint } from './ScheduleSelector'
import { useAuth } from '../contexts/AuthContext'

const CustomServiceModal = ({ open, onClose, onSubmitSuccess }) => {
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState(0)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [components, setComponents] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [location, setLocation] = useState({
    address: '',
    city: '',
    region: '',
    landmark: '',
    customer_phone: user?.phone || ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [schedule, setSchedule] = useState(defaultSchedule)

  useEffect(() => {
    if (open) {
      getServices(true).then(res => setServices(res.data)).catch(console.error)
      setActiveStep(0)
      setSelectedService(null)
      setComponents([])
      setQuantities({})
      setTotal(0)
      setLocation({ ...location, customer_phone: user?.phone || '' })
      setSchedule(defaultSchedule)
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const handleServiceSelect = async (serviceId) => {
    setLoading(true)
    try {
      const res = await getServiceComponents(serviceId)
      setComponents(res.data)
      setSelectedService(services.find(s => s.id === serviceId))
      const initialQtys = {}
      res.data.forEach(c => { initialQtys[c.id] = 0 })
      setQuantities(initialQtys)
      setTotal(0)
      setActiveStep(1)
    } catch (err) {
      setError('Failed to load components')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (componentId, price, delta) => {
    const newQty = Math.max(0, (quantities[componentId] || 0) + delta)
    const newQuantities = { ...quantities, [componentId]: newQty }
    setQuantities(newQuantities)
    const newTotal = components.reduce((sum, c) => sum + (newQuantities[c.id] || 0) * c.price, 0)
    setTotal(newTotal)
  }

  const handleNext = () => {
    if (activeStep === 1 && total === 0) {
      setError('Please select at least one component with quantity > 0')
      return
    }
    setError('')
    setActiveStep(2)
  }

  const handleBack = () => setActiveStep(activeStep - 1)

  const handleSubmit = async () => {
    if (!location.address || !location.city || !location.region || !location.customer_phone) {
      setError('Please fill all location and contact fields')
      return
    }
    if (schedule.schedule_type === 'one_time' && schedule.range_mode === 'range' &&
        (!schedule.start_date || !schedule.end_date)) {
      setError('Please pick a start and end date for the custom range')
      return
    }
    setError('')
    setSubmitting(true)
    const componentsData = components.filter(c => quantities[c.id] > 0).map(c => ({
      component_id: c.id,
      name: c.name,
      quantity: quantities[c.id],
      price: c.price
    }))
    const basePayload = {
      user_id: user.id,
      service_id: selectedService.id,
      components_data: componentsData,
      location_address: location.address,
      location_city: location.city,
      location_region: location.region,
      location_landmark: location.landmark,
      customer_phone: location.customer_phone
    }
    try {
      if (!usesScheduleEndpoint(schedule)) {
        // Plain single visit — same behavior as before
        await createRequest(basePayload)
      } else {
        const isCustomRange = schedule.schedule_type === 'one_time' && schedule.range_mode === 'range'
        await createSchedule({
          ...basePayload,
          schedule_type: schedule.schedule_type,
          weekly_day: schedule.schedule_type === 'weekly' ? schedule.weekly_day : null,
          monthly_date: schedule.schedule_type === 'monthly' ? schedule.monthly_date : null,
          start_date: isCustomRange ? schedule.start_date : null,
          end_date: isCustomRange
            ? schedule.end_date
            : (schedule.end_mode === 'date' && schedule.end_date ? schedule.end_date : null)
        })
      }
      onSubmitSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const steps = ['Select Service', 'Choose Components', 'Location & Submit']

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: 3 } } } }}
    >
      <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="700" sx={{ fontSize: { xs: '1.05rem', sm: '1.25rem' } }}>
            Request Customized Service
          </Typography>
          <IconButton onClick={onClose} size={isMobile ? 'small' : 'medium'}><CloseIcon /></IconButton>
        </Box>
        <Stepper
          activeStep={activeStep}
          alternativeLabel={isMobile}
          sx={{
            mt: 2,
            '& .MuiStepLabel-label': { fontSize: { xs: '0.7rem', sm: '0.875rem' } }
          }}
        >
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {activeStep === 0 && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Service Category</InputLabel>
            <Select onChange={(e) => handleServiceSelect(e.target.value)}>
              {services.map(s => <MenuItem key={s.id} value={s.id}>{s.icon} {s.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {activeStep === 1 && (
          <Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress sx={{ color: '#10b981' }} />
              </Box>
            )}
            {components.map(c => (
              <Box
                key={c.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: { xs: 1, sm: 1.25 },
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <Box sx={{ minWidth: 0, pr: 1 }}>
                  <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' }, fontWeight: 500 }} noWrap>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">GH₵{c.price} / day</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => updateQuantity(c.id, c.price, -1)} sx={{ border: '1px solid #e2e8f0' }}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>
                    {quantities[c.id] || 0}
                  </Typography>
                  <IconButton size="small" onClick={() => updateQuantity(c.id, c.price, 1)} sx={{ border: '1px solid #e2e8f0' }}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Paper
              variant="outlined"
              sx={{ mt: 2.5, p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                  Per-day total
                </Typography>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#059669', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  GH₵{total.toFixed(2)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <TextField fullWidth label="Street Address" margin="normal" value={location.address} onChange={e => setLocation({...location, address: e.target.value})} required />
            <TextField fullWidth label="City/Town" margin="normal" value={location.city} onChange={e => setLocation({...location, city: e.target.value})} required />
            <Select fullWidth displayEmpty value={location.region} onChange={e => setLocation({...location, region: e.target.value})} sx={{ mt: 2 }} required>
              <MenuItem value="" disabled>Select Region</MenuItem>
              {['Greater Accra','Ashanti','Western','Eastern','Central','Volta','Northern','Upper East','Upper West','Bono','Ahafo','Savannah','North East','Oti','Western North'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
            <TextField fullWidth label="Landmark (Optional)" margin="normal" value={location.landmark} onChange={e => setLocation({...location, landmark: e.target.value})} />
            <TextField fullWidth label="Phone Number" margin="normal" value={location.customer_phone} onChange={e => setLocation({...location, customer_phone: e.target.value})} required />
            <ScheduleSelector value={schedule} onChange={setSchedule} perDayAmount={total} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep < 2 && <Button variant="contained" onClick={handleNext} disabled={loading} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>Next</Button>}
        {activeStep === 2 && (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting} sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}>
            {submitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (usesScheduleEndpoint(schedule) ? 'Create Schedule' : 'Submit Request')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default CustomServiceModal
