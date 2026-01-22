# MERKO - E-Commerce Platform

A comprehensive multi-role e-commerce platform built with **React** and **Vite**, enabling seamless interactions between merchants, suppliers, and delivery personnel.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [API Integration](#api-integration)
- [Development](#development)

## 🎯 Overview

MERKO is a modern e-commerce solution designed to connect:
- **Merchants** - Manage products and orders
- **Suppliers** - Supply and manage inventory
- **Administrators** - Oversee platform operations and approvals
- **Delivery Personnel** - Handle order fulfillment and tracking

## ✨ Features

### Authentication & Authorization
- User registration (Merchant, Supplier, Admin)
- Secure login and password recovery
- Role-based access control
- Session management

### Admin Dashboard
- User management and role assignment
- Order approvals workflow
- Inquiry center for customer support
- Platform settings and configuration
- User activity monitoring

### Merchant Features
- Product browsing from suppliers
- Shopping cart functionality
- Checkout process
- Order placement and tracking
- Order history and details
- Dashboard with key metrics

### Supplier Features
- Product catalog management (add, edit, delete)
- Bulk product import
- Real-time inventory management
- Product visibility control
- Supplier analytics and dashboard

### Delivery System
- Automated order assignment
- Delivery confirmation workflow
- Delivery history tracking
- Route optimization
- Real-time delivery status updates
- Delivery personnel dashboard

## 🛠 Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS3
- **Package Manager**: npm/yarn
- **API Communication**: Axios
- **Routing**: React Router

## 📁 Project Structure

```
src/
├── Auth/                    # Authentication pages
│   ├── Login.jsx
│   ├── SignUp.jsx
│   ├── MerchantSignUp.jsx
│   ├── SupplierSignUp.jsx
│   └── ForgotPassword.jsx
├── components/              # Reusable UI components
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── Features.jsx
│   └── Testimonials.jsx
├── Dashboards/              # Admin dashboard modules
│   ├── AdminDashboard.jsx
│   ├── UserManagement.jsx
│   ├── Approvals.jsx
│   └── InquiryCenter.jsx
├── Merchant/                # Merchant module
│   ├── MerchantDashboard.jsx
│   ├── Products.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   └── Orders.jsx
├── Supplier/                # Supplier module
│   ├── Products.jsx
│   ├── AddProduct.jsx
│   ├── EditProduct.jsx
│   ├── ImportProducts.jsx
│   └── Inventory.jsx
├── Delivery/                # Delivery module
│   ├── DeliveryDashboard.jsx
│   ├── AssignedOrders.jsx
│   ├── DeliveryConfirmation.jsx
│   └── DeliveryHistory.jsx
├── config/                  # Configuration files
│   └── api.js              # API endpoints configuration
├── utils/                   # Utility functions
│   └── apiTest.js
├── App.jsx                 # Main application component
└── main.jsx               # Application entry point
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)



## 👥 User Roles

### Admin
- Access: `/admin/*`
- Responsibilities: Platform management, user approvals, settings
- Dashboard: AdminDashboard component

### Merchant
- Access: `/merchant/*`
- Responsibilities: Browse products, manage cart, place orders
- Dashboard: MerchantDashboard component

### Supplier
- Access: `/supplier/*`
- Responsibilities: Manage products, inventory, pricing
- Dashboard: SupplierDashboard component

### Delivery Personnel
- Access: `/delivery/*`
- Responsibilities: Accept orders, confirm delivery, track history
- Dashboard: DeliveryDashboard component

## 🔌 API Integration

API endpoints are centralized in `src/config/api.js`. The application communicates with a backend server for:

- User authentication
- Product data
- Order management
- User management
- Delivery tracking

**Example API call**:
```javascript
import api from '../config/api.js';

// GET request
api.get('/products').then(response => {
  console.log(response.data);
});

// POST request
api.post('/orders', orderData).then(response => {
  console.log(response.data);
});
```

## 👨‍💻 Development

### Code Organization
- Each module (Auth, Merchant, Supplier, Delivery) is self-contained
- CSS files are co-located with their JSX components
- Reusable components are in the `components/` directory
- Configuration and utilities are centralized

### Best Practices
- Use functional components with React Hooks
- Keep components focused and single-responsibility
- Use semantic HTML and CSS for styling
- Implement proper error handling in API calls
- Maintain consistent naming conventions

### ESLint Configuration
- Configuration file: `eslint.config.js`
- Run linter: `npm run lint`

## 📝 Notes

- The project uses Vite for fast development and optimized builds
- Multiple route configurations are maintained for different delivery scenarios (Routes.jsx, Routes_Clean.jsx, SimpleRoutes.jsx)
- The project structure suggests ongoing development and optimization

## 📧 Contact & Support

For issues, feature requests, or contributions, please open an issue on the GitHub repository.

---

