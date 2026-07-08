import React from 'react'
import Reveal from '../../common/Reveal'

const steps = [
  {
    title: 'Request a service',
    description: 'Pick a fixed-price service or build a custom one, then choose one-time or a recurring schedule.'
  },
  {
    title: 'Get matched',
    description: 'Our team assigns a verified, specialized provider to your request — usually within hours.'
  },
  {
    title: 'Service completed',
    description: 'Your provider arrives and gets the work done. Track progress right from your dashboard.'
  },
  {
    title: 'Confirm & pay',
    description: 'Confirm the job is done, then pay your provider directly by Mobile Money or cash. No online payment, ever.'
  }
]

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="zv-section zv-process">
      <div className="container">
        <Reveal as="span" className="zv-eyebrow zv-center" style={{ display: 'block' }}>How it works</Reveal>
        <Reveal delay={1}><h2 className="zv-h2 zv-center">From request to done, in four steps</h2></Reveal>
        <Reveal delay={2}>
          <p className="section-subtitle">No app-hopping, no guesswork — just tell us what you need and we handle the rest.</p>
        </Reveal>

        <div className="zv-process__grid">
          {steps.map((step, idx) => (
            <Reveal as="div" key={step.title} delay={Math.min(idx + 1, 4)} className="zv-process__step">
              <div className="zv-process__num">{idx + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
