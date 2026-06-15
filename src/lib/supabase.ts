const BASE = 'https://pnowmoquisuqomhfsvza.supabase.co';
const KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';

const h = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

interface UserRow {
  id: string; email: string; password_hash: string; name: string | null;
  avatar_url: string | null; createdAt: string; updatedAt: string;
}

interface ImageRow {
  id: string; user_id: string; prompt: string; negative_prompt: string | null;
  type: string; source_url: string | null; mask_url: string | null;
  result_urls: string[]; width: number; height: number; steps: number;
  cfg_scale: number; seed: number | null; status: string;
  favorite: boolean; share_slug: string | null; createdAt: string;
}

// ── Users ──

export async function findUserByEmail(email: string) {
  const res = await fetch(`${BASE}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}&limit=1`, { headers: h });
  if (!res.ok) throw new Error(`Query failed: ${res.status}`);
  const users: UserRow[] = await res.json();
  return users[0] || null;
}

export async function createUser(data: { id: string; email: string; password_hash: string; name: string; createdAt: string; updatedAt: string }) {
  const res = await fetch(`${BASE}/rest/v1/users`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`Insert failed ${res.status}: ${await res.text()}`);
  const users: UserRow[] = await res.json();
  return users[0];
}

// ── Images ──

export async function createImage(data: Partial<ImageRow> & { user_id: string; prompt: string; type: string; result_urls: string[] }) {
  const now = new Date().toISOString();
  const body = { id: crypto.randomUUID(), user_id: data.user_id, prompt: data.prompt, negative_prompt: data.negative_prompt || null, type: data.type, source_url: data.source_url || null, mask_url: data.mask_url || null, result_urls: data.result_urls, width: data.width || 1024, height: data.height || 1024, steps: data.steps || 30, cfg_scale: data.cfg_scale || 7.5, seed: data.seed || null, status: 'completed', favorite: false, createdAt: now };
  const res = await fetch(`${BASE}/rest/v1/images`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`Insert image failed ${res.status}: ${await res.text()}`);
  const rows: ImageRow[] = await res.json();
  return rows[0];
}

export async function getImage(id: string) {
  const res = await fetch(`${BASE}/rest/v1/images?id=eq.${id}&limit=1`, { headers: h });
  if (!res.ok) throw new Error(`Get image failed: ${res.status}`);
  const rows: ImageRow[] = await res.json();
  return rows[0] || null;
}

export async function listImages(userId: string, type?: string | null, limit = 20) {
  let url = `${BASE}/rest/v1/images?select=id,prompt,type,result_urls,width,height,status,favorite,createdAt&user_id=eq.${userId}&order=createdAt.desc&limit=${limit}`;
  if (type && type !== 'all') url += `&type=eq.${type}`;
  const res = await fetch(url, { headers: h, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`List images failed: ${res.status}`);
  return (await res.json()) as ImageRow[];
}

export async function getImagesByUser(userId: string, type?: string | null, limit = 20) {
  let url = `${BASE}/rest/v1/images?select=id,prompt,type,result_urls,width,height,status,favorite,createdAt&user_id=eq.${userId}&order=createdAt.desc&limit=${limit}`;
  if (type && type !== 'all') url += `&type=eq.${type}`;
  const res = await fetch(url, { headers: h, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`List images failed: ${res.status}`);
  return (await res.json()) as ImageRow[];
}

export async function deleteImage(id: string) {
  const res = await fetch(`${BASE}/rest/v1/images?id=eq.${id}`, { method: 'DELETE', headers: h });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function updateImage(id: string, data: Record<string, unknown>) {
  const res = await fetch(`${BASE}/rest/v1/images?id=eq.${id}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`Update failed ${res.status}: ${await res.text()}`);
  const rows: ImageRow[] = await res.json();
  return rows[0];
}
