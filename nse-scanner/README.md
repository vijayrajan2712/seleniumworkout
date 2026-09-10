# Nifty 500 Scanner

A live scanner across all Nifty 500 NSE stocks that streams a terminal-style feed of
technical signals on the 5-minute timeframe. **Scanner only** - it never places orders.
You read the signals and trade manually in Dhan (or wherever you trade).

## What it scans for

On every 5-minute candle close, for all ~500 Nifty 500 stocks:

- **PDH/PDL breakout/breakdown** - previous day high/low
- **PMH/PML breakout/breakdown** - previous month high/low
- **CPR** (Pivot/TC/BC) and the extended floor-pivot ladder **R1-R4/S1-S4**, with a signal
  on every rung crossed
- **Breakout confirmation rule**: a breakout is only scored once the *next* candle's open is
  itself beyond the breakout candle's close (above it for a bullish breakout, below it for a
  bearish one). This filters out candles that poke through a level and immediately reverse.
- **Unusual volume** - candle volume/notional value (price x volume) as an outlier vs. that
  stock's own trailing 20-candle average
- **Institutional / "big money" footprint (heuristic)** - buy/sell quantity imbalance +
  large notional value. **Important:** real FII/DII/institutional flow is published by NSE
  only end-of-day (bulk/block deal reports) - no retail API, Dhan included, exposes
  confirmed institutional order-flow live. This is a reasonable live proxy, not confirmed
  institutional data, and is labeled as such in the UI.
- **News/sector sentiment** - simulated headlines tagged by sector (real financial news API
  can be swapped in later)
- **Liquidity filter** - a "Volume > 5L only" toggle in the scanner hides any stock whose
  cumulative day volume hasn't crossed 5,00,000 shares yet
- **Order-flow delta (₹crore)** - every 5m candle close computes net buy-sell quantity
  imbalance x price, in crore. Two running totals accumulate through the day: **Positive Δ**
  (sum of every candle where delta was net-buying) and **Negative Δ** (sum of every candle
  where delta was net-selling) - shown as their own sortable columns, so you can spot stocks
  with sustained one-sided flow, not just a single candle's snapshot.

Each stock gets a scored verdict (`STRONG BUY` / `BUY` / `NEUTRAL` / `SELL` / `STRONG SELL`)
with a confidence % and a plain-English reasoning trail, shown in the scanner table and the
live terminal feed.

## Two data modes

**Mock mode (default, zero setup):** simulated price/volume data for the full Nifty 500
universe. Runs immediately with no credentials, useful to see the whole pipeline work.

**Live mode (real Dhan data):** set `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN` and the app
switches automatically to real market data - real 5-minute candles, real daily history for
PDH/PDL/PMH/PML/CPR, and Dhan's live WebSocket feed for real-time ticks. Still read-only -
**no order placement code exists in this app at all.**

## Getting your Dhan API credentials

1. Log in to [web.dhan.co](https://web.dhan.co), go to **Profile → Access DhanHQ APIs**,
   toggle to **API key**, and generate your API key/secret (valid 12 months).
2. Follow Dhan's flow to generate an **access token** for your **client ID** - both are
   shown in the same section.
3. You need Dhan's **Data APIs** subscription active on your account (this is what you
   referred to as your paid plan) for historical + live market feed access.

## Running it

**Backend:**
```bash
cd nse-scanner/server
npm install
npm start                 # mock mode - no setup needed
```

To run in live mode:
```bash
cp .env.example .env
# edit .env: set DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN
npm run start:env
```

**Frontend** (separate terminal):
```bash
cd nse-scanner/client
npm install
npm run dev                # http://localhost:5174
```

Open `http://localhost:5174`. A yellow **MOCK DATA** or green **LIVE (Dhan)** badge in the
header shows which mode is active.

### What happens on startup in live mode

1. Downloads Dhan's instrument master CSV and maps each Nifty 500 symbol to a Dhan
   `securityId` (logs how many symbols failed to map, if any - index constituents do drift
   from the bundled snapshot over time, see below).
2. Fetches ~75 days of daily history per mapped symbol (rate-limited, default 3 requests/sec
   - tune with `DHAN_REQUESTS_PER_SECOND` in `.env` if you hit rate limits; ~500 symbols at
   3/sec is roughly 3 minutes). This is what PDH/PDL/PMH/PML/CPR are computed from.
