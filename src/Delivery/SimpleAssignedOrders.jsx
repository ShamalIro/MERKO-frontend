import React from 'react';
import DeliveryLayout from './DeliveryLayout';

const SimpleAssignedOrders = () => {
  return (
    <DeliveryLayout activeTab="assigned-orders">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <h1 className="delivery-page-title">Assigned Orders</h1>
          <p className="delivery-page-subtitle">Manage and track your assigned delivery orders</p>
        </div>
        
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Current Orders</h2>
          </div>
          <div className="delivery-card-content">
            <p>Your assigned orders will appear here...</p>
            {/* Add your existing AssignedOrders content here */}
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default SimpleAssignedOrders;