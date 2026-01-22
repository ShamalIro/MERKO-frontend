import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import './UserManagement.css' // Reusing the same CSS for consistency

const ApprovalsUser = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')

  // User approvals data - empty for now
  const [userApprovals] = useState([])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleApprovalAction = (action, userId) => {
    console.log(`${action} action for user ${userId}`)
    // Implement approval actions here
    if (action === 'approve') {
      // Approve user logic
    } else if (action === 'reject') {
      // Reject user logic
    }
  }

  const filteredApprovals = userApprovals.filter(approval => {
    const matchesSearch = approval.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Status' || approval.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalResults = filteredApprovals.length
  const resultsPerPage = 5
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults)
  const currentApprovals = filteredApprovals.slice(startIndex, endIndex)

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Pending': return 'status-pending'
      case 'Approved': return 'status-approved'  
      case 'Rejected': return 'status-rejected'
      default: return ''
    }
  }

  return (
    <div className="user-management">
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
            onClick={() => navigate('/admin/dashboard')}
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
          <div className="nav-item">
            <span className="nav-icon">⚖️</span>
            Dispute Resolution
          </div>
          <div 
            className="nav-item"
            onClick={() => navigate('/admin/category-management')}
          >
            <span className="nav-icon">🏷️</span>
            Category Management
          </div>
          <div className="nav-item">
            <span className="nav-icon">📈</span>
            System Analytics
          </div>
          <div className="nav-item">
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <motion.div 
          className="content-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-header">
            <h1>User Approvals</h1>
            <p>Manage and approve new user registrations</p>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, company, or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
                  <option value="All Status">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="filter-select"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span>{totalResults} approval requests found</span>
            {totalResults > 0 && (
              <span>Showing {startIndex + 1}-{endIndex} of {totalResults}</span>
            )}
          </div>

          {/* Approvals Table */}
          <div className="table-container">
            {currentApprovals.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApprovals.map((approval, index) => (
                    <motion.tr 
                      key={approval.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="user-id">{approval.id}</td>
                      <td className="user-name">{approval.name}</td>
                      <td className="company">{approval.company}</td>
                      <td className="role">
                        <span className={`role-badge role-${approval.role?.toLowerCase()}`}>
                          {approval.role}
                        </span>
                      </td>
                      <td className="email">{approval.email}</td>
                      <td className="date">{approval.registrationDate}</td>
                      <td className="status">
                        <span className={`status-badge ${getStatusBadgeClass(approval.status)}`}>
                          {approval.status}
                        </span>
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          {approval.status === 'Pending' && (
                            <>
                              <button 
                                className="action-btn approve-btn"
                                onClick={() => handleApprovalAction('approve', approval.id)}
                              >
                                ✅ Approve
                              </button>
                              <button 
                                className="action-btn reject-btn"
                                onClick={() => handleApprovalAction('reject', approval.id)}
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleApprovalAction('view', approval.id)}
                          >
                            👁️ View
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">📋</div>
                <h3>No Approval Requests</h3>
                <p>There are currently no pending user approval requests to display.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              
              <div className="pagination-info">
                <span>Page {currentPage} of {totalPages}</span>
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ApprovalsUser