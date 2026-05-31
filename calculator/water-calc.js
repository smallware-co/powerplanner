/**
 * calculator/water-calc.js
 *
 * Rainwater collection math.
 * Outputs: liters collected per month, peso savings on water bill.
 * Called by: ui/results.js
 */

const WaterCalc = (() => {

  /**
   * monthly
   * Calculates monthly water collected and savings.
   * Formula: catchArea (sqm) × rainfall (mm) × efficiency × 1L per mm per sqm
   *
   * @param  {object} comp      Water component data
   * @param  {object} settings  rainMonths, rainfall (mm/month), waterRate (₱/m³)
   * @return {object} { litersPerMonth, annualLiters, monthlyPesoSaving }
   */
  function monthly(comp, settings) {
    // Convert mm of rain over sqm to liters: 1mm × 1sqm = 1 liter
    const litersRainyMonth = comp.catchArea * settings.rainfall * comp.efficiency;

    // Average across all 12 months (only rains during rainy months)
    const litersPerMonth   = (litersRainyMonth * settings.rainMonths) / 12;
    const annualLiters     = litersRainyMonth * settings.rainMonths;

    // ₱ savings: waterRate is per cubic meter (1000L)
    const monthlyPesoSaving = (litersPerMonth / 1000) * settings.waterRate;

    return {
      litersPerMonth:    Math.round(litersPerMonth),
      annualLiters:      Math.round(annualLiters),
      monthlyPesoSaving: Math.round(monthlyPesoSaving),
    };
  }

  /**
   * totalMonthly
   * Sums water savings across all water components.
   * @param  {Array}  waters    Water component array
   * @param  {object} settings  Global settings
   * @return {object} { totalLitersPerMonth, totalMonthlySaving }
   */
  function totalMonthly(waters, settings) {
    let totalLiters = 0;
    let totalSaving = 0;

    waters.forEach(w => {
      const r = monthly(w, settings);
      totalLiters += r.litersPerMonth;
      totalSaving += r.monthlyPesoSaving;
    });

    return {
      totalLitersPerMonth: Math.round(totalLiters),
      totalMonthlySaving:  Math.round(totalSaving),
    };
  }

  return { monthly, totalMonthly };

})();
