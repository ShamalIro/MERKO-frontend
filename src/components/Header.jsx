import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="header">
      <nav className="navbar">
        {/* Logo */}
        <div className="nav-brand">
          <Link to="/" onClick={closeMenu}>
            <span className="brand-text">MERKO</span>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Centered Navigation Menu */}
        <ul className={`nav-menu ${isMenuOpen ? 'nav-menu-open' : ''}`}>
          <li><a href="#home" onClick={closeMenu}>Home</a></li>
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#services" onClick={closeMenu}>Services</a></li>
          <li><a href="#products" onClick={closeMenu}>Products</a></li>
          <li><a href="#careers" onClick={closeMenu}>Careers</a></li>
        </ul>
        
        {/* Sign In Button - Right Side */}
        <div className={`nav-auth ${isMenuOpen ? 'nav-auth-open' : ''}`}>
          <Link to="/login" onClick={closeMenu}>
            <button className="signin-btn">
              Sign In
             
            </button>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Header
