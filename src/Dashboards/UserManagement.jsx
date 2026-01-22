import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import './UserManagement.css'

const UserManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('checking') // 'checking', 'connected', 'disconnected'

  // Users data from database
  const [users, setUsers] = useState([])

  // Edit user modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editUser, setEditUser] = useState(null)

  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    companyName: '',
    businessType: '',
    role: ''
  })

  const itemsPerPage = 10

  // Check authentication status
  const checkAuth = () => {
    let token = localStorage.getItem('merko_token') || localStorage.getItem('userToken')
    let userRole = localStorage.getItem('merko_user_role') || localStorage.getItem('userRole')
    
    // Parse user object if role is stored there
    const userObj = localStorage.getItem('merko_user')
    if (userObj && userObj.startsWith('{')) {
      try {
        const parsedUser = JSON.parse(userObj)
        if (parsedUser.role) {
          userRole = parsedUser.role
          localStorage.setItem('merko_user_role', parsedUser.role)
        }
        // Store user email for admin detection
        if (parsedUser.email) {
          localStorage.setItem('merko_user_email', parsedUser.email)
        }
      } catch (e) {
        console.warn('Could not parse user object:', e)
      }
    }

    // Extract role from token if available
    if (token && !userRole) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role) {
          userRole = payload.role
          localStorage.setItem('merko_user_role', payload.role)
        }
        if (payload.email) {
          localStorage.setItem('merko_user_email', payload.email)
        }
      } catch (e) {
        console.warn('Could not decode token:', e)
      }
    }
    
    console.log('Auth check - Token:', token ? 'Present' : 'Missing', 'Role:', userRole)
    
    return true // Always allow access, fetchUsers will handle authentication
  }

  // Check if current user has admin privileges
  const checkAdminPermission = () => {
    // First, check if this is an admin user (from admin login)
    const userType = localStorage.getItem('merko_user_type')
    if (userType === 'admin') {
      // This user logged in via admin login, they have admin privileges
      const adminData = localStorage.getItem('merko_admin')
      if (adminData) {
        console.log('✅ Admin user detected via admin login')
        return true
      }
    }

    // Check all possible sources for the user role (from regular user login)
    let userRole = localStorage.getItem('merko_user_role') || 
                   localStorage.getItem('userRole') || 
                   localStorage.getItem('role')
    
    // Parse user object if role is stored there
    const userObj = localStorage.getItem('merko_user')
    if (userObj && userObj.startsWith('{')) {
      try {
        const parsedUser = JSON.parse(userObj)
        if (parsedUser.role) {
          userRole = parsedUser.role
          // Update localStorage with the correct role
          localStorage.setItem('merko_user_role', parsedUser.role)
        }
      } catch (e) {
        console.warn('Could not parse user object:', e)
      }
    }

    // Also check if there's role info in the token payload
    const token = localStorage.getItem('merko_token') || localStorage.getItem('userToken')
    if (token) {
      try {
        // Decode JWT token to extract role (basic decode, no verification)
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role) {
          userRole = payload.role
          localStorage.setItem('merko_user_role', payload.role)
        } else if (payload.user_role) {
          userRole = payload.user_role
          localStorage.setItem('merko_user_role', payload.user_role)
        } else if (payload.authorities && Array.isArray(payload.authorities)) {
          // Check if user has admin authority
          const hasAdminAuthority = payload.authorities.some(auth => 
            auth === 'ADMIN' || auth === 'ROLE_ADMIN' || auth.authority === 'ADMIN' || auth.authority === 'ROLE_ADMIN'
          )
          if (hasAdminAuthority) {
            userRole = 'ADMIN'
            localStorage.setItem('merko_user_role', 'ADMIN')
          }
        }
      } catch (e) {
        console.warn('Could not decode token for role:', e)
      }
    }

    // Check if user email is an admin email (fallback method)
    if (!userRole || userRole === 'DELIVERY') {
      const userEmail = localStorage.getItem('merko_user_email') || 
                       (userObj && JSON.parse(userObj).email) ||
                       (token && JSON.parse(atob(token.split('.')[1])).email)
      
      if (userEmail && userEmail.includes('admin')) {
        userRole = 'ADMIN'
        localStorage.setItem('merko_user_role', 'ADMIN')
      }
    }
    
    return userRole === 'ADMIN' || userRole === 'admin' || userRole === 'Admin' || userType === 'admin'
  }



  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      setConnectionStatus('checking')
      
      console.log('🔄 Starting fetchUsers...')
      
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // First test backend connectivity
      console.log('🔍 Testing backend connectivity...')
      try {
        const testResponse = await fetch('http://localhost:8090/api/users/test', {
          method: 'GET',
          headers: headers
        })
        console.log('🧪 Test endpoint status:', testResponse.status)
        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log('🧪 Test response:', testData)
        }
      } catch (e) {
        console.warn('🧪 Test endpoint failed:', e.message)
      }
      
      // Direct call to users/all endpoint
      console.log('🌐 Fetching from: http://localhost:8090/api/users/all')
      
      const response = await fetch('http://localhost:8090/api/users/all', {
        method: 'GET',
        headers: headers
      })
      
      console.log('📊 Response status:', response.status)
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
      }
      
      const data = await response.json()
      console.log('📦 Raw response data:', data)
      
      if (data.success && Array.isArray(data.users)) {
        console.log('✅ Successfully parsed users array:', data.users.length, 'users')
        setUsers(data.users)
        setConnectionStatus('connected')
        setError('') // Clear any previous errors
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        console.log('✅ Direct array response:', data.length, 'users')
        setUsers(data)
        setConnectionStatus('connected')
        setError('') // Clear any previous errors
      } else {
        console.warn('⚠️ Unexpected response format:', data)
        throw new Error(`Unexpected response format: ${JSON.stringify(data)}`)
      }
      
    } catch (err) {
      setConnectionStatus('disconnected')
      
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Backend server is not running. Displaying sample user data for demonstration.')
      } else if (err.message === 'BACKEND_UNAVAILABLE') {
        setError('Unable to connect to backend server. Showing sample data.')
      } else if (err.message.includes('Authentication required')) {
        setError('Authentication issue. Using sample data for demonstration.')
      } else if (err.message.includes('Access denied')) {
        setError('Access limited. Showing sample user data.')
      } else {
        setError('Connection issue. Using sample data: ' + err.message)
      }
      
      console.warn('Fetch users failed, using mock data:', err.message)
      
      // Set realistic sample data matching merco_db.users table structure
      console.log('💾 Loading sample data matching database structure...')
      setUsers([
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@merko.com',
          phoneNumber: '0771234567',
          companyName: 'Merko Systems',
          businessType: 'Administration',
          role: 'ADMIN',
          status: 'APPROVED',
          registrationDate: '2024-01-01T00:00:00',
          approvalDate: '2024-01-01T00:00:00',
          approvedBy: 'System',
          rejectionReason: null
        },
        {
          id: 2,
          firstName: 'Test',
          lastName: 'Supplier',
          username: 'test_supplier',
          email: 'supplier@test.com',
          phoneNumber: '0771111111',
          companyName: 'Test Supplier Co',
          businessType: 'Food & Beverage',
          role: 'SUPPLIER',
          status: 'APPROVED',
          registrationDate: '2024-01-02T10:30:00',
          approvalDate: '2024-01-02T11:15:00',
          approvedBy: 'Admin User',
          rejectionReason: null
        },
        {
          id: 3,
          firstName: 'Test',
          lastName: 'Merchant',
          username: 'test_merchant',
          email: 'merchant@test.com',
          phoneNumber: '0772222222',
          companyName: 'Test Merchant Shop',
          businessType: 'Retail',
          role: 'MERCHANT',
          status: 'APPROVED',
          registrationDate: '2024-01-03T14:20:00',
          approvalDate: '2024-01-03T15:30:00',
          approvedBy: 'Admin User',
          rejectionReason: null
        },
        {
          id: 4,
          firstName: 'Test',
          lastName: 'Delivery',
          username: 'test_delivery',
          email: 'delivery@test.com',
          phoneNumber: '0773333333',
          companyName: 'Merko Delivery',
          businessType: 'Logistics',
          role: 'DELIVERY',
          status: 'APPROVED',
          registrationDate: '2024-01-04T09:15:00',
          approvalDate: '2024-01-04T10:00:00',
          approvedBy: 'Admin User',
          rejectionReason: null
        },
        {
          id: 5,
          firstName: 'Jane',
          lastName: 'Smith',
          username: 'jane.smith',
          email: 'jane.smith@freshfoods.com',
          phoneNumber: '0774444444',
          companyName: 'Fresh Foods Ltd',
          businessType: 'Organic Produce',
          role: 'MERCHANT',
          status: 'PENDING',
          registrationDate: '2024-01-05T16:45:00',
          approvalDate: null,
          approvedBy: null,
          rejectionReason: null
        },
        {
          id: 6,
          firstName: 'Bob',
          lastName: 'Wilson',
          username: 'bob.wilson',
          email: 'bob.wilson@farmgate.com',
          phoneNumber: '0775555555',
          companyName: 'Farm Gate Supplies',
          businessType: 'Agricultural Equipment',
          role: 'SUPPLIER',
          status: 'REJECTED',
          registrationDate: '2024-01-06T12:30:00',
          approvalDate: '2024-01-06T18:00:00',
          approvedBy: 'Admin User',
          rejectionReason: 'Incomplete business documentation'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Always check auth and fetch users
    checkAuth()
    fetchUsers()
    
    // Debug localStorage contents on load
    console.log('🔍 === LOCALSTORAGE DEBUG ON LOAD ===')
    console.log('merko_user_type:', localStorage.getItem('merko_user_type'))
    console.log('merko_admin:', localStorage.getItem('merko_admin'))
    console.log('merko_token:', localStorage.getItem('merko_token'))
    console.log('merko_user_role:', localStorage.getItem('merko_user_role'))
    console.log('merko_user_email:', localStorage.getItem('merko_user_email'))
    console.log('userToken:', localStorage.getItem('userToken'))
    console.log('merko_user:', localStorage.getItem('merko_user'))
    console.log('🔍 === END LOCALSTORAGE DEBUG ===')

    // Check admin authentication status on load
    const checkInitialAdminAuth = () => {
      const hasAdminAuth = checkAdminPermission()
      console.log('� Initial admin authentication status:', hasAdminAuth)
      
      if (hasAdminAuth) {
        console.log('✅ Admin already authenticated from merco_db.admin')
      } else {
        console.log('⚠️ No admin authentication detected - user must log in manually with merco_db.admin credentials')
      }
    }
    
    checkInitialAdminAuth()
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('All Roles')
    setStatusFilter('All Status')
    setCurrentPage(1)
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    // Search functionality - if search term is empty, show all users
    const matchesSearch = !searchTerm.trim() || 
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Role filtering - match exact role values from database
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter
    
    // Status filtering - match exact status values from database
    const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Admin authentication using existing merco_db.admin table data
  const doAdminLogin = async (adminEmail = null, adminPassword = null) => {
    try {
      // Check if admin is already logged in from merco_db.admin table
      const existingAdmin = localStorage.getItem('merko_admin')
      if (existingAdmin && checkAdminPermission()) {
        console.log('✅ Admin already authenticated from merco_db.admin')
        return true
      }
      
      // If no credentials provided, cannot proceed with auto-login
      if (!adminEmail || !adminPassword) {
        console.log('⚠️ Admin credentials required - user must log in manually')
        return false
      }
      
      console.log('🔐 Attempting admin login with merco_db.admin credentials...')
      
      const response = await fetch('http://localhost:8090/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword
        })
      })
      
      if (response.ok) {
        const adminData = await response.json()
        console.log('✅ Admin login successful with merco_db.admin data:', adminData)
        
        // Store admin data from merco_db.admin table
        localStorage.setItem('merko_admin', JSON.stringify(adminData))
        localStorage.setItem('merko_user_type', 'admin')
        localStorage.setItem('merko_user_role', 'ADMIN')
        localStorage.setItem('merko_user_email', adminEmail)
        
        if (adminData.token) {
          localStorage.setItem('merko_token', adminData.token)
        } else if (adminData.accessToken) {
          localStorage.setItem('merko_token', adminData.accessToken)
        }
        
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Admin login failed:', response.status, errorText)
        return false
      }
    } catch (error) {
      console.error('❌ Admin login error:', error)
      return false
    }
  }

  // Handle user actions
  const handleEditUser = async (user) => {
    // Check if user has admin permissions from merco_db.admin
    if (!checkAdminPermission()) {
      alert('Access denied. Please log in with valid admin credentials from your merco_db.admin table to edit users.')
      return
    }
    
    setEditUser({ ...user })
    setShowEditModal(true)
  }

  const handleDeleteUser = async (userId) => {
    // Validate admin permissions
    if (!checkAdminPermission()) {
      alert('Access denied. Only administrators can delete user accounts.')
      return
    }
    
    // Get user info for confirmation
    const user = users.find(u => u.id === userId)
    const userInfo = user ? `${user.firstName} ${user.lastName} (${user.email})` : `User ID ${userId}`
    
    if (!window.confirm(`Are you sure you want to delete ${userInfo}?\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      // Get authentication credentials
      const authResult = getAuthenticationCredentials()
      if (!authResult.success) {
        alert('Authentication required. Please log in again with admin credentials.')
        return
      }

      console.log('🗑️ Deleting user:', { userId, userInfo })

      // Make API request
      const response = await fetch(`http://localhost:8090/api/users/${userId}`, {
        method: 'DELETE',
        headers: authResult.headers
      })

      // Handle response
      if (!response.ok) {
        await handleApiError(response, 'delete user')
        return
      }

      console.log('✅ User deleted successfully')
      
      await fetchUsers()
      alert('User deleted successfully!')
      
    } catch (error) {
      console.error('❌ Delete user error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure the backend is running.')
      } else {
        alert(`Error deleting user: ${error.message}`)
      }
    }
  }



  // Get authentication credentials for API requests
  const getAuthenticationCredentials = () => {
    try {
      let token = null
      let userRole = null
      let userEmail = null
      let isAdminUser = false

      // Priority 1: Check if user is logged in as admin (admin login path)
      const userType = localStorage.getItem('merko_user_type')
      if (userType === 'admin') {
        isAdminUser = true
        const adminData = localStorage.getItem('merko_admin')
        if (adminData) {
          try {
            const parsedAdmin = JSON.parse(adminData)
            token = parsedAdmin.token || parsedAdmin.accessToken
            userRole = 'ADMIN'
            userEmail = parsedAdmin.email
            
            console.log('🔑 Using admin credentials:', {
              hasToken: !!token,
              email: userEmail?.substring(0, 3) + '***'
            })
          } catch (e) {
            console.warn('Could not parse admin data:', e)
          }
        }
      }

      // Priority 2: Check regular user credentials (user login path)
      if (!token) {
        // Get token from multiple possible sources
        token = localStorage.getItem('merko_token') || 
                localStorage.getItem('userToken') || 
                localStorage.getItem('token')
        
        // Get role from multiple sources
        userRole = localStorage.getItem('merko_user_role') || 
                   localStorage.getItem('userRole') || 
                   localStorage.getItem('role')
                   
        userEmail = localStorage.getItem('merko_user_email') || 
                    localStorage.getItem('userEmail')

        // Try to get from user object
        const userObj = localStorage.getItem('merko_user')
        if (userObj && userObj.startsWith('{')) {
          try {
            const parsedUser = JSON.parse(userObj)
            if (!token) token = parsedUser.token || parsedUser.accessToken
            if (!userRole) userRole = parsedUser.role
            if (!userEmail) userEmail = parsedUser.email
            
            // Check if this regular user has admin role
            if (parsedUser.role === 'ADMIN' || parsedUser.role === 'admin') {
              isAdminUser = true
              userRole = 'ADMIN'
            }
          } catch (e) {
            console.warn('Could not parse user object:', e)
          }
        }
        
        // Try to decode token to get role if still missing
        if (token && !userRole) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userRole = payload.role || payload.user_role || payload.authority
            if (payload.authorities && Array.isArray(payload.authorities)) {
              const adminAuth = payload.authorities.find(auth => 
                auth.authority === 'ROLE_ADMIN' || auth.authority === 'ADMIN'
              )
              if (adminAuth) {
                userRole = 'ADMIN'
                isAdminUser = true
              }
            }
            if (!userEmail) userEmail = payload.email || payload.sub
          } catch (e) {
            console.warn('Could not decode token for role:', e)
          }
        }
        
        console.log('🔑 Using user credentials:', {
          hasToken: !!token,
          role: userRole,
          isAdmin: isAdminUser,
          email: userEmail?.substring(0, 3) + '***'
        })
      }

      if (!token) {
        return { success: false, error: 'No authentication token found. Please log in as an administrator.' }
      }

      // Ensure we have admin privileges
      if (userRole !== 'ADMIN' && userRole !== 'admin' && !isAdminUser) {
        return { success: false, error: 'Admin privileges required. Current role: ' + (userRole || 'none') }
      }

      // Build headers - keep it simple for now
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      // Add the most common authentication headers
      if (userRole) {
        headers['X-User-Role'] = userRole
      }
      if (userEmail) {
        headers['X-User-Email'] = userEmail  
      }

      console.log('🔑 Final authentication headers:', {
        authorization: !!token,
        role: userRole,
        isAdmin: isAdminUser,
        email: userEmail?.substring(0, 3) + '***',
        headerCount: Object.keys(headers).length
      })

      return {
        success: true,
        headers,
        token,
        isAdminUser,
        userRole,
        userEmail
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: error.message }
    }
  }

  // Handle API errors with specific messages
  const handleApiError = async (response, action) => {
    const errorText = await response.text().catch(() => '')
    
    console.error(`❌ Failed to ${action}:`, {
      status: response.status,
      statusText: response.statusText,
      errorText
    })

    let errorMessage = ''
    
    switch (response.status) {
      case 401:
        // Clear tokens on authentication failure
        localStorage.removeItem('merko_token')
        localStorage.removeItem('userToken')
        localStorage.removeItem('merko_admin')
        localStorage.removeItem('merko_user_type')
        errorMessage = 'Session expired. Please log in again.'
        break
        
      case 403:
        errorMessage = 'Access denied. You do not have permission to perform this action. Please ensure you are logged in as an administrator.'
        break
        
      case 404:
        errorMessage = `Resource not found. The user may have been deleted.`
        break
        
      case 400:
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || 'Invalid data provided. Please check all fields.'
        } catch {
          errorMessage = 'Invalid data provided. Please check all fields.'
        }
        break
        
      case 409:
        errorMessage = 'Conflict: Email or username already exists.'
        break
        
      case 500:
        errorMessage = 'Server error. Please try again later.'
        break
        
      default:
        errorMessage = `Failed to ${action} (${response.status}). ${errorText || response.statusText}`
    }
    
    throw new Error(errorMessage)
  }

  const handleSaveUser = async () => {
    try {
      // Validate admin permissions using merco_db.admin data
      if (!checkAdminPermission()) {
        alert('Access denied. Please log in with valid admin credentials from your merco_db.admin table to edit users.')
        return
      }

      // Validate required fields
      const validationErrors = []
      if (!editUser.firstName?.trim()) validationErrors.push('First Name')
      if (!editUser.lastName?.trim()) validationErrors.push('Last Name')
      if (!editUser.email?.trim()) validationErrors.push('Email')
      if (!editUser.role) validationErrors.push('Role')

      if (validationErrors.length > 0) {
        alert(`Please fill in the following required fields: ${validationErrors.join(', ')}`)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editUser.email.trim())) {
        alert('Please enter a valid email address.')
        return
      }

      // Get authentication credentials from existing merco_db.admin login
      const authResult = getAuthenticationCredentials()
      if (!authResult.success) {
        alert('Authentication required. Please log in with your admin credentials from merco_db.admin table.')
        return
      }

      // Prepare user data
      const userData = {
        id: editUser.id,
        firstName: editUser.firstName.trim(),
        lastName: editUser.lastName.trim(),
        email: editUser.email.trim().toLowerCase(),
        username: editUser.username?.trim() || null,
        phoneNumber: editUser.phoneNumber?.trim() || '',
        companyName: editUser.companyName?.trim() || '',
        businessType: editUser.businessType?.trim() || '',
        role: editUser.role,
        status: editUser.status
      }

      console.log('🔄 Updating user:', { id: userData.id, email: userData.email, role: userData.role })
      console.log('🔑 Auth Result Details:', authResult)
      console.log('📡 Request Headers:', authResult.headers)
      console.log('📦 Request Body:', JSON.stringify(userData, null, 2))
      
      // Debug admin authentication details
      console.log('🔍 === ADMIN AUTH DEBUG ===')
      console.log('merko_admin:', localStorage.getItem('merko_admin'))
      console.log('merko_user_type:', localStorage.getItem('merko_user_type'))
      console.log('merko_user_role:', localStorage.getItem('merko_user_role'))
      console.log('merko_token:', localStorage.getItem('merko_token'))
      console.log('checkAdminPermission():', checkAdminPermission())
      console.log('🔍 === END ADMIN AUTH DEBUG ===')

      // Make API request
      const response = await fetch(`http://localhost:8090/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: authResult.headers,
        body: JSON.stringify(userData)
      })

      console.log('📊 Response Details:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Handle response
      if (!response.ok) {
        await handleApiError(response, 'update user')
        return
      }

      const result = await response.json().catch(() => ({}))
      console.log('✅ User updated successfully:', result)
      
      // Update UI
      setShowEditModal(false)
      setEditUser(null)
      await fetchUsers()
      alert('User updated successfully!')
      
    } catch (error) {
      console.error('❌ Edit user error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure the backend is running.')
      } else {
        alert(`Error updating user: ${error.message}`)
      }
    }
  }

  const handleCreateUser = async () => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password', 'role', 'companyName', 'businessType']
      const missingFields = requiredFields.filter(field => !newUser[field]?.trim())
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
        return
      }

      // Check for validation errors
      if (validationErrors.email || validationErrors.username) {
        alert('Please fix validation errors before submitting.')
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newUser.email.trim())) {
        alert('Please enter a valid email address.')
        return
      }

      // Check for duplicate email
      const existingEmail = users.find(user => 
        user.email.toLowerCase() === newUser.email.trim().toLowerCase()
      )
      if (existingEmail) {
        alert(`Email "${newUser.email}" already exists. Please use a different email address.`)
        return
      }

      // Check for duplicate username if provided
      if (newUser.username?.trim()) {
        const existingUsername = users.find(user => 
          user.username && user.username.toLowerCase() === newUser.username.trim().toLowerCase()
        )
        if (existingUsername) {
          alert(`Username "${newUser.username}" already exists. Please choose a different username.`)
          return
        }
      }

      // Get authentication credentials
      const authResult = getAuthenticationCredentials()
      if (!authResult.success) {
        alert('Authentication required. Please log in again with admin credentials.')
        return
      }

      // Prepare user data
      const userData = {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim().toLowerCase(),
        password: newUser.password,
        phoneNumber: newUser.phoneNumber.trim(),
        companyName: newUser.companyName.trim(),
        businessType: newUser.businessType.trim(),
        role: newUser.role,
        status: 'APPROVED' // Auto-approve admin-created users
      }

      if (newUser.username?.trim()) {
        userData.username = newUser.username.trim()
      }

      console.log('📝 Creating user:', { email: userData.email, role: userData.role })

      // Make API request
      const response = await fetch('http://localhost:8090/api/users/create', {
        method: 'POST',
        headers: authResult.headers,
        body: JSON.stringify(userData)
      })

      // Handle response
      if (!response.ok) {
        await handleApiError(response, 'create user')
        return
      }

      const result = await response.json().catch(() => ({}))
      console.log('✅ User created successfully:', result)
      
      // Reset form and close modal
      setShowCreateModal(false)
      setSelectedUserType('')
      setValidationErrors({})
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        phoneNumber: '',
        companyName: '',
        businessType: '',
        role: ''
      })
      
      await fetchUsers()
      alert('User created successfully!')
      
    } catch (error) {
      console.error('❌ Create user error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Cannot connect to server. Please ensure the backend is running.')
      } else {
        alert(`Error creating user: ${error.message}`)
      }
    }
  }

  const handleCreateUserClick = () => {
    // Check if user has admin permissions
    if (!checkAdminPermission()) {
      alert('Access denied. Only administrators can create new user accounts.')
      return
    }
    
    setShowCreateModal(true)
    setSelectedUserType('') // Reset user type selection
    setValidationErrors({}) // Reset validation errors
  }

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType)
    setValidationErrors({}) // Reset validation errors when switching types
    setNewUser({
      ...newUser,
      role: userType
    })
  }

  // Check for duplicate email or username
  const checkDuplicates = (field, value) => {
    if (!value || !value.trim()) return null
    
    const trimmedValue = value.trim().toLowerCase()
    
    if (field === 'email') {
      const exists = users.find(user => user.email.toLowerCase() === trimmedValue)
      return exists ? `Email "${value}" is already taken` : null
    }
    
    if (field === 'username') {
      const exists = users.find(user => user.username && user.username.toLowerCase() === trimmedValue)
      return exists ? `Username "${value}" is already taken` : null
    }
    
    return null
  }

  const handleExportPDF = () => {
    try {
      // Create HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin-bottom: 5px; }
            .header p { color: #64748b; margin: 0; }
            .stats { margin: 20px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f1f5f9; font-weight: 600; color: #1e293b; }
            .user-id { background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
            .role-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .role-admin { background: #fee2e2; color: #dc2626; }
            .role-supplier { background: #dbeafe; color: #2563eb; }
            .role-merchant { background: #dcfce7; color: #16a34a; }
            .role-delivery { background: #fef3c7; color: #d97706; }
            .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
            .status-approved { background: #dcfce7; color: #16a34a; }
            .status-pending { background: #fef3c7; color: #d97706; }
            .status-rejected { background: #fee2e2; color: #dc2626; }
            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>User Management Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="stats">
            <strong>Report Summary:</strong><br>
            Total Users: ${users.length} | 
            Showing: ${filteredUsers.length} users
            ${searchTerm ? ` | Search: "${searchTerm}"` : ''}
            ${roleFilter !== 'All Roles' ? ` | Role Filter: ${roleFilter}` : ''}
            ${statusFilter !== 'All Status' ? ` | Status Filter: ${statusFilter}` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Company</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(user => `
                <tr>
                  <td><span class="user-id">#${user.id}</span></td>
                  <td>${user.firstName} ${user.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.username || `user${user.id}`}</td>
                  <td><span class="role-badge role-${user.role?.toLowerCase()}">${user.role}</span></td>
                  <td><span class="status-badge status-${user.status?.toLowerCase()}">${user.status}</span></td>
                  <td>${user.companyName || 'N/A'}</td>
                  <td>${user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>This report was generated from Merko User Management System</p>
            <p>© ${new Date().getFullYear()} Merko Systems. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing (optional)
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  }

  return (
    <AdminLayout activeTab="user-management">
      <motion.div 
        className="user-management-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
            <div className="page-header">
              <h1>User Management</h1>
              <div className="user-count">
                <span className="count-badge">
                  Total Users: {users.length}
                  {filteredUsers.length !== users.length && ` | Showing: ${filteredUsers.length}`}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
              <div className="search-filters">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>

                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MERCHANT">Merchant</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="DELIVERY">Delivery</option>
                </select>

                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Status">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                {(searchTerm || roleFilter !== 'All Roles' || statusFilter !== 'All Status') && (
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                    title="Clear all filters"
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>

              <div className="action-buttons-group">
                <button 
                  className="export-pdf-btn"
                  onClick={handleExportPDF}
                >
                  📄 Export PDF
                </button>
                
                {checkAdminPermission() && (
                  <button 
                    className="create-user-btn"
                    onClick={handleCreateUserClick}
                  >
                    + Create User
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                Loading users...
              </div>
            ) : error ? (
              <div className="error">
                <div className="error-icon">⚠️</div>
                <div className="error-message">
                  <strong>Error:</strong> {error}
                  <br />
                  <button 
                    className="retry-btn"
                    onClick={() => fetchUsers()}
                    style={{ marginTop: '10px' }}
                  >
                    🔄 Try Again
                  </button>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No users found</h3>
                <p>
                  {searchTerm || roleFilter !== 'All Roles' || statusFilter !== 'All Status' 
                    ? 'No users match your current filters. Try adjusting your search criteria.'
                    : 'No users available in the system.'
                  }
                </p>
                {(searchTerm || roleFilter !== 'All Roles' || statusFilter !== 'All Status') && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    🗑️ Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>
                          <span className="user-id">#{user.id}</span>
                        </td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="username">
                            {user.username || `user${user.id}`}
                          </span>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role?.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status?.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {checkAdminPermission() ? (
                              <>
                                <button 
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span className="no-permission-text">View Only</span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}

        {/* Edit User Modal */}
        {showEditModal && editUser && (
          <div className="modal-overlay">
            <div className="modal-content edit-user-modal">
              <div className="modal-header">
                <h3>Edit User - {editUser.firstName} {editUser.lastName}</h3>
                <button className="close-btn" onClick={() => {
                  setShowEditModal(false)
                  setEditUser(null)
                }}>×</button>
              </div>
              <div className="modal-body">
                {/* Personal Information */}
                <div className="form-section">
                  <h5>Personal Information</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={editUser.firstName || ''}
                        onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        value={editUser.lastName || ''}
                        onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={editUser.email || ''}
                        onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={editUser.phoneNumber || ''}
                        onChange={(e) => setEditUser({...editUser, phoneNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={editUser.username || ''}
                      onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className="form-section">
                  <h5>Business Information</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        value={editUser.companyName || ''}
                        onChange={(e) => setEditUser({...editUser, companyName: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Type</label>
                      <input
                        type="text"
                        value={editUser.businessType || ''}
                        onChange={(e) => setEditUser({...editUser, businessType: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="form-section">
                  <h5>Account Settings</h5>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        value={editUser.role || ''}
                        onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MERCHANT">Merchant</option>
                        <option value="SUPPLIER">Supplier</option>
                        <option value="DELIVERY">Delivery Person</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        value={editUser.status || ''}
                        onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PENDING">Pending</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => {
                  setShowEditModal(false)
                  setEditUser(null)
                }}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveUser}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content create-user-modal">
              <div className="modal-header">
                <h3>Create New User</h3>
                <button className="close-btn" onClick={() => {
                  setShowCreateModal(false)
                  setSelectedUserType('')
                  setValidationErrors({})
                  setNewUser({
                    firstName: '',
                    lastName: '',
                    email: '',
                    username: '',
                    password: '',
                    phoneNumber: '',
                    companyName: '',
                    businessType: '',
                    role: ''
                  })
                }}>×</button>
              </div>
              
              {!selectedUserType ? (
                // User Type Selection
                <div className="modal-body">
                  <div className="user-type-selection">
                    <h4>Select User Type</h4>
                    <p className="selection-subtitle">Choose the type of user you want to create</p>
                    
                    <div className="user-type-cards">
                      <div 
                        className="user-type-card merchant-card"
                        onClick={() => handleUserTypeSelect('MERCHANT')}
                      >
                        <div className="card-icon">🏪</div>
                        <h5>Merchant</h5>
                        <p>Business owners who sell products</p>
                        <ul>
                          <li>Standard user account</li>
                          <li>Business information</li>
                          <li>Merchant role access</li>
                        </ul>
                      </div>

                      <div 
                        className="user-type-card supplier-card"
                        onClick={() => handleUserTypeSelect('SUPPLIER')}
                      >
                        <div className="card-icon">📦</div>
                        <h5>Supplier</h5>
                        <p>Suppliers who provide products</p>
                        <ul>
                          <li>Standard user account</li>
                          <li>Business information</li>
                          <li>Supplier role access</li>
                        </ul>
                      </div>

                      <div 
                        className="user-type-card delivery-card"
                        onClick={() => handleUserTypeSelect('DELIVERY')}
                      >
                        <div className="card-icon">🚚</div>
                        <h5>Delivery Person</h5>
                        <p>Delivery personnel for orders</p>
                        <ul>
                          <li>Standard user account</li>
                          <li>Business information</li>
                          <li>Delivery role access</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // User Form based on selected type
                <div className="modal-body">
                  <div className="form-header">
                    <button 
                      className="back-btn"
                      onClick={() => setSelectedUserType('')}
                    >
                      ← Back to User Type
                    </button>
                    <h4>Create {selectedUserType.charAt(0) + selectedUserType.slice(1).toLowerCase()} Account</h4>
                  </div>

                  {/* Common Fields */}
                  <div className="form-section">
                    <h5>Personal Information</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name *</label>
                        <input
                          type="text"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name *</label>
                        <input
                          type="text"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={(e) => {
                            const email = e.target.value
                            setNewUser({...newUser, email})
                            
                            // Check for duplicate email
                            if (email.trim()) {
                              const error = checkDuplicates('email', email)
                              setValidationErrors(prev => ({
                                ...prev,
                                email: error
                              }))
                            } else {
                              setValidationErrors(prev => ({
                                ...prev,
                                email: null
                              }))
                            }
                          }}
                          className={validationErrors.email ? 'error' : ''}
                          required
                        />
                        {validationErrors.email && (
                          <span className="validation-error">{validationErrors.email}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          value={newUser.phoneNumber}
                          onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={newUser.username || ''}
                          onChange={(e) => {
                            const username = e.target.value
                            setNewUser({...newUser, username})
                            
                            // Check for duplicate username
                            if (username.trim()) {
                              const error = checkDuplicates('username', username)
                              setValidationErrors(prev => ({
                                ...prev,
                                username: error
                              }))
                            } else {
                              setValidationErrors(prev => ({
                                ...prev,
                                username: null
                              }))
                            }
                          }}
                          className={validationErrors.username ? 'error' : ''}
                          placeholder="Optional - will auto-generate if empty"
                        />
                        {validationErrors.username && (
                          <span className="validation-error">{validationErrors.username}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Password *</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="form-section">
                    <h5>Business Information</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          value={newUser.companyName}
                          onChange={(e) => setNewUser({...newUser, companyName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Business Type *</label>
                        <input
                          type="text"
                          value={newUser.businessType}
                          onChange={(e) => setNewUser({...newUser, businessType: e.target.value})}
                          placeholder={selectedUserType === 'MERCHANT' ? 'e.g., Retail, Restaurant' : 
                                      selectedUserType === 'SUPPLIER' ? 'e.g., Food & Beverage, Electronics' : 
                                      'e.g., Logistics, Transportation'}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="modal-footer">
                <button 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowCreateModal(false)
                    setSelectedUserType('')
                    setValidationErrors({})
                    setNewUser({
                      firstName: '',
                      lastName: '',
                      email: '',
                      username: '',
                      password: '',
                      phoneNumber: '',
                      companyName: '',
                      businessType: '',
                      role: ''
                    })
                  }}
                >
                  Cancel
                </button>
                {selectedUserType && (
                  <button className="save-btn" onClick={handleCreateUser}>
                    Create {selectedUserType.charAt(0) + selectedUserType.slice(1).toLowerCase()}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  )
}

export default UserManagement