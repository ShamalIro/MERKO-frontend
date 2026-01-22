import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ activeTab, onSidebarClick }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'user-management', label: 'User Management', icon: '👥' },
    { id: 'approvals', label: 'Approvals', icon: '✅' },
    { id: 'inquiry-center', label: 'Inquiry Center', icon: '❓' }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (onSidebarClick) {
      onSidebarClick(itemId);
    }

    // Navigate to specific admin routes
    switch (itemId) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'user-management':
        navigate('/admin/user-management');
        break;
      case 'approvals':
        navigate('/admin/approvals');
        break;
      case 'inquiry-center':
        navigate('/admin/inquiry-center');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    // Clear admin authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">AdminDash</h2>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            data-item-id={item.id}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}

        <button
          className="sidebar-item logout-item"
          data-item-id="logout"
          onClick={() => handleItemClick('logout')}
        >
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;