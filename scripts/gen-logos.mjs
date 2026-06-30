// Generate PixelForge logo concepts using SiliconFlow API
// Usage: node scripts/gen-logos.mjs

const SILICONFLOW_BASE = 'https://api.siliconflow.cn';

async function generateLogo(prompt, filename) {
  const res = await fetch(`${SILICONFLOW_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SILICONFLOW_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen-Image',
      prompt,
      negative_prompt: 'text, watermark, signature, low quality, blurry, messy, complex background, busy, cluttered, ugly, distorted',
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) throw new Error('No image URL returned');

  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const fs = await import('fs');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Saved: ${filename}`);
  return filename;
}

// ============ Concept A: Geometric Abstract (Pixel Grid + Forge Flame) ============
const promptA = `Professional brand logo design for "PixelForge", an AI image generation platform for designers.

Concept: Geometric abstract logo mark combining a pixel grid square with a stylized forge flame/spark emerging from it. The mark represents "pixels being forged by AI".

Style: Minimal, precise, tech-meets-craft. Clean geometric shapes with subtle warm-charcoal gray background. A single refined blue-gray accent (#3b6df0 range). Premium tech brand identity.

Composition: The icon mark sits centered above the wordmark "PixelForge" in a clean modern sans-serif. The overall layout is a logo presentation card on a warm off-white (#f5f4f2) background with subtle grain texture. Professional brand identity presentation, like a senior designer's logo concept board. Clean, intentional, not cluttered.`;

// ============ Concept B: Minimal Symbol (P/F Monogram with Negative Space) ============
const promptB = `Professional brand logo design for "PixelForge", an AI image generation platform for designers.

Concept: Minimalist monogram logo mark. A single elegant geometric shape that reads as both "P" and "F" using negative space. The mark uses precise geometric cuts and a subtle optical illusion — the letterforms emerge from a clean square frame. Very refined, architectural.

Style: Ultra-minimal, Swiss design influence, precise geometry. Warm gray (#f5f4f2) background. The icon mark uses a muted blue-gray (#3b6df0) for the primary shape. The wordmark "PixelForge" sits below in a clean geometric sans-serif, tracking wide.

Composition: Centered logo presentation on a warm off-white board. Very sparse, lots of negative space. Professional brand identity presentation board. Clean alignment, premium feeling. No text other than the brand name.`;

// ============ Concept C: Industrial Forge (Anvil/Crystal Lattice) ============
const promptC = `Professional brand logo design for "PixelForge", an AI image generation platform for designers.

Concept: Industrial craft logo mark. A modern geometric interpretation of an anvil shape, built from clean angular polygons that also suggest a crystalline/lattice structure — connecting "forging" with "digital precision". The mark has subtle faceted shading giving it a slight 3D sculptural feel while remaining flat-design.

Style: Industrial design aesthetic, warm and grounded. Dark charcoal gray symbol on warm off-white/cream (#f5f4f2) background. The icon feels solid, crafted, substantial — like a toolmaker's mark. The wordmark "PixelForge" below in a sturdy sans-serif with a slight industrial character.

Composition: Logo presentation on a warm gray board. The mark has weight and presence. Professional brand identity concept board. Clean presentation with subtle construction lines showing the geometry.`;

// ============ Concept D: Tech Gradient (AI Light/Glow) ============
const promptD = `Professional brand logo design for "PixelForge", an AI image generation platform for designers.

Concept: Tech-forward logo mark. An abstract "P" shape constructed from overlapping translucent geometric layers that create a subtle gradient glow effect — like light passing through a prism or digital lens. The mark suggests AI intelligence, light, and precision optics. The gradient transitions from a deeper blue-gray (#3b6df0) to a lighter warm tone.

Style: Modern tech brand, clean and luminous. Warm off-white (#f5f4f2) background. The icon has a subtle glow/light effect but remains professional and restrained — not neon, not gaming. Think Apple product photography lighting, not RGB gamer aesthetic. The wordmark "PixelForge" below in a clean geometric sans-serif.

Composition: Centered logo presentation. Soft, premium lighting. Professional brand identity concept board. Minimal, luminous, intelligent feeling.`;

const concepts = [
  { name: 'concept-a-geometric-abstract', prompt: promptA },
  { name: 'concept-b-minimal-monogram', prompt: promptB },
  { name: 'concept-c-industrial-forge', prompt: promptC },
  { name: 'concept-d-tech-gradient', prompt: promptD },
];

const outDir = 'prototype/logo';
const fs = await import('fs');
fs.mkdirSync(outDir, { recursive: true });

console.log('🎨 Generating PixelForge logo concepts...\n');

for (const { name, prompt } of concepts) {
  console.log(`\n📐 Generating ${name}...`);
  try {
    await generateLogo(prompt, `${outDir}/${name}.png`);
  } catch (err) {
    console.error(`❌ Failed ${name}:`, err.message);
  }
}

console.log('\n✨ Done! Check prototype/logo/ directory.');
