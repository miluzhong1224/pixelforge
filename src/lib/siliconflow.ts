const SILICONFLOW_BASE = 'https://api.siliconflow.cn';
const apiKey = () => process.env.SILICONFLOW_API_TOKEN || '';

interface GenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
}

export async function qwenTextToImage(options: GenerateOptions) {
  const res = await fetch(`${SILICONFLOW_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image',
      prompt: options.prompt,
      negative_prompt: options.negativePrompt || undefined,
      n: options.numOutputs || 4,
      size: `${options.width || 1024}x${options.height || 1024}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SiliconFlow API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const urls: string[] = (data.data || []).map((item: { url?: string; b64_json?: string }) => {
    if (item.url) return item.url;
    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
    return '';
  }).filter(Boolean);
  return urls;
}

export async function qwenImageToImage(options: GenerateOptions & { imageUrl: string }) {
  const imageB64 = await downloadAsBase64(options.imageUrl);

  const res = await fetch(`${SILICONFLOW_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image-Edit',
      prompt: options.prompt,
      negative_prompt: options.negativePrompt || undefined,
      image: imageB64,
      n: options.numOutputs || 1,
      size: `${options.width || 1024}x${options.height || 1024}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`SiliconFlow API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const urls: string[] = (data.data || []).map((item: { url?: string; b64_json?: string }) => {
    if (item.url) return item.url;
    if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
    return '';
  }).filter(Boolean);
  return urls;
}

/** 下载图片（URL 或 data URI）→ base64 data URI */
async function downloadAsBase64(source: string): Promise<string> {
  let buffer: Buffer;
  let mimeType: string;

  if (source.startsWith('data:')) {
    // data URI → 提取 mime 和 base64
    const match = source.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      buffer = Buffer.from(match[2], 'base64');
    } else {
      buffer = Buffer.from(source.split(',')[1], 'base64');
      mimeType = 'image/png';
    }
  } else {
    // URL → fetch
    const response = await fetch(source);
    buffer = Buffer.from(await response.arrayBuffer());
    mimeType = response.headers.get('content-type') || 'image/png';
  }

  const b64 = buffer.toString('base64');
  return `data:${mimeType};base64,${b64}`;
}
