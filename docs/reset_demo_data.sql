-- =====================================================================
-- StockFlow Pro — reset the 3 demo/test accounts and reseed fresh data
-- =====================================================================
-- WHAT THIS DOES
--   1) Deletes ONLY the three old demo accounts (demo.manufacturer@,
--      demo.wholesaler@, demo.retailer@stockflow.test) and every row
--      that belongs to them — materials, recipes, products, credit
--      records, invoices, everything. It does NOT touch the 54 real
--      marketplace companies or any other account.
--   2) Creates 3 brand-new demo accounts, one per tier, with realistic
--      starter data so you can test the whole app end to end.
--
-- HOW TO RUN THIS
--   Go to your Neon dashboard (neon.tech) -> your project -> SQL Editor.
--   Paste this ENTIRE file and click Run, in one go. Don't split it into
--   pieces — the whole thing is wrapped in one transaction, so if
--   anything goes wrong partway through, nothing is changed at all.
--
-- LOGIN CREDENTIALS FOR ALL 3 NEW ACCOUNTS
--   Password (same for all three): Demo1234!
--   Manufacturer: demo.manufacturer@stockflow.test  — "Osu Valley Foods"
--   Wholesaler:   demo.wholesaler@stockflow.test     — "Tema Central Distributors"
--   Retailer:     demo.retailer@stockflow.test       — "Adjei's Corner Shop"
--
-- SEAMLESS DEMO DESIGN
--   Kpakpo Shito Hot Sauce and Sobolo Hibiscus Juice are the SAME two
--   products at all three tiers (Osu Valley Foods produces them, Tema
--   Central already stocks a small amount, Adjei's Corner already sells
--   a small amount) — deliberately seeded LOW at the wholesaler/retailer
--   so a live demo can dispatch from the manufacturer, receive it at the
--   wholesaler, buy more into the retailer, and sell one at the POS, all
--   using the same product end to end. See docs/DEMO_GUIDE.md.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- STEP 0 (optional but recommended) — preview what will be deleted.
-- Run just this SELECT first if you want to eyeball it before trusting
-- the rest of the script. It should show exactly 3 rows.
-- ---------------------------------------------------------------------
-- SELECT b.id, b.name, b.tier_type, u.email
-- FROM businesses b JOIN users u ON u.business_id = b.id
-- WHERE u.email IN ('demo.manufacturer@stockflow.test',
--                    'demo.wholesaler@stockflow.test',
--                    'demo.retailer@stockflow.test')
--   AND u.is_sub_account = false;

-- =====================================================================
-- PART 1 — DELETE the old demo accounts and everything tied to them
-- =====================================================================

CREATE TEMP TABLE demo_old_biz AS
SELECT b.id, b.tier_type FROM businesses b
JOIN users u ON u.business_id = b.id
WHERE u.email IN ('demo.manufacturer@stockflow.test',
                   'demo.wholesaler@stockflow.test',
                   'demo.retailer@stockflow.test')
  AND u.is_sub_account = false;

DELETE FROM invoice_items WHERE invoice_id IN (
  SELECT id FROM invoices
  WHERE seller_business_id IN (SELECT id FROM demo_old_biz)
     OR buyer_business_id IN (SELECT id FROM demo_old_biz)
);

DELETE FROM production_usage WHERE run_id IN (
  SELECT id FROM production_runs WHERE business_id IN (SELECT id FROM demo_old_biz)
);

DELETE FROM recipe_materials WHERE recipe_id IN (
  SELECT id FROM recipes WHERE business_id IN (SELECT id FROM demo_old_biz)
);

DELETE FROM dispatches
WHERE business_id IN (SELECT id FROM demo_old_biz)
   OR wholesaler_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM receipts
WHERE business_id IN (SELECT id FROM demo_old_biz)
   OR manufacturer_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM wholesale_sales
WHERE business_id IN (SELECT id FROM demo_old_biz)
   OR retailer_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM retail_transactions
WHERE business_id IN (SELECT id FROM demo_old_biz)
   OR wholesaler_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM reservations WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM notifications WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM tier_links
WHERE requester_business_id IN (SELECT id FROM demo_old_biz)
   OR partner_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM credit_records
WHERE creditor_business_id IN (SELECT id FROM demo_old_biz)
   OR debtor_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM invoices
