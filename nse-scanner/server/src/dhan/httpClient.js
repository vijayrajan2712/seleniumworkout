// Thin REST client for the DhanHQ v2 API, built against the verified official SDK
// (github.com/dhan-oss/DhanHQ-py) request/response shapes:
//   - base URL https://api.dhan.co/v2
//   - every request carries 'access-token' and 'client-id' headers
//   - every POST/PUT body additionally carries a "dhanClientId" field (the official
//     Python SDK injects this automatically in DhanHTTP._send_request)
// Read-only: this app never places orders, so only GET/POST-for-data are implemented.

const BASE_URL = 'https://api.dhan.co/v2';

export class DhanHttpClient {
  constructor(clientId, accessToken) {
    this.clientId = clientId;
    this.accessToken = accessToken;
    this.headers = {
      'access-token': accessToken,
      'client-id': clientId,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async post(endpoint, payload) {
    const res = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ ...payload, dhanClientId: this.clientId }),
    });
    return parseResponse(res, endpoint);
  }

  async get(endpoint) {
    const res = await fetch(BASE_URL + endpoint, { method: 'GET', headers: this.headers });
    return parseResponse(res, endpoint);
  }
}

async function parseResponse(res, endpoint) {
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const msg = json?.errorMessage || json?.remarks || `HTTP ${res.status}`;
    throw new Error(`Dhan API ${endpoint} failed: ${msg}`);
  }
  return json;
}
