/** Canonical country/currency catalog — mirrors backend CountryCatalog.
 *
 * Scope note: this only lists countries Paystack itself operates in. Only
 * Ghana has a live, verified Paystack account behind it today — the rest are
 * wired for display/cash/mobile-money and marked "coming soon" for card
 * payments until a real merchant account exists for them. usdRate values are
 * approximate, static conversion rates for display purposes only.
 */
export interface Country {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  usdRate: number;
  paystackLive: boolean;
}

export const DEFAULT_COUNTRY = 'GH';

export const COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', currencyCode: 'GHS', currencySymbol: 'GH₵', usdRate: 15.0, paystackLive: true },
  { code: 'NG', name: 'Nigeria', currencyCode: 'NGN', currencySymbol: '₦', usdRate: 1550.0, paystackLive: false },
  { code: 'ZA', name: 'South Africa', currencyCode: 'ZAR', currencySymbol: 'R', usdRate: 18.5, paystackLive: false },
  { code: 'KE', name: 'Kenya', currencyCode: 'KES', currencySymbol: 'KSh', usdRate: 129.0, paystackLive: false },
  { code: 'CI', name: "Côte d'Ivoire", currencyCode: 'XOF', currencySymbol: 'CFA', usdRate: 610.0, paystackLive: false },
  { code: 'EG', name: 'Egypt', currencyCode: 'EGP', currencySymbol: 'E£', usdRate: 49.0, paystackLive: false },
  { code: 'RW', name: 'Rwanda', currencyCode: 'RWF', currencySymbol: 'RF', usdRate: 1300.0, paystackLive: false },
];

const BY_CODE: Record<string, Country> = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

export function getCountry(code?: string | null): Country {
  return (code && BY_CODE[code]) || BY_CODE[DEFAULT_COUNTRY];
}