WHERE seller_business_id IN (SELECT id FROM demo_old_biz)
   OR buyer_business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM production_runs WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM finished_goods WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM recipes WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM materials WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM warehouse_products WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM products WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM categories WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM listings WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM users WHERE business_id IN (SELECT id FROM demo_old_biz);

DELETE FROM businesses WHERE id IN (SELECT id FROM demo_old_biz);

DROP TABLE demo_old_biz;

-- =====================================================================
-- PART 2 — SEED 3 fresh demo accounts
-- =====================================================================

-- --- Businesses -------------------------------------------------------
CREATE TEMP TABLE new_biz AS
WITH ins AS (
  INSERT INTO businesses (name, tier_type, subscription_plan, subscription_status, trial_started_at, created_at)
  VALUES
    ('Osu Valley Foods',           'MANUFACTURER', 'PREMIUM', 'ACTIVE', now(), now()),
    ('Tema Central Distributors',  'WHOLESALER',   'PREMIUM', 'ACTIVE', now(), now()),
    ('Adjei''s Corner Shop',       'RETAILER',     'PREMIUM', 'ACTIVE', now(), now())
  RETURNING id, tier_type
)
SELECT * FROM ins;

-- --- Admin users (password for all three: Demo1234!) ------------------
INSERT INTO users (business_id, name, email, password_hash, role, is_sub_account, is_active, must_change_password, created_at)
SELECT id, 'Kojo Mensah', 'demo.manufacturer@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM new_biz WHERE tier_type = 'MANUFACTURER'
UNION ALL
SELECT id, 'Ama Boateng', 'demo.wholesaler@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM new_biz WHERE tier_type = 'WHOLESALER'
UNION ALL
SELECT id, 'Yaw Adjei', 'demo.retailer@stockflow.test',
       '$2b$10$4WKFQD9nf2G//LOSES8MD.W8GyLw7AEIjprGSW0DqhvA5U.z1pW7q',
       'COMPANY_ADMIN', false, true, false, now()
FROM new_biz WHERE tier_type = 'RETAILER';

-- --- Link the three tiers together (Manufacturer -> Wholesaler -> Retailer)
INSERT INTO tier_links (requester_business_id, partner_business_id, status, created_at, accepted_at)
SELECT m.id, w.id, 'ACCEPTED', now(), now()
FROM new_biz m, new_biz w
WHERE m.tier_type = 'MANUFACTURER' AND w.tier_type = 'WHOLESALER';

INSERT INTO tier_links (requester_business_id, partner_business_id, status, created_at, accepted_at)
SELECT w.id, r.id, 'ACCEPTED', now(), now()
FROM new_biz w, new_biz r
WHERE w.tier_type = 'WHOLESALER' AND r.tier_type = 'RETAILER';

-- =====================================================================
-- MANUFACTURER — Osu Valley Foods: two real production lines
-- (a hot sauce line and a fruit-juice line, proving a manufacturer can
-- run more than one recipe)
-- =====================================================================

CREATE TEMP TABLE new_materials AS
WITH ins AS (
  INSERT INTO materials (business_id, name, unit, quantity, min_threshold, cost_per_unit, updated_at)
  SELECT id, m.name, m.unit, m.quantity, m.min_threshold, m.cost_per_unit, now()
  FROM new_biz, (VALUES
    ('Fresh Kpakpo Shito Peppers', 'kg',  40.000, 5.000, 1.20),
    ('Palm Oil',                   'L',   15.000, 3.000, 3.50),
    ('Dried Prawns',               'kg',   8.000, 2.000, 8.00),
    ('Garlic',                     'kg',   5.000, 1.000, 2.50),
    ('Glass Bottles 200ml',        'unit', 300.000, 50.000, 0.35),
    ('Dried Hibiscus Petals',      'kg',  20.000, 3.000, 4.00),
    ('Fresh Ginger',               'kg',   6.000, 1.000, 2.00),
    ('Sugar',                      'kg',  40.000, 5.000, 1.50),
    ('PET Bottles 500ml',          'unit', 250.000, 50.000, 0.25)
  ) AS m(name, unit, quantity, min_threshold, cost_per_unit)
  WHERE new_biz.tier_type = 'MANUFACTURER'
  RETURNING id, name
)
SELECT * FROM ins;

