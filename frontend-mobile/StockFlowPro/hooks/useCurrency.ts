import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { getCountry } from '../constants/countries';

/**
 * Every price/cost in the app is stored and computed in USD internally
 * (matches backend). This hook only affects what the user SEES — the
 * business's chosen country's currency symbol and an approximate static
 * conversion rate, same simplification the app already made for its
 * original hardcoded USD_TO_GHS constant.
 */
export function useCurrency() {
  const user = useAuthStore(s => s.user);
  const country = useMemo(() => getCountry(user?.country), [user?.country]);

  const convert = (usdAmount: number) => usdAmount * country.usdRate;

  const format = (usdAmount: number, opts?: { decimals?: number }) => {
    const decimals = opts?.decimals ?? 2;
    const converted = convert(usdAmount);
    return `${country.currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return { country, convert, format };
}
