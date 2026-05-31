/**
 * components/wind.js
 *
 * Wind turbine component definition.
 * Handles VAWT (vertical axis) and HAWT (horizontal axis) types.
 * Called by: ui/builder.js
 */

const WindComponent = (() => {

  const type = 'wind';
  const label = 'Wind Turbine';
  const icon = '🌀';

  function formHTML() {
    return `
      <div class="form-field">
        <label>Turbine name / label</label>
        <input type="text" id="f-name" placeholder="e.g. 600W VAWT terrace" value="Wind Turbine">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Quantity</label>
          <input type="number" id="f-qty" value="3" min="1" max="20">
        </div>
        <div class="form-field">
          <label>Rated watts</label>
          <input type="number" id="f-watts" value="600" min="50" max="5000">
          <div class="form-hint">Rated at ~12 m/s</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine type</label>
          <select id="f-turbine-type">
            <option value="vawt" selected>VAWT (vertical)</option>
            <option value="hawt">HAWT (horizontal)</option>
          </select>
        </div>
        <div class="form-field">
          <label>Avg wind speed (m/s)</label>
          <input type="number" id="f-wind-speed" value="4.0" step="0.5" min="1" max="15">
          <div class="form-hint">Override global setting</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Cost per unit (₱)</label>
          <input type="number" id="f-unit-cost" value="8000" min="0">
        </div>
        <div class="form-field">
          <label>Install cost (₱)</label>
          <input type="number" id="f-install" value="5000" min="0">
        </div>
      </div>
      <div class="form-field">
        <label>Controller / charge regulator (₱)</label>
        <input type="number" id="f-controller" value="3000" min="0">
        <div class="form-hint">MPPT controller recommended</div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:        document.getElementById('f-name').value || label,
      qty:         parseInt(document.getElementById('f-qty').value)          || 1,
      watts:       parseFloat(document.getElementById('f-watts').value)      || 600,
      turbineType: document.getElementById('f-turbine-type').value,
      windSpeed:   parseFloat(document.getElementById('f-wind-speed').value) || 4.0,
      unitCost:    parseFloat(document.getElementById('f-unit-cost').value)  || 8000,
      installCost: parseFloat(document.getElementById('f-install').value)    || 0,
      controllerCost: parseFloat(document.getElementById('f-controller').value) || 0,
    };
  }

  function totalCost(comp) {
    return (comp.unitCost * comp.qty) + comp.installCost + comp.controllerCost;
  }

  function metaLine(comp) {
    const totalW = comp.watts * comp.qty;
    return `${comp.qty}× ${comp.watts}W ${comp.turbineType.toUpperCase()} · ${comp.windSpeed}m/s · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();
