import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from './DeliveryHeader';
import DeliverySidebar from './DeliverySidebar';
import './DeliveryLayout.css';

const DeliveryLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const handleSidebarClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (onTabChange) {
      onTabChange(itemId);
    }
    
    // Navigate to specific routes if needed
    switch (itemId) {
      case 'home':
        navigate('/delivery/dashboard');
        break;
      case 'assigned-orders':
        navigate('/delivery/assigned-orders');
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

  const handleLogout = () => {
    // Clear delivery person authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="delivery-layout">
      <DeliveryHeader />
      <div className="delivery-layout-content">
        <DeliverySidebar 
          activeTab={activeTab} 
          onSidebarClick={handleSidebarClick} 
        />
        <main className="delivery-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DeliveryLayout;