// Simulated market/sector news headlines with sentiment, tagged to Nifty 500 stocks by
// sector (from the industry field) or, occasionally, a specific company. In production this
// module would be replaced by a real news API (e.g. a financial news provider) filtered to
// India market-moving stories, plus an NLP sentiment scorer - the rest of the pipeline
// (rolling per-symbol sentiment, signal weighting) stays identical.

const SECTOR_TEMPLATES = [
  { keyword: 'BANK', sentiment: 0.5, text: 'RBI holds repo rate, banking stocks rally on stable NIM outlook' },
  { keyword: 'BANK', sentiment: -0.5, text: 'Rising bond yields pressure banking sector margins' },
  { keyword: 'FINANC', sentiment: 0.4, text: 'Strong credit growth data lifts financial services stocks' },
  { keyword: 'FINANC', sentiment: -0.4, text: 'NBFC asset quality concerns weigh on financial services' },
  { keyword: 'IT', sentiment: 0.5, text: 'US tech spending recovery boosts IT services demand outlook' },
  { keyword: 'IT', sentiment: -0.5, text: 'Client budget cuts and weak deal wins hit IT services guidance' },
  { keyword: 'PHARMA', sentiment: 0.4, text: 'USFDA clears key facility, pharma exports outlook improves' },
  { keyword: 'PHARMA', sentiment: -0.4, text: 'Pricing pressure in US generics weighs on pharma margins' },
  { keyword: 'AUTO', sentiment: 0.5, text: 'Festive season auto sales beat estimates across categories' },
  { keyword: 'AUTO', sentiment: -0.5, text: 'Rising input costs and weak rural demand hit auto volumes' },
  { keyword: 'METAL', sentiment: 0.4, text: 'China stimulus lifts global metal prices, boosts sector margins' },
  { keyword: 'METAL', sentiment: -0.4, text: 'Weak global demand drags metal and mining stocks' },
  { keyword: 'OIL', sentiment: 0.4, text: 'Refining margins expand on firm crude spreads' },
  { keyword: 'OIL', sentiment: -0.4, text: 'Crude price volatility pressures energy sector margins' },
  { keyword: 'FMCG', sentiment: 0.4, text: 'Rural demand recovery lifts FMCG volume growth outlook' },
  { keyword: 'FMCG', sentiment: -0.4, text: 'Input cost inflation squeezes FMCG margins' },
  { keyword: 'CONSUMER GOODS', sentiment: 0.35, text: 'Festive demand supports consumer goods sales momentum' },
  { keyword: 'CEMENT', sentiment: 0.4, text: 'Infrastructure push drives cement demand and pricing power' },
  { keyword: 'CEMENT', sentiment: -0.4, text: 'Oversupply and weak pricing hit cement sector realizations' },
  { keyword: 'REALTY', sentiment: 0.4, text: 'Housing sales momentum continues in top metros' },
  { keyword: 'REALTY', sentiment: -0.4, text: 'High interest rates weigh on housing demand and realty stocks' },
  { keyword: 'POWER', sentiment: 0.4, text: 'Rising power demand supports utility sector earnings' },
  { keyword: 'TELECOM', sentiment: 0.4, text: 'Tariff hikes expected to lift telecom ARPU and margins' },
  { keyword: 'TELECOM', sentiment: -0.4, text: 'Intense competition pressures telecom sector pricing' },
  { keyword: 'CHEMICAL', sentiment: 0.4, text: 'Specialty chemical exports pick up on China+1 order shift' },
  { keyword: 'CHEMICAL', sentiment: -0.4, text: 'Chinese oversupply pressures specialty chemical prices' },
  { keyword: 'CAPITAL GOODS', sentiment: 0.4, text: 'Order book momentum strong on capex cycle pickup' },
  { keyword: 'CONSTRUCTION', sentiment: 0.4, text: 'Government infra spending accelerates order inflows' },
  { keyword: 'TEXTILE', sentiment: 0.3, text: 'Export orders pick up as global apparel demand recovers' },
  { keyword: 'HEALTHCARE', sentiment: 0.35, text: 'Hospital occupancy and footfalls trend higher this quarter' },
  { keyword: 'MEDIA', sentiment: 0.3, text: 'Ad revenue recovery lifts media and entertainment outlook' },
];

const MARKET_WIDE_TEMPLATES = [
  { sentiment: 0.5, text: 'FIIs turn net buyers in Indian equities after weeks of outflows' },
  { sentiment: -0.5, text: 'FII selling intensifies amid global risk-off sentiment' },
  { sentiment: 0.4, text: 'Domestic mutual fund inflows hit record high, DIIs remain net buyers' },
  { sentiment: -0.4, text: 'Rupee weakness and crude spike weigh on broader market sentiment' },
  { sentiment: -0.5, text: 'RBI flags inflation risks, hints at extended pause on rate cuts' },
  { sentiment: 0.5, text: 'GDP growth print beats estimates, boosts broad market sentiment' },
  { sentiment: -0.3, text: 'Global bond yields spike, emerging market equities under pressure' },
];

export class NewsSimulator {
  constructor(universe, rand = Math.random) {
    this.universe = universe; // [{symbol, name, industry}]
    this.rand = rand;
    this.history = [];
    this.sentimentBySymbol = new Map();
    this.nextId = 1;
  }

  symbolsForSector(keyword) {
    return this.universe.filter((s) => s.industry.includes(keyword)).map((s) => s.symbol);
  }

  generate(atTime) {
    const useCompanySpecific = this.rand() < 0.25;
    let text;
    let sentiment;
    let symbols;
    let tag;

    if (useCompanySpecific) {
      const stock = this.universe[Math.floor(this.rand() * this.universe.length)];
      const positive = this.rand() < 0.5;
      const templates = positive
        ? [`${stock.name} beats quarterly earnings estimates, margins expand`, `${stock.name} wins large new order, stock in focus`]
        : [`${stock.name} misses quarterly earnings estimates, margins under pressure`, `${stock.name} flags order delays, guidance trimmed`];
      text = templates[Math.floor(this.rand() * templates.length)];
      sentiment = (positive ? 1 : -1) * (0.5 + this.rand() * 0.4);
      symbols = [stock.symbol];
      tag = 'company';
    } else if (this.rand() < 0.3) {
      const template = MARKET_WIDE_TEMPLATES[Math.floor(this.rand() * MARKET_WIDE_TEMPLATES.length)];
      text = template.text;
      sentiment = clamp(template.sentiment + (this.rand() - 0.5) * 0.15, -1, 1);
      symbols = this.universe.map((s) => s.symbol); // affects the whole scanned universe
      tag = 'market';
    } else {
      const template = SECTOR_TEMPLATES[Math.floor(this.rand() * SECTOR_TEMPLATES.length)];
      text = template.text;
      sentiment = clamp(template.sentiment + (this.rand() - 0.5) * 0.2, -1, 1);
      symbols = this.symbolsForSector(template.keyword);
      tag = template.keyword;
    }

    const item = { id: this.nextId++, time: atTime, text, sentiment, symbols, tag };
    this.history.push(item);
    if (this.history.length > 300) this.history.shift();
    this.updateRollingSentiment(item);
    return item;
  }

  updateRollingSentiment(item) {
    // Market-wide headlines nudge every symbol lightly; sector/company ones move their symbols more.
    const weight = item.tag === 'market' ? 0.08 : 0.3;
    for (const symbolId of item.symbols) {
      const prev = this.sentimentBySymbol.get(symbolId) ?? 0;
      this.sentimentBySymbol.set(symbolId, prev * (1 - weight) + item.sentiment * weight);
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
