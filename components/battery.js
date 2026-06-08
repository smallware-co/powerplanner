/**
 * components/battery.js
 *
 * Battery bank component definition.
 * Models storage capacity, depth of discharge, cycle life.
 * Called by: ui/builder.js
 */

const BatteryComponent = (() => {

  const type  = 'battery';
  const label = 'Battery Bank';
  const icon  = '🔋';

  const DEFAULTS = {
    name:        'Battery Bank',
    capacityKwh: 10,
    dod:         80,
    battType:    'lifepo4',
    cycleLife:   3000,
    unitCost:    120000,
    installCost: 5000,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>Battery bank name</label>
        <input type="text" id="f-name" placeholder="e.g. LiFePO4 10kWh bank">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Total capacity (kWh)</label>
          <input type="number" id="f-capacity" step="0.5" min="1" placeholder="e.g. 10">
        </div>
        <div class="form-field">
          <label>Usable DoD (%)</label>
          <input type="number" id="f-dod" min="10" max="100" placeholder="e.g. 80">
          <div class="form-hint">LiFePO4: 80–95%</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Battery type</label>
          <select id="f-batt-type">
            <option value="lifepo4">LiFePO4</option>
            <option value="agm">AGM Lead Acid</option>
            <option value="gel">Gel Lead Acid</option>
            <option value="lithium">Li-Ion</option>
          </select>
        </div>
        <div class="form-field">
          <label>Cycle life (cycles)</label>
          <input type="number" id="f-cycles" min="100" placeholder="e.g. 3000">
          <div class="form-hint">LiFePO4: ~3000–6000</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Total cost (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 120000">
        </div>
        <div class="form-field">
          <label>Install cost (₱)</label>
          <input type="number" id="f-install" min="0" placeholder="e.g. 5000">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:        document.getElementById('f-name').value.trim() || label,
      capacityKwh: parseFloat(document.getElementById('f-capacity').value),
      dod:         parseFloat(document.getElementById('f-dod').value) / 100,
      battType:    document.getElementById('f-batt-type').value,
      cycleLife:   parseInt(document.getElementById('f-cycles').value),
      unitCost:    parseFloat(document.getElementById('f-unit-cost').value),
      installCost: parseFloat(document.getElementById('f-install').value) || 0,
    };
  }

  function totalCost(comp) { return comp.unitCost + comp.installCost; }

  function metaLine(comp) {
    const usable = (comp.capacityKwh * comp.dod).toFixed(1);
    return `${comp.capacityKwh}kWh total · ${usable}kWh usable · ${comp.battType.toUpperCase()} · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();