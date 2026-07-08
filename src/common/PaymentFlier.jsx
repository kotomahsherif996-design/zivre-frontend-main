import React, { useState, useEffect, useCallback } from 'react'
import {
  Box, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Stack, IconButton, Chip, useMediaQuery, useTheme
} from '@mui/material'
import { WhatsApp, Close, ContentCopy as ContentCopyIcon } from '@mui/icons-material'
import { getPaymentSettings } from '../api/client'
import TourIcon from './TourIcons'

const USSD_STEPS = [
  { title: "Dial your network's code", detail: 'MTN: *170#  ·  Vodafone: *110#  ·  AirtelTigo: *110#, then select "Send Money"' },
  { title: 'Select "MoMoPay"', detail: 'Choose the MoMoPay option from the menu' },
  { title: 'Enter the MoMoPay number', detail: null, highlight: 'momopay' },
  { title: 'Enter the exact amount', detail: 'Use the amount shown for your service' },
  { title: 'Enter a reference (optional)', detail: null },
  { title: 'Enter your Mobile Money PIN', detail: 'This confirms the transfer' },
  { title: 'Screenshot the confirmation', detail: 'Keep it as your proof of payment' }
]

const PaymentFlier = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState('')

  // Load from localStorage IMMEDIATELY (synchronous, no delay, no spinner)
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('payment_settings')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        return {
          payment_number: '024 000 0000',
          momopay_number: '024 000 0000',
          support_number: '050 000 0000',
          whatsapp_number: '233500000000'
        }
      }
    }
    return {
      payment_number: '024 000 0000',
      momopay_number: '024 000 0000',
      support_number: '050 000 0000',
      whatsapp_number: '233500000000'
    }
  })

  const loadSettings = useCallback(async () => {
    // Check cache age - only fetch if older than 5 minutes
    const lastFetched = localStorage.getItem('payment_settings_fetched')
    if (lastFetched && Date.now() - parseInt(lastFetched) < 300000) {
      return // Use cached data, no API call, no spinner
    }
    try {
      const res = await getPaymentSettings()
      setSettings(res.data)
      localStorage.setItem('payment_settings', JSON.stringify(res.data))
      localStorage.setItem('payment_settings_fetched', Date.now().toString())
    } catch (err) {
      console.error('Failed to load payment settings:', err)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // WebSocket real-time updates (KEEPS real-time functionality)
  useEffect(() => {
    const handlePaymentSettingsUpdated = (event) => {
      setSettings(event.detail)
      localStorage.setItem('payment_settings', JSON.stringify(event.detail))
      localStorage.setItem('payment_settings_fetched', Date.now().toString())
    }
    window.addEventListener('payment_settings_updated', handlePaymentSettingsUpdated)
    return () => window.removeEventListener('payment_settings_updated', handlePaymentSettingsUpdated)
  }, [])

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <>
      {/* ---------- Ticker banner ---------- */}
      <Card
        onClick={() => setOpen(true)}
        sx={{
          mb: 2,
          borderRadius: 2,
          bgcolor: '#0f3b2c',
          color: 'white',
          cursor: 'pointer',
          transition: 'transform 0.2s, background-color 0.2s',
          '&:hover': { bgcolor: '#134634', transform: 'scale(1.005)' },
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* edge fades so the scrolling text doesn't cut off harshly */}
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, background: 'linear-gradient(90deg, #0f3b2c, transparent)', zIndex: 1, pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 24, background: 'linear-gradient(270deg, #0f3b2c, transparent)', zIndex: 1, pointerEvents: 'none' }} />
        <CardContent sx={{ p: '10px !important', display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ color: '#34d399', display: 'flex', flexShrink: 0 }}>
            <TourIcon name="wallet" size={18} strokeWidth={2} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              animation: 'zv-ticker 20s linear infinite',
              whiteSpace: 'nowrap',
              '@keyframes zv-ticker': {
                '0%': { transform: 'translateX(100%)' },
                '100%': { transform: 'translateX(-100%)' }
              },
              '&:hover': { animationPlayState: 'paused' }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Tap here for payment info →
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <strong>Momo:</strong> {settings.payment_number}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <strong>MoMoPay:</strong> {settings.momopay_number}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <strong>Works with:</strong> MTN · Vodafone · AirtelTigo
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              <strong>Need help?</strong> WhatsApp {settings.support_number}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* ---------- How to Pay modal ---------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: { xs: 0, sm: 4 }, overflow: 'hidden' } }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(120deg, #0a1f1a 0%, #0f3b2c 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 1.75, sm: 2.25 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -50, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)', pointerEvents: 'none' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, position: 'relative' }}>
            <TourIcon name="wallet" size={20} strokeWidth={1.8} />
            <Typography variant="h6" sx={{ fontFamily: '"Sora","Inter",sans-serif', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
              How to Pay
            </Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} size="small" sx={{ color: 'rgba(255,255,255,0.85)', position: 'relative' }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2.5}>
            {/* Important notice */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.25,
                p: { xs: 1.5, sm: 1.75 },
                bgcolor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 3
              }}
            >
              <Box sx={{ color: '#d97706', flexShrink: 0, mt: 0.2 }}>
                <TourIcon name="shield" size={18} strokeWidth={1.9} />
              </Box>
              <Typography variant="body2" sx={{ color: '#78350f', lineHeight: 1.55, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                <strong>Pay after service, not before.</strong> You'll pay the provider directly once the job is
                complete, using only the MoMoPay number below.
              </Typography>
            </Box>

            {/* Primary payment number */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                border: '1px solid #bbf7d0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, color: '#059669', mb: 0.5 }}>
                <TourIcon name="phone" size={14} strokeWidth={2} />
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  Mobile Money
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{ color: '#059669', fontFamily: 'monospace', letterSpacing: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                {settings.payment_number}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleCopy(settings.payment_number, 'momo')}
                sx={{ mt: 1, fontWeight: 700, color: '#059669', textTransform: 'none' }}
              >
                {copied === 'momo' ? 'Copied!' : 'Copy number'}
              </Button>
            </Box>

            {/* MoMoPay alternative */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                border: '1px solid #bfdbfe'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, color: '#0369a1', mb: 0.5 }}>
                <TourIcon name="wallet" size={14} strokeWidth={2} />
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  MoMoPay (Alternative)
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight="800"
                sx={{ color: '#0284c7', fontFamily: 'monospace', letterSpacing: 1, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                {settings.momopay_number}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleCopy(settings.momopay_number, 'alt')}
                sx={{ mt: 1, fontWeight: 700, color: '#0284c7', textTransform: 'none' }}
              >
                {copied === 'alt' ? 'Copied!' : 'Copy number'}
              </Button>
            </Box>

            {/* Accepted payment methods */}
            <Box>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, color: '#0f172a', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                Accepted payment methods
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="MTN Mobile Money" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
                <Chip label="Vodafone Cash" size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontWeight: 600 }} />
                <Chip label="AirtelTigo Money" size="small" sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontWeight: 600 }} />
                <Chip label="Cash" size="small" sx={{ bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600 }} />
              </Box>
            </Box>

            {/* USSD step-by-step timeline */}
            <Box sx={{ p: { xs: 1.75, sm: 2.25 }, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 2, color: '#0f172a', fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                Pay with MoMoPay (USSD method)
              </Typography>
              <Box>
                {USSD_STEPS.map((step, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 24, height: 24, borderRadius: '50%',
                          bgcolor: '#059669', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0
                        }}
                      >
                        {idx + 1}
                      </Box>
                      {idx < USSD_STEPS.length - 1 && (
                        <Box sx={{ width: '2px', flex: 1, bgcolor: '#d1fae5', minHeight: 18, my: 0.25 }} />
                      )}
                    </Box>
                    <Box sx={{ pb: idx < USSD_STEPS.length - 1 ? 1.75 : 0 }}>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#0f172a', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {step.title}
                      </Typography>
                      {step.highlight === 'momopay' ? (
                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700, fontFamily: 'monospace', mt: 0.25 }}>
                          {settings.momopay_number}
                        </Typography>
                      ) : step.detail ? (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}>
                          {step.detail}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, p: 1.25, bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2 }}>
                <Box sx={{ color: '#d97706', flexShrink: 0 }}>
                  <TourIcon name="lightbulb" size={15} strokeWidth={2} />
                </Box>
                <Typography variant="caption" sx={{ color: '#78350f', lineHeight: 1.5 }}>
                  Pay <strong>after</strong> the service is completed — never before.
                </Typography>
              </Box>
            </Box>

            {/* WhatsApp support */}
            <Box
              sx={{
                p: 1.5,
                bgcolor: '#25D366',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white',
                flexWrap: 'wrap'
              }}
            >
              <WhatsApp sx={{ fontSize: 20 }} />
              <Typography variant="body2" fontWeight="700" sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                WhatsApp Support: {settings.support_number}
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: 'white', color: '#25D366', ml: 'auto', '&:hover': { bgcolor: '#f0f0f0' }, fontWeight: 700, textTransform: 'none' }}
                onClick={() => window.open(`https://wa.me/${settings.whatsapp_number}`, '_blank')}
              >
                Chat with us
              </Button>
            </Box>

            {/* Final note */}
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', lineHeight: 1.5 }}>
              Zivre does not collect payments. You pay the provider directly after the service is complete.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2 }, borderTop: '1px solid #e9efec' }}>
          <Button
            onClick={() => setOpen(false)}
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, fontWeight: 700, borderRadius: 2, py: 1 }}
          >
            Got it, thanks
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default PaymentFlier
