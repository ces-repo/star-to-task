# ⭐ Star to Task

**Thunderbird Add-on: Convert starred emails to tasks automatically - like Outlook's Follow-Up Flags!**

[![Thunderbird](https://img.shields.io/badge/Thunderbird-115%2B-0a84ff?style=flat&logo=thunderbird)](https://www.thunderbird.net/)
[![Version](https://img.shields.io/badge/version-1.6.6-blue)](https://github.com/ces-repo/star-to-task/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Perfect for users migrating from Outlook to Thunderbird who miss the follow-up flag functionality!

![Star to Task Demo](docs/images/demo.gif)

## ✨ Features

### 📧 → ✅ Email to Task Workflow
- **Star an email** (S key or click) → **Task created automatically**
- **Unstar an email** → **Task marked as completed**
- **Complete task in task list** → **Star removed from email automatically**

### 🔄 Bidirectional Synchronization
- Email ⇄ Task
- Star ⇄ Task Status  
- Full 2-way sync within 2 seconds!

### ⚙️ Customizable Settings
- **Due Date:** Today, Tomorrow, 2-7 days, or No due date
- **Priority:** High, Medium, or Low
- Configure once, use everywhere

### 📝 Rich Task Information
- 📧 Email subject as task title
- 👤 Sender information
- 📅 Email date
- 🔗 Link to open original email

## 🚀 Installation

### From Thunderbird Add-ons (Recommended)
1. Open Thunderbird
2. Go to **Add-ons** (Ctrl+Shift+A)
3. Search for "**Star to Task**"
4. Click **Install**

### Manual Installation
1. Download latest [star-to-task.xpi](https://github.com/ces-repo/star-to-task/releases/latest)
2. Open Thunderbird → **Add-ons** (Ctrl+Shift+A)
3. Click **⚙️ gear icon** → "Install Add-on From File"
4. Select the downloaded .xpi file
5. Restart Thunderbird

## 📖 Usage

### Quick Start
1. **Star an email** (press S or click star icon)
2. **Open task list** (Ctrl+Shift+D) - Task appears!
3. **Complete the task** → Star automatically removed
4. **Or remove star** → Task marked as completed

### Settings
Access settings: **Add-ons → Star to Task → Options (⚙️)**

**Available Settings:**
- **Due Date:**
  - Today (default) - immediate follow-ups
  - Tomorrow - next-day tasks
  - 2-7 days - longer-term planning
  - No due date - reference tasks

- **Priority:**
  - High - urgent items
  - Medium (default) - standard tasks
  - Low - nice-to-have items

### Keyboard Shortcuts
- **S** - Toggle star on selected email
- **Ctrl+Shift+D** - Open task list

## 🔧 How It Works

### Architecture
```
┌─────────────┐     Star      ┌──────────────┐
│   Email     │ ─────────────>│   Observer   │
│   (Starred) │               │   (detect)   │
└─────────────┘               └──────────────┘
       ↕                              │
  Bidirectional                       ↓
     Sync                    ┌──────────────┐
       ↕                     │ Calendar API │
┌─────────────┐              │ (adoptItem)  │
│    Task     │<─────────────└──────────────┘
│ (Calendar)  │
└─────────────┘
```

### Technology
- **Calendar Observer:** Detects task completion instantly
- **Experiment API:** Direct access to Thunderbird Calendar
- **Prefs Storage:** Fast inter-component communication
- **XPCOM:** Native Thunderbird integration

### Why Mark as Completed (Not Delete)?
Tasks are marked as **completed** instead of deleted:
- ✅ Preserves task history
- ✅ Maintains audit trail  
- ✅ Can review completed tasks
- ✅ Matches Outlook behavior

## 🆚 Comparison with Outlook

| Feature | Outlook | Star to Task |
|---------|---------|--------------|
| Flag email → Task | ✅ | ✅ |
| Complete task → Flag removed | ✅ | ✅ |
| Remove flag → Task completed | ✅ | ✅ |
| Customizable due dates | ✅ | ✅ |
| Priority settings | ✅ | ✅ |
| Open source | ❌ | ✅ |

**Result:** 100% feature parity! 🎯

## 📋 Requirements

- **Thunderbird 115+** (tested on 115-128)
- **Calendar enabled** (built-in)
- **At least one writable calendar**

## 🐛 Troubleshooting

### Tasks not appearing?
- Verify Calendar is enabled (Ctrl+Shift+D)
- Ensure you have a writable calendar
- Restart Thunderbird

### Star not being removed?
- Wait up to 2 seconds after completing task
- Check browser console for errors (Ctrl+Shift+J)
- Verify `messagesUpdate` permission is granted

### Settings not saving?
- Check storage permission is granted
- Try restarting Thunderbird
- Clear browser cache

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/ces-repo/star-to-task.git
cd star-to-task
./build.sh
```

### Testing
1. Load unpacked extension in Thunderbird
2. Test with various email types
3. Verify bidirectional sync
4. Check console for errors

## 📝 Version History

### v1.6.6 (2026-10-29)
- Compatible with Thunderbird 159

### v1.6.5 (2026-10-27)
- 🔗 Tasks stay linked to their email after it is moved to another folder or after a Thunderbird restart (linked via the Message-ID header instead of the internal message id). Previously such tasks could be deleted by mistake.
- 🛡️ A task is only removed when the email is found and no longer starred
- ♻️ No duplicate task when an email is starred again
- ✅ Completing a task also removes the star from moved emails
- 🧹 Calendar observer is unregistered cleanly on update/disable; much less console logging
- Thunderbird 158 compatibility (strict_max_version)

### v1.5.6 – v1.6.1
- Reconciliation of tasks whose star was removed on another computer (IMAP)
- Fixes for Thunderbird 128+ calendar API

### v1.5.5 (2026-01-27) - Production Release
- ✅ Full bidirectional synchronization
- ✅ Calendar Observer with prefs communication
- ✅ Configurable due dates and priorities
- ✅ Complete Outlook feature parity
- ✅ Professional icons

### v1.0.0-1.4.x - Development Versions
- Initial implementation
- API experimentation
- Various bug fixes
- Observer pattern implementation

[Full Changelog](CHANGELOG.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic's Claude** - Extensive debugging and development assistance
- **Thunderbird Community** - API documentation and support
- **Calendar Auto Categories** - API reference examples

## 🔗 Links

- [Thunderbird Add-ons](https://addons.thunderbird.net/thunderbird/addon/star-to-task/)
- [Report Issues](https://github.com/ces-repo/star-to-task/issues)
- [Discussions](https://github.com/ces-repo/star-to-task/discussions)
- [Releases](https://github.com/ces-repo/star-to-task/releases)

## 💬 Support

- **Issues:** [GitHub Issues](https://github.com/ces-repo/star-to-task/issues)
- **Discussions:** [GitHub Discussions](https://github.com/ces-repo/star-to-task/discussions)

## ⭐ Star This Repository

If you find this add-on useful, please give it a star on GitHub! It helps others discover it.

---

**Made with ❤️ for all Outlook → Thunderbird migrants!**

*Perfect for staying organized without missing important emails!* 🎯
