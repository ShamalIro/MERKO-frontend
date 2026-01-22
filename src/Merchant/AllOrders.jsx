import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:8090/api/orders');
      // const data = await response.json();
      
      // Placeholder data for now
      const placeholderOrders = [
        {
          id: 1,
          orderDate: '2025-09-28',
          status: 'Pending',
          totalAmount: 250.00,
          merchantName: 'ABC Store',
          itemCount: 3
        },
        {
          id: 2,
          orderDate: '2025-09-27',
          status: 'Delivered',
          totalAmount: 180.50,
          merchantName: 'XYZ Shop',
          itemCount: 2
        }
      ];
      
      setOrders(placeholderOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/merchant/orders/${orderId}`);
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="all-orders">
      <div className="orders-header">
        <h1>All Orders</h1>
        <p>View and manage all your orders</p>
      </div>

      <div className="orders-container">
        {orders.length > 0 ? (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.orderDate}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>{order.itemCount} items</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .all-orders {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .orders-header {
          margin-bottom: 2rem;
        }

        .orders-header h1 {
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .orders-header p {
          color: #64748b;
          margin: 0;
        }

        .orders-table {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
        }

        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status.pending {
          background: #fef3c7;
          color: #d97706;
        }

        .status.delivered {
          background: #d1fae5;
          color: #059669;
        }

        .view-btn {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .view-btn:hover {
          background: #1d4ed8;
        }

        .loading, .no-orders {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default AllOrders;
