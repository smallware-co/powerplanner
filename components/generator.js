/**
 * components/generator.js
 *
 * Quiet inverter generator component.
 * Models fuel cost, runtime hours, output watts.
 * Called by: ui/builder.js
 */

const GeneratorComponent = (() => {

  const type  = 'generator';
  const label = 'Generator';
  const icon  = '⚙️';

  const DEFAULTS = {
    name:         'Inverter Generator',
    watts:        2000,
    fuelPerHr:    0.9,
    dailyHours:   4,
    fuelCost:     65,
    unitCost:     35000,
    daysPerMonth: 10,
  };

  function formHTML() {
    return `
      <button type="button" class="use-defaults-btn" onclick="UI.fillDefaults()">Use typical values</button>
      <div class="form-field">
        <label>Generator name</label>
        <input type="text" id="f-name" placeholder="e.g. Honda EU22i">
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Rated watts</label>
          <input type="number" id="f-watts" min="100" max="10000" placeholder="e.g. 2000">
        </div>
        <div class="form-field">
          <label>Fuel consumption (L/hr)</label>
          <input type="number" id="f-fuel" step="0.1" min="0.1" placeholder="e.g. 0.9">
          <div class="form-hint">At 50% load typical</div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Avg use per day (hrs)</label>
          <input type="number" id="f-hours" min="0" max="24" placeholder="e.g. 4">
        </div>
        <div class="form-field">
          <label>Fuel cost (₱/liter)</label>
          <input type="number" id="f-fuel-cost" min="0" placeholder="e.g. 65">
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>Unit purchase cost (₱)</label>
          <input type="number" id="f-unit-cost" min="0" placeholder="e.g. 35000">
        </div>
        <div class="form-field">
          <label>Use days per month</label>
          <input type="number" id="f-days" min="0" max="31" placeholder="e.g. 10">
          <div class="form-hint">Backup / brownout days</div>
        </div>
      </div>
    `;
  }

  function readForm() {
    return {
      type,
      name:         document.getElementById('f-name').value.trim() || label,
      watts:        parseFloat(document.getElementById('f-watts').value),
      fuelPerHr:    parseFloat(document.getElementById('f-fuel').value),
      dailyHours:   parseFloat(document.getElementById('f-hours').value),
      fuelCost:     parseFloat(document.getElementById('f-fuel-cost').value),
      unitCost:     parseFloat(document.getElementById('f-unit-cost').value),
      daysPerMonth: parseInt(document.getElementById('f-days').value),
    };
  }

  function totalCost(comp) { return comp.unitCost; }

  function metaLine(comp) {
    const monthly = comp.fuelPerHr * comp.dailyHours * comp.daysPerMonth * comp.fuelCost;
    return `${comp.watts}W · ${comp.daysPerMonth}d/mo · ₱${Math.round(monthly).toLocaleString()}/mo fuel`;
  }

  return { type, label, icon, formHTML, readForm, totalCost, metaLine, defaults: DEFAULTS };

})();