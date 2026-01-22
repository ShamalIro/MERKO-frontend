import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Products.css';

const Products = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierName, setSupplierName] = useState('Supplier');

  const categories = ['All', 'Accessories', 'Electronics', 'Tools', 'Kits'];

  // Fetch supplier info and products
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('merko_token');
      const userType = localStorage.getItem('merko_user_type');
      const userRole = localStorage.getItem('merko_user_role');
      
      console.log('Authentication check:', { token: !!token, userType, userRole });
      
      // Check if user is logged in and has the right role
      if (!token || userType !== 'user' || (userRole !== 'SUPPLIER' && userRole !== 'Supplier')) {
        console.log('Authentication failed. Redirecting to login...');
        setError('Please log in as a supplier to access this page');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Quick backend health check
        try {
          await axios.get('http://localhost:8090/api/products/all?userEmail=healthcheck@test.com&role=MERCHANT');
          console.log('Backend health check: OK');
        } catch (healthErr) {
          console.warn('Backend health check failed:', healthErr);
          setError('Backend server is not responding. Please ensure the backend is running on port 8090.');
          return;
        }
        
        // Get user email from stored user data
        const storedUser = localStorage.getItem('merko_user');
        console.log('Stored user data:', storedUser);
        
        let userEmail = null;
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userEmail = parsedUser.email;
            console.log('Parsed user email:', userEmail);
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }
        
        if (!userEmail) {
          console.error('No user email found in localStorage');
          setError('Session expired. Please log in again to access your products');
          navigate('/login');
          return;
        }

        // Try to fetch supplier info first
        try {
          const supplierResponse = await axios.get('http://localhost:8090/api/suppliers/me', {
            params: { userEmail: userEmail },
            headers: { Authorization: `Bearer ${token}` }
          });
          setSupplierName(supplierResponse.data.name || supplierResponse.data.companyName || 'Supplier');
        } catch (supplierErr) {
          console.warn('Could not fetch supplier info:', supplierErr);
          setSupplierName('Supplier');
        }

        // First try the /all endpoint as it's more reliable
        try {
          console.log('Attempting to fetch products with /all endpoint...');
          const allProductsResponse = await axios.get('http://localhost:8090/api/products/all', {
            params: { userEmail: userEmail, role: 'SUPPLIER' },
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const allProducts = allProductsResponse.data || [];
          console.log('Products loaded from /all endpoint:', allProducts.length);
          setProducts(allProducts);
          setError(null);
          
        } catch (allProductsErr) {
          console.error('Error fetching from /all endpoint:', allProductsErr);
          
          // Fallback to /my-products endpoint
          try {
            console.log('Attempting fallback with /my-products endpoint...');
            const productsResponse = await axios.get('http://localhost:8090/api/products/my-products', {
              params: { userEmail: userEmail },
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Products response from /my-products:', productsResponse.data);
            setProducts(productsResponse.data || []);
            setError(null);
            
          } catch (myProductsErr) {
            console.error('Both endpoints failed:', { allProductsErr, myProductsErr });
            throw allProductsErr; // Throw the first error
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          localStorage.clear(); // Clear all localStorage data
          navigate('/login');
        } else if (err.response?.status === 500) {
          setError('Server error: User not found in system. Please contact administrator.');
        } else if (err.message?.includes('User email not found')) {
          setError('Please log in again to access your products');
          navigate('/login');
        } else {
          setError('Failed to load products. Please check your connection and try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.productName.localeCompare(b.productName);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'stock':
          return (a.stockQuantity || 0) - (b.stockQuantity || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const getStatusInfo = (product) => {
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
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('merko_token');
      
      // Get user email for the request
      const storedUser = localStorage.getItem('merko_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : null;
      
      if (!userEmail) {
        alert('Please log in again to delete products');
        navigate('/login');
        return;
      }

      const url = `http://localhost:8090/api/products/${productId}?userEmail=${encodeURIComponent(userEmail)}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove from local state
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      alert(errorMessage);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="supplier-dashboard-luxury">
        <div className="luxury-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="loading-container-luxury">
          <div className="loading-spinner-luxury"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-dashboard-luxury">
      {/* Animated Background Elements */}
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
        {/* Header */}
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

        {/* Products Content */}
        <div className="dashboard-content-luxury">
          <motion.div 
            className="page-header-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Product Management</h2>
            <div className="header-actions-luxury">
              <motion.button 
                className="import-btn-luxury"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation('/supplier/import-products')}
              >
                <span className="import-icon">📤</span>
                Import Products
              </motion.button>
              <motion.button 
                className="add-product-btn-luxury"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation('/supplier/add-product')}
              >
                <span className="add-icon">➕</span>
                Add New Product
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              className="error-message-luxury"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
              <button 
                onClick={() => {
                  // Set up test user data for debugging
                  localStorage.setItem('merko_token', 'test-token-123');
                  localStorage.setItem('merko_user_type', 'user');
                  localStorage.setItem('merko_user_role', 'SUPPLIER');
                  localStorage.setItem('merko_user', JSON.stringify({
                    id: 1,
                    email: 'test@supplier.com',
                    firstName: 'Test',
                    lastName: 'Supplier',
                    role: 'SUPPLIER'
                  }));
                  window.location.reload();
                }}
                style={{ marginLeft: '10px' }}
              >
                Set Test User Data
              </button>
              
              {/* Debug Information */}
              <details style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                <summary>Debug Info (Click to expand)</summary>
                <div style={{ marginTop: '5px', textAlign: 'left' }}>
                  <p>Token: {localStorage.getItem('merko_token') ? '✓ Present' : '✗ Missing'}</p>
                  <p>User Type: {localStorage.getItem('merko_user_type') || 'Not set'}</p>
                  <p>User Role: {localStorage.getItem('merko_user_role') || 'Not set'}</p>
                  <p>User Data: {localStorage.getItem('merko_user') ? '✓ Present' : '✗ Missing'}</p>
                  {localStorage.getItem('merko_user') && (
                    <p>User Email: {(() => {
                      try {
                        return JSON.parse(localStorage.getItem('merko_user')).email || 'No email in user data';
                      } catch (e) {
                        return 'Error parsing user data';
                      }
                    })()}</p>
                  )}
                  <p>Backend Status: <a href="http://localhost:8090/api/products/all?userEmail=test@test.com&role=MERCHANT" target="_blank" rel="noopener noreferrer">Test API</a></p>
                </div>
              </details>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div 
            className="filters-section-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="search-box-luxury">
              <span className="search-icon-luxury">🔍</span>
              <input
                type="text"
                placeholder="Search products by name, SKU, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls-luxury">
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="category-filter-luxury"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-filter-luxury"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </motion.div>

          {/* Products Table */}
          <motion.div 
            className="products-table-section-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {filteredProducts.length === 0 ? (
              <div className="no-products-luxury">
                <div className="no-products-icon-luxury">📦</div>
                <h3>No products found</h3>
                <p>
                  {products.length === 0 
                    ? "You haven't added any products yet. Click 'Add New Product' to get started!"
                    : "No products match your search criteria."
                  }
                </p>
                {products.length === 0 && (
                  <motion.button 
                    className="add-product-btn-luxury" 
                    onClick={() => handleNavigation('/supplier/add-product')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ➕ Add Your First Product
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="table-container-luxury">
                  <div className="products-table-luxury">
                    <div className="table-header-luxury">
                      <div className="header-cell-luxury">SKU</div>
                      <div className="header-cell-l极速ury">Product Name</div>
                      <div className="header-cell-luxury">Category</div>
                      <div className="header-cell-luxury">Brand</div>
                      <div className="header-cell-luxury">Price</div>
                      <div className="header-cell-luxury">Stock</div>
                      <div className="header-cell-luxury">Status</div>
                      <div className="header-cell-luxury">Actions</div>
                    </div>
                    <div className="table-body-luxury">
                      {filteredProducts.map((product) => {
                        const statusInfo = getStatusInfo(product);
                        return (
                          <div key={product.id} className="table-row-luxury">
                            <div className="table-cell-luxury product-sku-luxury">{product.sku || 'N/A'}</div>
                            <div className="table-cell-luxury product-name-luxury">{product.productName}</div>
                            <div className="table-cell-luxury category-luxury">{product.category}</div>
                            <div className="table-cell-luxury brand-luxury">{product.brand || 'N/A'}</div>
                            <div className="table-cell-luxury price-luxury">
                              ${product.price ? product.price.toFixed(2) : '0.00'}
                            </div>
                            <div className="table-cell-luxury stock-luxury">{product.stockQuantity || 0}</div>
                            <div className="table-cell-luxury status-luxury">
                              <span className={`status-badge-luxury ${statusInfo.class}`}>
                                {statusInfo.status}
                              </span>
                            </div>
                            <div className="table-cell-luxury actions-luxury">
                              <button 
                                className="action-btn-luxury view-btn-luxury" 
                                title="View"
                                onClick={() => handleNavigation(`/supplier/product/${product.id}`)}
                              >
                                👁️
                              </button>
                              <button 
                                className="action-btn-luxury edit-btn-luxury" 
                                title="Edit"
                                onClick={() => handleNavigation(`/supplier/edit-product/${product.id}`)}
                              >
                                ✏️
                              </button>
                              <button 
                                className="action-btn-luxury delete-btn-luxury" 
                                title="Delete"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Pagination Info */}
                <div className="pagination-luxury">
                  <span className="pagination-info-luxury">
                    Showing {filteredProducts.length} of {products.length} products
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Product Summary Stats */}
          {products.length > 0 && (
            <motion.div 
              className="performance-section-luxury"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3>Product Overview</h3>
              <div className="stats-grid-luxury">
                <motion.div 
                  className="stat-card-luxury"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="stat-icon-luxury products-icon-luxury">
                    <div className="icon-3d-container">
                      <div className="placeholder-3d-icon">📦</div>
                    </div>
                  </div>
                  <div className="stat-content-luxury">
                    <div className="stat-value-luxury">{products.length}</div>
                    <div className="stat-label-luxury">Total Products</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="stat-card-luxury"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="stat-icon-luxury orders-icon-luxury">
                    <div className="icon-3d-container">
                      <div className="placeholder-3d-icon">✅</div>
                    </div>
                  </div>
                  <div className="stat-content-luxury">
                    <div className="stat-value-luxury">
                      {products.filter(p => {
                        const stock = p.stockQuantity || 0;
                        const threshold = p.lowStockAlert || 5;
                        return stock > threshold;
                      }).length}
                    </div>
                    <div className="stat-label-luxury">In Stock</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="stat-card-luxury"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="stat-icon-luxury revenue-icon-luxury">
                    <div className="icon-3d-container">
                      <div className="placeholder-3d-icon">⚠️</div>
                    </div>
                  </div>
                  <div className="stat-content-luxury">
                    <div className="stat-value-luxury">
                      {products.filter(p => {
                        const stock = p.stockQuantity || 0;
                        const threshold = p.lowStockAlert || 5;
                        return stock <= threshold && stock > 0;
                      }).length}
                    </div>
                    <div className="stat-label-luxury">Low Stock</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="stat-card-luxury"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="stat-icon-luxury growth-icon-luxury">
                    <div className="icon-3极速-container">
                      <div className="placeholder-3d-icon">❌</div>
                    </div>
                  </div>
                  <div className="stat-content-luxury">
                    <div className="stat-value-luxury">
                      {products.filter(p => (p.stockQuantity || 0) === 0).length}
                    </div>
                    <div className="stat-label-luxury">Out of Stock</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;