import React from 'react';
import DeliveryLayout from './DeliveryLayout';

const SimpleRoutes = () => {
  return (
    <DeliveryLayout activeTab="routes">
      <div className="delivery-page">
        <div className="delivery-page-header">
          <h1 className="delivery-page-title">Routes</h1>
          <p className="delivery-page-subtitle">Plan and optimize your delivery routes</p>
        </div>
        
        <div className="delivery-card">
          <div className="delivery-card-header">
            <h2 className="delivery-card-title">Route Planning</h2>
          </div>
          <div className="delivery-card-content">
            <p>Route planning tools will appear here...</p>
          </div>
        </div>
      </div>
    </DeliveryLayout>
  );
};

export default SimpleRoutes;