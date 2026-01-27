# Nächste Schritte für Star to Task

## Aktueller Stand

✅ **Basis-Struktur fertig**
- manifest.json
- background.js mit Event-Listener für Stern-Änderungen
- Storage-basierte Zuordnung Email <-> Task
- Benachrichtigungen

⚠️ **Einschränkung**: Thunderbird WebExtension API erlaubt NICHT das Erstellen von echten Tasks

## Option 1: Basis-Version testen (sofort einsetzbar)

### 1. Icons erstellen

Du brauchst zwei Icons (oder Platzhalter):

```bash
# Erstelle einfache Platzhalter-Icons (falls du kein Bildbearbeitungsprogramm hast)
cd star-to-task/icons

# Mit ImageMagick (falls installiert):
convert -size 48x48 xc:blue -pointsize 30 -fill white -gravity center -annotate +0+0 "⭐" icon-48.png
convert -size 96x96 xc:blue -pointsize 60 -fill white -gravity center -annotate +0+0 "⭐" icon-96.png

# Oder kopiere einfach irgendwelche 48x48 und 96x96 PNG-Dateien rein
```

### 2. manifest.json anpassen

Öffne `manifest.json` und ändere:

```json
"author": "Dein Name",
"applications": {
  "gecko": {
    "id": "star-to-task@deinedomain.com"
  }
}
```

### 3. Add-on laden

1. Öffne Thunderbird
2. **Menü** (☰) → **Add-ons und Themes**
3. Zahnrad ⚙️ → **Add-ons debuggen**
4. **Temporäres Add-on laden**
5. Wähle `manifest.json`

### 4. Testen

- Setze einen Stern bei einer Email
- Du solltest eine Benachrichtigung sehen
- Prüfe in der Browser-Konsole (Strg+Shift+J): "Task created for email: ..."

**Limitation**: Die Tasks werden nur im Speicher gehalten, nicht in Thunderbird's Task-Liste!

---

## Option 2: Experiment API für echte Tasks (fortgeschritten)

### Schritt 1: manifest.json erweitern

In `manifest.json` nach den `permissions` hinzufügen:

```json
"permissions": [
  "messagesRead",
  "accountsRead",
  "storage"
],
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

### Schritt 2: background.js anpassen

Ersetze die Funktionen `createTaskFromEmail` und `deleteTaskForEmail`:

```javascript
async function createTaskFromEmail(message) {
  try {
    const subject = message.subject || '(No Subject)';
    const from = message.author || 'Unknown';
    const date = new Date(message.date);
    
    const taskTitle = `📧 ${subject}`;
    const taskDescription = `From: ${from}\nDate: ${date.toLocaleString()}`;
    
    // Verwende Experiment API statt Storage
    const taskId = await browser.StarToTaskAPI.createTask(
      taskTitle,
      taskDescription,
      null
    );
    
    await saveEmailTaskMapping(message.id, {
      messageId: message.id,
      taskId: taskId,
      subject: subject,
      from: from,
      date: date.toISOString(),
      created: new Date().toISOString()
    });
    
    console.log('Task created in Thunderbird:', taskId);
    
    browser.notifications.create({
      type: 'basic',
      title: 'Star to Task',
      message: `Task created: ${subject}`
    });
    
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

async function deleteTaskForEmail(messageId) {
  try {
    const mapping = await getEmailTaskMapping(messageId);
    
    if (mapping && mapping.taskId) {
      // Lösche echte Task
      await browser.StarToTaskAPI.deleteTask(mapping.taskId);
      await removeEmailTaskMapping(messageId);
      
      console.log('Task deleted from Thunderbird:', mapping.taskId);
      
      browser.notifications.create({
        type: 'basic',
        title: 'Star to Task',
        message: `Task removed: ${mapping.subject}`
      });
    }
    
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}
```

### Schritt 3: Testen

- Lade das Add-on neu
- Setze einen Stern → Task sollte in Thunderbird's Task-Liste erscheinen!
- Entferne den Stern → Task verschwindet

---

## Option 3: Eigene Sidebar mit Task-Übersicht (alternative Lösung)

Falls die Experiment API zu komplex ist, kannst du eine eigene Sidebar erstellen:

### 1. manifest.json erweitern

```json
"sidebar_action": {
  "default_panel": "sidebar.html",
  "default_title": "Star to Task",
  "default_icon": "icons/icon-48.png"
}
```

### 2. sidebar.html erstellen

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Star to Task</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 10px;
    }
    .task {
      border: 1px solid #ccc;
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 5px;
    }
    .task-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .task-meta {
      font-size: 0.9em;
      color: #666;
    }
    button {
      margin-top: 5px;
      padding: 5px 10px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h2>📧 Starred Tasks</h2>
  <div id="taskList"></div>
  <script src="sidebar.js"></script>
</body>
</html>
```

### 3. sidebar.js erstellen

```javascript
async function loadTasks() {
  const result = await browser.storage.local.get('starredEmailTasks');
  const tasks = result.starredEmailTasks || {};
  
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  
  if (Object.keys(tasks).length === 0) {
    taskList.innerHTML = '<p>No starred emails yet.</p>';
    return;
  }
  
  for (const [messageId, task] of Object.entries(tasks)) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.innerHTML = `
      <div class="task-title">📧 ${task.subject}</div>
      <div class="task-meta">From: ${task.from}</div>
      <div class="task-meta">Date: ${new Date(task.date).toLocaleString()}</div>
      <button data-message-id="${messageId}">Complete & Remove Star</button>
    `;
    taskList.appendChild(taskDiv);
  }
  
  // Event-Listener für Complete-Buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const messageId = parseInt(e.target.dataset.messageId);
      // Entferne Stern von Email
      // (Hier müsstest du die Message-ID in eine echte Message umwandeln)
      await loadTasks();
    });
  });
}

// Lade Tasks beim Start
loadTasks();

// Aktualisiere bei Storage-Änderungen
browser.storage.onChanged.addListener(loadTasks);
```

Dann hast du deine eigene Task-Liste in der Sidebar!

---

## Empfehlung

**Start mit Option 1** (Basis-Version):
- ✅ Schnell zu testen
- ✅ Zeigt ob das Prinzip funktioniert
- ✅ Keine komplexe API

**Upgrade zu Option 2** (Experiment API):
- 🎯 Beste Lösung: Echte Tasks in Thunderbird
- ⚠️ Komplexer, braucht Debugging

**Alternative Option 3** (Sidebar):
- ✅ Gute User Experience
- ✅ Volle Kontrolle über UI
- ⚠️ Keine Integration mit Thunderbird's Task-System

---

## Debugging-Tipps

### Console öffnen
**Strg+Shift+J** oder **Menü → Extras → Entwicklerwerkzeuge → Fehlerkonsole**

### Häufige Fehler

**Problem**: "browser.messages.onUpdated is not a function"
**Lösung**: Thunderbird-Version prüfen (mind. 115.0 nötig)

**Problem**: Icons werden nicht angezeigt
**Lösung**: Prüfe ob die PNG-Dateien im icons/ Ordner liegen

**Problem**: Experiment API funktioniert nicht
**Lösung**: Prüfe Browser-Console auf Syntax-Fehler in experiment.js

---

Viel Erfolg! 🚀
