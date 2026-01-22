import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './Approvals.css'

const Approvals = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('ALL PENDING')
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // Fetch pending users from backend
  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8090/api/users/pending')
      const result = await response.json()
      
      if (result.success) {
        setPendingUsers(result.users)
      } else {
        setError(result.message || 'Failed to fetch pending users')
      }
    } catch (error) {
      console.error('Error fetching pending users:', error)
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Approve user
  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId)
      
      const approvalData = {
        userId: userId,
        status: 'APPROVED',
        approvedBy: 'Admin',
        rejectionReason: null
      }

      const response = await fetch('http://localhost:8080/api/users/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      })

      const result = await response.json()
      
      if (result.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId))
        alert('User approved successfully!')
      } else {
        setError(result.message || 'Failed to approve user')
      }
    } catch (error) {
      console.error('Error approving user:', error)
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  // Reject user
  const handleReject = async (userId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:') || 'Application did not meet requirements'
    
    try {
      setActionLoading(userId)
      
      const approvalData = {
        userId: userId,
        status: 'REJECTED',
        approvedBy: 'Admin',
        rejectionReason: rejectionReason
      }

      const response = await fetch('http://localhost:8080/api/users/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      })

      const result = await response.json()
      
      if (result.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId))
        alert('User rejected successfully!')
      } else {
        setError(result.message || 'Failed to reject user')
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getFilteredApplications = () => {
    if (activeFilter === 'ALL PENDING') return pendingUsers
    if (activeFilter === 'SUPPLIERS') return pendingUsers.filter(user => user.role === 'SUPPLIER')
    if (activeFilter === 'MERCHANTS') return pendingUsers.filter(user => user.role === 'MERCHANT')
    return pendingUsers
  }

  const filteredApplications = getFilteredApplications()
  const allPendingCount = pendingUsers.length
  const suppliersCount = pendingUsers.filter(user => user.role === 'SUPPLIER').length
  const merchantsCount = pendingUsers.filter(user => user.role === 'MERCHANT').length

  return (
    <div className="approvals">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">🎯</div>
            <span>Admin Panel</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className="nav-item"
            onClick={() => navigate('/admin-dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div 
            className="nav-item"
            onClick={() => navigate('/admin/user-management')}
          >
            <span className="nav-icon">👥</span>
            User Management
          </div>
          <div className="nav-item active">
            <span className="nav-icon">✅</span>
            Approvals
          </div>
          <div 
            className="nav-item"
            onClick={() => navigate('/admin/inquiry-center')}
          >
            <span className="nav-icon">❓</span>
            Inquiry Center
          </div>
          <div 
            className="nav-item"
            onClick={() => navigate('/admin/category-management')}
          >
            <span className="nav-icon">🏷️</span>
            Category Management
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>User Approval Center</h1>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span>Admin</span>
              <div className="avatar">👤</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          <div className="content-header">
            <h2>Pending User Applications</h2>
            <p>Review and approve user registrations</p>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'ALL PENDING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL PENDING')}
            >
              All Pending ({allPendingCount})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'SUPPLIERS' ? 'active' : ''}`}
              onClick={() => setActiveFilter('SUPPLIERS')}
            >
              Suppliers ({suppliersCount})
            </button>
            <button 
              className={`filter-tab ${activeFilter === 'MERCHANTS' ? 'active' : ''}`}
              onClick={() => setActiveFilter('MERCHANTS')}
            >
              Merchants ({merchantsCount})
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading pending applications...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button onClick={fetchPendingUsers} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {/* Applications List */}
          {!loading && !error && (
            <div className="applications-list">
              {filteredApplications.length === 0 ? (
                <div className="no-applications">
                  <p>No pending applications found.</p>
                </div>
              ) : (
                filteredApplications.map((user, index) => (
                  <motion.div 
                    key={user.id}
                    className="application-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="card-header">
                      <div className="company-info">
                        <h3>{user.companyName}</h3>
                        <span className={`type-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="submission-date">
                        <span className="date-label">Submitted:</span>
                        <span className="date">
                          {new Date(user.registrationDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="details-section">
                        <h4>Application Details</h4>
                        <div className="detail-item">
                          <span className="detail-icon">👤</span>
                          <div className="detail-info">
                            <span className="detail-label">Contact Person:</span>
                            <span className="detail-value">{user.firstName} {user.lastName}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📧</span>
                          <div className="detail-info">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{user.email}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">📱</span>
                          <div className="detail-info">
                            <span className="detail-label">Phone:</span>
                            <span className="detail-value">{user.phoneNumber}</span>
                          </div>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">🏢</span>
                          <div className="detail-info">
                            <span className="detail-label">Business Type:</span>
                            <span className="detail-value">{user.businessType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className={`approve-btn ${actionLoading === user.id ? 'loading' : ''}`}
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? 'Approving...' : '✅ Approve'}
                      </button>
                      <button 
                        className={`reject-btn ${actionLoading === user.id ? 'loading' : ''}`}
                        onClick={() => handleReject(user.id)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? 'Rejecting...' : '❌ Reject'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Approvals
