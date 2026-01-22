import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboards/AdminSidebar.css';

const MerchantSidebar = ({ activeTab, onSidebarClick }) => {
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'orders', label: 'Orders', icon: '🛒' },
    { id: 'suppliers', label: 'Suppliers', icon: '🏭' },
    { id: 'cart', label: 'Cart', icon: '🛍️' }
  ];

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      handleLogout();
      return;
    }

    if (onSidebarClick) {
      onSidebarClick(itemId);
    }

    // Navigate to specific merchant routes
    switch (itemId) {
      case 'dashboard':
        navigate('/merchant/dashboard');
        break;
      case 'products':
        navigate('/merchant/products');
        break;
      case 'orders':
        navigate('/merchant/orders');
        break;
      case 'suppliers':
        navigate('/merchant/suppliers');
        break;
      case 'cart':
        navigate('/merchant/cart');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    // Clear merchant authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Navigate to login page
    navigate('/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">MerchantHub</h1>
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

export default MerchantSidebar;
