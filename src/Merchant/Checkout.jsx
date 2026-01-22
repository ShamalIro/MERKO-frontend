import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [cartData, setCartData] = useState(null);
    const [merchantData, setMerchantData] = useState({});
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Form data
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        zipCode: '',
        phoneNumber: ''
    });

    const [paymentInfo, setPaymentInfo] = useState({
        method: 'CREDIT_CARD',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        cardHolderName: '',
        purchaseOrderNumber: ''
    });

    const [shippingMethod, setShippingMethod] = useState('STANDARD');

    useEffect(() => {
        fetchCartData();
        fetchMerchantData();
    }, []);

    const fetchCartData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8081/api/cart/my-cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCartData(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMerchantData = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get('http://localhost:8081/api/merchants/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMerchantData(response.data);
            
            // Pre-fill shipping info with merchant data (read-only)
            setShippingInfo(prev => ({
                ...prev,
                firstName: response.data.name?.split(' ')[0] || '',
                lastName: response.data.name?.split(' ').slice(1).join(' ') || '',
                companyName: response.data.companyName || ''
            }));
        } catch (error) {
            console.error('Error fetching merchant data:', error);
        }
    };

    // Validation functions
    const validateShipping = () => {
        const newErrors = {};
        
        // City validation (no numbers)
        if (shippingInfo.city && /\d/.test(shippingInfo.city)) {
            newErrors.city = 'City cannot contain numbers';
        }
        
        // State validation (no numbers)
        if (shippingInfo.state && /\d/.test(shippingInfo.state)) {
            newErrors.state = 'State cannot contain numbers';
        }
        
        // Postal Code validation (exactly 5 digits)
        if (!/^\d{5}$/.test(shippingInfo.zipCode)) {
            newErrors.zipCode = 'Postal Code must be exactly 5 digits';
        }
        
        // Phone validation (10 digits starting with 0)
        if (!/^0\d{9}$/.test(shippingInfo.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be 10 digits starting with 0';
        }
        
        // Address validation
        if (!shippingInfo.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};
        
        if (paymentInfo.method === 'CREDIT_CARD') {
            // Card number validation (13 digits)
            if (!/^\d{13}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Card number must be 13 digits';
            }
            
            // CVV validation (3 digits)
            if (!/^\d{3}$/.test(paymentInfo.cvv)) {
                newErrors.cvv = 'CVV must be 3 digits';
            }
            
            // Expiration date validation (MM/YY format)
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expirationDate)) {
                newErrors.expirationDate = 'Expiration date must be in MM/YY format';
            }
            
            // Card holder name validation (no numbers)
            if (paymentInfo.cardHolderName && /\d/.test(paymentInfo.cardHolderName)) {
                newErrors.cardHolderName = 'Card holder name cannot contain numbers';
            }
            
            // Required fields
            if (!paymentInfo.cardHolderName.trim()) {
                newErrors.cardHolderName = 'Card holder name is required';
            }
        }
        
        if (paymentInfo.method === 'PURCHASE_ORDER' && !paymentInfo.purchaseOrderNumber.trim()) {
            newErrors.purchaseOrderNumber = 'Purchase order number is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        if (validateShipping()) {
            setCurrentStep(2);
        }
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        if (validatePayment()) {
            setCurrentStep(3);
        }
    };

    const handlePlaceOrder = async () => {
        try {
            const token = localStorage.getItem('token');
            const checkoutRequest = {
                shippingInfo,
                paymentInfo,
                shippingMethod
            };

            const response = await axios.post('http://localhost:8081/api/checkout/process', 
                checkoutRequest, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert('Order placed successfully!');
            navigate('/merchant/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            alert(error.response?.data?.message || 'Failed to place order');
        }
    };

    const calculateTotals = () => {
        if (!cartData) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
        
        const subtotal = cartData.subtotal || 0;
        const tax = subtotal * 0.08;
        const shipping = shippingMethod === 'EXPRESS' ? 25 : 0;
        const total = subtotal + tax + shipping;
        
        return { subtotal, tax, shipping, total };
    };

    // Format card number with spaces
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        
        for (let i = 0; i < match.length; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        return parts.length ? parts.join(' ') : value;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        setPaymentInfo({...paymentInfo, cardNumber: formatted});
    };

    const totals = calculateTotals();

    if (loading) {
        return <div className="loading">Loading checkout...</div>;
    }

    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="empty-cart-message">
                    <h2>Your cart is empty</h2>
                    <button onClick={() => navigate('/merchant/products')}>Browse Products</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Header */}
            <div className="checkout-header">
                <button className="back-button" onClick={() => navigate('/merchant/cart')}>
                    ← Back to Cart
                </button>
                <h1>Checkout</h1>
            </div>

            {/* Progress Steps */}
            <div className="checkout-progress">
                <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                    <div className="step-number">1</div>
                    <span>Shipping</span>
                </div>
                <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <span>Payment</span>
                </div>
                <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <span>Confirmation</span>
                </div>
            </div>

            <div className="checkout-content">
                {/* Left Column - Forms */}
                <div className="checkout-forms">
                    {/* Step 1: Shipping Information */}
                    {currentStep === 1 && (
                        <form onSubmit={handleShippingSubmit} className="checkout-form">
                            <h2>Shipping Information</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.firstName}
                                        readOnly
                                        className="read-only-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.lastName}
                                        readOnly
                                        className="read-only-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Company Name</label>
                                <input 
                                    type="text" 
                                    value={shippingInfo.companyName}
                                    readOnly
                                    className="read-only-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input 
                                    type="text" 
                                    value={shippingInfo.address}
                                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                    required 
                                />
                                {errors.address && <span className="error-message">{errors.address}</span>}
                            </div>

                            <div className="form-group">
                                <label>Apartment, suite, etc. (optional)</label>
                                <input 
                                    type="text" 
                                    value={shippingInfo.apartment}
                                    onChange={(e) => setShippingInfo({...shippingInfo, apartment: e.target.value})}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.city}
                                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                        required 
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.state}
                                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                                        required 
                                    />
                                    {errors.state && <span className="error-message">{errors.state}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input 
                                        type="text" 
                                        value={shippingInfo.zipCode}
                                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                                        placeholder="12345"
                                        maxLength="5"
                                        required 
                                    />
                                    {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={shippingInfo.phoneNumber}
                                    onChange={(e) => setShippingInfo({...shippingInfo, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                                    placeholder="0123456789"
                                    maxLength="10"
                                    required 
                                />
                                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
                            </div>

                            <div className="shipping-methods">
                                <h3>Shipping Method</h3>
                                <div className="method-option">
                                    <label>
                                        <input 
                                            type="radio" 
                                            value="STANDARD" 
                                            checked={shippingMethod === 'STANDARD'}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                        />
                                        Standard Shipping
                                        <span>Delivery in 3-5 business days</span>
                                        <span className="shipping-price">Free</span>
                                    </label>
                                </div>
                                <div className="method-option">
                                    <label>
                                        <input 
                                            type="radio" 
                                            value="EXPRESS" 
                                            checked={shippingMethod === 'EXPRESS'}
                                            onChange={(e) => setShippingMethod(e.target.value)}
                                        />
                                        Express Shipping
                                        <span>Delivery in 1-2 business days</span>
                                        <span className="shipping-price">$25.00</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="continue-button">Continue to Payment</button>
                        </form>
                    )}

                    {/* Step 2: Payment Information */}
                    {currentStep === 2 && (
                        <form onSubmit={handlePaymentSubmit} className="checkout-form">
                            <h2>Payment Method</h2>
                            
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input 
                                        type="radio" 
                                        value="CREDIT_CARD" 
                                        checked={paymentInfo.method === 'CREDIT_CARD'}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                                    />
                                    Credit Card
                                </label>
                                
                                <label className="payment-option">
                                    <input 
                                        type="radio" 
                                        value="PURCHASE_ORDER" 
                                        checked={paymentInfo.method === 'PURCHASE_ORDER'}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                                    />
                                    Purchase Order
                                </label>
                                
                                <label className="payment-option">
                                    <input 
                                        type="radio" 
                                        value="NET_30" 
                                        checked={paymentInfo.method === 'NET_30'}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                                    />
                                    Net 30
                                </label>
                            </div>

                            {paymentInfo.method === 'CREDIT_CARD' && (
                                <div className="credit-card-form">
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="1234 5678 9012 3"
                                            value={paymentInfo.cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength="16"
                                            required 
                                        />
                                        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiration Date</label>
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY"
                                                value={paymentInfo.expirationDate}
                                                onChange={(e) => setPaymentInfo({...paymentInfo, expirationDate: e.target.value})}
                                                maxLength="5"
                                                required 
                                            />
                                            {errors.expirationDate && <span className="error-message">{errors.expirationDate}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input 
                                                type="text" 
                                                placeholder="123"
                                                value={paymentInfo.cvv}
                                                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                                maxLength="3"
                                                required 
                                            />
                                            {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Name on Card</label>
                                        <input 
                                            type="text" 
                                            value={paymentInfo.cardHolderName}
                                            onChange={(e) => setPaymentInfo({...paymentInfo, cardHolderName: e.target.value})}
                                            required 
                                        />
                                        {errors.cardHolderName && <span className="error-message">{errors.cardHolderName}</span>}
                                    </div>
                                </div>
                            )}

                            {paymentInfo.method === 'PURCHASE_ORDER' && (
                                <div className="form-group">
                                    <label>Purchase Order Number</label>
                                    <input 
                                        type="text" 
                                        value={paymentInfo.purchaseOrderNumber}
                                        onChange={(e) => setPaymentInfo({...paymentInfo, purchaseOrderNumber: e.target.value})}
                                        required 
                                    />
                                    {errors.purchaseOrderNumber && <span className="error-message">{errors.purchaseOrderNumber}</span>}
                                </div>
                            )}

                            <div className="form-buttons">
                                <button type="button" onClick={() => setCurrentStep(1)} className="back-button">
                                    Back
                                </button>
                                <button type="submit" className="continue-button">
                                    Review Order
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Order Confirmation */}
                    {currentStep === 3 && (
                        <div className="confirmation-form">
                            <h2>Review & Confirm</h2>
                            
                            <div className="review-section">
                                <h3>Shipping Information</h3>
                                <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                                <p>{shippingInfo.companyName}</p>
                                <p>{shippingInfo.address}</p>
                                {shippingInfo.apartment && <p>{shippingInfo.apartment}</p>}
                                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                                <p>{shippingInfo.phoneNumber}</p>
                            </div>

                            <div className="review-section">
                                <h3>Payment Method</h3>
                                <p>{paymentInfo.method === 'CREDIT_CARD' ? `Credit Card ending in ${paymentInfo.cardNumber.slice(-4)}` : paymentInfo.method}</p>
                                {paymentInfo.method === 'CREDIT_CARD' && <p>Cardholder: {paymentInfo.cardHolderName}</p>}
                            </div>

                            <div className="review-section">
                                <h3>Shipping Method</h3>
                                <p>{shippingMethod === 'STANDARD' ? 'Standard Shipping (3-5 business days)' : 'Express Shipping (1-2 business days)'}</p>
                            </div>

                            <div className="form-buttons">
                                <button onClick={() => setCurrentStep(2)} className="back-button">
                                    Back
                                </button>
                                <button onClick={handlePlaceOrder} className="place-order-button">
                                    Place Order
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div className="order-summary-sidebar">
                    <h3>Order Summary</h3>
                    
                    <div className="order-items">
                        {cartData.cartItems.map(item => (
                            <div key={item.id} className="order-item">
                                <div className="item-info">
                                    <span className="item-name">{item.productName}</span>
                                    <span className="item-quantity">x{item.quantity}</span>
                                </div>
                                <span className="item-price">${item.total?.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="order-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>${totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Tax (8%)</span>
                            <span>${totals.tax.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Shipping</span>
                            <span>{totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total</span>
                            <span>${totals.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="secure-checkout">
                        <span>🔒 Secure checkout</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;