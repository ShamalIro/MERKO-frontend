import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Suppliers.css';

const Suppliers = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Sample supplier data
  const supplierInfo = {
    name: "Luxury Leather Goods",
    rating: 4.8,
    location: "Milan, Italy",
    description: "Premium supplier of high-quality leather products including bags, wallets, and accessories. All products are handcrafted by skilled artisans with decades of experience.",
    established: "1978",
    category: "Accessories",
    contactEmail: "info@luxuryleather.com",
    contactPhone: "+39 02 1234 5678",
    certifications: [
      "Sustainable Leather",
      "Ethical Trade",
      "Premium Quality"
    ]
  };

  const products = [
    {
      id: 'LLG-P001',
      name: 'Premium Leather Tote',
      sku: 'LLG-T001',
      category: 'Bags',
      price: 450.00,
      stock: 24,
      image: '🧳'
    },
    {
      id: 'LLG-W002',
      name: 'Executive Wallet',
      sku: 'LLG-W002',
      category: 'Wallets',
      price: 180.00,
      stock: 42,
      image: '👛'
    },
    {
      id: 'LLG-B003',
      name: 'Designer Belt',
      sku: 'LLG-B003',
      category: 'Accessories',
      price: 220.00,
      stock: 18,
      image: '🔗'
    },
    {
      id: 'LLG-N004',
      name: 'Leather Notebook Cover',
      sku: 'LLG-N004',
      category: 'Stationery',
      price: 95.00,
      stock: 31,
      image: '📖'
    },
    {
      id: 'LLG-C005',
      name: 'Business Card Holder',
      sku: 'LLG-C005',
      category: 'Accessories',
      price: 75.00,
      stock: 56,
      image: '💼'
    }
  ];

  const categories = ['All Categories', 'Bags', 'Wallets', 'Accessories', 'Stationery'];

  const filteredProducts = selectedCategory === 'All Categories' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const handleSidebarNavigation = (item) => {
    switch (item) {
      case 'dashboard':
        navigate('/merchant/dashboard');
        break;
      case 'suppliers':
        // Already on suppliers page
        break;
      case 'products':
        console.log('Navigate to products');
        break;
      case 'cart':
        navigate('/merchant/cart');
        break;
      case 'orders':
        console.log('Navigate to orders');
        break;
      case 'inquiries':
        console.log('Navigate to inquiries');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'help':
        console.log('Navigate to help center');
        break;
      default:
        break;
    }
  };

  const handleRoleSwitch = () => {
    console.log('Switch role functionality');
  };

  const handleAddToCart = (product) => {
    console.log('Add to cart:', product);
    // Add to cart functionality
  };

  const handleContactSupplier = () => {
    console.log('Contact supplier');
    // Contact supplier functionality
  };

  const getStockColor = (stock) => {
    if (stock > 30) return '#10b981';
    if (stock > 15) return '#f59e0b';
    return '#ef4444';
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  return (
    <div className="suppliers-page">
      {/* Sidebar */}
      <div className="suppliers-sidebar">
        <div className="sidebar-header">
          <div className="merchant-portal">
            <h2>Merchant Portal</h2>
            <p>ABC Retail</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => handleSidebarNavigation('dashboard')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </div>

          <div className="nav-item active" onClick={() => handleSidebarNavigation('suppliers')}>
            <span className="nav-icon">🏢</span>
            <span className="nav-text">Suppliers</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('products')}>
            <span className="nav-icon">📦</span>
            <span className="nav-text">Products</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('cart')}>
            <span className="nav-icon">🛒</span>
            <span className="nav-text">Cart</span>
            <span className="cart-badge">3</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('orders')}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Orders</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('inquiries')}>
            <span className="nav-icon">💬</span>
            <span className="nav-text">Inquiries</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('settings')}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </div>

          <div className="nav-item" onClick={() => handleSidebarNavigation('help')}>
            <span className="nav-icon">❓</span>
            <span className="nav-text">Help Center</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="role-switch" onClick={handleRoleSwitch}>
            <span className="switch-icon">🔄</span>
            <span className="switch-text">Switch Role</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="suppliers-main">
        {/* Header */}
        <div className="suppliers-header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, Sarah</h1>
              <p>Today is 9/30/2025</p>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <span>🔔</span>
              <span className="notification-count">1</span>
            </div>
            <div className="user-profile">
              <div className="user-avatar">SA</div>
            </div>
          </div>
        </div>

        {/* Supplier Content */}
        <div className="supplier-content">
          {/* Supplier Hero Section */}
          <div className="supplier-hero">
            <div className="hero-background">
              <div className="hero-overlay">
                <h2 className="supplier-name">{supplierInfo.name}</h2>
                <div className="supplier-meta">
                  <div className="rating">
                    {renderStars(supplierInfo.rating)}
                    <span className="rating-value">{supplierInfo.rating} rating</span>
                  </div>
                  <div className="location">
                    <span className="location-icon">📍</span>
                    <span>{supplierInfo.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Supplier Information */}
            <div className="supplier-info-section">
              <div className="info-card">
                <h3>Supplier Information</h3>
                <p className="supplier-description">{supplierInfo.description}</p>

                <div className="contact-details">
                  <h4>Contact Details</h4>
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span>{supplierInfo.contactEmail}</span>
                  </div>
                  <div className="contact-item">
                    <span className="contact-icon">📞</span>
                    <span>{supplierInfo.contactPhone}</span>
                  </div>
                </div>

                <div className="additional-info">
                  <h4>Additional Information</h4>
                  <div className="info-item">
                    <span className="info-icon">🏛️</span>
                    <span>Established: {supplierInfo.established}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">🏷️</span>
                    <span>Category: {supplierInfo.category}</span>
                  </div>
                </div>

                <div className="certifications">
                  <h4>Certifications</h4>
                  <div className="cert-list">
                    {supplierInfo.certifications.map((cert, index) => (
                      <div key={index} className="cert-item">
                        <span className="cert-icon">✅</span>
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="contact-supplier-btn" onClick={handleContactSupplier}>
                  Contact Supplier
                </button>
              </div>
            </div>

            {/* Available Products */}
            <div className="products-section">
              <div className="products-header">
                <h3>Available Products</h3>
                <div className="category-filter">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="search-section">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="search-input"
                />
              </div>

              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-info">
                            <div className="product-image">{product.image}</div>
                            <div className="product-details">
                              <div className="product-name">{product.name}</div>
                              <div className="product-sku">SKU: {product.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-badge">{product.category}</span>
                        </td>
                        <td className="price">${product.price.toFixed(2)}</td>
                        <td>
                          <span 
                            className="stock-badge" 
                            style={{ color: getStockColor(product.stock) }}
                          >
                            {product.stock} units
                          </span>
                        </td>
                        <td>
                          <div className="product-actions">
                            <button className="details-btn">Details</button>
                            <button 
                              className="add-to-cart-btn"
                              onClick={() => handleAddToCart(product)}
                            >
                              🛒 Add to Cart
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
