'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Copy, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const SBH = { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` };

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: userId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 查用户信息
    fetch(`${SUPABASE_URL}/rest/v1/users?select=name,email&id=eq.${userId}&limit=1`, { headers: SBH })
      .then(r => r.json()).then(d => { if (d[0]) setUser(d[0]); });

    // 查公开作品
    fetch(`${SUPABASE_URL}/rest/v1/images?select=id,prompt,result_urls,width,height,createdAt,share_slug&user_id=eq.${userId}&share_slug=not.is.null&order=createdAt.desc&limit=50`, { headers: SBH })
      .then(r => r.json()).then(d => {
        setImages(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, [userId]);

  const displayName = user?.name || user?.email?.split('@')[0] || '用户';

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <button onClick={() => router.back()} className="p-2 rounded-lg text-[#666666] hover:text-[#0d0d0d]/80 hover:bg-[#f5f5f5] mb-6"><ArrowLeft size={20} /></button>

      {/* 用户信息头部 */}
      <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-white/50 border border-[#e5e5e5]">
        <div className="h-16 w-16 rounded-full bg-[#0066ff] flex items-center justify-center text-white text-2xl font-bold">{displayName[0]?.toUpperCase()}</div>
        <div>
          <h1 className="text-xl font-bold text-[#0d0d0d]">{displayName}</h1>
          <p className="text-sm text-[#666666] mt-1">{images.length} 张公开作品</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="aspect-square rounded-xl bg-[#f5f5f5] animate-pulse" />))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon size={40} className="mx-auto text-[#666666]/40 mb-3" />
          <p className="text-[#666666]">暂无公开作品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div key={img.id} className="rounded-xl overflow-hidden border border-[#e5e5e5] bg-white/50 hover:border-[#e5e5e5] transition-all group">
              <div className="relative aspect-square">
                <img src={img.result_urls?.[0]} alt={img.prompt} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-[#fafafa]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/generate?prompt=${encodeURIComponent(img.prompt)}`); toast.success('Prompt 已填入'); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0066ff]/80 text-white text-xs hover:bg-[#0052cc]"><Copy size={12} />复用</button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-[11px] text-[#666666] line-clamp-1">{img.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
