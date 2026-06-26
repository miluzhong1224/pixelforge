'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import { MaskCanvas } from '@/components/editor/mask-canvas';
import { toast } from 'sonner';
import { ArrowLeft, Wand2, Languages, Eraser, ZoomIn, Palette, Expand } from 'lucide-react';
import { FormatDownload } from '@/components/generate/format-download';
import { ColorPanel } from '@/components/editor/color-panel';

/** 合成原图 + 红色遮罩 → 带标记的图片，方便 AI 理解要修改的区域 */
function compositeImages(imageUrl: string, maskUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas not supported'));

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const mask = new Image();
      mask.onload = () => {
        // 把遮罩拉伸到和原图同样尺寸（遮罩在编辑器中可能被缩放显示了）
        ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      mask.onerror = reject;
      mask.src = maskUrl;
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

interface ImageData {
  id: string;
  prompt: string;
  type: string;
  source_url: string | null;
  mask_url: string | null;
  result_urls: string[];
  width: number;
  height: number;
}

export default function EditPage({ params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = use(params);
  const router = useRouter();

  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [editResult, setEditResult] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [processingStart, setProcessingStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [toolMode, setToolMode] = useState<'inpaint' | 'color'>('inpaint');

  useEffect(() => {
    const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
    async function loadImage() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${imageId}&limit=1`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data[0]) {
            setImage(data[0]);
            setEditPrompt(data[0].prompt || '');
          }
        }
      } catch (error) {
        console.error('Load image error:', error);
        toast.error('加载图片失败');
      } finally {
        setLoading(false);
      }
    }
    loadImage();
  }, [imageId]);

  const sourceImageUrl = image?.source_url || image?.result_urls?.[0];
  const displayUrl = editResult || (image?.result_urls?.[0]);

  const handleInpaint = useCallback(async () => {
    if (!sourceImageUrl || !maskDataUrl || !editPrompt.trim()) {
      toast.error('请先涂抹遮罩区域并输入修改描述');
      return;
    }

    setGenerating(true);
    try {
      // 合成原图 + 遮罩 → 传给 AI 便于理解修改区域
      const compositeUrl = await compositeImages(sourceImageUrl, maskDataUrl);

      const res = await fetch('/api/generate/inpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt.trim(),
          imageUrl: compositeUrl,
          maskUrl: maskDataUrl,
          width: image?.width || 1024,
          height: image?.height || 1024,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inpainting failed');

      setEditResult(data.image.resultUrls?.[0] ?? data.image.result_urls?.[0]);
      toast.success('修改完成！');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '局部重绘失败');
    } finally {
      setGenerating(false);
    }
  }, [sourceImageUrl, maskDataUrl, editPrompt, image]);

  const handleTranslate = useCallback(async () => {
    if (!editPrompt.trim()) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/prompt/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: editPrompt.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditPrompt(data.optimized);
        toast.success(data.translated ? '已翻译并优化为英文 Prompt' : 'Prompt 已优化');
      } else {
        toast.error(data.error || '翻译失败');
      }
    } catch {
      toast.error('翻译失败，请重试');
    } finally {
      setTranslating(false);
    }
  }, [editPrompt]);

  // 客户端压缩图片为 JPEG data URI
  const compressForApi = useCallback(async (url: string): Promise<string> => {
    if (url.startsWith('data:image/jpeg')) return url; // 已压缩
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        const max = 1024;
        let w = img.width, h = img.height;
        if (w > max || h > max) { const s = Math.min(max/w, max/h); w *= s; h *= s; }
        c.width = w; c.height = h;
        c.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('加载图片失败'));
      img.src = url;
    });
  }, []);

  // 进度计时
  useEffect(() => {
    if (!processing) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - processingStart) / 1000)), 200);
    return () => clearInterval(t);
  }, [processing, processingStart]);

  const handleRemoveBg = useCallback(async () => {
    if (!sourceImageUrl) return;
    setProcessing(true); setProcessingLabel('正在去除背景...'); setProcessingStart(Date.now());
    try {
      const compressed = await compressForApi(sourceImageUrl);
      const res = await fetch('/api/image/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: compressed }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditResult(data.image.resultUrls?.[0] ?? data.image.result_urls?.[0]);
        toast.success('背景已移除！');
      } else {
        toast.error(data.error || '处理失败');
      }
    } catch {
      toast.error('处理失败');
    } finally {
      setProcessing(false);
    }
  }, [sourceImageUrl, compressForApi]);

  const handleUpscale = useCallback(async () => {
    if (!sourceImageUrl) return;
    setProcessing(true); setProcessingLabel('正在放大增强...'); setProcessingStart(Date.now());
    try {
      const compressed = await compressForApi(sourceImageUrl);
      const res = await fetch('/api/image/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: compressed }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditResult(data.image.resultUrls?.[0] ?? data.image.result_urls?.[0]);
        toast.success('已放大 2x！');
      } else {
        toast.error(data.error || '放大失败');
      }
    } catch {
      toast.error('放大失败');
    } finally {
      setProcessing(false);
    }
  }, [sourceImageUrl, compressForApi]);

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#cccccc] border-t-[#0066ff] animate-spin" />
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="text-center py-20">
          <h2 className="text-lg font-semibold text-[#0d0d0d]/80">未找到该图片</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-[#666666] hover:text-[#0d0d0d]/80 hover:bg-[#f5f5f5] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0d0d0d]">局部重绘编辑器</h1>
            <p className="text-sm text-[#666666]">涂抹需要修改的区域，输入修改描述</p>
            {processing && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-3 h-3 rounded-full border-2 border-[#cccccc] border-t-[#0066ff] animate-spin" />
                <span className="text-xs text-[#0066ff]">{processingLabel}</span>
                <span className="text-[10px] text-[#666666]/60">{elapsed}s</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRemoveBg} disabled={processing} loading={processing && processingLabel.includes('背景')}>
            <Eraser size={14} className="mr-1.5" /> 去背景
          </Button>
          <Button variant="outline" size="sm" onClick={handleUpscale} disabled={processing} loading={processing && processingLabel.includes('放大')}>
            <ZoomIn size={14} className="mr-1.5" /> 2x 放大
          </Button>
          <Link href={`/expand/${imageId}`} className="inline-flex items-center h-9 px-3 rounded-lg border border-[#e5e5e5] text-sm text-[#666666] hover:text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors">
            <Expand size={14} className="mr-1.5" />扩图
          </Link>
          {editResult && <FormatDownload url={editResult} />}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: Editor */}
        <div className="flex-1 min-w-0">
          {sourceImageUrl && (
            <MaskCanvas
              imageUrl={displayUrl!}
              onMaskChange={setMaskDataUrl}
              brushSize={30}
            />
          )}
        </div>

        {/* Right: Controls */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          {/* Mode tabs */}
          <div className="flex rounded-lg bg-[#f5f5f5] p-1">
            <button onClick={() => setToolMode('inpaint')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${toolMode === 'inpaint' ? 'bg-[#f5f5f5] text-[#0d0d0d]' : 'text-[#666666] hover:text-[#0d0d0d]/80'}`}>🖌️ 局部重绘</button>
            <button onClick={() => setToolMode('color')} className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${toolMode === 'color' ? 'bg-[#f5f5f5] text-[#0d0d0d]' : 'text-[#666666] hover:text-[#0d0d0d]/80'}`}>🎨 调色</button>
          </div>

          {toolMode === 'inpaint' ? (
            <>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#666666] uppercase tracking-wider">修改提示词</label>
              <button
                onClick={handleTranslate}
                disabled={translating || !editPrompt.trim()}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-[#0066ff] hover:text-[#0066ff] hover:bg-[#0052cc]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Languages size={12} />
                {translating ? '优化中...' : 'AI 优化翻译'}
              </button>
            </div>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="描述遮罩区域应该出现的内容..."
              rows={3}
              className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-2.5 text-sm text-[#0d0d0d] placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:border-[#0066ff] transition-colors"
            />
          </div>

          {maskDataUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#666666] uppercase tracking-wider">
                遮罩预览
              </label>
              <div className="rounded-lg overflow-hidden border border-[#e5e5e5]/50">
                <img src={maskDataUrl} alt="Mask" className="w-full" />
              </div>
            </div>
          )}

          <Button
            onClick={handleInpaint}
            className="w-full"
            size="lg"
            loading={generating}
            disabled={!maskDataUrl}
          >
            <Wand2 size={18} className="mr-2" />
            {generating ? '处理中...' : '开始修改'}
          </Button>

          <div className="p-4 rounded-xl bg-[#f5f5f5]/50 border border-[#e5e5e5]/50">
            <h4 className="text-sm font-medium text-[#0d0d0d]/80 mb-2">使用技巧</h4>
            <ul className="text-xs text-[#666666] space-y-1.5">
              <li>• 用红色涂抹想要修改的区域</li>
              <li>• 使用"擦除"模式修正涂抹错误</li>
              <li>• 修改描述越具体，效果越好</li>
              <li>• 遮罩区域越小，生成效果越精准</li>
            </ul>
          </div>
            </>
          ) : (
            <ColorPanel imageUrl={displayUrl!} />
          )}
        </div>
      </div>
    </div>
  );
}
