import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getImage, updateImage } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const { imageId } = await request.json();
    const image = await getImage(imageId);
    if (!image || image.user_id !== session.user.id) return NextResponse.json({ error: '未找到该作品' }, { status: 404 });

    let shareSlug = image.share_slug;
    if (!shareSlug) {
      shareSlug = randomBytes(6).toString('hex');
      await updateImage(imageId, { share_slug: shareSlug });
    }
    const shareUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/share/${shareSlug}`;
    return NextResponse.json({ success: true, shareUrl, shareSlug });
  } catch (error) {
    console.error('Share error:', error);
    return NextResponse.json({ error: '生成分享链接失败' }, { status: 500 });
  }
}
