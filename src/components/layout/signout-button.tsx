'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={async () => {
        await signOut({ redirect: false });
        // 强制整页刷新到登录页，彻底清除所有 cookie/state
        window.location.href = '/login';
      }}
      className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-colors"
    >
      退出登录
    </button>
  );
}
