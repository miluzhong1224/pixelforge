import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 backdrop-blur-sm bg-zinc-950/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-semibold text-lg text-zinc-100">PixelForge</span>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/generate"
                className="inline-flex items-center h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
              >
                进入工作室 →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            AI 驱动的创意工坊
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 mb-6">
            用 AI 精准创作
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              令人惊艳的图像
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            PixelForge 将文生图、风格迁移和局部重绘融合为一站式工作流，
            专为追求品质与掌控力的设计师打造。
          </p>

          <div className="flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/generate"
                className="inline-flex items-center h-12 px-8 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 shadow-lg shadow-violet-600/20 transition-all"
              >
                进入工作室
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center h-12 px-8 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 shadow-lg shadow-violet-600/20 transition-all"
              >
                免费开始创作
              </Link>
            )}
            <Link
              href={session ? '/dashboard' : '/login'}
              className="inline-flex items-center h-12 px-8 rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-800/50 transition-colors"
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
                className="p-6 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700/50 transition-colors"
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-zinc-200 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 text-center text-sm text-zinc-600">
        <p>© 2026 PixelForge. 为设计师而生。</p>
      </footer>
    </div>
  );
}
