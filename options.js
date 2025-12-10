// Options page script
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Show/hide provider info based on selection
  document.getElementById('apiProvider').addEventListener('change', (e) => {
    showProviderInfo(e.target.value);
  });

  // Show/hide X account connection options
  document.getElementById('connectX').addEventListener('change', (e) => {
    const extractBtn = document.getElementById('extractTokenBtn');
    if (e.target.checked) {
      extractBtn.style.display = 'block';
    } else {
      extractBtn.style.display = 'none';
    }
  });

  // Extract X session tokens
  document.getElementById('extractTokenBtn').addEventListener('click', extractXTokens);

  // Twitter OAuth login
  document.getElementById('twitterLoginBtn').addEventListener('click', handleTwitterLogin);

  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // Check Twitter auth status on load
  checkTwitterAuthStatus();
});

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(['useAI', 'apiKey', 'apiProvider', 'connectX', 'xAuth'], (result) => {
    document.getElementById('useAI').checked = result.useAI || false;
    document.getElementById('apiKey').value = result.apiKey || '';
    document.getElementById('apiProvider').value = result.apiProvider || 'groq';
    document.getElementById('connectX').checked = result.connectX || false;

    showProviderInfo(result.apiProvider || 'groq');

    // Show extract button if X connection is enabled
    if (result.connectX) {
      document.getElementById('extractTokenBtn').style.display = 'block';
    }

    // Show X account status if tokens exist
    if (result.xAuth && result.xAuth.auth_token) {
      showXAccountStatus(true, result.xAuth.username);
    }
  });
}

// Show provider-specific information
function showProviderInfo(provider) {
  document.querySelectorAll('.provider-info').forEach(el => {
    el.classList.remove('active');
  });

  const infoId = provider + 'Info';
  const infoEl = document.getElementById(infoId);
  if (infoEl) {
    infoEl.classList.add('active');
  }
}

// Save settings
function saveSettings() {
  const useAI = document.getElementById('useAI').checked;
  const apiKey = document.getElementById('apiKey').value.trim();
  const apiProvider = document.getElementById('apiProvider').value;
  const connectX = document.getElementById('connectX').checked;

  // Validate API key if AI is enabled
  if (useAI) {
    if (apiProvider === 'groq' && !apiKey.startsWith('gsk_')) {
      showStatus('error', 'Please enter a valid Groq API key (starts with "gsk_")');
      return;
    }
    if (apiProvider === 'openai' && !apiKey.startsWith('sk-')) {
      showStatus('error', 'Please enter a valid OpenAI API key (starts with "sk-")');
      return;
    }
    if (!apiKey) {
      showStatus('error', 'Please enter an API key or disable AI analysis');
      return;
    }
  }

  chrome.storage.local.set({
    useAI: useAI,
    apiKey: apiKey,
    apiProvider: apiProvider,
    connectX: connectX
  }, () => {
    showStatus('success', `Settings saved! Using ${apiProvider.toUpperCase()} for analysis.`);

    // Notify background script to reload settings
    chrome.runtime.sendMessage({ action: 'reloadSettings' });
  });
}

// Show status message
function showStatus(type, message) {
  const statusDiv = document.getElementById('status');
  statusDiv.className = `status ${type}`;
  statusDiv.textContent = message;

  if (type === 'success') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
}

// Extract X session tokens
async function extractXTokens() {
  try {
    // Send message to background script to extract tokens
    chrome.runtime.sendMessage({ action: 'extractXTokens' }, (response) => {
      if (chrome.runtime.lastError) {
        showXAccountStatus(false, null, 'Extension error. Please reload the extension.');
        return;
      }

      if (response.success) {
        showXAccountStatus(true, response.username);
        showStatus('success', `Connected to X as @${response.username}`);
      } else {
        showXAccountStatus(false, null, response.error || 'Failed to extract tokens');
      }
    });

  } catch (error) {
    console.error('Error extracting tokens:', error);
    showXAccountStatus(false, null, 'Error extracting tokens. Make sure you\'re logged in to X.');
  }
}

