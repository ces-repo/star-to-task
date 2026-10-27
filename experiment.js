// experiment.js - Experiment API für direkte Task-Erstellung
// Diese Datei zeigt, wie man echte Thunderbird-Tasks erstellen könnte

/* 
WICHTIG: Experiment APIs sind für fortgeschrittene Entwicklung
Sie erfordern:
1. Zusätzliche Einträge in manifest.json
2. Zugriff auf Thunderbird's interne APIs (XPCOM)
3. Mehr Berechtigungen

Für manifest.json hinzufügen:

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
*/

var { ExtensionCommon } = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs");
var { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");

// Registrierter Kalender-Observer (wird beim Deaktivieren/Update wieder entfernt,
// sonst bleibt der alte Observer bis zum Thunderbird-Neustart aktiv)
let registeredObserver = null;

function removeCalendarObserver() {
  if (!registeredObserver) return;
  for (const calendar of cal.manager.getCalendars()) {
    try {
      calendar.removeObserver(registeredObserver);
    } catch (e) {
      // Kalender bereits entfernt
    }
  }
  registeredObserver = null;
}

// Experiment API Implementation
var StarToTaskAPI = class extends ExtensionCommon.ExtensionAPI {
  onShutdown(isAppShutdown) {
    if (isAppShutdown) return;
    removeCalendarObserver();
    // Damit nach einem Update die neue experiment.js geladen wird
    Services.obs.notifyObservers(null, "startupcache-invalidate");
  }

  getAPI(context) {
    return {
      StarToTaskAPI: {
        /**
         * Erstellt eine echte Thunderbird-Aufgabe
         */
        async createTask(title, description, dueDate, priority) {
          try {
            console.log('Creating task:', title);
            console.log('  Priority:', priority || 5);
            
            // Zugriff auf Calendar Manager
            const calManager = cal.manager;
            
            // Importiere cal Utils
            
            // Hole alle Kalender
            const calendars = calManager.getCalendars();
            
            // Finde einen beschreibbaren Kalender, der Tasks (VTODO) unterstützt
            let targetCalendar = null;
            for (let calendar of calendars) {
              if (calendar.readOnly) continue;
              if (calendar.getProperty("capabilities.tasks.supported") === false) {
                console.log(`  Skipping ${calendar.name}: does not support tasks`);
                continue;
              }
              targetCalendar = calendar;
              console.log(`Using calendar: ${calendar.name}`);
              break;
            }

            if (!targetCalendar) {
              throw new Error("No writable calendar with task support found.");
            }
            
            // Erstelle Todo-Item
            const todo = Cc["@mozilla.org/calendar/todo;1"]
              .createInstance(Ci.calITodo);
            
            todo.title = title;
            todo.entryDate = cal.dtz.now();
            
            // Beschreibung
            if (description) {
              todo.setProperty("DESCRIPTION", description);
            }
            
            // Fälligkeitsdatum (falls angegeben)
            if (dueDate) {
              const dueDateTime = cal.createDateTime();
              dueDateTime.nativeTime = new Date(dueDate).getTime() * 1000; // Microseconds
              todo.dueDate = dueDateTime;
            }
            
            // Priorität (aus Einstellungen oder Standard)
            todo.priority = priority || 5;
            
            console.log('Adding todo to calendar...');
            
            // adoptItem ist in TB 128+ asynchron und gibt das gespeicherte Item zurück
            const addedItem = await targetCalendar.adoptItem(todo);
            const taskId = (addedItem && addedItem.id) || todo.id;
            console.log('✅ Task created with ID:', taskId);
            return taskId;
            
          } catch (error) {
            console.error("❌ Error in createTask:", error);
            throw error;
          }
        },
        
        /**
         * Löscht eine Aufgabe wirklich aus dem Kalender.
         * Sucht den Task in schreibbaren, task-fähigen Kalendern und ruft deleteItem auf.
         */
        async deleteTask(taskId) {
          try {
            console.log('Deleting task:', taskId);

            const calendars = cal.manager.getCalendars();

            for (let calendar of calendars) {
              if (calendar.readOnly) continue;
              if (calendar.getProperty("capabilities.tasks.supported") === false) continue;

              let item = null;
              try {
                item = await calendar.getItem(taskId);
              } catch (e) {
                console.log(`  getItem failed in ${calendar.name}:`, e.message);
                continue;
              }

              if (!item) continue;

              console.log(`  Found task in calendar: ${calendar.name}`);
              try {
                await calendar.deleteItem(item);
                console.log('✅ Task deleted:', taskId);
                return true;
              } catch (e) {
                console.error(`  deleteItem failed in ${calendar.name}:`, e.message);
                return false;
              }
            }

            console.warn('⚠️ Task not found in any writable task calendar:', taskId);
            return true; // Zuordnung im Storage darf trotzdem weg
          } catch (error) {
            console.error("❌ Error deleting task:", error);
            return true;
          }
        },
        
        /**
         * Registriert einen Observer für Kalender-Änderungen
         */
        async registerCalendarObserver() {
          try {
            console.log('Registering calendar observer...');
            
            const calManager = cal.manager;
            
            const calendars = calManager.getCalendars();
            
            // Zugriff auf Extension Storage über context
            const { ExtensionStorageIDB } = ChromeUtils.importESModule("resource://gre/modules/ExtensionStorageIDB.sys.mjs");
            
            // Observer-Objekt
            const observer = {
              QueryInterface: ChromeUtils.generateQI(["calIObserver"]),
              
              async onModifyItem(aNewItem, aOldItem) {
                // Todo wurde geändert
                if (aNewItem.isTodo) {
                  // Nur Wechsel auf "erledigt" melden (nicht jede Sync-Änderung)
                  const wasCompleted = aOldItem && (aOldItem.isCompleted || aOldItem.percentComplete === 100);
                  if (!wasCompleted && (aNewItem.isCompleted || aNewItem.percentComplete === 100)) {
                    console.log('  → Todo is completed! Task ID:', aNewItem.id);
                    
                    // Schreibe in temporären Storage für background.js
                    try {
                      // Verwende Prefs Service direkt via XPCOM
                      const prefsService = Cc["@mozilla.org/preferences-service;1"]
                        .getService(Ci.nsIPrefService);
                      const prefs = prefsService.getBranch("extensions.star-to-task.");
                      
                      // Speichere completed task ID mit Timestamp
                      prefs.setStringPref(`completed.${Date.now()}`, aNewItem.id);
                      console.log('  → Saved to prefs');
                      
                    } catch (e) {
                      console.error('  Error saving to prefs:', e);
                    }
                  }
                }
              },
              
              async onDeleteItem(aDeletedItem) {
                // Todo wurde gelöscht - als erledigt behandeln
                if (aDeletedItem.isTodo) {
                  console.log('Todo deleted:', aDeletedItem.id);
                  
                  try {
                    const prefsService = Cc["@mozilla.org/preferences-service;1"]
                      .getService(Ci.nsIPrefService);
                    const prefs = prefsService.getBranch("extensions.star-to-task.");
                    prefs.setStringPref(`completed.${Date.now()}`, aDeletedItem.id);
                  } catch (e) {
                    console.error('Error saving to prefs:', e);
                  }
                }
              },
              
              // Andere Observer-Methoden (müssen vorhanden sein)
              onStartBatch() {},
              onEndBatch() {},
              onLoad() {},
              onAddItem(aItem) {},
              onError(aCalendar, aErrNo, aMessage) {},
              onPropertyChanged(aCalendar, aName, aValue, aOldValue) {},
              onPropertyDeleting(aCalendar, aName) {}
            };
            
            // Registriere Observer bei allen Kalendern
            removeCalendarObserver();
            registeredObserver = observer;
            for (let calendar of calendars) {
              calendar.addObserver(observer);
              console.log(`  Observer registered for: ${calendar.name}`);
            }
            
            console.log('✅ Calendar observer registered');
            return true;
            
          } catch (error) {
            console.error("❌ Error registering calendar observer:", error);
            return false;
          }
        },
        
        /**
         * Holt erledigte Task IDs und löscht sie aus den Prefs
         */
        async getCompletedTasks() {
          try {
            const prefsService = Cc["@mozilla.org/preferences-service;1"]
              .getService(Ci.nsIPrefService);
            const prefs = prefsService.getBranch("extensions.star-to-task.");
            
            const completedTaskIds = [];
            const childPrefs = prefs.getChildList("completed.");
            
            for (let prefName of childPrefs) {
              try {
                const taskId = prefs.getStringPref(prefName);
                completedTaskIds.push(taskId);
                
                // Lösche Pref nach dem Lesen
                prefs.clearUserPref(prefName);
              } catch (e) {
                // Pref existiert nicht mehr
              }
            }
            
            return completedTaskIds;
            
          } catch (error) {
            console.error("Error getting completed tasks:", error);
            return [];
          }
        },
        async isTaskCompleted(taskId) {
          try {
            console.log('Checking if task is completed:', taskId);
            
            const calManager = cal.manager;
            
            const calendars = calManager.getCalendars();
            
            console.log(`  Searching in ${calendars.length} calendar(s)...`);
            
            // Suche den Task in allen Kalendern
            for (let calendar of calendars) {
              console.log(`  Checking calendar: ${calendar.name}`);
              
              try {
                // Hole alle Todos (inkl. erledigte)
                const items = await calendar.getItemsAsArray(
                  Ci.calICalendar.ITEM_FILTER_TYPE_TODO |
                  Ci.calICalendar.ITEM_FILTER_COMPLETED_ALL,
                  0,
                  null,
                  null
                );
                
                console.log(`    Found ${items.length} todo(s)`);
                
                // Suche Task mit der ID
                const task = items.find(item => item.id === taskId);
                
                if (task) {
                  // Prüfe ob erledigt
                  const completed = task.isCompleted || task.percentComplete === 100;
                  console.log(`    ✅ Task found! Completed: ${completed}, percentComplete: ${task.percentComplete}, isCompleted: ${task.isCompleted}`);
                  return completed;
                } else {
                  console.log(`    Task ${taskId} not in this calendar`);
                }
              } catch (e) {
                console.error(`    Error in calendar ${calendar.name}:`, e.message);
              }
            }
            
            // Task nicht gefunden = wahrscheinlich gelöscht = als erledigt betrachten
            console.log('  ⚠️ Task not found in any calendar');
            return false;
            
          } catch (error) {
            console.error("❌ Error checking if task is completed:", error);
            return false;
          }
        },
        
        /**
         * Markiert eine Aufgabe als erledigt
         */
        async completeTask(taskId) {
          try {
            // Zugriff auf Calendar Manager - die RICHTIGE Methode
            const calManager = cal.manager;
            
            const calendars = calManager.getCalendars();
            
            // Suche die Aufgabe in allen schreibbaren, task-fähigen Kalendern
            for (let calendar of calendars) {
              if (calendar.readOnly) continue;
              if (calendar.getProperty("capabilities.tasks.supported") === false) continue;

              let item = null;
              try {
                item = await calendar.getItem(taskId);
              } catch (e) {
                console.log(`  getItem failed in ${calendar.name}:`, e.message);
                continue;
              }

              if (!item || !item.isTodo) continue;

              const clone = item.clone();
              clone.completedDate = cal.dtz.now();
              clone.percentComplete = 100;
              clone.isCompleted = true;

              try {
                await calendar.modifyItem(clone, item);
                console.log('Task completed successfully:', taskId);
                return true;
              } catch (e) {
                console.error(`  modifyItem failed in ${calendar.name}:`, e.message);
                return false;
              }
            }

            console.warn('Task not found in any calendar:', taskId);
            return false;
            
          } catch (error) {
            console.error("Error completing task:", error);
            throw error;
          }
        }
      }
    };
  }
};

// ANLEITUNG ZUR VERWENDUNG IN background.js:
/*

// Statt der Storage-basierten Lösung:
async function createTaskFromEmail(message) {
  try {
    const subject = message.subject || '(No Subject)';
    const from = message.author || 'Unknown';
    const date = new Date(message.date);
    
    const taskTitle = `📧 ${subject}`;
    const taskDescription = `From: ${from}\nDate: ${date.toLocaleString()}`;
    
    // Verwende Experiment API
    const taskId = await browser.StarToTaskAPI.createTask(
      taskTitle,
      taskDescription,
      null // kein Fälligkeitsdatum
    );
    
    // Speichere die Zuordnung
    await saveEmailTaskMapping(message.id, {
      messageId: message.id,
      taskId: taskId,
      subject: subject,
      from: from,
      date: date.toISOString()
    });
    
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

async function deleteTaskForEmail(messageId) {
  try {
    const mapping = await getEmailTaskMapping(messageId);
    
    if (mapping && mapping.taskId) {
      await browser.StarToTaskAPI.deleteTask(mapping.taskId);
      await removeEmailTaskMapping(messageId);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

*/
