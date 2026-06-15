import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { findUserByEmail, createUser } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码为必填项' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: '密码至少需要 8 个字符' }, { status: 400 });
    }

    // 检查是否已注册
    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const user = await createUser({
      id,
      email,
      password_hash: passwordHash,
      name: name || email.split('@')[0],
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error:', err);
    const msg = err instanceof Error ? err.message : '服务器内部错误';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