// Show X account connection status
function showXAccountStatus(connected, username, errorMsg) {
  const statusDiv = document.getElementById('xAccountStatus');
  statusDiv.style.display = 'block';

  if (connected) {
    statusDiv.style.background = '#d4edda';
    statusDiv.style.color = '#155724';
    statusDiv.innerHTML = `✅ Connected as <strong>@${username}</strong>`;
  } else {
    statusDiv.style.background = '#f8d7da';
    statusDiv.style.color = '#721c24';
    statusDiv.textContent = errorMsg || '❌ Not connected';
  }
}

// ========== Twitter OAuth Functions ==========

// Check Twitter authentication status
async function checkTwitterAuthStatus() {
  try {
    // First, test if background is responding at all
    chrome.runtime.sendMessage({ action: 'ping' }, (pingResponse) => {
      console.log('Ping response:', pingResponse, 'Error:', chrome.runtime.lastError);

      // Now try to get auth status
      chrome.runtime.sendMessage({ action: 'getTwitterAuthStatus' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error getting Twitter auth status:', chrome.runtime.lastError);
          return;
        }

        if (response && response.isAuthenticated) {
          showTwitterAuthStatus(true, response.username);
        } else {
          showTwitterAuthStatus(false);
        }
      });
    });
  } catch (error) {
    console.error('Error checking Twitter auth status:', error);
  }
}

// Handle Twitter login button click
async function handleTwitterLogin() {
  const btn = document.getElementById('twitterLoginBtn');
  const btnText = document.getElementById('twitterLoginText');

  // Check if already authenticated
  chrome.runtime.sendMessage({ action: 'getTwitterAuthStatus' }, (statusResponse) => {
    if (chrome.runtime.lastError) {
      console.error('Error checking auth status:', chrome.runtime.lastError);
      showStatus('error', 'Error checking authentication status');
      return;
    }

    if (statusResponse && statusResponse.isAuthenticated) {
      // Already logged in, offer to logout
      if (confirm(`You are logged in as @${statusResponse.username}. Do you want to logout?`)) {
        chrome.runtime.sendMessage({ action: 'logoutTwitter' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error during logout:', chrome.runtime.lastError);
            showStatus('error', 'Error during logout');
            return;
          }
          if (response && response.success) {
            showTwitterAuthStatus(false);
            showStatus('success', 'Logged out successfully');
          }
        });
      }
    } else {
      // Not logged in, initiate OAuth flow
      btnText.textContent = 'Opening Twitter...';
      btn.disabled = true;

      chrome.runtime.sendMessage({ action: 'initiateTwitterLogin' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error initiating login:', chrome.runtime.lastError);
          showStatus('error', 'Error initiating login');
          btnText.textContent = 'Sign in with X';
          btn.disabled = false;
          return;
        }

        if (response && response.success) {
          showStatus('success', 'Opening Twitter login in new tab...');
          // Reset button after a short delay
          setTimeout(() => {
            btnText.textContent = 'Sign in with X';
            btn.disabled = false;
          }, 3000);
        } else {
          showStatus('error', (response && response.error) || 'Failed to initiate login');
          btnText.textContent = 'Sign in with X';
          btn.disabled = false;
        }
      });
    }
  });
}

// Show Twitter authentication status
function showTwitterAuthStatus(authenticated, username) {
  const statusDiv = document.getElementById('twitterAuthStatus');
  const btn = document.getElementById('twitterLoginBtn');
  const btnText = document.getElementById('twitterLoginText');

  statusDiv.style.display = 'block';

  if (authenticated) {
    statusDiv.style.background = '#d4edda';
    statusDiv.style.color = '#155724';
    statusDiv.innerHTML = `✅ Authenticated as <strong>@${username}</strong>`;
    btnText.textContent = 'Logout';
    btn.style.background = '#dc3545';
    btn.disabled = false;
  } else {
    statusDiv.style.display = 'none';
    btnText.textContent = 'Sign in with Twitter';
    btn.style.background = '#1DA1F2';
    btn.disabled = false;
  }
}

// Listen for authentication completion message from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'twitterAuthComplete') {
    if (request.success) {
      showTwitterAuthStatus(true, request.username);
      showStatus('success', `Successfully logged in as @${request.username}`);
    }
  }
});