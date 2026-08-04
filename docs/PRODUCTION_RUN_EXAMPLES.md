# StockFlow Pro — Production Run Worked Examples

Concrete numbers for every recipe in both demo datasets, so you know exactly what to expect on screen when you run Production live (or can explain the math if you skip running it and just narrate the existing stock).

**The formula the app uses** (`ManufacturerService.calculate()`): you enter a number of **batches** ("target groups"). Each recipe has a fixed batch size (`unitsPerGroup`). The app computes:

```
total units produced = target groups × units per batch
material consumed     = quantity per unit × total units produced
```

All examples below use **1 batch**, since that's what's safe and quick to run live without materially depleting stock. Run `docs/reset_demo_data.sql` / `docs/reset_demo_data_telecom.sql` first so the numbers below match what you'll actually see.

---

## Demo 1 — Osu Valley Foods (hot sauce / juice)

### Recipe: Kpakpo Shito Hot Sauce — batch size 48 bottles

Enter **1** in Target Batches → Production screen shows:

| Material | Available before | Used per batch (1 batch = 48 bottles) | Remaining after |
|---|---|---|---|
| Fresh Kpakpo Shito Peppers | 40.000 kg | 0.150 × 48 = **7.200 kg** | 32.800 kg |
| Palm Oil | 15.000 L | 0.040 × 48 = **1.920 L** | 13.080 L |
| Dried Prawns | 8.000 kg | 0.020 × 48 = **0.960 kg** | 7.040 kg |
| Garlic | 5.000 kg | 0.015 × 48 = **0.720 kg** | 4.280 kg |
| Glass Bottles 200ml | 300.000 units | 1.000 × 48 = **48.000 units** | 252.000 units |

**Result:** Finished goods for Kpakpo Shito Hot Sauce goes from 96 → **144 bottles** (96 already in stock + 48 just produced). Feasible up to ~6 batches before Garlic or Glass Bottles run low — plenty of headroom for a live run.

### Recipe: Sobolo Hibiscus Juice — batch size 100 bottles

Enter **1** in Target Batches:

| Material | Available before | Used per batch (1 batch = 100 bottles) | Remaining after |
|---|---|---|---|
| Dried Hibiscus Petals | 20.000 kg | 0.030 × 100 = **3.000 kg** | 17.000 kg |
| Fresh Ginger | 6.000 kg | 0.010 × 100 = **1.000 kg** | 5.000 kg |
| Sugar | 40.000 kg | 0.080 × 100 = **8.000 kg** | 32.000 kg |
| PET Bottles 500ml | 250.000 units | 1.000 × 100 = **100.000 units** | 150.000 units |

**Result:** Finished goods for Sobolo Hibiscus Juice goes from 150 → **250 bottles**. Note PET Bottles is the tightest material here (only 2 batches feasible total before restocking) — a good "watch the low-stock flag" talking point if you run a second batch live.

---

## Demo 2 — Konnect Mobile Supplies (telecom)

### Recipe: SIM Starter Pack — batch size 100 packs

Enter **1** in Target Batches:

| Material | Available before | Used per batch (1 batch = 100 packs) | Remaining after |
|---|---|---|---|
| Blank SIM Cards | 5,000.000 units | 1.000 × 100 = **100.000 units** | 4,900.000 units |
| Starter Pack Sleeves | 3,000.000 units | 1.000 × 100 = **100.000 units** | 2,900.000 units |

**Result:** Finished goods for SIM Starter Pack goes from 400 → **500 packs**. Huge headroom (30+ batches feasible) — safe to run live more than once if you want to show it twice.

### Recipe: GHS 10 Recharge Card — batch size 200 cards

Enter **1** in Target Batches:

| Material | Available before | Used per batch (1 batch = 200 cards) | Remaining after |
|---|---|---|---|
| PVC Scratch Card Blanks | 8,000.000 units | 1.000 × 200 = **200.000 units** | 7,800.000 units |
| Scratch-Panel Foil | 2,000.000 sheets | 1.000 × 200 = **200.000 sheets** | 1,800.000 sheets |

**Result:** Finished goods for GHS 10 Recharge Card goes from 900 → **1,100 cards**.

### Recipe: GHS 20 Recharge Card — batch size 200 cards

Enter **1** in Target Batches:

| Material | Available before | Used per batch (1 batch = 200 cards) | Remaining after |
|---|---|---|---|
| PVC Scratch Card Blanks | 8,000.000 units | 1.000 × 200 = **200.000 units** | 7,800.000 units |
| Scratch-Panel Foil | 2,000.000 sheets | 1.000 × 200 = **200.000 sheets** | 1,800.000 sheets |

**Result:** Finished goods for GHS 20 Recharge Card goes from 600 → **800 cards**.

> **Heads up:** GHS 10 and GHS 20 Recharge Cards share the same two materials (PVC Scratch Card Blanks, Scratch-Panel Foil). If you run both recipes live in the same demo, Scratch-Panel Foil is the tightest shared material — 2,000 sheets supports 10 combined batches (either card type) before running low. Comfortable for a demo, just worth knowing if you run production more than twice.

---

## How this feeds into the full chain

Once a production run finishes goods, that stock is what Dispatch draws from — see `docs/DEMO_GUIDE.md` for the full manufacturer → wholesaler → retailer walkthrough for both demos, including the exact dispatch/receive/sell quantities used at each tier (30 dispatched → 12→42 in the wholesaler's warehouse → 15 sold to the retailer → 6→21 on the retailer's shelf, same shape for both hot sauce and SIM Starter Packs).

If you'd rather skip running Production live (it does consume real material stock each time), just open the **Recipes** screen, show the bill-of-materials for one recipe, and narrate: "this is exactly how the 96 bottles already in stock got there" — the numbers above are what you'd cite if asked.
