import React, { useState } from 'react'
import Reveal from '../../common/Reveal'

const faqs = [
  {
    q: 'Do I pay Zivre directly?',
    a: 'No. Zivre never collects payment. You pay your assigned provider directly by Mobile Money or cash, and only after the service is complete.'
  },
  {
    q: 'How do I know my provider is trustworthy?',
    a: 'Every provider is verified by our admin team before they can accept a single job — we check their credentials and specialization first.'
  },
  {
    q: 'Can I schedule a service to repeat automatically?',
    a: 'Yes. When requesting any service, choose Daily, Weekly, Monthly, or a custom date range. You\'ll see the full price breakdown before confirming, and can pause or stop it anytime.'
  },
  {
    q: 'What if I\'m not happy with the work?',
    a: 'Only confirm completion once you\'re satisfied — that\'s also the trigger for payment. If there\'s an issue before then, message your provider or admin directly from your dashboard.'
  },
  {
    q: 'How do I become a service provider?',
    a: 'Sign up and choose "Service Provider", pick your specialization, and complete your profile. Once admin verifies your account, you can start claiming jobs.'
  },
  {
    q: 'Is there a fee to sign up?',
    a: 'No. Creating a Zivre account is free for both customers and providers.'
  }
]

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="zv-section zv-faq">
      <div className="container">
        <Reveal as="span" className="zv-eyebrow zv-center" style={{ display: 'block' }}>Questions</Reveal>
        <Reveal delay={1}><h2 className="zv-h2 zv-center">Frequently asked questions</h2></Reveal>

        <div className="zv-faq__list">
          {faqs.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <Reveal as="div" key={item.q} delay={Math.min(idx + 1, 4)} className={`zv-faq__item ${isOpen ? 'is-open' : ''}`}>
                <button
                  className="zv-faq__question"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <span className="zv-faq__icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                <div className="zv-faq__answer">
                  <div className="zv-faq__answer-inner">
                    <p>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FAQ
