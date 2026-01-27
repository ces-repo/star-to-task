# 🌟 Star to Task - Vollständige Übersicht

## 🎉 Herzlichen Glückwunsch!

Dein **Star to Task** Add-on ist **KOMPLETT** und **EINSATZBEREIT**!

Die Experiment API ist aktiviert → **Echte Thunderbird-Aufgaben** werden erstellt! 🚀

---

## 📦 Was du bekommst

### ✅ Funktionalität wie in Outlook

```
┌─────────────────────────────────────────────────┐
│  📧 E-Mail: "Meeting morgen 10 Uhr"            │
│  Von: chef@firma.de                             │
│  ⭐ [Stern setzen]                              │
└─────────────────────────────────────────────────┘
                    ↓
                    ↓ Automatisch
                    ↓
┌─────────────────────────────────────────────────┐
│  ✅ Thunderbird Aufgabe                         │
│  📧 Meeting morgen 10 Uhr                       │
│  From: chef@firma.de                            │
│  Date: 27.01.2026 09:15                         │
│  [ ] Erledigen                                  │
└─────────────────────────────────────────────────┘
```

**Stern entfernen** → Aufgabe verschwindet automatisch!

---

## 📁 Projektstruktur

```
star-to-task/
│
├── 🔧 Kern-Dateien (benötigt)
│   ├── manifest.json              ← Konfiguration mit Experiment API
│   ├── background.js              ← Event-Listener (nutzt Experiment API)
│   ├── experiment.js              ← ECHTE Task-Erstellung
│   ├── experiment-schema.json     ← API-Schema
│   └── icons/
│       ├── icon-48.png
│       └── icon-96.png
│
├── 📚 Dokumentation
│   ├── INSTALLATION.md            ← Start hier! Schritt-für-Schritt
│   ├── QUICK_REFERENCE.md         ← Schnellreferenz
│   ├── README.md                  ← Übersicht
│   └── NEXT_STEPS.md              ← Erweiterte Features
│
├── 🔨 Tools
│   └── build.sh                   ← Neubauen der ZIP-Datei
│
└── 📦 Installation
    └── star-to-task.zip           ← Fertig zur Installation!
```

---

## 🚀 Installation in 3 Schritten

### Schritt 1: Voraussetzung prüfen
```
✅ Thunderbird 115 oder höher
✅ Mindestens 1 Kalender erstellt
```

**Kalender erstellen (falls nötig):**
```
Rechtsklick auf "Kalender" (links)
→ "Neuer Kalender..."
→ "Auf diesem Computer"
→ Name: "Aufgaben"
→ Fertig!
```

### Schritt 2: Add-on installieren
```
Thunderbird öffnen
→ Menü (☰)
→ Add-ons und Themes
→ Zahnrad ⚙️
→ "Add-on aus Datei installieren..."
→ Wähle: star-to-task.zip
→ ✅ Fertig!
```

### Schritt 3: Testen
```
1. Gehe zu deinen E-Mails
2. Setze einen Stern (★) bei einer E-Mail
3. Benachrichtigung: "✅ Task created: [Betreff]"
4. Öffne Aufgaben (Strg+Shift+D)
5. 🎉 Deine E-Mail ist jetzt eine Aufgabe!
```

---

## 🎯 Verwendung

### Workflow

```
Posteingang durchgehen
    ↓
Braucht Aktion? → Stern setzen ⭐
    ↓
Erscheint in Aufgabenliste
    ↓
Erledigt? → Stern entfernen
    ↓
Aufgabe verschwindet automatisch
```

### Tastatur-Shortcuts

| Taste | Aktion |
|-------|--------|
| `S` | Stern setzen/entfernen |
| `Strg+Shift+D` | Aufgaben öffnen |
| `Strg+Shift+J` | Debug-Console |

---

## 🔍 Debugging

### Console öffnen
**Strg+Shift+J** (Windows/Linux) oder **Cmd+Shift+J** (Mac)

### Erwartete Log-Meldungen
```
✅ "Star to Task extension loaded"
✅ "Star changed for message: [ID] New value: true"
✅ "Task created successfully with ID: [UUID]"
✅ "Real Thunderbird task created: [UUID] for email: [ID]"
```

### Häufige Probleme

| Problem | Lösung |
|---------|--------|
| ❌ "No writable calendar found" | Erstelle einen Kalender |
| ❌ Keine Benachrichtigungen | Prüfe Benachrichtigungseinstellungen |
| ❌ Tasks erscheinen nicht | Prüfe Console auf Fehler |
| ❌ Experiment API Fehler | Thunderbird Version ≥ 115? |

---

## 🔧 Technische Details

### Experiment API aktiviert ✅

