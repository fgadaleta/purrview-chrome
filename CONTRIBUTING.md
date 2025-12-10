# Contributing to PurrView

Thank you for your interest in contributing to PurrView! We're excited to have you as part of our community. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

## Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences
- Gracefully accept constructive criticism

We're building a tool that helps people understand diverse perspectives - let's model that in our community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/purrview-chrome.git
   cd purrview-chrome
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- Google Chrome or Chromium browser
- A text editor (VS Code, Sublime, etc.)
- Basic knowledge of JavaScript and Chrome Extension APIs
- An AI API key (Groq or OpenAI) for testing

### Loading the Extension for Development

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `purrview-chrome` directory
5. The extension should now appear in your toolbar

### Testing Changes

1. Make your code changes
2. Go back to `chrome://extensions/`
3. Click the refresh icon on the PurrView extension card
4. Navigate to X/Twitter to test your changes
5. Check the browser console (F12) for any errors

### Development Tools

- **Console Logging**: The extension uses `console.log()` extensively. Check:
  - Page console (F12 on X/Twitter)
  - Extension popup console (right-click popup → Inspect)
  - Background service worker console (chrome://extensions → "service worker")

- **Chrome Storage Inspector**:
  - Go to `chrome://extensions`
  - Find PurrView → "Details" → "Storage"
  - Or use: `chrome.storage.local.get(null, console.log)` in console

## How to Contribute

### Types of Contributions We're Looking For

- Bug fixes
- Feature implementations (see [Roadmap](README.md#roadmap))
- Documentation improvements
- Performance optimizations
- UI/UX enhancements
- Test coverage
- Accessibility improvements
- Internationalization (i18n)

### Areas That Need Help

- **Historic View Feature**: Calendar UI and data visualization
- **Multi-platform Support**: Reddit, Bluesky, Mastodon integrations
- **Performance**: Optimizing feed analysis speed
- **Testing**: Unit tests and integration tests
- **Documentation**: Tutorials, videos, better onboarding
- **Accessibility**: Screen reader support, keyboard navigation

## Coding Standards

### JavaScript Style

- Use modern ES6+ JavaScript
- Prefer `const` over `let`, avoid `var`
- Use descriptive variable names
- Add comments for complex logic
- Keep functions small and focused

### Example:

```javascript
// Good
async function extractTweetMetadata(tweetElement) {
  const author = extractAuthor(tweetElement);
  const text = extractTweetText(tweetElement);
  const isRetweet = checkIfRetweet(tweetElement);

  return { author, text, isRetweet };
}

// Avoid
async function doStuff(el) {
  let a = el.querySelector('[data-testid="User-Name"]');
  let b = el.querySelector('[data-testid="tweetText"]');
  // ... unclear intent
}
```

### Chrome Extension Best Practices

- Always handle `chrome.runtime.lastError`
- Use async/await for cleaner promise handling
- Minimize storage writes (batch when possible)
- Test with extension context invalidation scenarios
- Follow Manifest V3 guidelines

### CSS Guidelines

- Use class names prefixed with `feedlens-` or `purrview-`
- Support both light and dark themes
- Ensure mobile responsiveness
- Use semantic selectors

## Testing

### Manual Testing Checklist

Before submitting a PR, please test:

- [ ] Extension loads without errors
- [ ] Sidebar opens and closes properly
- [ ] Feed analysis works on X/Twitter
- [ ] Statistics update correctly
- [ ] Settings save and persist
- [ ] Dark mode toggle works
- [ ] Reset button clears data
- [ ] Works after browser restart
- [ ] No console errors
- [ ] Doesn't break X/Twitter functionality

### Browser Testing

Test on:
- Latest Chrome stable
- Latest Chrome beta (if possible)
- Chromium-based browsers (Edge, Brave, etc.)

### Creating Tests

We're working on adding automated tests. If you're interested in helping with test infrastructure, please reach out!

## Submitting Changes

### Commit Messages

Write clear, concise commit messages:

```
Add historic view calendar component

- Created calendar UI for daily feed metrics
- Added date range selector
- Implemented data aggregation by day
- Includes basic styling for light/dark modes

Relates to #123
```

Format:
- First line: Brief summary (50 chars or less)
- Blank line
- Detailed explanation if needed
- Reference related issues

### Pull Request Process

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Push your changes**:
   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request** on GitHub:
   - Use a descriptive title
   - Fill out the PR template
   - Reference any related issues
   - Add screenshots/videos for UI changes
   - Request review from maintainers

4. **Address review feedback**:
   - Make requested changes
   - Push updates to the same branch
   - Respond to reviewer comments

5. **Merge**:
   - Once approved, a maintainer will merge your PR
   - You can delete your branch after merge

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Comments added for complex logic
- [ ] Manual testing completed
- [ ] No console errors or warnings
- [ ] Documentation updated (if needed)
- [ ] README updated (if adding features)
- [ ] No breaking changes (or clearly documented)

## Feature Requests

Have an idea? We'd love to hear it!

1. Check [existing issues](https://github.com/yourusername/purrview-chrome/issues) first
2. Open a new issue with the "Feature Request" template
3. Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Why this would benefit users
   - Any implementation ideas

## Bug Reports

Found a bug? Help us fix it!

1. Check if it's already reported
2. Open a new issue with the "Bug Report" template
3. Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
   - Browser version and OS
   - Console errors (if any)

### Bug Report Template

```markdown
**Description**
A clear description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: Chrome 120.0.6099
- OS: macOS 14.1
- Extension Version: 1.0

**Console Errors**
```
Paste any console errors here
```
```

## Development Roadmap Contributions

Interested in tackling a roadmap feature? Here's how:

1. **Comment on the roadmap issue** expressing interest
2. **Discuss approach** with maintainers first
3. **Break it into smaller PRs** if it's a large feature
4. **Create a design doc** for significant features
5. **Regular updates** on progress

### Priority Features

See [README.md](README.md#roadmap) for details on:
- Historic View (needs calendar UI expert)
- Community Filter Bubble (needs backend design)
- Multi-platform Support (needs API integration expertise)
- Feed Rebalancing (needs ML/recommendation algorithm knowledge)

## Questions?

- Open a [Discussion](https://github.com/yourusername/purrview-chrome/discussions)
- Comment on relevant issues
- Reach out to maintainers

## Recognition

Contributors will be:
- Listed in our Contributors section
- Mentioned in release notes
- Credited in the extension's about page

## License

By contributing, you agree that your contributions will be licensed under the MIT License, the same license as the project.

---

Thank you for helping make PurrView better! Every contribution, no matter how small, makes a difference. 🐱
