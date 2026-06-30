'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GenerateProgressProps {
  loading: boolean;
  startTime: number | null;
  onRetry?: () => void;
  error?: string | null;
}

export function GenerateProgress({ loading, startTime, onRetry, error }: GenerateProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading || !startTime) {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(timer);
  }, [loading, startTime]);

  if (error) {
    return (
      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <p className="text-sm text-red-400 mb-2">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-300 hover:text-red-200 underline underline-offset-2"
          >
            点击重试
          </button>
        )}
      </div>
    );
  }

  if (!loading) return null;

  return (
    <div className="space-y-2 p-3 rounded-xl bg-[#f5f5f5]/50 border border-[#e5e5e5]/50">
      <div className="flex items-center gap-2">
        <Loader2 size={14} className="animate-spin text-[#0066ff]" />
        <span className="text-sm text-[#0d0d0d]/80">AI 正在创作中...</span>
        <span className="text-xs text-[#666666]/60 ml-auto">{elapsed}s</span>
      </div>
      {/* Progress bar */}
      <div className="h-1 rounded-full border-[#e5e5e5] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse transition-all duration-500"
          style={{ width: `${Math.min(elapsed * 3, 90)}%` }}
        />
      </div>
      {elapsed > 15 && (
        <p className="text-[10px] text-[#666666]/60">生成时间较长，请耐心等待...</p>
      )}
    </div>
  );
}
