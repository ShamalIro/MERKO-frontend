import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DeliverySidebar.css';

const DeliverySidebar = ({ activeTab, onSidebarClick }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'assigned-orders', label: 'Assigned Orders', icon: '📍' },
    { id: 'routes', label: 'Routes', icon: '🗺️' },
    { id: 'delivery-history', label: 'Delivery History', icon: '📜' }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (onSidebarClick) {
      onSidebarClick(itemId);
    }

    // Navigate to specific delivery routes
    switch (itemId) {
      case 'dashboard':
        navigate('/delivery/dashboard');
        break;
      case 'assigned-orders':
        navigate('/delivery/assigned-orders');
        break;
      case 'routes':
        navigate('/delivery/routes');
        break;
      case 'delivery-history':
        navigate('/delivery/history');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    // Clear delivery authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <aside className="delivery-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">DeliveryDash</h1>
      </div>
      
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            data-item-id={item.id}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}

        <button
          className="nav-item logout-item"
          data-item-id="logout"
          onClick={() => handleItemClick('logout')}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default DeliverySidebar;