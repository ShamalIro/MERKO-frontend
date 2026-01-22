import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './ProductView.css';

const ProductView = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierName, setSupplierName] = useState('Supplier');

  // Helper function to get image URL
  const getImageUrl = useCallback((imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `http://localhost:8090/${cleanPath}`;
  }, []);

  // Fetch product data
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      const token = localStorage.getItem('merko_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get user email from stored user data
      const storedUser = localStorage.getItem('merko_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : null;
      
      if (!userEmail) {
        navigate('/login');
        return;
      }

      try {
        if (isMounted) setLoading(true);
        
        const [supplierResponse, productResponse] = await Promise.all([
          axios.get('http://localhost:8090/api/suppliers/me', {
            params: { userEmail: userEmail },
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:8090/api/products/${productId}`, {
            params: { userEmail: userEmail },
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (isMounted) {
          setSupplierName(supplierResponse.data.name || 'Supplier');
          setProduct(productResponse.data);
          setError(null);
          setActiveImageIndex(0);
        }
        
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Error fetching product:', err);
        if (err.response?.status === 404) {
          setError('Product not found');
        } else if (err.response?.status === 403) {
          setError('Access denied to this product');
        } else if (err.response?.status === 401) {
          navigate('/login');
          return;
        } else {
          setError('Failed to load product details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [productId, navigate]);

  const getStatusInfo = useCallback((product) => {
    if (!product) return { status: 'Unknown', class: 'status-inactive' };
    
    const stock = product.stockQuantity || 0;
    const lowStockThreshold = product.lowStockAlert || 5;

    if (stock === 0) {
      return { status: 'Out of Stock', class: 'status-out-stock' };
    } else if (stock <= lowStockThreshold) {
      return { status: 'Low Stock', class: 'status-low-stock' };
    } else if (product.status === 'Active') {
      return { status: 'Active', class: 'status-active' };
    } else {
      return { status: product.status || 'Unknown', class: 'status-inactive' };
    }
  }, []);

  const calculateProfit = useCallback(() => {
    if (product?.price && product?.cost) {
      return Number(product.price) - Number(product.cost);
    }
    return 0;
  }, [product]);

  const formatFeatures = useCallback((featuresString) => {
    if (!featuresString) return [];
    return featuresString.split('\n').filter(feature => feature.trim());
  }, []);

  const formatCareInstructions = useCallback((careString) => {
    if (!careString) return [];
    return careString.split('\n').filter(instruction => instruction.trim());
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleEditProduct = useCallback(() => {
    navigate(`/supplier/edit-product/${productId}`);
  }, [navigate, productId]);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="product-view-luxury">
        <div className="loading-container-luxury">
          <div className="loading-spinner-luxury"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-view-luxury">
        <div className="error-container-luxury">
          <h2>Error</h2>
          <p>{error}</p>
          <motion.button 
            onClick={() => navigate('/supplier/products')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Products
          </motion.button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const statusInfo = getStatusInfo(product);
  const profit = calculateProfit();
  const profitMargin = product.profitMargin || (product.price && product.cost ? ((profit / Number(product.cost)) * 100).toFixed(2) : 0);

  return (
    <div className="product-view-luxury">
      {/* Luxury Background */}
      <div className="luxury-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Sidebar */}
      <motion.div 
        className="sidebar-luxury"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="sidebar-header-luxury">
          <div className="supplier-logo-luxury">
            <div className="logo-icon-luxury">
              <div className="logo-3d-container">
                <div className="placeholder-3d-logo">📦</div>
              </div>
            </div>
            <div className="logo-text-luxury">
              <div className="portal-name-luxury">Supplier Portal</div>
              <div className="company-name-luxury">{supplierName}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav-luxury">
          <motion.div 
            className="nav-item-luxury"
            onClick={() => handleNavigation('/supplier/dashboard')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">📊</span>
            <span className="nav-text-luxury">Dashboard</span>
          </motion.div>
          <motion.div 
            className="nav-item-luxury active"
            onClick={() => handleNavigation('/supplier/products')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">📦</span>
            <span className="nav-text-luxury">Products</span>
          </motion.div>
          <motion.div 
            className="nav-item-luxury"
            onClick={() => handleNavigation('/supplier/inventory')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">📋</span>
            <span className="nav-text-luxury">Inventory</span>
          </motion.div>
          <motion.div 
            className="nav-item-luxury"
            onClick={() => handleNavigation('/supplier/orders')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">🛒</span>
            <span className="nav-text-luxury">Orders</span>
          </motion.div>
          <motion.div 
            className="nav-item-luxury"
            onClick={() => handleNavigation('/supplier/settings')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">⚙️</span>
            <span className="nav-text-luxury">Settings</span>
          </motion.div>
          <motion.div 
            className="nav-item-luxury"
            onClick={() => handleNavigation('/supplier/help')}
            whileHover={{ x: 10, transition: { duration: 0.2 } }}
          >
            <span className="nav-icon-luxury">❓</span>
            <span className="nav-text-luxury">Help Center</span>
          </motion.div>
        </nav>

        <div className="sidebar-footer-luxury">
          <motion.button 
            className="switch-role-btn-luxury" 
            onClick={() => handleNavigation('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="switch-icon-luxury">🔄</span>
            Switch Role
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="main-content-luxury">
        <motion.header 
          className="header-luxury"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="header-left-luxury">
            <div className="welcome-section-luxury">
              <h1>Welcome back, <span className="gradient-text">{supplierName}</span></h1>
              <p className="current-date-luxury">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="header-right-luxury">
            <motion.button 
              className="notification-btn-luxury"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="notification-icon">🔔</span>
              <span className="notification-badge-luxury">3</span>
            </motion.button>
            <motion.div 
              className="user-profile-luxury"
              whileHover={{ scale: 1.05 }}
            >
              <div className="profile-avatar-luxury">{getInitials(supplierName)}</div>
            </motion.div>
          </div>
        </motion.header>

        {/* Product View Content */}
        <div className="product-view-content-luxury">
          {/* Page Header */}
          <motion.div 
            className="page-header-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Product: {product.productName}</h2>
            <motion.button 
              className="edit-product-btn-luxury"
              onClick={handleEditProduct}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="edit-icon">✏️</span>
              Edit Product
            </motion.button>
          </motion.div>

          {/* Product Details Grid */}
          <div className="product-details-grid-luxury">
            {/* Left Column - Product Images and Info */}
            <div className="left-column-luxury">
              {/* Product Images */}
              <motion.div 
                className="product-images-luxury"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="main-image-luxury">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={getImageUrl(product.images[activeImageIndex]?.imageUrl)}
                      alt={product.productName}
                      onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="image-placeholder-luxury">Image Not Available</div>';
                      }}
                    />
                  ) : (
                    <div className="image-placeholder-luxury">
                      No Image Available
                    </div>
                  )}
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="image-thumbnails-luxury">
                    {product.images.map((image, index) => (
                      <motion.div 
                        key={index}
                        className={`thumbnail-luxury ${index === activeImageIndex ? 'active' : ''}`}
                        onClick={() => setActiveImageIndex(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img 
                          src={getImageUrl(image.imageUrl)}
                          alt={`${product.productName} ${index + 1}`}
                          onError={(e) => {
                            console.error('Thumbnail failed to load:', e.target.src);
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Information */}
              <motion.div 
                className="quick-info-card-luxury"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3>Quick Information</h3>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">🏷️</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">SKU</div>
                    <div className="info-value-luxury">{product.sku || 'Not specified'}</div>
                  </div>
                </div>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">📦</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">Inventory</div>
                    <div className="info-value-luxury">{product.stockQuantity || 0} units in stock</div>
                  </div>
                </div>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">💰</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">Price</div>
                    <div className="info-value-luxury">
                      ${product.price ? Number(product.price).toFixed(2) : '0.00'}
                      {product.comparePrice && (
                        <span className="old-price-luxury"> ${Number(product.comparePrice).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">📊</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">Status</div>
                    <div className="info-value-luxury">
                      <span className={`status-badge-luxury ${statusInfo.class}`}>{statusInfo.status}</span>
                    </div>
                  </div>
                </div>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">⚖️</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">Weight</div>
                    <div className="info-value-luxury">{product.weight ? `${product.weight} kg` : 'Not specified'}</div>
                  </div>
                </div>
                <div className="info-item-luxury">
                  <span className="info-icon-luxury">📈</span>
                  <div className="info-content-luxury">
                    <div className="info-label-luxury">Sales</div>
                    <div className="info-value-luxury">0 total units sold</div>
                    <div className="info-subtext-luxury">Last month: 0 units</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Product Details */}
            <div className="right-column-luxury">
              {/* Product Header */}
              <motion.div 
                className="product-header-luxury"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h1>{product.productName}</h1>
                <div className="product-meta-luxury">
                  <span className="product-id-luxury">ID: {product.id}</span>
                  <span className="product-category-luxury">Category: {product.category}</span>
                </div>
                <div className="pricing-header-luxury">
                  <div className="price-item-luxury">
                    <span className="price-label-luxury">Cost Price</span>
                    <span className="price-value-luxury">${product.cost ? Number(product.cost).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="price-item-luxury">
                    <span className="price-label-luxury">Selling Price</span>
                    <span className="price-value-luxury">${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div 
                className="product-section-luxury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3>Description</h3>
                <p>{product.description || 'No description provided'}</p>
              </motion.div>

              {/* Features & Benefits */}
              <motion.div 
                className="features-section-luxury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="features-column-luxury">
                  <h3>Features & Benefits</h3>
                  {formatFeatures(product.features).length > 0 ? (
                    <ul className="features-list-luxury">
                      {formatFeatures(product.features).map((feature, index) => (
                        <li key={index}>
                          <span className="bullet-luxury">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No features specified</p>
                  )}
                </div>
                <div className="care-column-luxury">
                  <h3>Care Instructions</h3>
                  {formatCareInstructions(product.careInstructions).length > 0 ? (
                    <ul className="care-list-luxury">
                      {formatCareInstructions(product.careInstructions).map((instruction, index) => (
                        <li key={index}>
                          <span className="bullet-luxury">•</span>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No care instructions provided</p>
                  )}
                </div>
              </motion.div>

              {/* Pricing Details */}
              <motion.div 
                className="pricing-section-luxury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3>💰 Pricing Details</h3>
                <div className="pricing-grid-luxury">
                  <div className="pricing-item-luxury">
                    <span className="pricing-label-luxury">Cost Price</span>
                    <span className="pricing-value-luxury">${product.cost ? Number(product.cost).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="pricing-item-luxury">
                    <span className="pricing-label-luxury">Selling Price</span>
                    <span className="pricing-value-luxury">${product.price ? Number(product.price).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="pricing-item-luxury">
                    <span className="pricing-label-luxury">Compare at Price</span>
                    <span className="pricing-value-luxury">${product.comparePrice ? Number(product.comparePrice).toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="pricing-item-luxury">
                    <span className="pricing-label-luxury">Profit</span>
                    <span className="pricing-value-luxury">${profit.toFixed(2)}</span>
                  </div>
                  <div className="pricing-item-luxury profit-margin-luxury">
                    <span className="pricing-label-luxury">Profit Margin</span>
                    <span className="pricing-value-luxury profit-luxury">{profitMargin}%</span>
                  </div>
                </div>
              </motion.div>

              {/* Inventory Details */}
              <motion.div 
                className="inventory-section-luxury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3>📊 Inventory Details</h3>
                <div className="inventory-grid-luxury">
                  <div className="inventory-item-luxury">
                    <span className="inventory-label-luxury">Current Stock</span>
                    <span className="inventory-value-luxury">{product.stockQuantity || 0} units</span>
                  </div>
                  <div className="inventory-item-luxury">
                    <span className="inventory-label-luxury">Low Stock Alert</span>
                    <span className="inventory-value-luxury">{product.lowStockAlert || 0} units</span>
                  </div>
                  <div className="inventory-item-luxury">
                    <span className="inventory-label-luxury">Track Inventory</span>
                    <span className="inventory-value-luxury">{product.trackInventory || 'Yes'}</span>
                  </div>
                  <div className="inventory-item-luxury">
                    <span className="inventory-label-luxury">Barcode</span>
                    <span className="inventory-value-luxury">{product.barcode || 'Not specified'}</span>
                  </div>
                  <div className="inventory-item-luxury">
                    <span className="inventory-label-luxury">Weight</span>
                    <span className="inventory-value-luxury">{product.weight ? `${product.weight} kg` : 'Not specified'}</span>
                  </div>
                </div>
              </motion.div>

              {/* Additional Information */}
              <motion.div 
                className="additional-info-section-luxury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h3>Additional Information</h3>
                <div className="additional-info-grid-luxury">
                  <div className="additional-info-item-luxury">
                    <span className="additional-info-label-luxury">Brand</span>
                    <span className="additional-info-value-luxury">{product.brand || 'Not specified'}</span>
                  </div>
                  <div className="additional-info-item-luxury">
                    <span className="additional-info-label-luxury">Country of Origin</span>
                    <span className="additional-info-value-luxury">{product.countryOfOrigin || 'Not specified'}</span>
                  </div>
                  <div className="additional-info-item-luxury">
                    <span className="additional-info-label-luxury">Added to Catalog</span>
                    <span className="additional-info-value-luxury">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;