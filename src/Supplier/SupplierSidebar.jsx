import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboards/AdminSidebar.css';

const SupplierSidebar = ({ activeTab, onSidebarClick }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'inventory', label: 'Inventory', icon: '📋' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'help', label: 'Help Center', icon: '❓' }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (onSidebarClick) {
      onSidebarClick(itemId);
    }

    // Navigate to specific supplier routes
    switch (itemId) {
      case 'dashboard':
        navigate('/supplier/dashboard');
        break;
      case 'products':
        navigate('/supplier/products');
        break;
      case 'inventory':
        navigate('/supplier/inventory');
        break;
      case 'orders':
        navigate('/supplier/orders');
        break;
      case 'settings':
        navigate('/supplier/settings');
        break;
      case 'help':
        navigate('/supplier/help');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    // Clear supplier authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('merko_token');
    localStorage.removeItem('merko_user');
    localStorage.removeItem('merko_user_type');
    localStorage.removeItem('merko_user_role');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Supplier Portal</h1>
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

export default SupplierSidebar;
