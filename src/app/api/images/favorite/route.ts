import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { imageId, favorite } = await request.json();

    const image = await db.image.findUnique({ where: { id: imageId } });
    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    await db.image.update({
      where: { id: imageId },
      data: { favorite: !!favorite },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
