import React, { useState, useEffect, useRef } from 'react'
import { getServices } from "../../api/client";
import LoadingSpinner from "../../common/LoadingSpinner";

const ServicesGrid = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [showServices, setShowServices] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false)
    const [zoomActive, setZoomActive] = useState(false)
    const [hasEnteredView, setHasEnteredView] = useState(false)
    const carouselWrapperRef = useRef(null)

    // ===== ADD YOUR IMAGES HERE =====
    // Replace these with your actual image names
    const carouselImages = [
        { src: "/Adi.jpg", alt: "Zivre Facility Service 1" },
        { src: "/Adi2.jpeg", alt: "Zivre Facility Service 2" },
    ]

    // Auto-slide every 4 seconds — paused while the visitor is hovering
    useEffect(() => {
        if (carouselImages.length <= 1 || isHoveringCarousel) return
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
            )
        }, 4000)
        return () => clearInterval(interval)
    }, [carouselImages.length, isHoveringCarousel])

    // Restart the slow "Ken Burns" zoom every time the active slide changes
    useEffect(() => {
        setZoomActive(false)
        const t = setTimeout(() => setZoomActive(true), 60)
        return () => clearTimeout(t)
    }, [currentImageIndex])

    // Fade + rise into view the first time the carousel scrolls into the viewport
    useEffect(() => {
        const node = carouselWrapperRef.current
        if (!node) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHasEnteredView(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.2 }
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [])

    // Manual navigation functions
    const goToPrevious = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
        )
    }

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
        )
    }

    const goToSlide = (index) => {
        setCurrentImageIndex(index)
    }

    // FIX: Service cards now open signup for non-logged-in users
    const handleServiceClick = () => {
        // Check if user is logged in
        const userData = sessionStorage.getItem('zivre_user')
        if (!userData) {
            // Find and click the Get Started button
            const buttons = document.querySelectorAll('button')
            for (let btn of buttons) {
                if (btn.textContent === 'Get Started') {
                    btn.click()
                    break
                }
            }
        }
    }

    useEffect(() => {
        getServices(false).then(res => {
            setServices(res.data)
            setLoading(false)
        }).catch(() => {
            setServices([
                { id: 1, name: "HVAC Systems", icon: "❄️", description: "Heating, ventilation, and air conditioning maintenance", is_active: false },
                { id: 2, name: "Electrical", icon: "⚡", description: "Complete electrical installations and repairs", is_active: false },
                { id: 3, name: "Plumbing", icon: "💧", description: "Pipe installations and leak repairs", is_active: false },
                { id: 4, name: "Fire Safety", icon: "🔥", description: "Fire alarm systems and safety equipment", is_active: false },
                { id: 5, name: "Cleaning", icon: "🧹", description: "Professional cleaning for homes and businesses", is_active: false },
                { id: 6, name: "Security", icon: "🔒", description: "CCTV and access control systems", is_active: false },
                { id: 7, name: "Waste Management", icon: "🗑️", description: "Eco-friendly waste disposal", is_active: false },
                { id: 8, name: "Reception", icon: "📋", description: "Front desk management services", is_active: false },
                { id: 9, name: "Industry Services", icon: "🏭", description: "Industrial facility maintenance", is_active: false },
                { id: 10, name: "Healthcare", icon: "🏥", description: "Medical facility cleaning", is_active: false },
                { id: 11, name: "Poultry & Agri", icon: "🐔", description: "Farm facility management", is_active: false },
                { id: 12, name: "Hospitality", icon: "🏨", description: "Hotel and restaurant solutions", is_active: false },
                { id: 13, name: "Wellness", icon: "🧘", description: "Spa and wellness center maintenance", is_active: false }
            ])
            setLoading(false)
        })
    }, [])

    if (loading) return <LoadingSpinner />

    return (
        <section id="services" className="services zv-section zv-services">
            <div className="container">
                <span className="zv-eyebrow zv-center">Our expertise</span>
                <h2 className="zv-h2 zv-center">Tailored facility solutions</h2>
                <p className="section-subtitle">From HVAC to Security, Plumbing to Healthcare — a complete solution for every need.</p>
                
                {/* View All Services Button */}
                <div style={{ textAlign: 'center', marginBottom: showServices ? '2rem' : '0' }}>
                    <button 
                        className="btn-primary"
                        onClick={() => setShowServices(!showServices)}
                        style={{ 
                            padding: '0.75rem 2rem', 
                            fontSize: '1rem',
                            backgroundColor: showServices ? '#64748b' : '#10b981'
                        }}
                    >
                        {showServices ? 'Hide services' : 'View all services'}
                    </button>
                </div>

                {/* Services only show when button is clicked */}
                {showServices && (
                    <div className="services-grid">
                        {services.map((service) => (
                            <div 
                                key={service.id} 
                                className={`service-card ${!service.is_active ? 'inactive-service' : ''}`}
                                onClick={handleServiceClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="service-icon">{service.icon}</div>
                                <h3>{service.name}</h3>
                                <p>{service.description}</p>
                                {!service.is_active && (
                                    <span className="service-badge inactive">Currently Unavailable</span>
                                )}
                                {service.is_active && (
                                    <span className="service-badge active">Available Now</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== SHOWCASE CAROUSEL ===== */}
            <div style={{ padding: '3rem 1.5rem 3.5rem', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
                <div
                    ref={carouselWrapperRef}
                    style={{
                        maxWidth: '640px',
                        margin: '0 auto',
                        opacity: hasEnteredView ? 1 : 0,
                        transform: hasEnteredView ? 'translateY(0)' : 'translateY(28px)',
                        transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)'
                    }}
                >
                    <div
                        onMouseEnter={() => setIsHoveringCarousel(true)}
                        onMouseLeave={() => setIsHoveringCarousel(false)}
                        style={{
                            position: 'relative',
                            borderRadius: '22px',
                            overflow: 'hidden',
                            aspectRatio: '16 / 10',
                            background: '#0f3b2c',
                            boxShadow: '0 24px 48px -16px rgba(15,59,44,0.35), 0 0 0 1px rgba(16,185,129,0.1)'
                        }}
                    >
                        {/* Stacked images cross-fade into each other */}
                        {carouselImages.map((image, index) => {
                            const isActive = index === currentImageIndex
                            return (
                                <img
                                    key={image.src}
                                    src={image.src}
                                    alt={image.alt}
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        opacity: isActive ? 1 : 0,
                                        transform: isActive && zoomActive ? 'scale(1.09)' : 'scale(1)',
                                        transition: `opacity 1s ease, transform ${isActive ? '6.5s' : '0s'} ease-out`,
                                        willChange: 'opacity, transform',
                                        pointerEvents: 'none'
                                    }}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                />
                            )
                        })}

                        {/* Soft scrim so controls stay legible over any photo */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(180deg, rgba(10,31,26,0.05) 0%, transparent 30%, transparent 60%, rgba(10,31,26,0.5) 100%)',
                            pointerEvents: 'none'
                        }} />

                        {carouselImages.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    aria-label="Previous image"
                                    style={{
                                        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.35)', color: '#ffffff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 2, transition: 'background 0.2s ease, transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.38)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>

                                <button
                                    onClick={goToNext}
                                    aria-label="Next image"
                                    style={{
                                        position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                        width: '38px', height: '38px', borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                                        border: '1px solid rgba(255,255,255,0.35)', color: '#ffffff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 2, transition: 'background 0.2s ease, transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.38)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>

                                {/* Story-bar style progress dots */}
                                <div style={{
                                    position: 'absolute', bottom: '16px', left: 0, right: 0,
                                    display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 2
                                }}>
                                    {carouselImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => goToSlide(index)}
                                            aria-label={`Go to image ${index + 1}`}
                                            style={{
                                                width: currentImageIndex === index ? '22px' : '7px',
                                                height: '7px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                background: currentImageIndex === index ? '#ffffff' : 'rgba(255,255,255,0.45)',
                                                transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1), background 0.35s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServicesGrid
