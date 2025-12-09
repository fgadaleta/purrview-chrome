// PurrView Content Script
console.log('PurrView: Content script loaded');

// Store analyzed posts to avoid re-analyzing
const analyzedPosts = new Set();
const uniqueAuthors = new Set();
const retweetCount = { original: 0, retweet: 0 };
const extractedTweetIds = new Set();
let isAnalyzing = false;
let retryCount = 0;
let sidebarOpen = false;
let darkMode = false;
let isSearchPage = false;

// Check if we're on a search page
function checkIfSearchPage() {
  const url = window.location.href;
  return url.includes('/search?') || url.includes('/search/');
}

// Update search page status
isSearchPage = checkIfSearchPage();

// Listen for URL changes (X is a single-page app)
let lastUrl = window.location.href;
setInterval(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    isSearchPage = checkIfSearchPage();
    if (isSearchPage) {
      console.log('Search page detected, will extract tweet IDs');
      extractedTweetIds.clear();
    }
  }
}, 1000);

// ============================================
// UTILITY FUNCTIONS (DEFINED FIRST)
// ============================================

// Load persisted data
async function loadPersistedData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['darkMode', 'diversityData', 'analyzedPosts'], (result) => {
      darkMode = result.darkMode || false;

      if (result.diversityData) {
        if (result.diversityData.authors) {
          result.diversityData.authors.forEach(author => uniqueAuthors.add(author));
        }
        retweetCount.original = result.diversityData.original || 0;
        retweetCount.retweet = result.diversityData.retweet || 0;
      }

      if (result.analyzedPosts) {
        result.analyzedPosts.forEach(post => analyzedPosts.add(post));
      }

      resolve();
    });
  });
}

// Save diversity data to storage
function saveDiversityData() {
  const diversityData = {
    authors: Array.from(uniqueAuthors),
    original: retweetCount.original,
    retweet: retweetCount.retweet,
    lastUpdated: new Date().toISOString()
  };

  chrome.storage.local.set({
    diversityData,
    analyzedPosts: Array.from(analyzedPosts)
  });
}

async function getStoredStats() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(['biasStats'], (result) => {
        if (chrome.runtime.lastError) {
          console.log('Extension context invalidated, reloading page...');
          resolve({
            left: 0, center: 0, right: 0, total: 0,
            positive: 0, neutral: 0, negative: 0,
            toxicLow: 0, toxicMedium: 0, toxicHigh: 0
          });
          return;
        }
        resolve(result.biasStats || {
          left: 0, center: 0, right: 0, total: 0,
          positive: 0, neutral: 0, negative: 0,
          toxicLow: 0, toxicMedium: 0, toxicHigh: 0
        });
      });
    } catch (error) {
      console.log('Storage access error:', error);
      resolve({
        left: 0, center: 0, right: 0, total: 0,
        positive: 0, neutral: 0, negative: 0,
        toxicLow: 0, toxicMedium: 0, toxicHigh: 0
      });
    }
  });
}

// ============================================
// MESSAGE LISTENERS
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidebar') {
    toggleSidebar();
    sendResponse({ status: 'toggled' });
  } else if (request.action === 'analyzeFeed') {
    analyzeFeed();
    sendResponse({ status: 'started' });
  } else if (request.action === 'getStats') {
    getStoredStats().then(stats => sendResponse(stats));
    return true;
  }
});

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

