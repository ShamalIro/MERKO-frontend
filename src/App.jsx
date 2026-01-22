import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './Auth/SignUp'
import MerchantSignUp from './Auth/MerchantSignUp'
import SupplierSignUp from './Auth/SupplierSignUp'
import Login from './Auth/Login'
import ForgotPassword from './Auth/ForgotPassword'
import AdminDashboard from './Dashboards/AdminDashboard'
import UserManagement from './Dashboards/UserManagement'
import Approvals from './Dashboards/Approvals'
import InquiryCenter from './Dashboards/InquiryCenter'

import AdminSettings from './Dashboards/AdminSettings'
import SupplierDashboard from './Supplier/SupplierDashboard'
import Products from './Supplier/Products'
import AddProduct from './Supplier/AddProduct'
import ImportProducts from './Supplier/ImportProducts'
import EditProduct from './Supplier/EditProduct'
import SupplierOrders from './Supplier/SupplierOrders'
import Inventory from './Supplier/Inventory'
import ProductView from './Supplier/ProductView'
import MerchantDashboard from './Merchant/MerchantDashboard'
import MerchantProducts from './Merchant/Products'
import Suppliers from './Merchant/Suppliers'
import Cart from './Merchant/Cart'
import ProductDetails from './Merchant/ProductDetails'
import Checkout from './Merchant/Checkout'
import AllOrders from './Merchant/AllOrders'
import OrderDetails from './Merchant/OrderDetails'
import DeliveryDashboard from './Delivery/DeliveryDashboard'
import AssignedOrders from './Delivery/AssignedOrders'
import DeliveryHistory from './Delivery/DeliveryHistory'
import DeliveryRoutes from './Delivery/Routes'
import SimpleDeliveryConfirmation from './Delivery/SimpleDeliveryConfirmation'

import './App.css'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="App">
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/merchant" element={<MerchantSignUp />} />
          <Route path="/signup/supplier" element={<SupplierSignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/approvals" element={<Approvals />} />
          <Route path="/admin/inquiry-center" element={<InquiryCenter />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Supplier routes */}
          <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
          <Route path="/supplier/products" element={<Products />} />
          <Route path="/supplier/add-product" element={<AddProduct />} />
          <Route path="/supplier/import-products" element={<ImportProducts />} />
          <Route path="/supplier/edit-product/:productId" element={<EditProduct />} />
          <Route path="/supplier/orders" element={<SupplierOrders />} />
          <Route path="/supplier/inventory" element={<Inventory />} />
          <Route path="/supplier/product/:productId" element={<ProductView />} />

          {/* Merchant routes ✅ */}
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/products" element={<MerchantProducts />} />
          <Route path="/merchant/suppliers" element={<Suppliers />} />
          <Route path="/merchant/cart" element={<Cart />} />
          <Route path="/merchant/products/:id" element={<ProductDetails />} />
          <Route path="/merchant/checkout" element={<Checkout />} />
          <Route path="/merchant/orders" element={<AllOrders />} />
          <Route path="/merchant/orders/:orderId" element={<OrderDetails />} />

          {/* Delivery routes */}
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          <Route path="/delivery/assigned-orders" element={<AssignedOrders />} />
          <Route path="/delivery/history" element={<DeliveryHistory />} />
          <Route path="/delivery/routes" element={<DeliveryRoutes />} />
          <Route path="/delivery/confirmation" element={<SimpleDeliveryConfirmation />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
