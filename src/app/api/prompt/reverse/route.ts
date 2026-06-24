import { NextResponse } from 'next/server';

const SILICONFLOW_BASE = 'https://api.siliconflow.cn';
const API_KEY = () => process.env.SILICONFLOW_API_TOKEN || '';

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: '请提供图片' }, { status: 400 });

    // 把图片转成 OpenAI 兼容的 vision 格式
    const imageContent = imageUrl.startsWith('data:')
      ? imageUrl
      : await urlToDataUri(imageUrl);

    const res = await fetch(`${SILICONFLOW_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-Omni-30B-A3B-Captioner',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageContent },
              },
              {
                type: 'text',
                text: '请用中文详细描述这张图片的内容、风格、色彩、构图、光线和氛围。输出一段可以直接用于 AI 图像生成的提示词（Prompt）。只输出提示词，不要其他内容。',
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Vision API error:', res.status, err);
      return NextResponse.json({ error: `AI 分析失败(${res.status}): ${err.slice(0, 200)}` }, { status: 500 });
    }

    const data = await res.json();
    const prompt = data.choices?.[0]?.message?.content?.trim() || '';

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Reverse prompt error:', error);
    return NextResponse.json({ error: '分析失败，请重试' }, { status: 500 });
  }
}

async function urlToDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/png';
  return `data:${mimeType};base64,${base64}`;
}