function injectSidebar() {
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'feedlens-toggle';
  toggleBtn.innerHTML = '🐱';
  toggleBtn.title = 'Toggle PurrView';
  toggleBtn.addEventListener('click', toggleSidebar);

  const sidebar = document.createElement('div');
  sidebar.id = 'feedlens-sidebar';
  sidebar.innerHTML = `
    <div class="feedlens-container">
      <div class="feedlens-header">
        <div class="feedlens-header-left">
          <h1>🐱 PurrView</h1>
          <button class="feedlens-theme-toggle" id="feedlens-theme-toggle" title="Toggle theme">🌓</button>
        </div>
        <button class="feedlens-close" id="feedlens-close">×</button>
      </div>

      <div class="feedlens-stats-container">
        <div class="feedlens-stat-box left">
          <div class="feedlens-stat-label">Left</div>
          <div class="feedlens-stat-percent" id="feedlens-left-pct">0%</div>
          <div class="feedlens-stat-value" id="feedlens-left">0 posts</div>
        </div>

        <div class="feedlens-stat-box center">
          <div class="feedlens-stat-label">Center</div>
          <div class="feedlens-stat-percent" id="feedlens-center-pct">0%</div>
          <div class="feedlens-stat-value" id="feedlens-center">0 posts</div>
        </div>

        <div class="feedlens-stat-box right">
          <div class="feedlens-stat-label">Right</div>
          <div class="feedlens-stat-percent" id="feedlens-right-pct">0%</div>
          <div class="feedlens-stat-value" id="feedlens-right">0 posts</div>
        </div>
      </div>

      <div class="feedlens-bias-meter">
        <div class="feedlens-meter-bar">
          <div class="feedlens-meter-fill" id="feedlens-meter"></div>
        </div>
        <div class="feedlens-meter-labels">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      <div class="feedlens-info">
        <p><strong>Total Posts:</strong> <span id="feedlens-total">0</span></p>
        <p class="feedlens-assessment" id="feedlens-assessment">Scroll your feed to analyze posts</p>
        <p class="feedlens-last-updated" id="feedlens-updated"></p>
      </div>

      <div class="feedlens-info">
        <p><strong>😊 Sentiment</strong></p>
        <p style="font-size: 12px; margin: 5px 0;">
          <span style="color: #10b981;">Positive: <span id="feedlens-positive">0</span></span> ·
          <span style="color: #6b7280;">Neutral: <span id="feedlens-neutral">0</span></span> ·
          <span style="color: #ef4444;">Negative: <span id="feedlens-negative">0</span></span>
        </p>
      </div>

      <div class="feedlens-info">
        <p><strong>🛡️ Toxicity Level</strong></p>
        <p style="font-size: 12px; margin: 5px 0;">
          <span style="color: #10b981;">Low: <span id="feedlens-toxic-low">0</span></span> ·
          <span style="color: #f59e0b;">Medium: <span id="feedlens-toxic-medium">0</span></span> ·
          <span style="color: #ef4444;">High: <span id="feedlens-toxic-high">0</span></span>
        </p>
      </div>

      <div class="feedlens-info">
        <p><strong>🌐 Source Diversity</strong></p>
        <p style="font-size: 12px; margin: 5px 0;">
          Unique voices: <span id="feedlens-unique-authors">0</span><br>
          Original: <span id="feedlens-original">0</span> · Retweets: <span id="feedlens-retweets">0</span>
        </p>
      </div>

      <div class="feedlens-buttons">
        <button class="feedlens-btn feedlens-btn-primary" id="feedlens-refresh">Refresh</button>
        <button class="feedlens-btn feedlens-btn-secondary" id="feedlens-reset">Reset</button>
      </div>
    </div>
  `;

  document.body.appendChild(toggleBtn);
  document.body.appendChild(sidebar);

  // Load persisted data first, then apply theme
  loadPersistedData().then(() => {
    console.log('Loaded persisted data:', {
      authors: uniqueAuthors.size,
      posts: analyzedPosts.size,
      darkMode
    });

    // Apply saved theme and update button
    const themeBtn = document.getElementById('feedlens-theme-toggle');
    if (darkMode) {
      sidebar.classList.add('dark');
      themeBtn.textContent = '☀️';
      themeBtn.title = 'Switch to light theme';
    } else {
      sidebar.classList.remove('dark');
      themeBtn.textContent = '🌓';
      themeBtn.title = 'Switch to dark theme';
    }

    updateSidebarStats();
  });

  document.getElementById('feedlens-close').addEventListener('click', toggleSidebar);
  document.getElementById('feedlens-theme-toggle').addEventListener('click', toggleTheme);
  document.getElementById('feedlens-refresh').addEventListener('click', analyzeFeed);
  document.getElementById('feedlens-reset').addEventListener('click', resetStats);

  setInterval(updateSidebarStats, 3000);
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  const sidebar = document.getElementById('feedlens-sidebar');
  const toggle = document.getElementById('feedlens-toggle');

  if (sidebarOpen) {
    sidebar.classList.add('open');
    toggle.classList.add('sidebar-open');
  } else {
    sidebar.classList.remove('open');
    toggle.classList.remove('sidebar-open');
  }
}

function toggleTheme() {
  darkMode = !darkMode;
  const sidebar = document.getElementById('feedlens-sidebar');
  const themeBtn = document.getElementById('feedlens-theme-toggle');

  if (darkMode) {
    sidebar.classList.add('dark');
    themeBtn.textContent = '☀️';
    themeBtn.title = 'Switch to light theme';
  } else {
    sidebar.classList.remove('dark');
    themeBtn.textContent = '🌓';
    themeBtn.title = 'Switch to dark theme';
  }

  chrome.storage.local.set({ darkMode: darkMode });
}

