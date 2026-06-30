'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Copy, Sparkles, Search, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CommentModal } from '@/components/community/comment-modal';

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const SBH = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' };

interface ExploreImage {
  id: string; prompt: string; result_urls: string[];
  width: number; height: number;
  like_count?: number; reuse_count?: number;
  createdAt: string; user_id: string; user_name?: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [filtered, setFiltered] = useState<ExploreImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [likedMap, setLikedMap] = useState<Record<string, number>>({});
  const [commentImgId, setCommentImgId] = useState<string | null>(null);

  // 初始化已赞状态（从 localStorage 恢复）
  useEffect(() => {
    const liked: Record<string, number> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pf_liked_')) liked[key.replace('pf_liked_', '')] = 1;
    }
    setLikedMap(liked);
  }, []);

  useEffect(() => {
    const order = sort === 'popular' ? 'reuse_count.desc' : 'createdAt.desc';
    setLoading(true);
    fetch(`${SUPABASE_URL}/rest/v1/images?select=id,prompt,result_urls,width,height,createdAt,user_id,share_slug&share_slug=not.is.null&order=${order}&limit=50`, { headers: SBH })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) { console.error('Explore query failed:', r.status, text); return []; }
        try { return JSON.parse(text); } catch { console.error('Explore parse error:', text.slice(0,200)); return []; }
      })
      .then(async (data) => {
        const imgs = Array.isArray(data) ? data : [];
        const uidSet = new Set(imgs.map((i: { user_id: string }) => i.user_id));
        const nameMap: Record<string, string> = {};
        for (const uid of uidSet) {
          try {
            const uRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${uid}&select=id,name,email&limit=1`, { headers: SBH });
            if (uRes.ok) {
              const users = await uRes.json();
              if (users[0]) nameMap[uid] = users[0].name || users[0].email?.split('@')[0] || '匿名';
            }
          } catch { nameMap[uid] = '匿名'; }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enriched = imgs.map((i: any) => ({ ...i, user_name: nameMap[i.user_id] || '匿名', like_count: i.like_count || 0, reuse_count: i.reuse_count || 0 }));
        setImages(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort]);

  // 客户端搜索过滤
  useEffect(() => {
    if (!search.trim()) { setFiltered(images); return; }
    const q = search.toLowerCase();
    setFiltered(images.filter(i => i.prompt.toLowerCase().includes(q) || (i.user_name || '').toLowerCase().includes(q)));
  }, [search, images]);

  async function handleLike(imageId: string) {
    // 每人每作品只能赞一次
    const likedKey = `pf_liked_${imageId}`;
    if (localStorage.getItem(likedKey)) { toast.error('已经点过赞了'); return; }
    localStorage.setItem(likedKey, '1');
    setLikedMap(prev => ({ ...prev, [imageId]: 1 }));
    setImages(prev => prev.map(i => i.id === imageId ? { ...i, like_count: (i.like_count || 0) + 1 } : i));
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <CommentModal imageId={commentImgId || ''} open={!!commentImgId} onClose={() => setCommentImgId(null)} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d0d0d] flex items-center gap-2"><Sparkles size={22} className="text-[#0066ff]" />发现</h1>
          <p className="text-sm text-[#666666] mt-1">社区作品 · 灵感广场</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索作品..."
              className="h-9 w-48 pl-9 pr-3 rounded-lg bg-[#f5f5f5] border border-[#e5e5e5] text-sm text-[#0d0d0d] placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#0066ff]" />
          </div>
          <div className="flex rounded-lg bg-[#f5f5f5] p-1">
            {[{ key: 'latest', label: '最新' }, { key: 'popular', label: '热门' }].map(({ key, label }) => (
              <button key={key} onClick={() => setSort(key)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sort === key ? 'bg-[#f5f5f5] text-[#0d0d0d]' : 'text-[#666666] hover:text-[#0d0d0d]/80'}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (<div key={i} className="aspect-square rounded-xl bg-[#f5f5f5] animate-pulse" />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#666666]">{search ? '没有匹配的作品' : '暂无公开作品'}</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {filtered.map((img) => (
            <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden border border-[#e5e5e5] bg-white/50 hover:border-[#e5e5e5] transition-all group">
              <div className="relative">
                <img src={img.result_urls?.[0]} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} className="w-full" loading="lazy" />
                {(!img.result_urls?.[0] || !img.result_urls?.[0]?.startsWith('http')) && (
                  <div className="flex items-center justify-center h-48 bg-[#f5f5f5] text-[#666666]/40 text-xs">图片已过期</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-xs text-[#0d0d0d]/80 line-clamp-3 mb-2">{img.prompt}</p>
                  <div className="flex items-center justify-between">
                    <Link href={`/user/${img.user_id}`} onClick={e => e.stopPropagation()} className="text-[11px] text-[#666666] hover:text-[#0066ff] transition-colors">{img.user_name}</Link>
                    <div className="flex items-center gap-1.5">
                      <button onClick={(e) => { e.stopPropagation(); setCommentImgId(img.id); }}
                        className="p-1 rounded-md text-[11px] text-[#666666] hover:text-[#0d0d0d] transition-colors">
                        <MessageCircle size={13} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleLike(img.id); }}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] transition-colors hover:bg-white/10">
                        <Heart size={13} className={likedMap[img.id] ? 'fill-red-400 text-red-400' : 'text-[#666666]'} />
                        <span className="text-[#666666]">{img.like_count || 0}</span>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/generate?prompt=${encodeURIComponent(img.prompt)}`); toast.success('Prompt 已填入生成页'); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#0066ff]/80 text-white text-[11px] hover:bg-[#0052cc] transition-colors">
                        <Copy size={10} />复用
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
