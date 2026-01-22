import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    merchants: 0,
    suppliers: 0,
    deliveryPersons: 0,
    totalUsers: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [recentSignUps, setRecentSignUps] = useState([])

  // Fetch real statistics and recent sign-ups from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Fetching admin data...')
        
        // Fetch statistics
        const statsResponse = await fetch('http://localhost:8090/api/admin/stats')
        if (!statsResponse.ok) {
          throw new Error(`Statistics API error! status: ${statsResponse.status}`)
        }
        const statsData = await statsResponse.json()
        console.log('Statistics fetched successfully:', statsData)
        
        setStats({
          pendingApprovals: statsData.pendingApprovals || 0,
          merchants: statsData.merchants || 0,
          suppliers: statsData.suppliers || 0,
          deliveryPersons: statsData.deliveryPersons || 0,
          totalUsers: statsData.totalUsers || 0
        })
        
        // Fetch recent sign-ups
        const signupsResponse = await fetch('http://localhost:8090/api/admin/recent-signups')
        if (signupsResponse.ok) {
          const signupsData = await signupsResponse.json()
          console.log('Recent sign-ups fetched successfully:', signupsData)
          setRecentSignUps(signupsData || [])
        } else {
          console.warn('Failed to fetch recent sign-ups:', signupsResponse.status)
          setRecentSignUps([])
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching admin data:', err)
        setError(err.message)
        
        // Keep default values if API fails
        setStats({
          pendingApprovals: 0,
          merchants: 0,
          suppliers: 0,
          deliveryPersons: 0,
          totalUsers: 0
        })
        setRecentSignUps([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Optionally refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <AdminLayout activeTab="dashboard">
      <div className="admin-dashboard">
        {/* Header */}
        <div className="main-header">
          <div className="header-left">
            <h1>AdminOS</h1>
          </div>
          <div className="header-right">
            <div className="admin-user">
              <span>Admin</span>
              
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          <motion.div 
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>System Overview</h2>
          </motion.div>

          {/* Error Display */}
          {error && (
            <div className="error-message" style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#dc2626'
            }}>
              <strong>⚠️ Error loading statistics:</strong> {error}
              <br />
              <small>Showing default values. Please check your backend connection.</small>
            </div>
          )}

          {/* Stats Cards */}
          <motion.div 
            className="stats-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="stat-card pending" variants={cardVariants}>
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-label">Pending Approvals</div>
                <div className="stat-value">
                  {loading ? '...' : stats.pendingApprovals}
                </div>
              </div>
            </motion.div>

            <motion.div className="stat-card merchants" variants={cardVariants}>
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <div className="stat-label">Merchants</div>
                <div className="stat-value">
                  {loading ? '...' : stats.merchants}
                </div>
              </div>
            </motion.div>

            <motion.div className="stat-card suppliers" variants={cardVariants}>
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-label">Suppliers</div>
                <div className="stat-value">
                  {loading ? '...' : stats.suppliers}
                </div>
              </div>
            </motion.div>

            <motion.div className="stat-card delivery" variants={cardVariants}>
              <div className="stat-icon">🚚</div>
              <div className="stat-content">
                <div className="stat-label">Delivery Persons</div>
                <div className="stat-value">
                  {loading ? '...' : stats.deliveryPersons}
                </div>
              </div>
            </motion.div>

            <motion.div className="stat-card total" variants={cardVariants}>
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Total System Users</div>
                <div className="stat-value">
                  {loading ? '...' : stats.totalUsers}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Grid - Full Width Recent Sign-Ups with Bottom Analytics */}
          <div className="content-grid">
            {/* Recent Sign-Ups - Full Width */}
            <motion.div 
              className="content-card recent-signups full-width"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <h3>Recent Sign-Ups</h3>
              <div className="table-container">
                {recentSignUps.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Company</th>
                        <th>Role</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSignUps.map((user, index) => (
                        <motion.tr 
                          key={user.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <td>{user.name}</td>
                          <td>{user.company}</td>
                          <td>
                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{new Date(user.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}</td>
                          <td>
                            <span className={`status-badge ${user.status.toLowerCase().replace('_', '-')}`}>
                              {user.status.replace('_', ' ')}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data-message" style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#64748b',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                    No recent sign-ups to display
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
