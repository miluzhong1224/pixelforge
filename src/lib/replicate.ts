import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Use FLUX Schnell for fast text-to-image
const TEXT_TO_IMAGE_MODEL = 'black-forest-labs/flux-schnell' as const;

// Use SDXL for image-to-image
const IMAGE_TO_IMAGE_MODEL = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b' as const;

// Use Stability SD Inpainting for inpainting
const INPAINT_MODEL = 'stability-ai/stable-diffusion-inpainting' as const;

interface GenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
}

export async function textToImage(options: GenerateOptions) {
  const input = {
    prompt: options.prompt,
    negative_prompt: options.negativePrompt,
    width: options.width || 1024,
    height: options.height || 1024,
    num_outputs: options.numOutputs || 4,
    num_inference_steps: 4, // FLUX Schnell only needs 1-4 steps
  };

  const output = await replicate.run(TEXT_TO_IMAGE_MODEL as any, { input });
  return output as string[];
}

export async function imageToImage(options: GenerateOptions & { imageUrl: string }) {
  // Convert image URL to base64 data URI
  const imageData = await urlToDataUri(options.imageUrl);

  const input = {
    prompt: options.prompt,
    negative_prompt: options.negativePrompt,
    image: imageData,
    width: options.width || 1024,
    height: options.height || 1024,
    num_outputs: options.numOutputs || 4,
    num_inference_steps: 30,
    guidance_scale: 7.5,
  };

  const output = await replicate.run(IMAGE_TO_IMAGE_MODEL, { input });
  return output as string[];
}

export async function inpaint(options: GenerateOptions & { imageUrl: string; maskUrl: string }) {
  const imageData = await urlToDataUri(options.imageUrl);
  const maskData = await urlToDataUri(options.maskUrl);

  const input = {
    prompt: options.prompt,
    negative_prompt: options.negativePrompt,
    image: imageData,
    mask: maskData,
    width: options.width || 1024,
    height: options.height || 1024,
    num_outputs: options.numOutputs || 1,
    num_inference_steps: 30,
  };

  const output = await replicate.run(INPAINT_MODEL, { input });
  return output as string[];
}

async function urlToDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/png';
  return `data:${mimeType};base64,${base64}`;
}
