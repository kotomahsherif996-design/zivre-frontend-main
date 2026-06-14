import React from 'react'

const Footer = () => {
    const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    return (
        <footer className="zv-footer">
            <div className="container zv-footer__grid">
                <div className="zv-footer__brand">
                    <div className="zv-footer__logo">
                        ZIVRE
                        <svg className="zv-footer__pulse" viewBox="0 0 60 16" aria-hidden="true">
                            <path d="M0 8 H14 L18 2 L24 14 L29 8 H60" fill="none" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </div>
                    <p>Giving life to facilities — total facility management solutions for homes and businesses across Ghana.</p>
                </div>
                <div className="zv-footer__col">
                    <h4>Company</h4>
                    <a onClick={() => scrollTo('services')}>Services</a>
                    <a onClick={() => scrollTo('about')}>About</a>
                    <a onClick={() => scrollTo('contact')}>Contact</a>
                </div>
                <div className="zv-footer__col">
                    <h4>Services</h4>
                    <a onClick={() => scrollTo('services')}>HVAC systems</a>
                    <a onClick={() => scrollTo('services')}>Electrical</a>
                    <a onClick={() => scrollTo('services')}>Plumbing</a>
                    <a onClick={() => scrollTo('services')}>Security</a>
                </div>
                <div className="zv-footer__col">
                    <h4>Contact</h4>
                    <p>Near S.D.A Church, New Life Road, Pokuase</p>
                    <p>+233 54 346 3686</p>
                    <p>zivrefaservice@gmail.com</p>
                </div>
            </div>
            <div className="zv-footer__bottom">
                <div className="container">
                    <span>&copy; {new Date().getFullYear()} Zivre Facility Services. All rights reserved.</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