async function updateSidebarStats() {
  const stats = await getStoredStats();

  const leftCount = stats.left || 0;
  const centerCount = stats.center || 0;
  const rightCount = stats.right || 0;
  const totalCount = stats.total || 0;

  document.getElementById('feedlens-left').textContent = `${leftCount} post${leftCount !== 1 ? 's' : ''}`;
  document.getElementById('feedlens-center').textContent = `${centerCount} post${centerCount !== 1 ? 's' : ''}`;
  document.getElementById('feedlens-right').textContent = `${rightCount} post${rightCount !== 1 ? 's' : ''}`;
  document.getElementById('feedlens-total').textContent = totalCount;

  document.getElementById('feedlens-positive').textContent = stats.positive || 0;
  document.getElementById('feedlens-neutral').textContent = stats.neutral || 0;
  document.getElementById('feedlens-negative').textContent = stats.negative || 0;

  document.getElementById('feedlens-toxic-low').textContent = stats.toxicLow || 0;
  document.getElementById('feedlens-toxic-medium').textContent = stats.toxicMedium || 0;
  document.getElementById('feedlens-toxic-high').textContent = stats.toxicHigh || 0;

  document.getElementById('feedlens-unique-authors').textContent = uniqueAuthors.size;
  document.getElementById('feedlens-original').textContent = retweetCount.original;
  document.getElementById('feedlens-retweets').textContent = retweetCount.retweet;

  if (totalCount > 0) {
    const leftPct = ((leftCount / totalCount) * 100).toFixed(1);
    const centerPct = ((centerCount / totalCount) * 100).toFixed(1);
    const rightPct = ((rightCount / totalCount) * 100).toFixed(1);

    document.getElementById('feedlens-left-pct').textContent = leftPct + '%';
    document.getElementById('feedlens-center-pct').textContent = centerPct + '%';
    document.getElementById('feedlens-right-pct').textContent = rightPct + '%';

    const score = ((stats.right - stats.left) / stats.total) * 100;
    const position = 50 + (score / 2);
    document.getElementById('feedlens-meter').style.left = position + '%';

    updateAssessment(stats);
  }

  if (stats.lastUpdated) {
    const time = new Date(stats.lastUpdated).toLocaleTimeString();
    document.getElementById('feedlens-updated').textContent = `Last updated: ${time}`;
  }
}

function updateAssessment(stats) {
  const total = stats.total;
  if (total < 5) {
    document.getElementById('feedlens-assessment').textContent =
      'Analyzing... need more posts for accurate assessment.';
    return;
  }

  const leftPct = (stats.left / total) * 100;
  const centerPct = (stats.center / total) * 100;
  const rightPct = (stats.right / total) * 100;

  const negativePct = ((stats.negative || 0) / total) * 100;
  const toxicHighPct = ((stats.toxicHigh || 0) / total) * 100;

  let assessment = '';

  if (Math.abs(leftPct - rightPct) < 15 && centerPct > 20) {
    assessment = '✅ Balanced perspectives';
  } else if (leftPct > 60) {
    assessment = '⚠️ Strongly left-leaning';
  } else if (rightPct > 60) {
    assessment = '⚠️ Strongly right-leaning';
  } else if (leftPct > 45) {
    assessment = '📊 Moderately left';
  } else if (rightPct > 45) {
    assessment = '📊 Moderately right';
  } else {
    assessment = '📊 Moderate balance';
  }

  if (negativePct > 60) {
    assessment += ' | 😟 High negativity';
  }

  if (toxicHighPct > 20) {
    assessment += ' | ⚠️ Toxic content detected';
  } else if (toxicHighPct < 5 && total > 20) {
    assessment += ' | ✨ Clean discourse';
  }

  document.getElementById('feedlens-assessment').textContent = assessment;
}

function resetStats() {
  if (confirm('Reset all statistics?')) {
    try {
      chrome.storage.local.set({
        biasStats: {
          left: 0, center: 0, right: 0, total: 0,
          positive: 0, neutral: 0, negative: 0,
          toxicLow: 0, toxicMedium: 0, toxicHigh: 0
        },
        diversityData: {
          authors: [],
          original: 0,
          retweet: 0
        },
        analyzedPosts: []
      }, () => {
        if (chrome.runtime.lastError) {
          console.log('Extension context error during reset');
          return;
        }
        analyzedPosts.clear();
        uniqueAuthors.clear();
        retweetCount.original = 0;
        retweetCount.retweet = 0;
        updateSidebarStats();
      });
    } catch (error) {
      console.log('Reset error:', error);
    }
  }
}

// ============================================
// FEED ANALYSIS FUNCTIONS
// ============================================

