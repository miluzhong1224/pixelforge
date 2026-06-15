import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };
    if (type && type !== 'all') {
      where.type = type;
    }

    const images = await db.image.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: {
        id: true,
        prompt: true,
        type: true,
        resultUrls: true,
        width: true,
        height: true,
        status: true,
        favorite: true,
        createdAt: true,
      },
    });

    const hasMore = images.length > limit;
    const items = hasMore ? images.slice(0, limit) : images;

    return NextResponse.json({
      images: items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (error) {
    console.error('List images error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
