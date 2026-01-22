import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AssignedOrders from './AssignedOrders'
import DeliveryHistory from './DeliveryHistory'
import Routes from './Routes'
import SimpleDeliveryConfirmation from './SimpleDeliveryConfirmation'
import DeliveryLayout from './DeliveryLayout'
import './DeliveryDashboard.css'

const DeliveryDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    todaysDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    failedDeliveries: 0,
    assignedRoutes: 0
  })

  const [activeTab, setActiveTab] = useState('home')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deliveryPersonName, setDeliveryPersonName] = useState('Delivery Person')
  const [deliveryEntries, setDeliveryEntries] = useState([])
  const [showOrderSelection, setShowOrderSelection] = useState(false)
  const [availableOrders, setAvailableOrders] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  
  // Search functionality states (for order selection modal)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredOrders, setFilteredOrders] = useState([])
  
  // Delivery entries table filtering states
  const [entriesSearchQuery, setEntriesSearchQuery] = useState('')
  const [entriesStatusFilter, setEntriesStatusFilter] = useState('')
  const [filteredDeliveryEntries, setFilteredDeliveryEntries] = useState([])

  // Removed sidebarItems - now handled by DeliveryLayout component

  // Fetch delivery entries and stats
  const fetchDeliveryEntries = async () => {
    try {
      setLoading(true)
      console.log('Fetching delivery entries...')
      
      // Get logged-in user name from localStorage
      const userObj = localStorage.getItem('merko_user')
      if (userObj) {
        try {
          const parsedUser = JSON.parse(userObj)
          if (parsedUser.firstName) {
            setDeliveryPersonName(parsedUser.firstName)
          }
        } catch (e) {
          console.log('Could not parse user object')
        }
      }
      
      // Fetch delivery entries for stats and display
      const response = await fetch('http://localhost:8090/api/delivery/entries')
      if (response.ok) {
        const data = await response.json()
        console.log('Delivery entries fetched:', data)
        setDeliveryEntries(data || [])
        
        // Calculate stats from entries
        const todayEntries = data || []
        const pending = todayEntries.filter(e => e.status?.toLowerCase() === 'ready for delivery' || e.status?.toLowerCase() === 'out for delivery').length
        const completed = todayEntries.filter(e => e.status?.toLowerCase() === 'delivered').length
        const failed = todayEntries.filter(e => e.status?.toLowerCase() === 'failed delivery' || e.status?.toLowerCase() === 'returned').length
        
        setStats({
          todaysDeliveries: todayEntries.length,
          pendingDeliveries: pending,
          completedDeliveries: completed,
          failedDeliveries: failed,
          assignedRoutes: Math.ceil(todayEntries.length / 5) // Estimate routes
        })
      }
      
      setError(null)
    } catch (err) {
      console.error('Error fetching delivery entries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch delivery stats on mount
  useEffect(() => {
    fetchDeliveryEntries()
  }, [])

  // Removed sidebarItems - now handled by DeliveryLayout component

  // Fetch orders ready for pickup
  const fetchReadyForPickupOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/delivery/orders/ready-for-pickup');
      if (response.ok) {
        const data = await response.json();
        setAvailableOrders(data);
      }
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      alert('Error loading orders. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const handleAddDelivery = () => {
    setSearchQuery(''); // Reset search when opening modal
    fetchReadyForPickupOrders();
    setShowOrderSelection(true);
  };

  // Add order to delivery entries
  const handleSelectOrder = async (order) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/delivery/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order.orderId }),
      });

      if (response.ok) {
        alert(`Order ${order.orderId} added to delivery entries successfully!`);
        setShowOrderSelection(false);
        fetchDeliveryEntries(); // Refresh the delivery entries
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to add order'}`);
      }
    } catch (error) {
      console.error('Error adding order to delivery:', error);
      alert('Error adding order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query === '') {
      setFilteredOrders(availableOrders);
    } else {
      const filtered = availableOrders.filter(order => 
        order.orderId.toString().toLowerCase().includes(query) ||
        order.merchantName.toLowerCase().includes(query) ||
        order.supplierName.toLowerCase().includes(query) ||
        order.deliveryAddress.toLowerCase().includes(query) ||
        order.route.toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
  };

  // Add all filtered results to delivery entries
  const handleAddAllResults = async () => {
    if (filteredOrders.length === 0) {
      alert('No orders to add');
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;
      let errorCount = 0;
      
      for (const order of filteredOrders) {
        try {
          const response = await fetch('http://localhost:8090/api/delivery/entries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: order.orderId }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to add order ${order.orderId}`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error adding order ${order.orderId}:`, error);
        }
      }

      if (successCount > 0) {
        alert(`Successfully added ${successCount} orders to delivery entries${errorCount > 0 ? `. ${errorCount} orders failed.` : '.'}`);
        setShowOrderSelection(false);
        setSearchQuery('');
        fetchDeliveryEntries(); // Refresh the delivery entries
      } else {
        alert('Failed to add any orders. Please try again.');
      }
    } catch (error) {
      console.error('Error adding orders:', error);
      alert('Error adding orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update filtered orders when available orders change
  useEffect(() => {
    setFilteredOrders(availableOrders);
  }, [availableOrders]);

  // Delivery entries filtering functions
  const filterDeliveryEntries = () => {
    let filtered = [...deliveryEntries];
    
    // Apply search query filter
    if (entriesSearchQuery.trim() !== '') {
      const query = entriesSearchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.deliveryId.toString().toLowerCase().includes(query) ||
        entry.orderId.toString().toLowerCase().includes(query) ||
        entry.merchantName.toLowerCase().includes(query) ||
        entry.supplierName.toLowerCase().includes(query) ||
        entry.deliveryAddress.toLowerCase().includes(query) ||
        entry.status.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (entriesStatusFilter !== '') {
      filtered = filtered.filter(entry => 
        entry.status.toLowerCase().replace(/\s+/g, '-') === entriesStatusFilter
      );
    }
    
    setFilteredDeliveryEntries(filtered);
  };

  const handleEntriesSearchChange = (e) => {
    setEntriesSearchQuery(e.target.value);
  };

  const handleEntriesStatusFilterChange = (e) => {
    setEntriesStatusFilter(e.target.value);
  };

  // Update filtered entries when deliveryEntries, search query, or status filter changes
  useEffect(() => {
    filterDeliveryEntries();
  }, [deliveryEntries, entriesSearchQuery, entriesStatusFilter]);

  // PDF Export function
  const exportToPDF = () => {
    try {
      // Create a new window for the PDF content
      const printWindow = window.open('', '_blank');
      
      // Get current date and time
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      
      // Create HTML content for the PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Delivery Entries Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .header p { color: #64748b; margin: 5px 0; }
            .summary { margin-bottom: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; }
            .filters-info { margin-bottom: 20px; padding: 10px; background-color: #e0f2fe; border-radius: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 600; }
            .status-delivered { background-color: #dcfce7; color: #166534; }
            .status-out-for-delivery { background-color: #fef3c7; color: #92400e; }
            .status-ready-for-delivery { background-color: #dbeafe; color: #1e40af; }
            .status-failed-delivery { background-color: #fee2e2; color: #dc2626; }
            .status-returned { background-color: #fdf2f8; color: #be185d; }
            .footer { margin-top: 30px; text-align: center; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚚 MERKO Delivery Entries Report</h1>
            <p>Generated on ${dateStr} at ${timeStr}</p>
          </div>
          
          <div class="summary">
            <strong>Summary:</strong> 
            Showing ${filteredDeliveryEntries.length} of ${deliveryEntries.length} delivery entries
          </div>
      `;

      // Add filter information if filters are applied
      if (entriesSearchQuery || entriesStatusFilter) {
        htmlContent += `
          <div class="filters-info">
            <strong>Applied Filters:</strong>
            ${entriesSearchQuery ? `Search: "${entriesSearchQuery}"` : ''}
            ${entriesSearchQuery && entriesStatusFilter ? ' | ' : ''}
            ${entriesStatusFilter ? `Status: "${entriesStatusFilter.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}"` : ''}
          </div>
        `;
      }

      // Add table
      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Order ID</th>
              <th>Merchant Name</th>
              <th>Supplier Name</th>
              <th>Delivery Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Add table rows
      if (filteredDeliveryEntries.length > 0) {
        filteredDeliveryEntries.forEach(entry => {
          const statusClass = `status-${entry.status.toLowerCase().replace(/\s+/g, '-')}`;
          htmlContent += `
            <tr>
              <td>${entry.deliveryId}</td>
              <td>${entry.orderId}</td>
              <td>${entry.merchantName}</td>
              <td>${entry.supplierName}</td>
              <td>${entry.deliveryAddress}</td>
              <td><span class="${statusClass}">${entry.status}</span></td>
            </tr>
          `;
        });
      } else {
        htmlContent += `
          <tr>
            <td colspan="6" style="text-align: center; color: #94a3b8; font-style: italic;">
              ${deliveryEntries.length === 0 ? 'No delivery entries found' : 'No entries match your search criteria'}
            </td>
          </tr>
        `;
      }

      htmlContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated by MERKO Delivery Management System</p>
          <p>© 2025 MERKO. All rights reserved.</p>
        </div>
        
        </body>
        </html>
      `;

      // Write content to the new window and print
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Available status options for delivery entries
  const statusOptions = [
    'Ready for delivery',
    'Out for delivery',
    'Delivered',
    'Failed delivery',
    'Returned'
  ];

  const handleDeliveryAction = (deliveryId, action) => {
    console.log(`Action ${action} clicked for delivery ${deliveryId}`);
    
    // Find the delivery entry
    const deliveryEntry = deliveryEntries.find(entry => entry.deliveryId === deliveryId);
    
    if (!deliveryEntry) {
      alert('Delivery entry not found. Please refresh the page and try again.');
      return;
    }
    
    // Implement action logic here
    switch (action) {
      case 'view':
        // Show delivery details in an alert or navigate to detail page
        const details = [
          `Delivery ID: ${deliveryEntry.deliveryId}`,
          `Order ID: ${deliveryEntry.orderId}`,
          `Merchant: ${deliveryEntry.merchantName}`,
          `Supplier: ${deliveryEntry.supplierName}`,
          `Address: ${deliveryEntry.deliveryAddress}`,
          `Status: ${deliveryEntry.status}`,
          `Date Created: ${deliveryEntry.createdAt ? new Date(deliveryEntry.createdAt).toLocaleString() : 'N/A'}`
        ].join('\n');
        
        alert(`Delivery Details:\n\n${details}`);
        break;
        
      case 'edit':
        setEditingEntry(deliveryEntry);
        setNewStatus(deliveryEntry.status);
        setShowEditModal(true);
        break;
        
      case 'delete':
        handleDeleteDelivery(deliveryId);
        break;
        
      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  };

  // Update delivery status
  const handleUpdateStatus = async () => {
    if (!editingEntry || !newStatus.trim()) {
      alert('Please select a status');
      return;
    }

    try {
      setLoading(true);
      console.log(`Updating delivery ${editingEntry.deliveryId} status to: ${newStatus}`);
      
      const response = await fetch(`http://localhost:8090/api/delivery/entries/${editingEntry.deliveryId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log(`Update response status: ${response.status}`);

      if (response.ok) {
        alert(`Status updated to "${newStatus}" successfully!`);
        setShowEditModal(false);
        setEditingEntry(null);
        setNewStatus('');
        fetchDeliveryEntries(); // Refresh the delivery entries
      } else {
        let errorMessage = 'Failed to update status';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        console.error('Status update failed:', errorMessage);
        alert(`Error updating status:\n\nStatus: ${response.status}\nMessage: ${errorMessage}\n\nDelivery ID: ${editingEntry.deliveryId}\nNew Status: ${newStatus}`);
      }
    } catch (error) {
      console.error('Network error updating status:', error);
      alert(`Network error occurred:\n\n${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Delete delivery entry with enhanced error handling
  const handleDeleteDelivery = async (deliveryId) => {
    // Find the entry to get more details for confirmation
    const entryToDelete = deliveryEntries.find(entry => entry.deliveryId === deliveryId);
    
    if (!entryToDelete) {
      alert(`Delivery entry with ID ${deliveryId} not found. Please refresh the page and try again.`);
      return;
    }
    
    // Allow deletion of any status - removed business rule restriction
    console.log(`Preparing to delete delivery entry ${deliveryId} with status: ${entryToDelete.status}`);
    
    // Confirmation message for deletion
    const confirmMessage = `⚠️  DELETE DELIVERY ENTRY\n\nDelivery ID: ${deliveryId}\nOrder ID: ${entryToDelete.orderId}\nMerchant: ${entryToDelete.merchantName}\nSupplier: ${entryToDelete.supplierName}\nStatus: ${entryToDelete.status}\n\n🚨 WARNING:\n• This action cannot be undone\n• All associated route stops will be removed\n• This delivery will be permanently deleted from the system\n\nAre you sure you want to DELETE this entry?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      console.log(`🗑️  Attempting to delete delivery entry with ID: ${deliveryId}`);
      
      const response = await fetch(`http://localhost:8090/api/delivery/entries/${deliveryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Delete response status: ${response.status}`);
      
      if (response.ok) {
        // Success message
        alert(`✅ Success!\n\nDelivery entry ${deliveryId} has been deleted successfully.\n\n📋 Summary:\n• Entry removed from database\n• Associated route stops cleaned up\n• Delivery entries list will refresh automatically`);
        fetchDeliveryEntries(); // Refresh the delivery entries
      } else {
        let errorMessage = 'Failed to delete delivery entry';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorData.details || errorMessage;
        } catch (parseError) {
          // If response is not JSON, get text response
          try {
            const errorText = await response.text();
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        
        console.error('Delete failed with error:', errorMessage);
        
        // Enhanced error messages with specific solutions
        let userMessage = `❌ DELETION FAILED\n\nDelivery ID: ${deliveryId}\n`;
        
        switch (response.status) {
          case 400:
            userMessage += `\n🔍 Error Analysis:\n`;
            userMessage += `Status: 400 - Bad Request\n`;
            userMessage += `Message: ${errorMessage}\n\n`;
            
            // Check for specific constraint patterns
            if (errorMessage.toLowerCase().includes('route') || errorMessage.toLowerCase().includes('foreign key')) {
              userMessage += `🎯 IDENTIFIED ISSUE: Route Constraint\n`;
              userMessage += `This delivery is part of an active delivery route.\n\n`;
              userMessage += `📋 SOLUTIONS:\n`;
              userMessage += `1. 🗺️  Go to Routes tab and remove this delivery from any routes\n`;
              userMessage += `2. 🔄 Change delivery status to "Failed delivery" instead\n`;
              userMessage += `3. 📞 Contact route manager to reassign route\n`;
              userMessage += `4. ⏱️  Wait for route completion, then delete\n\n`;
              userMessage += `💡 TIP: Use "Edit Status" instead of delete for active deliveries`;
            } else if (errorMessage.toLowerCase().includes('business')) {
              userMessage += `🎯 IDENTIFIED ISSUE: Business Rule Restriction\n`;
              userMessage += `A business rule is preventing deletion.\n\n`;
              userMessage += `📋 SOLUTIONS:\n`;
              userMessage += `1. 🔍 Check backend logs for specific restrictions\n`;
              userMessage += `2. � Contact system administrator\n`;
              userMessage += `3. � Try again later\n`;
              userMessage += `4. 📝 Document the issue if it persists`;
            } else {
              userMessage += `🎯 POSSIBLE CAUSES:\n`;
              userMessage += `• 🔗 Delivery has dependent records (routes, logs)\n`;
              userMessage += `• 🚫 Status prevents deletion (business rule)\n`;
              userMessage += `• 📊 Database constraint violation\n`;
              userMessage += `• 🔢 Invalid delivery ID format\n\n`;
              userMessage += `📋 GENERAL SOLUTIONS:\n`;
              userMessage += `1. �️  Remove from routes in Routes tab\n`;
              userMessage += `2. � Refresh the page and try again\n`;
              userMessage += `3. 👨‍💼 Contact system administrator\n`;
              userMessage += `4. � Check backend server logs for details`;
            }
            break;
            
          case 404:
            userMessage += `\n🔍 Error Analysis:\n`;
            userMessage += `Status: 404 - Entry Not Found\n\n`;
            userMessage += `🎯 POSSIBLE CAUSES:\n`;
            userMessage += `• 🗑️  Entry was already deleted by another user\n`;
            userMessage += `• 🔢 Delivery ID ${deliveryId} doesn't exist\n`;
            userMessage += `• ⏱️  Database synchronization delay\n`;
            userMessage += `• 🔄 Page data is outdated\n\n`;
            userMessage += `📋 SOLUTIONS:\n`;
            userMessage += `1. 🔄 Refresh this page (F5)\n`;
            userMessage += `2. 🔍 Check if entry still exists in the list\n`;
            userMessage += `3. 📞 Ask team if someone else deleted it\n`;
            userMessage += `4. ✅ No action needed if entry is gone`;
            break;
            
          case 500:
            userMessage += `\n🔍 Error Analysis:\n`;
            userMessage += `Status: 500 - Server Error\n`;
            userMessage += `Message: ${errorMessage}\n\n`;
            userMessage += `🎯 IDENTIFIED ISSUE: Backend Problem\n`;
            userMessage += `This is a server-side technical error.\n\n`;
            userMessage += `📋 IMMEDIATE ACTIONS:\n`;
            userMessage += `1. ⏱️  Wait 30 seconds and try again\n`;
            userMessage += `2. 🔄 Refresh page and retry\n`;
            userMessage += `3. 📊 Check backend server status\n`;
            userMessage += `4. 👨‍💼 Contact system administrator\n\n`;
            userMessage += `📞 TECHNICAL SUPPORT:\n`;
            userMessage += `• Show this error to IT team\n`;
            userMessage += `• Include delivery ID: ${deliveryId}\n`;
            userMessage += `• Mention time: ${new Date().toLocaleString()}`;
            break;
            
          default:
            userMessage += `\n🔍 Error Analysis:\n`;
            userMessage += `Status: ${response.status}\n`;
            userMessage += `Message: ${errorMessage}\n\n`;
            userMessage += `🎯 GENERAL TROUBLESHOOTING:\n`;
            userMessage += `📋 CHECK THESE ITEMS:\n`;
            userMessage += `• 🌐 Internet connection is stable\n`;
            userMessage += `• 🖥️  Backend server running (localhost:8090)\n`;
            userMessage += `• 🔐 You have permission to delete entries\n`;
            userMessage += `• 🛡️  No firewall blocking requests\n\n`;
            userMessage += `📞 IF PROBLEM PERSISTS:\n`;
            userMessage += `• Contact system administrator\n`;
            userMessage += `• Reference error code: ${response.status}`;
            break;
        }
        
        alert(userMessage);
      }
    } catch (error) {
      console.error('Network error while deleting delivery:', error);
      
      const networkErrorMessage = `🌐 NETWORK ERROR\n\nConnection failed while deleting delivery entry:\n\n`;
      let detailedError = `Error: ${error.message}\n\n`;
      
      // Specific network error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        detailedError += `🎯 IDENTIFIED ISSUE: Cannot reach backend server\n\n`;
        detailedError += `📋 SOLUTIONS:\n`;
        detailedError += `1. 🖥️  Verify backend server is running:\n`;
        detailedError += `   • Go to backend folder\n`;
        detailedError += `   • Run: start_server.bat\n`;
        detailedError += `   • Check for "Started MERKO_backend" message\n\n`;
        detailedError += `2. 🌐 Check connection:\n`;
        detailedError += `   • Open http://localhost:8090 in browser\n`;
        detailedError += `   • Should show API documentation or error page\n\n`;
        detailedError += `3. 🔄 Restart services:\n`;
        detailedError += `   • Stop backend server\n`;
        detailedError += `   • Restart backend\n`;
        detailedError += `   • Refresh this page\n\n`;
        detailedError += `4. 🛡️  Check firewall/antivirus settings`;
      } else if (error.message.includes('timeout')) {
        detailedError += `🎯 IDENTIFIED ISSUE: Request timeout\n\n`;
        detailedError += `📋 SOLUTIONS:\n`;
        detailedError += `1. ⏱️  Wait and try again\n`;
        detailedError += `2. 🔄 Refresh page and retry\n`;
        detailedError += `3. 🖥️  Check if backend is overloaded\n`;
        detailedError += `4. 🌐 Check internet connection stability`;
      } else {
        detailedError += `📋 GENERAL NETWORK TROUBLESHOOTING:\n`;
        detailedError += `• 🌐 Check internet connection\n`;
        detailedError += `• 🖥️  Ensure backend server is running\n`;
        detailedError += `• 🛡️  Check firewall settings\n`;
        detailedError += `• 🔄 Try refreshing the page\n`;
        detailedError += `• 📞 Contact IT support if problem continues`;
      }
      
      alert(networkErrorMessage + detailedError);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (itemId) => {
    setActiveTab(itemId);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'assigned-orders':
        return <AssignedOrders />;
      case 'routes':
        return <Routes />;
      case 'delivery-confirmation':
        return <SimpleDeliveryConfirmation />;
      case 'delivery-history':
        return <DeliveryHistory />;
      case 'settings':
        return (
          <DeliveryLayout activeTab="settings">
            <div className="delivery-page">
              <div className="delivery-page-header">
                <h1 className="delivery-page-title">Settings</h1>
                <p className="delivery-page-subtitle">Manage your delivery preferences</p>
              </div>
              <div className="delivery-card">
                <div className="delivery-card-content">
                  <p>Settings page coming soon...</p>
                </div>
              </div>
            </div>
          </DeliveryLayout>
        );
      case 'home':
      default:
        return renderDashboardHome();
    }
  };

  const renderDashboardHome = () => (
    <div className="delivery-dashboard">
      {/* Header */}
      <div className="main-header">
        <div className="header-left">
          <h1>DeliveryOS</h1>
        </div>
        <div className="header-right">
          <div className="delivery-user">
            <span>{deliveryPersonName || 'Delivery Person'}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <motion.div 
          className="page-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Delivery Overview</h2>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="stats-grid"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="stat-card todays" variants={cardVariants}>
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <div className="stat-label">Today's Deliveries</div>
              <div className="stat-value">
                {loading ? '...' : stats.todaysDeliveries}
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card pending" variants={cardVariants}>
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-label">Pending</div>
              <div className="stat-value">
                {loading ? '...' : stats.pendingDeliveries}
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card completed" variants={cardVariants}>
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">Completed</div>
              <div className="stat-value">
                {loading ? '...' : stats.completedDeliveries}
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card failed" variants={cardVariants}>
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-label">Failed/Returned</div>
              <div className="stat-value">
                {loading ? '...' : stats.failedDeliveries}
              </div>
            </div>
          </motion.div>

          <motion.div className="stat-card routes" variants={cardVariants}>
            <div className="stat-icon">🗺️</div>
            <div className="stat-content">
              <div className="stat-label">Assigned Routes</div>
              <div className="stat-value">
                {loading ? '...' : stats.assignedRoutes}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="quick-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button 
            className="action-btn assigned-btn"
            onClick={() => handleTabChange('assigned-orders')}
          >
            <span className="action-icon">📍</span>
            <span className="action-text">Assigned Orders</span>
          </button>
          
          <button 
            className="action-btn routes-btn"
            onClick={() => handleTabChange('routes')}
          >
            <span className="action-icon">🗺️</span>
            <span className="action-text">View Routes</span>
          </button>
          
          <button 
            className="action-btn history-btn"
            onClick={() => handleTabChange('history')}
          >
            <span className="action-icon">📜</span>
            <span className="action-text">Delivery History</span>
          </button>
        </motion.div>

        {/* Delivery Entries Table */}
        <motion.div 
          className="content-card delivery-entries full-width"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="entries-header">
            <div>
              <h3>Recent Deliveries</h3>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="entries-filters">
              <div className="entries-search-container">
                <input
                  type="text"
                  placeholder="Search by ID, Order, Merchant, or Address..."
                  value={entriesSearchQuery}
                  onChange={handleEntriesSearchChange}
                  className="entries-search-input"
                />
                <span className="entries-search-icon">🔍</span>
              </div>
              
              <select
                value={entriesStatusFilter}
                onChange={handleEntriesStatusFilterChange}
                className="entries-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="ready-for-delivery">Ready for Delivery</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="failed-delivery">Failed Delivery</option>
                <option value="returned">Returned</option>
              </select>
              
              <div className="entries-count">
                Showing {filteredDeliveryEntries.length} of {deliveryEntries.length} entries
              </div>
            </div>
          </div>
          
          <div className="table-container">
            <table className="entries-table">
              <thead>
                <tr>
                  <th>Delivery ID</th>
                  <th>Order ID</th>
                  <th>Merchant Name</th>
                  <th>Supplier Name</th>
                  <th>Delivery Address</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveryEntries.length > 0 ? (
                  filteredDeliveryEntries.map((entry) => (
                    <tr key={entry.deliveryId}>
                      <td>{entry.deliveryId}</td>
                      <td>{entry.orderId}</td>
                      <td>{entry.merchantName}</td>
                      <td>{entry.supplierName}</td>
                      <td>{entry.deliveryAddress}</td>
                      <td>
                        <span className={`status-badge ${entry.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit"
                            onClick={() => handleDeliveryAction(entry.deliveryId, 'edit')}
                            title="Edit Status"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeliveryAction(entry.deliveryId, 'delete')}
                            title="Delete Entry"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {deliveryEntries.length === 0 
                        ? "No delivery entries found" 
                        : "No entries match your search criteria"
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <DeliveryLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="delivery-dashboard-content">
        {renderMainContent()}
      </div>

      {/* Order Selection Modal */}
      {showOrderSelection && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Order for Delivery</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowOrderSelection(false);
                  setSearchQuery('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : (
                <>
                  {availableOrders.length > 0 ? (
                    <div className="orders-list">
                      {/* Search Section */}
                      <div className="search-section">
                        <div className="search-input-container">
                          <input
                            type="text"
                            placeholder="Search by Order ID, Merchant, Supplier, Address, or Route..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="search-input"
                          />
                          <span className="search-icon">🔍</span>
                        </div>
                        <div className="search-actions">
                          <button 
                            className="add-all-btn"
                            onClick={handleAddAllResults}
                            disabled={loading || filteredOrders.length === 0}
                          >
                            Add All Results ({filteredOrders.length})
                          </button>
                        </div>
                      </div>

                      <p>Select an order that is "Ready to Pick" or add all search results:</p>
                      
                      {filteredOrders.length > 0 ? (
                        <div className="orders-container">
                          {filteredOrders.map((order) => (
                            <div key={order.orderId} className="order-item">
                              <div className="order-info">
                                <strong>Order #{order.orderId}</strong>
                                <div>Merchant: {order.merchantName}</div>
                                <div>Supplier: {order.supplierName}</div>
                                <div>Address: {order.deliveryAddress}</div>
                                <div>Route: {order.route}</div>
                                <div>Amount: ${order.totalAmount}</div>
                              </div>
                              <button 
                                className="select-order-btn"
                                onClick={() => handleSelectOrder(order)}
                                disabled={loading}
                              >
                                Select Order
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="no-results">
                          <p>No orders match your search criteria.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-orders">
                      <p>No orders are currently "Ready to Pick".</p>
                      <p>Orders must have status "Ready to Pick" to be assigned for delivery.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && editingEntry && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Delivery Status</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEntry(null);
                  setNewStatus('');
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="edit-form">
                <div className="form-group">
                  <label><strong>Delivery ID:</strong> {editingEntry.deliveryId}</label>
                </div>
                <div className="form-group">
                  <label><strong>Order ID:</strong> {editingEntry.orderId}</label>
                </div>
                <div className="form-group">
                  <label><strong>Merchant:</strong> {editingEntry.merchantName}</label>
                </div>
                <div className="form-group">
                  <label><strong>Supplier:</strong> {editingEntry.supplierName}</label>
                </div>
                <div className="form-group">
                  <label><strong>Current Status:</strong> {editingEntry.status}</label>
                </div>
                <div className="form-group">
                  <label htmlFor="status-select"><strong>New Status:</strong></label>
                  <select 
                    id="status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button 
                    className="update-btn"
                    onClick={handleUpdateStatus}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Status'}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEntry(null);
                      setNewStatus('');
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DeliveryLayout>
  );
};

export default DeliveryDashboard;
