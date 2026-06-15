import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { listImages } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const images = await listImages(session.user.id, type, limit);

    return NextResponse.json({ images, nextCursor: images.length === limit ? images[images.length - 1]?.id : null });
  } catch (error) {
    console.error('List images error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
