import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { qwenImageToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, negativePrompt, imageUrl, width = 1024, height = 1024 } = body;

    if (!prompt || !imageUrl) {
      return NextResponse.json({ error: '提示词和参考图片为必填项' }, { status: 400 });
    }

    const resultUrls = await qwenImageToImage({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt?.trim() || undefined,
      imageUrl,
      width,
      height,
      numOutputs: 1,
    });

    const image = await db.image.create({
      data: {
        userId: session.user.id,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt?.trim() || null,
        type: 'image-to-image',
        sourceUrl: imageUrl,
        resultUrls: resultUrls as string[],
        width,
        height,
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        resultUrls: image.resultUrls,
      },
    });
  } catch (error) {
    console.error('Image-to-image error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
