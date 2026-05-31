/**
 * ui/builder.js
 *
 * Build tab UI: open/close modal, render component lists, collapse toggles.
 * Depends on: app.js (App), all component definition files.
 * Called from: index.html inline events + app.js.
 */

const Builder = (() => {

  // Map type string to component definition module
  const COMPONENTS = {
    solar:     SolarComponent,
    wind:      WindComponent,
    hydro:     HydroComponent,
    generator: GeneratorComponent,
    battery:   BatteryComponent,
    water:     WaterComponent,
  };

  // Tracks what the open modal is adding
  let _activeType   = null;
  let _editId       = null;

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

    document.getElementById('modal-title').textContent  = `Add ${def.label}`;
    document.getElementById('modal-save-btn').textContent = 'Add to build';
    document.getElementById('modal-body').innerHTML     = def.formHTML();
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
   * renderList
   * Re-renders the component list for a given type.
   * Called after add or remove.
   * @param {string} type       Component type key
   * @param {Array}  comps      Array of component objects
   * @param {object} settings   Global settings for kWh display
   */
  function renderList(type, comps, settings) {
    const el = document.getElementById(`list-${type}`);
    if (!el) return;

    if (!comps.length) {
      el.innerHTML = `<div class="empty-hint">No ${COMPONENTS[type].label.toLowerCase()} added yet.</div>`;
      return;
    }

    el.innerHTML = comps.map(comp => {
      const def      = COMPONENTS[type];
      const kwhInfo  = getKwhDisplay(type, comp, settings);

      return `<div class="component-card">
        <div class="comp-info">
          <div class="comp-name">${comp.name}</div>
          <div class="comp-meta">${def.metaLine(comp)}</div>
        </div>
        ${kwhInfo ? `<div>
          <div class="comp-kwh">${kwhInfo.value}</div>
          <div class="comp-kwh-label">${kwhInfo.label}</div>
        </div>` : ''}
        <div class="comp-actions">
          <button class="comp-btn delete" onclick="App.removeComponent('${type}', ${comp.id})" title="Remove">✕</button>
        </div>
      </div>`;
    }).join('');
  }

  /**
   * getKwhDisplay
   * Returns a short kWh string for a component card.
   * Returns null for battery/water (different unit).
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
        // Water calc needs settings — access WaterCalc directly
        const r = WaterCalc.monthly(comp, settings);
        return { value: r.litersPerMonth.toLocaleString() + 'L', label: 'avg/month' };
      }
      default: return null;
    }
  }

  /**
   * toggleCollapse
   * Expands or collapses a collapsible section.
   * @param {string} id  Element id of .collapsible-section
   */
  function toggleCollapse(id) {
    document.getElementById(id).classList.toggle('open');
  }

  /**
   * promptSaveBuild
   * Prompts user for a build name and saves to Storage.
   */
  function promptSaveBuild() {
    const name = prompt('Name this build:', App.getState().buildName || 'My Build');
    if (!name) return;
    const state = App.getState();
    state.buildName = name;
    document.getElementById('current-build-name').textContent = name;
    Storage.save(name, state);
    App.showToast(`"${name}" saved`);
  }

  return { openAddModal, closeModal, saveModal, renderList, toggleCollapse, promptSaveBuild };

})();

// Expose UI alias used in index.html
const UI = Builder;
