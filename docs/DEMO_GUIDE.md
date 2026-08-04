# StockFlow Pro — Live Demo Guide

Before demoing: run `docs/reset_demo_data.sql` in the Neon SQL editor to get a clean, coherent starting state. Do this the night before or morning of — not seconds before you go on stage.

**⚠️ Warm up the backend 2–3 minutes before you go on** — open the app or hit `https://stockflow-backend-qwpt.onrender.com` once yourself first. Render's free tier sleeps after inactivity; the first request after that can take 30–60 seconds and will look frozen if that happens live.

## Login credentials

| Tier | Email | Password | Business |
|---|---|---|---|
| Manufacturer | `demo.manufacturer@stockflow.test` | `Demo1234!` | Osu Valley Foods |
| Wholesaler | `demo.wholesaler@stockflow.test` | `Demo1234!` | Tema Central Distributors |
| Retailer | `demo.retailer@stockflow.test` | `Demo1234!` | Adjei's Corner Shop |

All three are already linked to each other (Manufacturer ↔ Wholesaler ↔ Retailer), so no setup step is needed live — you go straight into transactions.

---

## The story: one product, all the way through the chain

**Kpakpo Shito Hot Sauce** is produced by Osu Valley Foods, already sitting in small quantity at Tema Central's warehouse, and already on the shelf in small quantity at Adjei's Corner Shop. This is deliberate — the same product moves through all three tiers live, so the audience sees one continuous chain instead of three disconnected screens.

### Step 1 — Manufacturer: show what's already been produced
Log in as **Osu Valley Foods**.
- **Dashboard** → point out the KPI tiles (raw materials, low stock, production runs this month, credit owed) and the finished-goods figure.
- **Materials** → show the raw ingredients (peppers, palm oil, prawns, garlic, bottles) with quantities and low-stock flags.
- **Recipes** → open "Kpakpo Shito Hot Sauce" → show the bill of materials (exact quantity of each ingredient per bottle).
- **Production** → this is optional to run live (it consumes real material stock) — either run a small batch to show the calculation preview, or skip straight to Dispatch and just narrate that this is how the 96 bottles already in stock got there.

