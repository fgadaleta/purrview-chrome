// Popup script - handles dashboard UI
console.log('Popup loaded');

// Load stats when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadStats();

  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeFeed' }, (response) => {
        console.log('Refresh triggered:', response);
        // Reload stats after a delay
        setTimeout(loadStats, 2000);
      });
    });
  });

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Reset all statistics?')) {
      chrome.storage.local.set({
        biasStats: { left: 0, center: 0, right: 0, total: 0 }
      }, () => {
        loadStats();
      });
    }
  });

  // Auto-refresh stats every 3 seconds
  setInterval(loadStats, 3000);
});

// Load and display statistics
function loadStats() {
  chrome.storage.local.get(['biasStats'], (result) => {
    const stats = result.biasStats || { left: 0, center: 0, right: 0, total: 0 };

    console.log('Loaded stats:', stats);

    // Update counts
    document.getElementById('leftCount').textContent = stats.left || 0;
    document.getElementById('centerCount').textContent = stats.center || 0;
    document.getElementById('rightCount').textContent = stats.right || 0;
    document.getElementById('totalCount').textContent = stats.total || 0;

    // Calculate percentages
    if (stats.total > 0) {
      const leftPct = ((stats.left / stats.total) * 100).toFixed(1);
      const centerPct = ((stats.center / stats.total) * 100).toFixed(1);
      const rightPct = ((stats.right / stats.total) * 100).toFixed(1);

      document.getElementById('leftPercent').textContent = leftPct + '%';
      document.getElementById('centerPercent').textContent = centerPct + '%';
      document.getElementById('rightPercent').textContent = rightPct + '%';

      // Update bias meter
      updateBiasMeter(stats);

      // Update assessment
      updateAssessment(stats);
    } else {
      document.getElementById('leftPercent').textContent = '0%';
      document.getElementById('centerPercent').textContent = '0%';
      document.getElementById('rightPercent').textContent = '0%';
      document.getElementById('assessment').textContent = 'No posts analyzed yet. Scroll your X feed!';
    }

    // Update last updated time
    if (stats.lastUpdated) {
      const time = new Date(stats.lastUpdated).toLocaleTimeString();
      document.getElementById('lastUpdated').textContent = `Last updated: ${time}`;
    }
  });
}

// Update the visual bias meter
function updateBiasMeter(stats) {
  const total = stats.total;
  if (total === 0) return;

  // Calculate bias score: -100 (far left) to +100 (far right)
  const score = ((stats.right - stats.left) / total) * 100;

  // Position meter (0-100 scale where 50 is center)
  const position = 50 + (score / 2); // Convert -100/+100 to 0-100

  const meterFill = document.getElementById('meterFill');
  meterFill.style.left = position + '%';
}

// Update assessment text
function updateAssessment(stats) {
  const total = stats.total;
  if (total < 5) {
    document.getElementById('assessment').textContent =
      'Analyzing... need more posts for accurate assessment.';
    return;
  }

  const leftPct = (stats.left / total) * 100;
  const centerPct = (stats.center / total) * 100;
  const rightPct = (stats.right / total) * 100;

  let assessment = '';

  if (Math.abs(leftPct - rightPct) < 15 && centerPct > 20) {
    assessment = '✅ Your feed appears balanced with diverse perspectives.';
  } else if (leftPct > 60) {
    assessment = '⚠️ Your feed leans strongly left. Consider following diverse sources.';
  } else if (rightPct > 60) {
    assessment = '⚠️ Your feed leans strongly right. Consider following diverse sources.';
  } else if (leftPct > 45) {
    assessment = '📊 Your feed leans moderately left.';
  } else if (rightPct > 45) {
    assessment = '📊 Your feed leans moderately right.';
  } else {
    assessment = '📊 Your feed shows moderate balance.';
  }

  document.getElementById('assessment').textContent = assessment;
}
