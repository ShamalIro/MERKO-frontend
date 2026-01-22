import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [merchantData, setMerchantData] = useState({
    companyName: 'ABC Retail',
    name: 'John Merchant',
  });
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];

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
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
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
        // Get user email from stored user data
        const storedUser = localStorage.getItem('merko_user');
        const userEmail = storedUser ? JSON.parse(storedUser).email : null;
        const userRole = localStorage.getItem('merko_user_role');
        
        if (!userEmail) {
          console.error('No user email found in localStorage');
          setError('Please log in again to access products');
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:8090/api/products/all', {
          params: { userEmail: userEmail, role: userRole },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Products response:', response.data);
        
        const mappedProducts = response.data.map(product => ({
          id: product.id,
          productName: product.productName,
          description: product.description,
          sku: product.sku,
          category: product.category,
          price: product.price,
          cost: product.cost,
          stockQuantity: product.stockQuantity,
          weight: product.weight,
          status: product.status,
          barcode: product.barcode,
          lowStockAlert: product.lowStockAlert,
          trackInventory: product.trackInventory,
          comparePrice: product.comparePrice,
          profitMargin: product.profitMargin,
          features: product.features,
          careInstructions: product.careInstructions,
          brand: product.brand,
          countryOfOrigin: product.countryOfOrigin,
          supplier: {
            companyName: product.supplierCompanyName || 'Unknown Supplier'
          },
          images: (product.imageUrls || []).map(url => ({
            imageUrl: url
          }))
        }));
        
        setProducts(mappedProducts);
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response?.status === 500) {
          setError('Server error. Please contact administrator or try logging in again.');
        } else if (err.message.includes('User email not found')) {
          setError('Please log in again to access products');
          navigate('/login');
        } else {
          setError('Failed to load products from server');
          setSampleProducts();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const setSampleProducts = () => {
    const sampleProducts = [
      {
        id: 1,
        productName: 'Wireless Mouse',
        supplier: { companyName: 'Gadget World' },
        price: 29.99,
        description: 'High-precision wireless mouse with ergonomic design and long battery life.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Electronics',
        stockQuantity: 50,
        status: 'Active',
        brand: 'Logitech'
      },
      {
        id: 2,
        productName: 'Mechanical Keyboard',
        supplier: { companyName: 'Gadget World' },
        price: 129.99,
        description: 'Premium mechanical keyboard with RGB backlighting and tactile switches.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Electronics',
        stockQuantity: 30,
        status: 'Active',
        brand: 'Corsair'
      },
      {
        id: 3,
        productName: 'Gaming Headset',
        supplier: { companyName: 'Gadget World' },
        price: 89.99,
        description: 'Professional gaming headset with surround sound and noise-canceling microphone.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Electronics',
        stockQuantity: 25,
        status: 'Active',
        brand: 'SteelSeries'
      },
      {
        id: 4,
        productName: 'Ultrabook Laptop',
        supplier: { companyName: 'Tech Solutions' },
        price: 999.99,
        description: 'Lightweight ultrabook with powerful processor and all-day battery life.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Electronics',
        stockQuantity: 15,
        status: 'Active',
        brand: 'Dell'
      },
      {
        id: 5,
        productName: 'Digital Camera',
        supplier: { companyName: 'Photo Pro' },
        price: 699.99,
        description: 'Professional digital camera with 4K video recording and advanced image stabilization.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Electronics',
        stockQuantity: 20,
        status: 'Active',
        brand: 'Canon'
      },
      {
        id: 6,
        productName: 'Wireless Headphones',
        supplier: { companyName: 'Audio Masters' },
        price: 199.99,
        description: 'Premium wireless headphones with active noise cancellation and premium sound quality.',
        images: [{ imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' }],
        category: 'Audio',
        stockQuantity: 35,
        status: 'Active',
        brand: 'Sony'
      }
    ];
    setProducts(sampleProducts);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.supplier?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSidebarNavigation = (item) => {
    switch (item) {
      case 'dashboard': navigate('/merchant/dashboard'); break;
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

  const handleAddToCart = async (product, event) => {
    // Prevent the click from bubbling up to the product card
    event.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8090/api/cart/add', {
        productId: product.id,
        quantity: 1
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`${product.productName} added to cart successfully!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to add item to cart. Please try again.');
      }
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/merchant/products/${productId}`);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].imageUrl) {
      const imageUrl = product.images[0].imageUrl;
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:8090${imageUrl}`;
      } else {
        return `http://localhost:8090/uploads/${imageUrl}`;
      }
    }
    return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80&sig=${product.id}`;
  };

  const handleImageError = (productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const calculateRating = () => (4.0 + Math.random()).toFixed(1);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }
    if (hasHalfStar) stars.push(<span key="half" className="star half">★</span>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    return stars;
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JM';

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Sidebar */}
      <div className="products-sidebar">
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
      <div className="products-main">
        {/* Header */}
        <div className="products-header">
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
        <div className="products-content">
          {/* Page Title */}
          <div className="page-title-section">
            <h2>Product Catalog</h2>
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="search-filter-section">
            <div className="search-container">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="search-input" 
              />
            </div>
            <div className="filter-container">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                className="category-filter"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {/* Products Grid */}
          <div className={`products-grid ${viewMode}`}>
            {filteredProducts.map((product, index) => {
              const rating = parseFloat(calculateRating());
              const hasImageError = imageErrors[product.id];
              
              return (
                <div 
                  key={product.id} 
                  className="product-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => handleProductClick(product.id)}
                >
                  {/* Product Image */}
                  <div className="product-image-container">
                    <div className="product-image">
                      {!hasImageError ? (
                        <img 
                          src={getProductImage(product)} 
                          alt={product.productName}
                          onError={() => handleImageError(product.id)}
                        />
                      ) : (
                        <div className="product-placeholder show">
                          <span className="placeholder-icon">📦</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      {hoveredProduct === product.id && (
                        <div className="product-hover-info">
                          <div className="hover-content">
                            <h4>{product.brand || 'Premium Brand'}</h4>
                            <p className="hover-category">Category: {product.category || 'Electronics'}</p>
                            <div className="hover-rating">
                              {renderStars(rating)}
                              <span className="rating-value">({rating})</span>
                            </div>
                            <p className="hover-description">
                              {product.description || 'Premium quality product with excellent features and reliable performance.'}
                            </p>
                            <div className="hover-actions">
                              <span className="view-details-hint">Click to view details</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <div className="product-header">
                      <div className="product-text-info">
                        <h3 className="product-name">{product.productName}</h3>
                        <div className="product-price">${product.price}</div>
                      </div>
                      <button 
                        className="cart-icon-btn" 
                        onClick={(e) => handleAddToCart(product, e)} 
                        title="Add to Cart"
                      >
                        🛒
                      </button>
                    </div>
                    
                    <p className="product-supplier">{product.supplier?.companyName || 'Quality Supplier'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Products State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {filteredProducts.length} of {products.length} products
            </div>
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

export default Products;