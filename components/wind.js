/**
 * components/wind.js
 *
 * Wind turbine component definition.
 * Handles VAWT (vertical axis) and HAWT (horizontal axis) types.
 * Called by: ui/builder.js
 */

const WindComponent = (() => {

  const type  = 'wind';
  const label = 'Wind Turbine';
  const icon  = '🌀';

  const DEFAULTS = {
    name:           'Wind Turbine',
    qty:            3,
    watts:          600,
    turbineType:    'vawt',
    windSpeed:      4.0,
    unitCost:       8000,
    installCost:    5000,
    controllerCost: 3000,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>Turbine name / label</label>
        <input type="text" id="f-name" placeholder="e.g. 600W VAWT terrace">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Quantity</label>
          <input type="number" id="f-qty" min="1" max="20" placeholder="e.g. 3">
        </div>
        <div class="form-field">
          <label>Rated watts</label>
          <input type="number" id="f-watts" min="50" max="5000" placeholder="e.g. 600">
          <div class="form-hint">Rated at ~12 m/s</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Turbine type</label>
          <select id="f-turbine-type">
            <option value="vawt">VAWT (vertical)</option>
            <option value="hawt">HAWT (horizontal)</option>
          </select>
        </div>
        <div class="form-field">
          <label>Avg wind speed (m/s)</label>
          <input type="number" id="f-wind-speed" step="0.5" min="1" max="15" placeholder="e.g. 4.0">
          <div class="form-hint">Override global setting</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Cost per unit (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 8000">
        </div>
        <div class="form-field">
          <label>Install cost (₱)</label>
          <input type="number" id="f-install" min="0" placeholder="e.g. 5000">
        </div>
      </div>
      <div class="form-field">
        <label>Controller / charge regulator (₱)</label>
        <input type="number" id="f-controller" min="0" placeholder="e.g. 3000">
        <div class="form-hint">MPPT controller recommended</div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:           document.getElementById('f-name').value.trim() || label,
      qty:            parseInt(document.getElementById('f-qty').value),
      watts:          parseFloat(document.getElementById('f-watts').value),
      turbineType:    document.getElementById('f-turbine-type').value,
      windSpeed:      parseFloat(document.getElementById('f-wind-speed').value),
      unitCost:       parseFloat(document.getElementById('f-unit-cost').value),
      installCost:    parseFloat(document.getElementById('f-install').value)    || 0,
      controllerCost: parseFloat(document.getElementById('f-controller').value) || 0,
    };
  }

  function totalCost(comp) {
    return (comp.unitCost * comp.qty) + comp.installCost + comp.controllerCost;
  }

  function metaLine(comp) {
    return `${comp.qty}× ${comp.watts}W ${comp.turbineType.toUpperCase()} · ${comp.windSpeed}m/s · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();