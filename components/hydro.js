/**
 * components/hydro.js
 *
 * Micro-hydro component definition.
 * Models roof runoff through a pipe turbine.
 * Key inputs: pipe diameter, head height, flow rate, rainy months.
 * Called by: ui/builder.js
 */

const HydroComponent = (() => {

  const type  = 'hydro';
  const label = 'Micro-Hydro';
  const icon  = '💧';

  const DEFAULTS = {
    name:        'Roof Micro-Hydro',
    watts:       200,
    headHeight:  3,
    catchArea:   60,
    dailyHours:  4,
    unitCost:    5000,
    installCost: 3000,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>System name</label>
        <input type="text" id="f-name" placeholder="e.g. Roof runoff turbine">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine rated watts</label>
          <input type="number" id="f-watts" min="10" max="2000" placeholder="e.g. 200">
        </div>
        <div class="form-field">
          <label>Head height (m)</label>
          <input type="number" id="f-head" step="0.5" min="0.5" max="20" placeholder="e.g. 3">
          <div class="form-hint">Vertical drop in pipe</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Catchment area (sqm)</label>
          <input type="number" id="f-area" min="1" placeholder="e.g. 60">
          <div class="form-hint">Roof area feeding the pipe</div>
        </div>
        <div class="form-field">
          <label>Daily run hours (rainy)</label>
          <input type="number" id="f-hours" min="0.5" max="24" placeholder="e.g. 4">
          <div class="form-hint">Avg hours/day when raining</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine + motor cost (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 5000">
        </div>
        <div class="form-field">
          <label>Pipe + install cost (₱)</label>
          <input type="number" id="f-install" min="0" placeholder="e.g. 3000">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:        document.getElementById('f-name').value.trim() || label,
      watts:       parseFloat(document.getElementById('f-watts').value),
      headHeight:  parseFloat(document.getElementById('f-head').value),
      catchArea:   parseFloat(document.getElementById('f-area').value),
      dailyHours:  parseFloat(document.getElementById('f-hours').value),
      unitCost:    parseFloat(document.getElementById('f-unit-cost').value),
      installCost: parseFloat(document.getElementById('f-install').value) || 0,
    };
  }

  function totalCost(comp) { return comp.unitCost + comp.installCost; }

  function metaLine(comp) {
    return `${comp.watts}W · ${comp.headHeight}m head · ${comp.catchArea}sqm roof · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();