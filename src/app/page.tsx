import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#e5e5e5] backdrop-blur-sm bg-[#fafafa]/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0066ff] flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-semibold text-lg text-[#0d0d0d]">PixelForge</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/generate"
                className="inline-flex items-center h-10 px-5 rounded-lg bg-[#0066ff] text-white text-sm font-medium hover:bg-[#0052cc] transition-colors"
              >
                进入工作室 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[#666666] hover:text-[#0d0d0d] transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center h-10 px-5 rounded-lg bg-[#0066ff] text-white text-sm font-medium hover:bg-[#0052cc] transition-colors"
                >
                  免费使用
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#e5e5e5] bg-white/50 text-sm text-[#666666] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066ff] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0052cc]" />
            </span>
            AI 驱动的创意工坊
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0d0d0d] mb-6">
            用 AI 精准创作
            <br />
            <span className="bg-gradient-to-r from-[#0052cc] via-[#0066ff] to-[#0066ff] bg-clip-text text-transparent">
              令人惊艳的图像
            </span>
          </h1>

          <p className="text-lg text-[#666666] max-w-xl mx-auto mb-10 leading-relaxed">
            PixelForge 将文生图、风格迁移和局部重绘融合为一站式工作流，
            专为追求品质与掌控力的设计师打造。
          </p>

          <div className="flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/generate"
                className="inline-flex items-center h-12 px-8 rounded-xl bg-[#0066ff] text-white font-medium hover:bg-[#0052cc] shadow-lg shadow-[#0066ff]/20 transition-all"
              >
                进入工作室
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center h-12 px-8 rounded-xl bg-[#0066ff] text-white font-medium hover:bg-[#0052cc] shadow-lg shadow-[#0066ff]/20 transition-all"
              >
                免费开始创作
              </Link>
            )}
            <Link
              href={session ? '/dashboard' : '/login'}
              className="inline-flex items-center h-12 px-8 rounded-xl border border-[#e5e5e5] text-[#0d0d0d]/80 font-medium hover:bg-[#f5f5f5] transition-colors"
            >
              浏览作品库
            </Link>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
            {[
              {
                icon: '🎨',
                title: '文生图',
                desc: '用自然语言描述画面，数秒内生成 4 张高质量变体。',
              },
              {
                icon: '✏️',
                title: '智能局部重绘',
                desc: '涂抹任意区域，AI 精准重绘你想要的内容。',
              },
              {
                icon: '🔄',
                title: '风格迁移',
                desc: '上传参考图，生成保留风格的全新变体作品。',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-[#e5e5e5] bg-white/30 hover:border-[#e5e5e5]/50 transition-colors"
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-[#0d0d0d] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] py-8 text-center text-sm text-[#666666]/60">
        <p>© 2026 PixelForge. 为设计师而生。</p>
      </footer>
    </div>
  );
}
