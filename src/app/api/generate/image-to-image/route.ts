import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createImage } from '@/lib/supabase';
import { qwenImageToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { prompt, imageUrl } = await request.json();
    if (!prompt || !imageUrl) return NextResponse.json({ error: '提示词和参考图片为必填项' }, { status: 400 });

    const resultUrls = await qwenImageToImage({ prompt: prompt.trim(), imageUrl, numOutputs: 1 });

    const image = await createImage({ user_id: session.user.id, prompt: prompt.trim(), type: 'image-to-image', source_url: imageUrl, result_urls: resultUrls as string[] });

    return NextResponse.json({ success: true, image: { id: image.id, resultUrls: image.result_urls } });
  } catch (error) {
    console.error('Image-to-image error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '生成失败' }, { status: 500 });
  }
}
