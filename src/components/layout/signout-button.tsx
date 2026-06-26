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
      className="px-3 py-1.5 rounded-lg text-sm text-[#666666] hover:text-[#0d0d0d]/80 hover:bg-[#f5f5f5] transition-colors"
    >
      退出登录
    </button>
  );
}
