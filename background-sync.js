// Synchronous background script - no async/await
console.log('SYNC: Background script loaded');

// Message listener - completely synchronous approach
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('SYNC: Received message:', request.action);

  if (request.action === 'ping') {
    console.log('SYNC: Sending pong');
    sendResponse({ pong: true });
    return;
  }

  if (request.action === 'getTwitterAuthStatus') {
    console.log('SYNC: Getting Twitter auth status');
    chrome.storage.local.get(['twitterAuth'], function(result) {
      console.log('SYNC: Storage result:', result);
      const authData = result.twitterAuth;

      if (authData && authData.isAuthenticated && authData.token) {
        sendResponse({
          isAuthenticated: true,
          username: authData.username,
          userId: authData.userId
        });
      } else {
        sendResponse({ isAuthenticated: false });
      }
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'initiateTwitterLogin') {
    console.log('SYNC: Initiating Twitter login');

    fetch('https://purrview.amethix.com/auth/twitter')
      .then(function(response) { return response.json(); })
      .then(function(data) {
        console.log('SYNC: Got auth URL:', data.auth_url);
        chrome.tabs.create({ url: data.auth_url }, function(tab) {
          console.log('SYNC: Tab created:', tab.id);
          sendResponse({ success: true, message: 'Opening Twitter login...' });
        });
      })
      .catch(function(error) {
        console.error('SYNC: Error:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }

  if (request.action === 'logoutTwitter') {
    console.log('SYNC: Logging out');
    chrome.storage.local.remove(['twitterAuth'], function() {
      console.log('SYNC: Logged out');
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }

  console.log('SYNC: Unknown action');
  return false;
});

console.log('SYNC: Listener registered successfully');
