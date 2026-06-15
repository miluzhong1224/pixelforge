'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误');
        toast.error('登录失败');
      } else {
        toast.success('欢迎回来！');
        router.push('/generate');
        router.refresh();
      }
    } catch {
      setError('发生未知错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-zinc-100">PixelForge</span>
        </div>
        <CardTitle>欢迎回来</CardTitle>
        <CardDescription>登录后继续创作</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="邮箱"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          type="password"
          label="密码"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          登录
</Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        还没有账号？{' '}
        <Link href="/register" className="text-violet-400 hover:text-violet-300">
          立即注册
        </Link>
      </p>
    </Card>
  );
}
