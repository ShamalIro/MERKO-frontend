import React from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children, activeTab, onTabChange }) => {
  const handleSidebarClick = (itemId) => {
    if (onTabChange) {
      onTabChange(itemId);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar 
        activeTab={activeTab} 
        onSidebarClick={handleSidebarClick} 
      />
      <main className="admin-main-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;