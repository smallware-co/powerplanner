/**
 * calculator/financial.js
 *
 * Financial projection math. No DOM. No side effects.
 * Handles: monthly savings, payback period, year-by-year projection,
 *          net metering credits, generator fuel costs.
 * Called by: ui/results.js
 */

const FinancialCalc = (() => {

  /**
   * totalSystemCost
   * Sums installed cost across all energy + storage components.
   * Water components tracked separately (different ROI model).
   * @param  {object} components  All component arrays
   * @return {number} Total ₱ investment
   */
  function totalSystemCost(components) {
    let total = 0;

    components.solar.forEach(c     => { total += SolarComponent.totalCost(c); });
    components.wind.forEach(c      => { total += WindComponent.totalCost(c); });
    components.hydro.forEach(c     => { total += HydroComponent.totalCost(c); });
    components.generator.forEach(c => { total += GeneratorComponent.totalCost(c); });
    components.battery.forEach(c   => { total += BatteryComponent.totalCost(c); });

    return total;
  }

  /**
   * monthlySavings
   * Calculates monthly bill reduction from renewable generation.
   * Accounts for net metering credits on excess generation.
   *
   * Logic:
   *   - Generation up to monthly consumption saves at full Meralco rate
   *   - Generation above consumption earns net metering credit rate
   *   - Generator fuel is a NEW monthly cost (subtracted from savings)
   *
   * @param  {number} monthlyBill     Current Meralco bill (₱)
   * @param  {number} totalGenMonthly kWh generated per month
   * @param  {object} components      All component arrays
   * @param  {object} settings        Global settings
   * @return {object} { savings, newBill, netMeterCredit, fuelCost, reduction }
   */
  function monthlySavings(monthlyBill, totalGenMonthly, components, settings) {
    const monthlyKwh = monthlyBill / settings.rate;

    // kWh offset against Meralco (up to consumption)
    const offsetKwh   = Math.min(totalGenMonthly, monthlyKwh);
    const excessKwh   = Math.max(0, totalGenMonthly - monthlyKwh);

    // Direct savings: offset kWh at Meralco rate
    const directSaving   = offsetKwh * settings.rate;

    // Net metering credit on excess exported to grid
    const netMeterCredit = excessKwh * settings.netMeter;

    // Generator fuel costs (new ongoing expense)
    let fuelCost = 0;
    components.generator.forEach(c => {
      const r = EnergyCalc.generator(c);
      fuelCost += r.monthlyFuelCost;
    });

    const totalSavings = directSaving + netMeterCredit - fuelCost;
    const newBill      = Math.max(0, monthlyBill - directSaving - netMeterCredit);
    const reduction    = monthlyBill > 0 ? (totalSavings / monthlyBill) * 100 : 0;

    return {
      savings: totalSavings,
      newBill,
      netMeterCredit,
      fuelCost,
      reduction: Math.min(100, reduction),
    };
  }

  /**
   * projection
   * Year-by-year financial projection over N years.
   * Meralco rate increases annually (inflation factor).
   *
   * @param  {number} systemCost      Total upfront investment (₱)
   * @param  {number} baseMonthSaving Monthly savings at current rate (₱)
   * @param  {object} settings        projYears, rateIncrease
   * @return {object} { rows, paybackYear, totalLifetimeSaving, roi }
   */
  function projection(systemCost, baseMonthSaving, settings) {
    const rows = [];
    let cumulative    = -systemCost;  // starts negative (investment)
    let paybackYear   = null;
    let annualSaving  = baseMonthSaving * 12;

    for (let yr = 1; yr <= settings.projYears; yr++) {
      // Meralco rate compounds annually — savings grow with it
      annualSaving = annualSaving * (1 + settings.rateIncrease / 100);
      cumulative  += annualSaving;

      if (paybackYear === null && cumulative >= 0) {
        paybackYear = yr;
      }

      rows.push({
        year:        yr,
        annualSaving: Math.round(annualSaving),
        cumulative:   Math.round(cumulative),
        isPayback:    paybackYear === yr,
      });
    }

    const totalLifetimeSaving = cumulative + systemCost; // gross savings
    const roi = systemCost > 0 ? ((totalLifetimeSaving / systemCost) * 100) : 0;

    return { rows, paybackYear, totalLifetimeSaving: Math.round(totalLifetimeSaving), roi: Math.round(roi) };
  }

  return { totalSystemCost, monthlySavings, projection };

})();
