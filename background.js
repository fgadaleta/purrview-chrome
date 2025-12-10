// Background service worker - handles API calls and data storage
console.log('Pickycat: Background script loaded');

// Settings (loaded from storage)
let USE_AI_ANALYSIS = false;
let API_KEY = '';
let API_PROVIDER = 'groq'; // 'groq' or 'openai'

// Load settings on startup
loadSettings();

// Keyword-based classifier (fallback)
const biasKeywords = {
  left: [
    'progressive', 'socialism', 'medicare for all', 'climate action', 'wealth tax',
    'social justice', 'equity', 'systemic racism', 'transgender rights', 'abortion rights',
    'gun control', 'universal healthcare', 'green new deal', 'defund police', 'living wage',
    'workers rights', 'unions', 'corporate greed', 'billionaire tax', 'student debt',
    'immigration reform', 'sanctuary cities', 'blm', 'acab', 'resist', 'antifa',
    'regulate corporations', 'big pharma', 'oligarchy', 'income inequality'
  ],
  right: [
    'conservative', 'freedom', 'liberty', 'second amendment', 'pro-life', 'traditional values',
    'border security', 'illegal immigration', 'law and order', 'back the blue', 'maga',
    'america first', 'drain the swamp', 'fake news', 'mainstream media', 'woke',
    'cancel culture', 'free speech', 'big government', 'socialism bad', 'capitalism',
    'small business', 'deregulation', 'lower taxes', 'religious freedom', 'patriot',
    'voter fraud', 'election integrity', 'parental rights', 'critical race theory', 'crt',
    'secure borders', 'military strong', 'energy independence', 'fossil fuels'
  ]
};

// API configurations
const API_CONFIGS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',  // Fast and accurate
    // Alternative models: 'mixtral-8x7b-32768', 'llama-3.1-70b-versatile'
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  }
};

// Load settings from storage
function loadSettings() {
  chrome.storage.local.get(['useAI', 'apiKey', 'apiProvider'], (result) => {
    USE_AI_ANALYSIS = result.useAI || false;
    API_KEY = result.apiKey || '';
    API_PROVIDER = result.apiProvider || 'groq';
    console.log('Settings loaded:', {
      useAI: USE_AI_ANALYSIS,
      provider: API_PROVIDER,
      hasKey: !!API_KEY
    });
  });
}

