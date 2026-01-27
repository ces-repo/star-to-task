# Installation & Test - Star to Task mit Experiment API

## ✅ Was jetzt aktiviert ist

Die **Experiment API** ist jetzt vollständig aktiviert! Das Add-on erstellt **echte Thunderbird-Aufgaben**.

## 📋 Voraussetzungen

1. **Thunderbird Version 115 oder höher**
   - Prüfe: Menü → Hilfe → Über Thunderbird
   
2. **Mindestens ein Kalender in Thunderbird**
   - Falls noch nicht vorhanden:
     - Rechtsklick auf "Kalender" im linken Bereich
     - "Neuer Kalender..."
     - "Auf diesem Computer" wählen
     - Name vergeben (z.B. "Aufgaben")
     - Fertig!

## 🚀 Installation

### Schritt 1: Dateien vorbereiten

Du hast bereits alle Dateien! Im Ordner `star-to-task`:
- ✅ manifest.json (mit Experiment API)
- ✅ background.js (verwendet Experiment API)
- ✅ experiment.js (echte Task-Erstellung)
- ✅ experiment-schema.json
- ✅ Icons

### Schritt 2: Add-on in Thunderbird laden

**Variante A: Temporär laden (für Tests)**

1. Öffne Thunderbird
2. **Menü** (☰) → **Add-ons und Themes**
3. Klicke auf das **Zahnrad** ⚙️ rechts oben
4. Wähle **"Add-ons debuggen"**
5. Klicke **"Temporäres Add-on laden"**
6. Navigiere zum `star-to-task` Ordner
7. Wähle die Datei **manifest.json**
8. ✅ Das Add-on wird geladen!

**Variante B: Permanent installieren**

1. Erstelle eine ZIP-Datei (falls nicht schon vorhanden):
   ```bash
   cd star-to-task
   zip -r star-to-task.zip *
   ```

2. In Thunderbird:
   - **Menü** → **Add-ons und Themes**
   - **Zahnrad** ⚙️ → **Add-on aus Datei installieren...**
   - Wähle `star-to-task.zip`

## 🧪 Testen

### Test 1: Aufgabe erstellen

1. Gehe zu deinen E-Mails
2. **Setze einen Stern** (★) bei einer beliebigen E-Mail
3. Du solltest eine **Benachrichtigung** sehen: "✅ Task created: [Betreff]"
4. Öffne die **Aufgaben-Ansicht** in Thunderbird:
   - Menü → Ansicht → Aufgaben
   - Oder: Strg+Shift+D
5. **Prüfe**: Die E-Mail sollte als Aufgabe erscheinen mit:
   - 📧 Email-Symbol + Betreff als Titel
   - From, Date und Email ID in der Beschreibung

### Test 2: Aufgabe löschen

1. **Entferne den Stern** von der E-Mail
2. Benachrichtigung: "✅ Task removed: [Betreff]"
3. **Prüfe**: Die Aufgabe ist aus der Aufgaben-Liste verschwunden

### Test 3: Mehrere E-Mails

1. Setze Sterne bei **3-5 E-Mails**
2. Alle sollten als Aufgaben erscheinen
3. Entferne selektiv Sterne
4. Die entsprechenden Aufgaben verschwinden

## 🐛 Debugging / Fehlersuche

### Browser-Console öffnen

**Strg+Shift+J** (Windows/Linux) oder **Cmd+Shift+J** (Mac)

Dort siehst du alle Logs vom Add-on:
- `Star to Task extension loaded` - Add-on wurde geladen
- `Star changed for message: ...` - Stern wurde geändert
- `Task created successfully with ID: ...` - Aufgabe erstellt
- `Task deleted successfully: ...` - Aufgabe gelöscht

### Häufige Probleme

#### Problem 1: "No writable calendar found"

**Lösung:**
1. Erstelle einen Kalender in Thunderbird (siehe Voraussetzungen)
2. Stelle sicher, dass der Kalender **nicht schreibgeschützt** ist
3. Lade das Add-on neu

#### Problem 2: Add-on lädt nicht

**Prüfe in der Console:**
- Syntax-Fehler in den JS-Dateien?
- Fehlende Dateien?

**Lösung:**
- Stelle sicher, dass alle Dateien im Ordner sind
- Prüfe, ob manifest.json korrekt formatiert ist (JSON Validator)

#### Problem 3: Benachrichtigung, aber keine Aufgabe

**Mögliche Ursachen:**
- Thunderbird-Version zu alt (< 115)
- Kalender ist schreibgeschützt
- Calendar-Module nicht geladen

**Lösung:**
- Prüfe Browser-Console auf Fehler
- Aktualisiere Thunderbird
- Erstelle einen neuen lokalen Kalender

#### Problem 4: Experiment API funktioniert nicht

**Prüfe in Browser-Console:**
```
Error: StarToTaskAPI is not defined
```

**Lösung:**
- Stelle sicher, dass `manifest.json` den `experiment_apis` Block enthält
- Prüfe, ob `experiment.js` und `experiment-schema.json` vorhanden sind
- Lade das Add-on neu

## 📊 Erfolgskriterien

✅ Das Add-on funktioniert perfekt, wenn:
1. Stern setzen → Aufgabe erscheint in Thunderbird's Task-Liste
2. Stern entfernen → Aufgabe verschwindet
3. Aufgaben-Details enthalten E-Mail-Informationen
4. Benachrichtigungen erscheinen

## 🔧 Erweiterte Konfiguration

### Anpassungen in background.js möglich:

**Aufgaben-Priorität ändern:**
In `experiment.js`, Zeile mit `todo.priority = 5;`:
- 1 = Hoch
- 5 = Mittel (Standard)
- 9 = Niedrig

**Fälligkeitsdatum automatisch setzen:**
In `background.js`, `createTaskFromEmail`:
```javascript
// Setze Fälligkeit auf morgen
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const taskId = await browser.StarToTaskAPI.createTask(
  taskTitle,
  taskDescription,
  tomorrow.toISOString() // <-- Fälligkeitsdatum
);
```

**E-Mail-Link in Beschreibung hinzufügen:**
In `background.js`:
```javascript
const taskDescription = `From: ${from}
Date: ${date.toLocaleString()}
Email ID: ${message.id}

Click to open: mid:${message.headerMessageId}`;
```

## 🎯 Nächste Features

Ideen für Erweiterungen:
- [ ] Optionen-Seite für Einstellungen
- [ ] Fälligkeitsdatum wählen beim Stern setzen
- [ ] Priorität basierend auf Absender
- [ ] Erinnerungen für wichtige E-Mails
- [ ] Sidebar mit Übersicht aller Tasks
- [ ] Rechtsklick-Menü "Als Aufgabe markieren"

## 💡 Tipps

**Workflow-Tipp:**
- Verwende Sterne für "Action Required"-Mails
- Normale Markierungen für "Later Read"
- Tags für Kategorien

**Keyboard Shortcut:**
- **S** = Stern setzen/entfernen (in Thunderbird's Mail-Ansicht)

## 📞 Support

Bei Problemen:
1. Prüfe Browser-Console (Strg+Shift+J)
2. Lies die Fehlermeldungen
3. Checke README.md und NEXT_STEPS.md
4. Falls immer noch Probleme: Issue auf GitHub oder E-Mail

---

**Viel Erfolg mit Star to Task! 🌟**
