import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [merchantData, setMerchantData] = useState({
    companyName: 'ABC Retail',
    name: 'John Merchant',
  });
  const [imageErrors, setImageErrors] = useState({});

  // Calculate totals
  const subtotal = cartData?.subtotal || 0;
  const taxRate = 0.08; // 8%
  const tax = subtotal * taxRate;
  const totalQuantity = cartData?.totalQuantity || 0;
  const grandTotal = subtotal + tax;

  useEffect(() => {
    const fetchMerchant = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8081/api/merchants/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const merchant = response.data;
        setMerchantData({
          companyName: merchant.companyName || 'ABC Retail',
          name: merchant.name || 'John Merchant',
        });
      } catch (err) {
        console.error('Error fetching merchant data:', err);
      }
    };

    fetchMerchant();
  }, [navigate]);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Check token validity
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    } catch (error) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8081/api/cart/my-cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Cart response:', response.data);
      setCartData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load cart data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarNavigation = (item) => {
    switch (item) {
      case 'dashboard': navigate('/merchant/dashboard'); break;
      case 'suppliers': navigate('/merchant/suppliers'); break;
      case 'products': navigate('/merchant/products'); break;
      case 'cart': break; // Already on cart page
      case 'orders': navigate('/merchant/orders'); break;
      case 'inquiries': navigate('/merchant/inquiries'); break;
      case 'settings': navigate('/merchant/settings'); break;
      case 'help': navigate('/merchant/help'); break;
      default: break;
    }
  };

  const handleRoleSwitch = () => navigate('/');

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/cart/update/${cartItemId}`, {
        quantity: newQuantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error updating cart item:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to update cart item');
      }
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8081/api/cart/remove/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error removing cart item:', error);
      alert('Failed to remove cart item');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8081/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh cart data
      await fetchCartData();
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  const handleContinueShopping = () => {
    navigate('/merchant/products');
  };

  const handleProceedToCheckout = () => {
    navigate('/merchant/checkout');
  };

  const getProductImage = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
      const imageUrl = imageUrls[0];
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:8081${imageUrl}`;
      } else {
        return `http://localhost:8081/uploads/${imageUrl}`;
      }
    }
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80';
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JM';

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Sidebar */}
      <div className="cart-sidebar">
        <div className="sidebar-header">
          <div className="merchant-portal">
            <h2>Merchant Portal</h2>
            <p>{merchantData.companyName}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', icon: '📊', label: 'Dashboard' },
            { key: 'suppliers', icon: '🏢', label: 'Suppliers' },
            { key: 'products', icon: '📦', label: 'Products' },
            { key: 'cart', icon: '🛒', label: 'Cart' },
            { key: 'orders', icon: '📋', label: 'Orders' },
            { key: 'inquiries', icon: '💬', label: 'Inquiries' },
            { key: 'settings', icon: '⚙️', label: 'Settings' },
            { key: 'help', icon: '❓', label: 'Help Center' }
          ].map((item) => (
            <div 
              key={item.key} 
              className={`nav-item ${item.key === 'cart' ? 'active' : ''}`} 
              onClick={() => handleSidebarNavigation(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.key === 'cart' && <span className="cart-badge">{totalQuantity}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="role-switch" onClick={handleRoleSwitch}>
            <span className="switch-icon">🔄</span>
            <span className="switch-text">Switch Role</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="cart-main">
        {/* Header */}
        <div className="cart-header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, {merchantData.name}</h1>
              <p>Today is {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <span>🔔</span>
              <span className="notification-count">3</span>
            </div>
            <div className="user-profile">
              <div className="user-avatar">{getInitials(merchantData.name)}</div>
            </div>
          </div>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          <div className="cart-header-section">
            <h2>Shopping Cart</h2>
            <div className="cart-actions">
              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                🛒 Continue Shopping
              </button>
              {cartData && cartData.cartItems && cartData.cartItems.length > 0 && (
                <button className="clear-cart-btn" onClick={clearCart}>
                  🗑️ Clear Cart
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={fetchCartData}>Retry</button>
            </div>
          )}

          <div className="cart-layout">
            {/* Cart Items Section */}
            <div className="cart-items-section">
              <div className="cart-items-header">
                <h3>Cart Items ({cartData?.cartItems?.length || 0})</h3>
              </div>

              {cartData && cartData.cartItems && cartData.cartItems.length > 0 ? (
                <div className="cart-items">
                  {cartData.cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        {!imageErrors[item.id] ? (
                          <img 
                            src={getProductImage(item.imageUrls)} 
                            alt={item.productName}
                            onError={() => handleImageError(item.id)}
                          />
                        ) : (
                          <div className="item-placeholder">
                            <span className="placeholder-icon">📦</span>
                          </div>
                        )}
                      </div>

                      <div className="item-details">
                        <h4 className="item-name">{item.productName}</h4>
                        <p className="item-supplier">{item.supplierCompanyName || 'Quality Supplier'}</p>
                        <p className="item-product-id">SKU: {item.productSku || 'N/A'}</p>
                        <p className="item-brand">Brand: {item.brand || 'Premium Brand'}</p>
                        {/* Removed stock warning since users can request any quantity */}
                        <p className="stock-info">Available Stock: {item.stockQuantity || 0}</p>
                      </div>

                      <div className="item-price">${item.priceAtTime?.toFixed(2) || '0.00'}</div>

                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <div className="item-total">${item.total?.toFixed(2) || '0.00'}</div>

                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">🛒</div>
                  <h3>Your cart is empty</h3>
                  <p>Add some products to get started</p>
                  <button className="browse-products-btn" onClick={handleContinueShopping}>
                    Browse Products
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            {cartData && cartData.cartItems && cartData.cartItems.length > 0 && (
              <div className="order-summary-section">
                <div className="order-summary">
                  <h3>Order Summary</h3>

                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <div className="summary-row">
                    <span>Quantity</span>
                    <span>{totalQuantity} items</span>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>

                  <button 
                    className="checkout-btn"
                    onClick={handleProceedToCheckout}
                    disabled={totalQuantity === 0}
                  >
                    Proceed to Checkout →
                  </button>

                  <button 
                    className="continue-shopping-link"
                    onClick={handleContinueShopping}
                  >
                    Continue Shopping
                  </button>

                  <div className="payment-methods">
                    <p>We accept:</p>
                    <div className="payment-icons">
                      <div className="payment-icon">💳</div>
                      <div className="payment-icon">💰</div>
                      <div className="payment-icon">🏦</div>
                      <div className="payment-icon">📱</div>
                    </div>
                  </div>

                  {grandTotal >= 100 && (
                    <div className="shipping-info">
                      <div className="shipping-badge">
                        ✅ Your order qualifies for free shipping!
                      </div>
                    </div>
                  )}

                  {/* Note about quantity requests */}
                  <div className="quantity-note">
                    <p>💡 <strong>Note:</strong> You can request any quantity regardless of current stock. 
                    The supplier will fulfill based on availability.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;