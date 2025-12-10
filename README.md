# 🐱 PurrView (Pickycat)

**Get your feed, like a picky cat**

PurrView is a Chrome extension that helps you understand the political orientation, sentiment, and quality of your X (Twitter) feed. Like a picky cat that carefully inspects everything, PurrView analyzes your social media diet and gives you insights into what you're consuming.

## Features

### Current Features

- **Political Bias Analysis**: Tracks the political orientation of posts in your feed (Left, Center, Right)
- **Sentiment Analysis**: Monitors emotional tone (Positive, Neutral, Negative)
- **Toxicity Detection**: Identifies potentially harmful content (Low, Medium, High toxicity)
- **Source Diversity Tracking**: Counts unique voices and distinguishes between original posts and retweets
- **Real-time Sidebar**: Floating sidebar that displays analytics as you browse
- **AI-Powered Analysis**: Supports multiple AI providers (Groq, OpenAI) for content analysis
- **X Account Integration**: Connect your X account for enhanced features
- **Dark Mode**: Toggle between light and dark themes
- **Persistent Statistics**: Your analytics are saved and persist across sessions

### Visual Analytics

- Political bias meter showing the balance of your feed
- Percentage breakdowns for each category
- Overall feed assessment
- Last updated timestamps

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/purrview-chrome.git
   cd purrview-chrome
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the extension directory

5. The PurrView icon should appear in your extensions toolbar

## Setup

### Getting an API Key

PurrView requires an AI API key to analyze content. We support:

1. **Groq** (Recommended - Fast and free tier available)
   - Visit [console.groq.com](https://console.groq.com)
   - Create an account and generate an API key
   - Keys start with `gsk_`

2. **OpenAI**
   - Visit [platform.openai.com](https://platform.openai.com)
   - Create an account and generate an API key
   - Keys start with `sk-`

### Configuration

1. Click the PurrView icon in your toolbar
2. Click "Options" or right-click → "Options"
3. Enable "Use AI for Analysis"
4. Select your AI provider
5. Paste your API key
6. (Optional) Enable "Connect X Account" for additional features
7. Click "Save Settings"

## Usage

1. Navigate to [x.com](https://x.com) or [twitter.com](https://twitter.com)
2. Log in to your account
3. The PurrView sidebar toggle button (🐱) will appear on the page
4. Click the cat icon to open the analytics sidebar
5. Scroll through your feed - PurrView automatically analyzes posts
6. Watch your feed statistics update in real-time

### Sidebar Controls

- **Theme Toggle (🌓)**: Switch between light and dark modes
- **Refresh**: Force re-analysis of visible posts
- **Reset**: Clear all statistics and start fresh

## How It Works

1. **Content Detection**: PurrView monitors your X feed as you scroll
2. **Text Extraction**: Captures post content while respecting privacy
3. **AI Analysis**: Sends content to your chosen AI provider for analysis
4. **Local Storage**: Stores aggregated statistics locally in your browser
5. **Visual Display**: Updates the sidebar with insights and trends

### Privacy

- All analysis is done using your personal API key
- Statistics are stored locally in your browser
- No data is sent to PurrView servers
- You control what gets analyzed

## Roadmap

We're continuously working to improve PurrView. Here's a preview of what's coming:

- 🗓️ **Historic View** - Calendar tracking of daily feed metrics and trends
- 🫧 **Community Filter Bubble** - Compare your feed with others (requires server support)
- 🔗 **Connect Other Social Networks** - Reddit, Bluesky, Mastodon support
- 🎯 **Feed Rebalancing Recommendations** - AI-powered suggestions to diversify your feed

For detailed feature descriptions, progress tracking, and contribution opportunities, see [ROADMAP.md](ROADMAP.md).

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to help improve PurrView.

## Technical Details

### Built With

- Vanilla JavaScript (no frameworks)
- Chrome Extension Manifest V3
- Chrome Storage API for persistence
- Content Scripts for page interaction
- AI APIs (Groq/OpenAI) for analysis

### File Structure

```
purrview-chrome/
├── manifest.json          # Extension configuration
├── content.js            # Main feed analysis logic
├── background.js         # Background service worker
├── popup.html/popup.js   # Extension popup interface
├── options.html/options.js # Settings page
├── sidebar.css           # Sidebar styling
├── auth.js              # Authentication handling
└── x-api.js             # X/Twitter API integration
```

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/purrview-chrome/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/purrview-chrome/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the open-source community
- AI analysis powered by Groq and OpenAI
- Inspired by the need for more mindful social media consumption

---

**Remember**: PurrView is a tool for awareness, not judgment. The goal is to help you understand and intentionally shape your information diet, just like a picky cat carefully chooses what to eat. 🐱
