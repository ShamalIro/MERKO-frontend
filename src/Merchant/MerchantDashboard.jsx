import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MerchantSidebar from './MerchantSidebar';
import './MerchantDashboard.css';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('merchant');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [merchantData, setMerchantData] = useState({
    companyName: 'ABC Retail',
    name: '',
  });

  // Sample data for the dashboard
  const statsData = {
    pendingOrders: 4,
    inTransit: 6,
    delivered: 28,
    totalSpend: 12450
  };

  const recentPurchases = [
    {
      id: 'ORD-5678',
      supplier: 'Tech Supplies Inc.',
      date: '2023-09-14',
      amount: 3450,
      status: 'Delivered'
    },
    {
      id: 'ORD-5679',
      supplier: 'Quality Goods Co.',
      date: '2023-09-12',
      amount: 1250,
      status: 'In transit'
    },
    {
      id: 'ORD-5680',
      supplier: 'Premium Products Ltd.',
      date: '2023-09-10',
      amount: 2800,
      status: 'Processing'
    },
    {
      id: 'ORD-5681',
      supplier: 'Best Materials Inc.',
      date: '2023-09-08',
      amount: 1900,
      status: 'Pending'
    }
  ];

  const topSuppliers = [
    {
      id: 'SUP-001',
      name: 'Tech Supplies Inc.',
      orders: 32,
      spend: 45900,
      rating: 4.8
    },
    {
      id: 'SUP-002',
      name: 'Quality Goods Co.',
      orders: 28,
      spend: 36200,
      rating: 4.5
    },
    {
      id: 'SUP-003',
      name: 'Premium Products Ltd.',
      orders: 24,
      spend: 28900,
      rating: 4.7
    }
  ];

  // Fetch merchant data on component mount
  useEffect(() => {
    const fetchMerchant = async () => {
      const token = localStorage.getItem('merko_token');
      const userType = localStorage.getItem('merko_user_type');
      const userRole = localStorage.getItem('merko_user_role');
      
      // Check if user is logged in and has the right role
      if (!token || userType !== 'user' || (userRole !== 'MERCHANT' && userRole !== 'Merchant')) {
        console.log('Authentication failed. Redirecting to login...');
        navigate('/login');
        return;
      }

      try {
        // Get user data from localStorage (already saved during login)
        const userData = localStorage.getItem('merko_user');
        if (userData) {
          const user = JSON.parse(userData);
          setMerchantData({
            companyName: user.companyName || 'ABC Retail',
            name: `${user.firstName} ${user.lastName}` || 'Merchant',
          });
        }
        
        // Optional: You can also make an API call to get fresh data
        // const response = await axios.get('http://localhost:8080/api/merchants/me', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
      } catch (err) {
        console.error('Error loading merchant data:', err);
        // Don't redirect on API error, use stored data
      }
    };

    fetchMerchant();
  }, [navigate]);

  const handleSidebarNavigation = (item) => {
    if (item === 'logout') {
      localStorage.removeItem('merko_token');
      localStorage.removeItem('merko_user');
      localStorage.removeItem('merko_user_type');
      localStorage.removeItem('merko_user_role');
      navigate('/login');
      return;
    }
    
    setActiveTab(item);
    switch (item) {
      case 'dashboard':
        // Already on dashboard
        break;
      case 'suppliers':
        navigate('/merchant/suppliers');
        break;
      case 'products':
        navigate('/merchant/products');
        break;
      case 'cart':
        navigate('/merchant/cart');
        break;
      case 'orders':
        navigate('/merchant/orders');
        break;
      case 'inquiries':
        console.log('Navigate to inquiries');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'help':
        console.log('Navigate to help center');
        break;
      default:
        break;
    }
  };

  const handleRoleSwitch = () => {
    console.log('Switch role functionality');
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#10b981';
      case 'in transit':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'pending':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }

    return stars;
  };

  const getInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="merchant-dashboard">
      {/* Sidebar */}
      <MerchantSidebar activeTab={activeTab} onSidebarClick={handleSidebarNavigation} />

      {/* Main Content */}
      <div className="merchant-main">
        {/* Header */}
        <div className="merchant-header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, {merchantData.name}</h1>
              <p>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="notification-bell">
              <span>🔔</span>
              <span className="notification-count">1</span>
            </div>
            <div className="user-profile">
              <div className="user-avatar">{getInitials(merchantData.name)}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Dashboard Title and Actions */}
          <div className="dashboard-title-section">
            <h2>Merchant Dashboard</h2>
            <div className="dashboard-actions">
              <button className="filter-btn">Filter</button>
              <button className="place-order-btn">Place New Order</button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Pending Orders</span>
                <span className="stat-icon">⏳</span>
              </div>
              <div className="stat-value">{statsData.pendingOrders}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">In Transit</span>
                <span className="stat-icon">🚚</span>
              </div>
              <div className="stat-value">{statsData.inTransit}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Delivered</span>
                <span className="stat-icon">✅</span>
              </div>
              <div className="stat-value">{statsData.delivered}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Total Spend (MTD)</span>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-value">${statsData.totalSpend.toLocaleString()}</div>
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="section">
            <h3>Recent Purchases</h3>
            <div className="table-container">
              <table className="purchases-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td className="order-id">{purchase.id}</td>
                      <td>{purchase.supplier}</td>
                      <td>{purchase.date}</td>
                      <td>${purchase.amount.toLocaleString()}</td>
                      <td>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(purchase.status) }}
                        >
                          {purchase.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view-btn">View</button>
                          <button className="action-btn track-btn">Track</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Suppliers */}
          <div className="section">
            <h3>Top Suppliers</h3>
            <div className="table-container">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Supplier ID</th>
                    <th>Supplier Name</th>
                    <th>Total Orders</th>
                    <th>Total Spend</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topSuppliers.map(supplier => (
                    <tr key={supplier.id}>
                      <td className="supplier-id">{supplier.id}</td>
                      <td>{supplier.name}</td>
                      <td>{supplier.orders}</td>
                      <td>${supplier.spend.toLocaleString()}</td>
                      <td>
                        <div className="rating">
                          {renderStars(supplier.rating)}
                          <span className="rating-value">{supplier.rating}/5</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Spending Analytics */}
          <div className="section">
            <h3>Monthly Spending Analytics</h3>
            <div className="analytics-container">
              <div className="chart-placeholder">
                <div className="chart-bars">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                </div>
                <p>Spending analytics chart would be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;