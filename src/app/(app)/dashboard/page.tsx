'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate, truncate } from '@/lib/utils';
import { toast } from 'sonner';
import { Download, Trash2, Pen, Plus, Copy, Star, Crop, Globe, Expand } from 'lucide-react';

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const SB_HEADERS = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

interface ImageItem {
  id: string; prompt: string; type: string; result_urls: string[];
  width: number; height: number; favorite: boolean; createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userId, setUserId] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!userId) return;
    try {
      let url = `${SUPABASE_URL}/rest/v1/images?select=id,prompt,type,result_urls,width,height,favorite,createdAt&user_id=eq.${userId}&order=createdAt.desc&limit=50`;
      if (filter !== 'all' && filter !== 'favorites') url += `&type=eq.${filter}`;
      const res = await fetch(url, { headers: SB_HEADERS });
      if (res.ok) {
        let data = await res.json();
        if (filter === 'favorites') data = data.filter((i: ImageItem) => i.favorite);
        setImages(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId, filter]);

  // 获取 session userId
  useEffect(() => {
    fetch('/api/auth/session').then(r => r.json()).then(d => {
      if (d?.user?.id) setUserId(d.user.id);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (userId) fetchImages(); }, [fetchImages, userId]);

  async function handleDelete(id: string) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${id}`, { method: 'DELETE', headers: SB_HEADERS });
      setImages(p => p.filter(i => i.id !== id));
      toast.success('已删除');
    } catch { toast.error('删除失败'); }
  }

  async function handlePublish(id: string) {
    try {
      const slug = Math.random().toString(36).slice(2, 14);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${id}`, { method: 'PATCH', headers: SB_HEADERS, body: JSON.stringify({ share_slug: slug }) });
      if (res.ok) toast.success('已公开到社区广场！');
      else { const err = await res.text(); toast.error('发布失败: ' + err.slice(0, 100)); }
    } catch { toast.error('发布失败'); }
  }

  function handleReusePrompt(prompt: string) { router.push(`/generate?prompt=${encodeURIComponent(prompt)}`); }

  async function handleFavorite(id: string, fav: boolean) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${id}`, { method: 'PATCH', headers: SB_HEADERS, body: JSON.stringify({ favorite: !fav }) });
      setImages(p => p.map(i => i.id === id ? { ...i, favorite: !fav } : i));
    } catch { toast.error('操作失败'); }
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-zinc-100">我的作品</h1><p className="text-sm text-zinc-500 mt-1">共 {images.length} 张作品</p></div>
        <Link href="/generate"><Button size="sm"><Plus size={16} className="mr-1.5" />新建创作</Button></Link>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[{ key: 'all', label: '全部' }, { key: 'favorites', label: '⭐ 收藏' }, { key: 'text-to-image', label: '文生图' }, { key: 'image-to-image', label: '图生图' }, { key: 'inpaint', label: '局部重绘' }].map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === key ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-800/50'}`}>{label}</button>
        ))}
      </div>

      {loading || !userId ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-lg font-semibold text-zinc-300 mb-2">还没有作品</h2>
          <p className="text-sm text-zinc-500 mb-6">开始用 AI 创作第一张图像吧</p>
          <Link href="/generate"><Button>开始创作</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all">
              <div className="aspect-square relative overflow-hidden">
                <img src={image.result_urls?.[0]} alt={image.prompt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-900/80 z-10" onClick={(e) => { e.stopPropagation(); handleFavorite(image.id, image.favorite); }}>
                  <Star size={14} className={image.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-500'} />
                </button>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/edit/${image.id}`} className="p-1.5 rounded-lg bg-violet-600/80 text-white hover:bg-violet-500 transition-colors" onClick={(e) => e.stopPropagation()}><Pen size={14} /></Link>
                    <Link href={`/crop/${image.id}`} className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}><Crop size={14} /></Link>
                    <Link href={`/expand/${image.id}`} className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}><Expand size={14} /></Link>
                    <a href={image.result_urls?.[0]} download target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}><Download size={14} /></a>
                    <button className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-emerald-400 transition-colors" onClick={(e) => { e.stopPropagation(); handlePublish(image.id); }} title="公开到社区"><Globe size={14} /></button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button className="px-2 py-1 rounded-md bg-zinc-800/90 text-[10px] text-zinc-300 hover:text-violet-300 transition-colors" onClick={(e) => { e.stopPropagation(); handleReusePrompt(image.prompt); }}><Copy size={10} className="inline mr-1" />复用 Prompt</button>
                    <button className="p-1.5 rounded-lg bg-zinc-800/90 text-zinc-300 hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(image.id); }}><Trash2 size={14} /></button>
                  </div>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-900/80 text-[10px] text-zinc-400">{image.type === 'text-to-image' ? '文生图' : image.type === 'image-to-image' ? '图生图' : '编辑'}</span>
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