### Step 2 — Manufacturer dispatches to the wholesaler
- **Dispatch** → select **Tema Central Distributors** as the linked wholesaler.
- Add **Kpakpo Shito Hot Sauce**, quantity **30**.
- Payment mode: **Cash** (fastest for a live demo) or **Credit** (to show the credit-tracking feature — pick one deliberately, don't both).
- Delivery mode: **Delivery** (fill in a driver name/vehicle for a nice touch) or **Pickup** (generates a pickup code emailed to the buyer — a good feature to point out but needs the wholesaler's email accessible).
- Confirm → point out the success animation and the auto-generated invoice.

### Step 3 — Wholesaler receives it
Log out, log in as **Tema Central Distributors**.
- **Warehouse** → point out "Kpakpo Shito Hot Sauce" currently flagged **low stock** (12 in stock, threshold 20) — this is the "before" moment.
- **More → Receive Stock** → select Kpakpo Shito Hot Sauce, quantity **30**, manufacturer: Osu Valley Foods, same payment mode you dispatched with.
- Go back to **Warehouse** → the quantity jumped from 12 → 42, and the low-stock flag is gone. This before/after is the clearest "it actually works" moment in the whole demo.

### Step 4 — Wholesaler sells to the retailer
- **Sell** (bulk order screen) → select **Adjei's Corner Shop** as the linked retailer.
- Add **Kpakpo Shito Hot Sauce**, quantity **15**, at a marked-up price.
- Payment mode: same as before for consistency, or switch to **Mobile Money** to show that flow (enter any number, e.g. `0244000000`).
- Confirm.

### Step 5 — Retailer stocks it in and sells one at the till
Log out, log in as **Adjei's Corner Shop**.
- **Products** → "Kpakpo Shito Hot Sauce" is flagged low stock (6 in stock, threshold 10).
- **More → Stock In** → select it, quantity **15**, wholesaler: Tema Central Distributors. Quantity becomes 21, low-stock flag clears.
- **POS** → add 1–2 bottles of Kpakpo Shito Hot Sauce to the cart, plus a couple of unrelated shelf items (Coca-Cola, biscuits) to show a realistic multi-item sale.
- Payment mode: **Card** (Ghana is the one live Paystack market — this is the moment to show the real Paystack checkout) or **Cash** if you don't want to risk a live payment gateway on stage.
- Confirm → this is where the confetti/checkmark celebration animation fires. Let it play, it's a good beat to pause on.
- Point out the auto-generated invoice and, if you entered a customer phone number, that a Customer record now exists with this purchase in their history.

---

## Extra features worth showing if you have time

- **Credit tab** (any tier) — if you paid on credit anywhere above, show the outstanding balance and the due date, from both the creditor's and debtor's side.
- **Team Activity** (More menu, owner accounts only) — show the monthly-grouped activity log; mention the 3-day review window and that clearing a month only hides it from view, never deletes it (a permanent record is also emailed automatically).
- **Marketplace** — show the public directory of manufacturers/wholesalers, and that any business can list itself to find new trading partners.
- **Dark mode** — Profile → Appearance — toggle it live, a cheap but effective visual moment.
- **Multi-currency** — Profile → Country — Ghana is fully live (GHS); switching to Nigeria/Kenya/etc. shows the currency display change instantly, with card payments correctly marked "coming soon" there (explain this is deliberate scoping, not a bug — Paystack only has a live merchant account in Ghana today).
- **Offline-safe sales** — turn on airplane mode mid-sale on POS, complete a sale anyway, show the "saved offline, will sync" message, turn airplane mode back off, show it sync automatically. Higher risk live (needs a clean network toggle), only do this if you've rehearsed it once beforehand.

## If something looks slow or frozen

That's almost certainly the Render cold start, not a bug — see the warm-up note at the top. If it happens live anyway, just narrate it: "this is a free-tier hosting limitation, not the app — give it a few seconds."

---

# Second demo: a telecom/services-style business

Run `docs/reset_demo_data_telecom.sql` to set this up — it's separate from the hot-sauce accounts and safe to run alongside them.

**Why show this one:** it proves the app isn't limited to physical manufacturing. A telecom distributor (the kind of business that sits underneath MTN, Telecel, or AirtelTigo at the distribution level) runs on the exact same Manufacturer → Wholesaler → Retailer model, because what physically moves through the chain — SIM starter packs, scratch/recharge cards — is real, trackable inventory, even though the value being sold is a service (airtime, data). Same schema, same features, completely different industry, zero code changes needed. That's a strong "this generalizes" point for investors.

## Login credentials

| Tier | Email | Password | Business |
|---|---|---|---|
| Manufacturer | `demo2.manufacturer@stockflow.test` | `Demo1234!` | Konnect Mobile Supplies |
| Wholesaler | `demo2.wholesaler@stockflow.test` | `Demo1234!` | Accra Digital Distribution |
| Retailer | `demo2.retailer@stockflow.test` | `Demo1234!` | Mama Efua's Mobile Kiosk |

(Fictional business names on purpose — this demos the *category* of business MTN/Telecel represent, not those companies themselves.)

## The story: SIM Starter Packs, end to end

Same seamless-chain design as the hot-sauce demo — the wholesaler and retailer already stock a small amount of the exact same SIM Starter Packs and recharge cards the manufacturer produces.

1. **Manufacturer (Konnect Mobile Supplies)** — Materials shows blank SIM cards, PVC scratch-card blanks, foil, sleeves, print ribbon. Recipes shows "SIM Starter Pack," "GHS 10 Recharge Card," "GHS 20 Recharge Card" with their bill of materials. Dispatch **30 SIM Starter Packs** to Accra Digital Distribution.
2. **Wholesaler (Accra Digital Distribution)** — Warehouse shows SIM Starter Pack low (15 in stock, threshold 30). Receive Stock the 30 just dispatched → jumps to 45, low-stock flag clears. Then Sell **15 SIM Starter Packs** to Mama Efua's Mobile Kiosk.
3. **Retailer (Mama Efua's Mobile Kiosk)** — Products shows SIM Starter Pack low (8 in stock, threshold 15). Stock In the 15 just bought → jumps to 23. POS a sale of 1–2 SIM Starter Packs plus a recharge card and a phone charger, to show a realistic mixed-basket sale at a mobile money kiosk.

Same talking points apply as the hot-sauce demo (credit tracking, activity log, dark mode, multi-currency, Paystack) — no need to repeat all of them for both demos live; pick whichever one fits the room, or open with hot sauce (tangible, easy to grasp) and close with telecom (proves the platform generalizes).
