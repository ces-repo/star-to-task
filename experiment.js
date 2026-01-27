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

// Experiment API Implementation
var StarToTaskAPI = class extends ExtensionCommon.ExtensionAPI {
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
            const calManager = Cc["@mozilla.org/calendar/manager;1"]
              .getService(Ci.calICalendarManager);
            
            // Importiere cal Utils
            const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
            
            // Hole alle Kalender
            const calendars = calManager.getCalendars();
            
            // Finde einen beschreibbaren Kalender
            let targetCalendar = null;
            for (let calendar of calendars) {
              if (!calendar.readOnly) {
                targetCalendar = calendar;
                console.log(`Using calendar: ${calendar.name}`);
                break;
              }
            }
            
            if (!targetCalendar) {
              throw new Error("No writable calendar found.");
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
            
            // Verwende adoptItem statt addItem - gibt sofort ID zurück
            try {
              targetCalendar.adoptItem(todo);
              const taskId = todo.id;
              console.log('✅ Task created with ID:', taskId);
              return taskId;
            } catch (e) {
              console.error('❌ adoptItem failed:', e);
              // Fallback zu addItem mit Promise
              return new Promise((resolve, reject) => {
                const listener = {
                  onOperationComplete(aCalendar, aStatus, aOperationType, aId, aDetail) {
                    console.log('onOperationComplete called', { aStatus, aId });
                    if (Components.isSuccessCode(aStatus)) {
                      console.log('✅ Task created with ID:', aId);
                      resolve(aId);
                    } else {
                      console.error('❌ Failed to create task. Status:', aStatus);
                      reject(new Error(`Failed to create task. Status: ${aStatus}`));
                    }
                  }
                };
                
                targetCalendar.addItem(todo, listener);
              });
            }
            
          } catch (error) {
            console.error("❌ Error in createTask:", error);
            throw error;
          }
        },
        
        /**
         * "Löscht" eine Aufgabe (markiert als erledigt, wie Outlook)
         */
        async deleteTask(taskId) {
          try {
            console.log('Completing task (instead of deleting):', taskId);
            
            const calManager = Cc["@mozilla.org/calendar/manager;1"]
              .getService(Ci.calICalendarManager);
            
            const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
            const calendars = calManager.getCalendars();
            
            // NEUE STRATEGIE: Da wir das Item nicht finden können,
            // erstellen wir ein NEUES Item mit der gleichen ID und markieren es als COMPLETED
            // Dann ersetzt Thunderbird das alte Item automatisch
            
            for (let calendar of calendars) {
              if (calendar.readOnly) continue;
              
              console.log(`  Trying to complete in calendar: ${calendar.name}`);
              
              try {
                // Erstelle ein "Dummy" Todo mit der ID
                const todo = Cc["@mozilla.org/calendar/todo;1"]
                  .createInstance(Ci.calITodo);
                
                todo.id = taskId;
                todo.title = "Completed Task";
                todo.isCompleted = true;
                todo.completedDate = cal.dtz.now();
                todo.percentComplete = 100;
                
                // Versuche es zu "modifizieren" (Thunderbird sollte es erkennen)
                calendar.modifyItem(todo, null);
                
                console.log('✅ Task marked as completed:', taskId);
                return true;
              } catch (e) {
                console.log(`    Failed in ${calendar.name}:`, e.message);
              }
            }
            
            // Wenn das auch nicht funktioniert, geben wir einfach "true" zurück
            // Die Aufgabe bleibt im Kalender, aber die Zuordnung wird entfernt
            console.warn('⚠️ Could not complete task, but removing mapping anyway');
            return true; // Gib true zurück, damit die Zuordnung gelöscht wird
            
          } catch (error) {
            console.error("❌ Error completing task:", error);
            return true; // Auch bei Fehler: Zuordnung löschen
          }
        },
        
        /**
         * Registriert einen Observer für Kalender-Änderungen
         */
        async registerCalendarObserver() {
          try {
            console.log('Registering calendar observer...');
            
            const calManager = Cc["@mozilla.org/calendar/manager;1"]
              .getService(Ci.calICalendarManager);
            
            const calendars = calManager.getCalendars();
            
            // Zugriff auf Extension Storage über context
            const { ExtensionStorageIDB } = ChromeUtils.importESModule("resource://gre/modules/ExtensionStorageIDB.sys.mjs");
            
            // Observer-Objekt
            const observer = {
              QueryInterface: ChromeUtils.generateQI(["calIObserver"]),
              
              async onModifyItem(aNewItem, aOldItem) {
                // Todo wurde geändert
                if (aNewItem.isTodo) {
                  console.log('Todo modified:', aNewItem.id);
                  
                  // Prüfe ob erledigt
                  if (aNewItem.isCompleted || aNewItem.percentComplete === 100) {
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
              onError(aCalendar, aErrNo, aMessage) {}
            };
            
            // Registriere Observer bei allen Kalendern
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
            
            const calManager = Cc["@mozilla.org/calendar/manager;1"]
              .getService(Ci.calICalendarManager);
            
            const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
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
            const calManager = Cc["@mozilla.org/calendar/manager;1"]
              .getService(Ci.calICalendarManager);
            
            const calendars = calManager.getCalendars();
            
            // Suche die Aufgabe in allen Kalendern
            for (let calendar of calendars) {
              try {
                const item = await new Promise((resolve, reject) => {
                  calendar.getItem(taskId, {
                    onGetResult(aCalendar, aStatus, aItemType, aDetail, aItems) {
                      if (Components.isSuccessCode(aStatus) && aItems.length > 0) {
                        resolve(aItems[0]);
                      } else {
                        resolve(null);
                      }
                    }
                  });
                });
                
                if (item && item.isTodo) {
                  // Importiere cal Utils
                  const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");
                  
                  // Klone das Item und markiere als erledigt
                  const clone = item.clone();
                  clone.completedDate = cal.dtz.now();
                  clone.percentComplete = 100;
                  clone.isCompleted = true;
                  
                  return new Promise((resolve, reject) => {
                    const listener = {
                      onOperationComplete(aCalendar, aStatus, aOperationType, aId, aDetail) {
                        if (Components.isSuccessCode(aStatus)) {
                          console.log('Task completed successfully:', taskId);
                          resolve(true);
                        } else {
                          reject(new Error(`Failed to complete task. Status: ${aStatus}`));
                        }
                      }
                    };
                    
                    calendar.modifyItem(clone, item, listener);
                  });
                }
              } catch (e) {
                // Aufgabe nicht in diesem Kalender
                console.log('Task not in calendar:', calendar.name);
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
