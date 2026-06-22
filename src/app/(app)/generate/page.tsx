'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PromptInput } from '@/components/generate/prompt-input';
import { ImageGrid } from '@/components/generate/image-grid';
import { ImageViewer } from '@/components/generate/image-viewer';
import { GenerateProgress } from '@/components/generate/generate-progress';
import { TemplateSelector } from '@/components/template/template-selector';
import type { PromptTemplate } from '@/data/templates';
import { toast } from 'sonner';
import { Onboarding } from '@/components/guide/onboarding';
import { Wand2, Download, Pen, Upload, Languages, BookOpen } from 'lucide-react';

type GenerationMode = 'text-to-image' | 'image-to-image';

const DIMENSIONS = [
  { label: '正方形 1:1', width: 1024, height: 1024 },
  { label: '小红书 3:4', width: 1080, height: 1440 },
  { label: '朋友圈 1:1', width: 1080, height: 1080 },
  { label: '竖版 3:4', width: 768, height: 1024 },
  { label: '公众号封面', width: 900, height: 383 },
  { label: '横版 4:3', width: 1280, height: 960 },
  { label: '电商主图 1:1', width: 800, height: 800 },
  { label: '宽屏 16:9', width: 1280, height: 720 },
];

export default function GeneratePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<GenerationMode>('text-to-image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');

  // 复用 Prompt（从 Dashboard 跳转过来）
  useEffect(() => {
    const reusePrompt = searchParams.get('prompt');
    if (reusePrompt) {
      setPrompt(decodeURIComponent(reusePrompt));
      toast.success('已加载历史 Prompt');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [steps, setSteps] = useState(30);
  const [cfgScale, setCfgScale] = useState(7.5);
  const [loading, setLoading] = useState(false);
  const [genStartTime, setGenStartTime] = useState<number | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [resultUrls, setResultUrls] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [lastImageId, setLastImageId] = useState<string | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dim = DIMENSIONS[dimensionIndex];

  const doGenerate = useCallback(async (currentPrompt: string, currentNegative: string) => {
    if (!currentPrompt.trim()) {
      toast.error('请输入提示词');
      return;
    }
    if (mode === 'image-to-image' && !sourceImage) {
      toast.error('请上传参考图片');
      return;
    }

    setLoading(true);
    setGenStartTime(Date.now());
    setGenError(null);
    setResultUrls([]);

    try {
      const endpoint = mode === 'text-to-image'
        ? '/api/generate/text-to-image'
        : '/api/generate/image-to-image';

      const body: Record<string, unknown> = {
        prompt: currentPrompt.trim(),
        negativePrompt: currentNegative.trim() || undefined,
        width: dim.width,
        height: dim.height,
        steps,
        cfgScale,
      };
      if (mode === 'image-to-image' && sourceImage) {
        body.imageUrl = sourceImage;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成失败');

      setResultUrls(data.image.resultUrls);
      setSelectedIndex(0);
      setLastImageId(data.image.id);
      toast.success('生成完成！');
    } catch (error) {
      const msg = error instanceof Error
        ? (error.name === 'AbortError' ? '生成超时（60秒），请重试' : error.message)
        : '生成失败';
      setGenError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [mode, sourceImage, dim, steps, cfgScale]);

  const handleGenerate = useCallback(() => {
    doGenerate(prompt, negativePrompt);
  }, [doGenerate, prompt, negativePrompt]);

  // Prompt 翻译增强
  const handleTranslate = useCallback(async () => {
    if (!prompt.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/prompt/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setPrompt(data.optimized);
        if (data.negativePrompt) setNegativePrompt(data.negativePrompt);
        toast.success(data.translated ? '已翻译并优化为英文 Prompt' : 'Prompt 已优化');
      } else {
        toast.error(data.error || '翻译失败');
      }
    } catch {
      toast.error('翻译失败，请重试');
    } finally {
      setTranslating(false);
    }
  }, [prompt]);

  // 选择模板
  const handleSelectTemplate = useCallback((t: PromptTemplate) => {
    setPrompt(t.prompt);
    if (t.negativePrompt) setNegativePrompt(t.negativePrompt);
    toast.success(`已加载模板：${t.title}`);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1024;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setSourceImage(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Onboarding />
      <TemplateSelector open={templateOpen} onClose={() => setTemplateOpen(false)} onSelect={handleSelectTemplate} />

      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Left: Parameters Panel */}
        <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-zinc-800/50 p-1">
            {([
              { key: 'text-to-image' as const, label: '文生图', icon: Wand2 },
              { key: 'image-to-image' as const, label: '图生图', icon: Upload },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setMode(key); setResultUrls([]); setSelectedIndex(0); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                  mode === key ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Source image upload */}
          {mode === 'image-to-image' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">参考图片</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/30 hover:border-violet-500/50 hover:bg-zinc-800/50 transition-colors flex items-center justify-center overflow-hidden"
              >
                {sourceImage ? (
                  <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-zinc-600 mb-1" />
                    <span className="text-xs text-zinc-500">上传图片</span>
                  </div>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}

          {/* Prompt + 操作按钮 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">提示词</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleTranslate}
                  disabled={translating || !prompt.trim()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Languages size={12} />
                  {translating ? '优化中...' : 'AI 优化翻译'}
                </button>
              </div>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'text-to-image' ? '电影感的日落山景，金色光线，写实风格...' : '将这张图片转换为水彩画风格...'}
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors"
            />

            {/* 模板按钮 — 独立一行，更醒目 */}
            <button
              onClick={() => setTemplateOpen(true)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-zinc-600 bg-zinc-800/30 text-sm text-zinc-400 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5 transition-all"
            >
              <BookOpen size={15} />
              浏览 Prompt 模板库（12 套风格预设）
            </button>
          </div>

          {/* Negative Prompt */}
          <PromptInput
            value={negativePrompt}
            onChange={setNegativePrompt}
            label="负向提示词"
            placeholder="模糊、低质量、扭曲、丑陋、水印..."
            maxLength={300}
          />

          {/* Dimensions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">尺寸预设</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {DIMENSIONS.map((d, i) => (
                <button
                  key={d.label}
                  onClick={() => setDimensionIndex(i)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-left ${
                    dimensionIndex === i
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/50'
                      : 'bg-zinc-800/30 text-zinc-500 border border-transparent hover:border-zinc-700'
                  }`}
                >
                  <div className="text-[11px]">{d.label}</div>
                  <div className="text-[10px] opacity-60">{d.width}×{d.height}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Progress */}
          <GenerateProgress loading={loading} startTime={genStartTime} error={genError} onRetry={handleGenerate} />

          {/* Generate Button */}
          <Button onClick={handleGenerate} className="w-full" size="lg" loading={loading}>
            <Wand2 size={18} className="mr-2" />
            {loading ? '生成中...' : '开始生成'}
          </Button>

          {lastImageId && resultUrls.length > 0 && (
            <div className="space-y-2">
              <Button className="w-full" size="md" onClick={() => router.push(`/edit/${lastImageId}`)}>
                <Pen size={16} className="mr-2" /> 二次编辑（局部重绘）
              </Button>
              <a href={resultUrls[selectedIndex]} download target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  <Download size={14} className="mr-1.5" /> 下载图片
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Right: Results Area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <ImageGrid images={resultUrls} selectedIndex={selectedIndex} onSelect={setSelectedIndex} loading={loading} />
          <div className="flex-1 min-h-0">
            <ImageViewer
              url={resultUrls[selectedIndex] || null}
              onEdit={lastImageId ? () => router.push(`/edit/${lastImageId}`) : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
