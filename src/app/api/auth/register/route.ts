import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码为必填项' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: '密码至少需要 8 个字符' }, { status: 400 });
    }

    // 检查邮箱是否已注册
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name: name || email.split('@')[0],
      })
      .select('id, email, name')
      .single();

    if (error || !user) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
