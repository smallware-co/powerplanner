/**
 * components/solar.js
 *
 * Solar panel component definition.
 * Provides: modal form fields, display label, per-unit kWh estimate.
 * Called by: ui/builder.js
 */

const SolarComponent = (() => {

  const type  = 'solar';
  const label = 'Solar Panel';
  const icon  = '🔆';

  const DEFAULTS = {
    name:         'Solar Panel Set',
    qty:          6,
    watts:        450,
    unitCost:     5000,
    efficiency:   85,
    inverterCost: 65000,
    installCost:  30000,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>Panel name / label</label>
        <input type="text" id="f-name" placeholder="e.g. Longi 450W rooftop">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Quantity</label>
          <input type="number" id="f-qty" min="1" max="100" placeholder="e.g. 6">
        </div>
        <div class="form-field">
          <label>Watts per panel</label>
          <input type="number" id="f-watts" min="50" max="1000" placeholder="e.g. 450">
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Cost per panel (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 5000">
        </div>
        <div class="form-field">
          <label>System efficiency (%)</label>
          <input type="number" id="f-efficiency" min="50" max="100" placeholder="e.g. 85">
          <div class="form-hint">Typical: 80–90%</div>
        </div>
      </div>
      <div class="form-field">
        <label>Inverter cost (₱)</label>
        <input type="number" id="f-inverter" min="0" placeholder="e.g. 65000">
        <div class="form-hint">Shared cost for this panel set (e.g. Growatt 5kW)</div>
      </div>
      <div class="form-field">
        <label>Mounting + wiring cost (₱)</label>
        <input type="number" id="f-install" min="0" placeholder="e.g. 30000">
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:         document.getElementById('f-name').value.trim() || label,
      qty:          parseInt(document.getElementById('f-qty').value),
      watts:        parseFloat(document.getElementById('f-watts').value),
      unitCost:     parseFloat(document.getElementById('f-unit-cost').value),
      efficiency:   parseFloat(document.getElementById('f-efficiency').value) / 100,
      inverterCost: parseFloat(document.getElementById('f-inverter').value) || 0,
      installCost:  parseFloat(document.getElementById('f-install').value)  || 0,
    };
  }

  function totalCost(comp) {
    return (comp.unitCost * comp.qty) + comp.inverterCost + comp.installCost;
  }

  function metaLine(comp) {
    const kWp = ((comp.watts * comp.qty) / 1000).toFixed(1);
    return `${comp.qty}× ${comp.watts}W · ${kWp} kWp · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();