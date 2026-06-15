import { NextResponse } from 'next/server';

const SILICONFLOW_BASE = 'https://api.siliconflow.cn';
const API_KEY = () => process.env.SILICONFLOW_API_TOKEN || '';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: '请输入提示词' }, { status: 400 });
    }

    // 检测是否已是英文
    const isEnglish = /^[a-zA-Z\s.,!?;:'"()\-–—\[\]{}$@#%^&*+=<>|\/~`0-9]+$/.test(prompt.trim());

    let optimized = prompt.trim();
    let negativePrompt = '';

    if (!isEnglish) {
      const res = await fetch(`${SILICONFLOW_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            {
              role: 'system',
              content:
                '你是一个 AI 图像生成 Prompt 优化专家。将用户的中文描述优化为英文 Stable Diffusion 风格的 prompt。规则：1) 直接输出优化后的英文 prompt，不要解释 2) 添加画质关键词(high quality, detailed, sharp focus) 3) 保持原意的风格和内容 4) 用逗号分隔关键词 5) 控制在 200 词以内',
            },
            {
              role: 'user',
              content: `优化这个 prompt 为英文: ${prompt.trim()}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        optimized = data.choices?.[0]?.message?.content?.trim() || prompt.trim();
      }

      // 生成负向提示词
      const negRes = await fetch(`${SILICONFLOW_BASE}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            {
              role: 'system',
              content:
                '根据用户的 prompt，输出通用的负向提示词（英文），用逗号分隔。不要解释，直接输出。',
            },
            {
              role: 'user',
              content: `为这个 prompt 生成负向词: ${optimized}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 100,
        }),
      });

      if (negRes.ok) {
        const negData = await negRes.json();
        negativePrompt = negData.choices?.[0]?.message?.content?.trim() || '';
      }
    }

    return NextResponse.json({
      original: prompt.trim(),
      optimized,
      negativePrompt,
      translated: !isEnglish,
    });
  } catch (error) {
    console.error('Translate prompt error:', error);
    return NextResponse.json({ error: '翻译失败，请重试' }, { status: 500 });
  }
}
