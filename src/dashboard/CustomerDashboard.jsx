import React, { useState, useEffect, useCallback, useMemo } from 'react'
import BottomNav from '../common/BottomNav'
import { getPaymentSettings } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import RoleBasedTour from '../common/RoleBasedTour'
import { TourButton, customerTourSteps } from '../common/DemoTour'
import {
  getServices, createRequest, createSchedule, getMySchedules, pauseSchedule, resumeSchedule, cancelSchedule, getUserRequests, getNotifications, rateRequest,
  confirmRequestCompletion, getUnreadMessagesCount, getUnreadCount,
  getPercentages, cancelRequest
} from '../api/client'
import {
  Box, Drawer, Typography, IconButton, Grid, Card, CardContent,
  Button, Chip, TextField, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar,
  CircularProgress, Avatar, Tooltip, InputAdornment, Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Divider, LinearProgress
} from '@mui/material'
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, ShoppingBag as ServicesIcon,
  History as HistoryIcon, Settings as SettingsIcon,
  Refresh as RefreshIcon, Star as StarIcon, StarBorder as StarBorderIcon,
  LocationOn as LocationIcon, Message as MessageIcon, Search as SearchIcon,
  Phone as PhoneIcon, Close as CloseIcon,
  Home as HomeIcon, Build as BuildIcon, Person as PersonIcon,
  Event as EventIcon, PlayArrow as PlayArrowIcon, Pause as PauseIcon, Stop as StopIcon
} from '@mui/icons-material'
import PaymentFlier from '../common/PaymentFlier'
import CustomServiceModal from '../common/CustomServiceModal'
import ScheduleSelector, { defaultSchedule, usesScheduleEndpoint } from '../common/ScheduleSelector'
import Header from '../layout/Header'
import { DashboardSkeleton, ServicesGridSkeleton } from '../common/LoadingSkeleton'

const drawerWidth = 280

// Helper functions for localStorage persistence
const saveCustomerState = (key, value) => {
  localStorage.setItem(`customer_${key}`, JSON.stringify(value))
}

const loadCustomerState = (key, defaultValue) => {
  const saved = localStorage.getItem(`customer_${key}`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      return defaultValue
    }
  }
  return defaultValue
}

const saveLocationData = (userId, data) => {
  localStorage.setItem(`saved_location_${userId}`, JSON.stringify(data))
}

const loadLocationData = (userId) => {
  const saved = localStorage.getItem(`saved_location_${userId}`)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      return { address: '', city: '', region: '', landmark: '', customer_phone: '' }
    }
  }
  return { address: '', city: '', region: '', landmark: '', customer_phone: '' }
}

