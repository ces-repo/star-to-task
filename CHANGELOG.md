# 🎉 Version 1.1.0 - Feature Update!

## ✨ Neue Features

### 1. 🔗 Email-Link in Aufgabe
**NEU:** Die Aufgabenbeschreibung enthält jetzt einen Link zur Original-Email!

```
From: sender@example.com
Date: 27.01.2026 20:40

🔗 Email öffnen: mid:message-id-here
```

**Hinweis:** Der `mid:` Link sollte die Email öffnen. Falls nicht, kannst du die Email ID verwenden.

### 2. 📅 Automatisches Fälligkeitsdatum
**NEU:** Aufgaben haben jetzt automatisch Fälligkeitsdatum = **morgen 23:59 Uhr**

Das ist wie in Outlook - du musst nicht mehr manuell ein Datum setzen!

### 3. 🔍 Besseres Logging
**NEU:** Detaillierte Console-Ausgaben für Debugging

```
✅ Task created successfully!
  Task ID: abc-123
  Email ID: 5
  Subject: Rechnung 125590
  Mapping saved to storage

🗑️ Deleting task for email: 5
  Mapping found: {...}
  Calling deleteTask with ID: abc-123
✅ Real Thunderbird task deleted: abc-123
  Mapping removed from storage
```

## 🐛 Was gefixt werden sollte

### Problem: Stern entfernen → Aufgabe bleibt

**Bitte teste nach Installation:**
1. Stern bei Email setzen → Aufgabe erstellt ✅
2. Stern entfernen → Aufgabe sollte verschwinden
3. Öffne Console (Strg+Shift+J)
4. Schicke mir die Logs!

Mit dem besseren Logging können wir jetzt sehen, warum das Löschen eventuell nicht funktioniert.

## 🔄 Installation

1. **Alte Version entfernen:**
   - Add-ons → Star to Task → Entfernen

2. **Thunderbird neu starten**

3. **Neue Version installieren:**
   - Download star-to-task.zip
   - Add-ons → Zahnrad → Add-on aus Datei installieren

## 📊 Version History

- **1.0.0-1.0.5:** Bugfixes für API-Probleme
- **1.1.0:** Feature-Update! ✨
  - Email-Link in Beschreibung
  - Automatisches Fälligkeitsdatum (morgen)
  - Besseres Logging

## 🧪 Test-Checklist

Nach Installation bitte testen:

- [ ] Stern setzen → Aufgabe wird erstellt
- [ ] Aufgabe hat Fälligkeitsdatum "morgen"
- [ ] Aufgabenbeschreibung zeigt "🔗 Email öffnen: mid:..."
- [ ] Stern entfernen → Aufgabe verschwindet (?)
- [ ] Console zeigt detaillierte Logs

---

**Version 1.1.0** - Feature Update  
**Datum:** 27.01.2026
