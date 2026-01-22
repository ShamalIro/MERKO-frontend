import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import './AdminSidebar.css'

const AdminSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Get active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/admin/dashboard' || path === '/admin') return 'dashboard'
    if (path.includes('/admin/user-management')) return 'users'
    if (path.includes('/admin/approvals')) return 'approvals'
    if (path.includes('/admin/inquiry-center')) return 'disputes'
    if (path.includes('/admin/category-management')) return 'category'
    if (path.includes('/admin/analytics')) return 'analytics'
    if (path.includes('/admin/settings')) return 'settings'
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  // Logout handler
  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('userToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    localStorage.removeItem('merko_user')
    localStorage.removeItem('merko_user_role')
    localStorage.removeItem('merko_token')
    
    // Navigate to home page
    navigate('/')
  }

  // Navigation items
  const navItems = [
    {
      id: 'dashboard',
      icon: '📊',
      text: 'Dashboard',
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      icon: '👥',
      text: 'User Management',
      path: '/admin/user-management'
    },
    {
      id: 'approvals',
      icon: '✅',
      text: 'Approvals',
      path: '/admin/approvals'
    },
    {
      id: 'disputes',
      icon: '❓',
      text: 'Inquiry Center',
      path: '/admin/inquiry-center'
    },
    {
      id: 'resolution',
      icon: '⚖️',
      text: 'Dispute Resolution',
      path: '/admin/dispute-resolution'
    },
    {
      id: 'category',
      icon: '📂',
      text: 'Category Management',
      path: '/admin/category-management'
    },
    {
      id: 'analytics',
      icon: '📈',
      text: 'System Analytics',
      path: '/admin/analytics'
    },
    {
      id: 'settings',
      icon: '⚙️',
      text: 'Settings',
      path: '/admin/settings'
    }
  ]

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="admin-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">MERKO</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <motion.div 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.text}</span>
          </motion.div>
        ))}

        {/* Logout Button */}
        <motion.div 
          className="nav-item logout-item"
          onClick={handleLogout}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </motion.div>
      </nav>
    </div>
  )
}

export default AdminSidebar