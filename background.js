// Star to Task - Background Script
// Verfolgt Stern-Änderungen und erstellt/löscht Aufgaben

// Storage-Schlüssel für die Zuordnung Email ID <-> Task ID
const STORAGE_KEY = 'starredEmailTasks';

// Initialisierung
browser.messages.onUpdated.addListener(async (message, changedProperties) => {
  // Reagiere nur auf Stern-Änderungen
  if (changedProperties.flagged !== undefined) {
    console.log('Star changed for message:', message.id, 'New value:', changedProperties.flagged);
    
    // Die interne message.id ändert sich beim Verschieben oder nach einem Neustart,
    // daher die Zuordnung zusätzlich über den Message-ID-Header suchen
    const found = await findMappingForMessage(message);

    if (changedProperties.flagged) {
      if (found) {
        // Für diese E-Mail gibt es schon eine Aufgabe -> keine zweite erstellen
        console.log('  Task already exists for this email:', found.mapping.taskId);
        await rekeyMapping(found.key, message.id);
        return;
      }
      // Stern wurde gesetzt -> Aufgabe erstellen
      await createTaskFromEmail(message);
    } else {
      // Stern wurde entfernt -> Aufgabe löschen
      await deleteTaskForEmail(found ? found.key : message.id);
    }
  }
});

/**
 * Erstellt eine Aufgabe aus einer E-Mail
 */
async function createTaskFromEmail(message) {
  try {
    // Lade Einstellungen
    const settings = await browser.storage.local.get(['dueDateDays', 'priority']);
    const dueDateDays = settings.dueDateDays !== undefined ? settings.dueDateDays : 0; // Standard: heute
    const priority = settings.priority !== undefined ? settings.priority : 5; // Standard: mittel
    
    console.log('Using settings:', { dueDateDays, priority });
    
    // Extrahiere relevante Daten
    const subject = message.subject || '(No Subject)';
    const from = message.author || 'Unknown';
    const date = new Date(message.date);
    
    // Hole vollständige Message-Details für Message-ID Header
    let messageIdHeader = message.headerMessageId || null;
    if (!messageIdHeader) {
      const fullMessage = await browser.messages.getFull(message.id);
      messageIdHeader = fullMessage.headers['message-id'] ? fullMessage.headers['message-id'][0] : null;
    }
    
    // Erstelle Aufgabentitel und Beschreibung mit Email-Link
    const taskTitle = `📧 ${subject}`;
    let taskDescription = `From: ${from}\nDate: ${date.toLocaleString()}\n\nOriginal Email ID: ${message.id}`;
    
    // Füge Email-Link hinzu (mid: Protocol zum Öffnen der Email)
    if (messageIdHeader) {
      // Entferne < > falls vorhanden
      const cleanMessageId = messageIdHeader.replace(/[<>]/g, '');
      taskDescription += `\n\n🔗 Email öffnen: mid:${cleanMessageId}`;
    }
    
    // Fälligkeitsdatum basierend auf Einstellungen
    let dueDate = null;
    if (dueDateDays >= 0) {
      const due = new Date();
      due.setDate(due.getDate() + dueDateDays);
      due.setHours(23, 59, 0, 0);
      dueDate = due.toISOString();
    }
    // dueDateDays === -1 bedeutet: keine Fälligkeit
    
    // Erstelle ECHTE Thunderbird-Aufgabe via Experiment API
    const taskId = await browser.StarToTaskAPI.createTask(
      taskTitle,
      taskDescription,
      dueDate,
      priority
    );
    
    console.log('✅ Task created successfully!');
    console.log('  Task ID:', taskId);
    console.log('  Email ID:', message.id);
    console.log('  Subject:', subject);
    
    // Speichere die Zuordnung inkl. Task-ID
    await saveEmailTaskMapping(message.id, {
      messageId: message.id,
      headerMessageId: messageIdHeader ? messageIdHeader.replace(/[<>]/g, '') : null,
      taskId: taskId,
      subject: subject,
      from: from,
      date: date.toISOString(),
      created: new Date().toISOString()
    });
    
    console.log('  Mapping saved to storage');
    
    // Benachrichtigung anzeigen
    browser.notifications.create({
      type: 'basic',
      title: 'Star to Task',
      message: `✅ Task created: ${subject}`
    });
    
  } catch (error) {
    console.error('❌ Error creating task from email:', error);
    // Fallback-Benachrichtigung bei Fehler
    browser.notifications.create({
      type: 'basic',
      title: 'Star to Task - Error',
      message: `Failed to create task: ${error.message}`
    });
  }
}

/**
 * Löscht die Aufgabe für eine E-Mail
 */
