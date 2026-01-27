// Star to Task - Background Script
// Verfolgt Stern-Änderungen und erstellt/löscht Aufgaben

// Storage-Schlüssel für die Zuordnung Email ID <-> Task ID
const STORAGE_KEY = 'starredEmailTasks';

// Initialisierung
browser.messages.onUpdated.addListener(async (message, changedProperties) => {
  // Reagiere nur auf Stern-Änderungen
  if (changedProperties.flagged !== undefined) {
    console.log('Star changed for message:', message.id, 'New value:', changedProperties.flagged);
    
    if (changedProperties.flagged) {
      // Stern wurde gesetzt -> Aufgabe erstellen
      await createTaskFromEmail(message);
    } else {
      // Stern wurde entfernt -> Aufgabe löschen
      await deleteTaskForEmail(message.id);
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
    const fullMessage = await browser.messages.getFull(message.id);
    const messageIdHeader = fullMessage.headers['message-id'] ? fullMessage.headers['message-id'][0] : null;
    
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
        
        // Entferne Stern
        await browser.messages.update(parseInt(messageId), {
          flagged: false
        });
        
        // Entferne Zuordnung
        await removeEmailTaskMapping(messageId);
        
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

// Initialisiere Observer beim Start
initializeCalendarObserver();

console.log('Star to Task extension loaded');
