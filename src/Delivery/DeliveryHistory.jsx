import React, { useState, useEffect } from 'react';
import DeliveryLayout from './DeliveryLayout';
import './DeliveryHistory.css';

const DeliveryHistory = () => {
  const [entriesSearchQuery, setEntriesSearchQuery] = useState('');
  const [entriesStatusFilter, setEntriesStatusFilter] = useState('');
  const [deliveryEntries, setDeliveryEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch delivery entries from backend
  const fetchDeliveryEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/delivery/entries');
      if (response.ok) {
        const data = await response.json();
        setDeliveryEntries(data);
      }
    } catch (error) {
      console.error('Error fetching delivery entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate delivery stats from real data with proper status matching
  const deliveryStats = React.useMemo(() => {
    // Debug: Log unique status values to console
    const uniqueStatuses = [...new Set(deliveryEntries.map(entry => entry.status))];
    console.log('Available delivery statuses:', uniqueStatuses);

    return {
      totalDeliveries: deliveryEntries.length,
      completedDeliveries: deliveryEntries.filter(entry => {
        const status = entry.status?.toLowerCase() || '';
        return status === 'delivered' || status.includes('delivered');
      }).length,
      failedDeliveries: deliveryEntries.filter(entry => {
        const status = entry.status?.toLowerCase() || '';
        return status === 'failed' || status.includes('failed') || status === 'failed delivery';
      }).length
    };
  }, [deliveryEntries]);

  // Load data on component mount
  useEffect(() => {
    fetchDeliveryEntries();
  }, []);

  // Filter and search delivery entries (matching DeliveryDashboard logic)
  const filteredDeliveryEntries = deliveryEntries.filter((entry) => {
    let matchesFilters = true;

    // Search filter
    if (entriesSearchQuery.trim() !== '') {
      const query = entriesSearchQuery.toLowerCase();
      matchesFilters = matchesFilters && (
        entry.deliveryId.toString().toLowerCase().includes(query) ||
        entry.orderId?.toLowerCase().includes(query) ||
        entry.merchantName?.toLowerCase().includes(query) ||
        entry.supplierName?.toLowerCase().includes(query) ||
        entry.deliveryAddress?.toLowerCase().includes(query) ||
        entry.status?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (entriesStatusFilter !== '') {
      matchesFilters = matchesFilters && 
        entry.status.toLowerCase().replace(/\s+/g, '-') === entriesStatusFilter;
    }

    return matchesFilters;
  });

  // Handle search input change
  const handleEntriesSearchChange = (e) => {
    setEntriesSearchQuery(e.target.value);
  };

  // Handle status filter change
  const handleEntriesStatusFilterChange = (e) => {
    setEntriesStatusFilter(e.target.value);
  };

  const exportData = () => {
    try {
      const currentDate = new Date().toLocaleString();
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MERKO - Delivery History Report</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              line-height: 1.4;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              border-bottom: 2px solid #059669;
              padding-bottom: 20px;
            }
            .header h1 { 
              color: #059669; 
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 14px;
            }
            .meta-info { 
              background: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 20px 0;
              border-left: 4px solid #059669;
            }
            .meta-info h3 {
              margin-top: 0;
              color: #059669;
              font-size: 18px;
            }
            .meta-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #e2e8f0; 
              padding: 10px 8px; 
              text-align: left;
              vertical-align: top;
            }
            th { 
              background-color: #f1f5f9; 
              font-weight: 600;
              color: #374151;
              font-size: 13px;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .status { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 500;
              display: inline-block;
              min-width: 60px;
              text-align: center;
            }
            .status.delivered {
              background: #dcfce7;
              color: #166534;
            }
            .status.failed {
              background: #fee2e2;
              color: #dc2626;
            }
            .status.out-for-delivery {
              background: #fef3c7;
              color: #92400e;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #64748b; 
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚚 MERKO Delivery History Report</h1>
            <p>Generated on ${currentDate}</p>
          </div>
          
          <div class="meta-info">
            <h3>📊 Summary</h3>
            <p><strong>Total Deliveries:</strong> ${deliveryStats.totalDeliveries}</p>
            <p><strong>Completed Deliveries:</strong> ${deliveryStats.completedDeliveries}</p>
            <p><strong>Failed Deliveries:</strong> ${deliveryStats.failedDeliveries}</p>
            <p><strong>Showing:</strong> ${filteredDeliveryEntries.length} of ${deliveryEntries.length} delivery entries</p>
            ${entriesSearchQuery ? `<p><strong>Search Query:</strong> "${entriesSearchQuery}"</p>` : ''}
            ${entriesStatusFilter ? `<p><strong>Status Filter:</strong> "${entriesStatusFilter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Delivery ID</th>
                <th style="width: 100px;">Order ID</th>
                <th style="width: 120px;">Merchant Name</th>
                <th style="width: 120px;">Supplier Name</th>
                <th style="width: 100px;">Status</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDeliveryEntries.length === 0 ? 
                '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">No delivery entries found</td></tr>' :
                filteredDeliveryEntries.map(delivery => `
                  <tr>
                    <td><strong>${delivery.deliveryId}</strong></td>
                    <td>${delivery.orderId || 'N/A'}</td>
                    <td>${delivery.merchantName || 'N/A'}</td>
                    <td>${delivery.supplierName || 'N/A'}</td>
                    <td><span class="status ${delivery.status.toLowerCase().replace(/\s+/g, '-')}">${delivery.status}</span></td>
                    <td style="word-break: break-word;">${delivery.deliveryAddress || 'N/A'}</td>
                  </tr>
                `).join('')
              }
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Generated by MERKO Delivery Management System</strong></p>
            <p>© 2025 MERKO. All rights reserved.</p>
          </div>
        </body>
        </html>
      `;

      // Create and open new window
      const newWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!newWindow) {
        alert('Please allow pop-ups to export the PDF report.');
        return;
      }

      // Write content to new window
      newWindow.document.write(htmlContent);
      newWindow.document.close();

      // Wait for content to load, then print
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          
          // Close window after printing (with fallback timeout)
          const closeWindow = () => {
            try {
              newWindow.close();
            } catch (e) {
              console.log('Window already closed');
            }
          };

          // Listen for print completion
          newWindow.onafterprint = closeWindow;
          
          // Fallback timeout in case onafterprint doesn't fire
          setTimeout(closeWindow, 3000);
        }, 500);
      };

      console.log('Export initiated successfully');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
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

        {/* Search and Filter Controls */}
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Search & Filter</h2>
          </div>
          <div className="delivery-card-content">
            <div className="entries-filters" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="entries-search-container" style={{ flex: '1', minWidth: '300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Search:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by Delivery ID, Order ID, Merchant, Supplier, Address, or Status..."
                    value={entriesSearchQuery}
                    onChange={handleEntriesSearchChange}
                    className="entries-search-input"
                    style={{ 
                      width: '100%', 
                      padding: '8px 40px 8px 12px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                  <span 
                    className="entries-search-icon" 
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#6b7280'
                    }}
                  >
                    
                  </span>
                </div>
              </div>
              
              <div style={{ minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status:</label>
                <select
                  value={entriesStatusFilter}
                  onChange={handleEntriesStatusFilterChange}
                  className="entries-status-filter"
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="ready-for-delivery">Ready for Delivery</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed-delivery">Failed Delivery</option>
                  <option value="returned">Returned</option>
                </select>
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
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Delivery ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Merchant</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Supplier</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                          <div className="loading-spinner" style={{ 
                            width: '20px', 
                            height: '20px', 
                            border: '2px solid #f3f3f3', 
                            borderTop: '2px solid #059669', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                          }}></div>
                          Loading delivery entries...
                        </div>
                      </td>
                    </tr>
                  ) : filteredDeliveryEntries.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        {deliveryEntries.length === 0 ? 'No delivery entries found.' : 'No entries match your search criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveryEntries.map((delivery) => (
                      <tr key={delivery.deliveryId} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '12px', fontWeight: '500', color: '#059669' }}>
                          {delivery.deliveryId}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {delivery.orderId || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {delivery.merchantName || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {delivery.supplierName || 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span 
                            className={`status-badge ${
                              delivery.status === 'Delivered' ? 'delivered' :
                              delivery.status === 'Out for Delivery' ? 'out-for-delivery' :
                              delivery.status === 'Picked Up' ? 'picked-up' :
                              delivery.status === 'Failed' ? 'failed' : 'default'
                            }`}
                          >
                            {delivery.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {delivery.deliveryAddress || 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
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