async function deleteTaskForEmail(messageId) {
  try {
    console.log('🗑️ Deleting task for email:', messageId);
    
    // Hole gespeicherte Zuordnung
    const mapping = await getEmailTaskMapping(messageId);
    console.log('  Mapping found:', mapping);
    
    if (mapping && mapping.taskId) {
      console.log('  Calling deleteTask with ID:', mapping.taskId);
      
      // Lösche die ECHTE Thunderbird-Aufgabe
      const deleted = await browser.StarToTaskAPI.deleteTask(mapping.taskId);
      
      if (deleted) {
        console.log('✅ Real Thunderbird task deleted:', mapping.taskId);
      } else {
        console.warn('⚠️ Task not found in Thunderbird:', mapping.taskId);
      }
      
      // Lösche die Zuordnung
      await removeEmailTaskMapping(messageId);
      console.log('  Mapping removed from storage');
      
      // Benachrichtigung
      browser.notifications.create({
        type: 'basic',
        title: 'Star to Task',
        message: `✅ Task removed: ${mapping.subject}`
      });
    } else {
      console.log('  No mapping found or no taskId');
    }
    
  } catch (error) {
    console.error('❌ Error deleting task for email:', error);
    // Benachrichtigung bei Fehler
    browser.notifications.create({
      type: 'basic',
      title: 'Star to Task - Error',
      message: `Failed to delete task: ${error.message}`
    });
  }
}

/**
 * Speichert die Zuordnung Email <-> Task
 */
async function saveEmailTaskMapping(messageId, taskData) {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const mappings = result[STORAGE_KEY] || {};
  mappings[messageId] = taskData;
  await browser.storage.local.set({ [STORAGE_KEY]: mappings });
}

/**
 * Holt die Zuordnung für eine Email
 */
async function getEmailTaskMapping(messageId) {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const mappings = result[STORAGE_KEY] || {};
  return mappings[messageId];
}

/**
 * Löscht die Zuordnung für eine Email
 */
async function removeEmailTaskMapping(messageId) {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const mappings = result[STORAGE_KEY] || {};
  delete mappings[messageId];
  await browser.storage.local.set({ [STORAGE_KEY]: mappings });
}

/**
 * Gibt alle aktuellen Tasks zurück
 */
async function getAllTasks() {
  const result = await browser.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || {};
}

/**
 * Sucht alle Kopien einer E-Mail über den Message-ID-Header (über alle Ordner)
 */
async function findMessagesByHeaderId(headerMessageId) {
  const found = [];
  let page = await browser.messages.query({ headerMessageId });
  found.push(...page.messages);
  while (page.id) {
    page = await browser.messages.continueList(page.id);
    found.push(...page.messages);
  }
  return found;
}

/**
 * Ermittelt den aktuellen Zustand der E-Mail zu einer Zuordnung.
 * Rückgabe: { status: 'flagged' | 'unflagged' | 'unknown', message }
 * 'unknown' = E-Mail nicht auffindbar -> Aufgabe NICHT löschen
 */
async function resolveMappingMessage(mapping) {
  if (mapping.headerMessageId) {
    // Schneller Weg: zeigt die gespeicherte ID noch auf dieselbe E-Mail?
    // (Die Suche über alle Ordner ist langsam und erzeugt in Ordnern mit
    // veraltetem Index Fehlermeldungen in der Konsole.)
    try {
      const msg = await browser.messages.get(mapping.messageId);
      if (msg && (msg.headerMessageId || '').replace(/[<>]/g, '') === mapping.headerMessageId) {
        return { status: msg.flagged ? 'flagged' : 'unflagged', message: msg };
      }
    } catch (e) {
      // ID nicht mehr gültig -> über alle Ordner suchen
    }

    const messages = await findMessagesByHeaderId(mapping.headerMessageId);
    if (messages.length === 0) return { status: 'unknown' };
    const flagged = messages.find(m => m.flagged);
    return flagged
      ? { status: 'flagged', message: flagged }
      : { status: 'unflagged', message: messages[0] };
  }

  // Ältere Zuordnung ohne Message-ID: nur verwenden, wenn die ID noch
  // auf dieselbe E-Mail zeigt (gleicher Betreff)
  try {
    const msg = await browser.messages.get(mapping.messageId);
    if (msg && msg.subject === mapping.subject) {
      return { status: msg.flagged ? 'flagged' : 'unflagged', message: msg };
    }
  } catch (e) {
    // Nachricht unter dieser ID nicht mehr vorhanden
  }
  return { status: 'unknown' };
}

/**
 * Findet die Zuordnung zu einer E-Mail (per ID oder Message-ID-Header)
 */
async function findMappingForMessage(message) {
  const mappings = await getAllTasks();
  if (mappings[message.id]) {
    return { key: String(message.id), mapping: mappings[message.id] };
  }
  const header = (message.headerMessageId || '').replace(/[<>]/g, '');
  if (!header) return null;
  for (const [key, mapping] of Object.entries(mappings)) {
    if (mapping.headerMessageId === header) {
      return { key, mapping };
    }
  }
  return null;
}

/**
 * Speichert eine Zuordnung unter der aktuellen message.id
 */
async function rekeyMapping(oldKey, newMessageId, extra = {}) {
  const mappings = await getAllTasks();
  const mapping = mappings[oldKey];
  if (!mapping) return;
  delete mappings[oldKey];
  mappings[newMessageId] = { ...mapping, ...extra, messageId: newMessageId };
  await browser.storage.local.set({ [STORAGE_KEY]: mappings });
}

// Exportiere für andere Skripte
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getAllTasks };
}

