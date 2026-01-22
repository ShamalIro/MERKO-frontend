import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import './SupplierSignUp.css'

const SupplierSignUp = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPersonName: '',
    email: '',
    username: '',
    phoneNumber: '',
    businessRegistrationNumber: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitType, setSubmitType] = useState('') // 'success' or 'error'
  const [showValidationPopup, setShowValidationPopup] = useState(false)
  const [validationMessages, setValidationMessages] = useState([])

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
    } 
    // For business registration number, only allow alphanumeric
    else if (name === 'businessRegistrationNumber') {
      const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '')
      setFormData(prev => ({ ...prev, [name]: cleanValue }))
    }
    // For username, only allow alphanumeric and underscore
    else if (name === 'username') {
      const cleanValue = value.replace(/[^a-zA-Z0-9_]/g, '')
      setFormData(prev => ({ ...prev, [name]: cleanValue }))
    }
    else {
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

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore only)'
    }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits'
    }

    // Business Registration Number validation
    if (!formData.businessRegistrationNumber.trim()) {
      newErrors.businessRegistrationNumber = 'Business registration number is required'
    } else if (!validateBusinessRegNumber(formData.businessRegistrationNumber)) {
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
    // Enable button if any field has data
    return (
      formData.companyName.trim() ||
      formData.contactPersonName.trim() ||
      formData.email.trim() ||
      formData.username.trim() ||
      formData.phoneNumber.trim() ||
      formData.businessRegistrationNumber.trim() ||
      formData.password ||
      formData.confirmPassword
    )
  }

  const isFormCompletelyValid = () => {
    return (
      formData.companyName.trim() &&
      formData.contactPersonName.trim() &&
      formData.email.trim() &&
      formData.username.trim() &&
      formData.phoneNumber.trim() &&
      formData.businessRegistrationNumber.trim() &&
      formData.password &&
      formData.confirmPassword &&
      validateEmail(formData.email) &&
      validateUsername(formData.username) &&
      validatePhoneNumber(formData.phoneNumber) &&
      validateBusinessRegNumber(formData.businessRegistrationNumber) &&
      validatePassword(formData.password) &&
      formData.password === formData.confirmPassword &&
      Object.keys(errors).length === 0
    )
  }

  const showValidationErrors = () => {
    const validationErrors = []
    
    // Check each field and add user-friendly messages
    if (!formData.companyName.trim()) {
      validationErrors.push("📋 Company name is required")
    } else if (formData.companyName.trim().length < 2) {
      validationErrors.push("📋 Company name must be at least 2 characters long")
    }

    if (!formData.contactPersonName.trim()) {
      validationErrors.push("👤 Contact person name is required")
    } else if (formData.contactPersonName.trim().length < 2) {
      validationErrors.push("👤 Contact person name must be at least 2 characters long")
    }

    if (!formData.email.trim()) {
      validationErrors.push("📧 Email address is required")
    } else if (!validateEmail(formData.email)) {
      validationErrors.push("📧 Please enter a valid email address (e.g., user@company.com)")
    }

    if (!formData.username.trim()) {
      validationErrors.push("🔤 Username is required")
    } else if (!validateUsername(formData.username)) {
      validationErrors.push("🔤 Username must be 3-20 characters (letters, numbers, underscore only)")
    }

    if (!formData.phoneNumber.trim()) {
      validationErrors.push("📞 Phone number is required")
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      validationErrors.push("📞 Phone number must be at least 10 digits")
    }

    if (!formData.businessRegistrationNumber.trim()) {
      validationErrors.push("🏢 Business registration number is required")
    } else if (!validateBusinessRegNumber(formData.businessRegistrationNumber)) {
      validationErrors.push("🏢 Business registration must be 5-20 alphanumeric characters")
    }

    if (!formData.password) {
      validationErrors.push("🔒 Password is required")
    } else if (!validatePassword(formData.password)) {
      validationErrors.push("🔒 Password must be at least 6 characters with letters and numbers")
    }

    if (!formData.confirmPassword) {
      validationErrors.push("🔐 Please confirm your password")
    } else if (formData.password !== formData.confirmPassword) {
      validationErrors.push("🔐 Passwords do not match")
    }

    if (validationErrors.length > 0) {
      setValidationMessages(validationErrors)
      setShowValidationPopup(true)
      
      // Auto-hide popup after 8 seconds
      setTimeout(() => {
        setShowValidationPopup(false)
      }, 8000)
    }
  }

  const closeValidationPopup = () => {
    setShowValidationPopup(false)
    setValidationMessages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isFormCompletelyValid()) {
      showValidationErrors()
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare data for backend API to match Supplier entity fields
      const registrationData = {
        companyName: formData.companyName,
        contactPersonName: formData.contactPersonName,
        email: formData.email,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        password: formData.password
      }

      // Send registration request to backend
      const response = await fetch('http://localhost:8090/api/suppliers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })

      const result = await response.json()
      
      if (result.success) {
        setSubmitMessage('Supplier account created successfully! Please wait for admin approval before you can login.')
        setSubmitType('success')
        // Reset form
        setFormData({
          companyName: '',
          contactPersonName: '',
          email: '',
          username: '',
          phoneNumber: '',
          businessRegistrationNumber: '',
          password: '',
          confirmPassword: ''
        })
      } else {
        setSubmitMessage(result.message || 'Registration failed. Please try again.')
        setSubmitType('error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitMessage('Network error. Please check your connection and try again.')
      setSubmitType('error')
    } finally {
      setIsSubmitting(false)
    }
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
        duration: 0.6,
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
        staggerChildren: 0.08
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
    <div className="supplier-signup-container">
      <motion.div 
        className="supplier-signup-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="signup-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1>Join as Supplier</h1>
          <p>Create your supplier account to start selling wholesale products</p>
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="signup-form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="form-row">
            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={errors.companyName ? 'error' : ''}
                placeholder="Enter your company name"
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
                placeholder="Enter contact person name"
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
          </div>

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

          <div className="form-row">
            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
                placeholder="Choose a username"
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
                placeholder="Enter phone number"
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
          </div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="businessRegistrationNumber">Business Registration Number *</label>
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

          <div className="form-row">
            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter password"
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
                placeholder="Confirm password"
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
          </div>

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
            className="register-btn"
            disabled={!isFormValid() || isSubmitting}
            variants={inputVariants}
            whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
          >
            {isSubmitting ? (
              <span className="loading">
                Creating Account... 
                <div className="spinner"></div>
              </span>
            ) : (
              'Register as Supplier'
            )}
          </motion.button>

          <motion.div className="login-link" variants={inputVariants}>
            <span>Already have an account? </span>
            <Link to="/login">Login here</Link>
          </motion.div>
        </motion.form>
      </motion.div>

      <div className="signup-footer">
        <p>© 2025 MERKO. All rights reserved.</p>
      </div>

      {/* Validation Popup */}
      {showValidationPopup && (
        <motion.div 
          className="validation-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeValidationPopup}
        >
          <motion.div 
            className="validation-popup"
            initial={{ scale: 0.8, opacity: 0, y: -50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="popup-header">
              <h3>⚠️ Please Fix These Issues</h3>
              <button 
                className="close-popup-btn"
                onClick={closeValidationPopup}
              >
                ✕
              </button>
            </div>
            <div className="popup-content">
              <p>Please correct the following errors to continue:</p>
              <ul className="validation-list">
                {validationMessages.map((message, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {message}
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="popup-footer">
              <button 
                className="popup-ok-btn"
                onClick={closeValidationPopup}
              >
                Got It!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default SupplierSignUp
