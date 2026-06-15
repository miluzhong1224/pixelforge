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
    const { prompt, negativePrompt, imageUrl, maskUrl, width = 1024, height = 1024 } = body;

    if (!prompt || !imageUrl || !maskUrl) {
      return NextResponse.json(
        { error: '提示词、原图和遮罩图为必填项' },
        { status: 400 }
      );
    }

    // 用原图 + 编辑描述传给 Qwen-Image-Edit
    const fullPrompt = `修改图片中红色标记区域: ${prompt.trim()}`;
    const resultUrls = await qwenImageToImage({
      prompt: fullPrompt,
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
        type: 'inpaint',
        sourceUrl: imageUrl,
        maskUrl,
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
    console.error('Inpaint error:', error);
    const message = error instanceof Error ? error.message : 'Inpainting failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
