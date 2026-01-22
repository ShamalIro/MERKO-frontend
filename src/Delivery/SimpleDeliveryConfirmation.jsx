import React from 'react';
import DeliveryLayout from './DeliveryLayout';

const SimpleDeliveryConfirmation = () => {
  return (
    <DeliveryLayout activeTab="delivery-confirmation">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <h1 className="delivery-page-title">Delivery Inquiry</h1>
          <p className="delivery-page-subtitle">Inquire and track delivery status</p>
        </div>
        
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Pending Confirmations</h2>
          </div>
          <div className="delivery-card-content">
            <p>Delivery confirmations will appear here...</p>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default SimpleDeliveryConfirmation;