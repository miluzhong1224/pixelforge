'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '注册失败');
        toast.error(data.error || '注册失败');
        return;
      }

      // Auto login after successful registration
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/login');
      } else {
        toast.success('账号创建成功！');
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
          <div className="h-10 w-10 rounded-xl bg-[#5b7fff] flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-[#ececee]">PixelForge</span>
        </div>
        <CardTitle>创建账号</CardTitle>
        <CardDescription>开启你的 AI 设计之旅</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          type="text"
          label="昵称（选填）"
          placeholder="你的名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          placeholder="至少 8 个字符"
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
          注册
</Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#8b8b96]">
        已有账号？{' '}
        <Link href="/login" className="text-[#5b7fff] hover:text-[#5b7fff]">
          立即登录
        </Link>
      </p>
    </Card>
  );
}
