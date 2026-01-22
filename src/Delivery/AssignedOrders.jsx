import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryLayout from './DeliveryLayout';
import './AssignedOrders.css';

// PDF Export functionality using jsPDF
const generatePDF = (orders, statusFilter, searchQuery) => {
  // Create PDF content as HTML string that can be printed
  const printWindow = window.open('', '_blank');
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();
  
  // Calculate totals
  const totalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Filter info
  let filterInfo = '';
  if (statusFilter !== 'All') filterInfo += `Status: ${statusFilter} `;
  if (searchQuery) filterInfo += `Search: "${searchQuery}"`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Assigned Orders Report - ${currentDate}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
        .header h1 { color: #2563eb; margin: 0; }
        .header p { margin: 5px 0; color: #666; }
        .info-section { display: flex; justify-content: space-between; margin: 20px 0; }
        .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .filters { margin: 15px 0; padding: 10px; background: #e3f2fd; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
        th { background-color: #2563eb; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-failed { background: #fecaca; color: #991b1b; }
        .amount { font-weight: bold; color: #059669; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📦 MERKO - Assigned Orders Report</h1>
        <p>Generated on ${currentDate} at ${currentTime}</p>
        <p>Total Orders: ${orders.length} | Total Amount: LKR ${totalAmount.toFixed(2)}</p>
      </div>
      
      ${filterInfo ? `<div class="filters"><strong>Applied Filters:</strong> ${filterInfo}</div>` : ''}
      
      <div class="info-section">
        <div class="info-box">
          <h3>📊 Summary</h3>
          <p>Total Orders: <strong>${orders.length}</strong></p>
          <p>Ready for Pickup: <strong>${orders.filter(o => o.status === 'Ready for Pickup').length}</strong></p>
          <p>Assigned: <strong>${orders.filter(o => o.status === 'Assigned').length}</strong></p>
        </div>
        <div class="info-box">
          <h3>💰 Financial Summary</h3>
          <p>Total Value: <strong>LKR ${totalAmount.toFixed(2)}</strong></p>
          <p>Average Order: <strong>LKR ${orders.length ? (totalAmount / orders.length).toFixed(2) : '0.00'}</strong></p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Merchant</th>
            <th>Supplier</th>
            <th>Delivery Address</th>
            <th>Status</th>
            <th>Amount (LKR)</th>
            <th>Date</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td><strong>#${order.id}</strong></td>
              <td>${order.merchantName}<br><small>ID: ${order.merchant_id}</small></td>
              <td>${order.supplierName}<br><small>ID: ${order.supplier_id}</small></td>
              <td>📍 ${order.address}</td>
              <td><span class="status-badge status-${order.status.toLowerCase().replace(/\s+/g, '-')}">${order.status}</span></td>
              <td class="amount">LKR ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</td>
              <td>${order.date}</td>
              <td>${order.contactNumber || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p>© MERKO Delivery System | Report generated automatically</p>
        <p>This report contains ${orders.length} orders as of ${currentDate}</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

const AssignedOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Filter and Search states
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders from confirmed_orders database table
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8090/api/delivery/orders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the data from confirmed_orders table to match the UI expectations
      const transformedOrders = data.map(order => ({
        id: order.orderId,
        merchant_id: order.merchantId,
        supplier_id: order.supplierId,
        address: order.deliveryAddress,
        status: order.status,
        date: new Date(order.orderDate).toLocaleDateString(),
        merchantName: order.merchantName || `Merchant ${order.merchantId}`,
        supplierName: order.supplierName || `Supplier ${order.supplierId}`,
        totalAmount: order.totalAmount,
        contactNumber: order.contactNumber,
        deliveryInstructions: order.deliveryInstructions
      }));
      
      setOrders(transformedOrders);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders from confirmed_orders table. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };



  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);



  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  const handleSidebarClick = (itemId) => {
    setActiveTab(itemId);
    // Navigation logic
    switch (itemId) {
      case 'home':
        navigate('/delivery/dashboard');
        break;
      case 'assigned-orders':
        // Stay on current page
        break;
      case 'routes':
        navigate('/delivery/routes');
        break;
      case 'delivery-confirmation':
        navigate('/delivery/confirmation');
        break;
      case 'delivery-history':
        navigate('/delivery/history');
        break;
      default:
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'Failed':
        return 'failed';
      default:
        return 'pending';
    }
  };

  // Filter and search functionality
  const filteredOrders = orders.filter(order => {
    // Status filter
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    // Search filter (Order ID, Merchant Name, Location, Supplier Name)
    const matchesSearch = searchQuery === '' || 
      order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Export to PDF function
  const handleExportPDF = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export. Please check your filters or try again.');
      return;
    }
    
    generatePDF(filteredOrders, statusFilter, searchQuery);
  };

  return (
    <DeliveryLayout activeTab="assigned-orders">
      <div className="assigned-orders-page delivery-page">

        <div className="delivery-page-header">
          <div className="title-with-counter">
            <h1 className="delivery-page-title">Assigned Orders</h1>
            {!loading && !error && (
              <div className="orders-counter-badge">
                <span className="counter-label">Total Orders</span>
                <span className="counter-value">{filteredOrders.length}</span>
              </div>
            )}
          </div>
          <p className="delivery-page-subtitle">Manage and track your assigned delivery orders</p>
        </div>

        {/* Filter and Search Controls */}
        <div className="filter-search-container">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="statusFilter" className="filter-label">
                <span className="filter-icon">🔍</span>
                Filter by Status:
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Ready to Pick">Ready to Pick</option>
                <option value="Assigned">Assigned</option>
              </select>
            </div>
            
            <div className="search-group">
              <label htmlFor="searchQuery" className="search-label">
                
                Search:
              </label>
              <input
                id="searchQuery"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, Merchant, Location, or Supplier..."
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="export-group">
              <label className="export-label">
                <span className="export-icon">📄</span>
                Export:
              </label>
              <button
                onClick={handleExportPDF}
                className="export-btn"
                disabled={loading || filteredOrders.length === 0}
                title={filteredOrders.length === 0 ? 'No orders to export' : `Export ${filteredOrders.length} orders to PDF`}
              >
                <span className="export-btn-icon">📥</span>
                Export PDF ({filteredOrders.length})
              </button>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(statusFilter !== 'All' || searchQuery) && (
            <div className="active-filters">
              <span className="filters-label">Active filters:</span>
              {statusFilter !== 'All' && (
                <span className="filter-tag">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('All')} className="remove-filter">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="filter-tag">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="remove-filter">✕</button>
                </span>
              )}
              <button 
                onClick={() => {
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="clear-all-filters"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        
        <div className="delivery-page-content">

          <div className="orders-content">
            {/* Orders Table */}
            <div className="orders-table-container">
              {error && (
                <div className="error-message">
                  <div className="error-icon">⚠️</div>
                  <div className="error-content">
                    <strong>Connection Issue:</strong> {error}
                    <button 
                      onClick={fetchOrders}
                      className="retry-button"
                    >
                      🔄 Retry Connection
                    </button>
                  </div>
                </div>
              )}
              
              <div className="table-container">
                <div className="table-wrapper">
                  <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Merchant</th>
                      <th>Supplier</th>
                      <th>Delivery Address</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="loading-cell">
                          <div className="loading-spinner">
                            <div className="spinner"></div>
                            <span>Loading orders...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <div className="no-data-icon">📋</div>
                            <h3>No Orders Found</h3>
                            <p>There are currently no assigned orders to display.</p>
                            <button onClick={fetchOrders} className="refresh-button">
                              🔄 Refresh
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id}
                          className={`order-row ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                          onClick={() => handleOrderSelect(order)}
                        >
                          <td className="order-id">
                            <span className="id-badge">#{order.id}</span>
                          </td>
                          <td className="merchant-info">
                            <div className="merchant-details">
                              <strong>{order.merchantName}</strong>
                              <small>ID: {order.merchant_id}</small>
                            </div>
                          </td>
                          <td className="supplier-info">
                            <div className="supplier-details">
                              <strong>{order.supplierName}</strong>
                              <small>ID: {order.supplier_id}</small>
                            </div>
                          </td>
                          <td className="address">
                            <div className="address-info">
                              📍 {order.address}
                              {order.contactNumber && (
                                <small>📞 {order.contactNumber}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="amount">
                            <span className="amount-value">
                              LKR {order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
                            </span>
                          </td>
                          <td className="date">{order.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </div>

            {/* Order Details Panel */}
            {selectedOrder && (
              <div className="order-details-panel">
                <div className="panel-header">
                  <h3>Order Details - #{selectedOrder.id}</h3>
                  <button 
                    className="close-panel-btn"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="panel-content">
                  <div className="detail-section">
                    <h4>📦 Order Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Order ID:</label>
                        <span>#{selectedOrder.id}</span>
                      </div>
                      <div className="detail-item">
                        <label>Status:</label>
                        <span className={`status-badge ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Total Amount:</label>
                        <span className="amount-value">
                          LKR {selectedOrder.totalAmount ? selectedOrder.totalAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Order Date:</label>
                        <span>{selectedOrder.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>🏢 Merchant Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Merchant:</label>
                        <span>{selectedOrder.merchantName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Merchant ID:</label>
                        <span>{selectedOrder.merchant_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>🏭 Supplier Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Supplier:</label>
                        <span>{selectedOrder.supplierName}</span>
                      </div>
                      <div className="detail-item">
                        <label>Supplier ID:</label>
                        <span>{selectedOrder.supplier_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>📍 Delivery Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item full-width">
                        <label>Delivery Address:</label>
                        <span>{selectedOrder.address}</span>
                      </div>
                      <div className="detail-item">
                        <label>Contact Number:</label>
                        <span>{selectedOrder.contactNumber || 'Not provided'}</span>
                      </div>
                      {selectedOrder.deliveryInstructions && (
                        <div className="detail-item full-width">
                          <label>Delivery Instructions:</label>
                          <span className="instructions">{selectedOrder.deliveryInstructions}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel-actions">
                    {selectedOrder.contactNumber && (
                      <button 
                        className="action-button secondary"
                        onClick={() => window.open(`tel:${selectedOrder.contactNumber}`)}
                      >
                        📞 Call Customer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default AssignedOrders;
