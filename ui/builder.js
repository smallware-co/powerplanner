/**
 * ui/builder.js
 *
 * Build tab UI: open/close modal, render component lists, collapse toggles.
 * Handles both mobile lists (list-{type}) and desktop grid lists (grid-list-{type}).
 * Depends on: app.js (App), all component definition files.
 * Called from: index.html inline events + app.js.
 */

const Builder = (() => {

  const EMPTY_ICONS = {
    solar:     '🔆',
    wind:      '🌀',
    hydro:     '💧',
    generator: '⚙️',
    battery:   '🔋',
    water:     '🌧️',
  };

  const COMPONENTS = {
    solar:     SolarComponent,
    wind:      WindComponent,
    hydro:     HydroComponent,
    generator: GeneratorComponent,
    battery:   BatteryComponent,
    water:     WaterComponent,
  };

  let _activeType = null;
  let _editId     = null;

  /**
   * openAddModal
   * Opens the bottom sheet modal for a given component type.
   * @param {string} type  Component type key
   */
  function openAddModal(type) {
    const def = COMPONENTS[type];
    if (!def) return;

    _activeType = type;
    _editId     = null;

    document.getElementById('modal-title').textContent    = `Add ${def.label}`;
    document.getElementById('modal-save-btn').textContent = 'Add to build';
    document.getElementById('modal-body').innerHTML       = def.formHTML();
    document.getElementById('modal-overlay').classList.add('open');
  }

  /**
   * closeModal
   * Closes the modal. If triggered by overlay click, only close if clicking outside sheet.
   * @param {Event} [event]  Optional click event
   */
  function closeModal(event) {
    if (event && event.target !== document.getElementById('modal-overlay')) return;
    document.getElementById('modal-overlay').classList.remove('open');
    _activeType = null;
    _editId     = null;
  }

  /**
   * saveModal
   * Reads the active modal form and adds the component to state.
   */
  function saveModal() {
    if (!_activeType) return;
    const def  = COMPONENTS[_activeType];
    const comp = def.readForm();
    App.addComponent(_activeType, comp);
    closeModal();
  }

  /**
   * fillDefaults
   * Fills the open modal's form fields with the active component's DEFAULTS.
   * Triggered by the "Use typical values" button present in every formHTML.
   */
  function fillDefaults() {
    if (!_activeType) return;
    const defaults = COMPONENTS[_activeType].defaults;
    if (!defaults) return;

    // Map field IDs to default keys — only fills fields that exist in the current form
    const fieldMap = {
      'f-name':       defaults.name,
      'f-qty':        defaults.qty,
      'f-watts':      defaults.watts,
      'f-unit-cost':  defaults.unitCost,
      'f-efficiency': defaults.efficiency,
      'f-inverter':   defaults.inverterCost,
      'f-install':    defaults.installCost,
      'f-capacity':   defaults.capacityKwh,
      'f-dod':        defaults.dod,
      'f-cycles':     defaults.cycleLife,
      'f-area':       defaults.catchArea,
      'f-tank':       defaults.tankLiters,
      'f-filter':     defaults.filterCost,
      'f-head':       defaults.headHeight,
      'f-hours':      defaults.dailyHours,
      'f-fuel':       defaults.fuelPerHr,
      'f-fuel-cost':  defaults.fuelCost,
      'f-days':       defaults.daysPerMonth,
      'f-wind-speed': defaults.windSpeed,
      'f-controller': defaults.controllerCost,
    };

    Object.entries(fieldMap).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value !== undefined) el.value = value;
    });

    // Selects need explicit value assignment
    const battType = document.getElementById('f-batt-type');
    if (battType && defaults.battType) battType.value = defaults.battType;

    const turbineType = document.getElementById('f-turbine-type');
    if (turbineType && defaults.turbineType) turbineType.value = defaults.turbineType;

    const useFor = document.getElementById('f-use');
    if (useFor && defaults.useFor) useFor.value = defaults.useFor;
  }

  /**
   * renderList
   * Re-renders the mobile component list for a given type.
   * Called after add or remove. Targets list-{type} IDs.
   * @param {string} type       Component type key
   * @param {Array}  comps      Array of component objects
   * @param {object} settings   Global settings for kWh display
   */
  function renderList(type, comps, settings) {
    const el = document.getElementById(`list-${type}`);
    if (!el) return;

    if (!comps.length) {
      el.innerHTML = `<div class="empty-hint">
  <span class="empty-hint-icon">${EMPTY_ICONS[type] || '➕'}</span>
  <span class="empty-hint-text">No ${COMPONENTS[type].label.toLowerCase()} added yet.</span>
  <button class="empty-hint-action" onclick="UI.openAddModal('${type}')">+ Add one</button>
</div>`;
      return;
    }

    el.innerHTML = comps.map(comp => _cardHTML(type, comp, settings)).join('');
  }

  /**
   * renderGridList
   * Re-renders the desktop grid component list for a given type.
   * In saved mode with no components: renders a compact + tile.
   * In editing mode with no components: renders normal empty hint.
   * Targets grid-list-{type} IDs.
   * @param {string} type      Component type key
   * @param {Array}  comps     Array of component objects
   * @param {object} settings  Global settings
   * @param {string} mode      'editing' | 'saved'
   */
  function renderGridList(type, comps, settings, mode) {
    const el      = document.getElementById(`grid-list-${type}`);
    const section = document.getElementById(`grid-${type}`);
    if (!el || !section) return;

    const def = COMPONENTS[type];

    if (!comps.length) {
      if (mode === 'saved') {
        section.classList.add('compact-tile');
        el.innerHTML = `<div class="empty-hint">
  <span class="empty-hint-icon">${EMPTY_ICONS[type] || '➕'}</span>
  <span class="empty-hint-text">No ${COMPONENTS[type].label.toLowerCase()} added yet.</span>
  <button class="empty-hint-action" onclick="UI.openAddModal('${type}')">+ Add one</button>
</div>`;
      } else {
        section.classList.remove('compact-tile');
        el.innerHTML = `<div class="empty-hint">
  <span class="empty-hint-icon">${EMPTY_ICONS[type] || '➕'}</span>
  <span class="empty-hint-text">No ${COMPONENTS[type].label.toLowerCase()} added yet.</span>
</div>`;
      }
      return;
    }

    section.classList.remove('compact-tile');
    el.innerHTML = comps.map(comp => _cardHTML(type, comp, settings)).join('');
  }

  /**
   * _cardHTML
   * Returns the HTML string for a single component card.
   * Shared between mobile and desktop grid renders.
   * @param  {string} type      Component type key
   * @param  {object} comp      Component data object
   * @param  {object} settings  Global settings
   * @return {string} HTML string
   */
  function _cardHTML(type, comp, settings) {
    const def     = COMPONENTS[type];
    const kwhInfo = getKwhDisplay(type, comp, settings);

    return `<div class="component-card">
    <div class="comp-info">
      <div class="comp-name">${comp.name}</div>
      <div class="comp-meta">${def.metaLine(comp)}</div>
    </div>
    ${kwhInfo ? `<div class="comp-stat">
      <div class="comp-kwh">${kwhInfo.value}</div>
      <div class="comp-kwh-label">${kwhInfo.label}</div>
    </div>` : ''}
    <div class="comp-actions">
      <button class="comp-btn delete" onclick="App.removeComponent('${type}', ${comp.id})" title="Remove">✕</button>
    </div>
  </div>`;
  }

  /**
   * getKwhDisplay
   * Returns a short kWh/output string for a component card.
   * @param  {string} type      Component type
   * @param  {object} comp      Component data
   * @param  {object} settings  Global settings
   * @return {object|null} { value, label }
   */
  function getKwhDisplay(type, comp, settings) {
    switch (type) {
      case 'solar': {
        const r = EnergyCalc.solar(comp, settings);
        return { value: r.dailyKwh.toFixed(1) + ' kWh', label: 'per day' };
      }
      case 'wind': {
        const r = EnergyCalc.wind(comp, settings);
        return { value: r.dailyKwh.toFixed(1) + ' kWh', label: 'per day' };
      }
      case 'hydro': {
        const r = EnergyCalc.hydro(comp, settings);
        return { value: r.monthlyKwh.toFixed(1) + ' kWh', label: 'avg/month' };
      }
      case 'generator': {
        const r = EnergyCalc.generator(comp);
        return { value: r.monthlyKwh.toFixed(0) + ' kWh', label: 'per month' };
      }
      case 'battery': {
        const usable = (comp.capacityKwh * comp.dod).toFixed(1);
        return { value: usable + ' kWh', label: 'usable' };
      }
      case 'water': {
        const r = WaterCalc.monthly(comp, settings);
        return { value: r.litersPerMonth.toLocaleString() + 'L', label: 'avg/month' };
      }
      default: return null;
    }
  }

  /**
   * toggleCollapse
   * Expands or collapses a collapsible section (mobile only).
   * @param {string} id  Element id of .collapsible-section
   */
  function toggleCollapse(id) {
    document.getElementById(id).classList.toggle('open');
  }

  /**
   * promptSaveBuild
   * Prompts user for a build name, saves to Storage, auto-switches to saved mode.
   */
  function promptSaveBuild() {
    const name = prompt('Name this build:', App.getState().buildName || 'My Build');
    if (!name) return;

    const state = App.getState();
    state.buildName = name;

    document.getElementById('current-build-name').textContent = name;
    const sidebarBadge = document.getElementById('sidebar-build-name');
    if (sidebarBadge) sidebarBadge.textContent = name;

    Storage.save(name, state);
    App.showToast(`"${name}" saved`);

    App.setBuildMode('saved');
  }

  return {
    openAddModal,
    closeModal,
    saveModal,
    fillDefaults,
    renderList,
    renderGridList,
    toggleCollapse,
    promptSaveBuild,
  };

})();

// Expose UI alias used in index.html
const UI = Builder;