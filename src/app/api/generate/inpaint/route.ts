import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createImage } from '@/lib/supabase';
import { qwenImageToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const { prompt, imageUrl, maskUrl } = await request.json();
    if (!prompt || !imageUrl || !maskUrl) return NextResponse.json({ error: '提示词、原图和遮罩图为必填项' }, { status: 400 });

    const fullPrompt = `修改图片中红色标记区域: ${prompt.trim()}`;
    const resultUrls = await qwenImageToImage({ prompt: fullPrompt, imageUrl, numOutputs: 1 });

    const image = await createImage({ user_id: session.user.id, prompt: prompt.trim(), type: 'inpaint', source_url: imageUrl, mask_url: maskUrl, result_urls: resultUrls as string[] });

    return NextResponse.json({ success: true, image: { id: image.id, resultUrls: image.result_urls } });
  } catch (error) {
    console.error('Inpaint error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '局部重绘失败' }, { status: 500 });
  }
}