**In manifest.json:**
```json
"experiment_apis": {
  "StarToTaskAPI": {
    "schema": "experiment-schema.json",
    "parent": {
      "scopes": ["addon_parent"],
      "paths": [["StarToTaskAPI"]],
      "script": "experiment.js"
    }
  }
}
```

**Ermöglicht:**
- ✅ Direkte Task-Erstellung in Thunderbird
- ✅ Task-Löschung
- ✅ Task als erledigt markieren (completeTask)
- ✅ Zugriff auf Calendar-Manager

### Wie es funktioniert

```
1. Event-Listener (background.js)
   ↓
   messages.onUpdated → Stern geändert?
   ↓
2. Experiment API (experiment.js)
   ↓
   Calendar-Manager → createTask()
   ↓
3. Thunderbird
   ↓
   Aufgabe erscheint in Task-Liste
```

---

## 🎨 Anpassungen

### Task-Priorität ändern

**Datei:** `experiment.js`  
**Zeile:** ~75

```javascript
// Aktuell:
todo.priority = 5;  // Mittel

// Ändern zu:
todo.priority = 1;  // Hoch
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
  tomorrow.toISOString()  // ← hier
);
```

### Task-Titel anpassen

**Datei:** `background.js`  
**Zeile:** ~27

```javascript
// Aktuell:
const taskTitle = `📧 ${subject}`;

// Ändern zu:
const taskTitle = `TODO: ${subject}`;
const taskTitle = `[Action] ${subject}`;
const taskTitle = `⚡ ${subject}`;
```

### Nach Änderungen neu bauen

```bash
cd star-to-task
./build.sh
```

Dann in Thunderbird neu laden!

---

## 📊 Feature-Matrix

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| ⭐ Stern → Task | ✅ | Automatische Erstellung |
| ❌ Stern entfernen → Löschen | ✅ | Automatische Löschung |
| 📋 Thunderbird Integration | ✅ | Echte Tasks via Experiment API |
| 🔔 Benachrichtigungen | ✅ | Bei Erstellen/Löschen |
| 💾 Persistente Zuordnung | ✅ | Email ↔ Task Mapping |
| 📅 Fälligkeitsdatum | ⏳ | Manuell anpassbar |
| 🎯 Prioritäten | ⏳ | Manuell anpassbar |
| ⚙️ Optionen-UI | ⏳ | Zukünftiges Feature |
| 📱 Sidebar | ⏳ | Zukünftiges Feature |

✅ = Implementiert  
⏳ = Möglich durch Anpassung

---

## 💡 Nächste Schritte (Optional)

### Sofort möglich:
1. **Optionen-Seite** für Einstellungen hinzufügen
2. **Sidebar** mit Task-Übersicht erstellen
3. **Rechtsklick-Menü** "Als Aufgabe markieren"
4. **Automatische Fälligkeiten** basierend auf Absender

### Ideen für später:
- Erinnerungen für wichtige E-Mails
- Kategorien/Tags für Tasks
- Export von Tasks
- Synchronisation mit externen Tools

**Siehe:** `NEXT_STEPS.md` für Details

---

## 📚 Dokumentation

| Datei | Inhalt |
|-------|--------|
| **INSTALLATION.md** | Detaillierte Installationsanleitung |
| **QUICK_REFERENCE.md** | Schnellreferenz & Shortcuts |
| **README.md** | Projekt-Übersicht |
| **NEXT_STEPS.md** | Erweiterte Features & Optionen |

---

## 🎓 Was du gelernt hast

✅ Thunderbird WebExtension entwickeln  
✅ Experiment API für fortgeschrittene Features  
✅ Event-Listener für E-Mail-Änderungen  
✅ Calendar/Task API in Thunderbird  
✅ Browser Storage für Datenpersistenz  
✅ Add-on Packaging & Distribution  

---

## 🎉 Fazit

Du hast jetzt ein **voll funktionsfähiges** Thunderbird Add-on!

**Es macht genau das, was Outlook macht:**
- ⭐ Stern setzen → Aufgabe erstellen
- ❌ Stern entfernen → Aufgabe löschen
- 📋 Integration in Thunderbird's Task-System

**Und das Beste:**
Es ist DEIN Code, den du verstehst und anpassen kannst! 🚀

---

## 📞 Support

Bei Fragen:
1. Lies zuerst **INSTALLATION.md**
2. Prüfe **QUICK_REFERENCE.md**
3. Schaue in die Browser-Console (Strg+Shift+J)
4. Lies die Fehlermeldungen

---

**Viel Spaß mit Star to Task! 🌟**

*Version 1.0.0 - Experiment API Edition*  
*Erstellt: 27.01.2026*