3. Opens **one** WebSocket connection to Dhan's live feed in Quote mode for all mapped
   symbols (well under Dhan's 5,000-instruments-per-connection limit) and starts building
   5-minute candles from live ticks.

Use `UNIVERSE_LIMIT=20` in `.env` for a fast test run against a small slice of the universe
before committing to a full 500-symbol bootstrap.

## Nifty 500 list

`server/data/nifty500.json` ships with a point-in-time community-sourced snapshot (501
symbols/company/industry/ISIN). NSE reconstitutes index membership roughly twice a year. The
app also attempts to fetch the live list directly from NSE at startup and falls back to the
bundled snapshot if that fails (NSE's archive endpoint is known to bot-block many
requests, including from this project's own dev sandbox - it may work fine from your machine,
or not, depending on IP/rate limits). Refresh `data/nifty500.json` periodically from
[NSE's official CSV](https://archives.nseindia.com/content/indices/ind_nifty500list.csv) if
you want it current.

## Architecture

```
nse-scanner/
  server/
    data/nifty500.json          bundled Nifty 500 snapshot
    src/
      universe/nifty500.js       loads bundled/live universe list
      dhan/
        mockDhanClient.js         simulated data source (same interface as real client)
        realDhanClient.js         real Dhan REST + WS orchestration
        httpClient.js             low-level REST client (verified DhanHQ v2 request shapes)
        instrumentMaster.js       scrip-master CSV loader + symbol->securityId mapping
        marketFeed.js             live WebSocket feed (binary packet parser)
      marketData/
        candleAggregator.js       tick -> 5m candle aggregation + candle-close detection
        candleStore.js            live 5m candle storage per symbol
        dailyHistoryStore.js      daily candle storage per symbol (PDH/PDL/PMH/PML/CPR source)
      analysis/
        levels.js, cpr.js, volumeProfile.js         core level math
        breakoutConfirmation.js                      next-candle-open confirmation rule
        unusualVolume.js, institutionalHeuristic.js  volume/flow heuristics
        signalEngine.js                               combines everything into a verdict
      news/newsSimulator.js       simulated sector/market news with sentiment
      scanner/scanEngine.js       orchestrates the whole pipeline across all symbols
      index.js                    Express + WebSocket server
  client/                        React (Vite) + lightweight-charts dashboard
```

## Dhan API integration notes

Built against the verified official Python SDK
([github.com/dhan-oss/DhanHQ-py](https://github.com/dhan-oss/DhanHQ-py)) rather than prose
docs alone, to get exact request/response shapes right:

- Base URL `https://api.dhan.co/v2`, `access-token` + `client-id` headers, every POST/PUT
  body additionally carries a `dhanClientId` field.
- `/charts/historical` (daily) and `/charts/intraday` return **columnar** data
  (`{open:[], high:[], low:[], close:[], volume:[], timestamp:[]}`), not an array of candle
  objects - `realDhanClient.js` un-zips this into normal `{time, open, high, low, close,
  volume}` candles.
- Live feed: `wss://api-feed.dhan.co?version=2&token=...&clientId=...&authType=2`, JSON
  subscribe messages batched to 100 instruments each, Quote-mode (`RequestCode: 17`) binary
  packets parsed per the SDK's `<BHBIfHIfIIIffff>` (50-byte) struct layout for LTP, LTT,
  volume, and cumulative buy/sell quantity.
- Instrument master: `https://images.dhan.co/api-data/api-scrip-master-detailed.csv`, columns
  matched defensively (`SEM_SMST_SECURITY_ID`, `SEM_TRADING_SYMBOL`, `SEM_EXM_EXCH_ID`,
  `SEM_SEGMENT`, `SEM_SERIES`) so a minor Dhan-side column rename doesn't silently break
  symbol mapping - it throws a clear error naming the missing column instead.

This sandbox's network policy blocks `dhan.co`/`nseindia.com` domains outright, so the real
Dhan REST/WebSocket paths could not be live-tested end-to-end in this environment - only
verified against the SDK source and exercised via the mock client, which implements the
identical interface. Test live mode on your own machine with a small `UNIVERSE_LIMIT` first.

## Disclaimer

Educational/decision-support tool. Signals are simulated in mock mode and heuristic even in
live mode (especially the "institutional activity" proxy - see caveat above). Nothing here
is financial advice, and this app never places, modifies, or cancels any order - all trading
decisions and execution are yours, manually, in your own broker platform.
