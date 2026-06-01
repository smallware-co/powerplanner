/**
 * app.js
 *
 * Main app entry point.
 * Handles: tab routing, global state, settings sync, bill change.
 * Depends on: all other modules loaded before this in index.html.
 */

const App = (() => {

  // Global state — single source of truth for this session
  const state = {
    currentTab: 'build',
    buildName: 'Untitled Build',
    bill: 6500,
    settings: {
      sunHours:     5.0,
      windSpeed:    4.0,
      rainMonths:   6,
      rainfall:     300,    // mm/month during rainy season
      rate:         12.00,  // Meralco ₱/kWh
      netMeter:     5.50,   // net metering credit ₱/kWh
      waterRate:    35,     // ₱/cubic meter
      projYears:    25,
      rateIncrease: 3,      // % annual Meralco rate increase
    },
    // Components: arrays of component objects per type
    components: {
      solar:     [],
      wind:      [],
      hydro:     [],
      generator: [],
      battery:   [],
      water:     [],
    }
  };

  /**
   * switchTab
   * Activates a tab by name. Updates nav, shows correct panel.
   * @param {string} tab  'build' | 'results' | 'saves' | 'settings'
   */
function switchTab(tab) {
  // Deactivate all panels + bottom nav items
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`nav-${tab}`).classList.add('active');

  // Sync sidebar nav (desktop) — elements may not exist on mobile, guard with ?
  document.querySelectorAll('.sidebar-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`snav-${tab}`)?.classList.add('active');

  state.currentTab = tab;

  if (tab === 'results') Results.render(state);
  if (tab === 'saves')   renderSaves();
}

  /**
   * onBillChange
   * Called when monthly bill input changes. Updates state and recalculates.
   */
  function onBillChange() {
    const val = parseFloat(document.getElementById('monthly-bill').value) || 0;
    state.bill = val;
  }

  /**
   * onSettingsChange
   * Reads all settings fields and updates state. Refreshes context bar.
   */
  function onSettingsChange() {
    state.settings.sunHours     = parseFloat(document.getElementById('s-sun').value)          || 5;
    state.settings.windSpeed    = parseFloat(document.getElementById('s-wind').value)         || 4;
    state.settings.rainMonths   = parseInt(document.getElementById('s-rain-months').value)    || 6;
    state.settings.rainfall     = parseFloat(document.getElementById('s-rainfall').value)     || 300;
    state.settings.rate         = parseFloat(document.getElementById('s-rate').value)         || 12;
    state.settings.netMeter     = parseFloat(document.getElementById('s-netmeter').value)     || 5.5;
    state.settings.waterRate    = parseFloat(document.getElementById('s-water-rate').value)   || 35;
    state.settings.projYears    = parseInt(document.getElementById('s-years').value)          || 25;
    state.settings.rateIncrease = parseFloat(document.getElementById('s-rate-increase').value) || 3;

    syncContextBar();
  }

  /**
   * syncContextBar
   * Updates the build tab context bar with current settings.
   */
  function syncContextBar() {
    document.getElementById('ctx-sun-val').textContent  = state.settings.sunHours.toFixed(1);
    document.getElementById('ctx-wind-val').textContent = state.settings.windSpeed.toFixed(1);
    document.getElementById('ctx-rate-val').textContent = state.settings.rate.toFixed(2);
  }

  /**
   * getState
   * Exposes state to other modules.
   * @return {object} current state
   */
  function getState() { return state; }

  /**
   * addComponent
   * Adds a component object to the correct type array.
   * @param {string} type  Component type key
   * @param {object} comp  Component data object
   */
  function addComponent(type, comp) {
    comp.id = Date.now() + Math.random();
    state.components[type].push(comp);
    Builder.renderList(type, state.components[type], state.settings);
    showToast(`${comp.name} added`);
  }

  /**
   * removeComponent
   * Removes a component by id.
   * @param {string} type  Component type key
   * @param {number} id    Component id
   */
  function removeComponent(type, id) {
    state.components[type] = state.components[type].filter(c => c.id !== id);
    Builder.renderList(type, state.components[type], state.settings);
    showToast('Component removed');
  }

  /**
   * showToast
   * Shows a brief toast notification.
   * @param {string} msg  Message to show
   */
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show';
    setTimeout(() => { el.className = 'toast'; }, 2600);
  }

  /**
   * renderSaves
   * Renders the saves list from Storage.
   */
  function renderSaves() {
    const saves = Storage.list();
    const el = document.getElementById('saves-list');
    if (!saves.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon">💾</div>
        <div class="empty-title">No saved builds</div>
        <div class="empty-sub">Save your current build to compare options later.</div>
      </div>`;
      return;
    }

    el.innerHTML = saves.map(s => {
      const d = new Date(s.savedAt);
      const dateStr = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
      return `<div class="save-card">
        <div class="save-card-header">
          <div class="save-card-name">${s.name}</div>
          <div class="save-card-date">${dateStr}</div>
        </div>
        <div class="save-card-stats">
          <div><div class="save-stat-label">Bill</div><div class="save-stat-value">₱${s.bill.toLocaleString()}</div></div>
          <div><div class="save-stat-label">Components</div><div class="save-stat-value">${s.componentCount}</div></div>
          <div><div class="save-stat-label">Meralco rate</div><div class="save-stat-value">₱${s.rate}/kWh</div></div>
        </div>
        <div class="save-card-actions">
          <button class="save-action-btn load" onclick="App.loadSave('${s.key}')">Load build</button>
          <button class="save-action-btn del" onclick="App.deleteSave('${s.key}')">Delete</button>
        </div>
      </div>`;
    }).join('');
  }

  /**
   * loadSave
   * Loads a saved build into state and re-renders all component lists.
   * @param {string} key  Storage key
   */
  function loadSave(key) {
    const saved = Storage.load(key);
    if (!saved) return;
    state.bill = saved.bill;
    state.buildName = saved.name;
    state.settings = { ...state.settings, ...saved.settings };
    state.components = saved.components;

    // Sync UI fields
    document.getElementById('monthly-bill').value = state.bill;
    document.getElementById('s-sun').value         = state.settings.sunHours;
    document.getElementById('s-wind').value        = state.settings.windSpeed;
    document.getElementById('s-rain-months').value = state.settings.rainMonths;
    document.getElementById('s-rainfall').value    = state.settings.rainfall;
    document.getElementById('s-rate').value        = state.settings.rate;
    document.getElementById('s-netmeter').value    = state.settings.netMeter;
    document.getElementById('s-water-rate').value  = state.settings.waterRate;
    document.getElementById('s-years').value       = state.settings.projYears;
    document.getElementById('s-rate-increase').value = state.settings.rateIncrease;

    document.getElementById('current-build-name').textContent = state.buildName;
    // Sync sidebar build name badge (desktop)
    const sidebarBadge = document.getElementById('sidebar-build-name');
    if (sidebarBadge) sidebarBadge.textContent = state.buildName;
    syncContextBar();

    // Re-render all component lists
    Object.keys(state.components).forEach(type => {
      Builder.renderList(type, state.components[type], state.settings);
    });

    switchTab('build');
    showToast(`"${saved.name}" loaded`);
  }

  /**
   * deleteSave
   * Deletes a saved build.
   * @param {string} key  Storage key
   */
  function deleteSave(key) {
    Storage.remove(key);
    renderSaves();
    showToast('Build deleted');
  }

  // Init
  syncContextBar();

  return { switchTab, onBillChange, onSettingsChange, getState, addComponent, removeComponent, showToast, loadSave, deleteSave };

})();

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed — app still works, just no offline
    });
  });
}
