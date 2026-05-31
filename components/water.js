/**
 * components/battery.js
 *
 * Battery bank component definition.
 * Models storage capacity, depth of discharge, cycle life.
 * Called by: ui/builder.js
 */

const BatteryComponent = (() => {

  const type = 'battery';
  const label = 'Battery Bank';
  const icon = '🔋';

  function formHTML() {
    return `
      <div class="form-field">
        <label>Battery bank name</label>
        <input type="text" id="f-name" placeholder="e.g. LiFePO4 10kWh bank" value="Battery Bank">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Total capacity (kWh)</label>
          <input type="number" id="f-capacity" value="10" step="0.5" min="1">
        </div>
        <div class="form-field">
          <label>Usable DoD (%)</label>
          <input type="number" id="f-dod" value="80" min="10" max="100">
          <div class="form-hint">LiFePO4: 80–95%</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Battery type</label>
          <select id="f-batt-type">
            <option value="lifepo4" selected>LiFePO4</option>
            <option value="agm">AGM Lead Acid</option>
            <option value="gel">Gel Lead Acid</option>
            <option value="lithium">Li-Ion</option>
          </select>
        </div>
        <div class="form-field">
          <label>Cycle life (cycles)</label>
          <input type="number" id="f-cycles" value="3000" min="100">
          <div class="form-hint">LiFePO4: ~3000–6000</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Total cost (₱)</label>
          <input type="number" id="f-unit-cost" value="120000" min="0">
        </div>
        <div class="form-field">
          <label>Install cost (₱)</label>
          <input type="number" id="f-install" value="5000" min="0">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:       document.getElementById('f-name').value || label,
      capacityKwh: parseFloat(document.getElementById('f-capacity').value) || 10,
      dod:         parseFloat(document.getElementById('f-dod').value) / 100 || 0.8,
      battType:    document.getElementById('f-batt-type').value,
      cycleLife:   parseInt(document.getElementById('f-cycles').value)     || 3000,
      unitCost:    parseFloat(document.getElementById('f-unit-cost').value) || 120000,
      installCost: parseFloat(document.getElementById('f-install').value)  || 0,
    };
  }

  function totalCost(comp) { return comp.unitCost + comp.installCost; }

  function metaLine(comp) {
    const usable = (comp.capacityKwh * comp.dod).toFixed(1);
    return `${comp.capacityKwh}kWh total · ${usable}kWh usable · ${comp.battType.toUpperCase()} · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();


/**
 * components/water.js
 *
 * Rainwater collection component definition.
 * Outputs: liters/month collected, peso savings on water bill.
 * Called by: ui/builder.js
 */

const WaterComponent = (() => {

  const type = 'water';
  const label = 'Rainwater Collection';
  const icon = '🌧️';

  function formHTML() {
    return `
      <div class="form-field">
        <label>System name</label>
        <input type="text" id="f-name" placeholder="e.g. Roof collection tank" value="Rainwater System">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Catchment area (sqm)</label>
          <input type="number" id="f-area" value="80" min="1">
          <div class="form-hint">Effective roof area</div>
        </div>
        <div class="form-field">
          <label>Collection efficiency (%)</label>
          <input type="number" id="f-efficiency" value="80" min="10" max="100">
          <div class="form-hint">Lost to evaporation/runoff</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Tank capacity (liters)</label>
          <input type="number" id="f-tank" value="1000" min="50">
        </div>
        <div class="form-field">
          <label>Use for</label>
          <select id="f-use">
            <option value="plants" selected>Plants / garden</option>
            <option value="toilet">Toilet flushing</option>
            <option value="laundry">Laundry</option>
            <option value="general">General non-potable</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Tank + pipes cost (₱)</label>
          <input type="number" id="f-unit-cost" value="8000" min="0">
        </div>
        <div class="form-field">
          <label>Filter cost (₱)</label>
          <input type="number" id="f-filter" value="2000" min="0">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:       document.getElementById('f-name').value || label,
      catchArea:  parseFloat(document.getElementById('f-area').value)       || 80,
      efficiency: parseFloat(document.getElementById('f-efficiency').value) / 100 || 0.8,
      tankLiters: parseFloat(document.getElementById('f-tank').value)       || 1000,
      useFor:     document.getElementById('f-use').value,
      unitCost:   parseFloat(document.getElementById('f-unit-cost').value)  || 8000,
      filterCost: parseFloat(document.getElementById('f-filter').value)     || 0,
    };
  }

  function totalCost(comp) { return comp.unitCost + comp.filterCost; }

  function metaLine(comp) {
    return `${comp.catchArea}sqm · ${comp.tankLiters}L tank · ${comp.useFor} · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();
