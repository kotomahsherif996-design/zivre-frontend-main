import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog, DialogContent, DialogActions,
  Button, Box, Typography, IconButton, LinearProgress, Fade, Grow,
  Menu, MenuItem, useMediaQuery, useTheme
} from '@mui/material'
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  KeyboardArrowLeft,
  UnfoldMore as UnfoldMoreIcon
} from '@mui/icons-material'
import TourIcon from './TourIcons'

// ============================================
// PER-USER TOUR PROGRESS (shared by DemoTour, TourButton, RoleBasedTour)
// Keyed by a "scopeId" (typically the user's id + role) so completion and
// resume progress never leak between different accounts on the same browser.
// ============================================
const storageKey = (scopeId) => `zivre_tour_progress_${scopeId}`

export const getTourProgress = (scopeId) => {
  if (!scopeId) return { step: 0, completed: false }
  try {
    const raw = localStorage.getItem(storageKey(scopeId))
    return raw ? JSON.parse(raw) : { step: 0, completed: false }
  } catch (e) {
    return { step: 0, completed: false }
  }
}

export const saveTourStep = (scopeId, step) => {
  if (!scopeId) return
  try {
    const current = getTourProgress(scopeId)
    localStorage.setItem(storageKey(scopeId), JSON.stringify({ ...current, step }))
  } catch (e) { /* ignore quota/availability errors */ }
}

export const markTourCompleted = (scopeId) => {
  if (!scopeId) return
  try {
    localStorage.setItem(storageKey(scopeId), JSON.stringify({ step: 0, completed: true }))
  } catch (e) { /* ignore */ }
}

const firstName = (fullName) => (fullName || '').trim().split(' ')[0] || ''