const CustomerDashboard = () => {
  const { user, updateUser } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  
  // Persist active tab across refresh
  const [activeTab, setActiveTab] = useState(() => loadCustomerState('activeTab', 0))
  
  const [services, setServices] = useState([])
  const [requests, setRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [percentages, setPercentages] = useState({
    provider_percent: 60,
    admin_percent: 20,
    site_fee_percent: 10,
    referral_pool_percent: 10
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState(null)
  const [openRequestModal, setOpenRequestModal] = useState(false)
  const [requestSchedule, setRequestSchedule] = useState(defaultSchedule)
  const [schedules, setSchedules] = useState([])
  const [scheduleActionLoading, setScheduleActionLoading] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [ratingLoading, setRatingLoading] = useState(null)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [customModalOpen, setCustomModalOpen] = useState(false)


  const bottomTabs = [
  { label: 'Home', icon: <HomeIcon />, tabIndex: 0 },
  { label: 'Services', icon: <BuildIcon />, tabIndex: 1 },
  { label: 'Scheduled', icon: <EventIcon />, tabIndex: 5 },
  { label: 'Messages', icon: <MessageIcon />, tabIndex: 3 },
  { label: 'Profile', icon: <PersonIcon />, tabIndex: 4 }
]
  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

    const [paymentSettings, setPaymentSettings] = useState({
    payment_number: '024 000 0000',
    momopay_number: '024 000 0000'
  })
  // Load saved location from localStorage
  const [locationData, setLocationData] = useState(() => ({
    ...loadLocationData(user?.id),
    customer_phone: user?.phone || ''
  }))

  // Save location when changed
  const handleLocationChange = (field, value) => {
    const newLocation = { ...locationData, [field]: value }
    setLocationData(newLocation)
    if (user?.id) {
      saveLocationData(user.id, newLocation)
    }
  }

  const pendingConfirmationCount = requests.filter(r => r.status === 'completed' && !r.customer_confirmed).length

  // Save active tab when changed
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    saveCustomerState('activeTab', tab)
    setSearchTerm('')
    // Close drawer on mobile when tab is selected
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  // Filtered data for search
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services
    const term = searchTerm.toLowerCase().trim()
    return services.filter(s => s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    )
  }, [services, searchTerm])

  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests
    const term = searchTerm.toLowerCase().trim()
    return requests.filter(r => r.service_name.toLowerCase().includes(term) ||
      r.location_address?.toLowerCase().includes(term) ||
      r.location_city?.toLowerCase().includes(term) ||
      r.location_region?.toLowerCase().includes(term)
    )
  }, [requests, searchTerm])

  // Load percentages
  const loadPercentages = useCallback(async () => {
    try {
      const res = await getPercentages()
      setPercentages(res.data)
    } catch (err) {
      console.error('Error loading percentages:', err)
    }
  }, [])

  const loadPaymentSettings = async () => {
  try {
    const res = await getPaymentSettings()
    setPaymentSettings(res.data)
  } catch (err) {
    console.error('Error loading payment settings:', err)
  }
}
  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Main data loading function
  const loadData = useCallback(async (showSpinner = true) => {
    if (!user?.id) return
    
    if (showSpinner) {
      setRefreshing(true) // ← Only show spinner on manual refresh
    }
    try {
      setLoading(false)
      const [servicesRes, requestsRes, notifRes, schedulesRes] = await Promise.all([
        getServices(true),
        getUserRequests(user.id),
        getNotifications(user.id),
        getMySchedules().catch(() => ({ data: [] }))
      ])
      setServices(servicesRes.data)
      setRequests(requestsRes.data)
      setNotifications(notifRes.data)
      setSchedules(schedulesRes.data || [])
      const totalSpentForUser = requestsRes.data.reduce((sum, r) => sum + r.amount, 0)
      setTotalSpent(totalSpentForUser)
    } catch (err) {
      console.error(err)
      if (showSpinner) {
        showToast('Error loading data', 'error')
      }
    } finally {
      if (showSpinner) {
        setRefreshing(false)
      }
    }
  }, [user?.id])

  // Load unread counts
  const loadUnreadCounts = useCallback(async () => {
    if (!user?.id) return
    try {
      const [msgRes, notifRes] = await Promise.all([
        getUnreadMessagesCount(user.id),
        getUnreadCount(user.id)
      ])
      setUnreadMessagesCount(msgRes.data.count)
      setUnreadNotificationsCount(notifRes.data.count)
    } catch (err) {
      console.error('Error loading unread counts:', err)
    }
  }, [user?.id])

  // ========== REALTIME EVENT HANDLERS ==========
  const handleRealtimeRefresh = useCallback(() => {
    console.log('CustomerDashboard: Realtime refresh triggered')
    loadData()
    loadUnreadCounts()
  }, [loadData, loadUnreadCounts])

  const handleRequestStatusChange = useCallback((event) => {
    console.log('📢 Request status changed:', event.detail)
    loadData()
    loadUnreadCounts()
  }, [loadData, loadUnreadCounts])

  const handleProviderAssigned = useCallback((event) => {
    console.log(' Provider assigned:', event.detail)
    loadData()
    loadUnreadCounts()
    showToast('A provider has been assigned to your request!', 'success')
  }, [loadData, loadUnreadCounts])

  const handleJobStarted = useCallback((event) => {
    console.log(' Job started:', event.detail)
    loadData()
    showToast('Your provider has started working on your request!', 'info')
  }, [loadData])

  const handleJobCompleted = useCallback((event) => {
    console.log('Job completed:', event.detail)
    loadData()
    showToast('Your provider has completed the service! Please confirm completion.', 'success')
  }, [loadData])

  const handleCustomerConfirmed = useCallback((event) => {
    console.log('Customer confirmed:', event.detail)
    loadData()
  }, [loadData])

  const handleNewNotification = useCallback((event) => {
    console.log('🔔 New notification:', event.detail)
    loadUnreadCounts()
    if (event.detail.type === 'success' || event.detail.type === 'job') {
      showToast(event.detail.message, event.detail.type)
    }
  }, [loadUnreadCounts])

  const handleMessageReceived = useCallback(() => {
    console.log('New message received')
    loadUnreadCounts()
  }, [loadUnreadCounts])

  const handlePercentagesUpdated = useCallback((event) => {
    console.log('📊 Percentages updated:', event.detail)
    setPercentages(event.detail)
    loadData()
  }, [loadData])

  // Set up all realtime event listeners
  useEffect(() => {
    window.addEventListener('service_created', handleRealtimeRefresh)
    window.addEventListener('service_updated', handleRealtimeRefresh)
    window.addEventListener('service_toggled', handleRealtimeRefresh)
    window.addEventListener('request_created', handleRealtimeRefresh)
    window.addEventListener('request_status_changed', handleRequestStatusChange)
    window.addEventListener('provider_assigned', handleProviderAssigned)
    window.addEventListener('job_started', handleJobStarted)
    window.addEventListener('job_completed', handleJobCompleted)
    window.addEventListener('customer_confirmed', handleCustomerConfirmed)
    window.addEventListener('new_notification', handleNewNotification)
    window.addEventListener('new_message_received', handleMessageReceived)
    window.addEventListener('message_delivered', handleMessageReceived)
    window.addEventListener('percentages_updated', handlePercentagesUpdated)

    return () => {
      window.removeEventListener('service_created', handleRealtimeRefresh)
      window.removeEventListener('service_updated', handleRealtimeRefresh)
      window.removeEventListener('service_toggled', handleRealtimeRefresh)
      window.removeEventListener('request_created', handleRealtimeRefresh)
      window.removeEventListener('request_status_changed', handleRequestStatusChange)
      window.removeEventListener('provider_assigned', handleProviderAssigned)
      window.removeEventListener('job_started', handleJobStarted)
      window.removeEventListener('job_completed', handleJobCompleted)
      window.removeEventListener('customer_confirmed', handleCustomerConfirmed)
      window.removeEventListener('new_notification', handleNewNotification)
      window.removeEventListener('new_message_received', handleMessageReceived)
      window.removeEventListener('message_delivered', handleMessageReceived)
      window.removeEventListener('percentages_updated', handlePercentagesUpdated)
    }
  }, [handleRealtimeRefresh, handleRequestStatusChange, handleProviderAssigned, handleJobStarted, handleJobCompleted, handleCustomerConfirmed, handleNewNotification, handleMessageReceived, handlePercentagesUpdated])

  // Fallback polling interval (15 seconds)
