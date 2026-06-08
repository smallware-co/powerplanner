/**
 * components/water.js
 *
 * Rainwater collection component definition.
 * Outputs: liters/month collected, peso savings on water bill.
 * Called by: ui/builder.js
 */

const WaterComponent = (() => {

  const type  = 'water';
  const label = 'Rainwater Collection';
  const icon  = '🌧️';

  const DEFAULTS = {
    name:       'Rainwater System',
    catchArea:  80,
    efficiency: 80,
    tankLiters: 1000,
    useFor:     'plants',
    unitCost:   8000,
    filterCost: 2000,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>System name</label>
        <input type="text" id="f-name" placeholder="e.g. Roof collection tank">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Catchment area (sqm)</label>
          <input type="number" id="f-area" min="1" placeholder="e.g. 80">
          <div class="form-hint">Effective roof area</div>
        </div>
        <div class="form-field">
          <label>Collection efficiency (%)</label>
          <input type="number" id="f-efficiency" min="10" max="100" placeholder="e.g. 80">
          <div class="form-hint">Lost to evaporation/runoff</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Tank capacity (liters)</label>
          <input type="number" id="f-tank" min="50" placeholder="e.g. 1000">
        </div>
        <div class="form-field">
          <label>Use for</label>
          <select id="f-use">
            <option value="plants">Plants / garden</option>
            <option value="toilet">Toilet flushing</option>
            <option value="laundry">Laundry</option>
            <option value="general">General non-potable</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Tank + pipes cost (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 8000">
        </div>
        <div class="form-field">
          <label>Filter cost (₱)</label>
          <input type="number" id="f-filter" min="0" placeholder="e.g. 2000">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:       document.getElementById('f-name').value.trim() || label,
      catchArea:  parseFloat(document.getElementById('f-area').value),
      efficiency: parseFloat(document.getElementById('f-efficiency').value) / 100,
      tankLiters: parseFloat(document.getElementById('f-tank').value),
      useFor:     document.getElementById('f-use').value,
      unitCost:   parseFloat(document.getElementById('f-unit-cost').value),
      filterCost: parseFloat(document.getElementById('f-filter').value) || 0,
    };
  }

  function totalCost(comp) { return comp.unitCost + comp.filterCost; }

  function metaLine(comp) {
    return `${comp.catchArea}sqm · ${comp.tankLiters}L tank · ${comp.useFor} · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();