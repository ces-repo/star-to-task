# 📦 Star to Task - Veröffentlichungs-Checkliste

## ✅ Vor der Veröffentlichung

### Code & Funktionalität
- [x] Task-Erstellung funktioniert
- [x] Task-Vervollständigung funktioniert  
- [x] Bidirektionale Synchronisation funktioniert
- [x] Einstellungsseite funktioniert
- [x] Alle Permissions korrekt
- [x] Keine Console-Errors mehr
- [x] Icons vorhanden

### Dokumentation
- [x] README.md erstellt
- [x] INSTALLATION.md vorhanden
- [x] Release Notes geschrieben
- [x] Changelog aktuell

### Metadaten
- [ ] Autor-Name anpassen (manifest.json Zeile 6)
- [ ] Extension-ID anpassen (falls gewünscht)
- [ ] Lizenz hinzufügen
- [ ] Screenshots erstellen

## 📝 Manifest Anpassungen

### Vor Upload zu addons.thunderbird.net:

```json
{
  "author": "Dein Name",  // ← ANPASSEN!
  "applications": {
    "gecko": {
      "id": "star-to-task@deine-domain.com"  // ← Optional anpassen
    }
  }
}
```

## 📸 Screenshots für Veröffentlichung

Erstelle folgende Screenshots:

1. **Main Feature** (1280x800)
   - E-Mail-Liste mit gesternten E-Mails
   - Aufgabenliste mit entsprechenden Tasks
   
2. **Settings Page** (1280x800)
   - Einstellungsseite mit allen Optionen
   
3. **Workflow Demo** (animated GIF)
   - Stern setzen → Task erscheint
   - Task abhaken → Stern verschwindet

4. **Task Details** (1280x800)
   - Task-Details mit E-Mail-Link

## 📋 addons.thunderbird.net Submission

### Required Information:

**Add-on Name:**
```
Star to Task
```

**Summary (50 chars):**
```
Convert starred emails to tasks - like Outlook!
```

**Description (500-1500 chars):**
```
Perfect for Outlook migrants! Star to Task automatically converts starred emails into tasks with full bidirectional synchronization.

Features:
• Star email → Task created automatically
• Complete task → Star removed automatically  
• Remove star → Task marked as completed
• Configurable due dates (today, tomorrow, 2-7 days, none)
• Customizable priority (high, medium, low)
• Email link in task description
• Works like Outlook's Follow-Up Flags

How it works:
1. Star any email (S key or click)
2. Task appears in your task list (Ctrl+Shift+D)
3. Complete task or remove star
4. Full sync maintained automatically

Requires Thunderbird 115+ with Calendar enabled.
```

**Version Notes (for v1.5.5):**
```
Production release with full bidirectional synchronization!

New in this version:
- Complete bidirectional sync (email ⇄ task)
- Calendar Observer for instant task completion detection
- Configurable settings (due date, priority)
- Professional icons
- Rock-solid stability

Technical improvements:
- Event-driven architecture with Calendar Observer
- Prefs-based communication
- 2-second sync interval
- Full Outlook feature parity
```

**Categories:**
- [ ] Productivity
- [ ] Email

**Tags:**
```
task, todo, outlook, follow-up, starred, flag, gtd, productivity
```

### Support Information:

**Support Email:**
```
[Deine E-Mail]
```

**Support Site:**
```
[Optional: Link zu Forum/GitHub]
```

**Homepage:**
```
[Optional: GitHub/Website]
```

## 🚀 Upload-Prozess

1. **Gehe zu:** https://addons.thunderbird.net/developers/
2. **Submit New Add-on**
3. **Upload:** star-to-task.zip (Version 1.5.5)
4. **Fill out form** (siehe oben)
5. **Upload Screenshots** (4 Stück)
6. **Submit for Review**

## ⏱️ Review-Prozess

- **Automatische Prüfung:** ~1-5 Minuten
- **Manuelle Prüfung:** 1-7 Tage (variabel)
- **Status checken:** Developer Dashboard

## 📧 Nach der Veröffentlichung

### Marketing
- [ ] Thunderbird Forum Post
- [ ] Reddit r/Thunderbird
- [ ] Optional: Blog Post
- [ ] Optional: Twitter/Mastodon

### Monitoring
- [ ] Check Reviews
- [ ] Monitor Download Stats
- [ ] Watch for Bug Reports
- [ ] Respond to User Feedback

## 🐛 Support-Vorbereitung

### Häufige Fragen vorbereiten:

1. **"Tasks not syncing"**
   → Check Calendar enabled, wait 2 seconds

2. **"Email link not working"**  
   → mid: protocol may not work on all systems

3. **"Can't find settings"**
   → Add-ons → Star to Task → Options (gear icon)

### Debug-Informationen anfragen:
- Thunderbird Version
- Console Logs (Ctrl+Shift+J)
- Steps to reproduce

## 📊 Success Metrics

Track:
- Download Count
- Active Daily Users (ADU)
- Review Rating
- User Feedback
- Bug Reports

## 🎯 Post-Launch Roadmap

### v1.6.0 (Optional Features):
- [ ] Context menu integration
- [ ] Toolbar button with quick options
- [ ] Sync with external task managers?
- [ ] Custom keyboard shortcuts

### v2.0.0 (Major Features):
- [ ] Multiple calendar support (choose calendar)
- [ ] Task categories based on email folders
- [ ] Recurring task support
- [ ] Advanced filtering rules

## ✅ Final Check

Vor dem Upload:
- [ ] Alle Tests durchgeführt
- [ ] README vollständig
- [ ] Screenshots erstellt
- [ ] Autor-Info angepasst
- [ ] Lizenz hinzugefügt
- [ ] Version 1.5.5 bestätigt
- [ ] Clean Build (keine Debug-Logs)

---

**Bereit für Veröffentlichung!** 🚀

Viel Erfolg! 🎉
