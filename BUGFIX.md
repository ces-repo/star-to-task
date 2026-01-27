# 🐛 BUGFIX - Version 1.0.3 ✅

## Danke für die Referenz! 🙏

Mit dem funktionierenden Add-on als Referenz konnte ich das Problem lösen!

## Was wurde gefixt?

### Problem 1-3: (Vorherige Versionen)
✅ ChromeUtils.import → ChromeUtils.importESModule  
✅ browser.notifications Permission hinzugefügt  
✅ Services.sys.mjs Import entfernt  

### Problem 4: cal.getCalendarManager is not a function ⚠️
**Fehler:**
```
TypeError: cal.getCalendarManager is not a function
```

**Ursache:**
Die Methode `cal.getCalendarManager()` existiert nicht so! 

**Richtige Methode (aus Calendar Auto Categories gelernt):**
```javascript
// FALSCH:
const { cal } = ChromeUtils.importESModule("...");
const calManager = cal.getCalendarManager(); // ❌

// RICHTIG:
const calManager = Cc["@mozilla.org/calendar/manager;1"]
  .getService(Ci.calICalendarManager); // ✅
```

Dann für Todo-Erstellung:
```javascript
const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
const todo = cal.createTodo(); // ✅
```

## ✅ Jetzt sollte es funktionieren!

Die richtige API-Verwendung wie im funktionierenden Add-on!

## 🔄 Update-Anleitung

### Wichtig: Saubere Neu-Installation

1. **Alte Version komplett entfernen:**
   - Add-ons → Star to Task → **Entfernen**
   
2. **Thunderbird NEU STARTEN** (wichtig!)

3. **Neue Version installieren:**
   - Add-ons → Zahnrad → Add-on aus Datei installieren
   - Wähle die neue **star-to-task.zip**

## 🧪 Test nach Installation

1. **Console öffnen:** Strg+Shift+J

2. **Stern setzen** bei einer E-Mail

3. **Erwartete Console-Ausgabe:**
   ```
   ✅ Star to Task extension loaded
   ✅ Star changed for message: X New value: true
   ✅ Task created successfully with ID: [UUID]
   ✅ Real Thunderbird task created: [UUID] for email: X
   ```

4. **Aufgaben öffnen:** Strg+Shift+D

5. **🎉 E-Mail sollte als Aufgabe sichtbar sein!**

## ❌ Diese Fehler sollten verschwunden sein:

```
ChromeUtils.import is not a function             ← WEG ✅
browser.notifications is undefined               ← WEG ✅
Failed to load Services.sys.mjs                  ← WEG ✅
cal.getCalendarManager is not a function         ← WEG ✅
```

## 📊 Version History

- **1.0.0:** Initiale Version (mit Bugs)
- **1.0.1:** ChromeUtils.import Fix
- **1.0.2:** Services.sys.mjs entfernt
- **1.0.3:** Calendar Manager API korrigiert ✅✅✅

## 💡 Was gelernt?

Durch das Referenz-Add-on (Calendar Auto Categories):
- Richtige Verwendung von `Cc["@mozilla.org/calendar/manager;1"]`
- Verwendung von `getService(Ci.calICalendarManager)`
- Todo-Erstellung mit `cal.createTodo()`

---

**Diese Version sollte jetzt wirklich funktionieren! 🚀**

Download und teste es nochmal!
