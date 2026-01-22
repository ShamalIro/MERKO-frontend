// API Configuration for MERKO Frontend
export const API_BASE_URL = 'http://localhost:8090';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  USER_LOGIN: `${API_BASE_URL}/api/auth/login`,
  
  // Admin
  ADMIN_TEST: `${API_BASE_URL}/api/admin/test`,
  
  // Users
  USERS_ALL: `${API_BASE_URL}/api/users/all`,
  USERS_PENDING: `${API_BASE_URL}/api/users/pending`,
  
  // Delivery
  DELIVERY_ENTRIES: `${API_BASE_URL}/api/delivery/entries`,
  DELIVERY_TEST: `${API_BASE_URL}/api/delivery/test`,
  DELIVERY_ORDERS: `${API_BASE_URL}/api/delivery/orders`,
  
  // Suppliers
  SUPPLIERS_ALL: `${API_BASE_URL}/api/suppliers`,
  SUPPLIERS_REGISTER: `${API_BASE_URL}/api/suppliers/register`,
  
  // Merchants
  MERCHANTS_ALL: `${API_BASE_URL}/api/merchants/all`,
  MERCHANTS_REGISTER: `${API_BASE_URL}/api/merchants/register`,
  
  // Products
  PRODUCTS_ALL: `${API_BASE_URL}/api/products`,
  
  // Orders
  ORDERS_ALL: `${API_BASE_URL}/api/orders`,
};

// HTTP Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// API Helper Functions
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_HEADERS,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, error: error.message };
  }
};

export default API_ENDPOINTS;