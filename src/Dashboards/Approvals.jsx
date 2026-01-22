import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import './Approvals.css'

const Approvals = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('merchants')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // All approvals data

  const [supplierApprovals, setSupplierApprovals] = useState([])
  const [merchantApprovals, setMerchantApprovals] = useState([])

  // Fetch data when component mounts or when active tab changes
  useEffect(() => {
    if (activeTab === 'merchants') {
      fetchAllMerchants()
    } else if (activeTab === 'suppliers') {
      fetchAllSuppliers()
    }
  }, [activeTab])

  const fetchAllMerchants = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8090/api/merchants/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        const merchants = responseData.merchants || []
        setMerchantApprovals(merchants.map(merchant => ({
          id: merchant.id,
          businessName: merchant.companyName,
          ownerName: merchant.contactPersonName,
          email: merchant.email,
          phone: merchant.phoneNumber,
          category: merchant.businessType,
          registrationNumber: merchant.businessRegistrationNumber,
          address: merchant.businessAddress,
          status: merchant.status || 'Unknown',
          registrationDate: new Date(merchant.createdAt).toLocaleDateString(),
          rawData: merchant // Keep original data for API calls
        })))
      } else {
        setError('Failed to fetch merchants')
      }
    } catch (error) {
      console.error('Error fetching merchants:', error)
      setError('Network error while fetching merchants')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllSuppliers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:8090/api/suppliers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const responseData = await response.json()
        const suppliers = responseData.suppliers || []
        setSupplierApprovals(suppliers.map(supplier => ({
          id: supplier.id,
          companyName: supplier.companyName,
          contactPersonName: supplier.contactPersonName,
          email: supplier.email,
          phone: supplier.phoneNumber,
          businessRegistrationNumber: supplier.businessRegistrationNumber,
          status: supplier.status || 'Unknown',
          registrationDate: new Date(supplier.createdAt).toLocaleDateString(),
          rawData: supplier // Keep original data for API calls
        })))
      } else {
        setError('Failed to fetch suppliers')
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Network error while fetching suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchTerm('')
    setStatusFilter('All Status')
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('All Status')
    setSelectedDate('')
    setCurrentPage(1)
  }

  const getSearchPlaceholder = () => {
    switch(activeTab) {
      case 'suppliers':
        return 'Search by company name, contact person, email, phone, or ID...'
      case 'merchants':
        return 'Search by business name, owner, email, category, phone, or ID...'
      default:
        return 'Search approvals...'
    }
  }

  const handleApprovalAction = async (action, userId) => {
    console.log(`${action} action for user ${userId}`)
    
    // Check if trying to approve an already approved supplier/merchant
    const currentData = getCurrentData()
    const currentItem = currentData.find(item => item.id === userId)
    
    if (action === 'approve' && currentItem && (currentItem.status === 'APPROVED' || currentItem.status === 'Approved')) {
      const entityType = activeTab === 'merchants' ? 'merchant' : 'supplier'
      alert(`This ${entityType} has already been approved and can login to the system.`)
      return
    }
    
    setLoading(true)
    
    try {
      let response
      let apiEndpoint = ''
      
      // Determine the correct API endpoint based on active tab
      if (activeTab === 'merchants') {
        if (action === 'approve') {
          apiEndpoint = `http://localhost:8090/api/merchants/${userId}/approve?approvedBy=1`
        } else if (action === 'reject') {
          apiEndpoint = `http://localhost:8090/api/merchants/${userId}/reject?reason=Rejected by admin`
        }
      } else if (activeTab === 'suppliers') {
        if (action === 'approve') {
          apiEndpoint = `http://localhost:8090/api/suppliers/${userId}/approve`
        } else if (action === 'reject') {
          apiEndpoint = `http://localhost:8090/api/suppliers/${userId}/reject`
        }
      }

      // Make the API call
      if (apiEndpoint) {
        if (activeTab === 'suppliers' && action === 'approve') {
          response = await fetch(apiEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ approvedBy: 'Admin' })
          })
        } else if (activeTab === 'suppliers' && action === 'reject') {
          response = await fetch(apiEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rejectedBy: 'Admin' })
          })
        } else {
          response = await fetch(apiEndpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      }

      if (response && response.ok) {
        const result = await response.json()
        console.log(`${action} successful:`, result)
        
        // Refresh the appropriate list based on active tab
        if (activeTab === 'merchants') {
          fetchAllMerchants()
        } else if (activeTab === 'suppliers') {
          fetchAllSuppliers()
        }
        
        // Show success message
        const entityType = activeTab === 'merchants' ? 'Merchant' : 'Supplier'
        if (action === 'approve') {
          alert(`${entityType} approved successfully! They can now login to the system.`)
        } else {
          alert(`${entityType} ${action}d successfully!`)
        }
      } else {
        const errorData = response ? await response.json() : { message: 'Unknown error' }
        const entityType = activeTab === 'merchants' ? 'merchant' : 'supplier'
        setError(`Failed to ${action} ${entityType}: ${errorData.message}`)
        alert(`Failed to ${action} ${entityType}`)
      }
    } catch (error) {
      const entityType = activeTab === 'merchants' ? 'merchant' : 'supplier'
      console.error(`Error ${action}ing ${entityType}:`, error)
      setError(`Network error while ${action}ing ${entityType}`)
      alert(`Network error while ${action}ing ${entityType}`)
    } finally {
      setLoading(false)
    }
  }

  // Get current data based on active tab
  const getCurrentData = () => {
    switch(activeTab) {
      case 'suppliers':
        return supplierApprovals
      case 'merchants':
        return merchantApprovals
      default:
        return []
    }
  }

  const filteredApprovals = getCurrentData().filter(approval => {
    // Search filter - if no search term, show all results
    let matchesSearch = true
    
    if (searchTerm.trim() !== '') {
      if (activeTab === 'suppliers') {
        matchesSearch = approval.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.contactPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.businessRegistrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.phone?.toString().includes(searchTerm) ||
                       approval.id?.toString().includes(searchTerm)
      } else if (activeTab === 'merchants') {
        matchesSearch = approval.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       approval.phone?.toString().includes(searchTerm) ||
                       approval.id?.toString().includes(searchTerm) ||
                       approval.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      }
    }
    
    // Status filter - handle different status formats
    let matchesStatus = statusFilter === 'All Status'
    if (!matchesStatus) {
      const approvalStatus = approval.status?.toLowerCase()
      const filterStatus = statusFilter.toLowerCase()
      
      matchesStatus = approvalStatus === filterStatus ||
                     (filterStatus === 'pending' && (approvalStatus === 'pending_approval' || approvalStatus === 'pending')) ||
                     (filterStatus === 'approved' && (approvalStatus === 'approved' || approvalStatus === 'approved')) ||
                     (filterStatus === 'rejected' && (approvalStatus === 'rejected' || approvalStatus === 'rejected'))
    }
    
    // Date filter
    let matchesDate = true
    if (selectedDate) {
      const approvalDate = new Date(approval.registrationDate).toISOString().split('T')[0]
      matchesDate = approvalDate === selectedDate
    }
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const totalResults = filteredApprovals.length
  const resultsPerPage = 5
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  const startIndex = (currentPage - 1) * resultsPerPage
  const endIndex = Math.min(startIndex + resultsPerPage, totalResults)
  const currentApprovals = filteredApprovals.slice(startIndex, endIndex)

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'PENDING_APPROVAL': 
      case 'Pending': 
        return 'status-pending'
      case 'APPROVED': 
      case 'Approved': 
        return 'status-approved'  
      case 'REJECTED': 
      case 'Rejected': 
        return 'status-rejected'
      default: 
        return 'status-pending'
    }
  }

  return (
    <AdminLayout activeTab="approvals">
      <motion.div 
        className="approvals-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
          <div className="page-header">
            <h1>Approvals Management</h1>
            <p>Manage all approval requests across different categories</p>
          </div>

          {/* Tab Navigation */}
          <div className="filter-tabs">
            <button 
              onClick={() => handleTabChange('suppliers')}
              className={`filter-tab ${activeTab === 'suppliers' ? 'active' : ''}`}
            >
              <span>🏪</span>
              Suppliers
            </button>
            <button 
              onClick={() => handleTabChange('merchants')}
              className={`filter-tab ${activeTab === 'merchants' ? 'active' : ''}`}
            >
              <span>🏬</span>
              Merchants
            </button>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              {(searchTerm || statusFilter !== 'All Status' || selectedDate) && (
                <button 
                  onClick={clearFilters}
                  className="clear-filters-btn"
                  title="Clear all filters"
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Status</label>
                <select value={statusFilter} onChange={handleStatusFilter} className="filter-select">
                  <option value="All Status">All Status</option>
                  <option value="Pending">Pending Approval</option>
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
            <span>{totalResults} {activeTab} approval requests found</span>
            {totalResults > 0 && (
              <span>Showing {startIndex + 1}-{endIndex} of {totalResults}</span>
            )}
          </div>

          {/* Approvals Table */}
          <div className={`table-container ${activeTab === 'suppliers' ? 'suppliers-table-wrapper' : ''} ${activeTab === 'merchants' ? 'merchants-table-wrapper' : ''}`}>
            {currentApprovals.length > 0 ? (
              <table className="users-table">
                <thead>
                  <tr>
                    {activeTab === 'suppliers' && (
                      <>
                        <th>Supp..ID</th>
                        <th>Company Name</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Registration Number</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </>
                    )}
                    {activeTab === 'merchants' && (
                      <>
                        <th>Merchant ID</th>
                        <th>Business Name</th>
                        <th>Owner Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Category</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </>
                    )}
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
                      {activeTab === 'suppliers' && (
                        <>
                          <td className="user-id">{approval.id}</td>
                          <td className="user-name">{approval.companyName}</td>
                          <td className="company">{approval.contactPersonName}</td>
                          <td className="email">{approval.email}</td>
                          <td className="phone">{approval.phone}</td>
                          <td className="business-type">
                            <span className={`category-badge category-registration`}>
                              {approval.businessRegistrationNumber || 'N/A'}
                            </span>
                          </td>
                          <td className="date">{approval.registrationDate}</td>
                        </>
                      )}
                      {activeTab === 'merchants' && (
                        <>
                          <td className="user-id">{approval.id}</td>
                          <td className="user-name">{approval.businessName}</td>
                          <td className="company">{approval.ownerName}</td>
                          <td className="email">{approval.email}</td>
                          <td className="phone">{approval.phone}</td>
                          <td className="category">
                            <span className={`category-badge category-${approval.category?.toLowerCase()}`}>
                              {approval.category}
                            </span>
                          </td>
                          <td className="date">{approval.registrationDate}</td>
                        </>
                      )}
                      <td className="status">
                        <span className={`status-badge ${getStatusBadgeClass(approval.status)}`}>
                          {approval.status}
                        </span>
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button 
                            className={`action-btn approve-btn ${approval.status === 'Approved' || approval.status === 'APPROVED' ? 'approved-disabled' : ''}`}
                            onClick={() => handleApprovalAction('approve', approval.id)}
                            disabled={approval.status === 'Approved' || approval.status === 'APPROVED'}
                            title={approval.status === 'Approved' || approval.status === 'APPROVED' ? 'This supplier has already been approved' : 'Approve this supplier'}
                          >
                            {approval.status === 'Approved' || approval.status === 'APPROVED' ? '✅ Already Approved' : '✅ Approve'}
                          </button>
                          <button 
                            className="action-btn reject-btn"
                            onClick={() => handleApprovalAction('reject', approval.id)}
                            disabled={approval.status === 'Rejected'}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : loading ? (
              <div className="no-data">
                <div className="no-data-icon">⏳</div>
                <h3>Loading...</h3>
                <p>Fetching pending {activeTab} approval requests...</p>
              </div>
            ) : error ? (
              <div className="no-data">
                <div className="no-data-icon">⚠️</div>
                <h3>Error</h3>
                <p>{error}</p>
                <button 
                  onClick={() => activeTab === 'merchants' ? fetchAllMerchants() : fetchAllSuppliers()}
                  className="retry-btn"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="no-data">
                <div className="no-data-icon">📋</div>
                <h3>No Approval Requests</h3>
                <p>
                  {activeTab === 'merchants' 
                    ? 'There are currently no pending merchant approval requests to display.' 
                    : `There are currently no pending ${activeTab} approval requests to display.`
                  }
                </p>
                {activeTab === 'merchants' && (
                  <button 
                    onClick={fetchAllMerchants}
                    className="refresh-btn"
                  >
                    🔄 Refresh
                  </button>
                )}
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
    </AdminLayout>
  )
}

export default Approvals