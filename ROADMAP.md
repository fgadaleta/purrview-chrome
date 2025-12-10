# PurrView Roadmap

This document outlines the planned features and enhancements for PurrView. Check back regularly to see our progress!

## Current Status

- [x] Political bias analysis (Left, Center, Right)
- [x] Sentiment analysis (Positive, Neutral, Negative)
- [x] Toxicity detection (Low, Medium, High)
- [x] Source diversity tracking
- [x] Real-time sidebar analytics
- [x] Dark mode support
- [x] Persistent statistics
- [x] Multi-AI provider support (Groq, OpenAI)

## Upcoming Features

### 🗓️ Historic View
**Status**: Planning

A calendar-based view that tracks your feed's characteristics over time, helping you understand long-term trends in your information diet.

**Features**:
- [ ] Calendar UI component for daily feed metrics
- [ ] Daily average political orientation tracking
- [ ] Sentiment and toxicity patterns over weeks/months
- [ ] Time-series visualizations
- [ ] Compare different time periods (week-to-week, month-to-month)
- [ ] Export historical data (CSV/JSON)
- [ ] Heatmap view for quick pattern recognition
- [ ] Monthly summary reports
- [ ] Data retention settings (30/60/90 days, unlimited)

**Why it matters**: Understanding how your feed evolves over time helps you make more informed decisions about your social media consumption patterns.

---

### 🫧 Community Filter Bubble
**Status**: Planning *(requires server support)*

Understand and compare your information ecosystem with privacy-preserving aggregate comparisons.

**Features**:
- [ ] Backend infrastructure for anonymous aggregation
- [ ] Privacy-preserving data collection (differential privacy)
- [ ] Compare your feed metrics to community averages
- [ ] Identify potential echo chambers
- [ ] Discover communities with different perspectives
- [ ] Filter bubble score (0-100)
- [ ] Anonymized cohort comparisons
- [ ] Opt-in community benchmarking
- [ ] Geographic and demographic cohorts (optional)
- [ ] Privacy dashboard showing what data is shared

**Why it matters**: Seeing how your feed compares to others helps identify blind spots and echo chambers you might not notice on your own.

**Technical Requirements**:
- Secure backend API
- Data anonymization pipeline
- Privacy compliance (GDPR, CCPA)
- User consent management

---

### 🔗 Connect Other Social Networks
**Status**: Planning

Expand analysis beyond X/Twitter to give you a complete picture of your social media diet.

**Platforms to Support**:
- [ ] Reddit
  - [ ] Subreddit feed analysis
  - [ ] Comment thread analysis
  - [ ] Multi-reddit support
- [ ] Bluesky
  - [ ] Feed analysis
  - [ ] Custom feed algorithm comparison
  - [ ] List analysis
- [ ] Mastodon
  - [ ] Instance-specific analysis
  - [ ] Federated timeline support
  - [ ] List and hashtag tracking
- [ ] LinkedIn (consideration)
  - [ ] Professional content analysis
  - [ ] Industry perspective tracking
- [ ] Threads (consideration)
  - [ ] Feed analysis
  - [ ] Cross-platform comparison with Instagram

**Cross-Platform Features**:
- [ ] Unified dashboard for all platforms
- [ ] Cross-platform comparisons
- [ ] Aggregate statistics
- [ ] Platform-specific insights
- [ ] Export combined data
- [ ] Platform switching quick toggle

**Why it matters**: Most people consume content across multiple platforms. A holistic view helps you understand your complete information ecosystem.

---

### 🎯 Feed Rebalancing Recommendations
**Status**: Planning

AI-powered suggestions to help you intentionally diversify your information diet and reduce echo chamber effects.

**Features**:
- [ ] AI-powered account recommendations
- [ ] Balance target customization
  - [ ] Set desired political balance (e.g., 40-20-40)
  - [ ] Sentiment targets
  - [ ] Toxicity thresholds
- [ ] Smart following suggestions
  - [ ] Quality sources from underrepresented perspectives
  - [ ] Topic-matched diverse voices
  - [ ] Credibility scoring
- [ ] Content discovery from different viewpoints
- [ ] Weekly rebalancing report
- [ ] "Bridge builder" account suggestions (accounts that engage across divides)
- [ ] One-click follow/unfollow recommendations
- [ ] A/B testing: track impact of following new sources
- [ ] Mute/unfollow suggestions for toxic accounts
- [ ] Save and track recommendation lists

**Recommendation Algorithm**:
- [ ] Political orientation matching
- [ ] Topic relevance scoring
- [ ] Engagement quality metrics
- [ ] Source credibility assessment
- [ ] Diversity scoring

**Why it matters**: Awareness is the first step, but actionable recommendations help you actually rebalance your feed to match your goals.

---

## Future Considerations

These are ideas we're exploring but haven't fully committed to yet:

- [ ] Browser integration (Firefox, Safari, Edge)
- [ ] Mobile app (iOS, Android)
- [ ] Team/organization accounts (for newsrooms, educators)
- [ ] API for researchers
- [ ] Customizable bias categories beyond Left-Center-Right
- [ ] Topic-specific analysis (climate, economics, etc.)
- [ ] Fact-check integration
- [ ] Media literacy resources
- [ ] Educational mode for teaching critical consumption
- [ ] Gamification for balanced consumption

## Contributing to the Roadmap

Interested in working on a roadmap feature?

1. Check the feature's current status
2. Read the detailed requirements
3. Comment on or create a related GitHub issue
4. Discuss your approach with maintainers
5. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines

## Timeline

We don't provide specific timelines, as this is a community-driven project. Features will be completed as contributors have time and interest. Want to accelerate a feature? Consider contributing!

## Feedback

Have suggestions for the roadmap?
- Open a [Feature Request](https://github.com/yourusername/purrview-chrome/issues/new?template=feature_request.md)
- Join the [Discussion](https://github.com/yourusername/purrview-chrome/discussions)

---

Last updated: 2025-12-10
