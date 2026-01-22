import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './OrderDetails.css';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [merchantData, setMerchantData] = useState({});
    const [editing, setEditing] = useState(false);
    const [editedOrderItems, setEditedOrderItems] = useState([]);

    useEffect(() => {
        fetchMerchantData();
        fetchOrderDetails();
    }, [orderId]);

    const fetchMerchantData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8081/api/merchants/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchantData(response.data);
        } catch (error) {
            console.error('Error fetching merchant data:', error);
        }
    };

    const fetchOrderDetails = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8081/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Order details response:', response.data);
            if (response.data.orderItems) {
                console.log('Order items with status:', response.data.orderItems);
            }
            setOrder(response.data);
            setEditedOrderItems(response.data.orderItems || []);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSidebarNavigation = (item) => {
        switch (item) {
            case 'dashboard': navigate('/merchant/dashboard'); break;
            case 'suppliers': navigate('/merchant/suppliers'); break;
            case 'products': navigate('/merchant/products'); break;
            case 'cart': navigate('/merchant/cart'); break;
            case 'orders': navigate('/merchant/orders'); break;
            case 'inquiries': navigate('/merchant/inquiries'); break;
            case 'settings': navigate('/merchant/settings'); break;
            case 'help': navigate('/merchant/help'); break;
            default: break;
        }
    };

    const handleRoleSwitch = () => navigate('/');

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditedOrderItems(order.orderItems || []);
    };

    const handleItemQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return; // Prevent quantities less than 1
        
        setEditedOrderItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: parseInt(newQuantity) } : item
            )
        );
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        try {
            // Update each order item quantity individually
            for (const item of editedOrderItems) {
                await axios.put(`http://localhost:8081/api/orders/${orderId}/items/${item.id}/quantity`, {
                    quantity: item.quantity
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            // Refresh order details to get updated data
            await fetchOrderDetails();
            setEditing(false);
            alert('Order quantities updated successfully!');
        } catch (error) {
            console.error('Error updating order quantities:', error);
            alert('Failed to update order quantities');
        }
    };

    const handleCancelItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to cancel and delete this order item?')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:8081/api/orders/${orderId}/items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Order item cancelled and deleted successfully!');
            await fetchOrderDetails(); // Refresh data
        } catch (error) {
            console.error('Error cancelling order item:', error);
            alert(error.response?.data?.message || 'Failed to cancel order item');
        }
    };

    const handleReceiveItem = async (itemId) => {
        if (!window.confirm('Mark this item as received?')) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8081/api/orders/${orderId}/items/${itemId}/status`, {
                status: 'RECEIVED'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert('Item marked as received!');
            await fetchOrderDetails(); // Refresh data
        } catch (error) {
            console.error('Error marking item as received:', error);
            alert(error.response?.data?.message || 'Failed to update item status');
        }
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

    // Check if any item is pending (to show edit button)
    const hasPendingItems = () => {
        return order && order.orderItems && order.orderItems.some(item => item.status === 'PENDING');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JM';

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details-page">
                <div className="error-container">
                    <h2>Order not found</h2>
                    <button onClick={() => navigate('/merchant/orders')}>Back to Orders</button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            {/* Sidebar */}
            <div className="order-details-sidebar">
                <div className="sidebar-header">
                    <div className="merchant-portal">
                        <h2>Merchant Portal</h2>
                        <p>{merchantData.companyName}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {[
                        { key: 'dashboard', icon: '📊', label: 'Dashboard' },
                        { key: 'suppliers', icon: '🏢', label: 'Suppliers' },
                        { key: 'products', icon: '📦', label: 'Products' },
                        { key: 'cart', icon: '🛒', label: 'Cart' },
                        { key: 'orders', icon: '📋', label: 'Orders' },
                        { key: 'inquiries', icon: '💬', label: 'Inquiries' },
                        { key: 'settings', icon: '⚙️', label: 'Settings' },
                        { key: 'help', icon: '❓', label: 'Help Center' }
                    ].map((item) => (
                        <div 
                            key={item.key} 
                            className={`nav-item ${item.key === 'orders' ? 'active' : ''}`} 
                            onClick={() => handleSidebarNavigation(item.key)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-text">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="role-switch" onClick={handleRoleSwitch}>
                        <span className="switch-icon">🔄</span>
                        <span className="switch-text">Switch Role</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="order-details-main">
                {/* Header */}
                <div className="order-details-header">
                    <div className="header-left">
                        <button className="back-button" onClick={() => navigate('/merchant/orders')}>
                            ← Back to Orders
                        </button>
                        <div className="welcome-section">
                            <h1>Order Details</h1>
                            <p>Order #{order.orderNumber}</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="notification-bell">
                            <span>🔔</span>
                            <span className="notification-count">3</span>
                        </div>
                        <div className="user-profile">
                            <div className="user-avatar">{getInitials(merchantData.name)}</div>
                        </div>
                    </div>
                </div>

                {/* Order Details Content */}
                <div className="order-details-content">
                    {/* Order Header with Edit Button */}
                    <div className="order-header">
                        <div className="order-info">
                            <h2>Order #{order.orderNumber}</h2>
                            <p>Placed on {formatDate(order.orderDate)}</p>
                            
                            {/* Global Edit Button - Only show if there are pending items */}
                            {hasPendingItems() && !editing && (
                                <div className="global-edit-section">
                                    <button className="edit-btn" onClick={handleEdit}>
                                        ✏️ Edit Quantities
                                    </button>
                                </div>
                            )}
                            
                            {/* Edit Mode Actions */}
                            {editing && (
                                <div className="global-edit-actions">
                                    <button className="save-btn" onClick={handleSave}>
                                        💾 Save All Changes
                                    </button>
                                    <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                                        ❌ Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary-section">
                        <h3>Order Summary</h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span>Subtotal:</span>
                                <span>${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="summary-item">
                                <span>Tax:</span>
                                <span>${order.taxAmount ? order.taxAmount.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="summary-item">
                                <span>Shipping:</span>
                                <span>${order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'}</span>
                            </div>
                            <div className="summary-item total">
                                <span>Total:</span>
                                <span>${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="details-layout">
                        {/* Left Column - Shipping & Payment */}
                        <div className="details-column">
                            {/* Shipping Information */}
                            <div className="info-section">
                                <h3>Shipping Information</h3>
                                <div className="info-content">
                                    <p><strong>Name:</strong> {order.shippingFirstName} {order.shippingLastName}</p>
                                    <p><strong>Company:</strong> {order.shippingCompanyName}</p>
                                    <p><strong>Address:</strong> {order.shippingAddress}</p>
                                    {order.shippingApartment && (
                                        <p><strong>Apt/Suite:</strong> {order.shippingApartment}</p>
                                    )}
                                    <p><strong>City:</strong> {order.shippingCity}</p>
                                    <p><strong>State:</strong> {order.shippingState}</p>
                                    <p><strong>ZIP Code:</strong> {order.shippingZipCode}</p>
                                    <p><strong>Phone:</strong> {order.shippingPhone}</p>
                                    <p><strong>Method:</strong> {order.shippingMethod === 'EXPRESS' ? 'Express Shipping' : 'Standard Shipping'}</p>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="info-section">
                                <h3>Payment Information</h3>
                                <div className="info-content">
                                    <p><strong>Method:</strong> {order.paymentMethod}</p>
                                    {order.paymentMethod === 'CREDIT_CARD' && (
                                        <>
                                            <p><strong>Card:</strong> **** **** **** {order.cardLastFour}</p>
                                            <p><strong>Cardholder:</strong> {order.cardHolderName}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Order Items with Individual Actions */}
                        <div className="details-column">
                            <div className="info-section">
                                <h3>Order Items ({order.orderItems ? order.orderItems.length : 0})</h3>
                                <div className="order-items-list">
                                    {order.orderItems && order.orderItems.map((item, index) => {
                                        const isPending = item.status === 'PENDING';
                                        const isDelivered = item.status === 'DELIVERED';
                                        const canCancel = isPending;
                                        const canReceive = isDelivered;

                                        return (
                                            <div key={item.id} className="order-item">
                                                <div className="item-info">
                                                    <h4>{item.productName || 'Product Not Available'}</h4>
                                                    <p>SKU: {item.productSku || 'N/A'}</p>
                                                    
                                                    <div className="quantity-section">
                                                        <strong>Quantity: </strong>
                                                        {editing && isPending ? (
                                                            <div className="quantity-controls">
                                                                <button 
                                                                    onClick={() => handleItemQuantityChange(item.id, (editedOrderItems[index]?.quantity || item.quantity) - 1)}
                                                                    disabled={(editedOrderItems[index]?.quantity || item.quantity) <= 1}
                                                                >
                                                                    -
                                                                </button>
                                                                <input 
                                                                    type="number" 
                                                                    value={editedOrderItems[index]?.quantity || item.quantity}
                                                                    onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                                                    min="1"
                                                                />
                                                                <button 
                                                                    onClick={() => handleItemQuantityChange(item.id, (editedOrderItems[index]?.quantity || item.quantity) + 1)}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span>{item.quantity}</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="item-status-section">
                                                        <strong>Status: </strong>
                                                        {getStatusBadge(item.status)}
                                                    </div>

                                                    {/* Individual Item Actions */}
                                                    <div className="item-actions">
                                                        {canCancel && (
                                                            <button 
                                                                className="cancel-item-btn"
                                                                onClick={() => handleCancelItem(item.id)}
                                                            >
                                                                🗑️ Cancel Item
                                                            </button>
                                                        )}
                                                        
                                                        {canReceive && (
                                                            <button 
                                                                className="receive-item-btn"
                                                                onClick={() => handleReceiveItem(item.id)}
                                                            >
                                                                ✅ Mark as Received
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="item-price">
                                                    <span>${item.priceAtTime ? item.priceAtTime.toFixed(2) : '0.00'} each</span>
                                                    <strong>${item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}</strong>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;