-- =====================================================================
-- StockFlow Pro — SECOND demo dataset: a telecom/services-style business
-- =====================================================================
-- WHY THIS EXISTS
--   Proves the app isn't limited to physical manufacturing like the hot
--   sauce demo — a telecom/services company (the kind of business MTN,
--   Telecel, or AirtelTigo run at the distribution level) fits the exact
--   same Manufacturer -> Wholesaler -> Retailer model, because what
--   actually moves through the supply chain is physical, trackable
--   inventory (SIM starter packs, scratch/recharge cards) even though
--   the underlying value being sold is a service (airtime, data, mobile
--   money). No code changes were needed for this — same schema, same
--   features, different industry.
--
--   Uses fictional business names, not the real telecom operators —
--   safe to demo without implying any real company's endorsement.
--
-- WHAT THIS DOES
--   Adds 3 brand-new demo accounts (does not touch the hot-sauce demo
--   accounts or any other data). Safe to run alongside/after
--   reset_demo_data.sql.
--
-- HOW TO RUN THIS
--   Go to your Neon dashboard (neon.tech) -> your project -> SQL Editor.
--   Paste this ENTIRE file and click Run, in one go.
--
-- LOGIN CREDENTIALS FOR ALL 3 NEW ACCOUNTS
--   Password (same for all three): Demo1234!
--   Manufacturer: demo2.manufacturer@stockflow.test  — "Konnect Mobile Supplies"
--   Wholesaler:   demo2.wholesaler@stockflow.test     — "Accra Digital Distribution"
--   Retailer:     demo2.retailer@stockflow.test       — "Mama Efua's Mobile Kiosk"
-- =====================================================================

BEGIN;

-- --- Businesses -------------------------------------------------------
CREATE TEMP TABLE tel_biz AS
WITH ins AS (
  INSERT INTO businesses (name, tier_type, subscription_plan, subscription_status, trial_started_at, created_at)
  VALUES
    ('Konnect Mobile Supplies',    'MANUFACTURER', 'PREMIUM', 'ACTIVE', now(), now()),
    ('Accra Digital Distribution', 'WHOLESALER',   'PREMIUM', 'ACTIVE', now(), now()),
    ('Mama Efua''s Mobile Kiosk',  'RETAILER',     'PREMIUM', 'ACTIVE', now(), now())
  RETURNING id, tier_type
)
SELECT * FROM ins;

-- --- Admin users (password for all three: Demo1234!) -------------------
INSERT INTO users (business_id, name, email, password_hash, role, is_sub_account, is_active, must_change_password, created_at)
SELECT id, 'Nana Kwesi', 'demo2.manufacturer@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM tel_biz WHERE tier_type = 'MANUFACTURER'
UNION ALL
SELECT id, 'Efua Owusu', 'demo2.wholesaler@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM tel_biz WHERE tier_type = 'WHOLESALER'
UNION ALL
SELECT id, 'Kojo Antwi', 'demo2.retailer@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM tel_biz WHERE tier_type = 'RETAILER';

-- --- Link the three tiers together --------------------------------------
INSERT INTO tier_links (requester_business_id, partner_business_id, status, created_at, accepted_at)
SELECT m.id, w.id, 'ACCEPTED', now(), now()
FROM tel_biz m, tel_biz w
WHERE m.tier_type = 'MANUFACTURER' AND w.tier_type = 'WHOLESALER';

INSERT INTO tier_links (requester_business_id, partner_business_id, status, created_at, accepted_at)
SELECT w.id, r.id, 'ACCEPTED', now(), now()
FROM tel_biz w, tel_biz r
WHERE w.tier_type = 'WHOLESALER' AND r.tier_type = 'RETAILER';

-- =====================================================================
-- MANUFACTURER — Konnect Mobile Supplies: SIM packs + recharge cards
-- =====================================================================

CREATE TEMP TABLE tel_materials AS
WITH ins AS (
  INSERT INTO materials (business_id, name, unit, quantity, min_threshold, cost_per_unit, updated_at)
  SELECT id, m.name, m.unit, m.quantity, m.min_threshold, m.cost_per_unit, now()
  FROM tel_biz, (VALUES
    ('Blank SIM Cards',            'unit', 5000.000, 500.000, 0.18),
    ('PVC Scratch Card Blanks',    'unit', 8000.000, 800.000, 0.05),
    ('Scratch-Panel Foil',         'sheet', 2000.000, 200.000, 0.02),
    ('Starter Pack Sleeves',       'unit', 3000.000, 300.000, 0.06),
    ('Thermal Print Ribbon',       'roll',    40.000,   5.000, 6.50)
  ) AS m(name, unit, quantity, min_threshold, cost_per_unit)
  WHERE tel_biz.tier_type = 'MANUFACTURER'
  RETURNING id, name
)
SELECT * FROM ins;

CREATE TEMP TABLE tel_recipes AS
WITH ins AS (
  INSERT INTO recipes (business_id, product_name, unit_label, group_label, units_per_group, is_active, created_at)
  SELECT id, r.product_name, r.unit_label, r.group_label, r.units_per_group, true, now()
  FROM tel_biz, (VALUES
    ('SIM Starter Pack',        'pack', 'batch', 100),
    ('GHS 10 Recharge Card',    'card', 'batch', 200),
    ('GHS 20 Recharge Card',    'card', 'batch', 200)
  ) AS r(product_name, unit_label, group_label, units_per_group)
  WHERE tel_biz.tier_type = 'MANUFACTURER'
  RETURNING id, product_name
)
SELECT * FROM ins;

