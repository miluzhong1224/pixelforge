import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getImage, updateImage } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const { imageId, favorite } = await request.json();
    const image = await getImage(imageId);
    if (!image || image.user_id !== session.user.id) return NextResponse.json({ error: '未找到该作品' }, { status: 404 });
    await updateImage(imageId, { favorite: !!favorite });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorite error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
