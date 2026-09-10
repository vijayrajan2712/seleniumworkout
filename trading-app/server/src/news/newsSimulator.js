import { SYMBOLS, NEWS_DRIVERS } from '../symbols.js';

// Simulated macro/world news headlines, tagged by category with a sentiment score.
// In production this module would call a real news API (NewsAPI, Finnhub, GDELT, etc.)
// filtered to gold/oil/forex-relevant categories - the rest of the pipeline (tagging,
// sentiment aggregation, signal weighting) stays identical.

const TEMPLATES = [
  { category: 'fed_policy', sentiment: -0.7, text: 'Fed signals additional rate hikes to combat sticky inflation' },
  { category: 'fed_policy', sentiment: 0.7, text: 'Fed hints at rate cuts as inflation cools faster than expected' },
  { category: 'fed_policy', sentiment: 0.1, text: 'FOMC minutes show policymakers split on next move' },
  { category: 'inflation', sentiment: -0.5, text: 'US CPI comes in hotter than forecast' },
  { category: 'inflation', sentiment: 0.5, text: 'US CPI undershoots expectations, easing price pressures' },
  { category: 'geopolitical', sentiment: 0.8, text: 'Escalating Middle East tensions drive safe-haven demand' },
  { category: 'geopolitical', sentiment: -0.6, text: 'Ceasefire talks progress, easing geopolitical risk premium' },
  { category: 'usd_strength', sentiment: -0.6, text: 'Dollar index surges to multi-month high on strong jobs data' },
  { category: 'usd_strength', sentiment: 0.6, text: 'Dollar index slides as risk appetite returns to markets' },
  { category: 'gold_demand', sentiment: 0.5, text: 'Central banks report record gold reserve accumulation' },
  { category: 'gold_demand', sentiment: -0.4, text: 'ETF outflows weigh on gold as investors rotate to equities' },
  { category: 'opec', sentiment: 0.7, text: 'OPEC+ agrees to extend production cuts, tightening supply' },
  { category: 'opec', sentiment: -0.6, text: 'OPEC+ surprises markets with output increase' },
  { category: 'inventories', sentiment: -0.5, text: 'EIA reports unexpected build in crude oil inventories' },
  { category: 'inventories', sentiment: 0.5, text: 'EIA reports sharp draw in crude oil inventories' },
  { category: 'demand_outlook', sentiment: -0.4, text: 'IEA cuts global oil demand growth forecast' },
  { category: 'demand_outlook', sentiment: 0.4, text: 'IEA raises oil demand outlook on resilient global growth' },
  { category: 'ecb_policy', sentiment: 0.4, text: 'ECB holds rates, signals cautious easing path ahead' },
  { category: 'ecb_policy', sentiment: -0.4, text: 'ECB flags persistent core inflation, delays rate cuts' },
  { category: 'boe_policy', sentiment: 0.4, text: 'BoE minutes show growing support for rate cuts' },
  { category: 'boe_policy', sentiment: -0.4, text: 'BoE warns inflation risks remain tilted to the upside' },
  { category: 'boj_policy', sentiment: 0.5, text: 'BoJ signals further policy normalization, yen strengthens' },
  { category: 'boj_policy', sentiment: -0.5, text: 'BoJ maintains ultra-loose policy, yen slides' },
  { category: 'risk_sentiment', sentiment: 0.4, text: 'Global equities rally on improved risk appetite' },
  { category: 'risk_sentiment', sentiment: -0.4, text: 'Risk-off wave hits markets amid growth worries' },
  { category: 'eu_growth', sentiment: -0.3, text: 'Eurozone PMI data signals contracting manufacturing activity' },
  { category: 'eu_growth', sentiment: 0.3, text: 'Eurozone growth data beats expectations' },
  { category: 'uk_growth', sentiment: -0.3, text: 'UK GDP growth stalls, raising recession concerns' },
  { category: 'uk_growth', sentiment: 0.3, text: 'UK retail sales rebound sharply' },
  { category: 'rba_policy', sentiment: 0.3, text: 'RBA keeps door open for further tightening' },
  { category: 'rba_policy', sentiment: -0.3, text: 'RBA turns dovish citing cooling labor market' },
  { category: 'china_demand', sentiment: 0.5, text: 'China stimulus measures boost commodity demand outlook' },
  { category: 'china_demand', sentiment: -0.5, text: 'Weak China factory data dampens commodity demand outlook' },
  { category: 'commodity_prices', sentiment: 0.3, text: 'Broad commodity rally as supply chain risks resurface' },
  { category: 'commodity_prices', sentiment: -0.3, text: 'Commodity prices soften on stronger dollar and demand fears' },
];

function symbolsForCategory(category) {
  return SYMBOLS.filter((s) => NEWS_DRIVERS[s.id]?.includes(category)).map((s) => s.id);
}

export class NewsSimulator {
  constructor(rand = Math.random) {
    this.rand = rand;
    this.history = []; // { id, time, text, category, sentiment, symbols }
    this.sentimentBySymbol = new Map();
    this.nextId = 1;
  }

  generate(atTime) {
    const template = TEMPLATES[Math.floor(this.rand() * TEMPLATES.length)];
    const jitter = (this.rand() - 0.5) * 0.2;
    const sentiment = clamp(template.sentiment + jitter, -1, 1);
    const symbols = symbolsForCategory(template.category);
    const item = {
      id: this.nextId++,
      time: atTime,
      text: template.text,
      category: template.category,
      sentiment,
      symbols,
    };
    this.history.push(item);
    if (this.history.length > 200) this.history.shift();
    this.updateRollingSentiment(item);
    return item;
  }

  updateRollingSentiment(item) {
    for (const symbolId of item.symbols) {
      const prev = this.sentimentBySymbol.get(symbolId) ?? 0;
      // Exponential moving average: recent headlines dominate, old ones decay.
      const next = prev * 0.7 + item.sentiment * 0.3;
      this.sentimentBySymbol.set(symbolId, next);
    }
  }

  getSentiment(symbolId) {
    return this.sentimentBySymbol.get(symbolId) ?? 0;
  }

  recent(symbolId, limit = 20) {
    const items = symbolId ? this.history.filter((h) => h.symbols.includes(symbolId)) : this.history;
    return items.slice(-limit).reverse();
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
