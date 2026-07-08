import React, { useState } from 'react'
import LoadingOverlay from '../../common/LoadingOverlay'

const Hero = ({ onGetQuote }) => {
  const [loggingOut, setLoggingOut] = useState(false)

  const getUser = () => {
    const userData = sessionStorage.getItem('zivre_user')
    if (userData) {
      try { return JSON.parse(userData) } catch (e) { return null }
    }
    return null
  }

  const handleLogout = () => {
    setLoggingOut(true)
    setTimeout(() => {
      sessionStorage.removeItem('zivre_token')
      sessionStorage.removeItem('zivre_user')
      window.location.href = '/'
    }, 500)
  }

  const routeToDashboard = (user) => {
    if (user.role === 'customer') window.location.href = '/customer/dashboard'
    else if (user.role === 'provider') window.location.href = '/provider/dashboard'
    else if (user.role === 'admin') window.location.href = '/admin/dashboard'
  }

  const handleGetStarted = () => {
    const user = getUser()
    if (user) { routeToDashboard(user); return }
    window.dispatchEvent(new CustomEvent('open_get_started_modal'))
  }

  const handleSignIn = () => {
    const user = getUser()
    if (user) { routeToDashboard(user); return }
    window.dispatchEvent(new CustomEvent('open_signin_modal'))
  }

  const user = getUser()

  return (
    <>
      <LoadingOverlay open={loggingOut} message="Logging out..." />

      <section className="zv-hero">
        <div className="zv-hero__bg" aria-hidden="true">
          <span className="zv-hero__glow zv-hero__glow--a" />
          <span className="zv-hero__glow zv-hero__glow--b" />
        </div>

        <div className="container zv-hero__inner">
          <div className="zv-hero__copy">
            <span className="zv-eyebrow">
              <svg className="zv-pulse" viewBox="0 0 60 16" aria-hidden="true">
                <path d="M0 8 H14 L18 2 L24 14 L29 8 H60" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              Facility care, done properly
            </span>

            <h1 className="zv-hero__title">
              Giving life to<br />
              <span className="zv-hero__accent">facilities</span> across Ghana
            </h1>

            <p className="zv-hero__lead">
              Trusted maintenance for homes and businesses — cleaning, electrical,
              plumbing, HVAC, security and more, handled by vetted professionals.
            </p>

            <div className="zv-hero__actions">
              <button className="zv-btn zv-btn--primary" onClick={onGetQuote}>Get a free quote</button>
              {user ? (
                <button className="zv-btn zv-btn--ghost" onClick={handleGetStarted}>Go to dashboard</button>
              ) : (
                <button className="zv-btn zv-btn--ghost" onClick={handleGetStarted}>Get started</button>
              )}
              {user ? (
                <button className="zv-btn zv-btn--text zv-btn--danger" onClick={handleLogout}>Log out</button>
              ) : (
                <button className="zv-btn zv-btn--text" onClick={handleSignIn}>Sign in</button>
              )}
            </div>

            {user && (
              <div className="zv-hero__welcome">Welcome back, {user.full_name}</div>
            )}

            <ul className="zv-hero__trust">
              <li><strong>10+ yrs</strong><span>of service</span></li>
              <li><strong>13</strong><span>service lines</span></li>
              <li><strong>24/7</strong><span>response</span></li>
            </ul>
          </div>

          <div className="zv-hero__visual" aria-hidden="true">
            <div className="zv-card zv-card--back">
              <span className="zv-card__dot" /><span className="zv-card__dot" /><span className="zv-card__dot" />
            </div>
            <div className="zv-card zv-card--front">
              <div className="zv-card__row">
                <span className="zv-card__tag">Active</span>
                <span className="zv-card__title">Office HVAC service</span>
              </div>
              <div className="zv-card__meter"><span /></div>
              <div className="zv-card__row zv-card__row--muted">
                <span>Technician en route</span><span>Today, 2:30 PM</span>
              </div>
              <svg className="zv-card__pulse" viewBox="0 0 240 40" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 20 H70 L82 6 L96 34 L108 20 H150 L160 12 L170 28 L178 20 H240"
                      fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero
