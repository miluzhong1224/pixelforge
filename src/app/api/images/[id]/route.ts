import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;

    const image = await db.image.findUnique({
      where: { id },
    });

    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error('Get image error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;

    const image = await db.image.findUnique({
      where: { id },
    });

    if (!image || image.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    }

    await db.image.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
