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
      prompt: 'Remove the background, make it pure white background, product photography style, high quality, clean edges, studio lighting',
      imageUrl,
      numOutputs: 1,
    });

    const image = await db.image.create({
      data: {
        userId: session.user.id,
        prompt: '背景移除',
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
    console.error('Remove BG error:', error);
    const message = error instanceof Error ? error.message : '背景移除失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
