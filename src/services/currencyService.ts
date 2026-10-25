import { CurrencyCode, CurrencyConfig, ExchangeRates, RegionType } from '../types';

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  YER_NORTH: 1.0,  // Base standard (1.0)
  YER_SOUTH: 3.0,  // 1000 YER North = 3000 YER South (Configurable rate provided by owner)
  USD: 0.0018868,  // 1 USD = ~530 YER North
  SAR: 0.0071428,  // 1 SAR = ~140 YER North
};

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  YER_NORTH: {
    code: 'YER_NORTH',
    name: 'صنعاء — الريال اليمني الشمالي',
    shortName: 'ريال شمالي',
    symbol: 'ر.ي شمالي',
    region: 'north',
    rateAgainstBaseYER: 1.0,
    isDefault: true,
  },
  YER_SOUTH: {
    code: 'YER_SOUTH',
    name: 'عدن — الريال اليمني الجنوبي',
    shortName: 'ريال جنوبي',
    symbol: 'ر.ي جنوبي',
    region: 'south',
    rateAgainstBaseYER: 3.0,
  },
  USD: {
    code: 'USD',
    name: 'دولار أمريكي (USD)',
    shortName: 'دولار',
    symbol: '$',
    region: 'international',
    rateAgainstBaseYER: 0.0018868,
  },
  SAR: {
    code: 'SAR',
    name: 'ريال سعودي (SAR)',
    shortName: 'ريال سعودي',
    symbol: 'ر.س',
    region: 'international',
    rateAgainstBaseYER: 0.0071428,
  },
  // Backward compatibility alias for legacy 'YER'
  YER: {
    code: 'YER_NORTH',
    name: 'صنعاء — الريال اليمني الشمالي',
    shortName: 'ريال شمالي',
    symbol: 'ر.ي شمالي',
    region: 'north',
    rateAgainstBaseYER: 1.0,
    isDefault: true,
  },
};

const STORAGE_RATES_KEY = 'dajjah_exchange_rates_v2';
const STORAGE_CURRENCY_KEY = 'dajjah_active_currency_v2';

export function getStoredExchangeRates(): ExchangeRates {
  try {
    const saved = localStorage.getItem(STORAGE_RATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_EXCHANGE_RATES, ...parsed };
    }
  } catch {
    // fallback to default
  }
  return { ...DEFAULT_EXCHANGE_RATES };
}

export function saveStoredExchangeRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(STORAGE_RATES_KEY, JSON.stringify(rates));
  } catch (err) {
    console.error('Error saving exchange rates:', err);
  }
}

export function getStoredCurrency(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY) as CurrencyCode;
    if (saved && (saved === 'YER_NORTH' || saved === 'YER_SOUTH' || saved === 'USD' || saved === 'SAR')) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'YER_NORTH';
}

export function saveStoredCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(STORAGE_CURRENCY_KEY, code);
  } catch (err) {
    console.error('Error saving active currency:', err);
  }
}

/**
 * Converts a base price (in YER_NORTH) into the target currency.
 */
export function convertFromBaseYER(
  amountBaseYER: number,
  targetCurrency: CurrencyCode = 'YER_NORTH',
  customRates?: ExchangeRates
): number {
  if (amountBaseYER <= 0 || isNaN(amountBaseYER)) return 0;
  const rates = customRates || getStoredExchangeRates() || DEFAULT_EXCHANGE_RATES;

  if (targetCurrency === 'YER_NORTH' || targetCurrency === 'YER') {
    return Math.round(amountBaseYER);
  }

  if (targetCurrency === 'YER_SOUTH') {
    const rate = rates?.YER_SOUTH || 3.0;
    return Math.round(amountBaseYER * rate);
  }

  if (targetCurrency === 'USD') {
    const rate = rates?.USD || 0.0018868;
    return +(amountBaseYER * rate).toFixed(2);
  }

  if (targetCurrency === 'SAR') {
    const rate = rates?.SAR || 0.0071428;
    return +(amountBaseYER * rate).toFixed(2);
  }

  return Math.round(amountBaseYER);
}

/**
 * Converts any currency amount back to base YER_NORTH.
 */
export function convertToBaseYER(
  amountInCurrency: number,
  sourceCurrency: CurrencyCode = 'YER_NORTH',
  customRates?: ExchangeRates
): number {
  if (amountInCurrency <= 0 || isNaN(amountInCurrency)) return 0;
  const rates = customRates || getStoredExchangeRates() || DEFAULT_EXCHANGE_RATES;

  if (sourceCurrency === 'YER_NORTH' || sourceCurrency === 'YER') {
    return Math.round(amountInCurrency);
  }

  if (sourceCurrency === 'YER_SOUTH') {
    const rate = rates?.YER_SOUTH || 3.0;
    return Math.round(amountInCurrency / rate);
  }

  if (sourceCurrency === 'USD') {
    const rate = rates?.USD || 0.0018868;
    return Math.round(amountInCurrency / rate);
  }

  if (sourceCurrency === 'SAR') {
    const rate = rates?.SAR || 0.0071428;
    return Math.round(amountInCurrency / rate);
  }

  return Math.round(amountInCurrency);
}

/**
 * Formats a price nicely in Arabic with Arabic-friendly number styling.
 * @param amountInBaseYER Amount in base currency (YER_NORTH)
 * @param targetCurrency Target currency code
 * @param customRates Optional custom rates
 * @param options Format options (showSymbol, detailedLabel)
 */
export function formatPriceWithCurrency(
  amountInBaseYER: number,
  targetCurrency: CurrencyCode = 'YER_NORTH',
  customRates?: ExchangeRates,
  options: { showSymbol?: boolean; detailedLabel?: boolean; compact?: boolean } = { showSymbol: true, detailedLabel: false }
): string {
  const converted = convertFromBaseYER(amountInBaseYER, targetCurrency, customRates);
  const normalizedCode: CurrencyCode = targetCurrency === 'YER' ? 'YER_NORTH' : targetCurrency;
  const config = CURRENCY_CONFIGS[normalizedCode] || CURRENCY_CONFIGS.YER_NORTH;

  let formattedNum = '';
  if (normalizedCode === 'USD' || normalizedCode === 'SAR') {
    formattedNum = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    formattedNum = Math.round(converted).toLocaleString('en-US');
  }

  if (options.showSymbol === false) {
    return formattedNum;
  }

  if (options.detailedLabel) {
    if (normalizedCode === 'YER_NORTH') return `${formattedNum} ريال شمالي`;
    if (normalizedCode === 'YER_SOUTH') return `${formattedNum} ريال جنوبي`;
    if (normalizedCode === 'USD') return `$${formattedNum} دولار`;
    if (normalizedCode === 'SAR') return `${formattedNum} ر.س`;
  }

  if (normalizedCode === 'USD') {
    return `$${formattedNum}`;
  }

  return `${formattedNum} ${config.symbol}`;
}

export function getRegionFromCity(city: string): RegionType {
  const southCities = ['عدن', 'حضرموت', 'المكلا', 'سيئون', 'لحج', 'أبين', 'شبوة', 'المهرة', 'سقطرى', 'مأرب'];
  const isSouth = southCities.some((sc) => city.includes(sc));
  return isSouth ? 'south' : 'north';
}

export function getDefaultCurrencyForRegion(region: RegionType): CurrencyCode {
  if (region === 'south') return 'YER_SOUTH';
  return 'YER_NORTH';
}
