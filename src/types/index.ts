export type ImageType = 'text-to-image' | 'image-to-image' | 'inpaint';

export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerateParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number;
}

export interface TextToImageInput {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
}

export interface ImageToImageInput {
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
}

export interface InpaintInput {
  prompt: string;
  negativePrompt?: string;
  imageUrl: string;
  maskUrl: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
}

export interface ImageRecord {
  id: string;
  userId: string;
  prompt: string;
  negativePrompt?: string | null;
  type: ImageType;
  sourceUrl?: string | null;
  maskUrl?: string | null;
  resultUrls: string[];
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed?: number | null;
  status: ImageStatus;
  createdAt: string;
}

export interface GenerationResponse {
  success: boolean;
  taskId: string;
  status: ImageStatus;
  resultUrls?: string[];
  error?: string;
}
