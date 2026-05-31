/**
 * components/generator.js
 *
 * Quiet inverter generator component.
 * Models fuel cost, runtime hours, output watts.
 * Called by: ui/builder.js
 */

const GeneratorComponent = (() => {

  const type = 'generator';
  const label = 'Generator';
  const icon = '⚙️';

  function formHTML() {
    return `
      <div class="form-field">
        <label>Generator name</label>
        <input type="text" id="f-name" placeholder="e.g. Honda EU22i" value="Inverter Generator">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Rated watts</label>
          <input type="number" id="f-watts" value="2000" min="100" max="10000">
        </div>
        <div class="form-field">
          <label>Fuel consumption (L/hr)</label>
          <input type="number" id="f-fuel" value="0.9" step="0.1" min="0.1">
          <div class="form-hint">At 50% load typical</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Avg use per day (hrs)</label>
          <input type="number" id="f-hours" value="4" min="0" max="24">
        </div>
        <div class="form-field">
          <label>Fuel cost (₱/liter)</label>
          <input type="number" id="f-fuel-cost" value="65" min="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Unit purchase cost (₱)</label>
          <input type="number" id="f-unit-cost" value="35000" min="0">
        </div>
        <div class="form-field">
          <label>Use days per month</label>
          <input type="number" id="f-days" value="10" min="0" max="31">
          <div class="form-hint">Backup / brownout days</div>
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:       document.getElementById('f-name').value || label,
      watts:      parseFloat(document.getElementById('f-watts').value)     || 2000,
      fuelPerHr:  parseFloat(document.getElementById('f-fuel').value)      || 0.9,
      dailyHours: parseFloat(document.getElementById('f-hours').value)     || 4,
      fuelCost:   parseFloat(document.getElementById('f-fuel-cost').value) || 65,
      unitCost:   parseFloat(document.getElementById('f-unit-cost').value) || 35000,
      daysPerMonth: parseInt(document.getElementById('f-days').value)      || 10,
    };
  }

  function totalCost(comp) { return comp.unitCost; }

  function metaLine(comp) {
    const monthly = comp.fuelPerHr * comp.dailyHours * comp.daysPerMonth * comp.fuelCost;
    return `${comp.watts}W · ${comp.daysPerMonth}d/mo · ₱${Math.round(monthly).toLocaleString()}/mo fuel`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine };

})();