const DemoTour = ({ open, onClose, onComplete, steps, title = "Guided Tour", initialStep = 0, onStepChange, userName }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [activeStep, setActiveStep] = useState(initialStep)
  const [justFinished, setJustFinished] = useState(false)
  const [jumpMenuAnchor, setJumpMenuAnchor] = useState(null)
  const dotTrackRef = useRef(null)
  const isLastStep = activeStep === steps.length - 1
  const progressPct = steps.length > 1 ? Math.round(((activeStep + 1) / steps.length) * 100) : 100

  useEffect(() => {
    if (open) {
      setActiveStep(initialStep)
      setJustFinished(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Keep the active dot scrolled into view as steps change
  useEffect(() => {
    const track = dotTrackRef.current
    if (!track) return
    const activeDot = track.querySelector(`[data-step="${activeStep}"]`)
    if (activeDot) activeDot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeStep])

  const goToStep = useCallback((next) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, next))
    setActiveStep(clamped)
    if (onStepChange) onStepChange(clamped)
  }, [steps.length, onStepChange])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      setJustFinished(true)
      setTimeout(() => {
        if (onComplete) onComplete()
        setJustFinished(false)
      }, 1000)
    } else {
      goToStep(activeStep + 1)
    }
  }, [isLastStep, activeStep, goToStep, onComplete])

  const handleBack = useCallback(() => goToStep(activeStep - 1), [activeStep, goToStep])
  const handleSkip = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') handleSkip()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft' && activeStep > 0) handleBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, activeStep, handleNext, handleBack, handleSkip])

  const currentStep = steps[activeStep]
  const showGreeting = activeStep === 0 && !!userName

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, overflow: 'hidden' } }}
    >
      {/* ---------- Header ---------- */}
      <Box
        sx={{
          background: 'linear-gradient(120deg, #0a1f1a 0%, #0f3b2c 100%)',
          color: 'white',
          px: { xs: 2.25, sm: 3 },
          py: { xs: 1.75, sm: 2.25 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -50, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)', pointerEvents: 'none' }} />
        <Typography
          variant="subtitle1"
          sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 700, position: 'relative', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}
        >
          {title}
        </Typography>
        <IconButton onClick={handleSkip} size="small" sx={{ color: 'rgba(255,255,255,0.85)', position: 'relative' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPct}
        sx={{
          height: 3,
          bgcolor: 'rgba(16,185,129,0.15)',
          '& .MuiLinearProgress-bar': { bgcolor: '#10b981' }
        }}
      />

      {/* ---------- Step navigator: dot-track + jump menu ---------- */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          ref={dotTrackRef}
          sx={{
            display: 'flex',
            gap: 0.75,
            overflowX: 'auto',
            flex: 1,
            py: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          {steps.map((_, idx) => {
            const isActive = idx === activeStep
            const isPast = idx < activeStep
            return (
              <Box
                key={idx}
                data-step={idx}
                onClick={() => goToStep(idx)}
                sx={{
                  flexShrink: 0,
                  cursor: 'pointer',
                  width: isActive ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  bgcolor: isActive ? '#10b981' : isPast ? '#a7f3d0' : '#e2e8f0',
                  transition: 'width 0.2s ease, background-color 0.2s ease'
                }}
              />
            )
          })}
        </Box>
        <Button
          size="small"
          onClick={(e) => setJumpMenuAnchor(e.currentTarget)}
          endIcon={<UnfoldMoreIcon sx={{ fontSize: 16 }} />}
          sx={{
            flexShrink: 0,
            textTransform: 'none',
            color: '#5b6b66',
            fontSize: '0.72rem',
            fontWeight: 600,
            minWidth: 0,
            px: 1
          }}
        >
          {activeStep + 1}/{steps.length}
        </Button>
        <Menu
          anchorEl={jumpMenuAnchor}
          open={Boolean(jumpMenuAnchor)}
          onClose={() => setJumpMenuAnchor(null)}
          slotProps={{ paper: { sx: { maxHeight: 320, width: 280 } } }}
        >
          {steps.map((s, idx) => (
            <MenuItem
              key={idx}
              selected={idx === activeStep}
              onClick={() => { goToStep(idx); setJumpMenuAnchor(null) }}
              sx={{ fontSize: '0.85rem', gap: 1 }}
            >
              <Box sx={{ color: idx === activeStep ? '#10b981' : '#94a3b8', display: 'flex' }}>
                <TourIcon name={s.icon} size={16} />
              </Box>
              {s.title}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* ---------- Body ---------- */}
      <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, minHeight: { xs: 'auto', sm: 320 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Fade in={!justFinished} timeout={220} unmountOnExit>
          <Box sx={{ textAlign: 'center' }}>
            {showGreeting && (
              <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 700, mb: 0.75 }}>
                Hi {firstName(userName)} 👋
              </Typography>
            )}
            <Box
              sx={{
                width: { xs: 66, sm: 76 },
                height: { xs: 66, sm: 76 },
                borderRadius: '50%',
                mx: 'auto',
                mb: 2.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                background: 'radial-gradient(circle, rgba(16,185,129,0.16), rgba(16,185,129,0.04) 72%)',
                border: '1.5px solid rgba(16,185,129,0.3)'
              }}
            >
              <Box sx={{ color: '#059669', display: 'flex' }}>
                <TourIcon name={currentStep?.icon} size={isMobile ? 28 : 32} strokeWidth={1.7} />
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Sora","Inter",sans-serif',
                fontWeight: 700,
                mb: 1,
                color: '#0a1f1a',
                fontSize: { xs: '1.05rem', sm: '1.25rem' }
              }}
            >
              {currentStep?.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}
            >
              {currentStep?.description}
            </Typography>
            {currentStep?.tip && (
              <Box
                sx={{
                  mt: 2,
                  p: { xs: 1.5, sm: 1.75 },
                  bgcolor: '#f0fdf4',
                  borderRadius: 3,
                  border: '1px solid #d1fae5',
                  textAlign: 'left',
                  display: 'flex',
                  gap: 1.25,
                  alignItems: 'flex-start'
                }}
              >
                <Box sx={{ color: '#059669', flexShrink: 0, mt: 0.2 }}>
                  <TourIcon name="lightbulb" size={16} strokeWidth={2} />
                </Box>
                <Typography variant="caption" sx={{ color: '#0f3b2c', fontWeight: 500, lineHeight: 1.5 }}>
                  {currentStep.tip}
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>

        <Grow in={justFinished} timeout={350} unmountOnExit>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Box sx={{ color: '#10b981', display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <TourIcon name="checkCircle" size={56} strokeWidth={1.6} />
            </Box>
            <Typography variant="h6" fontWeight="700" sx={{ color: '#0a1f1a' }}>
              You're all set{userName ? `, ${firstName(userName)}` : ''}! 🎉
            </Typography>
          </Box>
        </Grow>
      </DialogContent>

      {/* ---------- Footer ---------- */}
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderTop: '1px solid #e9efec', gap: 0.5 }}>
        <Button onClick={handleSkip} sx={{ color: '#5b6b66', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Skip tour
        </Button>
        <Box sx={{ flex: 1 }} />
        <IconButton onClick={handleBack} disabled={activeStep === 0} size="small" sx={{ border: '1px solid #e2e8f0' }}>
          <KeyboardArrowLeft fontSize="small" />
        </IconButton>
        <Button
          onClick={handleNext}
          variant="contained"
          endIcon={isLastStep ? null : <NextIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#0f3b2c' },
            borderRadius: 2,
            px: 2.5,
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// ============================================
// HOMEPAGE TOUR
// ============================================
export const homepageTourSteps = [
  {
    title: 'Welcome to Zivre!',
    description: 'Zivre Facility Services provides professional facility management solutions across Ghana. From HVAC to Security, we handle it all.',
    icon: 'sparkles',
    tip: 'Click "Get Started" to create your free account today!'
  },
  {
    title: 'Browse Our Services',
    description: 'We offer 13+ professional services including HVAC, Electrical, Plumbing, Security, Cleaning, Fire Safety, Waste Management, Healthcare, and Hospitality.',
    icon: 'grid',
    tip: 'Click "View All Services" to see our complete service catalog.'
  },
  {
    title: 'Request a Free Quote',
    description: 'Fill out the contact form with your name, phone, email, service type, location, and message. Our team will respond within 24 hours.',
    icon: 'pen',
    tip: 'Scroll down to the contact section to request a free quote.'
  },
  {
    title: 'How It Works',
    description: '1. Sign up as a Customer or Provider.\n2. Customers request services (fixed or custom).\n3. Admin assigns a verified provider.\n4. Provider completes the job.\n5. Customer confirms completion & pays provider directly.',
    icon: 'flow',
    tip: '⚠️ IMPORTANT: Never pay before service is complete! Pay directly to the provider after they finish.'
  },
  {
    title: 'Referral Program – Earn Money!',
    description: 'Get your unique referral code after signing up. Share it with friends. When they complete their first service, YOU earn commissions! Referral earnings can be withdrawn to Mobile Money.',
    icon: 'gift',
    tip: 'Check the "Referrals" tab in your dashboard to see your code, earnings, and referral tree.'
  },
  {
    title: 'Messaging System',
    description: 'Once a provider is assigned to your request, you can message them directly via the Messages tab. Get real‑time updates about your service.',
    icon: 'chat',
    tip: 'A message icon now appears in the header for quick access (all logged‑in users).'
  },
  {
    title: 'For Service Providers',
    description: 'Sign up as a Provider, get verified by admin, and receive job assignments. Use the bottom navigation on mobile to quickly access available jobs, my jobs, earnings, messages, and profile.',
    icon: 'toolbox',
    tip: 'Providers earn a percentage of each job (set by admin). Customers pay you directly after service.'
  },
  {
    title: '24/7 Support',
    description: 'Need help? Contact us via WhatsApp, phone, or email. Our support team is available 24/7 to assist you.',
    icon: 'headset',
    tip: 'Check the green payment banner at the top for our WhatsApp number.'
  }
]

// ============================================
// CUSTOMER TOUR (15 steps – now includes Scheduling)
// ============================================
export const customerTourSteps = [
  {
    title: 'Welcome to Your Customer Dashboard!',
    description: 'This is your command center. From here, you can request services (fixed or custom), track requests, manage referrals, send messages, and more.',
    icon: 'sparkles',
    tip: 'Use the sidebar on desktop or the bottom navigation on mobile to switch sections.'
  },
  {
    title: 'Dashboard Overview',
    description: 'See your total spending, active requests, and completed jobs at a glance.',
    icon: 'bars',
    tip: 'Active requests are those waiting for admin approval, assignment, or completion.'
  },
  {
    title: 'Notifications',
    description: 'The bell icon shows notifications. You’ll be alerted when a provider is assigned, status changes, or when you receive messages.',
    icon: 'bell',
    tip: 'Red badge indicates unread notifications. Click to view them.'
  },
  {
    title: 'Messages',
    description: 'The message icon in the header (or sidebar) takes you to your conversations with providers and admin.',
    icon: 'chat',
    tip: 'Check messages regularly – providers may send updates about arrival times.'
  },
  {
    title: 'My Active Requests (Cart)',
    description: 'Click the shopping cart icon in the header. It shows all your active requests (pending, assigned, in progress, waiting confirmation). You can cancel pending requests here.',
    icon: 'cart',
    tip: 'Once a request is confirmed, it moves out of the cart (but you can still see it in your dashboard activity).'
  },
  {
    title: 'Available Services (Fixed Price)',
    description: 'Browse all active services with fixed prices. Click on any service to request it.',
    icon: 'grid',
    tip: 'Only active services (green badge) can be requested.'
  },
  {
    title: 'Request Customized Service',
    description: 'Click the "Request Customized Service" button. Choose a service category, then select components and quantities. The total price updates instantly.',
    icon: 'wand',
    tip: 'If you don’t see the component you need, contact support – admin can add more components.'
  },
  {
    title: 'Schedule Recurring Services',
    description: 'Need a service more than once? Choose Daily, Weekly, Monthly, or a Custom Date Range when requesting any service — fixed-price or customized. You\'ll see a clear breakdown (price per day × number of days) before you confirm.',
    icon: 'repeat',
    tip: 'Manage your active schedules anytime from the "Scheduled" tab — pause, resume, or stop them whenever you like.'
  },
  {
    title: 'Location & Phone',
    description: 'When requesting a service, fill in your location (address, city, region) and phone number. This information is saved for future requests.',
    icon: 'pin',
    tip: 'Providers use this location to reach you – double‑check for accuracy.'
  },
  {
    title: 'Payment Information',
    description: 'The green payment banner shows how to pay. You pay the provider DIRECTLY after service completion via Mobile Money or Cash. Never pay before service is done.',
    icon: 'wallet',
    tip: 'Tap the banner to see full payment instructions and WhatsApp support number.'
  },
  {
    title: 'Track Request Status',
    description: 'Monitor your request as it progresses (Pending → Assigned → In Progress → Completed → Confirmed). You will receive notifications when status changes.',
    icon: 'route',
    tip: 'When a provider is assigned, their name and phone number appear.'
  },
  {
    title: 'Cancel Request',
    description: 'You can cancel a request while it is in "Pending Approval" or "Assigned" status. Use the cancel button in the cart or request details.',
    icon: 'xCircle',
    tip: 'Cancelled requests cannot be restored – you will need to create a new request.'
  },
  {
    title: 'Confirm Completion & Pay',
    description: 'When the provider marks a job complete, click "Confirm Completion". Then pay the provider directly (cash or mobile money). After payment, the request is closed.',
    icon: 'checkCircle',
    tip: '⚠️ NEVER pay before confirming completion. Pay only after you verify the work is done.'
  },
  {
    title: 'Rate Your Provider',
    description: 'After confirming completion, you can rate your provider from 1 to 5 stars. Your feedback helps other customers.',
    icon: 'star',
    tip: 'Honest ratings help maintain quality service standards.'
  },
  {
    title: 'Referral Program & Withdrawal',
    description: 'Go to "Referrals" tab to see your unique code, referral tree, commission balance, and withdrawal history. Minimum withdrawal amount is set by admin (shown in the card).',
    icon: 'gift',
    tip: 'You can only withdraw when your balance reaches or exceeds the minimum threshold.'
  }
]

// ============================================
// PROVIDER TOUR (14 steps)
// ============================================
export const providerTourSteps = [
  {
    title: 'Welcome to Your Provider Dashboard!',
    description: 'View jobs assigned to you, update status, track earnings, and message customers. Use the bottom navigation on mobile for quick access.',
    icon: 'sparkles',
    tip: 'You must be verified by admin before you can receive job assignments.'
  },
  {
    title: 'Verification Status',
    description: 'Your profile card shows whether you are verified or pending. Admin must verify you first.',
    icon: 'shield',
    tip: 'Complete your profile to help admin verify you faster.'
  },
  {
    title: 'Notifications',
    description: 'The bell icon shows notifications about new job assignments, status updates, and messages.',
    icon: 'bell',
    tip: 'Check notifications regularly so you don\'t miss job assignments.'
  },
  {
    title: 'Your Specialization',
    description: 'Your profile shows your service specialization (e.g., HVAC, Electrical). You will only receive jobs matching your specialization.',
    icon: 'toolbox',
    tip: 'Contact admin if your specialization needs to be updated.'
  },
  {
    title: 'Available Jobs',
    description: 'When admin assigns you to a job, it appears in the "Available Jobs" tab. Only jobs matching your specialization appear here.',
    icon: 'search',
    tip: 'Check this tab regularly for new assignments.'
  },
  {
    title: 'Claim a Job',
    description: 'Click "Claim Job" to accept an assignment. Once claimed, the job moves to "My Jobs" tab and the customer is notified.',
    icon: 'checkCircle',
    tip: 'Contact the customer immediately after claiming to confirm your arrival time.'
  },
  {
    title: 'My Jobs',
    description: 'View all your active and completed jobs. Each job shows customer details, location, amount, and your expected earnings. Recurring jobs are marked with a "Recurring" tag.',
    icon: 'clipboard',
    tip: 'Click on any job to see full details, including custom components if the customer requested a custom service.'
  },
  {
    title: 'Update Job Status',
    description: 'Click "Start Job" when you begin working. Click "Mark Complete" when you finish. The customer must then confirm and pay you.',
    icon: 'refresh',
    tip: 'Always update status so customers know your progress.'
  },
  {
    title: 'Decline a Job',
    description: 'If you cannot complete a job, click "Decline Job" and provide a reason. The job will be reassigned to another provider.',
    icon: 'xCircle',
    tip: 'Only decline if absolutely necessary – it affects your reliability rating.'
  },
  {
    title: 'Messages',
    description: 'Use Messages to communicate with customers assigned to you. Keep them updated on your arrival and progress. You can also message admin.',
    icon: 'chat',
    tip: 'Good communication leads to better ratings and more job assignments!'
  },
  {
    title: 'Getting Paid',
    description: 'After you mark complete and the customer confirms, you receive payment DIRECTLY from the customer (cash or mobile money).',
    icon: 'wallet',
    tip: 'Your earnings are shown in the Earnings Overview tab. Discuss payment method with the customer before starting.'
  },
  {
    title: 'Earnings Overview',
    description: 'See your total earnings, rating, job history, and the commission rate (set by admin). Higher ratings lead to more assignments.',
    icon: 'bars',
    tip: 'Complete jobs on time and communicate well to get 5‑star ratings.'
  },
  {
    title: 'Withdrawal & Commissions',
    description: 'Your earnings are not held by the platform – you are paid directly. The Earnings Overview shows your history and the percentage you keep.',
    icon: 'wallet',
    tip: 'If you have any issues with payment, contact support immediately.'
  },
  {
    title: 'Profile Settings',
    description: 'Update your personal information, change your password, or delete your account.',
    icon: 'gear',
    tip: 'Keep your phone number updated – customers need to reach you!'
  }
]

// ============================================
// ADMIN TOUR (20 steps – now includes Scheduled Services)
// ============================================
export const adminTourSteps = [
  {
    title: 'Welcome to Admin Control Center!',
    description: 'Complete management dashboard for services, users, requests, referrals, messages, and system settings.',
    icon: 'crown',
    tip: 'Use the sidebar to navigate between sections.'
  },
  {
    title: 'Dashboard Overview',
    description: 'Key metrics: Total Users, Revenue, Admin Fees, Site Fees, Provider Payouts, Pending Approvals, Active Services, Comments.',
    icon: 'bars',
    tip: 'The pending approval count shows requests waiting for provider assignment.'
  },
  {
    title: 'Notifications',
    description: 'System notifications about new requests, assignments, withdrawals, and more.',
    icon: 'bell',
    tip: 'Red badge indicates unread notifications.'
  },
  {
    title: 'Messages',
    description: 'Message any user (customers, providers). Useful for dispute resolution or support.',
    icon: 'chat',
    tip: 'Messages are real‑time; use them to resolve issues quickly.'
  },
  {
    title: 'Service Management',
    description: 'Add, edit, or deactivate services. Prices and percentages are automatically updated when you change global settings.',
    icon: 'toolbox',
    tip: 'Only active services are visible to customers.'
  },
  {
    title: 'Service Components (New)',
    description: 'Under “Service Components” tab, you can add components to each service (e.g., Electrical → “Replace bulb”). Customers can then build custom requests.',
    icon: 'puzzle',
    tip: 'Components allow dynamic pricing – customers choose quantities and get a total price.'
  },
  {
    title: 'Percentage Settings',
    description: 'Set provider %, admin %, site fee %, and referral pool %. Total must be 100%. Changing these recalculates all service payouts.',
    icon: 'percent',
    tip: 'Example: Provider 50%, Admin 20%, Site 10%, Referral Pool 20% = 100%'
  },
  {
    title: 'User Management',
    description: 'View all users, filter by role, verify providers, suspend or delete accounts. Click “View Full Details” for more info.',
    icon: 'users',
    tip: 'Providers must be verified before they can claim jobs.'
  },
  {
    title: 'Verify Providers',
    description: 'Click the verify icon next to an unverified provider. They will be notified and can start accepting jobs.',
    icon: 'userCheck',
    tip: 'Only verify after confirming their credentials.'
  },
  {
    title: 'Quote Requests',
    description: 'Quote requests from the homepage contact form. Update status: Pending → Contacted → Closed.',
    icon: 'doc',
    tip: 'Respond quickly to convert leads to customers.'
  },
  {
    title: 'Assign Providers',
    description: 'Match customer requests (both fixed and custom) with verified providers. Only providers with matching specialization appear.',
    icon: 'target',
    tip: 'You can see the components requested in custom service requests before assigning.'
  },
  {
    title: 'Assigned Jobs',
    description: 'Monitor jobs in progress. Use “Notify Customer” if a provider is delayed.',
    icon: 'clipboard',
    tip: 'Keep track of active jobs to ensure timely completion.'
  },
  {
    title: 'Comments Moderation',
    description: 'Approve, hide, or delete user comments and reviews. Keep the community clean.',
    icon: 'chat',
    tip: 'Approve genuine reviews quickly to build trust.'
  },
  {
    title: 'Payment Settings',
    description: 'Update payment numbers displayed on the payment banner (Mobile Money, MoMoPay, WhatsApp support).',
    icon: 'gear',
    tip: 'Also here you can set the minimum withdrawal amount for referral earnings.'
  },
  {
    title: 'Withdrawal Threshold',
    description: 'Inside Payment Settings, you can change the minimum amount users must reach before requesting a withdrawal (default 20 GHS).',
    icon: 'wallet',
    tip: 'Users see this threshold in their referral dashboard and cannot withdraw below it.'
  },
  {
    title: 'Scheduled Services',
    description: 'The "Scheduled Services" tab lists every recurring booking across all customers — frequency, next run time, and full price breakdown (per day × days). Spawned requests appear automatically in "Assign Providers."',
    icon: 'repeat',
    tip: 'Use the Active / Paused / Cancelled / Completed filter at the top — it opens on Active by default.'
  },
  {
    title: 'Referral System – Pending Withdrawals',
    description: 'Go to “Referral Admin” tab. Review pending withdrawal requests, verify details, and mark as sent once you transfer the money.',
    icon: 'wallet',
    tip: 'Always verify account details before marking as sent.'
  },
  {
    title: 'Referral System – Pending Bookings',
    description: 'Bookings awaiting customer confirmation. When they confirm, referral commissions are automatically processed.',
    icon: 'clipboard',
    tip: 'Commissions are calculated based on the global referral pool percentage.'
  },
  {
    title: 'Referral Tree Viewer',
    description: 'Search any user by ID to see their complete referral tree (who they invited and their balances).',
    icon: 'tree',
    tip: 'Useful for debugging or seeing top referrers.'
  },
  {
    title: 'All Requests History',
    description: 'Complete history of all service requests. You can reject pending requests or permanently delete them.',
    icon: 'doc',
    tip: 'Deleting a request is permanent – use with caution.'
  }
]

// ============================================
// TOUR BUTTON COMPONENT
// Per-user aware: resumes from the last step the user reached, and — when
// used by a logged-in user — greets them by name on the first step.
// ============================================
export const TourButton = ({ tourSteps, title = "Guided Tour", scopeId, userName }) => {
  const [tourOpen, setTourOpen] = useState(false)
  const [resumeStep, setResumeStep] = useState(0)

  const handleStartTour = () => {
    if (scopeId) {
      const progress = getTourProgress(scopeId)
      setResumeStep(progress.completed ? 0 : (progress.step || 0))
    } else {
      setResumeStep(0)
    }
    setTourOpen(true)
  }

  const handleCloseTour = () => setTourOpen(false)

  const handleCompleteTour = () => {
    if (scopeId) markTourCompleted(scopeId)
    setTourOpen(false)
  }

  const handleStepChange = (step) => {
    if (scopeId) saveTourStep(scopeId, step)
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<Box sx={{ display: 'flex' }}><TourIcon name="sparkles" size={17} strokeWidth={2} /></Box>}
        onClick={handleStartTour}
        sx={{ 
          bgcolor: '#10b981', 
          color: 'white',
          '&:hover': { bgcolor: '#059669' },
          position: 'fixed',
          bottom: { xs: 75, sm: 20 },
          right: { xs: 16, sm: 20 },
          zIndex: 1100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: 8,
          px: { xs: 1.5, sm: 2 },
          py: { xs: 0.75, sm: 1 },
          textTransform: 'none',
          fontWeight: 600,
          fontSize: { xs: '0.8rem', sm: '0.9rem' }
        }}
      >
        Start Tour
      </Button>
      
      <DemoTour 
        open={tourOpen} 
        onClose={handleCloseTour}
        onComplete={handleCompleteTour}
        onStepChange={handleStepChange}
        initialStep={resumeStep}
        steps={tourSteps}
        title={title}
        userName={userName}
      />
    </>
  )
}

export default DemoTour
