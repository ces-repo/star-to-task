# Star to Task - Quick Reference

## 🚀 Schnellstart

```bash
# 1. In Thunderbird
Menü → Add-ons → Zahnrad → Add-on aus Datei installieren
→ Wähle: star-to-task.zip

# 2. Stelle sicher: Mindestens ein Kalender existiert
Rechtsklick auf "Kalender" → Neuer Kalender... → Auf diesem Computer

# 3. Fertig!
```

## ⭐ Verwendung

| Aktion | Ergebnis |
|--------|----------|
| **Stern setzen** (★) | ✅ Aufgabe wird erstellt |
| **Stern entfernen** | ❌ Aufgabe wird gelöscht |
| Aufgaben ansehen | Menü → Ansicht → Aufgaben (Strg+Shift+D) |

## 📋 Was passiert

**Bei Stern setzen:**
```
E-Mail: "Besprechung morgen um 10 Uhr"
Von: chef@firma.de
Datum: 27.01.2026 09:15

           ↓

Aufgabe: "📧 Besprechung morgen um 10 Uhr"
Beschreibung:
  From: chef@firma.de
  Date: 27.01.2026 09:15
  Original Email ID: 12345
```

## 🔍 Debugging

```bash
# Browser-Console öffnen
Strg+Shift+J (Windows/Linux)
Cmd+Shift+J (Mac)

# Erwartete Log-Meldungen:
✅ "Star to Task extension loaded"
✅ "Star changed for message: [ID] New value: true"
✅ "Task created successfully with ID: [UUID]"
✅ "Real Thunderbird task created: [UUID]"
```

## ❌ Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| "No writable calendar found" | Erstelle einen Kalender |
| Keine Benachrichtigungen | Prüfe Thunderbird-Benachrichtigungseinstellungen |
| Add-on lädt nicht | Prüfe Thunderbird-Version (min. 115) |
| Tasks erscheinen nicht | Prüfe Browser-Console auf Fehler |

## 🎯 Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| **S** | Stern setzen/entfernen |
| **Strg+Shift+D** | Aufgaben-Ansicht öffnen |
| **Strg+Shift+J** | Browser-Console (Debug) |

## 📁 Dateistruktur

```
star-to-task/
├── manifest.json           # Konfiguration + Experiment API
├── background.js           # Event-Listener (verwendet Experiment API)
├── experiment.js           # Echte Task-Erstellung
├── experiment-schema.json  # API-Schema
├── icons/
│   ├── icon-48.png
│   └── icon-96.png
├── INSTALLATION.md         # Detaillierte Anleitung
├── README.md               # Dokumentation
├── NEXT_STEPS.md           # Erweiterte Features
└── build.sh                # Build-Skript
```

## 🔧 Anpassungen

### Priorität ändern
**Datei:** `experiment.js`
**Zeile:** `todo.priority = 5;`

```javascript
todo.priority = 1;  // Hoch
todo.priority = 5;  // Mittel (Standard)
todo.priority = 9;  // Niedrig
```

### Fälligkeitsdatum setzen
**Datei:** `background.js`
**Funktion:** `createTaskFromEmail`

```javascript
// Fälligkeit: morgen
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const taskId = await browser.StarToTaskAPI.createTask(
  taskTitle,
  taskDescription,
  tomorrow.toISOString()  // <-- hier
);
```

### Task-Titel anpassen
**Datei:** `background.js`

```javascript
// Statt: const taskTitle = `📧 ${subject}`;
const taskTitle = `TODO: ${subject}`;
// Oder:
const taskTitle = `[Nachverfolgen] ${subject}`;
```

## 🔄 Neubauen nach Änderungen

```bash
cd star-to-task
./build.sh
# Oder manuell:
zip -r star-to-task.zip * -x "*.svg" "build.sh"
```

Dann in Thunderbird:
1. Altes Add-on entfernen (falls installiert)
2. Neues Add-on laden

## 📊 Status-Check

**Funktioniert das Add-on?**

✅ Stern setzen → Benachrichtigung erscheint  
✅ Aufgabe erscheint in Task-Liste  
✅ Stern entfernen → Aufgabe verschwindet  
✅ Browser-Console zeigt keine Fehler  

**Falls NEIN bei einem ✅:**
→ Siehe INSTALLATION.md → Debugging

## 🎓 Wichtige Konzepte

**Experiment API**
- Ermöglicht Zugriff auf Thunderbird's interne XPCOM-Komponenten
- Nötig für echte Task-Erstellung
- Ist im manifest.json aktiviert

**Storage**
- Speichert Zuordnung Email ↔ Task
- Ermöglicht Löschen der richtigen Task beim Stern-Entfernen

**Event-Listener**
- `messages.onUpdated` lauscht auf alle Änderungen an E-Mails
- Reagiert nur auf `flagged` (Stern) Änderungen

## 💡 Pro-Tipps

1. **Workflow:** Stern = "Heute erledigen"
2. **Filter:** Erstelle gefilterte Ansichten für Tasks
3. **Tags:** Kombiniere mit E-Mail-Tags für Kategorien
4. **Suche:** Tasks sind durchsuchbar wie normale Aufgaben

## 📞 Weitere Hilfe

- **INSTALLATION.md** - Schritt-für-Schritt-Anleitung
- **README.md** - Übersicht und Features
- **NEXT_STEPS.md** - Erweiterte Features und Optionen
- **Browser-Console** - Logs und Fehlermeldungen

---

**Version:** 1.0.0 mit Experiment API  
**Letzte Aktualisierung:** 27.01.2026