// Listen for messages from content script and options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);

  // Test ping
  if (request.action === 'ping') {
    sendResponse({ pong: true });
    return false;
  }

  if (request.action === 'analyzePost') {
    console.log('Received post to analyze:', request.text.substring(0, 50) + '...');
    analyzePostBias(request.text);
    return false;
  } else if (request.action === 'reloadSettings') {
    loadSettings();
    return false;
  } else if (request.action === 'extractXTokens') {
    extractXTokens()
      .then(response => {
        console.log('Sending extractXTokens response:', response);
        sendResponse(response);
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Will respond asynchronously
  } else if (request.action === 'initiateTwitterLogin') {
    initiateTwitterLogin()
      .then(response => {
        console.log('Sending initiateTwitterLogin response:', response);
        sendResponse(response);
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Will respond asynchronously
  } else if (request.action === 'getTwitterAuthStatus') {
    getTwitterAuthStatus()
      .then(response => {
        console.log('Sending getTwitterAuthStatus response:', response);
        sendResponse(response);
      })
      .catch(err => sendResponse({ isAuthenticated: false, error: err.message }));
    return true; // Will respond asynchronously
  } else if (request.action === 'logoutTwitter') {
    logoutTwitter()
      .then(response => {
        console.log('Sending logoutTwitter response:', response);
        sendResponse(response);
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Will respond asynchronously
  }

  console.log('Unknown action:', request.action);
  return false;
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});

// Extract X session tokens
async function extractXTokens() {
  try {
    console.log('Extracting X tokens...');

    // Get cookies from x.com and twitter.com
    const xCookies = await chrome.cookies.getAll({ domain: '.x.com' });
    const twitterCookies = await chrome.cookies.getAll({ domain: '.twitter.com' });
    const allCookies = [...xCookies, ...twitterCookies];

    console.log(`Found ${allCookies.length} cookies`);

    let auth_token = null;
    let ct0 = null;

    for (const cookie of allCookies) {
      if (cookie.name === 'auth_token' && !auth_token) {
        auth_token = cookie.value;
        console.log('Found auth_token');
      } else if (cookie.name === 'ct0' && !ct0) {
        ct0 = cookie.value;
        console.log('Found ct0');
      }
    }

    if (!auth_token || !ct0) {
      console.log('Missing tokens:', { auth_token: !!auth_token, ct0: !!ct0 });
      return {
        success: false,
        error: 'Not logged in to X. Please log in at x.com first.'
      };
    }

    // Static bearer token (from X's web client)
    const bearer_token = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

    // For username, we'll get it later when making actual API calls
    // For now, just mark as connected
    let username = 'Connected';

    console.log('Tokens extracted successfully');

    // Save tokens
    const xAuth = {
      auth_token,
      ct0,
      bearer_token,
      username,
      connected: true,
      connectedAt: new Date().toISOString()
    };

    await chrome.storage.local.set({ xAuth });

    return {
      success: true,
      username: 'X Account'
    };

  } catch (error) {
    console.error('Error extracting tokens:', error);
    return {
      success: false,
      error: `Error: ${error.message}`
    };
  }
}

// Main analysis function - routes to AI or keyword detection
async function analyzePostBias(postText) {
  if (USE_AI_ANALYSIS && API_KEY && (API_KEY.startsWith('sk-') || API_KEY.startsWith('gsk_'))) {
    await analyzeWithAI(postText);
  } else {
    await analyzeWithKeywords(postText);
  }
}

// Analyze using AI (Groq or OpenAI)
async function analyzeWithAI(postText) {
  try {
    const config = API_CONFIGS[API_PROVIDER];
    console.log(`Using ${API_PROVIDER.toUpperCase()} API for analysis...`);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You analyze social media posts. You MUST respond with ONLY valid JSON, no other text. Format: {"bias":"left|center|right","sentiment":"positive|neutral|negative","toxicity":"low|medium|high"}'
          },
          {
            role: 'user',
            content: `Analyze: "${postText}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${API_PROVIDER.toUpperCase()} API Error:`, response.status, errorText);
      await analyzeWithKeywords(postText);
      return;
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      let content = data.choices[0].message.content.trim();

      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      try {
        const analysis = JSON.parse(content);

        // Validate and clean responses
        const bias = (analysis.bias || '').toLowerCase().replace(/[.,!?;:]/g, '').trim();
        const sentiment = (analysis.sentiment || '').toLowerCase().replace(/[.,!?;:]/g, '').trim();
        const toxicity = (analysis.toxicity || '').toLowerCase().replace(/[.,!?;:]/g, '').trim();

        if (['left', 'center', 'right'].includes(bias) &&
            ['positive', 'neutral', 'negative'].includes(sentiment) &&
            ['low', 'medium', 'high'].includes(toxicity)) {

          console.log(`✓ ${API_PROVIDER.toUpperCase()} Analysis:`, { bias, sentiment, toxicity });
          await updateStats(bias, sentiment, toxicity);
        } else {
          console.log('Invalid AI response:', { bias, sentiment, toxicity });
          await analyzeWithKeywords(postText);
        }
      } catch (parseError) {
        console.log('Failed to parse JSON response:', content);
        await analyzeWithKeywords(postText);
      }
    }
  } catch (error) {
    console.error('Error with AI analysis:', error);
    await analyzeWithKeywords(postText);
  }
}

// Analyze using keyword detection (fallback)
async function analyzeWithKeywords(postText) {
  try {
    const text = postText.toLowerCase();

    let leftScore = 0;
    let rightScore = 0;

    for (const keyword of biasKeywords.left) {
      if (text.includes(keyword)) {
        leftScore++;
      }
    }

    for (const keyword of biasKeywords.right) {
      if (text.includes(keyword)) {
        rightScore++;
      }
    }

    let bias = 'center';

    if (leftScore > rightScore && leftScore > 0) {
      bias = 'left';
    } else if (rightScore > leftScore && rightScore > 0) {
      bias = 'right';
    }

    // Simple sentiment detection
    const positiveWords = ['love', 'great', 'amazing', 'excellent', 'happy', 'wonderful', 'fantastic'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'disgusting', 'pathetic'];

    let posCount = positiveWords.filter(w => text.includes(w)).length;
    let negCount = negativeWords.filter(w => text.includes(w)).length;

    let sentiment = 'neutral';
    if (posCount > negCount) sentiment = 'positive';
    else if (negCount > posCount) sentiment = 'negative';

    // Simple toxicity detection
    const toxicWords = ['idiot', 'stupid', 'moron', 'scum', 'trash', 'garbage', 'fuck', 'shit'];
    const toxicCount = toxicWords.filter(w => text.includes(w)).length;

    let toxicity = 'low';
    if (toxicCount >= 2) toxicity = 'high';
    else if (toxicCount === 1) toxicity = 'medium';

    console.log(`Keyword analysis - Bias: ${bias}, Sentiment: ${sentiment}, Toxicity: ${toxicity}`);
    await updateStats(bias, sentiment, toxicity);

  } catch (error) {
    console.error('Error with keyword analysis:', error);
  }
}

// Update stored statistics
async function updateStats(bias, sentiment = 'neutral', toxicity = 'low') {
  return new Promise((resolve) => {
    chrome.storage.local.get(['biasStats'], (result) => {
      const stats = result.biasStats || {
        left: 0, center: 0, right: 0, total: 0,
        positive: 0, neutral: 0, negative: 0,
        toxicLow: 0, toxicMedium: 0, toxicHigh: 0
      };

      // Update bias
      stats[bias] = (stats[bias] || 0) + 1;

      // Update sentiment
      stats[sentiment] = (stats[sentiment] || 0) + 1;

      // Update toxicity
      const toxicityKey = 'toxic' + toxicity.charAt(0).toUpperCase() + toxicity.slice(1);
      stats[toxicityKey] = (stats[toxicityKey] || 0) + 1;

      stats.total = stats.left + stats.center + stats.right;
      stats.lastUpdated = new Date().toISOString();

      chrome.storage.local.set({ biasStats: stats }, () => {
        resolve();
      });
    });
  });
}

// ========== Twitter OAuth Functions ==========

const PURRVIEW_API = 'https://purrview.amethix.com';

// Initiate Twitter OAuth login
async function initiateTwitterLogin() {
  try {
    console.log('Initiating Twitter OAuth login...');

    // Step 1: Get the auth URL from Purrview backend
    console.log('Fetching auth URL from:', `${PURRVIEW_API}/auth/twitter`);
    const response = await fetch(`${PURRVIEW_API}/auth/twitter`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to get auth URL: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Got auth URL from backend:', data);

    if (!data.auth_uri) {
      throw new Error('No auth_uri in response');
    }

    // Step 2: Open the Twitter auth URL in a new tab
    console.log('Opening Twitter auth URL in new tab');
    const tab = await chrome.tabs.create({ url: data.auth_uri });
    console.log('Tab created with ID:', tab.id);

    // Step 3: Monitor the tab for callback URL
    monitorOAuthCallback(tab.id);

    return { success: true, message: 'Opening Twitter login...' };
  } catch (error) {
    console.error('Error initiating Twitter login:', error);
    return { success: false, error: error.message };
  }
}

// Monitor tab for OAuth callback
function monitorOAuthCallback(tabId) {
  const callbackListener = async (updatedTabId, changeInfo, tab) => {
    if (updatedTabId !== tabId) return;

    // Check if we've reached the callback URL
    if (changeInfo.url && changeInfo.url.includes('purrview.amethix.com/auth/twitter/callback')) {
      console.log('OAuth callback detected:', changeInfo.url);

      try {
        // Fetch the page to get the JSON response
        const response = await fetch(changeInfo.url);
        const data = await response.json();

        if (data.token && data.username) {
          // Store authentication data
          await chrome.storage.local.set({
            twitterAuth: {
              token: data.token,
              username: data.username,
              userId: data.user_id,
              authenticatedAt: new Date().toISOString(),
              isAuthenticated: true
            }
          });

          console.log('Twitter authentication successful:', data.username);

          // Close the OAuth tab
          chrome.tabs.remove(tabId);

          // Notify options page if it's open
          chrome.runtime.sendMessage({
            action: 'twitterAuthComplete',
            success: true,
            username: data.username
          }).catch(() => {
            // Options page might not be open, that's okay
          });
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
      }

      // Remove listener
      chrome.tabs.onUpdated.removeListener(callbackListener);
    }
  };

  chrome.tabs.onUpdated.addListener(callbackListener);

  // Clean up listener if tab is closed
  chrome.tabs.onRemoved.addListener((closedTabId) => {
    if (closedTabId === tabId) {
      chrome.tabs.onUpdated.removeListener(callbackListener);
    }
  });
}

// Get Twitter authentication status
async function getTwitterAuthStatus() {
  try {
    const result = await chrome.storage.local.get(['twitterAuth']);
    const authData = result.twitterAuth;

    if (authData && authData.isAuthenticated && authData.token) {
      return {
        isAuthenticated: true,
        username: authData.username,
        userId: authData.userId,
        authenticatedAt: authData.authenticatedAt
      };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error getting Twitter auth status:', error);
    return { isAuthenticated: false, error: error.message };
  }
}

// Logout from Twitter
async function logoutTwitter() {
  try {
    await chrome.storage.local.remove(['twitterAuth']);
    console.log('Twitter logout successful');
    return { success: true };
  } catch (error) {
    console.error('Error during Twitter logout:', error);
    return { success: false, error: error.message };
  }
}