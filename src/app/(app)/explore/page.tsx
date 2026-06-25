'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ExploreImage {
  id: string;
  prompt: string;
  result_urls: string[];
  width: number;
  height: number;
  like_count?: number;
  reuse_count?: number;
  createdAt: string;
  user_id: string;
  user_name?: string;
}

export default function ExplorePage() {
  const router = useRouter();
  const [images, setImages] = useState<ExploreImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('latest');

  useEffect(() => {
    const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
    const order = sort === 'popular' ? 'reuse_count.desc' : 'createdAt.desc';

    setLoading(true);
    fetch(`${SUPABASE_URL}/rest/v1/images?select=id,prompt,result_urls,width,height,createdAt,user_id,share_slug&share_slug=not.is.null&order=${order}&limit=50`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    })
      .then((r) => r.json())
      .then(async (data) => {
        const imgs = Array.isArray(data) ? data : [];
        // 批量查用户名
        const uidSet = new Set(imgs.map((i: { user_id: string }) => i.user_id));
        const nameMap: Record<string, string> = {};
        for (const uid of uidSet) {
          try {
            const uRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${uid}&select=id,name,email&limit=1`, {
              headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
            });
            if (uRes.ok) {
              const users = await uRes.json();
              if (users[0]) nameMap[uid] = users[0].name || users[0].email?.split('@')[0] || '匿名';
            }
          } catch { nameMap[uid] = '匿名'; }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setImages(imgs.map((i: any) => ({ ...i, user_name: nameMap[i.user_id] || '匿名', reuse_count: i.reuse_count || 0 })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sort]);

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles size={22} className="text-violet-400" /> 发现
          </h1>
          <p className="text-sm text-zinc-500 mt-1">社区作品 · 灵感广场</p>
        </div>
        <div className="flex rounded-lg bg-zinc-800/50 p-1">
          {[
            { key: 'latest', label: '最新' },
            { key: 'popular', label: '热门' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSort(key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sort === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {images.map((img) => (
            <div key={img.id} className="break-inside-avoid rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all group">
              <div className="relative">
                <img src={img.result_urls?.[0]} alt={img.prompt} className="w-full" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-xs text-zinc-300 line-clamp-3 mb-2">{img.prompt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">{img.user_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500"><Heart size={11} />{img.like_count || 0}</span>
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/generate?prompt=${encodeURIComponent(img.prompt)}`); toast.success('Prompt 已填入生成页'); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-600/80 text-white text-[11px] hover:bg-violet-500 transition-colors">
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
