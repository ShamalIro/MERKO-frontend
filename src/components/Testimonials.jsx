import React from 'react'

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="testimonials-header">
        <h2>What Our Users Say</h2>
        <p>Don't just take our word for it — hear from our community.</p>
      </div>
      
      <div className="testimonials-grid">
        <div className="testimonial-card">
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p>"MERKO has transformed how we source products. The platform is intuitive and the suppliers are reliable."</p>
          <div className="testimonial-author">
            <strong>Sarah Johnson</strong>
            <span>Purchasing Manager, RetailPlus</span>
          </div>
        </div>
        
        <div className="testimonial-card">
          <div className="stars">⭐⭐⭐⭐⭐</div>
          <p>"As a supplier, we've expanded our customer base by 40% since joining. The platform makes it easy to manage orders."</p>
          <div className="testimonial-author">
            <strong>Michael Chen</strong>
            <span>Sales Director, Quality Foods</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
