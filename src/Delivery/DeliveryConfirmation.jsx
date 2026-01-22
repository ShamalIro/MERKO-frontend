import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeliveryConfirmation.css';

const DeliveryConfirmation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('delivery-confirmation');
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    username: 'Loading...',
    role: 'Loading...'
  });
  
  const [orderDetails, setOrderDetails] = useState({
    orderId: 'ORD-9385-27XC',
    merchant: 'Fresh Eats Market',
    address: '789 Howard St, San Francisco',
    items: 4,
    orderContents: [
      { name: 'Fresh Produce Box', quantity: 2 },
      { name: 'Artisan Bread', quantity: 1 },
      { name: 'Organic Milk', quantity: 1 }
    ]
  });

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'assigned-orders', label: 'Assigned Orders', icon: '📦' },
    { id: 'routes', label: 'Routes', icon: '🗺️' },
    { id: 'delivery-confirmation', label: 'Delivery Inquiry', icon: '✅' },
    { id: 'delivery-history', label: 'Delivery History', icon: '📋' }
  ];

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Check both userInfo and merko_user keys
        let userInfo = localStorage.getItem('userInfo');
        let merkoUser = localStorage.getItem('merko_user');
        let merkoUserRole = localStorage.getItem('merko_user_role');
        
        const actualUserData = merkoUser || userInfo;
        
        if (actualUserData) {
          const parsedUserInfo = JSON.parse(actualUserData);
          
          // Add role from separate storage if available
          if (merkoUserRole && !parsedUserInfo.role) {
            parsedUserInfo.role = merkoUserRole;
          }
          const userId = parsedUserInfo.userId || parsedUserInfo.id || parsedUserInfo.user_id;
          
          if (userId) {
            const response = await fetch(`http://localhost:8090/api/users/${userId}`);
            if (response.ok) {
              const userData = await response.json();
              setCurrentUser({
                username: userData.first_name || userData.firstName || userData.username || userData.name || 'Unknown User',
                role: userData.role || 'User'
              });
            } else {
              setCurrentUser({
                username: parsedUserInfo.first_name || parsedUserInfo.firstName || parsedUserInfo.username || parsedUserInfo.name || 'Unknown User',
                role: parsedUserInfo.role || merkoUserRole || 'User'
              });
            }
          } else {
            setCurrentUser({
              username: parsedUserInfo.first_name || parsedUserInfo.firstName || parsedUserInfo.username || parsedUserInfo.name || 'Unknown User',
              role: parsedUserInfo.role || merkoUserRole || 'User'
            });
          }
        } else {
          setCurrentUser({
            username: 'Guest User',
            role: 'Guest'
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setCurrentUser({
          username: 'Unknown User',
          role: 'User'
        });
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSidebarClick = (itemId) => {
    setActiveTab(itemId);
    // Navigation logic
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
        // Stay on current page
        break;
      case 'delivery-history':
        navigate('/delivery/history');
        break;
      default:
        break;
    }
  };

  const handleScanQR = () => {
    setIsScanning(true);
    // Simulate QR scanning process
    setTimeout(() => {
      setIsScanning(false);
      // Simulate successful scan
      alert('QR Code scanned successfully! Delivery confirmed.');
    }, 3000);
  };

  const formatOrderId = (orderId) => {
    return orderId.replace(/-/g, '-');
  };

  return (
    <div className="delivery-confirmation-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="logo">DeliveryDash</h1>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-name">{currentUser.username}</span>
              <span className="user-role">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleSidebarClick(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-header">
            <h2>Delivery Inquiry</h2>
          </div>

          <div className="confirmation-content">
            {/* Order Information Cards */}
            <div className="order-info-grid">
              <div className="info-card order-id-card">
                <div className="card-icon">📋</div>
                <div className="card-content">
                  <div className="card-label">Order ID</div>
                  <div className="card-value">{formatOrderId(orderDetails.orderId)}</div>
                </div>
              </div>

              <div className="info-card merchant-card">
                <div className="card-icon">🏪</div>
                <div className="card-content">
                  <div className="card-label">Merchant</div>
                  <div className="card-value">{orderDetails.merchant}</div>
                </div>
              </div>

              <div className="info-card address-card">
                <div className="card-icon">📍</div>
                <div className="card-content">
                  <div className="card-label">Address</div>
                  <div className="card-value">{orderDetails.address}</div>
                </div>
              </div>

              <div className="info-card items-card">
                <div className="card-icon">📦</div>
                <div className="card-content">
                  <div className="card-label">Items</div>
                  <div className="card-value">{orderDetails.items} items</div>
                </div>
              </div>
            </div>

            <div className="confirmation-main">
              {/* Order Contents */}
              <div className="order-contents-section">
                <h3>Order Contents</h3>
                <div className="contents-list">
                  {orderDetails.orderContents.map((item, index) => (
                    <div key={index} className="content-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Scanner */}
              <div className="qr-scanner-section">
                <div className="scanner-container">
                  <div className={`qr-scanner ${isScanning ? 'scanning' : ''}`}>
                    <div className="scanner-frame">
                      <div className="corner-frame top-left"></div>
                      <div className="corner-frame top-right"></div>
                      <div className="corner-frame bottom-left"></div>
                      <div className="corner-frame bottom-right"></div>
                      
                      {isScanning && (
                        <div className="scanning-line"></div>
                      )}
                      
                      <div className="scanner-target">
                        <div className="target-icon">📷</div>
                      </div>
                    </div>
                    <div className="scanner-instruction">
                      Position QR code in frame to scan
                    </div>
                  </div>
                </div>

                <button 
                  className={`scan-button ${isScanning ? 'scanning' : ''}`}
                  onClick={handleScanQR}
                  disabled={isScanning}
                >
                  <span className="scan-icon">📱</span>
                  {isScanning ? 'Scanning...' : 'Scan QR to Confirm Delivery'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeliveryConfirmation;
