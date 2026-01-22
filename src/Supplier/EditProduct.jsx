import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EditProduct.css';

const EditProduct = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    sku: '',
    category: 'Accessories',
    price: '',
    cost: '',
    stockQuantity: '',
    weight: '',
    status: 'Active', // Hidden field - default value
    barcode: '',
    lowStockAlert: '',
    trackInventory: 'Yes', // Hidden field - default value
    comparePrice: '',
    profitMargin: '',
    features: '',
    careInstructions: '',
    brand: '',
    countryOfOrigin: ''
  });

  const [images, setImages] = useState([]); // existing images from server: { id, imageUrl, ... }
  const [newImages, setNewImages] = useState([]); // local files: { id, url, file, isNew }
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [supplierName, setSupplierName] = useState('Supplier');

  const categories = ['Accessories', 'Electronics', 'Tools', 'Kits'];
  // Removed statuses and trackOptions since they're now hidden

  // Fetch product data + supplier
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('merko_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Get user email from stored user data
        const storedUser = localStorage.getItem('merko_user');
        const userEmail = storedUser ? JSON.parse(storedUser).email : null;
        
        if (!userEmail) {
          setError('Please log in again to edit products');
          navigate('/login');
          return;
        }

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

        setSupplierName(supplierResponse.data.name || 'Supplier');

        const product = productResponse.data;
        setFormData({
          productName: product.productName || '',
          description: product.description || '',
          sku: product.sku || '',
          category: product.category || 'Accessories',
          price: product.price ? product.price.toString() : '',
          cost: product.cost ? product.cost.toString() : '',
          stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '',
          weight: product.weight ? product.weight.toString() : '',
          status: product.status || 'Active',
          barcode: product.barcode || '',
          lowStockAlert: product.lowStockAlert ? product.lowStockAlert.toString() : '',
          trackInventory: product.trackInventory || 'Yes',
          comparePrice: product.comparePrice ? product.comparePrice.toString() : '',
          profitMargin: product.profitMargin ? product.profitMargin.toString() : '',
          features: product.features || '',
          careInstructions: product.careInstructions || '',
          brand: product.brand || '',
          countryOfOrigin: product.countryOfOrigin || ''
        });

        // Product images expected to be array of objects with id and imageUrl
        setImages(product.images || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
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
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId, navigate]);

  // Function to allow only numbers and decimal point
  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Function for integer-only fields (no decimals)
  const handleIntegerInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only integers
    if (value === '' || /^\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Special handler for text fields (product name, description, etc.)
  const handleTextInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `http://localhost:8090/${cleanPath}`;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentImageCount = images.length + newImages.length;

    if (files.length + currentImageCount <= 5) {
      const fileObjects = files.map((file, index) => ({
        id: `new_${Date.now()}_${index}`,
        url: URL.createObjectURL(file),
        name: file.name,
        file,
        isNew: true
      }));
      setNewImages(prev => [...prev, ...fileObjects]);
    } else {
      alert('Maximum 5 images allowed');
    }

    // Reset input value to allow re-uploading same file if needed
    e.target.value = '';
  };

  const removeExistingImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    setImagesToDelete(prev => {
      // avoid duplicates
      if (prev.includes(imageId)) return prev;
      return [...prev, imageId];
    });
  };

  const removeNewImage = (imageId) => {
    const imageToRemove = newImages.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.url) URL.revokeObjectURL(imageToRemove.url);
    setNewImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleCancel = () => {
    newImages.forEach(img => { if (img.url) URL.revokeObjectURL(img.url); });
    navigate('/supplier/products');
  };

  const validateForm = () => {
    const requiredFields = ['productName', 'description', 'sku', 'price', 'cost', 'stockQuantity', 'weight', 'barcode', 'lowStockAlert', 'comparePrice', 'profitMargin', 'brand', 'countryOfOrigin'];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (images.length === 0 && newImages.length === 0) {
      alert('Please upload at least one product image');
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();

      const productData = {
        productName: formData.productName,
        description: formData.description,
        sku: formData.sku,
        category: formData.category,
        price: formData.price ? Number(formData.price) : null,
        cost: formData.cost ? Number(formData.cost) : null,
        stockQuantity: formData.stockQuantity ? Number(formData.stockQuantity) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        status: formData.status, // Will be 'Active' by default
        barcode: formData.barcode,
        lowStockAlert: formData.lowStockAlert ? Number(formData.lowStockAlert) : null,
        trackInventory: formData.trackInventory, // Will be 'Yes' by default
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : null,
        profitMargin: formData.profitMargin ? Number(formData.profitMargin) : null,
        features: formData.features,
        careInstructions: formData.careInstructions,
        brand: formData.brand,
        countryOfOrigin: formData.countryOfOrigin
      };

      formDataToSend.append('product', JSON.stringify(productData));

      // append new image files (multipart)
      newImages.forEach(image => {
        formDataToSend.append('images', image.file);
      });

      // images to delete as CSV string
      if (imagesToDelete.length > 0) {
        formDataToSend.append('imagesToDelete', imagesToDelete.join(','));
      }

      // Get user email for the request
      const storedUser = localStorage.getItem('merko_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : null;
      
      if (!userEmail) {
        alert('Please log in again to update products');
        navigate('/login');
        return;
      }

      const url = `http://localhost:8090/api/products/${productId}?userEmail=${encodeURIComponent(userEmail)}`;

      await axios.put(
        url,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('merko_token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert('Product updated successfully!');
      newImages.forEach(img => { if (img.url) URL.revokeObjectURL(img.url); });
      navigate('/supplier/products');
    } catch (err) {
      console.error('Error updating product:', err);
      const serverMessage = err?.response?.data?.message || err.message;
      alert(`Error updating product: ${serverMessage}`);
    }
  };

  const handleDeleteProduct = () => {
    setShowDeleteWarning(true);
  };

  const confirmDelete = async () => {
    try {
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
        headers: { Authorization: `Bearer ${localStorage.getItem('merko_token')}` }
      });
      alert('Product deleted successfully!');
      navigate('/supplier/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      const serverMessage = err?.response?.data?.message || err.message;
      alert(`Error deleting product: ${serverMessage}`);
    }
  };

  const cancelDelete = () => setShowDeleteWarning(false);

  const handleNavigation = (path) => navigate(path);

  if (loading) {
    return (
      <div className="edit-product-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-product-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/supplier/products')}>Back to Products</button>
        </div>
      </div>
    );
  }

  const allImages = [...images, ...newImages];

  return (
    <div className="edit-product-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="supplier-logo">
            <div className="logo-icon">📦</div>
            <div className="logo-text">
              <div className="portal-name">Supplier Portal</div>
              <div className="company-name">{supplierName}</div>
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
            <span className="switch-icon">🔄</span> Switch Role
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, {supplierName}</h1>
              <p className="current-date">Today is {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
            <div className="profile-avatar">{supplierName.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        {/* Edit Product Content */}
        <div className="edit-product-content">
          <div className="page-header">
            <h2>Edit Product: {formData.productName}</h2>
          </div>

          <form className="product-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              {/* Left column */}
              <div className="form-section">
                <h3>Product Information</h3>

                <div className="form-group">
                  <label htmlFor="productName">Product Name *</label>
                  <input 
                    type="text" 
                    id="productName" 
                    name="productName"
                    value={formData.productName} 
                    onChange={handleTextInput} 
                    required 
                  />
                  <span className="form-hint">Enter a descriptive name for your product</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sku">SKU *</label>
                    <input 
                      type="text" 
                      id="sku" 
                      name="sku"
                      value={formData.sku} 
                      onChange={handleTextInput} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select 
                      id="category" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleTextInput} 
                      required
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price ($) *</label>
                    <input 
                      type="text" // Changed from number to text
                      id="price" 
                      name="price"
                      value={formData.price} 
                      onChange={handleNumericInput} 
                      placeholder="0.00"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cost">Cost ($) *</label>
                    <input 
                      type="text" // Changed from number to text
                      id="cost" 
                      name="cost"
                      value={formData.cost} 
                      onChange={handleNumericInput} 
                      placeholder="0.00"
                      required 
                    />
                    <span className="form-hint">Your cost to acquire/produce this item</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows="4"
                    value={formData.description} 
                    onChange={handleTextInput} 
                    required 
                  />
                </div>

                <div className="form-row three-cols">
                  <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity *</label>
                    <input 
                      type="text" // Changed from number to text
                      id="stockQuantity" 
                      name="stockQuantity"
                      value={formData.stockQuantity} 
                      onChange={handleIntegerInput} 
                      placeholder="0"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg) *</label>
                    <input 
                      type="text" // Changed from number to text
                      id="weight" 
                      name="weight"
                      value={formData.weight} 
                      onChange={handleNumericInput} 
                      placeholder="0.00"
                      required 
                    />
                  </div>
                  {/* Hidden status field */}
                  <input type="hidden" name="status" value="Active" />
                </div>

                <h4>Additional Details</h4>

                <div className="form-group">
                  <label htmlFor="features">Features & Benefits</label>
                  <textarea 
                    id="features" 
                    name="features" 
                    rows="4"
                    value={formData.features} 
                    onChange={handleTextInput} 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="careInstructions">Care Instructions</label>
                  <textarea 
                    id="careInstructions" 
                    name="careInstructions" 
                    rows="3"
                    value={formData.careInstructions} 
                    onChange={handleTextInput} 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="brand">Brand *</label>
                    <input 
                      type="text" 
                      id="brand" 
                      name="brand"
                      value={formData.brand} 
                      onChange={handleTextInput} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="countryOfOrigin">Country of Origin *</label>
                    <input 
                      type="text" 
                      id="countryOfOrigin" 
                      name="countryOfOrigin"
                      value={formData.countryOfOrigin} 
                      onChange={handleTextInput} 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="form-section">
                <h3>Product Images *</h3>
                <div className="image-upload-section">
                  <div className="existing-images">
                    {allImages.map((image) => (
                      <div key={image.id} className="image-preview">
                        <img
                          src={image.isNew ? image.url : getImageUrl(image.imageUrl)}
                          alt={`Product ${image.id}`}
                        />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => image.isNew ? removeNewImage(image.id) : removeExistingImage(image.id)}
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>

                  {allImages.length < 5 && (
                    <div className="image-upload-area">
                      <div className="upload-icon">📁</div>
                      <p>Add Image</p>
                      <span className="upload-hint">Upload up to 5 images total. First image will be used as the product thumbnail.</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="file-input" />
                      <button type="button" className="upload-btn" onClick={() => document.querySelector('.file-input')?.click()}>
                        📎 Upload Images
                      </button>
                    </div>
                  )}
                </div>

                <h3>Inventory</h3>

                <div className="form-group">
                  <label htmlFor="barcode">Barcode (UPC/EAN) *</label>
                  <input 
                    type="text" 
                    id="barcode" 
                    name="barcode"
                    value={formData.barcode} 
                    onChange={handleTextInput} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lowStockAlert">Low Stock Alert *</label>
                  <input 
                    type="text" // Changed from number to text
                    id="lowStockAlert" 
                    name="lowStockAlert"
                    value={formData.lowStockAlert} 
                    onChange={handleIntegerInput} 
                    placeholder="0"
                    required 
                  />
                  <span className="form-hint">Notify when stock falls below this number</span>
                </div>

                {/* Hidden trackInventory field */}
                <input type="hidden" name="trackInventory" value="Yes" />

                <h3>Pricing</h3>

                <div className="form-group">
                  <label htmlFor="comparePrice">Compare at Price ($) *</label>
                  <input 
                    type="text" // Changed from number to text
                    id="comparePrice" 
                    name="comparePrice"
                    value={formData.comparePrice} 
                    onChange={handleNumericInput} 
                    placeholder="0.00"
                    required 
                  />
                  <span className="form-hint">Original price before discount</span>
                </div>

                <div className="form-group">
                  <label htmlFor="profitMargin">Profit Margin (%) *</label>
                  <input 
                    type="text" // Changed from number to text
                    id="profitMargin" 
                    name="profitMargin"
                    value={formData.profitMargin} 
                    onChange={handleNumericInput} 
                    placeholder="0"
                    required 
                  />
                </div>

                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p className="danger-warning">Deleting this product will permanently remove it from your inventory and cannot be undone.</p>
                  <button type="button" className="delete-product-btn" onClick={handleDeleteProduct}>🗑️ Delete Product</button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
              <button type="button" className="save-btn" onClick={handleSaveChanges}>💾 Save Changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteWarning && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h3>⚠️ Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{formData.productName}</strong>?</p>
              <p>This action cannot be undone and will permanently remove the product from your inventory.</p>
            </div>
            <div className="modal-actions">
              <button className="modal-cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="modal-delete-btn" onClick={confirmDelete}>Delete Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;