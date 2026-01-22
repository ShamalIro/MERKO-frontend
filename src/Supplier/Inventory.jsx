import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Inventory.css';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('name');

  // Sample inventory data
  const [inventoryData] = useState([
    {
      id: 'PRD-001',
      name: 'Premium Widget',
      sku: 'WDG-PRM-001',
      location: 'Warehouse A',
      stock: 72,
      threshold: 20,
      lastUpdated: '2023-08-19',
      status: 'Low Stock'
    },
    {
      id: 'PRD-002',
      name: 'Standard Widget',
      sku: 'WDG-STD-002',
      location: 'Warehouse A',
      stock: 45,
      threshold: 25,
      lastUpdated: '2023-08-12',
      status: 'Normal'
    },
    {
      id: 'PRD-003',
      name: 'Basic Widget',
      sku: 'WDG-BSC-003',
      location: 'Warehouse B',
      stock: 32,
      threshold: 15,
      lastUpdated: '2023-08-15',
      status: 'Normal'
    },
    {
      id: 'PRD-004',
      name: 'Deluxe Gadget',
      sku: 'GDT-DLX-004',
      location: 'Warehouse C',
      stock: 5,
      threshold: 15,
      lastUpdated: '2023-08-08',
      status: 'Low Stock'
    },
    {
      id: 'PRD-005',
      name: 'Smart Device',
      sku: 'DEV-SMT-005',
      location: 'Warehouse A',
      stock: 18,
      threshold: 10,
      lastUpdated: '2023-08-14',
      status: 'Normal'
    },
    {
      id: 'PRD-006',
      name: 'Tech Accessory',
      sku: 'ACC-TCH-006',
      location: 'Warehouse B',
      stock: 50,
      threshold: 30,
      lastUpdated: '2023-08-11',
      status: 'Normal'
    },
    {
      id: 'PRD-007',
      name: 'Professional Tool',
      sku: 'TL-PRD-007',
      location: 'Warehouse C',
      stock: 77,
      threshold: 25,
      lastUpdated: '2023-08-09',
      status: 'Normal'
    },
    {
      id: 'PRD-008',
      name: 'Ultra Device',
      sku: 'DEV-ULT-008',
      location: 'Warehouse A',
      stock: 8,
      threshold: 25,
      lastUpdated: '2023-08-07',
      status: 'Low Stock'
    },
    {
      id: 'PRD-009',
      name: 'Starter Kit',
      sku: 'KIT-STR-009',
      location: 'Warehouse B',
      stock: 0,
      threshold: 10,
      lastUpdated: '2023-08-05',
      status: 'Out of Stock'
    },
    {
      id: 'PRD-010',
      name: 'Premium Toolkit',
      sku: 'TL-KIT-010',
      location: 'Warehouse C',
      stock: 15,
      threshold: 12,
      lastUpdated: '2023-08-15',
      status: 'Normal'
    }
  ]);

  // Calculate stats
  const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = inventoryData.filter(item => item.status === 'Low Stock').length;
  const outOfStockItems = inventoryData.filter(item => item.status === 'Out of Stock').length;
  const healthyStockItems = inventoryData.filter(item => item.status === 'Normal').length;

  // Filter and sort data
  const filteredData = inventoryData
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stock':
          return b.stock - a.stock;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Normal':
        return 'status-normal';
      case 'Low Stock':
        return 'status-low';
      case 'Out of Stock':
        return 'status-out';
      default:
        return 'status-normal';
    }
  };

  return (
    <div className="inventory-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="supplier-logo">
            <div className="logo-icon">📦</div>
            <div className="logo-text">
              <div className="portal-name">Supplier Portal</div>
              <div className="company-name">Tech Supplies Inc.</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div 
            className="nav-item"
            onClick={() => handleNavigation('/supplier/dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => handleNavigation('/supplier/products')}
          >
            <span className="nav-icon">📋</span>
            <span>Products</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">📦</span>
            <span>Inventory</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => handleNavigation('/supplier/orders')}
          >
            <span className="nav-icon">🛒</span>
            <span>Orders</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => handleNavigation('/supplier/settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </div>
          <div 
            className="nav-item"
            onClick={() => handleNavigation('/supplier/help')}
          >
            <span className="nav-icon">❓</span>
            <span>Help Center</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="switch-role-btn"
            onClick={() => handleNavigation('/')}
          >
            <span className="switch-icon">🔄</span>
            Switch Role
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <div className="welcome-section">
              <h1>Welcome back, John</h1>
              <p className="current-date">Today is 8/30/2025</p>
            </div>
          </div>
          <div className="header-right">
            <button className="notification-btn">
              🔔
              <span className="notification-badge">3</span>
            </button>
            <div className="profile-avatar">JD</div>
          </div>
        </div>

        {/* Inventory Content */}
        <div className="inventory-content">
          {/* Page Header */}
          <div className="page-header">
            <h2>Inventory Management</h2>
            <button className="update-inventory-btn">
              <span>🔄</span>
              Update Inventory
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Total Stock</div>
                <div className="stat-value">{totalStock}</div>
              </div>
            </div>
            <div className="stat-card low">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-label">Low Stock Items</div>
                <div className="stat-value">{lowStockItems}</div>
              </div>
            </div>
            <div className="stat-card out">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <div className="stat-label">Out of Stock</div>
                <div className="stat-value">{outOfStockItems}</div>
              </div>
            </div>
            <div className="stat-card healthy">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Healthy Stock</div>
                <div className="stat-value">{healthyStockItems}</div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All Status">All Status</option>
                <option value="Normal">Normal</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button className="sort-btn" onClick={() => setSortBy(sortBy === 'name' ? 'stock' : 'name')}>
                <span>📊</span>
                Sort
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="inventory-table-section">
            <div className="inventory-table">
              <div className="table-header">
                <div className="header-cell">Product ID</div>
                <div className="header-cell">Product Name</div>
                <div className="header-cell">SKU</div>
                <div className="header-cell">Location</div>
                <div className="header-cell">Stock</div>
                <div className="header-cell">Threshold</div>
                <div className="header-cell">Last Updated</div>
                <div className="header-cell">Status</div>
              </div>
              <div className="table-body">
                {filteredData.map((item) => (
                  <div key={item.id} className="table-row">
                    <div className="table-cell product-id">{item.id}</div>
                    <div className="table-cell product-name">{item.name}</div>
                    <div className="table-cell sku">{item.sku}</div>
                    <div className="table-cell location">{item.location}</div>
                    <div className="table-cell stock">{item.stock}</div>
                    <div className="table-cell threshold">{item.threshold}</div>
                    <div className="table-cell last-updated">{item.lastUpdated}</div>
                    <div className="table-cell status">
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Showing 10 of 10 items
              </div>
              <div className="pagination-controls">
                <button className="pagination-btn" disabled>Previous</button>
                <button className="pagination-btn" disabled>Next</button>
              </div>
            </div>
          </div>

          {/* Stock Level Trends */}
          <div className="trends-section">
            <h3>Stock Level Trends</h3>
            <div className="chart-placeholder">
              <div className="chart-icon">📊</div>
              <p>Stock level trend chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
