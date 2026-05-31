/**
 * components/hydro.js
 *
 * Micro-hydro component definition.
 * Models roof runoff through a pipe turbine.
 * Key inputs: pipe diameter, head height, flow rate, rainy months.
 * Called by: ui/builder.js
 */

const HydroComponent = (() => {

  const type = 'hydro';
  const label = 'Micro-Hydro';
  const icon = '💧';

  function formHTML() {
    return `
      <div class="form-field">
        <label>System name</label>
        <input type="text" id="f-name" placeholder="e.g. Roof runoff turbine" value="Roof Micro-Hydro">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine rated watts</label>
          <input type="number" id="f-watts" value="200" min="10" max="2000">
        </div>
        <div class="form-field">
          <label>Head height (m)</label>
          <input type="number" id="f-head" value="3" step="0.5" min="0.5" max="20">
          <div class="form-hint">Vertical drop in pipe</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Catchment area (sqm)</label>
          <input type="number" id="f-area" value="60" min="1">
          <div class="form-hint">Roof area feeding the pipe</div>
        </div>
        <div class="form-field">
          <label>Daily run hours (rainy)</label>
          <input type="number" id="f-hours" value="4" min="0.5" max="24">
          <div class="form-hint">Avg hours/day when raining</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine + motor cost (₱)</label>
          <input type="number" id="f-unit-cost" value="5000" min="0">
        </div>
        <div class="form-field">
          <label>Pipe + install cost (₱)</label>
          <input type="number" id="f-install" value="3000" min="0">
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:        document.getElementById('f-name').value || label,
      watts:       parseFloat(document.getElementById('f-watts').value)    || 200,
      headHeight:  parseFloat(document.getElementById('f-head').value)     || 3,
      catchArea:   parseFloat(document.getElementById('f-area').value)     || 60,
      dailyHours:  parseFloat(document.getElementById('f-hours').value)    || 4,
      unitCost:    parseFloat(document.getElementById('f-unit-cost').value) || 5000,
      installCost: parseFloat(document.getElementById('f-install').value)  || 0,
    };
  }

  function totalCost(comp) {
    return comp.unitCost + comp.installCost;
  }

  function metaLine(comp) {
    return `${comp.watts}W · ${comp.headHeight}m head · ${comp.catchArea}sqm roof · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();
