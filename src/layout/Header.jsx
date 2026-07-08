import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import RoleModal from '../common/RoleModal'
import AuthModal from '../common/AuthModal'
import NotificationDropdown from '../common/NotificationDropdown'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ShareIcon from '@mui/icons-material/Share'
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem, Divider,
  Typography, IconButton, Tooltip, useMediaQuery, Drawer, List,
  ListItem, ListItemIcon, ListItemText, Badge, useTheme
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import MessageIcon from '@mui/icons-material/Message'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import QuoteIcon from '@mui/icons-material/FormatQuote'
import PersonIcon from '@mui/icons-material/Person'
import { getUserRequests } from '../api/client'

const Header = ({ onGetQuote, hideNavLinks = false }) => {
  const { user, logout } = useAuth()
  const theme = useTheme()
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // === CART BADGE STATE ===
  const [activeRequestCount, setActiveRequestCount] = useState(0)

  const blurActiveElement = () => {
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur()
    }
  }

  // Helper function to get correct referrals URL based on role
  const getReferralsUrl = () => {
    if (!user) return '/'
    if (user.role === 'admin') return '/admin/referrals'
    return '/referrals'
  }

  const getReferralsButtonText = () => {
    if (!user) return 'Referrals'
    if (user.role === 'admin') return 'Referral Admin'
    return 'Referrals'
  }

  const handleReferralsClick = () => {
    blurActiveElement()
    window.location.href = getReferralsUrl()
  }

  const handleGetStarted = () => {
    blurActiveElement()
    setShowRoleModal(true)
  }

  const handleBookService = () => {
    blurActiveElement()
    setShowRoleModal(true)
  }

  const handleSignIn = () => {
    blurActiveElement()
    setShowSignInModal(true)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    blurActiveElement()
    setAnchorEl(null)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleRoleSelect = (role) => {
    blurActiveElement()
    setSelectedRole(role)
    setShowRoleModal(false)
    // Check for referral code in sessionStorage
    const referralCode = sessionStorage.getItem('zivre_referral_code')
    setShowSignUpModal(true)
  }

  const handleAuthSuccess = (loggedInUser) => {
    blurActiveElement()
    setShowSignUpModal(false)
    setShowSignInModal(false)
    if (loggedInUser.role === 'customer') {
      window.location.href = '/customer/dashboard'
    } else if (loggedInUser.role === 'provider') {
      window.location.href = '/provider/dashboard'
    } else if (loggedInUser.role === 'admin') {
      window.location.href = '/admin/dashboard'
    } else {
      window.location.href = '/'
    }
  }

  const handleSwitchToSignIn = () => {
    blurActiveElement()
    setShowSignUpModal(false)
    setShowSignInModal(true)
  }

  const handleSwitchToSignUp = (role = 'customer') => {
    blurActiveElement()
    setShowSignInModal(false)
    setSelectedRole(role)
    setShowSignUpModal(true)
  }

  const getDashboardUrl = () => {
    if (!user) return '/'
    if (user.role === 'customer') return '/customer/dashboard'
    if (user.role === 'provider') return '/provider/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/'
  }

  const navItems = [
    { label: 'Services', icon: <HomeIcon />, action: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'About', icon: <InfoIcon />, action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Get Quote', icon: <QuoteIcon />, action: onGetQuote },
  ]

  // Fetch active request count for the cart badge
  const fetchActiveRequestCount = async () => {
    if (!user || user.role !== 'customer') return
    try {
      const res = await getUserRequests(user.id)
      const active = res.data.filter(r => !['confirmed', 'cancelled_by_customer', 'rejected_by_admin', 'declined_by_provider'].includes(r.status))
      setActiveRequestCount(active.length)
    } catch (err) {
      console.error('Error fetching active requests count:', err)
    }
  }

  // Initial fetch and real-time event listeners
  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchActiveRequestCount()
    }
  }, [user])

  useEffect(() => {
    const handleRefresh = () => fetchActiveRequestCount()
    if (user && user.role === 'customer') {
      window.addEventListener('new_request', handleRefresh)
      window.addEventListener('request_status_changed', handleRefresh)
      window.addEventListener('request_created', handleRefresh)
      window.addEventListener('provider_assigned', handleRefresh)
      window.addEventListener('job_started', handleRefresh)
      window.addEventListener('job_completed', handleRefresh)
      window.addEventListener('customer_confirmed', handleRefresh)
      return () => {
        window.removeEventListener('new_request', handleRefresh)
        window.removeEventListener('request_status_changed', handleRefresh)
        window.removeEventListener('request_created', handleRefresh)
        window.removeEventListener('provider_assigned', handleRefresh)
        window.removeEventListener('job_started', handleRefresh)
        window.removeEventListener('job_completed', handleRefresh)
        window.removeEventListener('customer_confirmed', handleRefresh)
      }
    }
  }, [user])

  // Listen for custom event from Hero button (Get Started)
  useEffect(() => {
    const handleOpenGetStarted = () => {
      setTimeout(() => {
        handleBookService()
      }, 50)
    }
    window.addEventListener('open_get_started_modal', handleOpenGetStarted)
    return () => {
      window.removeEventListener('open_get_started_modal', handleOpenGetStarted)
    }
  }, [])

  // Listen for custom event from Hero button (Sign In)
  useEffect(() => {
    const handleOpenSignIn = () => {
      setTimeout(() => {
        handleSignIn()
      }, 50)
    }
    window.addEventListener('open_signin_modal', handleOpenSignIn)
    return () => {
      window.removeEventListener('open_signin_modal', handleOpenSignIn)
    }
  }, [])

  // ===== DRAWER CONTENT (width fixed, brand visible) =====
  const drawer = (
    <Box sx={{ width: { xs: 280, sm: 300 }, p: 2.5 }} role="presentation">
      <Typography 
        variant="h5" 
        sx={{ 
          fontWeight: 800, 
          color: '#10b981', 
          mb: 2,
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
        }}
      >
        ZIVRE
      </Typography>
      <List>
        {!hideNavLinks && navItems.map((item) => (
          <ListItem 
            key={item.label} 
            onClick={() => { 
              blurActiveElement()
              item.action(); 
              setMobileOpen(false); 
            }}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon sx={{ color: '#10b981' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {user ? (
          <>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                window.location.href = '/'; 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Homepage" />
            </ListItem>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                window.location.href = getDashboardUrl(); 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                window.location.href = getReferralsUrl(); 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><ShareIcon /></ListItemIcon>
              <ListItemText primary={getReferralsButtonText()} />
            </ListItem>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                window.location.href = '/messages'; 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><MessageIcon /></ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItem>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                window.location.href = '/profile'; 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Profile Settings" />
            </ListItem>
            <ListItem 
              onClick={() => { 
                blurActiveElement()
                logout(); 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem 
              onClick={() => { 
                handleSignIn(); 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Sign In" />
            </ListItem>
            <ListItem 
              onClick={() => { 
                handleGetStarted(); 
                setMobileOpen(false); 
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Get Started" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          background: 'linear-gradient(120deg, #0a1f1a 0%, #0f3b2c 100%)',
          borderBottom: '2px solid #10b981',
          boxShadow: '0 2px 12px -4px rgba(10,31,26,0.35)',
          zIndex: theme.zIndex.drawer + 1, // ensures header stays above drawer
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
          
          {/* ===== LEFT SIDE: Logo & Brand ===== */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* LEFT HAMBURGER REMOVED – only one on the right */}
            <Box 
              sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} 
              onClick={() => window.location.href = '/'}
            >
              <img 
                src="/logo.jpg" 
                alt="Zivre Logo" 
                style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
              />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Sora", "Inter", sans-serif', 
                  fontWeight: 800, 
                  letterSpacing: '0.04em', 
                  color: '#ffffff',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                }}
              >
                ZIVRE
                {!isMobile && (
                  <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.01em' }}>
                    {" "}Facility Services
                  </span>
                )}
              </Typography>
            </Box>
          </Box>

          {/* ===== RIGHT SIDE: Icons and nav ===== */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notification Bell */}
            {user && <NotificationDropdown />}
            
            {/* Messages */}
            {user && (
              <IconButton onClick={() => window.location.href = '/messages'} sx={{ color: 'white' }}>
                <MessageIcon />
              </IconButton>
            )}
            
            {/* Cart (customer only) */}
            {user && user.role === 'customer' && (
              <Badge badgeContent={activeRequestCount} color="error" invisible={activeRequestCount === 0}>
                <IconButton onClick={() => window.dispatchEvent(new CustomEvent('open_cart_drawer'))} sx={{ color: 'white' }}>
                  <ShoppingCartIcon />
                </IconButton>
              </Badge>
            )}

            {/* ===== REFERRAL ICON (logged-in users) ===== */}
            {user && (
              <Tooltip title="Referrals">
                <IconButton onClick={handleReferralsClick} sx={{ color: 'white' }}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {/* ===== DESKTOP ONLY ===== */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {!hideNavLinks && navItems.map((item) => (
                  <Button key={item.label} onClick={() => {
                    blurActiveElement()
                    item.action()
                  }} sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, borderRadius: 999, px: 1.8, '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', color: '#ffffff' } }}>
                    {item.label}
                  </Button>
                ))}
                {user ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button 
                      onClick={handleReferralsClick}
                      sx={{ color: '#6ee7b7', fontWeight: 500, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      startIcon={<ShareIcon />}
                    >
                      {getReferralsButtonText()}
                    </Button>
                    <Tooltip title="Account">
                      <Avatar 
                        sx={{ bgcolor: '#ffffff', color: '#0f3b2c', cursor: 'pointer', width: 40, height: 40, fontWeight: 700 }} 
                        onClick={handleMenuOpen}
                      >
                        {user.full_name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Tooltip>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{user.full_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                      <Divider />
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        window.location.href = '/'; 
                      }}>
                        <HomeIcon sx={{ mr: 1.5, fontSize: 20 }} /> Homepage
                      </MenuItem>
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        window.location.href = getDashboardUrl(); 
                      }}>
                        <DashboardIcon sx={{ mr: 1.5, fontSize: 20 }} /> Dashboard
                      </MenuItem>
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        window.location.href = getReferralsUrl(); 
                      }}>
                        <ShareIcon sx={{ mr: 1.5, fontSize: 20 }} /> {getReferralsButtonText()}
                      </MenuItem>
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        window.location.href = '/messages'; 
                      }}>
                        <MessageIcon sx={{ mr: 1.5, fontSize: 20 }} /> Messages
                      </MenuItem>
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        window.location.href = '/profile'; 
                      }}>
                        <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} /> Profile Settings
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => { 
                        blurActiveElement()
                        handleMenuClose(); 
                        logout(); 
                      }} sx={{ color: '#ef4444' }}>
                        <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Logout
                      </MenuItem>
                    </Menu>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={handleSignIn} sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#ffffff', '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                      Sign In
                    </Button>
                    <Button variant="contained" onClick={handleBookService} sx={{ bgcolor: '#ffffff', color: '#0f3b2c', fontWeight: 700, '&:hover': { bgcolor: '#d1fae5' } }}>
                      Get Started
                    </Button>
                  </Box>
                )}
              </Box>
            )}
            
            {/* ===== MOBILE ONLY: Hamburger (only ONE, on the right) ===== */}
            {isMobile && (
              <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ===== DRAWER (slides in BELOW the header) ===== */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            top: '64px', // AppBar height
            height: 'calc(100% - 64px)',
            boxShadow: '4px 0 20px -8px rgba(0,0,0,0.1)',
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* ===== MODALS (unchanged) ===== */}
      {showRoleModal && <RoleModal onSelect={handleRoleSelect} onClose={() => {
        blurActiveElement()
        setShowRoleModal(false)
      }} />}
      {showSignUpModal && (
        <AuthModal 
          isSignUp={true} 
          role={selectedRole} 
          onClose={() => {
            blurActiveElement()
            setShowSignUpModal(false)
          }} 
          onSuccess={handleAuthSuccess}
          onSwitchToSignIn={handleSwitchToSignIn}
        />
      )}
      {showSignInModal && (
        <AuthModal 
          isSignUp={false} 
          onClose={() => {
            blurActiveElement()
            setShowSignInModal(false)
          }} 
          onSuccess={handleAuthSuccess}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}
    </>
  )
}

export default Header
