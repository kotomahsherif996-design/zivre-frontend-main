import React from 'react'

const WhyChoose = () => {
    const features = [
        { title: "24/7 response", description: "Round-the-clock emergency team, ready when systems fail." },
        { title: "Certified experts", description: "Licensed, trained, background-checked professionals." },
        { title: "Nationwide coverage", description: "Serving homes and businesses across every region in Ghana." },
        { title: "Fair, clear pricing", description: "Premium work at honest rates — quoted up front, no surprises." }
    ]

    return (
        <section className="why-choose zv-section">
            <div className="container zv-why">
                <div className="zv-why__content">
                    <span className="zv-eyebrow">Why Zivre</span>
                    <h2 className="zv-h2">Excellence you can feel in the building</h2>
                    <p className="zv-lead">
                        A well-kept space runs quieter, lasts longer, and works harder.
                        Our commitment to quality is why facilities across Ghana trust us to keep them alive.
                    </p>
                    <ul className="zv-feature-list">
                        {features.map((item, idx) => (
                            <li key={idx} className="zv-feature">
                                <span className="zv-feature__mark" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="16" height="16"><path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                                <div>
                                    <strong>{item.title}</strong>
                                    <p>{item.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <aside className="zv-why__stats" aria-label="Track record">
                    <div className="zv-stat-card">
                        <div className="zv-stat">
                            <span className="zv-stat__num">11+</span>
                            <span className="zv-stat__label">Years of service</span>
                        </div>
                        <div className="zv-stat">
                            <span className="zv-stat__num">5.0<span className="zv-stat__star">★</span></span>
                            <span className="zv-stat__label">Average client rating</span>
                        </div>
                        <div className="zv-stat">
                            <span className="zv-stat__num">13</span>
                            <span className="zv-stat__label">Service lines covered</span>
                        </div>
                        <svg className="zv-stat-card__pulse" viewBox="0 0 240 30" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M0 15 H80 L92 4 L104 26 L114 15 H240" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                </aside>
            </div>
        </section>
    )
}

export default WhyChoose
