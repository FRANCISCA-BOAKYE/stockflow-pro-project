/** Canonical subscription constants — mirrors backend PlanCatalog. */

export const TRIAL_DAYS = 14;

export const SUB_ACCOUNT_LIMITS: Record<string, Record<string, number>> = {
  RETAILER: { STANDARD: 2, PREMIUM: 5 },
  WHOLESALER: { STANDARD: 6, PREMIUM: 8 },
  MANUFACTURER: { STANDARD: 5, PREMIUM: 10 },
};

export const MONTHLY_PRICE_USD: Record<string, Record<string, number>> = {
  RETAILER: { STANDARD: 17, PREMIUM: 30 },
  WHOLESALER: { STANDARD: 45, PREMIUM: 75 },
  MANUFACTURER: { STANDARD: 80, PREMIUM: 110 },
};

export const USD_TO_GHS = 15;

export function priceGhs(tier: string, plan: string): number {
  const usd = MONTHLY_PRICE_USD[tier]?.[plan] ?? 17;
  return Math.round(usd * USD_TO_GHS);
}

/** Only lists features actually enforced in code — see backend PlanCatalog for why. */
export const PREMIUM_FEATURES: Record<string, string[]> = {
  RETAILER: [
    "Stock reservation",
  ],
  WHOLESALER: [
    "Email invoices",
  ],
  MANUFACTURER: [
    "Email invoices",
  ],
};

export const STANDARD_FEATURES: Record<string, string[]> = {
  RETAILER: [
    "Full inventory management",
    "POS system",
    "Low-stock alerts",
    "Transaction history",
    "Credit tracking",
    "Dashboard",
  ],
  WHOLESALER: [
    "Full warehouse management",
    "POS system",
    "Credit tracking both ways",
    "Overdue alerts & credit holds",
    "Tier linking",
    "Marketplace listing",
  ],
  MANUFACTURER: [
    "Raw material management",
    "Recipe setup",
    "Production planning",
    "Finished goods tracking",
    "POS dispatch",
    "Credit tracking",
    "Marketplace listing",
  ],
};

export function featuresForPlan(tier: string, plan: string): string[] {
  const standard = STANDARD_FEATURES[tier] ?? STANDARD_FEATURES.RETAILER;
  if (plan === "PREMIUM") {
    return [...standard, ...(PREMIUM_FEATURES[tier] ?? [])];
  }
  return standard;
}

export function maxSubAccounts(tier: string, plan: string): number {
  return SUB_ACCOUNT_LIMITS[tier]?.[plan] ?? 2;
}
