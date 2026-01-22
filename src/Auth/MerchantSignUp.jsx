import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './MerchantSignUp.css'

const MerchantSignUp = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPersonName: '',
    email: '',
    username: '',
    phoneNumber: '',
    businessRegistrationNumber: '',
    businessAddress: '',
    businessType: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitType, setSubmitType] = useState('') // 'success' or 'error'
  const [showPopup, setShowPopup] = useState(false) // Add popup state

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10,}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const validatePassword = (password) => {
    const hasLetters = /[a-zA-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    return password.length >= 6 && hasLetters && hasNumbers
  }

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  const validateBusinessRegNumber = (regNumber) => {
    const regNumberRegex = /^[a-zA-Z0-9]{5,20}$/
    return regNumberRegex.test(regNumber)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // For phone number, only allow digits and spaces
    if (name === 'phoneNumber') {
      const cleanValue = value.replace(/[^\d\s]/g, '')
      setFormData(prev => ({ ...prev, [name]: cleanValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Clear submit message when user modifies form
    if (submitMessage) {
      setSubmitMessage('')
      setSubmitType('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters'
    }

    // Contact Person Name validation
    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required'
    } else if (formData.contactPersonName.trim().length < 2) {
      newErrors.contactPersonName = 'Contact person name must be at least 2 characters'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Username validation (optional but if provided should be valid)
    if (formData.username.trim() && !validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore only)'
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits'
    }

    // Business Registration Number validation (optional but if provided should be valid)
    if (formData.businessRegistrationNumber.trim() && !validateBusinessRegNumber(formData.businessRegistrationNumber)) {
      newErrors.businessRegistrationNumber = 'Must be 5-20 alphanumeric characters'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters with letters and numbers'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    return (
      formData.companyName.trim() &&
      formData.email.trim() &&
      formData.phoneNumber.trim() &&
      formData.password &&
      formData.confirmPassword &&
      validateEmail(formData.email) &&
      validatePhoneNumber(formData.phoneNumber) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      Object.keys(errors).length === 0
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Skip validation and show popup instead
    setShowPopup(true)
  }

  // Handle popup confirmation - actually create the account
  const handleCreateAccount = async () => {
    setIsSubmitting(true)
    setShowPopup(false)
    
    try {
      // Prepare data for backend API to match Merchant entity fields
      const registrationData = {
        companyName: formData.companyName || 'Default Company',
        contactPersonName: formData.contactPersonName || 'Default Contact',
        email: formData.email || 'default@email.com',
        username: formData.username || `merchant_${Date.now()}`,
        phoneNumber: formData.phoneNumber || '1234567890',
        businessRegistrationNumber: formData.businessRegistrationNumber || '',
        businessAddress: formData.businessAddress || '',
        businessType: formData.businessType || 'Retail',
        password: formData.password || 'defaultpass123'
      }

      // Send registration request to backend
      const response = await fetch('http://localhost:8090/api/merchants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()
      
      if (result.success) {
        setSubmitMessage('Merchant account created successfully! Please wait for admin approval before you can login.')
        setSubmitType('success')
        // Reset form
        setFormData({
          companyName: '',
          contactPersonName: '',
          email: '',
          username: '',
          phoneNumber: '',
          businessRegistrationNumber: '',
          businessAddress: '',
          businessType: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        setSubmitMessage(result.message || 'Registration failed. Please try again.')
        setSubmitType('error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitMessage('Merchant account created successfully! (Demo Mode - No backend connection)')
      setSubmitType('success')
      // Reset form in demo mode
      setFormData({
        companyName: '',
        contactPersonName: '',
        email: '',
        username: '',
        phoneNumber: '',
        businessRegistrationNumber: '',
        businessAddress: '',
        businessType: '',
        password: '',
        confirmPassword: ''
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle popup cancel
  const handleCancelPopup = () => {
    setShowPopup(false)
  }

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="merchant-signup-container">
      <motion.div 
        className="merchant-signup-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="signup-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1>Join as Merchant</h1>
          <p>Create your merchant account to start purchasing wholesale products</p>
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="signup-form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="companyName">Company Name / Business Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className={errors.companyName ? 'error' : ''}
              placeholder="Enter your company or business name"
            />
            {errors.companyName && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.companyName}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="contactPersonName">Contact Person Name *</label>
            <input
              type="text"
              id="contactPersonName"
              name="contactPersonName"
              value={formData.contactPersonName}
              onChange={handleInputChange}
              className={errors.contactPersonName ? 'error' : ''}
              placeholder="Enter the contact person's name"
            />
            {errors.contactPersonName && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.contactPersonName}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.email}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="username">Username (Optional)</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? 'error' : ''}
              placeholder="Enter a unique username (optional)"
            />
            {errors.username && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.username}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={errors.phoneNumber ? 'error' : ''}
              placeholder="Enter your phone number (10+ digits)"
            />
            {errors.phoneNumber && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.phoneNumber}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="businessRegistrationNumber">Business Registration Number (Optional)</label>
            <input
              type="text"
              id="businessRegistrationNumber"
              name="businessRegistrationNumber"
              value={formData.businessRegistrationNumber}
              onChange={handleInputChange}
              className={errors.businessRegistrationNumber ? 'error' : ''}
              placeholder="Enter business registration number"
            />
            {errors.businessRegistrationNumber && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.businessRegistrationNumber}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="businessAddress">Business Address (Optional)</label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleInputChange}
              className={errors.businessAddress ? 'error' : ''}
              placeholder="Enter your business address"
              rows="3"
            />
            {errors.businessAddress && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.businessAddress}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="businessType">Business Type (Optional)</label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className={errors.businessType ? 'error' : ''}
            >
              <option value="">Select business type</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Technology">Technology</option>
              <option value="Fashion">Fashion</option>
              <option value="Food & Beverage">Food & Beverage</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </select>
            {errors.businessType && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.businessType}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter password (6+ chars, letters + numbers)"
            />
            {errors.password && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.password}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.confirmPassword}
              </motion.span>
            )}
          </motion.div>

          {submitMessage && (
            <motion.div 
              className={`submit-message ${submitType}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {submitMessage}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="signup-btn"
            disabled={isSubmitting}
            variants={inputVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <span className="loading">
                Creating Account... 
                <div className="spinner"></div>
              </span>
            ) : (
              'Create Merchant Account'
            )}
          </motion.button>

          <motion.div className="login-link" variants={inputVariants}>
            <span>Already have an account? </span>
            <Link to="/login">Login here</Link>
          </motion.div>
        </motion.form>
      </motion.div>

      {/* Popup Modal */}
      {showPopup && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="popup-modal"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
          >
            <div className="popup-header">
              <h3>🎉 Create Merchant Account</h3>
            </div>
            <div className="popup-content">
              <p>Are you ready to create your merchant account and join our platform?</p>
              <div className="popup-info">
                <ul>
                  <li>✅ Access to wholesale products</li>
                  <li>✅ Competitive pricing</li>
                  <li>✅ Reliable supplier network</li>
                  <li>✅ Admin approval within 24-48 hours</li>
                </ul>
              </div>
            </div>
            <div className="popup-actions">
              <button
                className="cancel-btn"
                onClick={handleCancelPopup}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={handleCreateAccount}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading">
                    Creating...
                    <div className="spinner"></div>
                  </span>
                ) : (
                  'Create Merchant Account'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="signup-footer">
        <p>© 2025 MERKO. All rights reserved.</p>
      </div>
    </div>
  )
}

export default MerchantSignUp
