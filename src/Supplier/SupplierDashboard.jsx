import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SupplierSidebar from './SupplierSidebar';
import './SupplierDashboard.css';

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('supplier');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [supplierData, setSupplierData] = useState({
    companyName: 'Premium Supplier',
    name: '',
  });
  
  // Sample data for the dashboard
  const statsData = {
    totalProducts: 124,
    activeOrders: 18,
    monthlyRevenue: 45250,
    salesGrowth: 12.5
  };

  const recentOrders = [
    {
      id: 'ORD-1234',
      customer: 'ABC Retail',
      date: '2023-08-15',
      amount: 2450,
      status: 'Delivered'
    },
    {
      id: 'ORD-1235',
      customer: 'XYZ Stores',
      date: '2023-08-14',
      amount: 1890,
      status: 'Processing'
    },
    {
      id: 'ORD-1236',
      customer: 'Global Mart',
      date: '2023-08-12',
      amount: 3200,
      status: 'In transit'
    },
    {
      id: 'ORD-1237',
      customer: 'City Shops',
      date: '2023-08-10',
      amount: 1500,
      status: 'Completed'
    }
  ];

  const lowStockProducts = [
    {
      id: 'PRD-001',
      name: 'Premium Widget',
      currentStock: 12,
      threshold: 20,
      status: 'Low Stock'
    },
    {
      id: 'PRD-008',
      name: 'Deluxe Gadget',
      currentStock: 5,
      threshold: 15,
      status: 'Low Stock'
    },
    {
      id: 'PRD-015',
      name: 'Ultra Device',
      currentStock: 8,
      threshold: 25,
      status: 'Low Stock'
    }
  ];

  // Fetch supplier data on component mount
  useEffect(() => {
    const fetchSupplier = async () => {
      const token = localStorage.getItem('merko_token');
      const userType = localStorage.getItem('merko_user_type');
      const userRole = localStorage.getItem('merko_user_role');
      
      // Check if user is logged in and has the right role
      if (!token || userType !== 'user' || (userRole !== 'SUPPLIER' && userRole !== 'Supplier')) {
        console.log('Authentication failed. Redirecting to login...');
        navigate('/login');
        return;
      }

      try {
        // Get user data from localStorage (already saved during login)
        const userData = localStorage.getItem('merko_user');
        if (userData) {
          const user = JSON.parse(userData);
          setSupplierData({
            companyName: user.companyName || 'Premium Supplier',
            name: `${user.firstName} ${user.lastName}` || 'Supplier',
          });
        }
      } catch (err) {
        console.error('Error loading supplier data:', err);
      }
    };

    fetchSupplier();
  }, [navigate]);

  const handleRoleSwitch = () => {
    const userRole = localStorage.getItem('merko_user_role');
    if (userRole === 'MERCHANT' || userRole === 'Merchant') {
      navigate('/merchant');
    } else if (userRole === 'ADMIN' || userRole === 'Admin') {
      navigate('/admin');
    } else if (userRole === 'DELIVERY' || userRole === 'Delivery') {
      navigate('/delivery');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'status-delivered';
      case 'processing':
        return 'status-processing';
      case 'in transit':
        return 'status-transit';
      case 'pending':
        return 'status-pending';
      case 'low stock':
        return 'status-low-stock';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="supplier-dashboard">
      <SupplierSidebar />
      
      <div className="supplier-main">
        {/* Header */}
        <div className="supplier-header">
          <div className="welcome-section">
            <h1>Welcome back, <span style={{ color: '#2563eb' }}>{supplierData.name || 'Supplier'}</span></h1>
            <p>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="header-right">
            <div className="notification-bell">🔔
              <span className="notification-count">3</span>
            </div>
            <div className="user-avatar">{supplierData.name?.charAt(0) || 'S'}</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Title and Actions */}
          <div className="dashboard-title-section">
            <h2>Supplier Dashboard</h2>
            <div className="dashboard-actions">
              <button className="filter-btn">📊 Filter</button>
              <button className="place-order-btn">📋 Generate Report</button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon products-icon">📦</div>
              <div className="stat-content">
                <div className="stat-label">Total Products</div>
                <div className="stat-value">{statsData.totalProducts}</div>
                <div className="stat-trend">+12 this month</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orders-icon">🛒</div>
              <div className="stat-content">
                <div className="stat-label">Active Orders</div>
                <div className="stat-value">{statsData.activeOrders}</div>
                <div className="stat-trend">+3 today</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Monthly Revenue</div>
                <div className="stat-value">${statsData.monthlyRevenue.toLocaleString()}</div>
                <div className="stat-trend">+12.5% from last month</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon growth-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Sales Growth</div>
                <div className="stat-value">+{statsData.salesGrowth}%</div>
                <div className="stat-trend">Quarterly target: 15%</div>
              </div>
            </div>
          </div>

          {/* Main Grid - 50/50 Layout */}
          <div className="dashboard-grid">
            {/* Recent Orders */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3>Recent Orders</h3>
                <button className="view-all-btn">View All →</button>
              </div>
              
              <div className="table-container">
                <table className="orders-table">
                  <thead className="table-header">
                    <tr>
                      <th className="header-cell">Order ID</th>
                      <th className="header-cell">Customer</th>
                      <th className="header-cell">Date</th>
                      <th className="header-cell">Amount</th>
                      <th className="header-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="table-cell order-id">{order.id}</td>
                        <td className="table-cell customer">{order.customer}</td>
                        <td className="table-cell date">{order.date}</td>
                        <td className="table-cell amount">${order.amount.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="dashboard-section">
              <div className="section-header">
                <h3>Low Stock Alert</h3>
                <button className="view-all-btn">Restock →</button>
              </div>
              
              <div className="table-container">
                <table className="stock-table">
                  <thead className="table-header">
                    <tr>
                      <th className="header-cell">Product ID</th>
                      <th className="header-cell">Product Name</th>
                      <th className="header-cell">Current Stock</th>
                      <th className="header-cell">Threshold</th>
                      <th className="header-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="table-row">
                        <td className="table-cell product-id">{product.id}</td>
                        <td className="table-cell product-name">{product.name}</td>
                        <td className="table-cell current-stock">{product.currentStock}</td>
                        <td className="table-cell threshold">{product.threshold}</td>
                        <td className="table-cell">
                          <span className={`status-badge ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Monthly Sales Chart */}
          <div className="dashboard-section full-width">
            <div className="section-header">
              <h3>Monthly Sales Overview</h3>
              <div className="time-filter">
                <button className="time-btn active">Week</button>
                <button className="time-btn">Month</button>
                <button className="time-btn">Year</button>
              </div>
            </div>
            
            <div className="chart-placeholder">
              <div className="chart-icon">📊</div>
              <p>Sales chart visualization would appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;