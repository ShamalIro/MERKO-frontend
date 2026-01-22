import React, { useState } from 'react';
import DeliveryLayout from './DeliveryLayout';
import './DeliveryHistory.css';

const DeliveryHistory = () => {
  const [filters, setFilters] = useState({
    period: 'Last 30 Days',
    status: 'All',
    merchant: 'All Merchants'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const deliveryStats = {
    totalDeliveries: 42,
    completedDeliveries: 39,
    failedDeliveries: 3
  };

  const sampleDeliveries = [
    {
      id: 1,
      orderId: 'ORD-001',
      merchant: 'Tech Store',
      supplier: 'Electronics Co',
      status: 'Delivered',
      date: '2025-10-03',
      amount: '$150.00',
      address: '123 Main St'
    },
    {
      id: 2,
      orderId: 'ORD-002',
      merchant: 'Fashion Hub',
      supplier: 'Clothing Inc',
      status: 'Delivered',
      date: '2025-10-02',
      amount: '$89.99',
      address: '456 Oak Ave'
    },
    {
      id: 3,
      orderId: 'ORD-003',
      merchant: 'Food Market',
      supplier: 'Fresh Foods',
      status: 'Failed',
      date: '2025-10-01',
      amount: '$45.50',
      address: '789 Pine Rd'
    }
  ];

  const exportData = () => {
    alert('Export functionality would be implemented here');
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <DeliveryLayout activeTab="delivery-history">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <h1 className="delivery-page-title">Delivery History</h1>
          <p className="delivery-page-subtitle">View and track your completed deliveries</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="delivery-card">
            <div className="delivery-card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                {deliveryStats.totalDeliveries}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Total Deliveries</div>
            </div>
          </div>
          
          <div className="delivery-card">
            <div className="delivery-card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#38a169' }}>
                {deliveryStats.completedDeliveries}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Completed</div>
            </div>
          </div>
          
          <div className="delivery-card">
            <div className="delivery-card-content" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53e3e' }}>
                {deliveryStats.failedDeliveries}
              </div>
              <div style={{ color: '#666', marginTop: '8px' }}>Failed</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Filters</h2>
          </div>
          <div className="delivery-card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Time Period:</label>
                <select 
                  value={filters.period} 
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>All Time</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status:</label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option>All</option>
                  <option>Delivered</option>
                  <option>Failed</option>
                  <option>In Transit</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Search:</label>
                <input 
                  type="text"
                  placeholder="Search by order ID, merchant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
            </div>
            
            <button 
              onClick={exportData}
              className="delivery-btn delivery-btn-secondary"
              style={{ marginTop: '10px' }}
            >
              📥 Export Data
            </button>
          </div>
        </div>

        {/* Delivery History Table */}
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Recent Deliveries</h2>
          </div>
          <div className="delivery-card-content">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Merchant</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Supplier</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleDeliveries.map((delivery) => (
                    <tr key={delivery.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px' }}>{delivery.orderId}</td>
                      <td style={{ padding: '12px' }}>{delivery.merchant}</td>
                      <td style={{ padding: '12px' }}>{delivery.supplier}</td>
                      <td style={{ padding: '12px' }}>
                        <span 
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: delivery.status === 'Delivered' ? '#c6f6d5' : '#fed7d7',
                            color: delivery.status === 'Delivered' ? '#2f855a' : '#c53030'
                          }}
                        >
                          {delivery.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{delivery.date}</td>
                      <td style={{ padding: '12px' }}>{delivery.amount}</td>
                      <td style={{ padding: '12px' }}>{delivery.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default DeliveryHistory;