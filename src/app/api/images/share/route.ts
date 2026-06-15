import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { imageId } = await request.json();

    const image = await db.image.findUnique({ where: { id: imageId } });
    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    // 如果已有 slug 就复用，否则生成新的
    let shareSlug = image.shareSlug;
    if (!shareSlug) {
      shareSlug = randomBytes(6).toString('hex');
      await db.image.update({ where: { id: imageId }, data: { shareSlug } });
    }

    const shareUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/share/${shareSlug}`;

    return NextResponse.json({ success: true, shareUrl, shareSlug });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: '生成分享链接失败' }, { status: 500 });
  }
}
