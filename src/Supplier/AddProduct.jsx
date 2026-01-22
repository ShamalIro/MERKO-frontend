import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();

  const [supplierName, setSupplierName] = useState('Supplier');

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

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = ['Accessories', 'Electronics', 'Tools', 'Kits'];
  // Removed statuses and trackOptions since they're now hidden

  // Fetch supplier name
  useEffect(() => {
    const fetchSupplier = async () => {
      const token = localStorage.getItem('merko_token');
      if (!token) return;

      // Get user email from stored user data
      const storedUser = localStorage.getItem('merko_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : null;
      
      if (!userEmail) return;

      try {
        const response = await axios.get('http://localhost:8090/api/suppliers/me', {
          params: { userEmail: userEmail },
          headers: { Authorization: `Bearer ${token}` }
        });
        setSupplierName(response.data.name || response.data.companyName || 'Supplier');
      } catch (err) {
        console.error(err);
      }
    };
    fetchSupplier();
  }, []);

  // Function to allow only numbers and decimal point
  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
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
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  // Special handler for text fields (product name, description, etc.)
  const handleTextInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length <= 5) {
      setImages(prev => [...prev, ...files]);
      // Clear image error when user uploads image
      if (errors.images) {
        setErrors(prev => ({
          ...prev,
          images: ''
        }));
      }
    } else {
      alert('Maximum 5 images allowed');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation (excluding features and careInstructions)
    const requiredFields = {
      productName: 'Product name is required',
      description: 'Description is required',
      sku: 'SKU is required',
      price: 'Price is required',
      cost: 'Cost is required',
      stockQuantity: 'Stock quantity is required',
      weight: 'Weight is required',
      barcode: 'Barcode is required',
      lowStockAlert: 'Low stock alert is required',
      comparePrice: 'Compare price is required',
      profitMargin: 'Profit margin is required',
      brand: 'Brand is required',
      countryOfOrigin: 'Country of origin is required'
    };

    // Check required fields
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = requiredFields[field];
      }
    });

    // Validate numeric fields are positive
    const numericFields = ['price', 'cost', 'stockQuantity', 'weight', 'lowStockAlert', 'comparePrice', 'profitMargin'];
    numericFields.forEach(field => {
      const value = parseFloat(formData[field]);
      if (formData[field] && (isNaN(value) || value < 0)) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} must be a positive number`;
      }
    });

    // Validate at least one image
    if (images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    navigate('/supplier/products');
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      sku: '',
      category: 'Accessories',
      price: '',
      cost: '',
      stockQuantity: '',
      weight: '',
      status: 'Active',
      barcode: '',
      lowStockAlert: '',
      trackInventory: 'Yes',
      comparePrice: '',
      profitMargin: '',
      features: '',
      careInstructions: '',
      brand: '',
      countryOfOrigin: ''
    });
    setImages([]);
    setErrors({});
  };

  const handleSaveProduct = async () => {
    console.log("=== NEW VERSION RUNNING ===");
    
    try {
      console.log("Starting product save...");
      
      // Validate form before submission
      if (!validateForm()) {
        alert('Please fill in all required fields and upload at least one image');
        return;
      }

      const formDataToSend = new FormData();

      // Create product object with all the form data
      const productData = {
        productName: formData.productName,
        description: formData.description,
        sku: formData.sku,
        category: formData.category,
        price: formData.price === '' ? null : Number(formData.price),
        cost: formData.cost === '' ? null : Number(formData.cost),
        stockQuantity: formData.stockQuantity === '' ? null : Number(formData.stockQuantity),
        weight: formData.weight === '' ? null : Number(formData.weight),
        status: formData.status, // Will be 'Active' by default
        barcode: formData.barcode,
        lowStockAlert: formData.lowStockAlert === '' ? null : Number(formData.lowStockAlert),
        trackInventory: formData.trackInventory, // Will be 'Yes' by default
        comparePrice: formData.comparePrice === '' ? null : Number(formData.comparePrice),
        profitMargin: formData.profitMargin === '' ? null : Number(formData.profitMargin),
        features: formData.features,
        careInstructions: formData.careInstructions,
        brand: formData.brand,
        countryOfOrigin: formData.countryOfOrigin
      };

      console.log("Product data object:", productData);

      // Convert product data to JSON string and append as "product" part
      formDataToSend.append("product", JSON.stringify(productData));

      // Append images
      images.forEach((image, index) => {
        console.log(`Image ${index}:`, image.name, image.type, image.size);
        formDataToSend.append("images", image);
      });

      const token = localStorage.getItem("merko_token");
      console.log("Token exists:", !!token);

      // Get user email from stored user data
      const storedUser = localStorage.getItem('merko_user');
      const userEmail = storedUser ? JSON.parse(storedUser).email : null;
      
      if (!userEmail) {
        alert('Please log in again to add products');
        navigate('/login');
        return;
      }

      // Add userEmail as a query parameter
      const url = `http://localhost:8090/api/products/add?userEmail=${encodeURIComponent(userEmail)}`;

      // Send POST request
      console.log("Sending request to backend...");
      const response = await axios.post(
        url,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Backend response:", response.data);
      alert("Product saved successfully!");
      resetForm();
      navigate("/supplier/products");

    } catch (error) {
      console.error("Save product error:", error);
      
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }
      
      const serverMessage = error?.response?.data?.message || error.message;
      alert(`Error saving product: ${serverMessage}`);
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved (backend logic can be implemented similarly)');
    navigate('/supplier/products');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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
            className="nav-item-luxury" 
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

        {/* Add Product Content */}
        <div className="dashboard-content-luxury">
          <motion.div 
            className="page-header-luxury"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2>Add New Product</h2>
          </motion.div>

          <motion.form 
            className="product-form-luxury"
            onSubmit={(e) => e.preventDefault()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="form-grid-luxury">
              {/* Basic Product Information */}
              <div className="form-section-luxury">
                <h3>Product Information</h3>
                
                <div className="form-group-luxury">
                  <label htmlFor="productName">Product Name *</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleTextInput}
                    placeholder="Enter product name"
                    className={errors.productName ? 'error-input-luxury' : ''}
                    required
                  />
                  {errors.productName && <span className="error-message-luxury">{errors.productName}</span>}
                </div>

                <div className="form-group-luxury">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleTextInput}
                    placeholder="Enter product description"
                    rows="4"
                    className={errors.description ? 'error-input-luxury' : ''}
                    required
                  />
                  {errors.description && <span className="error-message-luxury">{errors.description}</span>}
                </div>

                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="sku">SKU *</label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleTextInput}
                      placeholder="Enter SKU"
                      className={errors.sku ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.sku && <span className="error-message-luxury">{errors.sku}</span>}
                  </div>

                  <div className="form-group-luxury">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleTextInput}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="brand">Brand *</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleTextInput}
                      placeholder="Enter brand"
                      className={errors.brand ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.brand && <span className="error-message-luxury">{errors.brand}</span>}
                  </div>

                  <div className="form-group-luxury">
                    <label htmlFor="countryOfOrigin">Country of Origin *</label>
                    <input
                      type="text"
                      id="countryOfOrigin"
                      name="countryOfOrigin"
                      value={formData.countryOfOrigin}
                      onChange={handleTextInput}
                      placeholder="Enter country"
                      className={errors.countryOfOrigin ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.countryOfOrigin && <span className="error-message-luxury">{errors.countryOfOrigin}</span>}
                  </div>
                </div>
              </div>

              {/* Pricing and Inventory */}
              <div className="form-section-luxury">
                <h3>Pricing & Inventory</h3>
                
                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="price">Price *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleNumericInput}
                      placeholder="0.00"
                      className={errors.price ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.price && <span className="error-message-luxury">{errors.price}</span>}
                  </div>

                  <div className="form-group-luxury">
                    <label htmlFor="cost">Cost *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleNumericInput}
                      placeholder="0.00"
                      className={errors.cost ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.cost && <span className="error-message-luxury">{errors.cost}</span>}
                  </div>
                </div>

                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="comparePrice">Compare Price *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="comparePrice"
                      name="comparePrice"
                      value={formData.comparePrice}
                      onChange={handleNumericInput}
                      placeholder="0.00"
                      className={errors.comparePrice ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.comparePrice && <span className="error-message-luxury">{errors.comparePrice}</span>}
                  </div>

                  <div className="form-group-luxury">
                    <label htmlFor="profitMargin">Profit Margin (%) *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="profitMargin"
                      name="profitMargin"
                      value={formData.profitMargin}
                      onChange={handleNumericInput}
                      placeholder="0"
                      className={errors.profitMargin ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.profitMargin && <span className="error-message-luxury">{errors.profitMargin}</span>}
                  </div>
                </div>

                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="stockQuantity">Stock Quantity *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="stockQuantity"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleIntegerInput} // Using integer input for whole numbers
                      placeholder="0"
                      className={errors.stockQuantity ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.stockQuantity && <span className="error-message-luxury">{errors.stockQuantity}</span>}
                  </div>

                  <div className="form-group-luxury">
                    <label htmlFor="lowStockAlert">Low Stock Alert *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="lowStockAlert"
                      name="lowStockAlert"
                      value={formData.lowStockAlert}
                      onChange={handleIntegerInput} // Using integer input for whole numbers
                      placeholder="0"
                      className={errors.lowStockAlert ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.lowStockAlert && <span className="error-message-luxury">{errors.lowStockAlert}</span>}
                  </div>
                </div>

                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="weight">Weight (kg) *</label>
                    <input
                      type="text" // Changed from number to text to prevent scientific notation
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleNumericInput}
                      placeholder="0.00"
                      className={errors.weight ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.weight && <span className="error-message-luxury">{errors.weight}</span>}
                  </div>

                  {/* Hidden trackInventory field */}
                  <input type="hidden" name="trackInventory" value="Yes" />
                </div>
              </div>

              {/* Additional Details */}
              <div className="form-section-luxury">
                <h3>Additional Details</h3>
                
                <div className="form-row-luxury">
                  <div className="form-group-luxury">
                    <label htmlFor="barcode">Barcode *</label>
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleTextInput}
                      placeholder="Enter barcode"
                      className={errors.barcode ? 'error-input-luxury' : ''}
                      required
                    />
                    {errors.barcode && <span className="error-message-luxury">{errors.barcode}</span>}
                  </div>

                  {/* Hidden status field */}
                  <input type="hidden" name="status" value="Active" />
                </div>

                <div className="form-group-luxury">
                  <label htmlFor="features">Features (Optional)</label>
                  <textarea
                    id="features"
                    name="features"
                    value={formData.features}
                    onChange={handleTextInput}
                    placeholder="Enter product features (optional)"
                    rows="3"
                  />
                </div>

                <div className="form-group-luxury">
                  <label htmlFor="careInstructions">Care Instructions (Optional)</label>
                  <textarea
                    id="careInstructions"
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleTextInput}
                    placeholder="Enter care instructions (optional)"
                    rows="3"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="form-section-luxury">
                <h3>Product Images *</h3>
                
                <div className="form-group-luxury">
                  <label htmlFor="images">Upload Images (Required - Max 5)</label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={errors.images ? 'error-input-luxury' : ''}
                  />
                  {errors.images && <span className="error-message-luxury">{errors.images}</span>}
                  
                  {images.length > 0 && (
                    <div className="uploaded-images-luxury">
                      {images.map((image, index) => (
                        <div key={index} className="image-preview-luxury">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index + 1}`}
                          />
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)}
                            className="remove-image-btn-luxury"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="image-upload-hint-luxury">
                    {images.length}/5 images uploaded. At least 1 image is required.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions-luxury">
              <motion.button 
                type="button" 
                className="cancel-btn-luxury" 
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                type="button" 
                className="draft-btn-luxury" 
                onClick={handleSaveDraft}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Save as Draft
              </motion.button>
              <motion.button 
                type="button" 
                className="save-btn-luxury" 
                onClick={handleSaveProduct}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💾 Save Product
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;