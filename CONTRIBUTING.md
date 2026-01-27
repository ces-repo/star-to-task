# Contributing to Star to Task

Thank you for your interest in contributing! 🎉

## 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Thunderbird version**
- **Add-on version**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Console logs** (Ctrl+Shift+J)
- **Screenshots** (if applicable)

## 💡 Suggesting Features

Feature suggestions are welcome! Please:

1. Check if the feature already exists
2. Search existing feature requests
3. Explain the use case clearly
4. Describe expected behavior

## 🔧 Development Setup

### Prerequisites
- Thunderbird 115+ installed
- Basic knowledge of JavaScript
- Understanding of WebExtensions

### Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/ces-repo/star-to-task.git
cd star-to-task
```

2. **Build the extension:**
```bash
./build.sh
```

3. **Install in Thunderbird:**
   - Open Thunderbird
   - Go to Add-ons (Ctrl+Shift+A)
   - Click gear icon → "Debug Add-ons"
   - Click "Load Temporary Add-on"
   - Select `manifest.json`

### Project Structure
```
star-to-task/
├── manifest.json          # Extension manifest
├── background.js          # Main WebExtension logic
├── experiment.js          # Calendar API access (XPCOM)
├── experiment-schema.json # Experiment API schema
├── options/
│   ├── options.html      # Settings page
│   └── options.js        # Settings logic
├── icons/                # Extension icons
└── build.sh             # Build script
```

## 📝 Coding Guidelines

### JavaScript Style
- Use ES6+ features
- Async/await for promises
- Clear variable names
- Comments for complex logic

### Example:
```javascript
/**
 * Creates a task from an email
 */
async function createTaskFromEmail(message) {
  try {
    // Load settings
    const settings = await browser.storage.local.get(['dueDateDays']);
    
    // Create task
    const taskId = await browser.StarToTaskAPI.createTask(
      title,
      description,
      dueDate
    );
    
    return taskId;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}
```

### Commit Messages
Use conventional commits format:

```
feat: Add context menu integration
fix: Resolve star removal timing issue
docs: Update README with new features
style: Format code with prettier
refactor: Simplify task creation logic
test: Add unit tests for observer
chore: Update dependencies
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Star email → Task created
- [ ] Unstar email → Task completed
- [ ] Complete task → Star removed
- [ ] Settings save correctly
- [ ] Works with multiple calendars
- [ ] No console errors

### Testing Scenarios
1. **Basic workflow:**
   - Star/unstar single email
   - Complete task in task list
   - Verify bidirectional sync

2. **Edge cases:**
   - Email without subject
   - Email without sender
   - Multiple starred emails
   - Rapid star/unstar clicks

3. **Settings:**
   - Change due date options
   - Change priority
   - Verify settings persist

## 🔍 Debugging

### Enable Debug Logging
Console logs are already included. View them:
- Press **Ctrl+Shift+J**
- Filter by "Star to Task" or "WebExtensions"

### Common Issues

**Tasks not syncing:**
- Check Calendar Observer is registered
- Verify Prefs are accessible
- Check 2-second polling is running

**Permission errors:**
- Verify all permissions in manifest.json
- Check messagesUpdate permission

## 📦 Pull Request Process

1. **Fork the repository**

2. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes:**
   - Follow coding guidelines
   - Add comments
   - Test thoroughly

4. **Commit your changes:**
```bash
git add .
git commit -m "feat: Add your feature"
```

5. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request:**
   - Clear title and description
   - Reference related issues
   - Include test results
   - Add screenshots if UI changes

### PR Review Process
- Code review by maintainers
- Automated checks must pass
- Changes may be requested
- Merge after approval

## 🎯 Areas Needing Help

Current priorities:
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation improvements
- [ ] Translations (i18n)
- [ ] Performance optimizations
- [ ] UI/UX enhancements

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 🤝 Community

- **GitHub Discussions:** For questions and ideas
- **GitHub Issues:** For bugs and features
- **Pull Requests:** For contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make Star to Task better for everyone!

---

Questions? Open an issue or discussion! 💬
