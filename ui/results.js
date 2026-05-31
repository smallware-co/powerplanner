/**
 * ui/results.js
 *
 * Renders the full Results tab.
 * Pulls from EnergyCalc, FinancialCalc, WaterCalc.
 * Depends on: calculator/*.js, app.js.
 */

const Results = (() => {

  /**
   * render
   * Full results tab render. Called when switching to Results tab.
   * @param {object} state  Full app state
   */
  function render(state) {
    const el = document.getElementById('results-content');
    const { components, settings, bill } = state;

    // Check if anything has been added
    const hasEnergy = Object.entries(components)
      .filter(([k]) => k !== 'water')
      .some(([, arr]) => arr.length > 0);

    if (!hasEnergy && !components.water.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-title">No components yet</div>
        <div class="empty-sub">Add solar panels or wind turbines in the Build tab to see your results.</div>
        <button class="cta-btn" onclick="App.switchTab('build')">Go to Build →</button>
      </div>`;
      return;
    }

    // Run all calculations
    const { breakdown, totalMonthly, totalDaily } = EnergyCalc.totalGeneration(components, settings);
    const systemCost   = FinancialCalc.totalSystemCost(components);
    const fin          = FinancialCalc.monthlySavings(bill, totalMonthly, components, settings);
    const proj         = FinancialCalc.projection(systemCost, fin.savings, settings);
    const waterTotals  = WaterCalc.totalMonthly(components.water, settings);
    const batteryKwh   = EnergyCalc.totalBatteryStorage(components.battery);
    const monthlyKwh   = bill / settings.rate;

    el.innerHTML = [
      renderHero(fin, bill),
      renderEnergyCards(totalDaily, totalMonthly, monthlyKwh, batteryKwh),
      renderGenerationBars(breakdown, totalMonthly),
      renderSystemCost(systemCost, proj),
      waterTotals.totalLitersPerMonth > 0 ? renderWater(waterTotals) : '',
      renderProjection(proj, systemCost),
      '<div style="height:2rem;"></div>',
    ].join('');
  }

  function renderHero(fin, bill) {
    const reductionColor = fin.reduction >= 50 ? 'text-green' : fin.reduction >= 25 ? 'text-amber' : 'text-red';
    return `<div class="results-hero">
      <div class="results-hero-label">Bill reduction</div>
      <div class="results-hero-value ${reductionColor}">${Math.round(fin.reduction)}%</div>
      <div class="results-hero-sub">₱${Math.round(fin.newBill).toLocaleString()}/mo new bill · was ₱${bill.toLocaleString()}/mo</div>
    </div>`;
  }

  function renderEnergyCards(dailyKwh, monthlyKwh, consumptionKwh, batteryKwh) {
    const coveragePct = consumptionKwh > 0 ? Math.min(100, (monthlyKwh / consumptionKwh) * 100) : 0;
    return `<div class="results-grid">
      <div class="result-card accent-amber">
        <div class="result-card-label">Daily generation</div>
        <div class="result-card-value">${dailyKwh.toFixed(1)}</div>
        <div class="result-card-unit">kWh per day</div>
      </div>
      <div class="result-card accent-green">
        <div class="result-card-label">Monthly generation</div>
        <div class="result-card-value">${Math.round(monthlyKwh).toLocaleString()}</div>
        <div class="result-card-unit">kWh per month</div>
      </div>
      <div class="result-card accent-cyan">
        <div class="result-card-label">Consumption coverage</div>
        <div class="result-card-value">${Math.round(coveragePct)}%</div>
        <div class="result-card-unit">of your monthly kWh</div>
      </div>
      <div class="result-card accent-blue">
        <div class="result-card-label">Battery storage</div>
        <div class="result-card-value">${batteryKwh > 0 ? batteryKwh.toFixed(1) : '—'}</div>
        <div class="result-card-unit">${batteryKwh > 0 ? 'kWh usable' : 'no batteries'}</div>
      </div>
    </div>`;
  }

  function renderGenerationBars(breakdown, total) {
    if (total <= 0) return '';
    const sources = Object.values(breakdown).filter(s => s.monthlyKwh > 0);
    if (!sources.length) return '';

    const bars = sources.map(s => {
      const pct = Math.round((s.monthlyKwh / total) * 100);
      return `<div class="gen-bar-item">
        <div class="gen-bar-meta">
          <span class="gen-bar-name">${s.label}</span>
          <span class="gen-bar-val">${Math.round(s.monthlyKwh)} kWh/mo · ${pct}%</span>
        </div>
        <div class="gen-bar-track">
          <div class="gen-bar-fill" style="width:${pct}%; background:${s.color};"></div>
        </div>
      </div>`;
    }).join('');

    return `<div class="results-section-title">Generation breakdown</div>
      <div class="gen-bar-list">${bars}</div>`;
  }

  function renderSystemCost(systemCost, proj) {
    return `<div class="results-grid">
      <div class="result-card accent-amber">
        <div class="result-card-label">System cost</div>
        <div class="result-card-value">₱${Math.round(systemCost / 1000)}k</div>
        <div class="result-card-unit">total investment</div>
      </div>
      <div class="result-card accent-green">
        <div class="result-card-label">Payback period</div>
        <div class="result-card-value">${proj.paybackYear ? proj.paybackYear + ' yrs' : 'N/A'}</div>
        <div class="result-card-unit">${proj.paybackYear ? 'to break even' : 'check inputs'}</div>
      </div>
      <div class="result-card accent-blue">
        <div class="result-card-label">Lifetime ROI</div>
        <div class="result-card-value">${proj.roi}%</div>
        <div class="result-card-unit">over ${proj.rows.length} years</div>
      </div>
      <div class="result-card accent-cyan">
        <div class="result-card-label">Total saved</div>
        <div class="result-card-value">₱${Math.round(proj.totalLifetimeSaving / 1000)}k</div>
        <div class="result-card-unit">gross lifetime</div>
      </div>
    </div>`;
  }

  function renderWater(w) {
    return `<div class="results-section-title">💧 Water collection</div>
    <div class="results-grid">
      <div class="result-card accent-blue">
        <div class="result-card-label">Avg collected</div>
        <div class="result-card-value">${w.totalLitersPerMonth.toLocaleString()}</div>
        <div class="result-card-unit">liters per month</div>
      </div>
      <div class="result-card accent-cyan">
        <div class="result-card-label">Water bill saving</div>
        <div class="result-card-value">₱${w.totalMonthlySaving.toLocaleString()}</div>
        <div class="result-card-unit">per month avg</div>
      </div>
    </div>`;
  }

  function renderProjection(proj, systemCost) {
    // Show every year up to 10, then every 5
    const display = proj.rows.filter(r => r.year <= 10 || r.year % 5 === 0);

    const rows = display.map(r => {
      const rowClass = r.isPayback ? 'proj-row payback-row' : 'proj-row';
      const cumulColor = r.cumulative >= 0 ? 'text-green' : 'text-red';
      return `<div class="${rowClass}">
        <div class="proj-year">Yr ${r.year}</div>
        <div class="proj-gen">₱${r.annualSaving.toLocaleString()}</div>
        <div class="proj-cumul ${cumulColor}">₱${r.cumulative.toLocaleString()}</div>
        ${r.isPayback ? '<div style="font-size:10px; color:#10b981; font-weight:700;">✓ PAID</div>' : '<div></div>'}
      </div>`;
    }).join('');

    return `<div class="results-section-title">Financial projection</div>
    <div class="projection-table">
      <div class="proj-row header">
        <div class="proj-year">Year</div>
        <div class="proj-gen">Annual saving</div>
        <div class="proj-cumul">Cumulative</div>
        <div></div>
      </div>
      ${rows}
    </div>`;
  }

  return { render };

})();
