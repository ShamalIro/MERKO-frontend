import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import './InquiryCenter.css'

const InquiryCenter = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Newest First')

  // Sample inquiry/dispute data
  const [tickets] = useState([
    {
      id: 'TKT-1001',
      from: 'John Smith',
      regarding: 'ORD-78945',
      subject: 'Missing item in my order',
      category: 'Order Issue',
      type: 'Inquiry',
      priority: 'Medium',
      status: 'Open',
      dateOpened: '5/15/2023'
    },
    {
      id: 'TKT-1002',
      from: 'Sarah Johnson',
      regarding: 'ORD-65412',
      subject: 'Damaged product received',
      category: 'Product Quality',
      type: 'Dispute',
      priority: 'High',
      status: 'Open',
      dateOpened: '5/14/2023'
    },
    {
      id: 'TKT-1003',
      from: 'Robert Chen',
      regarding: 'ORD-32198',
      subject: 'Refund not processed after 14 days',
      category: 'Billing',
      type: 'Dispute',
      priority: 'Critical',
      status: 'Escalated',
      dateOpened: '5/10/2023'
    },
    {
      id: 'TKT-1004',
      from: 'Emily Rodriguez',
      regarding: 'ORD-54321',
      subject: 'Question about product compatibility',
      category: 'Product Information',
      type: 'Inquiry',
      priority: 'Low',
      status: 'Resolved',
      dateOpened: '5/12/2023'
    },
    {
      id: 'TKT-1005',
      from: 'Michael Brown',
      regarding: 'ORD-91827',
      subject: 'Late delivery complaint',
      category: 'Shipping',
      type: 'Inquiry',
      priority: 'Medium',
      status: 'Open',
      dateOpened: '5/13/2023'
    },
    {
      id: 'TKT-1006',
      from: 'Lisa Wong',
      regarding: 'ORD-43215',
      subject: 'Unauthorized charge dispute',
      category: 'Billing',
      type: 'Dispute',
      priority: 'Critical',
      status: 'Escalated',
      dateOpened: '5/11/2023'
    },
    {
      id: 'TKT-1007',
      from: 'Thomas Johnson',
      regarding: 'ORD-65478',
      subject: 'Request for product warranty information',
      category: 'Product Information',
      type: 'Inquiry',
      priority: 'Low',
      status: 'Resolved',
      dateOpened: '5/9/2023'
    },
    {
      id: 'TKT-1008',
      from: 'Jennifer Martinez',
      regarding: 'ORD-78123',
      subject: 'Wrong size received',
      category: 'Order Issue',
      type: 'Dispute',
      priority: 'High',
      status: 'Open',
      dateOpened: '5/14/2023'
    }
  ])

  const getFilteredTickets = () => {
    let filtered = tickets

    // Filter by active tab
    if (activeTab === 'INQUIRIES (OPEN)') {
      filtered = filtered.filter(ticket => ticket.type === 'Inquiry' && ticket.status === 'Open')
    } else if (activeTab === 'INQUIRIES (RESOLVED)') {
      filtered = filtered.filter(ticket => ticket.type === 'Inquiry' && ticket.status === 'Resolved')
    } else if (activeTab === 'DISPUTES (ESCALATED)') {
      filtered = filtered.filter(ticket => ticket.type === 'Dispute' && ticket.status === 'Escalated')
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.regarding.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const getTabCounts = () => {
    const all = tickets.length
    const inquiriesOpen = tickets.filter(t => t.type === 'Inquiry' && t.status === 'Open').length
    const inquiriesResolved = tickets.filter(t => t.type === 'Inquiry' && t.status === 'Resolved').length
    const disputesEscalated = tickets.filter(t => t.type === 'Dispute' && t.status === 'Escalated').length

    return { all, inquiriesOpen, inquiriesResolved, disputesEscalated }
  }

  const handleViewDetails = (ticketId) => {
    console.log(`Viewing details for ticket ${ticketId}`)
    // Implement view details functionality
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open': return 'status-open'
      case 'Resolved': return 'status-resolved'
      case 'Escalated': return 'status-escalated'
      default: return ''
    }
  }

  const getTypeClass = (type) => {
    switch (type) {
      case 'Inquiry': return 'type-inquiry'
      case 'Dispute': return 'type-dispute'
      default: return ''
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Low': return 'priority-low'
      case 'Medium': return 'priority-medium'
      case 'High': return 'priority-high'
      case 'Critical': return 'priority-critical'
      default: return ''
    }
  }

  const filteredTickets = getFilteredTickets()
  const counts = getTabCounts()

  return (
    <AdminLayout activeTab="inquiry-center">
      <motion.div 
        className="inquiry-center-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="page-header">
          <h1>Inquiry & Dispute Center</h1>
          <p>Manage customer inquiries and resolve disputes efficiently</p>
        </div>

          {/* Filter Tabs */}
          <motion.div 
            className="filter-tabs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              className={`filter-tab ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              ALL
              <span className="count">{counts.all}</span>
            </button>
            <button 
              className={`filter-tab ${activeTab === 'INQUIRIES (OPEN)' ? 'active' : ''}`}
              onClick={() => setActiveTab('INQUIRIES (OPEN)')}
            >
              INQUIRIES (OPEN)
              <span className="count">{counts.inquiriesOpen}</span>
            </button>
            <button 
              className={`filter-tab ${activeTab === 'INQUIRIES (RESOLVED)' ? 'active' : ''}`}
              onClick={() => setActiveTab('INQUIRIES (RESOLVED)')}
            >
              INQUIRIES (RESOLVED)
              <span className="count">{counts.inquiriesResolved}</span>
            </button>
            <button 
              className={`filter-tab ${activeTab === 'DISPUTES (ESCALATED)' ? 'active' : ''}`}
              onClick={() => setActiveTab('DISPUTES (ESCALATED)')}
            >
              DISPUTES (ESCALATED)
              <span className="count">{counts.disputesEscalated}</span>
            </button>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div 
            className="controls-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="search-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by ID, user, order, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-main"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="filter-controls">
                <button className="filter-btn">
                  🔽 Filter
                </button>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Priority High to Low</option>
                  <option>Priority Low to High</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Tickets Table */}
          <motion.div 
            className="tickets-table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>From (User)</th>
                  <th>Regarding</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date Opened</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <motion.tr 
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="ticket-id">{ticket.id}</td>
                    <td className="from-user">
                      <span className="user-icon">👤</span>
                      {ticket.from}
                    </td>
                    <td className="regarding">
                      <span className="order-icon">🛒</span>
                      {ticket.regarding}
                    </td>
                    <td className="subject">{ticket.subject}</td>
                    <td className="category">
                      <span className="category-icon">🏷️</span>
                      {ticket.category}
                    </td>
                    <td>
                      <span className={`type-badge ${getTypeClass(ticket.type)}`}>
                        {ticket.type}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="date-opened">{ticket.dateOpened}</td>
                    <td className="actions">
                      <button 
                        className="view-details-btn"
                        onClick={() => handleViewDetails(ticket.id)}
                      >
                        👁️ View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <motion.div 
            className="pagination"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="pagination-info">
              Showing 1 to {Math.min(8, filteredTickets.length)} of {filteredTickets.length} results
            </div>
            <div className="pagination-controls">
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
            </div>
          </motion.div>
      </motion.div>
    </AdminLayout>
  )
}

export default InquiryCenter