// Fallback polling interval (5 seconds for faster updates)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadData()
        loadUnreadCounts()
      }
    }, 5000) // Changed from 15000 to 5000
    return () => clearInterval(interval)
  }, [loadData, loadUnreadCounts])

  // Initial load
  useEffect(() => {
    if (!user?.id) {
      window.location.href = '/'
      return
    }
    
    loadData()
    loadUnreadCounts()
    loadPercentages()
    loadPaymentSettings()
  }, [user?.id, loadData, loadUnreadCounts, loadPercentages])

  const handleRequest = async () => {
    if (!locationData.address || !locationData.city || !locationData.region) {
      showToast('Please fill in your location details', 'error')
      return
    }
    if (!locationData.customer_phone) {
      showToast('Please enter your phone number', 'error')
      return
    }
    if (requestSchedule.schedule_type === 'one_time' && requestSchedule.range_mode === 'range' &&
        (!requestSchedule.start_date || !requestSchedule.end_date)) {
      showToast('Please pick a start and end date for the custom range', 'error')
      return
    }
    setActionLoading('request')
    try {
      const basePayload = {
        user_id: user.id,
        service_id: selectedService.id,
        location_address: locationData.address,
        location_city: locationData.city,
        location_region: locationData.region,
        location_landmark: locationData.landmark,
        customer_phone: locationData.customer_phone
      }
      let response
      if (!usesScheduleEndpoint(requestSchedule)) {
        response = await createRequest(basePayload)
        showToast('Request submitted successfully!', 'success')
      } else {
        const isCustomRange = requestSchedule.schedule_type === 'one_time' && requestSchedule.range_mode === 'range'
        response = await createSchedule({
          ...basePayload,
          schedule_type: requestSchedule.schedule_type,
          weekly_day: requestSchedule.schedule_type === 'weekly' ? requestSchedule.weekly_day : null,
          monthly_date: requestSchedule.schedule_type === 'monthly' ? requestSchedule.monthly_date : null,
          start_date: isCustomRange ? requestSchedule.start_date : null,
          end_date: isCustomRange
            ? requestSchedule.end_date
            : (requestSchedule.end_mode === 'date' && requestSchedule.end_date ? requestSchedule.end_date : null)
        })
        const totalAmount = response.data?.amount
        showToast(
          totalAmount != null
            ? `Scheduled successfully! Total: GH₵${totalAmount.toFixed(2)}`
            : 'Recurring service scheduled successfully!',
          'success'
        )
        setOpenRequestModal(false)
        setSelectedService(null)
        setRequestSchedule(defaultSchedule)
        loadData(false)
        setActionLoading(false)
        return
      }
      
      // Add to local state instantly
      const newRequest = {
        id: response.data.request_id,
        service_name: selectedService.name,
        amount: selectedService.total_price,
        period_days: 1,
        status: 'pending_approval',
        created_at: new Date().toISOString(),
        location_address: locationData.address,
        location_city: locationData.city,
        location_region: locationData.region
      }
      setRequests(prev => [newRequest, ...prev])
      
      setOpenRequestModal(false)
      setSelectedService(null)
      setRequestSchedule(defaultSchedule)
      
      // Background refresh
      loadData(false)
      
    } catch (err) {
      showToast(err.response?.data?.error || 'Error submitting request', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleScheduleAction = async (scheduleId, action) => {
    setScheduleActionLoading(scheduleId + '_' + action)
    try {
      if (action === 'pause') await pauseSchedule(scheduleId)
      else if (action === 'resume') await resumeSchedule(scheduleId)
      else if (action === 'cancel') {
        if (!window.confirm('Cancel this scheduled service? It will stop running.')) {
          setScheduleActionLoading(null)
          return
        }
        await cancelSchedule(scheduleId)
      }
      const res = await getMySchedules()
      setSchedules(res.data || [])
      showToast('Schedule updated', 'success')
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed', 'error')
    } finally {
      setScheduleActionLoading(null)
    }
  }

  const describeSchedule = (s) => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    if (s.schedule_type === 'daily') return 'Every day'
    if (s.schedule_type === 'weekly') return `Every ${days[s.weekly_day] || ''}`.trim()
    if (s.schedule_type === 'monthly') return `Day ${s.monthly_date} of each month`
    if (s.schedule_type === 'one_time' && (s.period_days || 1) > 1) return `Custom range · ${s.period_days} days`
    return 'One-time'
  }

  const handleRateRequest = async (requestId, rating) => {
    setRatingLoading(requestId)
    try {
      await rateRequest(requestId, rating)
      showToast('Thank you for your rating!')
      await loadData()
    } catch (err) {
      showToast('Error submitting rating', 'error')
    } finally {
      setRatingLoading(null)
    }
  }


  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    
    setActionLoading(requestId)
    try {
      await cancelRequest(requestId)
      showToast('Request cancelled successfully', 'success')
      
      // Update local state instantly
      setRequests(prev => prev.filter(req => req.id !== requestId))
      
      // Background refresh
      loadData(false)
      
    } catch (err) {
      showToast(err.response?.data?.error || 'Error cancelling request', 'error')
    } finally {
      setActionLoading(null)
    }
  }
  
  const handleConfirmCompletion = async (requestId) => {
    setActionLoading('confirm_' + requestId)
    try {
      await confirmRequestCompletion(requestId)
      showToast('Completion confirmed! Thank you for using Zivre!', 'success')
      
      // Update local state instantly
      setRequests(prev => prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'confirmed', customer_confirmed: true }
          : req
      ))
      
      // Background refresh
      loadData(false)
      
    } catch (err) {
      showToast(err.response?.data?.error || 'Error confirming completion', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusChip = (status) => {
    const config = {
      pending_approval: { label: ' Pending Approval', color: '#f59e0b', bg: '#fef3c7' },
      assigned: { label: ' Provider Assigned', color: '#8b5cf6', bg: '#ede9fe' },
      in_progress: { label: ' In Progress', color: '#ec4898', bg: '#fce7f3' },
      completed: { label: 'Completed - Awaiting Confirmation', color: '#f59e0b', bg: '#fef3c7' },
      confirmed: { label: 'Confirmed - Pay Provider', color: '#10b981', bg: '#d1fae5' }
    }
    const c = config[status] || { label: status, color: '#64748b', bg: '#f1f5f9' }
    return <Chip label={c.label} size="small" sx={{ bgcolor: c.bg, color: c.color, fontWeight: 500 }} />
  }

  const menuItems = [
    { label: ' Overview', icon: <DashboardIcon />, tab: 0, badge: 0 },
    { label: ' Available Services', icon: <ServicesIcon />, tab: 1, badge: 0 },
    { label: ' Scheduled Services', icon: <EventIcon />, tab: 5, badge: 0 },
    { label: ' Messages', icon: <MessageIcon />, tab: 3, badge: unreadMessagesCount, action: () => window.location.href = '/messages' },
    { label: ' Profile Settings', icon: <SettingsIcon />, tab: 4, badge: 0 },
  ]

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: 'white' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#10b981', width: 40, height: 40 }}>{user?.full_name?.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">{user?.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">Customer</Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: '#64748b' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Box sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <Button
            key={item.tab}
            startIcon={item.icon}
            onClick={() => {
              if (item.action) {
                item.action()
              } else {
                handleTabChange(item.tab)
              }
              setMobileOpen(false)
            }}
            fullWidth
            sx={{
              justifyContent: 'flex-start', mb: 0.5, py: 1.5, px: 2, borderRadius: 2,
              bgcolor: activeTab === item.tab ? '#e6f7f0' : 'transparent',
              color: activeTab === item.tab ? '#10b981' : '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            {item.label}
            {item.badge > 0 && (
              <Badge badgeContent={item.badge} color="error" sx={{ ml: 'auto' }} />
            )}
          </Button>
        ))}
      </Box>
    </Box>
  )

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <>
        <Header onGetQuote={scrollToContact} hideNavLinks={true} />
        <DashboardSkeleton />
      </>
    )
  }

  const activeRequestsCount = requests.filter(r => r.status !== 'confirmed').length
  const completedCount = requests.filter(r => r.status === 'confirmed').length

  return (
    <>
      <Header onGetQuote={scrollToContact} hideNavLinks={true} />
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f8f6' }}>
        <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <Alert severity={toast?.type} sx={{ borderRadius: 2 }}>{toast?.message}</Alert>
        </Snackbar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', top: '64px', height: 'calc(100vh - 64px)' } }}>
            {drawer}
          </Drawer>
          <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e2e8f0', bgcolor: 'white', top: '64px', height: 'calc(100vh - 64px)' } }}>
            {drawer}
          </Drawer>
        </Box>

          <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, pb: { xs: 8, md: 3 }, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton 
                    onClick={() => setMobileOpen(true)}
                    sx={{ 
                      bgcolor: '#10b981', 
                      color: 'white',
                      '&:hover': { bgcolor: '#059669' }
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: '#10b981',
                      cursor: 'pointer'
                    }}
                    onClick={() => setMobileOpen(true)}
                  >
                    MENU
                  </Typography>
                </Box>
              )}
              <Typography variant="h4" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 800, color: '#0a1f1a' }}>Customer Dashboard</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(activeTab === 1 || activeTab === 2) && (
                <TextField
                  size="small"
                  placeholder={activeTab === 1 ? "Search services..." : "Search requests by service or location..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#94a3b8' }} /> } }}
                  sx={{ width: isMobile ? 200 : 280, bgcolor: 'white', borderRadius: 2 }}
                />
              )}
              <IconButton onClick={() => loadData(true)} disabled={refreshing} sx={{ bgcolor: 'white' }}>
                {refreshing ? <CircularProgress size={24} sx={{ color: '#10b981' }} /> : <RefreshIcon />}
              </IconButton>
            </Box>
          </Box>

          <Card sx={{
            p: { xs: 2.5, md: 3.5 }, mb: 4, color: 'white', borderRadius: 4, position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, #0a1f1a 0%, #0f3b2c 55%, #10b981 160%)',
            boxShadow: '0 20px 50px -24px rgba(10,31,26,0.55)'
          }}>
            <Box sx={{ position: 'absolute', top: -40, right: -30, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }}>
                Welcome back, {user?.full_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82, mt: 0.5, mb: 2 }}>
                Track your services and manage your account
              </Typography>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap',
                bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 3, px: 2, py: 1.2, backdropFilter: 'blur(6px)'
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pay after service via MoMoPay:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                  {paymentSettings?.momopay_number || '024 000 0000'}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ display: 'block', opacity: 0.7, mt: 1 }}>
                Pay the provider only using this MoMoPay number.
              </Typography>
            </Box>
          </Card>

          <PaymentFlier />

          {activeTab === 0 && (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ p: 2.5, borderLeft: '4px solid #10b981' }}>
                    <Typography variant="body2" color="text.secondary">Total spent</Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 800, color: '#0f3b2c', mt: 0.5 }}>GH₵{totalSpent.toFixed(2)}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ p: 2.5, borderLeft: '4px solid #f59e0b' }}>
                    <Typography variant="body2" color="text.secondary">Active requests</Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 800, color: '#0a1f1a', mt: 0.5 }}>{activeRequestsCount}</Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ p: 2.5, borderLeft: '4px solid #3b82f6' }}>
                    <Typography variant="body2" color="text.secondary">Completed jobs</Typography>
                    <Typography variant="h4" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 800, color: '#0a1f1a', mt: 0.5 }}>{completedCount}</Typography>
                  </Card>
                </Grid>
              </Grid>
              <Card sx={{ p: 3, mb: 3, bgcolor: '#e0f2fe', borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1, color: '#0284c7' }}>
                  Referral Program
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When you refer friends and they complete their first service, you earn a commission from the <strong>Referral Pool ({percentages.referral_pool_percent || 0}%)</strong>.
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Typography variant="body2">
                     Share your referral code: <strong>{user?.referral_code}</strong>
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => window.location.href = '/referrals'}
                    sx={{ mt: 1, borderColor: '#0284c7', color: '#0284c7' }}
                  >
                    Go to Referrals →
                  </Button>
                </Box>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#0f172a' }}>Recent Activity</Typography>
                <Divider sx={{ mb: 2 }} />
                {requests.slice(0, 5).map((req, idx) => (
                  <Box key={req.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: idx < 4 ? '1px solid #e2e8f0' : 'none' }}>
                    <Box>
                      <Typography variant="body2"><strong>{req.service_name}</strong></Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(req.created_at).toLocaleDateString()}</Typography>
                    </Box>
                    {getStatusChip(req.status)}
                  </Box>
                ))}
                {requests.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>No recent activity</Typography>}
              </Card>
            </>
          )}

          {activeTab === 1 && (
            loading ? (
              <ServicesGridSkeleton />
            ) : (
              <>
                {filteredServices.length === 0 && searchTerm && (
                  <Alert severity="info" sx={{ mb: 2 }}>No services matching "{searchTerm}"</Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 3 }}>
                  <Button variant="contained" onClick={() => setCustomModalOpen(true)} sx={{ bgcolor: '#10b981', px: 4, py: 1.5 }}>
                    Request Customized Service
                  </Button>
                </Box>
                <Grid container spacing={3}>
                  {filteredServices.map(service => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Typography variant="h3">{service.icon}</Typography>
                            <Typography variant="h6" fontWeight="700">{service.name}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{service.description}</Typography>
                          <Typography variant="h5" fontWeight="700" sx={{ color: '#10b981' }}>GH₵{service.total_price}</Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => { setSelectedService(service); setOpenRequestModal(true) }}
                            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                          >
                             Request Service
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {filteredServices.length === 0 && !searchTerm && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No active services available at the moment.</Typography>
                )}
              </>
            )
          )}

          

          {activeTab === 3 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#0f172a' }}>Messages</Typography>
              <Typography variant="body2" color="text.secondary">Click the button below to go to your messages.</Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/messages'}
                sx={{ mt: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Go to Messages
              </Button>
            </Card>
          )}

          {activeTab === 4 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#0f172a' }}> Profile Settings</Typography>
              <Typography variant="body2" color="text.secondary">Click the button below to go to your profile settings page.</Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/profile'}
                sx={{ mt: 2, bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                Go to Profile Settings
              </Button>
            </Card>
          )}

          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 1, color: '#0f172a' }}>Scheduled Services</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Recurring requests run automatically. Pause, resume, or stop them anytime.
              </Typography>
              {schedules.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <EventIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    You have no scheduled services yet. Choose a frequency when requesting a service to set one up.
                  </Typography>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {schedules.map((s) => {
                    const statusColors = {
                      active: { color: '#10b981', bg: '#d1fae5', label: 'Active' },
                      paused: { color: '#f59e0b', bg: '#fef3c7', label: 'Paused' },
                      completed: { color: '#64748b', bg: '#f1f5f9', label: 'Completed' },
                      cancelled: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' }
                    }
                    const sc = statusColors[s.status] || statusColors.completed
                    const busy = (a) => scheduleActionLoading === s.id + '_' + a
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={s.id}>
                        <Card sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="700">{s.service_name}</Typography>
                            <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                          </Box>
                          <Typography variant="body2" color="text.secondary">{describeSchedule(s)}</Typography>
                          {(s.per_day_amount != null && s.total_amount != null) && (
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexWrap: 'wrap', mt: 0.75 }}>
                              <Typography variant="caption" color="text.secondary">
                                GH₵{s.per_day_amount.toFixed(2)} × {s.period_days || 1} day{(s.period_days || 1) > 1 ? 's' : ''} =
                              </Typography>
                              <Typography variant="body2" fontWeight="700" sx={{ color: '#059669' }}>
                                GH₵{s.total_amount.toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                          {s.next_run && s.status === 'active' && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Next run: {new Date(s.next_run).toLocaleDateString()}
                            </Typography>
                          )}
                          {s.end_date && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Ends: {new Date(s.end_date).toLocaleDateString()}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Times run: {s.runs_count}
                          </Typography>
                          {(s.status === 'active' || s.status === 'paused') && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                              {s.status === 'active' ? (
                                <Button size="small" variant="outlined" startIcon={busy('pause') ? <CircularProgress size={14} /> : <PauseIcon />}
                                  onClick={() => handleScheduleAction(s.id, 'pause')} disabled={!!scheduleActionLoading}
                                  sx={{ borderColor: '#f59e0b', color: '#f59e0b' }}>Pause</Button>
                              ) : (
                                <Button size="small" variant="outlined" startIcon={busy('resume') ? <CircularProgress size={14} /> : <PlayArrowIcon />}
                                  onClick={() => handleScheduleAction(s.id, 'resume')} disabled={!!scheduleActionLoading}
                                  sx={{ borderColor: '#10b981', color: '#10b981' }}>Resume</Button>
                              )}
                              <Button size="small" variant="outlined" color="error" startIcon={busy('cancel') ? <CircularProgress size={14} /> : <StopIcon />}
                                onClick={() => handleScheduleAction(s.id, 'cancel')} disabled={!!scheduleActionLoading}>Stop</Button>
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              )}
            </Box>
          )}

          {/* Request Modal */}
          <Dialog
            open={openRequestModal}
            onClose={() => setOpenRequestModal(false)}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: 3 }, maxHeight: { xs: '100%', sm: '90vh' } } } }}
          >
            <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
              Request {selectedService?.name}
            </DialogTitle>
            <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: { xs: 1, sm: 2 } }}>
                <Typography variant="h5" fontWeight="700" sx={{ color: '#10b981', fontSize: { xs: '1.4rem', sm: '1.5rem' } }}>
                  GH₵{selectedService?.total_price}
                </Typography>
                <Typography variant="body2" color="text.secondary">per day</Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                You will pay the provider directly after service completion. No online payment required.
              </Alert>
                  <Box sx={{ mb: 2, p: { xs: 1.25, sm: 1.5 }, bgcolor: '#e0f2fe', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="600" sx={{ color: '#0284c7', mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    Pay Using These Numbers
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5, fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                    <strong>Mobile Money:</strong> {paymentSettings?.payment_number || '024 000 0000'}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                    <strong>MoMoPay:</strong> {paymentSettings?.momopay_number || '024 000 0000'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Pay the provider directly after service is complete.
                  </Typography>
                </Box>
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Contact Information</Typography>
              <TextField
                fullWidth
                label="Your Phone Number"
                margin="normal"
                value={locationData.customer_phone}
                onChange={(e) => handleLocationChange('customer_phone', e.target.value)}
                required
                placeholder="e.g., 024XXXXXXX"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
              />
              
              <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1, mt: 2, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>Service Location</Typography>
              <TextField
                fullWidth
                label="Street Address"
                margin="normal"
                value={locationData.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                required
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationIcon sx={{ color: '#94a3b8' }} /></InputAdornment> } }}
              />
              <TextField
                fullWidth
                label="City/Town"
                margin="normal"
                value={locationData.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                required
              />
              <Select
                fullWidth
                displayEmpty
                value={locationData.region}
                onChange={(e) => handleLocationChange('region', e.target.value)}
                sx={{ mt: 2 }}
                required
              >
                <MenuItem value="" disabled>Select Region</MenuItem>
                {['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Bono', 'Ahafo', 'Savannah', 'North East', 'Oti', 'Western North'].map(r => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </Select>
              <TextField
                fullWidth
                label="Landmark (Optional)"
                margin="normal"
                value={locationData.landmark}
                onChange={(e) => handleLocationChange('landmark', e.target.value)}
              />
              <ScheduleSelector value={requestSchedule} onChange={setRequestSchedule} perDayAmount={selectedService?.total_price || 0} />
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
              <Button onClick={() => setOpenRequestModal(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleRequest}
                disabled={actionLoading === 'request'}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
              >
                {actionLoading === 'request' ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (usesScheduleEndpoint(requestSchedule) ? 'Create Schedule' : 'Submit Request')}
              </Button>
            </DialogActions>
          </Dialog>
          {isMobile && (
            <>
              <Box sx={{ height: '70px' }} /> {/* spacer */}
              <BottomNav 
                tabs={bottomTabs} 
                activeTab={activeTab} 
                onChange={handleTabChange} 
              />
            </>
          )}
        </Box>
      </Box>
      <RoleBasedTour />
      <TourButton tourSteps={customerTourSteps} title="Customer Dashboard Tour" />
      <CustomServiceModal open={customModalOpen} onClose={() => setCustomModalOpen(false)} onSubmitSuccess={() => { loadData(); setCustomModalOpen(false); }} />
    </>
  )
}

export default CustomerDashboard
