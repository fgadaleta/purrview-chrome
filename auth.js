// Twitter OAuth Authentication Module for Purrview Extension

const PURRVIEW_API = 'https://purrview.amethix.com';

/**
 * Initialize Twitter OAuth flow
 * Returns the auth URL to open in a new tab
 */
async function initiateTwitterLogin() {
  try {
    const response = await fetch(`${PURRVIEW_API}/auth/twitter`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get auth URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.auth_uri;
  } catch (error) {
    console.error('Error initiating Twitter login:', error);
    throw error;
  }
}

/**
 * Handle the OAuth callback and extract token from URL
 * This will be called when the OAuth redirect happens
 */
function extractTokenFromCallback(url) {
  try {
    const urlObj = new URL(url);

    // Check if this is a callback URL
    if (!url.includes('purrview.amethix.com/auth/twitter/callback')) {
      return null;
    }

    // The backend should return token in the response or query params
    // We'll need to handle this based on how your backend returns the token
    return urlObj;
  } catch (error) {
    console.error('Error extracting token:', error);
    return null;
  }
}

/**
 * Store authentication data securely
 */
async function storeAuthData(authData) {
  try {
    await chrome.storage.local.set({
      twitterAuth: {
        token: authData.token,
        username: authData.username,
        userId: authData.user_id,
        authenticatedAt: new Date().toISOString(),
        isAuthenticated: true
      }
    });
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
}

/**
 * Get stored authentication data
 */
async function getAuthData() {
  try {
    const result = await chrome.storage.local.get(['twitterAuth']);
    return result.twitterAuth || null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated() {
  const authData = await getAuthData();
  return authData && authData.isAuthenticated && authData.token;
}

/**
 * Logout and clear authentication data
 */
async function logout() {
  try {
    await chrome.storage.local.remove(['twitterAuth']);
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
}

/**
 * Make authenticated API request to Purrview backend
 */
async function makeAuthenticatedRequest(endpoint, options = {}) {
  const authData = await getAuthData();

  if (!authData || !authData.token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authData.token}`,
    ...options.headers
  };

  const response = await fetch(`${PURRVIEW_API}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token expired or invalid, logout
    await logout();
    throw new Error('Authentication expired');
  }

  return response;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initiateTwitterLogin,
    extractTokenFromCallback,
    storeAuthData,
    getAuthData,
    isAuthenticated,
    logout,
    makeAuthenticatedRequest
  };
}
