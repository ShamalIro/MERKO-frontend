import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Connecting Merchants with Trusted Wholesale Suppliers</h1>
          <p>List your products or place bulk orders — all in one place.</p>
          <div className="hero-buttons">
            <Link to="/signup/supplier">
              <button className="btn-primary">Join as Supplier</button>
            </Link>
            <Link to="/signup/merchant">
              <button className="btn-secondary">Join as Merchant</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://plus.unsplash.com/premium_photo-1661302828763-4ec9b91d9ce3?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kdXN0cmlhbCUyMHdhcmVob3VzZXxlbnwwfHwwfHx8MA%3D%3D" alt="Business team working" />
        </div>
      </div>
    </section>
  )
}

export default Hero