/**
 * Prüft auf erledigte Tasks (vom Observer)
 */
async function checkForCompletedTasks() {
  try {
    // Hole erledigte Task IDs vom Experiment API
    const completedTaskIds = await browser.StarToTaskAPI.getCompletedTasks();
    
    if (completedTaskIds.length === 0) {
      return;
    }
    
    console.log(`📋 Found ${completedTaskIds.length} completed task(s):`, completedTaskIds);
    
    // Handle jeden Task
    for (const taskId of completedTaskIds) {
      await handleCompletedTask(taskId);
    }
    
  } catch (error) {
    console.error('❌ Error checking completed tasks:', error);
  }
}

/**
 * Handler für erledigte Tasks
 */
async function handleCompletedTask(taskId) {
  try {
    console.log(`  Processing task: ${taskId}`);
    
    // Finde die zugehörige Message
    const result = await browser.storage.local.get(STORAGE_KEY);
    const mappings = result[STORAGE_KEY] || {};
    
    // Suche die Message ID für diese Task ID
    for (const [messageId, mapping] of Object.entries(mappings)) {
      if (mapping.taskId === taskId) {
        console.log(`    Found message ${messageId}`);
        
        // Entferne Zuordnung zuerst, damit das onUpdated-Event die
        // (bereits erledigte) Aufgabe nicht nochmals löscht
        await removeEmailTaskMapping(messageId);

        // Entferne Stern (aktuelle Kopie der E-Mail suchen)
        const { message } = await resolveMappingMessage(mapping);
        if (message) {
          await browser.messages.update(message.id, { flagged: false });
        } else {
          console.log('    Email not found, star not removed');
        }
        
        console.log('    ✅ Star removed');
        
        // Benachrichtigung
        browser.notifications.create({
          type: 'basic',
          title: 'Star to Task',
          message: `✅ Task erledigt: ${mapping.subject}`
        });
        
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling completed task:', error);
  }
}

/**
 * Initialisiert den Calendar Observer und Polling
 */
async function initializeCalendarObserver() {
  try {
    // Registriere Observer
    const success = await browser.StarToTaskAPI.registerCalendarObserver();
    if (success) {
      console.log('✅ Calendar observer initialized');

      // Polle alle 2 Sekunden nach completed tasks
      setInterval(checkForCompletedTasks, 2000);
      console.log('🔄 Polling for completed tasks every 2 seconds');

    } else {
      console.error('❌ Failed to initialize calendar observer');
    }
  } catch (error) {
    console.error('❌ Error initializing calendar observer:', error);
  }
}

/**
 * Reconciliation: gleicht gespeicherte Mappings mit dem aktuellen
 * Flag-Status der zugehörigen Nachrichten ab.
 *
 * Warum: browser.messages.onUpdated feuert nur, wenn Thunderbird die
 * Flag-Änderung LIVE sieht. Wenn ein anderer Rechner den Stern per
 * IMAP entfernt hat während dieser TB offline war, wird das Event
 * verpasst — die Aufgabe bliebe verwaist hängen.
 *
 * Diese Funktion sucht jedes Mapping heraus, prüft ob die Nachricht
 * noch mit Stern markiert ist, und löscht bei Bedarf die Aufgabe.
 */
async function reconcileMappings() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const mappings = result[STORAGE_KEY] || {};
    const messageIds = Object.keys(mappings);
    if (messageIds.length === 0) return;

    console.log(`🔄 Reconciliation: checking ${messageIds.length} mapping(s)`);
    let removed = 0;

    for (const key of messageIds) {
      const mapping = mappings[key];
      const { status, message } = await resolveMappingMessage(mapping);

      if (status === 'unflagged') {
        console.log(`  Message ${key}: no longer flagged → removing task`);
        await deleteTaskForEmail(key);
        removed++;
      } else if (status === 'flagged') {
        // E-Mail wurde verschoben oder neu nummeriert -> Zuordnung nachführen
        if (String(message.id) !== key || !mapping.headerMessageId) {
          console.log(String(message.id) !== key
            ? `  Message ${key}: now ${message.id}, updating mapping`
            : `  Message ${key}: saving Message-ID to mapping`);
          await rekeyMapping(key, message.id, {
            headerMessageId: (message.headerMessageId || '').replace(/[<>]/g, '') || null
          });
        }
      } else {
        // Nicht auffindbar (z.B. endgültig gelöscht oder Ordner nicht geladen):
        // Aufgabe sicherheitshalber behalten
        console.log(`  Message ${key}: not found, keeping task`);
      }
    }

    if (removed > 0) {
      console.log(`✅ Reconciliation: removed ${removed} orphaned task(s)`);
    }
  } catch (error) {
    console.error('❌ Reconciliation error:', error);
  }
}

// Initialisiere Observer beim Start
initializeCalendarObserver();

// Beim Start und danach alle 5 Minuten verwaiste Aufgaben aufräumen
// (fängt Flag-Änderungen ein, die per IMAP synced wurden während TB offline war)
reconcileMappings();
setInterval(reconcileMappings, 5 * 60 * 1000);

console.log('Star to Task extension loaded');
