# 🎉 Star to Task v1.3.0 - Release mit Einstellungen!

## ✨ Neue Features

### 1. 🎨 Einstellungsseite
**Jetzt konfigurierbar!**

Zugriff: **Add-ons → Star to Task → Einstellungen**

**Verfügbare Optionen:**

#### Fälligkeitsdatum
- ☐ Heute (sofort fällig) - **Standard**
- ☐ Morgen
- ☐ In 2 Tagen
- ☐ In 3 Tagen
- ☐ In 1 Woche
- ☐ Keine Fälligkeit

#### Priorität
- ☐ Hoch
- ☐ Mittel - **Standard**
- ☐ Niedrig

### 2. 🎨 Neue Icons
Schöne neue Icons mit Stern und Checkmark!

## 🔧 Verbesserte Funktionalität

### Stern setzen (S):
```
✅ Task wird erstellt
✅ Mit deinen Einstellungen (Fälligkeit + Priorität)
✅ Erscheint in Thunderbird Aufgabenliste
✅ Mit Email-Link in Beschreibung
```

### Stern entfernen:
```
✅ Task wird als "Erledigt" markiert
✅ Bleibt im Kalender (wie Outlook)
✅ Zuordnung wird entfernt
```

## 📊 Was funktioniert jetzt perfekt:

- ✅ Task-Erstellung mit `adoptItem()`
- ✅ Task als erledigt markieren mit `modifyItem()`
- ✅ Einstellungen werden gespeichert
- ✅ Email-Link in Aufgabe (mid: Protocol)
- ✅ Fälligkeitsdatum anpassbar
- ✅ Priorität anpassbar

## 🚀 Installation

1. **Download** star-to-task.zip
2. **Thunderbird** → Add-ons (Strg+Shift+A)
3. **Zahnrad** → Add-on aus Datei installieren
4. **Einstellungen** anpassen (optional)
5. **Fertig!**

## 📖 Verwendung

### Erste Schritte:
1. **Einstellungen öffnen:** Add-ons → Star to Task → Einstellungen
2. **Fälligkeit wählen:** z.B. "Heute" für sofortige Tasks
3. **Priorität wählen:** z.B. "Mittel"
4. **Speichern**

### Tägliche Nutzung:
- **S drücken** oder **Stern klicken** → Task erstellt
- **S nochmal** oder **Stern entfernen** → Task erledigt

### Aufgaben anzeigen:
- **Strg+Shift+D** → Aufgabenliste öffnen
- Tasks sortiert nach Fälligkeit
- Überfällige Tasks in rot
- Erledigte Tasks mit Häkchen

## 🎯 Wie Outlook!

**Outlook:** Flag setzen → Follow-Up Task  
**Thunderbird + Star to Task:** Stern setzen → Task erstellt ⭐

Perfekt für den Umstieg von Outlook zu Thunderbird! 🎊

## 🐛 Bekannte Einschränkungen

- Tasks können nicht automatisch gelöscht werden (Thunderbird API Limitation)
- Stattdessen: Als erledigt markieren (sogar besser!)
- Email-Link (mid:) funktioniert möglicherweise nicht auf allen Systemen

## 📝 Version History

- **v1.3.0:** Einstellungsseite + neue Icons ✨
- **v1.2.0:** Als erledigt markieren statt löschen
- **v1.1.x:** Bugfixes für API-Probleme
- **v1.0.0:** Erste funktionierende Version

---

**Entwickelt mit ❤️ für alle Outlook → Thunderbird Umsteiger**

Feedback? Bugs? → Thunderbird Add-ons Support Forum

**Version:** 1.3.0  
**Datum:** 27.01.2026  
**Kompatibilität:** Thunderbird 115+
