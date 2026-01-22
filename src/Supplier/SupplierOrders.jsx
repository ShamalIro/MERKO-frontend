import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SupplierOrders.css';

const SupplierOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [nonPendingOrders, setNonPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [supplierData, setSupplierData] = useState({});
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchSupplierData();
        fetchSupplierOrders();
    }, []);

    const fetchSupplierData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8090/api/suppliers/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupplierData(response.data);
        } catch (error) {
            console.error('Error fetching supplier data:', error);
        }
    };

    const fetchSupplierOrders = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            
            // Fetch all orders
            const allOrdersResponse = await axios.get('http://localhost:8090/api/suppliers/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch non-pending orders separately
            const nonPendingResponse = await axios.get('http://localhost:8090/api/suppliers/orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const allOrderItems = allOrdersResponse.data || [];
            const pendingItems = allOrderItems.filter(item => item.status === 'PENDING');
            const nonPendingItems = nonPendingResponse.data || [];
            
            setOrders(allOrderItems);
            setPendingOrders(pendingItems);
            setNonPendingOrders(nonPendingItems);
        } catch (error) {
            console.error('Error fetching supplier orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrderItem = async (orderItemId) => {
        if (!window.confirm('Are you sure you want to confirm this order item?')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8090/api/suppliers/orders/items/${orderItemId}/status`, {
                status: 'CONFIRMED'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Order item confirmed successfully!');
            await fetchSupplierOrders();
        } catch (error) {
            console.error('Error confirming order item:', error);
            if (error.response?.data?.message?.includes('Insufficient stock')) {
                alert(`Error: ${error.response.data.message}`);
            } else {
                alert(error.response?.data?.message || 'Failed to confirm order item');
            }
        }
    };

    const handleUpdateStatus = async (orderItemId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this item as ${newStatus.toLowerCase()}?`)) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8090/api/suppliers/orders/items/${orderItemId}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert(`Order item marked as ${newStatus.toLowerCase()} successfully!`);
            await fetchSupplierOrders();
        } catch (error) {
            console.error('Error updating order item status:', error);
            alert(error.response?.data?.message || 'Failed to update order item status');
        }
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'PENDING': { class: 'status-pending', text: 'Pending' },
            'CONFIRMED': { class: 'status-confirmed', text: 'Confirmed' },
            'SHIPPED': { class: 'status-shipped', text: 'Shipped' },
            'DELIVERED': { class: 'status-delivered', text: 'Delivered' },
            'CANCELLED': { class: 'status-cancelled', text: 'Cancelled' },
            'RECEIVED': { class: 'status-received', text: 'Received' }
        };
        
        const config = statusConfig[status] || { class: 'status-pending', text: status };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'S';

    const renderPendingOrderItemRow = (item) => (
        <div key={item.id} className="order-item-row">
            <div className="order-item-info">
                <div className="product-info">
                    <h4>{item.productName || 'Product Not Available'}</h4>
                    <p>SKU: {item.productSku || 'N/A'}</p>
                    <p>Order #: {item.orderNumber || 'N/A'}</p>
                </div>
                <div className="customer-info">
                    <p><strong>Customer:</strong> {item.merchantCompanyName || 'Unknown Merchant'}</p>
                    <p><strong>Order Date:</strong> {formatDate(item.orderDate)}</p>
                </div>
                <div className="quantity-price">
                    <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                    <p><strong>Current Stock:</strong> {item.currentStock || 0}</p>
                    <p><strong>Price:</strong> ${item.priceAtTime ? item.priceAtTime.toFixed(2) : '0.00'} each</p>
                    <p><strong>Total:</strong> ${item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}</p>
                </div>
                <div className="status-section">
                    {getStatusBadge(item.status)}
                </div>
            </div>
            <div className="order-item-actions">
                {item.status === 'PENDING' && (
                    <button 
                        className="confirm-btn"
                        onClick={() => handleConfirmOrderItem(item.id)}
                    >
                        ✅ Confirm
                    </button>
                )}
                {item.status === 'PENDING' && (
                    <button 
                        className="cancel-btn"
                        onClick={() => handleUpdateStatus(item.id, 'CANCELLED')}
                    >
                        ❌ Cancel
                    </button>
                )}
            </div>
        </div>
    );

    const renderNonPendingOrderItemRow = (item) => (
        <div key={item.id} className="order-item-row view-only">
            <div className="order-item-info">
                <div className="product-info">
                    <h4>{item.productName || 'Product Not Available'}</h4>
                    <p>SKU: {item.productSku || 'N/A'}</p>
                    <p>Order #: {item.orderNumber || 'N/A'}</p>
                </div>
                <div className="customer-info">
                    <p><strong>Customer:</strong> {item.merchantCompanyName || 'Unknown Merchant'}</p>
                    <p><strong>Order Date:</strong> {formatDate(item.orderDate)}</p>
                </div>
                <div className="quantity-price">
                    <p><strong>Quantity:</strong> {item.quantity || 0}</p>
                    <p><strong>Current Stock:</strong> {item.currentStock || 0}</p>
                    <p><strong>Price:</strong> ${item.priceAtTime ? item.priceAtTime.toFixed(2) : '0.00'} each</p>
                    <p><strong>Total:</strong> ${item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}</p>
                </div>
                <div className="status-section">
                    {getStatusBadge(item.status)}
                </div>
            </div>
            <div className="order-item-actions">
                <span className="view-only-text">View Only</span>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="supplier-orders-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="supplier-dashboard-luxury">
            {/* Background Elements */}
            <div className="luxury-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar-luxury">
                <div className="sidebar-header-luxury">
                    <div className="supplier-logo-luxury">
                        <div className="logo-icon-luxury">
                            <div className="logo-3d-container">
                                <div className="placeholder-3d-logo">📦</div>
                            </div>
                        </div>
                        <div className="logo-text-luxury">
                            <div className="portal-name-luxury">Supplier Portal</div>
                            <div className="company-name-luxury">{supplierData.name || 'Supplier'}</div>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav-luxury">
                    {[
                        { key: 'dashboard', icon: '📊', label: 'Dashboard', path: '/supplier/dashboard' },
                        { key: 'products', icon: '📦', label: 'Products', path: '/supplier/products' },
                        { key: 'inventory', icon: '📋', label: 'Inventory', path: '/supplier/inventory' },
                        { key: 'orders', icon: '🛒', label: 'Orders', path: '/supplier/orders' },
                        { key: 'settings', icon: '⚙️', label: 'Settings', path: '/supplier/settings' },
                        { key: 'help', icon: '❓', label: 'Help Center', path: '/supplier/help' }
                    ].map((item) => (
                        <div 
                            key={item.key} 
                            className={`nav-item-luxury ${item.key === 'orders' ? 'active' : ''}`} 
                            onClick={() => handleNavigation(item.path)}
                        >
                            <span className="nav-icon-luxury">{item.icon}</span>
                            <span className="nav-text-luxury">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer-luxury">
                    <button 
                        className="switch-role-btn-luxury" 
                        onClick={() => navigate('/')}
                    >
                        <span className="switch-icon-luxury">🔄</span>
                        Switch Role
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content-luxury">
                <header className="header-luxury">
                    <div className="header-left-luxury">
                        <div className="welcome-section-luxury">
                            <h1>Order Management</h1>
                            <p className="current-date-luxury">Manage your incoming orders</p>
                        </div>
                    </div>
                    <div className="header-right-luxury">
                        <button className="notification-btn-luxury">
                            <span className="notification-icon">🔔</span>
                            <span className="notification-badge-luxury">3</span>
                        </button>
                        <div className="user-profile-luxury">
                            <div className="profile-avatar-luxury">{getInitials(supplierData.name)}</div>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content-luxury">
                    <div className="page-header-luxury">
                        <h2>Orders</h2>
                        <div className="orders-stats">
                            <div className="stat-badge pending-badge">
                                <span className="stat-count">{pendingOrders.length}</span>
                                <span className="stat-label">Pending Orders</span>
                            </div>
                            <div className="stat-badge total-badge">
                                <span className="stat-count">{nonPendingOrders.length}</span>
                                <span className="stat-label">Confirmed Orders</span>
                            </div>
                        </div>
                    </div>

                    <div className="orders-tabs">
                        <button 
                            className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending Orders ({pendingOrders.length})
                        </button>
                        <button 
                            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Orders ({nonPendingOrders.length})
                        </button>
                    </div>

                    <div className="orders-list-section">
                        {activeTab === 'pending' ? (
                            <div className="pending-orders">
                                <h3>Pending Orders Requiring Confirmation</h3>
                                {pendingOrders.length === 0 ? (
                                    <div className="no-orders">
                                        <div className="no-orders-icon">✅</div>
                                        <h4>No pending orders</h4>
                                        <p>All orders have been confirmed. Check back later for new orders.</p>
                                    </div>
                                ) : (
                                    <div className="orders-grid">
                                        {pendingOrders.map(renderPendingOrderItemRow)}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="all-orders">
                                <h3>All Confirmed Orders</h3>
                                {nonPendingOrders.length === 0 ? (
                                    <div className="no-orders">
                                        <div className="no-orders-icon">📦</div>
                                        <h4>No confirmed orders yet</h4>
                                        <p>Confirmed orders will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="orders-grid">
                                        {nonPendingOrders.map(renderNonPendingOrderItemRow)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierOrders;