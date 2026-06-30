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
  // 将临时 URL 转为 base64 data URI 永久存储
  const urls = await Promise.all(
    (data.data || []).map(async (item: { url?: string; b64_json?: string }) => {
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      if (item.url) {
        try {
          return await downloadAsBase64(item.url);
        } catch {
          // 如果下载失败，保留原始 URL 作为后备
          return item.url;
        }
      }
      return '';
    })
  );
  return urls.filter(Boolean);
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
      model: 'Qwen/Qwen-Image-Edit-2509',
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
  // 将临时 URL 转为 base64 data URI 永久存储
  const urls = await Promise.all(
    (data.data || []).map(async (item: { url?: string; b64_json?: string }) => {
      if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
      if (item.url) {
        try {
          return await downloadAsBase64(item.url);
        } catch {
          return item.url;
        }
      }
      return '';
    })
  );
  return urls.filter(Boolean);
}

/** 下载图片（URL 或 data URI）→ 压缩后 base64 data URI（JPEG, 节省存储空间） */
async function downloadAsBase64(source: string): Promise<string> {
  // 如果已经是 data URI，直接返回（避免反复编解码）
  if (source.startsWith('data:')) return source;

  // URL → fetch → 压缩为 JPEG
  const response = await fetch(source);
  const arrayBuffer = await response.arrayBuffer();

  // 服务端压缩：用最小化方案，直接返回原始 PNG 的 base64
  // Node.js 环境下无法用 Canvas 压缩，保留原始格式
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get('content-type') || 'image/png';
  const b64 = buffer.toString('base64');
  return `data:${mimeType};base64,${b64}`;
}
