# Star to Task - Thunderbird Add-on

Automatische Aufgabenverwaltung für mit Stern markierte E-Mails - wie Outlook's Follow-Up Flags!

## Features

- ⭐ **Stern setzen** → Aufgabe wird automatisch erstellt
- ✅ **Stern entfernen** → Aufgabe wird automatisch gelöscht
- 🔔 Benachrichtigungen bei Aufgaben-Erstellung/-Löschung
- 💾 Speichert Zuordnung zwischen E-Mails und Aufgaben

## Installation

### Methode 1: Entwicklermodus (für Tests)

1. Öffne Thunderbird
2. Gehe zu **Menü** (☰) → **Add-ons und Themes** → **Erweiterungen**
3. Klicke auf das Zahnrad ⚙️ → **Add-on aus Datei installieren...**
4. Wähle die Datei `star-to-task.zip` (siehe unten wie man sie erstellt)

### Methode 2: Temporäres Laden (für Entwicklung)

1. Öffne Thunderbird
2. Gehe zu **Menü** → **Add-ons und Themes**
3. Klicke auf das Zahnrad ⚙️ → **Add-ons debuggen**
4. Klicke **Temporäres Add-on laden**
5. Navigiere zum Ordner und wähle `manifest.json`

## ZIP-Datei erstellen

```bash
cd star-to-task
zip -r ../star-to-task.zip *
```

## Verwendung

1. Setze einen **Stern** (★) bei einer E-Mail → Aufgabe wird erstellt
2. Entferne den **Stern** → Aufgabe wird gelöscht
3. Benachrichtigungen zeigen dir, was passiert ist

## Technische Details

### Wichtige Einschränkung

⚠️ **Thunderbird's Task API ist limitiert!**

Die aktuelle Thunderbird WebExtension API erlaubt:
- ✅ Lesen von Aufgaben
- ❌ **NICHT** Erstellen/Ändern/Löschen von Aufgaben

### Was das Add-on macht

Da die Task API limitiert ist, speichert das Add-on die Zuordnungen in:
- `browser.storage.local` (interne Speicherung)
- Zeigt Benachrichtigungen an

### Nächste Schritte für volle Funktionalität

Um echte Aufgaben zu erstellen, gibt es mehrere Optionen:

1. **Experiment API verwenden** (fortgeschritten)
   - Direkter Zugriff auf Thunderbird's interne XPCOM-Komponenten
   - Ermöglicht echte Aufgabenerstellung

2. **Auf API-Updates warten**
   - Thunderbird entwickelt die WebExtension API weiter
   - Zukünftige Versionen könnten Task-Erstellung erlauben

3. **Alternative: Sidebar mit Task-Liste**
   - Eigene UI für Tasks in einer Sidebar
   - Vollständige Kontrolle über Darstellung und Verwaltung

## Dateien

```
star-to-task/
├── manifest.json          # Add-on Konfiguration
├── background.js          # Hauptlogik
├── icons/
│   ├── icon-48.png       # Icon (48x48)
│   └── icon-96.png       # Icon (96x96)
└── README.md             # Diese Datei
```



## Lizenz

MIT

## Support

Bei Fragen oder Problemen: GitHub Issues
