import React from 'react';
import DeliveryLayout from './DeliveryLayout';

const SimpleDeliveryHistory = () => {
  return (
    <DeliveryLayout activeTab="delivery-history">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <h1 className="delivery-page-title">Delivery History</h1>
          <p className="delivery-page-subtitle">View and track your completed deliveries</p>
        </div>
        
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Recent Deliveries</h2>
          </div>
          <div className="delivery-card-content">
            <p>Your delivery history will appear here...</p>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default SimpleDeliveryHistory;