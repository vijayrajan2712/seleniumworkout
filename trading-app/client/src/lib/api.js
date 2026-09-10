export async function fetchSymbols() {
  const res = await fetch('/api/symbols');
  return res.json();
}

export async function fetchState(symbolId) {
  const res = await fetch(`/api/state/${symbolId}`);
  if (!res.ok) throw new Error('failed to load symbol state');
  return res.json();
}
