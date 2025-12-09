// This script runs on x.com to fetch the username
// It has access to the page's cookies automatically

(async function() {
  try {
    const bearer_token = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

    // Get ct0 from cookie
    const ct0 = document.cookie.split('; ').find(row => row.startsWith('ct0='))?.split('=')[1];

    if (!ct0) {
      chrome.runtime.sendMessage({
        action: 'usernameResult',
        success: false,
        error: 'No ct0 cookie found'
      });
      return;
    }

    const response = await fetch('https://api.x.com/1.1/account/verify_credentials.json', {
      headers: {
        'Authorization': `Bearer ${bearer_token}`,
        'x-csrf-token': ct0,
        'x-twitter-auth-type': 'OAuth2Session'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      chrome.runtime.sendMessage({
        action: 'usernameResult',
        success: true,
        username: data.screen_name
      });
    } else {
      chrome.runtime.sendMessage({
        action: 'usernameResult',
        success: false,
        error: `API returned ${response.status}`
      });
    }
  } catch (error) {
    chrome.runtime.sendMessage({
      action: 'usernameResult',
      success: false,
      error: error.message
    });
  }
})();