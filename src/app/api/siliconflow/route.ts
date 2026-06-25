import { NextResponse } from 'next/server';

export const runtime = 'edge';

const SF_BASE = 'https://api.siliconflow.cn';
const SF_KEY = process.env.SILICONFLOW_API_TOKEN || 'sk-rysuzwlsavfdfmdhyruuzkuthkwmueuqywjsziyxmniciftn';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${SF_BASE}/v1/images/generations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SF_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'API error' }, { status: res.status });
    }
    return NextResponse.json({ url: data.data?.[0]?.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || '代理请求失败' }, { status: 500 });
  }
}
