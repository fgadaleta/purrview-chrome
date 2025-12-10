// Minimal background script test
console.log('TEST: Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('TEST: Received message:', request.action);

  if (request.action === 'ping') {
    console.log('TEST: Sending pong');
    sendResponse({ pong: true });
    return false;
  }

  if (request.action === 'getTwitterAuthStatus') {
    console.log('TEST: Getting auth status');
    chrome.storage.local.get(['twitterAuth'], (result) => {
      const authData = result.twitterAuth;
      if (authData && authData.isAuthenticated) {
        sendResponse({
          isAuthenticated: true,
          username: authData.username
        });
      } else {
        sendResponse({ isAuthenticated: false });
      }
    });
    return true; // async
  }

  if (request.action === 'initiateTwitterLogin') {
    console.log('TEST: Initiating Twitter login');

    fetch('https://purrview.amethix.com/auth/twitter')
      .then(res => res.json())
      .then(data => {
        console.log('TEST: Got auth URL');
        chrome.tabs.create({ url: data.auth_url });
        sendResponse({ success: true });
      })
      .catch(err => {
        console.error('TEST: Error:', err);
        sendResponse({ success: false, error: err.message });
      });

    return true; // async
  }

  return false;
});

console.log('TEST: Message listener registered');
