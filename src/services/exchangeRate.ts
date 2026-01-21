const COMMON_CURRENCIES = ["EUR", "GBP", "CHF", "JPY", "CAD", "AUD"];

let ratesCache: Record<string, number> = {};
let lastUpdated: Date | null = null;

async function fetchAllRates(): Promise<void> {
  try {
    const currencies = COMMON_CURRENCIES.join(",");
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${currencies}`
    );
    const data = await response.json();

    // Store inverse rates (X to USD)
    const newCache: Record<string, number> = { USD: 1 };
    for (const [currency, rate] of Object.entries(data.rates)) {
      newCache[currency] = 1 / (rate as number);
    }

    ratesCache = newCache;
    lastUpdated = new Date();
    console.log(`Exchange rates updated at ${lastUpdated.toISOString()}`);
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
  }
}

async function fetchSingleRate(currency: string): Promise<number> {
  const response = await fetch(
    `https://api.frankfurter.app/latest?from=${currency}&to=USD`
  );
  const data = await response.json();
  const rate = data.rates.USD as number;

  // Cache it for future use
  ratesCache[currency] = rate;

  return rate;
}

export async function getUSDRate(
  currency: string,
  amount: number
): Promise<number> {
  const currencyUpper = currency.toUpperCase();

  if (currencyUpper === "USD") {
    return amount;
  }

  let rate = ratesCache[currencyUpper];

  // If not in cache, fetch it (slower, but only for uncached currencies)
  if (!rate) {
    rate = await fetchSingleRate(currencyUpper);
  }

  return amount * rate;
}

export function getRatesLastUpdated(): Date | null {
  return lastUpdated;
}

export function initExchangeRates(): void {
  // Fetch immediately on startup
  fetchAllRates();

  // Refresh daily (every 24 hours)
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(fetchAllRates, ONE_DAY_MS);
}