async function analyzeFeed() {
  if (isAnalyzing) {
    console.log('Already analyzing...');
    return;
  }

  isAnalyzing = true;
  console.log('Starting feed analysis...');

  await waitForTweets();

  const tweets = document.querySelectorAll('article[data-testid="tweet"]');
  console.log(`Found ${tweets.length} tweets on page`);

  if (tweets.length === 0) {
    console.log('No tweets found. Waiting and retrying...');
    isAnalyzing = false;
    if (retryCount < 3) {
      retryCount++;
      setTimeout(analyzeFeed, 2000);
    }
    return;
  }

  retryCount = 0;
  let newPostsFound = 0;

  for (const tweet of tweets) {
    const tweetText = extractTweetText(tweet);
    const author = extractAuthor(tweet);
    const isRetweet = checkIfRetweet(tweet);

    if (isSearchPage) {
      const tweetId = extractTweetId(tweet);
      if (tweetId && !extractedTweetIds.has(tweetId)) {
        extractedTweetIds.add(tweetId);
        console.log(`Tweet ID extracted: ${tweetId} (Total: ${extractedTweetIds.size})`);

        if (extractedTweetIds.size === 50) {
          console.log('📊 50 tweet IDs extracted!');
        } else if (extractedTweetIds.size === 100) {
          console.log('📊 100 tweet IDs extracted!');
          console.log('All Tweet IDs:', Array.from(extractedTweetIds));
        }
      }
    }

    if (!tweetText || analyzedPosts.has(tweetText)) {
      continue;
    }

    console.log('New tweet found:', tweetText.substring(0, 50) + '...');

    analyzedPosts.add(tweetText);
    if (author) uniqueAuthors.add(author);

    if (isRetweet) {
      retweetCount.retweet++;
    } else {
      retweetCount.original++;
    }

    saveDiversityData();

    newPostsFound++;

    try {
      chrome.runtime.sendMessage({
        action: 'analyzePost',
        text: tweetText
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Extension context error, message not sent');
        }
      });
    } catch (error) {
      console.log('Failed to send message:', error);
    }

    if (newPostsFound >= 10) {
      break;
    }
  }

  console.log(`Sent ${newPostsFound} new posts for analysis`);
  console.log(`Total unique posts seen: ${analyzedPosts.size}`);
  isAnalyzing = false;
}

function waitForTweets() {
  return new Promise((resolve) => {
    const checkForTweets = () => {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');
      if (tweets.length > 0) {
        console.log('Tweets detected!');
        resolve();
      } else {
        console.log('Waiting for tweets to load...');
        setTimeout(checkForTweets, 500);
      }
    };
    checkForTweets();
  });
}

function extractTweetText(tweetElement) {
  try {
    const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
    if (textElement) {
      const text = textElement.innerText.trim();
      console.log('Extracted text (first 50 chars):', text.substring(0, 50));
      return text;
    }

    const userName = tweetElement.querySelector('[data-testid="User-Name"]');
    if (userName) {
      const allText = tweetElement.innerText;
      if (allText && allText.length > 20) {
        return allText.substring(0, 500).trim();
      }
    }

    console.log('Could not extract text from tweet');
  } catch (e) {
    console.error('Error extracting tweet text:', e);
  }
  return null;
}

function extractAuthor(tweetElement) {
  try {
    const userNameElement = tweetElement.querySelector('[data-testid="User-Name"]');
    if (userNameElement) {
      const links = userNameElement.querySelectorAll('a');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/') && !href.includes('/status/')) {
          return href.substring(1);
        }
      }
    }
  } catch (e) {
    console.error('Error extracting author:', e);
  }
  return null;
}

function checkIfRetweet(tweetElement) {
  try {
    const retweetText = tweetElement.innerText.toLowerCase();
    return retweetText.includes('retweeted') || retweetText.includes(' reposted');
  } catch (e) {
    return false;
  }
}

function extractTweetId(tweetElement) {
  try {
    const links = tweetElement.querySelectorAll('a[href*="/status/"]');
    console.log(`Found ${links.length} status links in tweet`);

    for (const link of links) {
      const href = link.getAttribute('href');
      console.log('Checking link:', href);
      if (href) {
        const match = href.match(/\/status\/(\d+)/);
        if (match && match[1]) {
          console.log('✓ Extracted tweet ID:', match[1]);
          return match[1];
        }
      }
    }

    const timeElement = tweetElement.querySelector('time');
    if (timeElement) {
      const parentLink = timeElement.closest('a');
      if (parentLink) {
        const href = parentLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/status\/(\d+)/);
          if (match && match[1]) {
            console.log('✓ Extracted tweet ID from time element:', match[1]);
            return match[1];
          }
        }
      }
    }

    console.log('Could not extract tweet ID from this tweet');
  } catch (e) {
    console.error('Error extracting tweet ID:', e);
  }
  return null;
}

// ============================================
// INITIALIZATION
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting 3 seconds before first analysis...');
    setTimeout(analyzeFeed, 3000);
  });
} else {
  console.log('DOM already loaded, waiting 3 seconds before first analysis...');
  setTimeout(analyzeFeed, 3000);
}

let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    console.log('Scroll detected, analyzing new tweets...');
    analyzeFeed();
  }, 1500);
});

// Create sidebar NOW (at the end, after all functions are defined)
injectSidebar();