import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PixelForge — AI 图像创作工坊',
  description: '面向设计师的 AI 图像生成与编辑平台，文生图、图生图、局部重绘一站式工作流。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans bg-[#fafafa] text-[#0d0d0d] antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
