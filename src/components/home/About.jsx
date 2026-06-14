import React from 'react'

const About = () => {
    return (
        <section id="about" className="about zv-section">
            <div className="container zv-about">
                <div className="zv-about__visual" aria-hidden="true">
                    <div className="zv-about__badge">Since 2014</div>
                    <div className="zv-about__panel">
                        <span className="zv-about__metric">10,000+</span>
                        <span className="zv-about__metric-label">service visits completed</span>
                        <svg className="zv-about__pulse" viewBox="0 0 220 30" preserveAspectRatio="none">
                            <path d="M0 15 H70 L82 5 L94 25 L104 15 H160 L168 9 L176 21 L182 15 H220" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                </div>
                <div className="zv-about__content">
                    <span className="zv-eyebrow">About us</span>
                    <h2 className="zv-h2">Redefining facility care across Ghana</h2>
                    <p className="zv-lead">
                        Zivre began with one belief: a well-maintained space is the foundation of a
                        healthy, productive life. We bring that standard to every home and business we serve.
                    </p>
                    <p className="zv-body">
                        Our teams are trained on modern techniques and equipment, so your environment
                        isn&apos;t just functional — it&apos;s genuinely well kept.
                    </p>
                    <div className="zv-about__actions">
                        <button className="zv-btn zv-btn--primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Book a service</button>
                        <button className="zv-btn zv-btn--ghost" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>Explore services</button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About
