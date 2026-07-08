import React from 'react'
import Reveal from '../../common/Reveal'

const ClosingCTA = () => {
  const handleGetStarted = () => {
    const userData = sessionStorage.getItem('zivre_user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === 'customer') window.location.href = '/customer/dashboard'
        else if (user.role === 'provider') window.location.href = '/provider/dashboard'
        else if (user.role === 'admin') window.location.href = '/admin/dashboard'
        return
      } catch (e) { /* fall through to signup */ }
    }
    window.dispatchEvent(new CustomEvent('open_get_started_modal'))
  }

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="zv-cta">
      <div className="zv-cta__glow" aria-hidden="true" />
      <div className="zv-cta__content">
        <Reveal scale>
          <h2>Ready to give your space some life?</h2>
        </Reveal>
        <Reveal delay={1} scale>
          <p>Join thousands of customers across Ghana who trust Zivre for reliable, professional facility care — booked in minutes, paid only when it's done.</p>
        </Reveal>
        <Reveal delay={2} scale>
          <div className="zv-cta__actions">
            <button className="zv-btn zv-btn--primary" onClick={handleGetStarted}>Get started free</button>
            <button
              className="zv-btn zv-btn--ghost"
              onClick={scrollToContact}
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,.35)', color: '#fff' }}
            >
              Request a free quote
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default ClosingCTA
