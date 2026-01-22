import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // 1: Enter email, 2: Reset password
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const navigate = useNavigate()

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Clear message when user modifies form
    if (message) {
      setMessage('')
      setMessageType('')
    }
  }

  const validateStep1 = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Submit = async (e) => {
    e.preventDefault()

    if (!validateStep1()) {
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('http://localhost:8090/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setMessageType('success')
        setStep(2)
      } else {
        setMessage(data.message || 'Email verification failed')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep2Submit = async (e) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setIsSubmitting(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch('http://localhost:8090/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(data.message)
        setMessageType('success')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setMessage(data.message || 'Password reset failed')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-background">
        <div className="geometric-shape shape1"></div>
        <div className="geometric-shape shape2"></div>
        <div className="geometric-shape shape3"></div>
      </div>

      <motion.div
        className="forgot-password-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="forgot-password-header" variants={inputVariants}>
          <h1>
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p>
            {step === 1 
              ? 'Enter your email address and we\'ll help you reset your password'
              : 'Enter your new password below'
            }
          </p>
        </motion.div>

        {message && (
          <motion.div 
            className={`message ${messageType}`}
            variants={inputVariants}
          >
            {message}
          </motion.div>
        )}

        {step === 1 ? (
          <motion.form onSubmit={handleStep1Submit} variants={inputVariants}>
            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
                autoComplete="email"
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

            <motion.button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
              variants={inputVariants}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.form onSubmit={handleStep2Submit} variants={inputVariants}>
            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={errors.newPassword ? 'error' : ''}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <motion.span 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {errors.newPassword}
                </motion.span>
              )}
            </motion.div>

            <motion.div className="form-group" variants={inputVariants}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
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

            <motion.button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
              disabled={isSubmitting}
              variants={inputVariants}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </motion.button>
          </motion.form>
        )}

        <motion.div className="forgot-password-footer" variants={inputVariants}>
          <Link to="/login" className="back-to-login">
            ← Back to Login
          </Link>
          {step === 2 && (
            <button 
              type="button" 
              className="back-to-email"
              onClick={() => setStep(1)}
            >
              Change Email
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ForgotPassword