const SILICONFLOW_BASE = 'https://api.siliconflow.cn';
const API_KEY = process.env.SILICONFLOW_API_TOKEN;

async function main() {
  const prompt = `Professional brand logo design for "PixelForge", an AI image generation platform for designers.

Concept: Tech-forward logo mark. An abstract "P" shape constructed from clean, sharp geometric facets like cut crystal or machined metal. The mark suggests precision optics and digital craftsmanship. COOL color palette — steel blue, icy slate, cool gray tones. NO warm colors. The overall feel is cool, crisp, and precise — like a precision instrument in a cold studio.

Key changes from previous version:
- Cooler color temperature: steel blue (#4a6fa5 range), cool slate, no warm undertones
- Minimal glow/light effects — keep it flat and crisp, not luminous
- The mark should feel solid and machined, not ethereal
- Background: cool light gray (#f0f1f3 range), not warm off-white

Style: Modern tech-meets-industrial, cool and restrained. Clean geometric construction. The wordmark "PixelForge" below in a clean geometric sans-serif.

Composition: Centered logo presentation on a cool light gray board. Professional brand identity concept. Clean, crisp, flat design with subtle depth from facet edges, not from glow.`;

  const res = await fetch(`${SILICONFLOW_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image',
      prompt,
      negative_prompt: 'warm colors, orange, yellow, red, warm tones, neon, glow, glowing, bloom, lens flare, light leak, text, watermark, signature, low quality, blurry, messy, complex background, busy, cluttered, ugly, distorted, rainbow',
      n: 4,
      size: '1024x1024',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const fs = await import('fs');

  for (let i = 0; i < (data.data || []).length; i++) {
    const item = data.data[i];
    const url = item.url;
    if (!url) continue;
    const imgRes = await fetch(url);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const filename = `prototype/logo/concept-d-v2-cool-${i + 1}.png`;
    fs.writeFileSync(filename, buffer);
    console.log(`✅ Saved: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
  }
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
