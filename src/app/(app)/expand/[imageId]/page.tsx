'use client';

import { useState, useEffect, useCallback, use, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Expand, Download } from 'lucide-react';

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const SBH = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

export default function ExpandPage({ params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = use(params);
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState(1024);
  const [origHeight, setOrigHeight] = useState(1024);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandRatio, setExpandRatio] = useState(0.2);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${imageId}&limit=1`, { headers: SBH })
      .then(r => r.json()).then(d => {
        if (d[0]) {
          setSourceUrl(d[0].result_urls[0]);
          setOrigWidth(d[0].width || 1024);
          setOrigHeight(d[0].height || 1024);
        }
        setLoading(false);
      });
  }, [imageId]);

  const handleExpand = useCallback(async () => {
    if (!sourceUrl) return;
    setGenerating(true);
    try {
      // 用代理 URL 加载带 CORS 的图片用于 Canvas
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(sourceUrl!)}`;
      let img: HTMLImageElement;
      try {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = () => reject(new Error('代理加载失败'));
          i.src = proxyUrl;
        });
      } catch (e: any) {
        toast.error('图片加载失败: ' + (e?.message || '未知错误'));
        setGenerating(false); return;
      }

      // 限制画布最大 1536px
      const MAX = 1536;
      const srcW = img.naturalWidth, srcH = img.naturalHeight;
      const scale = Math.min(1, MAX / (srcW * (1 + expandRatio)), MAX / (srcH * (1 + expandRatio)));
      const iw = Math.floor(srcW * scale), ih = Math.floor(srcH * scale);

      const ox = Math.floor(iw * expandRatio / 2);
      const oy = Math.floor(ih * expandRatio / 2);
      const c = document.createElement('canvas');
      c.width = iw + ox * 2;
      c.height = ih + oy * 2;
      const ctx = c.getContext('2d')!;

      // 边缘像素镜像拉伸填充
      ctx.drawImage(img, 0, 0, iw, 1, ox, 0, iw, oy);
      ctx.drawImage(img, 0, ih - 1, iw, 1, ox, c.height - oy, iw, oy);
      ctx.drawImage(img, 0, 0, 1, ih, 0, oy, ox, ih);
      ctx.drawImage(img, iw - 1, 0, 1, ih, c.width - ox, oy, ox, ih);
      // 中心画缩放后的图
      ctx.drawImage(img, ox, oy, iw, ih);

      const compositeUrl = c.toDataURL('image/jpeg', 0.5);

      // 走已验证的通路：/api/generate/image-to-image
      const res = await fetch('/api/generate/image-to-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Outpaint: extend the canvas outward in all directions. Fill the new areas naturally, matching the exact style, colors, lighting and composition of the original. The center image must stay unchanged. Seamless blend, no visible borders, professional photography quality.', imageUrl: compositeUrl, width: c.width, height: c.height }),
        signal: AbortSignal.timeout(120000),
      });
      const data = await res.json();
      if (!res.ok) { toast.error('扩图失败: ' + (data.error || res.status)); return; }
      const newUrl = data.image?.resultUrls?.[0] || data.image?.result_urls?.[0];
      if (newUrl) {
        setSourceUrl(newUrl);
        setExpandRatio(0.1);
        setOrigWidth(c.width);
        setOrigHeight(c.height);
        toast.success('扩图完成！可继续调整比例再次扩展');
      } else {
        toast.error('扩图返回异常，请重试');
      }
    } catch (e: any) {
      if (e?.name === 'TimeoutError') toast.error('扩图超时（60秒），请减小比例重试');
      else toast.error('扩图失败: ' + (e?.message || '网络错误'));
    }
    finally { setGenerating(false); }
  }, [sourceUrl, expandRatio]);

  const displayUrl = sourceUrl;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#353945] border-t-[#5b7fff] animate-spin" /></div>;
  if (!sourceUrl) return <div className="text-center py-20"><h2 className="text-lg font-semibold text-[#ececee]/80">未找到该图片</h2></div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-[#8b8b96] hover:text-[#ececee]/80 hover:bg-[#15181d]"><ArrowLeft size={20} /></button>
          <div><h1 className="text-xl font-bold text-[#ececee]">智能扩图</h1><p className="text-sm text-[#8b8b96]">向外扩展图片，AI 自动填充边缘 · 支持多次扩图</p></div>
        </div>
        <div className="flex items-center gap-2">
          <a href={displayUrl!} download className="inline-flex items-center h-10 px-5 rounded-lg bg-[#5b7fff] text-white text-sm font-medium hover:bg-[#4b6fd9]"><Download size={14} className="mr-1.5" />下载</a>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-[#2a2d35]/50 p-8">
          <div className="text-center text-[10px] text-[#8b8b96]/60 mb-2">紫色区域为 AI 扩展填充范围</div>
          <div className="relative inline-flex items-center justify-center" style={{ padding: `${expandRatio * 50}px` }}>
            <div className="absolute inset-0 rounded-xl bg-[#4b6fd9]/10 border-2 border-dashed border-[#5b7fff]/60" />
            <img ref={imgRef} src={displayUrl!} alt="Expand" className="max-w-full max-h-[45vh] rounded-lg relative z-10 ring-2 ring-sand-dark" />
          </div>
          <div className="text-center text-xs text-[#8b8b96] mt-2">
            {origWidth}×{origHeight} → 扩展后 ~{Math.round(origWidth * (1 + expandRatio))}×{Math.round(origHeight * (1 + expandRatio))}
          </div>
        </div>

        <div className="w-72 shrink-0 space-y-4">
          <div className="p-4 rounded-xl bg-[#15181d]/50 border border-[#2a2d35]/50 space-y-3">
            <label className="text-sm font-medium text-[#ececee]/80">扩展比例</label>
            <input type="range" min={0.05} max={0.5} step={0.05} value={expandRatio}
              onChange={e => setExpandRatio(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-[#15181d] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4b6fd9]" />
            <div className="flex justify-between text-xs text-[#8b8b96]"><span>5%</span><span>{Math.round(expandRatio * 100)}%</span><span>50%</span></div>
          </div>
          <Button onClick={handleExpand} className="w-full" size="lg" loading={generating}>
            <Expand size={16} className="mr-2" />{generating ? '扩展中...' : `向外扩展 ${Math.round(expandRatio * 100)}%`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 检测 Canvas 是否被污染 */
function isTainted(img: HTMLImageElement): boolean {
  try { const c = document.createElement('canvas'); c.width = 1; c.height = 1; c.getContext('2d')!.drawImage(img, 0, 0); c.toDataURL(); return false; }
  catch { return true; }
}

/** 加载图片并保证 Canvas 可用（CORS 直连 → 代理 → blob 三级降级） */
async function loadImage(url: string): Promise<HTMLImageElement> {
  // Level 1: 直接 CORS 加载
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } catch { /* continue */ }

  // Level 2: 通过 Vercel 代理（绕过浏览器 CORS）
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = proxyUrl;
    });
  } catch { /* continue */ }

  // Level 3: fetch blob（需要服务端支持）
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('图片加载失败: ' + res.status);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(blob);
  });
}
