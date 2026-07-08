import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import DemoTour, { getTourProgress, saveTourStep, markTourCompleted } from './DemoTour'
import { 
  customerTourSteps, 
  providerTourSteps, 
  adminTourSteps
} from './DemoTour'

const RoleBasedTour = () => {
  const { user } = useAuth()
  const [showTour, setShowTour] = useState(false)

  // Scoped per USER (not just role) so different accounts on the same browser
  // each get their own tour — one customer finishing the tour no longer hides
  // it from the next customer who logs in on that device.
  const scopeId = user ? `${user.id}_${user.role}` : null

  useEffect(() => {
    if (!user) return
    const progress = getTourProgress(scopeId)
    if (!progress.completed) {
      const timer = setTimeout(() => setShowTour(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [user, scopeId])

  const handleCompleteTour = () => {
    markTourCompleted(scopeId)
    setShowTour(false)
  }

  const handleCloseTour = () => {
    // Just close - do NOT save completion (progress up to the current step is
    // already saved via handleStepChange, so it resumes from there next time)
    setShowTour(false)
  }

  const handleStepChange = (step) => {
    saveTourStep(scopeId, step)
  }

  // Select correct tour steps based on user role
  const getTourSteps = () => {
    if (!user) return []
    switch (user.role) {
      case 'customer':
        return customerTourSteps
      case 'provider':
        return providerTourSteps
      case 'admin':
        return adminTourSteps
      default:
        return []
    }
  }

  const getTourTitle = () => {
    if (!user) return ''
    switch (user.role) {
      case 'customer':
        return 'Welcome to Your Customer Dashboard!'
      case 'provider':
        return 'Welcome to Your Provider Dashboard!'
      case 'admin':
        return 'Welcome to Admin Control Center!'
      default:
        return 'Guided Tour'
    }
  }

  const tourSteps = getTourSteps()
  const tourTitle = getTourTitle()

  if (!user || tourSteps.length === 0) return null

  const initialStep = getTourProgress(scopeId).step || 0

  return (
    <DemoTour
      open={showTour}
      onClose={handleCloseTour}
      onComplete={handleCompleteTour}
      onStepChange={handleStepChange}
      initialStep={initialStep}
      steps={tourSteps}
      title={tourTitle}
      userName={user.full_name}
    />
  )
}

export default RoleBasedTour
