// X API Helper Module
// This module handles authenticated X API calls using the user's session

// Get stored X authentication
async function getXAuth() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['xAuth'], (result) => {
      resolve(result.xAuth || null);
    });
  });
}

// Make authenticated X API call
async function makeXAPICall(endpoint, method = 'GET', body = null) {
  const xAuth = await getXAuth();

  if (!xAuth || !xAuth.auth_token || !xAuth.ct0) {
    throw new Error('X account not connected. Please connect in settings.');
  }

  const headers = {
    'Authorization': `Bearer ${xAuth.bearer_token}`,
    'x-csrf-token': xAuth.ct0,
    'Cookie': `auth_token=${xAuth.auth_token}; ct0=${xAuth.ct0}`,
    'Content-Type': 'application/json'
  };

  const options = {
    method,
    headers
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    throw new Error(`X API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Example API calls (for future use)

// Get user info
async function getUserInfo(username) {
  return await makeXAPICall(`https://api.x.com/1.1/users/show.json?screen_name=${username}`);
}

// Get tweet details
async function getTweet(tweetId) {
  return await makeXAPICall(`https://api.x.com/1.1/statuses/show.json?id=${tweetId}`);
}

// Post a tweet
async function postTweet(text) {
  return await makeXAPICall(
    'https://api.x.com/1.1/statuses/update.json',
    'POST',
    { status: text }
  );
}

// Like a tweet
async function likeTweet(tweetId) {
  return await makeXAPICall(
    'https://api.x.com/1.1/favorites/create.json',
    'POST',
    { id: tweetId }
  );
}

// Retweet
async function retweet(tweetId) {
  return await makeXAPICall(
    `https://api.x.com/1.1/statuses/retweet/${tweetId}.json`,
    'POST'
  );
}

// Follow user
async function followUser(username) {
  return await makeXAPICall(
    'https://api.x.com/1.1/friendships/create.json',
    'POST',
    { screen_name: username }
  );
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getXAuth,
    makeXAPICall,
    getUserInfo,
    getTweet,
    postTweet,
    likeTweet,
    retweet,
    followUser
  };
}