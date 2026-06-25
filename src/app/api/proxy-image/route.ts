import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url) return new NextResponse('missing url', { status: 400 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse('fetch failed: ' + res.status, { status: 502 });

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new NextResponse('proxy error', { status: 500 });
  }
}
