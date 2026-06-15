import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const image = await db.image.findUnique({ where: { shareSlug: slug } });
  if (!image) return { title: '未找到' };
  return { title: `${image.prompt.slice(0, 60)} — PixelForge`, description: 'AI 生成的图像' };
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const image = await db.image.findUnique({ where: { shareSlug: slug } });
  if (!image) notFound();

  const urls: string[] = image.resultUrls;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-zinc-800/50 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-zinc-100 text-sm">PixelForge</span>
          </div>
          <span className="text-xs text-zinc-500">AI 生成 · 公开展示</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-zinc-700/50 bg-zinc-900">
            <img src={urls[0]} alt={image.prompt} className="w-full" />
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">提示词</h2>
              <p className="text-zinc-200 leading-relaxed">{image.prompt}</p>
            </div>
            {image.negativePrompt && (
              <div>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-1">负向提示词</h2>
                <p className="text-zinc-500 text-sm">{image.negativePrompt}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-zinc-600 pt-2 border-t border-zinc-800/50">
              <span>{image.width}×{image.height}</span>
              <span>{image.type === 'text-to-image' ? '文生图' : '图生图'}</span>
            </div>
          </div>

          {/* Download */}
          <a
            href={urls[0]}
            download
            className="inline-flex items-center h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
          >
            下载原图
          </a>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-600">
        Powered by PixelForge
      </footer>
    </div>
  );
}
