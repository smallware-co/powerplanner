/**
 * calculator/energy.js
 *
 * Pure energy generation math. No DOM. No side effects.
 * All functions take component data + settings, return kWh values.
 * Called by: ui/results.js
 */

const EnergyCalc = (() => {

  /**
   * solar
   * Daily and monthly kWh from a solar panel set.
   * Formula: (qty × watts × peakSunHours × efficiency) / 1000
   * @param  {object} comp      Solar component data
   * @param  {object} settings  Global settings
   * @return {object} { dailyKwh, monthlyKwh, systemKwp }
   */
  function solar(comp, settings) {
    const systemKwp   = (comp.qty * comp.watts) / 1000;
    const dailyKwh    = systemKwp * settings.sunHours * comp.efficiency;
    const monthlyKwh  = dailyKwh * 30;
    return { dailyKwh, monthlyKwh, systemKwp };
  }

  /**
   * wind
   * Daily and monthly kWh from a wind turbine set.
   * Uses cube law: actual output scales with (actual/rated wind)^3
   * Rated wind speed assumed 12 m/s.
   * @param  {object} comp      Wind component data
   * @param  {object} settings  Global settings (windSpeed fallback)
   * @return {object} { dailyKwh, monthlyKwh, capacityFactor }
   */
  function wind(comp, settings) {
    const ratedSpeed     = 12;
    // Component can override global wind speed
    const actualSpeed    = comp.windSpeed || settings.windSpeed;
    const capacityFactor = Math.min(1, Math.pow(actualSpeed / ratedSpeed, 3));
    const totalRatedKw   = (comp.watts * comp.qty) / 1000;

    // 24hr generation at capacity factor, with 85% system efficiency
    const dailyKwh   = totalRatedKw * 24 * capacityFactor * 0.85;
    const monthlyKwh = dailyKwh * 30;

    return { dailyKwh, monthlyKwh, capacityFactor };
  }

  /**
   * hydro
   * Monthly kWh from micro-hydro roof runoff.
   * Only generates during rainy months.
   * Actual output capped by rated watts and daily run hours.
   * @param  {object} comp      Hydro component data
   * @param  {object} settings  Global settings (rainMonths, rainfall)
   * @return {object} { dailyKwhRainy, monthlyKwh, annualKwh }
   */
  function hydro(comp, settings) {
    // Efficiency factor based on head height (higher head = better pressure)
    // Simple approximation: 0.5 efficiency base + 0.05 per meter of head, capped at 0.85
    const headEfficiency = Math.min(0.85, 0.5 + comp.headHeight * 0.04);
    const effectiveWatts = comp.watts * headEfficiency;

    const dailyKwhRainy = (effectiveWatts * comp.dailyHours) / 1000;
    // Only runs during rainy months — annualize then monthly average
    const annualKwh     = dailyKwhRainy * 30 * settings.rainMonths;
    const monthlyKwh    = annualKwh / 12;

    return { dailyKwhRainy, monthlyKwh, annualKwh };
  }

  /**
   * generator
   * Monthly kWh output from a generator.
   * Also returns monthly fuel cost.
   * @param  {object} comp  Generator component data
   * @return {object} { monthlyKwh, monthlyFuelCost }
   */
  function generator(comp) {
    const kwhPerHour     = comp.watts / 1000;
    const monthlyKwh     = kwhPerHour * comp.dailyHours * comp.daysPerMonth;
    const monthlyFuelCost = comp.fuelPerHr * comp.dailyHours * comp.daysPerMonth * comp.fuelCost;
    return { monthlyKwh, monthlyFuelCost };
  }

  /**
   * totalGeneration
   * Sums monthly kWh across all energy components.
   * Returns per-source breakdown + total.
   * @param  {object} components  All component arrays from state
   * @param  {object} settings    Global settings
   * @return {object} Breakdown by source + totals
   */
  function totalGeneration(components, settings) {
    const breakdown = {
      solar:     { monthlyKwh: 0, dailyKwh: 0, label: 'Solar', color: '#f59e0b' },
      wind:      { monthlyKwh: 0, dailyKwh: 0, label: 'Wind',  color: '#06b6d4' },
      hydro:     { monthlyKwh: 0, dailyKwh: 0, label: 'Micro-hydro', color: '#3b82f6' },
      generator: { monthlyKwh: 0, dailyKwh: 0, label: 'Generator',   color: '#8b5cf6' },
    };

    components.solar.forEach(c => {
      const r = solar(c, settings);
      breakdown.solar.monthlyKwh += r.monthlyKwh;
      breakdown.solar.dailyKwh   += r.dailyKwh;
    });

    components.wind.forEach(c => {
      const r = wind(c, settings);
      breakdown.wind.monthlyKwh += r.monthlyKwh;
      breakdown.wind.dailyKwh   += r.dailyKwh;
    });

    components.hydro.forEach(c => {
      const r = hydro(c, settings);
      breakdown.hydro.monthlyKwh += r.monthlyKwh;
      breakdown.hydro.dailyKwh   += r.dailyKwh;
    });

    components.generator.forEach(c => {
      const r = generator(c);
      breakdown.generator.monthlyKwh += r.monthlyKwh;
      breakdown.generator.dailyKwh   += r.monthlyKwh / 30;
    });

    const totalMonthly = Object.values(breakdown).reduce((s, v) => s + v.monthlyKwh, 0);
    const totalDaily   = Object.values(breakdown).reduce((s, v) => s + v.dailyKwh,   0);

    return { breakdown, totalMonthly, totalDaily };
  }

  /**
   * totalBatteryStorage
   * Sums usable kWh across all battery components.
   * @param  {Array} batteries  Battery component array
   * @return {number} Usable kWh
   */
  function totalBatteryStorage(batteries) {
    return batteries.reduce((sum, b) => sum + (b.capacityKwh * b.dod), 0);
  }

  return { solar, wind, hydro, generator, totalGeneration, totalBatteryStorage };

})();
