import React, { useState, useEffect } from 'react';
import './DeliveryHeader.css';

const DeliveryHeader = () => {
  const [currentUser, setCurrentUser] = useState({
    username: 'Loading...',
    role: 'Loading...'
  });

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get user info from localStorage (check both userInfo and merko_user)
        let userInfo = localStorage.getItem('userInfo');
        let merkoUser = localStorage.getItem('merko_user');
        let merkoUserRole = localStorage.getItem('merko_user_role');
        
        console.log('Raw userInfo from localStorage:', userInfo);
        console.log('Raw merko_user from localStorage:', merkoUser);
        console.log('merko_user_role from localStorage:', merkoUserRole);
        
        // Priority: use merko_user if available, fallback to userInfo
        const actualUserData = merkoUser || userInfo;
        
        if (actualUserData) {
          const parsedUserInfo = JSON.parse(actualUserData);
          console.log('Parsed user data:', parsedUserInfo);
          
          // Add role from separate storage if available
          if (merkoUserRole && !parsedUserInfo.role) {
            parsedUserInfo.role = merkoUserRole;
          }
          
          const userId = parsedUserInfo.userId || parsedUserInfo.id || parsedUserInfo.user_id;
          console.log('Extracted userId:', userId);
          
          if (userId) {
            // Fetch user details from backend
            console.log('Attempting API call to:', `http://localhost:8090/api/users/${userId}`);
            const response = await fetch(`http://localhost:8090/api/users/${userId}`);
            console.log('API response status:', response.status);
            
            if (response.ok) {
              const userData = await response.json();
              console.log('User data from API:', userData);
              setCurrentUser({
                username: userData.first_name || userData.firstName || userData.username || userData.name || 'Unknown User',
                role: userData.role || 'User'
              });
            } else {
              console.log('API call failed, using localStorage data');
              // Fallback to localStorage data
              setCurrentUser({
                username: parsedUserInfo.first_name || parsedUserInfo.firstName || parsedUserInfo.username || parsedUserInfo.name || 'Unknown User',
                role: parsedUserInfo.role || merkoUserRole || 'User'
              });
            }
          } else {
            // Fallback to localStorage data if no userId
            console.log('⚠️ No userId found, using localStorage data directly');
            console.log('📋 Available fields in parsedUserInfo:', Object.keys(parsedUserInfo));
            console.log('🔍 Looking for name in these fields:');
            console.log('  - first_name:', parsedUserInfo.first_name);
            console.log('  - firstName:', parsedUserInfo.firstName);
            console.log('  - username:', parsedUserInfo.username);
            console.log('  - name:', parsedUserInfo.name);
            console.log('  - merkoUserRole:', merkoUserRole);
            
            const displayName = parsedUserInfo.first_name || parsedUserInfo.firstName || parsedUserInfo.username || parsedUserInfo.name || 'Unknown User';
            console.log('🎯 Final display name will be:', displayName);
            
            setCurrentUser({
              username: displayName,
              role: parsedUserInfo.role || merkoUserRole || 'User'
            });
          }
        } else {
          // No user info in localStorage
          console.log('❌ No user data found in localStorage (checked both userInfo and merko_user)');
          console.log('🔍 All localStorage keys:', Object.keys(localStorage));
          console.log('📝 This means you need to log in first!');
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

  return (
    <header className="delivery-dashboard-header">
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
  );
};

export default DeliveryHeader;