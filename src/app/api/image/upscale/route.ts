import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createImage } from '@/lib/supabase';
import { qwenImageToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: '请提供图片' }, { status: 400 });

    const resultUrls = await qwenImageToImage({ prompt: 'Enhance to 4K, sharpen, remove noise, professional quality', imageUrl, numOutputs: 1 });
    const image = await createImage({ user_id: session.user.id, prompt: '画质增强 2x', type: 'image-to-image', source_url: imageUrl, result_urls: resultUrls as string[] });

    return NextResponse.json({ success: true, image: { id: image.id, resultUrls: image.result_urls } });
  } catch (error) {
    console.error('Upscale error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '放大失败' }, { status: 500 });
  }
}
