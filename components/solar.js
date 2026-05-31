/**
 * components/solar.js
 *
 * Solar panel component definition.
 * Provides: modal form fields, display label, per-unit kWh estimate.
 * Called by: ui/builder.js
 */

const SolarComponent = (() => {

  const type = 'solar';
  const label = 'Solar Panel';
  const icon = '🔆';

  /**
   * formHTML
   * Returns the modal form HTML for adding a solar panel set.
   * @return {string} HTML string
   */
  function formHTML() {
    return `
      <div class="form-field">
        <label>Panel name / label</label>
        <input type="text" id="f-name" placeholder="e.g. Longi 450W rooftop" value="Solar Panel Set">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Quantity</label>
          <input type="number" id="f-qty" value="6" min="1" max="100">
        </div>
        <div class="form-field">
          <label>Watts per panel</label>
          <input type="number" id="f-watts" value="450" min="50" max="1000">
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Cost per panel (₱)</label>
          <input type="number" id="f-unit-cost" value="5000" min="0">
        </div>
        <div class="form-field">
          <label>System efficiency (%)</label>
          <input type="number" id="f-efficiency" value="85" min="50" max="100">
          <div class="form-hint">Typical: 80–90%</div>
        </div>
      </div>
      <div class="form-field">
        <label>Inverter cost (₱)</label>
        <input type="number" id="f-inverter" value="65000" min="0">
        <div class="form-hint">Shared cost for this panel set (e.g. Growatt 5kW)</div>
      </div>
      <div class="form-field">
        <label>Mounting + wiring cost (₱)</label>
        <input type="number" id="f-install" value="30000" min="0">
      </div>
    `;
  }

  /**
   * readForm
   * Reads modal form values and returns a component data object.
   * @return {object} Component data
   */
  function readForm() {
    return {
      type,
      name:       document.getElementById('f-name').value || label,
      qty:        parseInt(document.getElementById('f-qty').value)       || 1,
      watts:      parseFloat(document.getElementById('f-watts').value)   || 450,
      unitCost:   parseFloat(document.getElementById('f-unit-cost').value) || 5000,
      efficiency: parseFloat(document.getElementById('f-efficiency').value) / 100 || 0.85,
      inverterCost: parseFloat(document.getElementById('f-inverter').value) || 0,
      installCost:  parseFloat(document.getElementById('f-install').value)  || 0,
    };
  }

  /**
   * totalCost
   * Returns total installed cost for this component.
   * @param  {object} comp  Component data
   * @return {number} ₱
   */
  function totalCost(comp) {
    return (comp.unitCost * comp.qty) + comp.inverterCost + comp.installCost;
  }

  /**
   * metaLine
   * Short summary string for the component card.
   * @param  {object} comp  Component data
   * @return {string}
   */
  function metaLine(comp) {
    const kWp = ((comp.watts * comp.qty) / 1000).toFixed(1);
    return `${comp.qty}× ${comp.watts}W · ${kWp} kWp · ₱${totalCost(comp).toLocaleString()}`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();
