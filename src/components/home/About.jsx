import React from 'react'
import Reveal from '../../common/Reveal'
import AnimatedCounter from '../../common/AnimatedCounter'

const About = () => {
    return (
        <section id="about" className="about zv-section">
            <div className="container zv-about">
                <Reveal as="div" scale className="zv-about__visual" aria-hidden="true">
                    <div className="zv-about__badge">Since 2014</div>
                    <div className="zv-about__panel">
                        <span className="zv-about__metric"><AnimatedCounter value={10000} suffix="+" /></span>
                        <span className="zv-about__metric-label">service visits completed</span>
                        <svg className="zv-about__pulse" viewBox="0 0 220 30" preserveAspectRatio="none">
                            <path d="M0 15 H70 L82 5 L94 25 L104 15 H160 L168 9 L176 21 L182 15 H220" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                </Reveal>
                <div className="zv-about__content">
                    <Reveal as="span" className="zv-eyebrow" style={{ display: 'inline-flex' }}>About us</Reveal>
                    <Reveal delay={1}><h2 className="zv-h2">Redefining facility care across Ghana</h2></Reveal>
                    <Reveal delay={2}>
                        <p className="zv-lead">
                            Zivre began with one belief: a well-maintained space is the foundation of a
                            healthy, productive life. We bring that standard to every home and business we serve.
                        </p>
                    </Reveal>
                    <Reveal delay={3}>
                        <p className="zv-body">
                            Our teams are trained on modern techniques and equipment, so your environment
                            isn&apos;t just functional — it&apos;s genuinely well kept.
                        </p>
                    </Reveal>
                    <Reveal delay={4}>
                        <div className="zv-about__actions">
                            <button className="zv-btn zv-btn--primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Book a service</button>
                            <button className="zv-btn zv-btn--ghost" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Explore services</button>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    )
}

export default About
