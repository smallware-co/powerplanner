# ⚡ PowerPlanner

**Renewable energy build planner. Mix solar, wind, hydro, and more — see your real numbers.**

A Smallware Co. app.

---

## What it does

PowerPlanner lets you build a custom renewable energy setup from scratch and see exactly what you'll generate, save, and earn back over time.

You add your actual components — panels, turbines, whatever — enter real prices and specs, and the app does the math. No sliders locked to assumptions. You control every input.

**Energy sources:**
- Solar panels (any wattage, any quantity)
- Wind turbines — VAWT or HAWT
- Micro-hydro (roof runoff pipe turbine)
- Inverter generator (with fuel cost tracking)

**Storage & water:**
- Battery bank (LiFePO4, AGM, Li-Ion — with depth of discharge)
- Rainwater collection (liters/month + water bill savings)

**Outputs:**
- kWh/day and kWh/month per source
- Bill reduction % and new estimated monthly bill
- Net metering credit calculation
- Total system cost
- Payback period
- Year-by-year financial projection with Meralco rate inflation
- Lifetime ROI
- Water savings in liters and pesos

---

## Built for

Filipino households and small operations running on Meralco. Works anywhere — just update the rates in Settings.

---

## Stack

Pure vanilla JS. No frameworks. No dependencies. No build step.

```
index.html
styles.css
app.js
storage.js
components/     ← one file per energy source
calculator/     ← pure math, zero DOM
ui/             ← rendering only
manifest.json
sw.js           ← offline PWA
```

---

## Run it

No install needed. Just serve the folder:

```bash
npx serve .
```

Or open `index.html` directly in a browser for local testing.

---

## PWA install

Open in mobile browser → Add to Home Screen. Works offline after first load.

---

## Smallware Co.

PowerPlanner is App #1 from [Smallware Co.](https://smallware.co) — an indie app studio building small, useful tools.

---

## License

MIT
