import React, { useState, useEffect } from 'react';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [deliveryPerson, setDeliveryPerson] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    totalDeliveries: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // For now, get delivery person info from localStorage
      // In a real app, you'd fetch from the server using the token
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      setDeliveryPerson(userInfo.deliveryPerson);
      
      // Fetch active orders - placeholder for now
      setActiveOrders([
        {
          orderId: 'ORD001',
          merchant: 'ABC Store',
          address: '123 Main St',
          status: 'ASSIGNED',
          estimatedTime: '30 min',
          value: '$45.50'
        },
        {
          orderId: 'ORD002',
          merchant: 'XYZ Market',
          address: '456 Oak Ave',
          status: 'PICKED_UP',
          estimatedTime: '15 min',
          value: '$28.75'
        }
      ]);

      // Fetch delivery history - placeholder
      setDeliveryHistory([
        {
          orderId: 'ORD098',
          merchant: 'Fresh Mart',
          completedAt: '2024-01-15 14:30',
          earnings: '$8.50'
        },
        {
          orderId: 'ORD097',
          merchant: 'Quick Shop',
          completedAt: '2024-01-15 12:15',
          earnings: '$6.25'
        }
      ]);

      // Set stats
      setStats({
        todayDeliveries: 8,
        totalDeliveries: 147,
        earnings: 125.75
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleOrderAction = (orderId, action) => {
    // Placeholder for order actions like accept, pick up, deliver
    console.log(`Order ${orderId}: ${action}`);
    // In a real app, you'd call the API here
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="delivery-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Delivery Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {deliveryPerson?.firstName} {deliveryPerson?.lastName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-section">
          <div className="stat-card">
            <h3>Today's Deliveries</h3>
            <div className="stat-value">{stats.todayDeliveries}</div>
          </div>
          <div className="stat-card">
            <h3>Total Deliveries</h3>
            <div className="stat-value">{stats.totalDeliveries}</div>
          </div>
          <div className="stat-card">
            <h3>Today's Earnings</h3>
            <div className="stat-value">${stats.earnings}</div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h2>Active Orders</h2>
            <div className="orders-list">
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-header">
                      <span className="order-id">#{order.orderId}</span>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="order-details">
                      <p><strong>Merchant:</strong> {order.merchant}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Value:</strong> {order.value}</p>
                      <p><strong>ETA:</strong> {order.estimatedTime}</p>
                    </div>
                    <div className="order-actions">
                      {order.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => handleOrderAction(order.orderId, 'accept')}
                          className="action-btn accept"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => handleOrderAction(order.orderId, 'pickup')}
                          className="action-btn pickup"
                        >
                          Mark as Picked Up
                        </button>
                      )}
                      {order.status === 'PICKED_UP' && (
                        <button 
                          onClick={() => handleOrderAction(order.orderId, 'deliver')}
                          className="action-btn deliver"
                        >
                          Mark as Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-orders">No active orders</div>
              )}
            </div>
          </div>

          <div className="section">
            <h2>Recent Deliveries</h2>
            <div className="history-list">
              {deliveryHistory.length > 0 ? (
                deliveryHistory.map(delivery => (
                  <div key={delivery.orderId} className="history-card">
                    <div className="history-header">
                      <span className="order-id">#{delivery.orderId}</span>
                      <span className="earnings">{delivery.earnings}</span>
                    </div>
                    <div className="history-details">
                      <p><strong>Merchant:</strong> {delivery.merchant}</p>
                      <p><strong>Completed:</strong> {delivery.completedAt}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-history">No delivery history</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;