import React, { useState } from 'react';
 // Make sure this CSS file exists

const AllProducts = () => { // Changed from MerchantDashboard to AllProducts
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState('grid');
  const [cartItems, setCartItems] = useState(1);

  // Dummy product data
  const products = [
    {
      id: 1,
      name: 'Premium Widget',
      supplier: 'Tech Supplies Inc.',
      price: 129.99,
      rating: 4.8,
      description: 'High-quality widget with premium features for professional use.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Standard Widget',
      supplier: 'Tech Supplies Inc.',
      price: 79.99,
      rating: 4.5,
      description: 'Reliable widget suitable for everyday tasks and applications.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'Basic Widget',
      supplier: 'Tech Supplies Inc.',
      price: 49.99,
      rating: 4.2,
      description: 'Entry-level widget perfect for beginners and basic needs.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      name: 'Deluxe Gadget',
      supplier: 'Quality Goods Co.',
      price: 199.99,
      rating: 4.9,
      description: 'Premium gadget with advanced features and elegant design.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 5,
      name: 'Smart Device',
      supplier: 'Tech Supplies Inc.',
      price: 299.99,
      rating: 4.7,
      description: 'Intelligent device with smart connectivity and automation features.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 6,
      name: 'Tech Accessory',
      supplier: 'Quality Goods Co.',
      price: 39.99,
      rating: 4.3,
      description: 'Essential accessory to complement your tech devices.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 7,
      name: 'Professional Tool',
      supplier: 'Premium Products Ltd.',
      price: 149.99,
      rating: 4.6,
      description: 'Professional-grade tool for precise and efficient work.',
      image: '/api/placeholder/300/200'
    },
    {
      id: 8,
      name: 'Ultra Device',
      supplier: 'Premium Products Ltd.',
      price: 499.99,
      rating: 4.9,
      description: 'Top-of-the-line device with cutting-edge technology and features.',
      image: '/api/placeholder/300/200'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (productId) => {
    setCartItems(prevCount => prevCount + 1);
    console.log(`Added product ${productId} to cart`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('merchant');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const renderStars = (rating) => {
    return (
      <div className="rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${rating >= star ? 'filled' : ''}`}>
            ★
          </span>
        ))}
        <span className="rating-number">{rating}</span>
      </div>
    );
  };

  return (
    <div className="merchant-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Merchant Portal</h2>
          <p>ABC Retail</p>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🏪</span>
            <span>Suppliers</span>
          </div>
          <div className="nav-item active"> {/* This page should be active */}
            <span className="nav-icon">📦</span>
            <span>All Products</span>
          </div>
          <div className="nav-item cart-item">
            <span className="nav-icon">🛒</span>
            <span>Cart</span>
            {cartItems > 0 && <span className="cart-badge">{cartItems}</span>}
          </div>
          <div className="nav-item">
            <span className="nav-icon">📋</span>
            <span>Orders</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">❓</span>
            <span>Inquiries</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">❓</span>
            <span>Help Center</span>
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">🔄</span>
            <span>Switch Role</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>Welcome back, Sarah</h1>
            <p>Today is 9/22/2025</p>
          </div>
          <div className="header-right">
            <div className="notification-icon">🔔</div>
            <div className="profile-avatar">SR</div>
          </div>
        </header>

        {/* Product Catalog Section */}
        <div className="catalog-section">
          <div className="catalog-header">
            <h2>All Products Catalog</h2>
            <div className="catalog-controls">
              <button 
                className={`view-btn ${viewType === 'grid' ? 'active' : ''}`}
                onClick={() => setViewType('grid')}
              >
                ⊞
              </button>
              <button 
                className={`view-btn ${viewType === 'list' ? 'active' : ''}`}
                onClick={() => setViewType('list')}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <select>
                <option>All</option>
                <option>Tech Supplies Inc.</option>
                <option>Quality Goods Co.</option>
                <option>Premium Products Ltd.</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`products-grid ${viewType}`}>
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  <div className="placeholder-image">
                    <span>📦</span>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-supplier">{product.supplier}</p>
                  {renderStars(product.rating)}
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${product.price}</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(product.id)}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span className="pagination-info">Showing {filteredProducts.length} of {products.length} products</span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled>Previous</button>
              <button className="pagination-btn" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;