CREATE TEMP TABLE new_recipes AS
WITH ins AS (
  INSERT INTO recipes (business_id, product_name, unit_label, group_label, units_per_group, is_active, created_at)
  SELECT id, r.product_name, r.unit_label, r.group_label, r.units_per_group, true, now()
  FROM new_biz, (VALUES
    ('Kpakpo Shito Hot Sauce', 'bottle', 'batch', 48),
    ('Sobolo Hibiscus Juice',  'bottle', 'batch', 100)
  ) AS r(product_name, unit_label, group_label, units_per_group)
  WHERE new_biz.tier_type = 'MANUFACTURER'
  RETURNING id, product_name
)
SELECT * FROM ins;

INSERT INTO recipe_materials (recipe_id, material_id, quantity_per_unit)
SELECT rec.id, mat.id, x.qty_per_unit
FROM (VALUES
  ('Kpakpo Shito Hot Sauce', 'Fresh Kpakpo Shito Peppers', 0.1500),
  ('Kpakpo Shito Hot Sauce', 'Palm Oil',                   0.0400),
  ('Kpakpo Shito Hot Sauce', 'Dried Prawns',                0.0200),
  ('Kpakpo Shito Hot Sauce', 'Garlic',                      0.0150),
  ('Kpakpo Shito Hot Sauce', 'Glass Bottles 200ml',         1.0000),
  ('Sobolo Hibiscus Juice',  'Dried Hibiscus Petals',       0.0300),
  ('Sobolo Hibiscus Juice',  'Fresh Ginger',                0.0100),
  ('Sobolo Hibiscus Juice',  'Sugar',                       0.0800),
  ('Sobolo Hibiscus Juice',  'PET Bottles 500ml',           1.0000)
) AS x(recipe_name, material_name, qty_per_unit)
JOIN new_recipes rec ON rec.product_name = x.recipe_name
JOIN new_materials mat ON mat.name = x.material_name;

-- Give each product line some existing finished stock, as if the
-- business already had inventory on hand before adopting the app.
INSERT INTO finished_goods (business_id, recipe_id, quantity_in_stock, updated_at)
SELECT nb.id, nr.id, x.stock, now()
FROM (VALUES ('Kpakpo Shito Hot Sauce', 96), ('Sobolo Hibiscus Juice', 150)) AS x(product_name, stock)
JOIN new_recipes nr ON nr.product_name = x.product_name
JOIN new_biz nb ON nb.tier_type = 'MANUFACTURER';

DROP TABLE new_materials;
DROP TABLE new_recipes;

-- =====================================================================
-- WHOLESALER — Tema Central Distributors: warehouse stock
--
-- Includes the manufacturer's own two product lines (Kpakpo Shito Hot
-- Sauce, Sobolo Hibiscus Juice) at a deliberately low starting quantity,
-- on top of generic FMCG stock — so the live demo can dispatch from the
-- manufacturer, receive it here, and watch the SAME product's quantity
-- visibly grow, instead of using unrelated items at each tier.
-- =====================================================================

INSERT INTO warehouse_products (business_id, name, unit, quantity, min_threshold, price_usd, updated_at)
SELECT id, w.name, w.unit, w.quantity, w.min_threshold, w.price_usd, now()
FROM new_biz, (VALUES
  ('Kpakpo Shito Hot Sauce',             'bottle',  12.000,  20.000,  3.50),
  ('Sobolo Hibiscus Juice',              'bottle',  18.000,  20.000,  2.20),
  ('Perfect Parboiled Rice 25kg',        'bag',    200.000, 20.000, 28.00),
  ('Frytol Cooking Oil 5L',              'bottle', 150.000, 15.000, 12.50),
  ('Gino Tomato Mix 400g (ctn of 24)',   'carton',  80.000, 10.000, 18.00),
  ('Golden Sugar 1kg',                   'bag',    300.000, 30.000,  1.80),
  ('Ideal Milk Powder 400g',             'tin',    250.000, 25.000,  3.20),
  ('Mr Bean Instant Noodles (ctn of 40)','carton', 100.000, 10.000, 14.00),
  ('Geisha Mackerel 155g (ctn of 50)',   'carton',  90.000, 10.000, 32.00),
  ('Voltic Water 500ml (ctn of 24)',     'carton', 400.000, 40.000,  4.80),
  ('Key Soap Bar 200g (ctn of 72)',      'carton',  60.000,  8.000, 22.00),
  ('Omo Detergent 900g (ctn of 24)',     'carton',  70.000, 10.000, 26.00),
  ('Ideal Spaghetti 500g (ctn of 20)',   'carton', 120.000, 12.000, 10.50),
  ('Neat Toilet Rolls (ctn of 24 packs)','carton',  85.000, 10.000, 16.00)
) AS w(name, unit, quantity, min_threshold, price_usd)
WHERE new_biz.tier_type = 'WHOLESALER';

