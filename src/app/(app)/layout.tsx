import Link from 'next/link';
import { auth } from '@/lib/auth';
import { SignOutButton } from '@/components/layout/signout-button';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-[#e5e5e5] bg-[#fafafa]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#0066ff] flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-[#0d0d0d] hidden sm:block">PixelForge</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/generate"
                className="px-3 py-1.5 rounded-lg text-sm text-[#666666] hover:text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
              >
                创作</Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-sm text-[#666666] hover:text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
              >
                我的</Link>
              <Link
                href="/explore"
                className="px-3 py-1.5 rounded-lg text-sm text-[#666666] hover:text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
              >
                发现</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-[#666666] hidden sm:block">
              {session?.user?.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
