/** Canonical country/currency catalog — mirrors backend CountryCatalog.
 *
 * Scope note: this only lists countries Paystack itself operates in. Only
 * Ghana has a live, verified Paystack account behind it today — the rest
 * still track inventory/sales/cash/mobile-money in their own currency, with
 * card payments marked "coming soon" until a real merchant account exists.
 */
export interface Country {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  paystackLive: boolean;
}

export const DEFAULT_COUNTRY = 'GH';

export const COUNTRIES: Country[] = [
  { code: 'GH', name: 'Ghana', currencyCode: 'GHS', currencySymbol: 'GH₵', paystackLive: true },
  { code: 'NG', name: 'Nigeria', currencyCode: 'NGN', currencySymbol: '₦', paystackLive: false },
  { code: 'ZA', name: 'South Africa', currencyCode: 'ZAR', currencySymbol: 'R', paystackLive: false },
  { code: 'KE', name: 'Kenya', currencyCode: 'KES', currencySymbol: 'KSh', paystackLive: false },
  { code: 'CI', name: "Côte d'Ivoire", currencyCode: 'XOF', currencySymbol: 'CFA', paystackLive: false },
  { code: 'EG', name: 'Egypt', currencyCode: 'EGP', currencySymbol: 'E£', paystackLive: false },
  { code: 'RW', name: 'Rwanda', currencyCode: 'RWF', currencySymbol: 'RF', paystackLive: false },
];
