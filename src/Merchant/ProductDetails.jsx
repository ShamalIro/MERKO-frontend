import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [merchantData, setMerchantData] = useState({
    companyName: 'ABC Retail',
    name: 'John Merchant',
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchMerchant = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:8090/api/merchants/me', {
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
    const fetchProductDetails = async () => {
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
        // For merchants, we'll get product details from the /all endpoint and filter
        // Get user email from stored user data
        const storedUser = localStorage.getItem('merko_user');
        const userEmail = storedUser ? JSON.parse(storedUser).email : null;
        const userRole = localStorage.getItem('merko_user_role');
        
        if (!userEmail) {
          throw new Error('User email not found');
        }
        
        const response = await axios.get('http://localhost:8090/api/products/all', {
          params: { userEmail: userEmail, role: userRole },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const foundProduct = response.data.find(p => p.id === parseInt(id));
        if (!foundProduct) {
          setError('Product not found');
          return;
        }

        // Map the product data similar to Products.jsx
        const mappedProduct = {
          id: foundProduct.id,
          productName: foundProduct.productName,
          description: foundProduct.description,
          sku: foundProduct.sku,
          category: foundProduct.category,
          price: foundProduct.price,
          stockQuantity: foundProduct.stockQuantity,
          weight: foundProduct.weight,
          status: foundProduct.status,
          features: foundProduct.features,
          careInstructions: foundProduct.careInstructions,
          brand: foundProduct.brand,
          countryOfOrigin: foundProduct.countryOfOrigin,
          supplier: {
            companyName: foundProduct.supplierCompanyName || 'Quality Supplier'
          },
          images: (foundProduct.imageUrls || []).map(url => ({
            imageUrl: url
          }))
        };
        
        setProduct(mappedProduct);
        setError('');
      } catch (err) {
        console.error('Error fetching product details:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to load product details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id, navigate]);

  const handleSidebarNavigation = (item) => {
    switch (item) {
      case 'dashboard': navigate('/merchant/dashboard'); break;
      case 'products': navigate('/merchant/products'); break;
      case 'suppliers': navigate('/merchant/suppliers'); break;
      case 'cart': navigate('/merchant/cart'); break;
      case 'orders': navigate('/merchant/orders'); break;
      case 'inquiries': navigate('/merchant/inquiries'); break;
      case 'settings': navigate('/merchant/settings'); break;
      case 'help': navigate('/merchant/help'); break;
      default: break;
    }
  };

  const handleRoleSwitch = () => navigate('/');

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8090/api/cart/add', {
        productId: product.id,
        quantity: quantity
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`${product.productName} (${quantity}) added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const getProductImage = (imageObj) => {
    if (imageObj && imageObj.imageUrl) {
      const imageUrl = imageObj.imageUrl;
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:8090${imageUrl}`;
      } else {
        return `http://localhost:8090/uploads/${imageUrl}`;
      }
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&sig=${product?.id}`;
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JM';

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/merchant/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <h3>Product Not Found</h3>
          <p>The requested product could not be found.</p>
          <button onClick={() => navigate('/merchant/products')} className="back-btn">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Sidebar */}
      <div className="product-details-sidebar">
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
              className={`nav-item ${item.key === 'products' ? 'active' : ''}`} 
              onClick={() => handleSidebarNavigation(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.label}</span>
              {item.key === 'cart' && <span className="cart-badge">3</span>}
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
      <div className="product-details-main">
        {/* Header */}
        <div className="product-details-header">
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

        {/* Content */}
        <div className="product-details-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span onClick={() => navigate('/merchant/products')} className="breadcrumb-link">Products</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{product.productName}</span>
          </div>

          {/* Product Details */}
          <div className="product-details-container">
            {/* Image Gallery */}
            <div className="product-images-section">
              <div className="main-image-container">
                {product.images && product.images.length > 0 && !imageErrors[currentImageIndex] ? (
                  <img 
                    src={getProductImage(product.images[currentImageIndex])} 
                    alt={product.productName}
                    className="main-product-image"
                    onError={() => handleImageError(currentImageIndex)}
                  />
                ) : (
                  <div className="main-image-placeholder">
                    <span className="placeholder-icon">📦</span>
                    <p>No image available</p>
                  </div>
                )}
                
                {product.images && product.images.length > 1 && (
                  <>
                    <button className="image-nav-btn prev-btn" onClick={prevImage}>‹</button>
                    <button className="image-nav-btn next-btn" onClick={nextImage}>›</button>
                  </>
                )}
              </div>

              {product.images && product.images.length > 1 && (
                <div className="thumbnail-container">
                  {product.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      {!imageErrors[index] ? (
                        <img 
                          src={getProductImage(image)} 
                          alt={`${product.productName} ${index + 1}`}
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="thumbnail-placeholder">📦</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="product-info-section">
              <div className="product-header-info">
                <h1 className="product-title">{product.productName}</h1>
                <div className="product-meta">
                  <span className="product-brand">{product.brand || 'Premium Brand'}</span>
                  <span className="product-category">Category: {product.category}</span>
                </div>
              </div>

              <div className="product-price-section">
                <div className="price-display">
                  <span className="current-price">${product.price}</span>
                  <span className="stock-info">In Stock ({product.stockQuantity} available)</span>
                </div>
              </div>

              <div className="supplier-info">
                <h3>Supplier Information</h3>
                <p className="supplier-name">{product.supplier?.companyName}</p>
                <p className="country-origin">Country of Origin: {product.countryOfOrigin || 'Not specified'}</p>
              </div>

              {product.description && (
                <div className="product-description">
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                </div>
              )}

              {product.features && (
                <div className="product-features">
                  <h3>Features</h3>
                  <p>{product.features}</p>
                </div>
              )}

              {product.careInstructions && (
                <div className="care-instructions">
                  <h3>Care Instructions</h3>
                  <p>{product.careInstructions}</p>
                </div>
              )}

              <div className="product-specifications">
                <h3>Specifications</h3>
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Weight:</span>
                    <span className="spec-value">{product.weight || 'Not specified'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">SKU:</span>
                    <span className="spec-value">{product.sku || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Section */}
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn" 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      id="quantity" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      // Removed the max attribute to allow any quantity
                    />
                    <button 
                      className="quantity-btn" 
                      onClick={() => setQuantity(quantity + 1)}
                      // Removed the stock quantity restriction
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                  <button 
                    className="back-to-products-btn"
                    onClick={() => navigate('/merchant/products')}
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;