INSERT INTO recipe_materials (recipe_id, material_id, quantity_per_unit)
SELECT rec.id, mat.id, x.qty_per_unit
FROM (VALUES
  ('SIM Starter Pack',     'Blank SIM Cards',         1.0000),
  ('SIM Starter Pack',     'Starter Pack Sleeves',    1.0000),
  ('GHS 10 Recharge Card', 'PVC Scratch Card Blanks', 1.0000),
  ('GHS 10 Recharge Card', 'Scratch-Panel Foil',      1.0000),
  ('GHS 20 Recharge Card', 'PVC Scratch Card Blanks', 1.0000),
  ('GHS 20 Recharge Card', 'Scratch-Panel Foil',      1.0000)
) AS x(recipe_name, material_name, qty_per_unit)
JOIN tel_recipes rec ON rec.product_name = x.recipe_name
JOIN tel_materials mat ON mat.name = x.material_name;

-- Existing finished stock, as if already operating before adopting the app.
INSERT INTO finished_goods (business_id, recipe_id, quantity_in_stock, updated_at)
SELECT nb.id, nr.id, x.stock, now()
FROM (VALUES ('SIM Starter Pack', 400), ('GHS 10 Recharge Card', 900), ('GHS 20 Recharge Card', 600)) AS x(product_name, stock)
JOIN tel_recipes nr ON nr.product_name = x.product_name
JOIN tel_biz nb ON nb.tier_type = 'MANUFACTURER';

DROP TABLE tel_materials;
DROP TABLE tel_recipes;

-- =====================================================================
-- WHOLESALER — Accra Digital Distribution: warehouse stock
--
-- Same three products the manufacturer produces, seeded low, plus a
-- generic electronics/accessories range — same "seamless demo" design
-- as the hot-sauce dataset (see docs/DEMO_GUIDE.md).
-- =====================================================================

INSERT INTO warehouse_products (business_id, name, unit, quantity, min_threshold, price_usd, updated_at)
SELECT id, w.name, w.unit, w.quantity, w.min_threshold, w.price_usd, now()
FROM tel_biz, (VALUES
  ('SIM Starter Pack',            'pack',  15.000,  30.000,  0.60),
  ('GHS 10 Recharge Card',        'card',  40.000,  80.000,  1.00),
  ('GHS 20 Recharge Card',        'card',  25.000,  50.000,  2.00),
  ('Basic Feature Phone',         'unit', 120.000,  15.000, 12.00),
  ('Phone Charger (universal)',   'unit', 200.000,  25.000,  2.50),
  ('Earphones (wired)',           'unit', 300.000,  30.000,  1.20),
  ('Power Bank 10000mAh',         'unit', 100.000,  15.000,  8.00),
  ('Screen Protectors (assorted)','pack', 250.000,  25.000,  0.80)
) AS w(name, unit, quantity, min_threshold, price_usd)
WHERE tel_biz.tier_type = 'WHOLESALER';

-- =====================================================================
-- RETAILER — Mama Efua's Mobile Kiosk: shelf products
-- =====================================================================

CREATE TEMP TABLE tel_categories AS
WITH ins AS (
  INSERT INTO categories (business_id, name)
  SELECT id, c.name
  FROM tel_biz, (VALUES ('Airtime & SIM'), ('Accessories'), ('Devices')) AS c(name)
  WHERE tel_biz.tier_type = 'RETAILER'
  RETURNING id, name
)
SELECT * FROM ins;

INSERT INTO products (business_id, category_id, name, unit, price_usd, quantity, min_threshold, is_active, updated_at)
SELECT nb.id, nc.id, x.name, x.unit, x.price_usd, x.quantity, x.min_threshold, true, now()
FROM (VALUES
  ('Airtime & SIM', 'SIM Starter Pack',          'pack', 0.80,  8.000, 15.000),
  ('Airtime & SIM', 'GHS 10 Recharge Card',      'card', 1.30, 20.000, 40.000),
  ('Airtime & SIM', 'GHS 20 Recharge Card',      'card', 2.50, 12.000, 25.000),
  ('Accessories',   'Phone Charger (universal)', 'unit', 4.00, 30.000, 10.000),
  ('Accessories',   'Earphones (wired)',         'unit', 2.00, 40.000, 10.000),
  ('Accessories',   'Power Bank 10000mAh',       'unit', 12.00, 15.000,  5.000),
  ('Devices',       'Basic Feature Phone',       'unit', 18.00, 10.000,  4.000)
) AS x(category_name, name, unit, price_usd, quantity, min_threshold)
JOIN tel_categories nc ON nc.name = x.category_name
JOIN tel_biz nb ON nb.tier_type = 'RETAILER';

DROP TABLE tel_categories;
DROP TABLE tel_biz;

COMMIT;

-- Done. Log in with:
--   demo2.manufacturer@stockflow.test / Demo1234!  (Konnect Mobile Supplies)
--   demo2.wholesaler@stockflow.test   / Demo1234!  (Accra Digital Distribution)
--   demo2.retailer@stockflow.test     / Demo1234!  (Mama Efua's Mobile Kiosk)
