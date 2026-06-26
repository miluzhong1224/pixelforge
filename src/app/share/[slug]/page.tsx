import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const BASE = 'https://pnowmoquisuqomhfsvza.supabase.co';
const KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';
const H = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

async function getImageBySlug(slug: string) {
  const res = await fetch(`${BASE}/rest/v1/images?share_slug=eq.${slug}&limit=1`, { headers: H });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] || null;
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const image = await getImageBySlug(slug);
  if (!image) return { title: '未找到' };
  return { title: `${image.prompt.slice(0, 60)} — PixelForge`, description: 'AI 生成的图像' };
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const image = await getImageBySlug(slug);
  if (!image) notFound();

  return (
    <div className="min-h-screen bg-[#13161a] flex flex-col">
      <header className="border-b border-[#2a2d35] py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#5b7fff] flex items-center justify-center"><span className="text-white font-bold text-sm">P</span></div>
            <span className="font-semibold text-[#ececee] text-sm">PixelForge</span>
          </div>
          <span className="text-xs text-[#8b8b96]">AI 生成 · 公开展示</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-6">
          <div className="rounded-2xl overflow-hidden border border-[#2a2d35]/50 bg-white">
            <img src={image.result_urls?.[0]} alt={image.prompt} className="w-full" />
          </div>
          <div className="space-y-3">
            <div><h2 className="text-sm font-medium text-[#8b8b96] uppercase tracking-wider mb-1">提示词</h2><p className="text-[#ececee] leading-relaxed">{image.prompt}</p></div>
            {image.negative_prompt && <div><h2 className="text-sm font-medium text-[#8b8b96] uppercase tracking-wider mb-1">负向提示词</h2><p className="text-[#8b8b96] text-sm">{image.negative_prompt}</p></div>}
            <div className="flex items-center gap-4 text-xs text-[#8b8b96]/60 pt-2 border-t border-[#2a2d35]"><span>{image.width}×{image.height}</span><span>{image.type === 'text-to-image' ? '文生图' : '图生图'}</span></div>
          </div>
          <a href={image.result_urls?.[0]} download className="inline-flex items-center h-10 px-5 rounded-lg bg-[#5b7fff] text-white text-sm font-medium hover:bg-[#4b6fd9] transition-colors">下载原图</a>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-[#8b8b96]/60">Powered by PixelForge</footer>
    </div>
  );
}
