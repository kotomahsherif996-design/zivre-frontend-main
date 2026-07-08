import React from 'react'
import Reveal from '../../common/Reveal'

const TestimonialsCarousel = () => {
    const testimonials = [
        { name: "Kofi Amoah", role: "Facility Manager", text: "Zivre has been our partner for over two years. Their HVAC and electrical teams are exceptional.", stars: 5 },
        { name: "Sarah Mensah", role: "Hospitality Director", text: "From HVAC to security, they handle everything. The best facility management company in Ghana.", stars: 5 },
        { name: "David Osei", role: "Business Owner", text: "Excellent service. Their plumbing and electrical teams are top-notch. Highly recommended.", stars: 5 },
        { name: "Abena Boateng", role: "Healthcare Admin", text: "Professional, reliable, and affordable. They transformed our facility maintenance completely.", stars: 5 },
        { name: "Emmanuel Quartey", role: "Property Developer", text: "Best facility services in Ghana. Every corner spotless. Will definitely use them again.", stars: 5 },
        { name: "Michael Addo", role: "School Administrator", text: "Their security and cleaning services are outstanding. Very professional team.", stars: 5 },
        { name: "Grace Asare", role: "Restaurant Owner", text: "Fast response, great work, fair prices. Highly recommend Zivre for hospitality needs.", stars: 5 }
    ]

    const allTestimonials = [...testimonials, ...testimonials]

    const initials = (name) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
        <section className="testimonials zv-section">
            <div className="container">
                <Reveal as="span" className="zv-eyebrow zv-center" style={{ display: 'block' }}>Client reviews</Reveal>
                <Reveal delay={1}><h2 className="zv-h2 zv-center">Trusted across Ghana</h2></Reveal>
            </div>
            <div className="zv-marquee">
                <div className="zv-marquee__track">
                    {allTestimonials.map((t, idx) => (
                        <figure key={idx} className="zv-quote">
                            <div className="zv-quote__stars" aria-label={`${t.stars} out of 5 stars`}>
                                {'★'.repeat(t.stars)}
                            </div>
                            <blockquote>{t.text}</blockquote>
                            <figcaption>
                                <span className="zv-quote__avatar">{initials(t.name)}</span>
                                <span>
                                    <strong>{t.name}</strong>
                                    <small>{t.role}</small>
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TestimonialsCarousel
