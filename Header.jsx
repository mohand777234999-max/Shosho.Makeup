import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <div className="logo">
          <img src="/assets/logo.png" alt="SHOSHO MAKEUP" className="logo-img" />
          <div className="logo-text">SHOSHO <span>MAKEUP</span></div>
        </div>

        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#home" onClick={() => setMobileMenuOpen(false)}>الرئيسية</a></li>
            <li><a href="#products" onClick={() => setMobileMenuOpen(false)}>منتجاتنا</a></li>
            <li><a href="#about" onClick={() => setMobileMenuOpen(false)}>قصتنا</a></li>
            <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>تواصل معنا</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <div className="cart-icon" onClick={onCartClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
