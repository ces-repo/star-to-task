// Star to Task - Options Page Script

// Standard-Einstellungen
const defaults = {
  dueDateDays: 0,  // Heute
  priority: 5      // Mittel
};

// Lade gespeicherte Einstellungen
async function loadSettings() {
  try {
    const settings = await browser.storage.local.get(['dueDateDays', 'priority']);
    
    // Setze Werte oder Standards
    document.getElementById('dueDateDays').value = settings.dueDateDays !== undefined ? settings.dueDateDays : defaults.dueDateDays;
    document.getElementById('priority').value = settings.priority !== undefined ? settings.priority : defaults.priority;
    
    console.log('Settings loaded:', settings);
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Speichere Einstellungen
async function saveSettings() {
  try {
    const dueDateDays = parseInt(document.getElementById('dueDateDays').value);
    const priority = parseInt(document.getElementById('priority').value);
    
    await browser.storage.local.set({
      dueDateDays: dueDateDays,
      priority: priority
    });
    
    console.log('Settings saved:', { dueDateDays, priority });
    
    // Zeige Erfolgs-Nachricht
    const status = document.getElementById('status');
    status.textContent = '✅ Einstellungen gespeichert!';
    status.className = 'status success';
    
    // Verstecke nach 3 Sekunden
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    
    const status = document.getElementById('status');
    status.textContent = '❌ Fehler beim Speichern: ' + error.message;
    status.className = 'status error';
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save').addEventListener('click', saveSettings);

// Speichere auch bei Enter
document.querySelectorAll('select').forEach(select => {
  select.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
});

console.log('Star to Task options page loaded');
