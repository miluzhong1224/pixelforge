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

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: '请提供图片' }, { status: 400 });
    }

    const resultUrls = await qwenImageToImage({
      prompt: 'Enhance this image to ultra high resolution, 4K upscale, sharpen details, remove noise and artifacts, preserve original composition, professional quality, high fidelity',
      imageUrl,
      numOutputs: 1,
    });

    const image = await db.image.create({
      data: {
        userId: session.user.id,
        prompt: '画质增强 2x',
        type: 'image-to-image',
        sourceUrl: imageUrl,
        resultUrls: resultUrls as string[],
        width: 1024,
        height: 1024,
      },
    });

    return NextResponse.json({
      success: true,
      image: { id: image.id, resultUrls: image.resultUrls },
    });
  } catch (error) {
    console.error('Upscale error:', error);
    const message = error instanceof Error ? error.message : '放大失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
