'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import { toast } from 'sonner';
import { Download, Trash2, Pen, Plus, Copy, Eraser, ZoomIn, Star, Share2, Crop } from 'lucide-react';

interface ImageItem {
  id: string;
  prompt: string;
  type: string;
  resultUrls: string[];
  width: number;
  height: number;
  status: string;
  favorite: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('type', filter);
      params.set('limit', '20');

      const res = await fetch(`/api/images?${params}`);
      const data = await res.json();

      if (res.ok) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Fetch images error:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/images/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        toast.success('已删除');
      }
    } catch {
      toast.error('删除失败');
    }
  }

  function handleReusePrompt(prompt: string) {
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  }

  // 客户端压缩图片为 JPEG data URI 再发给 API
  async function compressForApi(url: string): Promise<string> {
    if (url.startsWith('data:image/jpeg')) return url;
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
      img.onerror = () => reject(new Error('加载失败'));
      img.src = url;
    });
  }

  async function handleRemoveBg(id: string, imageUrl: string) {
    setProcessingId(id);
    try {
      const compressed = await compressForApi(imageUrl);
      const res = await fetch('/api/image/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: compressed }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('背景已移除！');
        router.push(`/edit/${data.image.id}`);
      } else {
        toast.error(data.error || '处理失败');
      }
    } catch {
      toast.error('处理失败');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleUpscale(id: string, imageUrl: string) {
    setProcessingId(id);
    try {
      const compressed = await compressForApi(imageUrl);
      const res = await fetch('/api/image/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: compressed }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('已放大 2x！');
        router.push(`/edit/${data.image.id}`);
      } else {
        toast.error(data.error || '放大失败');
      }
    } catch {
      toast.error('放大失败');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleFavorite(id: string, fav: boolean) {
    try {
      await fetch('/api/images/favorite', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: id, favorite: !fav }),
      });
      setImages(prev => prev.map(img => img.id === id ? { ...img, favorite: !fav } : img));
    } catch { toast.error('操作失败'); }
  }

  async function handleShare(id: string) {
    try {
      const res = await fetch('/api/images/share', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        await navigator.clipboard.writeText(data.shareUrl);
        toast.success('分享链接已复制到剪贴板！');
      } else toast.error(data.error || '生成失败');
    } catch { toast.error('操作失败'); }
  }

  // Client-side favorite filter
  const displayed = filter === 'favorites' ? images.filter(i => i.favorite) : images;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">我的作品</h1>
          <p className="text-sm text-zinc-500 mt-1">共 {displayed.length} 张作品</p>
        </div>
        <Link href="/generate">
          <Button size="sm">
            <Plus size={16} className="mr-1.5" /> 新建创作
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all', label: '全部' },
          { key: 'favorites', label: '⭐ 收藏' },
          { key: 'text-to-image', label: '文生图' },
          { key: 'image-to-image', label: '图生图' },
          { key: 'inpaint', label: '局部重绘' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">还没有作品</h2>
          <p className="text-sm text-zinc-500 mb-6">开始用 AI 创作第一张图像吧</p>
          <Link href="/generate">
            <Button>开始创作</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayed.map((image) => (
            <div
              key={image.id}
              className="group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all"
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={image.resultUrls[0]}
                  alt={image.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Favorite star */}
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-900/80 transition-colors"
                  onClick={(e) => { e.stopPropagation(); handleFavorite(image.id, image.favorite); }}
                  title={image.favorite ? '取消收藏' : '收藏'}
                >
                  <Star size={14} className={image.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-500 hover:text-yellow-400'} />
                </button>

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/edit/${image.id}`} className="p-1.5 rounded-lg bg-violet-600/80 text-white hover:bg-violet-500 transition-colors" onClick={(e) => e.stopPropagation()} title="编辑"><Pen size={14} /></Link>
                    <Link href={`/crop/${image.id}`} className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()} title="裁剪"><Crop size={14} /></Link>
                    <button className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors disabled:opacity-50" onClick={(e) => { e.stopPropagation(); handleRemoveBg(image.id, image.resultUrls[0]); }} disabled={processingId === image.id} title="去除背景"><Eraser size={14} /></button>
                    <button className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors disabled:opacity-50" onClick={(e) => { e.stopPropagation(); handleUpscale(image.id, image.resultUrls[0]); }} disabled={processingId === image.id} title="放大 2x"><ZoomIn size={14} /></button>
                    <a href={image.resultUrls[0]} download target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()} title="下载"><Download size={14} /></a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="px-2 py-1 rounded-md bg-zinc-800/90 text-[10px] text-zinc-300 hover:text-violet-300 transition-colors" onClick={(e) => { e.stopPropagation(); handleReusePrompt(image.prompt); }} title="复用 Prompt"><Copy size={10} className="inline mr-1" />复用 Prompt</button>
                    <button className="px-2 py-1 rounded-md bg-zinc-800/90 text-[10px] text-zinc-300 hover:text-emerald-300 transition-colors" onClick={(e) => { e.stopPropagation(); handleShare(image.id); }} title="分享"><Share2 size={10} className="inline mr-1" />分享</button>
                    <button className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }} title="删除"><Trash2 size={14} /></button>
                  </div>
                  {processingId === image.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80">
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-violet-500 animate-spin" />
                    </div>
                  )}
                </div>

                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-900/80 text-[10px] text-zinc-400 uppercase tracking-wider">
                  {image.type === 'text-to-image' ? '文生图' : image.type === 'image-to-image' ? '图生图' : '编辑'}
                </span>
              </div>

              <div className="p-3">
                <p className="text-xs text-zinc-400 mb-1 line-clamp-2">{truncate(image.prompt, 80)}</p>
                <p className="text-[10px] text-zinc-600">{formatDate(image.createdAt)} · {image.width}×{image.height}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
