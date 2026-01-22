import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImportProducts.css';

const ImportProducts = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // Sample catalog products
  const [catalogProducts] = useState([
    {
      id: 'CAT-001',
      name: 'Artisan Leather Belt',
      category: 'Accessories',
      price: 89.99,
      quantity: 5,
      source: 'Global Luxury Catalog',
      selected: true
    },
    {
      id: 'CAT-002',
      name: 'Premium Cashmere Scarf',
      category: 'Fashion',
      price: 129.95,
      quantity: 1,
      source: 'Global Luxury Catalog',
      selected: true
    },
    {
      id: 'CAT-003',
      name: 'Handcrafted Wooden Box',
      category: 'Home & Decor',
      price: 75.00,
      quantity: null,
      source: 'Artisan Collection',
      selected: false
    },
    {
      id: 'CAT-004',
      name: 'Crystal Whiskey Glasses (Set of 2)',
      category: 'Home & Decor',
      price: 119.99,
      quantity: null,
      source: 'Global Luxury Catalog',
      selected: false
    },
    {
      id: 'CAT-005',
      name: 'Vintage Style Cufflinks',
      category: 'Accessories',
      price: 65.00,
      quantity: null,
      source: 'Artisan Collection',
      selected: false
    },
    {
      id: 'CAT-006',
      name: 'Marble Coasters (Set of 4)',
      category: 'Home & Decor',
      price: 49.95,
      quantity: null,
      source: 'Global Luxury Catalog',
      selected: false
    }
  ]);

  const filteredProducts = catalogProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleQuantityChange = (productId, quantity) => {
    // Update quantity for selected products
    console.log(`Updating quantity for ${productId}: ${quantity}`);
  };

  const getSelectedProductsSummary = () => {
    const selected = catalogProducts.filter(product => 
      selectedProducts.has(product.id) || product.selected
    );
    return selected;
  };

  const getTotalValue = () => {
    const selected = getSelectedProductsSummary();
    return selected.reduce((total, product) => {
      const qty = product.quantity || 1;
      return total + (product.price * qty);
    }, 0);
  };

  const getTotalItems = () => {
    return getSelectedProductsSummary().length;
  };

  const handleImportSelected = () => {
    const selectedItems = getSelectedProductsSummary();
    console.log('Importing selected products:', selectedItems);
    // Implement import logic
    navigate('/supplier/products');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="import-products-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="supplier-logo">
            <div className="logo-icon">📦</div>
            <div className="logo-text">
              <div className="portal-name">Supplier Portal</div>
              <div className="company-name">Tech Supplies Inc.</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item" onClick={() => handleNavigation('/supplier/dashboard')}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div className="nav-item active" onClick={() => handleNavigation('/supplier/products')}>
            <span className="nav-icon">📦</span>
            <span>Products</span>
          </div>
          <div className="nav-item" onClick={() => handleNavigation('/supplier/inventory')}>
            <span className="nav-icon">📋</span>
            <span>Inventory</span>
          </div>
          <div className="nav-item" onClick={() => handleNavigation('/supplier/orders')}>
            <span className="nav-icon">🛒</span>
            <span>Orders</span>
          </div>
          <div className="nav-item" onClick={() => handleNavigation('/supplier/settings')}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
          <div className="nav-item" onClick={() => handleNavigation('/supplier/help')}>
            <span className="nav-icon">❓</span>
            <span>Help Center</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="switch-role-btn" onClick={() => handleNavigation('/')}>
            <span className="switch-icon">🔄</span>
            Switch Role
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, John</h1>
              <p className="current-date">Today is 8/30/2025</p>
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
            <div className="profile-avatar">J</div>
          </div>
        </div>

        {/* Import Products Content */}
        <div className="import-products-content">
          <div className="page-header">
            <h2>Import Products</h2>
            <button className="import-selected-btn" onClick={handleImportSelected}>
              📤 Import Selected ({getTotalItems()} items)
            </button>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search catalog products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="products-table-section">
            <div className="products-table">
              <div className="table-header">
                <div className="header-cell checkbox-cell"></div>
                <div className="header-cell">Product ID</div>
                <div className="header-cell">Product Name</div>
                <div className="header-cell">Category</div>
                <div className="header-cell">Price</div>
                <div className="header-cell">Quantity</div>
                <div className="header-cell">Source</div>
              </div>
              <div className="table-body">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="table-row">
                    <div className="table-cell checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id) || product.selected}
                        onChange={() => handleProductSelect(product.id)}
                        className="product-checkbox"
                      />
                    </div>
                    <div className="table-cell product-id">{product.id}</div>
                    <div className="table-cell product-name">{product.name}</div>
                    <div className="table-cell category">{product.category}</div>
                    <div className="table-cell price">
                      <div className="price-container">
                        <span className="price-amount">${product.price}</span>
                        <span className="price-badge">💰</span>
                      </div>
                    </div>
                    <div className="table-cell quantity">
                      {(selectedProducts.has(product.id) || product.selected) ? (
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(product.id, (product.quantity || 1) - 1)}
                          >
                            -
                          </button>
                          <span className="quantity-value">{product.quantity || 1}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(product.id, (product.quantity || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="quantity-placeholder">-</span>
                      )}
                    </div>
                    <div className="table-cell source">{product.source}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Products Summary */}
          <div className="summary-section">
            <h3>Selected Products Summary</h3>
            <div className="summary-content">
              {getSelectedProductsSummary().map((product) => (
                <div key={product.id} className="summary-item">
                  <div className="summary-product">
                    <span className="summary-name">{product.name}</span>
                    <span className="summary-quantity">({product.quantity || 1})</span>
                  </div>
                  <div className="summary-price">
                    ${((product.quantity || 1) * product.price).toFixed(2)}
                  </div>
                </div>
              ))}
              
              <div className="summary-footer">
                <div className="summary-total">
                  <strong>Total Items: {getTotalItems()}</strong>
                </div>
                <div className="summary-note">
                  Products will be added to your inventory with the specified quantities and prices.
                </div>
                <button className="import-final-btn" onClick={handleImportSelected}>
                  Import {getTotalItems()} Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProducts;
