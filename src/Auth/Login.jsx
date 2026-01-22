import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import './Login.css'
import { API_ENDPOINTS, apiCall } from '../config/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [submitType, setSubmitType] = useState('') // 'success' or 'error'
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

    // Clear submit message when user modifies form
    if (submitMessage) {
      setSubmitMessage('')
      setSubmitType('')
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select your role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    return (
      formData.email.trim() &&
      formData.password &&
      formData.role &&
      validateEmail(formData.email) &&
      formData.password.length >= 6 &&
      Object.keys(errors).length === 0
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      let response, result;
      
      if (formData.role === 'Admin') {
        // Real admin login API call
        const adminLoginData = {
          email: formData.email,
          password: formData.password
        }

        response = await fetch(API_ENDPOINTS.ADMIN_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminLoginData)
        })

        result = await response.json()
        
        if (result.success) {
          setSubmitMessage(`Login successful! Welcome back to MERKO Admin!`)
          setSubmitType('success')
          
          // Store admin data in localStorage
          localStorage.setItem('merko_admin', JSON.stringify(result.admin))
          localStorage.setItem('merko_user_type', 'admin')
          
          // Navigate to admin dashboard
          setTimeout(() => {
            navigate('/admin-dashboard')
          }, 1500)
        } else {
          setSubmitMessage(result.message || 'Admin login failed. Please check your credentials.')
          setSubmitType('error')
        }
      } else {
        // Regular user login (Supplier/Merchant/Delivery Person)
        const loginData = {
          email: formData.email,
          password: formData.password,
          role: formData.role === 'Delivery Person' ? 'DELIVERY' : formData.role.toUpperCase()
        }

        console.log('Sending login request:', {
          url: API_ENDPOINTS.USER_LOGIN,
          data: { ...loginData, password: '[HIDDEN]' }
        })

        response = await fetch(API_ENDPOINTS.USER_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData)
        })

        console.log('Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })

        // Handle different response types
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // Handle non-JSON responses (like error pages or empty responses)
          const textResponse = await response.text();
          console.error('Non-JSON response:', {
            status: response.status,
            statusText: response.statusText,
            contentType: contentType,
            body: textResponse
          });
          
          // Create a structured error response for empty/non-JSON responses
          result = { 
            message: textResponse || `Authentication failed (${response.status})`,
            rawResponse: textResponse,
            isEmpty: !textResponse || textResponse.trim() === ''
          };
        }
        
        if (response.ok) {
          console.log('Login successful:', result)
          console.log('User found in merco_db.users table:', result.user)
          
          // Determine the user's role from the backend response (this comes from merco_db.users table)
          const userRole = result.user?.role || formData.role;
          const userEmail = result.user?.email || formData.email;
          
          setSubmitMessage(`Login successful! Welcome back to MERKO, ${userEmail}!`)
          setSubmitType('success')
          
          // Store user data and token in localStorage
          localStorage.setItem('merko_user', JSON.stringify(result.user))
          localStorage.setItem('merko_token', result.token)
          localStorage.setItem('merko_user_type', 'user')
          localStorage.setItem('merko_user_role', userRole)
          
          console.log(`User authenticated successfully. Role: ${userRole}. Navigating to dashboard...`)
          
          // Navigate based on user's role from the database (merco_db.users table)
          setTimeout(() => {
            if (userRole === 'SUPPLIER' || userRole === 'Supplier') {
              console.log('Redirecting to Supplier Dashboard')
              navigate('/supplier/dashboard')
            } else if (userRole === 'MERCHANT' || userRole === 'Merchant') {
              console.log('Redirecting to Merchant Dashboard')
              navigate('/merchant/dashboard')
            } else if (userRole === 'DELIVERY' || userRole === 'Delivery Person') {
              console.log('Redirecting to Delivery Dashboard')
              navigate('/delivery/dashboard')
            } else {
              console.log(`Unknown role: ${userRole}. Redirecting to default dashboard`)
              navigate('/dashboard') // fallback
            }
          }, 1500)
        } else {
          console.error('Login failed:', {
            status: response.status,
            statusText: response.statusText,
            result: result
          })
          
          let errorMessage = result.message || `Login failed (${response.status}). Please try again.`;
          
          // Add specific guidance for different error types
          if (response.status === 401) {
            if (result.isEmpty) {
              errorMessage = "Invalid password. The email exists but the password is incorrect. Please check your password and try again.";
            } else {
              errorMessage = "Invalid credentials. Please check your email, password, and role selection.";
            }
          } else if (response.status === 403) {
            errorMessage = "Account not approved yet. Your account must be approved by admin before you can login.";
          } else if (response.status === 404) {
            errorMessage = "User not found in the system. Please check your email or contact admin to ensure your account has been approved and added to the users table.";
          } else if (response.status === 400) {
            errorMessage = "Role mismatch. Please select the correct role that matches your account type.";
          } else if (response.status === 500) {
            errorMessage = "Server error. Please try again later or contact support.";
          }
          
          // If we have a raw response (non-JSON), show it for debugging
          if (result.rawResponse && result.rawResponse.length < 500) {
            errorMessage += `\n\nServer response: ${result.rawResponse}`;
          }
          
          setSubmitMessage(errorMessage);
          setSubmitType('error')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setSubmitMessage('Network error. Please check your connection and try again.')
      setSubmitType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
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
    <div className="login-container">
      <motion.div 
        className="login-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to access your wholesale account</p>
        </div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="login-form"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="you@company.com"
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
            <label htmlFor="role">Select Your Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className={errors.role ? 'error role-select' : 'role-select'}
            >
              <option value="">Choose your role...</option>
              <option value="Supplier">Supplier</option>
              <option value="Merchant">Merchant</option>
              <option value="Delivery Person">Delivery Person</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {errors.role}
              </motion.span>
            )}
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
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
            className="login-btn"
            disabled={!isFormValid() || isSubmitting}
            variants={inputVariants}
            whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
          >
            {isSubmitting ? (
              <span className="loading">
                Logging in... 
                <div className="spinner"></div>
              </span>
            ) : (
              'Login'
            )}
          </motion.button>

          <motion.div className="register-link" variants={inputVariants}>
            <span>Don't have an account? </span>
            <Link to="/signup">Register</Link>
          </motion.div>
        </motion.form>
      </motion.div>

      <div className="login-footer">
        <p>© 2025 MERKO Wholesale System. All rights reserved.</p>
      </div>
    </div>
  )
}

export default Login
