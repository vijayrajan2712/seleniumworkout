export const PORT = process.env.PORT || 4100;

export const DHAN_CLIENT_ID = process.env.DHAN_CLIENT_ID || '';
export const DHAN_ACCESS_TOKEN = process.env.DHAN_ACCESS_TOKEN || '';

export const HAS_DHAN_CREDENTIALS = Boolean(DHAN_CLIENT_ID && DHAN_ACCESS_TOKEN);

// Cap how many Nifty 500 symbols to actually scan - useful for testing without waiting
// through a full 500-symbol historical-data bootstrap. Unset/0 = full universe.
export const UNIVERSE_LIMIT = Number(process.env.UNIVERSE_LIMIT || 0);
