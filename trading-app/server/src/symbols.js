// Instrument universe: forex majors + gold + oil.
// basePrice/volatility drive the simulator; pip is used for display rounding.
export const SYMBOLS = [
  { id: 'XAUUSD', name: 'Gold Spot', category: 'metal', basePrice: 2415.5, volatility: 1.8, decimals: 2 },
  { id: 'USOIL', name: 'WTI Crude Oil', category: 'energy', basePrice: 78.2, volatility: 0.6, decimals: 2 },
  { id: 'UKOIL', name: 'Brent Crude Oil', category: 'energy', basePrice: 82.4, volatility: 0.6, decimals: 2 },
  { id: 'EURUSD', name: 'Euro / US Dollar', category: 'forex', basePrice: 1.0845, volatility: 0.0009, decimals: 5 },
  { id: 'GBPUSD', name: 'Pound / US Dollar', category: 'forex', basePrice: 1.2685, volatility: 0.0011, decimals: 5 },
  { id: 'USDJPY', name: 'US Dollar / Yen', category: 'forex', basePrice: 149.85, volatility: 0.14, decimals: 3 },
  { id: 'AUDUSD', name: 'Aussie / US Dollar', category: 'forex', basePrice: 0.6512, volatility: 0.0008, decimals: 5 },
];

export const SYMBOL_IDS = SYMBOLS.map((s) => s.id);

export function getSymbol(id) {
  return SYMBOLS.find((s) => s.id === id);
}

// Which macro news categories move which instruments (used by the news simulator/signal engine).
export const NEWS_DRIVERS = {
  XAUUSD: ['fed_policy', 'inflation', 'geopolitical', 'usd_strength', 'gold_demand'],
  USOIL: ['opec', 'inventories', 'geopolitical', 'demand_outlook', 'usd_strength'],
  UKOIL: ['opec', 'inventories', 'geopolitical', 'demand_outlook', 'usd_strength'],
  EURUSD: ['ecb_policy', 'fed_policy', 'inflation', 'eu_growth'],
  GBPUSD: ['boe_policy', 'fed_policy', 'uk_growth', 'inflation'],
  USDJPY: ['boj_policy', 'fed_policy', 'risk_sentiment'],
  AUDUSD: ['rba_policy', 'fed_policy', 'china_demand', 'commodity_prices'],
};
