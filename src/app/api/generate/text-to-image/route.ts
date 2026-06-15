import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createImage } from '@/lib/supabase';
import { qwenTextToImage } from '@/lib/siliconflow';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const body = await request.json();
    const { prompt, negativePrompt, width = 1024, height = 1024 } = body;
    if (!prompt?.trim()) return NextResponse.json({ error: '请输入提示词' }, { status: 400 });

    const resultUrls = await qwenTextToImage({ prompt: prompt.trim(), negativePrompt: negativePrompt?.trim() || undefined, width, height, numOutputs: 4 });

    const image = await createImage({ user_id: session.user.id, prompt: prompt.trim(), negative_prompt: negativePrompt?.trim() || null, type: 'text-to-image', result_urls: resultUrls as string[], width, height });

    return NextResponse.json({ success: true, image: { id: image.id, resultUrls: image.result_urls, prompt: image.prompt } });
  } catch (error) {
    console.error('Text-to-image error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '生成失败' }, { status: 500 });
  }
}
