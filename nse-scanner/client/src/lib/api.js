export async function fetchState(symbolId) {
  const res = await fetch(`/api/state/${symbolId}`);
  if (!res.ok) throw new Error('failed to load symbol state');
  return res.json();
}
