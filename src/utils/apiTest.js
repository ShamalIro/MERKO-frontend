// API Testing Utility for debugging
export const testApiEndpoints = async () => {
  const baseUrl = 'http://localhost:8090';
  const testResults = [];

  // Test endpoints
  const endpoints = [
    {
      name: 'Health Check',
      url: `${baseUrl}/api/products/all?userEmail=test@test.com&role=MERCHANT`,
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      testResults.push({
        name: endpoint.name,
        status: response.status,
        success: response.ok,
        url: endpoint.url
      });
    } catch (error) {
      testResults.push({
        name: endpoint.name,
        status: 'ERROR',
        success: false,
        error: error.message,
        url: endpoint.url
      });
    }
  }

  return testResults;
};

// Helper function to get user data from localStorage
export const getUserData = () => {
  try {
    const token = localStorage.getItem('merko_token');
    const userType = localStorage.getItem('merko_user_type');
    const userRole = localStorage.getItem('merko_user_role');
    const storedUser = localStorage.getItem('merko_user');
    
    let userEmail = null;
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      userEmail = parsedUser.email;
    }

    return {
      hasToken: !!token,
      userType,
      userRole,
      userEmail,
      isLoggedIn: !!(token && userEmail && userType === 'user')
    };
  } catch (error) {
    return {
      hasToken: false,
      userType: null,
      userRole: null,
      userEmail: null,
      isLoggedIn: false,
      error: error.message
    };
  }
};