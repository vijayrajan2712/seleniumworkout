// Real-time DhanHQ v2 Live Market Feed WebSocket client. Binary packet layout and
// subscribe-message JSON verified against the official Python SDK
// (github.com/dhan-oss/DhanHQ-py/src/dhanhq/marketfeed.py) - little-endian struct
// '<BHBIfHIfIIIffff' for the 50-byte Quote packet (response code 4):
//   0 u8 responseCode, 1 u16 msgLen, 3 u8 exchangeSegment, 4 u32 securityId,
//   8 f32 LTP, 12 u16 LTQ, 14 u32 LTT(epoch s), 18 f32 avgPrice, 22 u32 volume,
//   26 u32 totalSellQty, 30 u32 totalBuyQty, 34 f32 open, 38 f32 close, 42 f32 high, 46 f32 low
import WebSocket from 'ws';

const WS_URL = 'wss://api-feed.dhan.co';
const REQUEST_CODE_QUOTE = 17;
const BATCH_SIZE = 100;

const DISCONNECT_REASONS = {
  805: 'No. of active websocket connections exceeded',
  806: 'Subscribe to Data APIs to continue',
  807: 'Access Token is expired',
  808: 'Invalid Client ID',
  809: 'Authentication Failed',
};

export class DhanMarketFeed {
  constructor(clientId, accessToken) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.ws = null;
    this.instruments = []; // [{ securityId }]
    this.onTick = null;
    this._closedByUser = false;
    this._reconnectDelay = 2000;
  }

  /** instruments: array of Dhan securityId strings for NSE_EQ. onTick(securityId, tick). */
  connect(instruments, onTick) {
    this.instruments = instruments;
    this.onTick = onTick;
    this._closedByUser = false;
    this._open();
    return () => this.close();
  }

  close() {
    this._closedByUser = true;
    this.ws?.close();
  }

  _open() {
    const url = `${WS_URL}?version=2&token=${encodeURIComponent(this.accessToken)}&clientId=${encodeURIComponent(
      this.clientId
    )}&authType=2`;
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'nodebuffer';

    this.ws.on('open', () => {
      console.log('[dhan/marketFeed] connected, subscribing to', this.instruments.length, 'instruments');
      this._reconnectDelay = 2000;
      this._subscribeAll();
    });

    this.ws.on('message', (data) => this._handleMessage(data));

    this.ws.on('close', () => {
      console.warn('[dhan/marketFeed] connection closed');
      if (!this._closedByUser) this._scheduleReconnect();
    });

    this.ws.on('error', (err) => {
      console.error('[dhan/marketFeed] error:', err.message);
    });
  }

  _scheduleReconnect() {
    setTimeout(() => this._open(), this._reconnectDelay);
    this._reconnectDelay = Math.min(this._reconnectDelay * 1.5, 30000);
  }

  _subscribeAll() {
    for (let i = 0; i < this.instruments.length; i += BATCH_SIZE) {
      const batch = this.instruments.slice(i, i + BATCH_SIZE);
      const message = {
        RequestCode: REQUEST_CODE_QUOTE,
        InstrumentCount: batch.length,
        InstrumentList: batch.map((securityId) => ({ ExchangeSegment: 'NSE_EQ', SecurityId: String(securityId) })),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  _handleMessage(data) {
    if (!Buffer.isBuffer(data) || data.length < 1) return;
    const responseCode = data.readUInt8(0);
    switch (responseCode) {
      case 4: // Quote packet
        this._handleQuote(data);
        break;
      case 50: // Disconnection
        this._handleDisconnect(data);
        break;
      default:
        // Ticker/Full/OI/Depth/Status packets are ignored - we only subscribe in Quote mode.
        break;
    }
  }

  _handleQuote(data) {
    if (data.length < 50) return;
    const securityId = data.readUInt32LE(4);
    const ltp = data.readFloatLE(8);
    const ltt = data.readUInt32LE(14); // epoch seconds
    const volume = data.readUInt32LE(22);
    const totalSellQuantity = data.readUInt32LE(26);
    const totalBuyQuantity = data.readUInt32LE(30);

    this.onTick?.(String(securityId), {
      ltp: round2(ltp),
      ltt: ltt * 1000,
      volume,
      buyQuantity: totalBuyQuantity,
      sellQuantity: totalSellQuantity,
    });
  }

  _handleDisconnect(data) {
    if (data.length < 10) return;
    const code = data.readUInt16LE(8);
    console.error(`[dhan/marketFeed] server disconnected us: ${DISCONNECT_REASONS[code] || `code ${code}`}`);
  }
}

function round2(v) {
  return Math.round(v * 100) / 100;
}
