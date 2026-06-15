import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { qwenTextToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, negativePrompt, width = 1024, height = 1024, steps = 30, cfgScale = 7.5, seed } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: '请输入提示词' }, { status: 400 });
    }

    // Call SiliconFlow Qwen-Image-Edit API
    const resultUrls = await qwenTextToImage({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt?.trim() || undefined,
      width,
      height,
      numOutputs: 4,
    });

    const image = await db.image.create({
      data: {
        userId: session.user.id,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt?.trim() || null,
        type: 'text-to-image',
        resultUrls: resultUrls as string[],
        width,
        height,
        steps,
        cfgScale,
        seed: seed || null,
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        resultUrls: image.resultUrls,
        prompt: image.prompt,
      },
    });
  } catch (error) {
    console.error('Text-to-image error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
