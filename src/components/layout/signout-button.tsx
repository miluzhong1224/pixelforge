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
      className="px-3 py-1.5 rounded-lg text-sm text-[#8b8b96] hover:text-[#ececee]/80 hover:bg-[#15181d] transition-colors"
    >
      退出登录
    </button>
  );
}