-- =====================================================================
-- RETAILER — Adjei's Corner Shop: shelf products across categories
-- =====================================================================

CREATE TEMP TABLE new_categories AS
WITH ins AS (
  INSERT INTO categories (business_id, name)
  SELECT id, c.name
  FROM new_biz, (VALUES ('Local Products'), ('Beverages'), ('Snacks'), ('Toiletries'), ('Household'), ('Groceries')) AS c(name)
  WHERE new_biz.tier_type = 'RETAILER'
  RETURNING id, name
)
SELECT * FROM ins;

-- Same two items the manufacturer produces and the wholesaler stocks, at a
-- low starting quantity — so buying more from the wholesaler mid-demo and
-- then selling one at the POS both use the identical product end to end.
INSERT INTO products (business_id, category_id, name, unit, price_usd, quantity, min_threshold, is_active, updated_at)
SELECT nb.id, nc.id, x.name, x.unit, x.price_usd, x.quantity, x.min_threshold, true, now()
FROM (VALUES
  ('Local Products', 'Kpakpo Shito Hot Sauce', 'bottle', 4.50,  6.000,  10.000),
  ('Local Products', 'Sobolo Hibiscus Juice',  'bottle', 3.00,  8.000,  10.000)
) AS x(category_name, name, unit, price_usd, quantity, min_threshold)
JOIN new_categories nc ON nc.name = x.category_name
JOIN new_biz nb ON nb.tier_type = 'RETAILER';

INSERT INTO products (business_id, category_id, name, unit, price_usd, quantity, min_threshold, is_active, updated_at)
SELECT nb.id, nc.id, x.name, x.unit, x.price_usd, x.quantity, x.min_threshold, true, now()
FROM (VALUES
  ('Beverages',  'Coca-Cola 350ml',            'bottle', 0.80, 120.000, 15.000),
  ('Beverages',  'Malta Guinness 330ml',       'bottle', 1.20,  90.000, 10.000),
  ('Beverages',  'Voltic Water 500ml',         'bottle', 0.50, 200.000, 30.000),
  ('Snacks',     'Digestive Biscuits',         'pack',   1.50,  60.000,  8.000),
  ('Snacks',     'Golden Morn Cereal 500g',    'pack',   3.00,  40.000,  6.000),
  ('Snacks',     'Groundnut Paste 500g',       'jar',    2.20,  35.000,  5.000),
  ('Toiletries', 'Dettol Soap',                'pcs',    1.00,  80.000, 10.000),
  ('Toiletries', 'Colgate Toothpaste 100ml',   'pcs',    1.80,  55.000,  8.000),
  ('Toiletries', 'Always Sanitary Pads',       'pack',   2.50,  40.000,  6.000),
  ('Household',  'Omo Detergent 500g',         'pack',   3.20,  45.000,  6.000),
  ('Household',  'Candles (pack of 6)',        'pack',   1.60,  30.000,  5.000),
  ('Groceries',  'Perfect Rice 5kg',           'bag',    7.50,  50.000,  8.000),
  ('Groceries',  'Frytol Cooking Oil 1L',      'bottle', 3.20,  60.000, 10.000),
  ('Groceries',  'Gino Tomato Mix 70g',        'sachet', 0.30, 150.000, 20.000),
  ('Groceries',  'Maggi Cubes (pack of 50)',   'pack',   1.10,  70.000, 10.000)
) AS x(category_name, name, unit, price_usd, quantity, min_threshold)
JOIN new_categories nc ON nc.name = x.category_name
JOIN new_biz nb ON nb.tier_type = 'RETAILER';

DROP TABLE new_categories;
DROP TABLE new_biz;

COMMIT;

-- Done. Log in with:
--   demo.manufacturer@stockflow.test / Demo1234!  (Osu Valley Foods)
--   demo.wholesaler@stockflow.test   / Demo1234!  (Tema Central Distributors)
--   demo.retailer@stockflow.test     / Demo1234!  (Adjei's Corner Shop)
