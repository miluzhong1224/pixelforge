'use client';

import { cn } from '@/lib/utils';

interface ImageGridProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  loading?: boolean;
}

export function ImageGrid({ images, selectedIndex, onSelect, loading }: ImageGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-zinc-800/50 border border-zinc-700/50 animate-pulse"
          >
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 rounded-full border-2 border-zinc-600 border-t-violet-500 animate-spin" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-zinc-800/30 border border-dashed border-zinc-700/50 flex items-center justify-center"
          >
            <span className="text-zinc-600 text-sm">空</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {images.map((url, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            'aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500',
            selectedIndex === i
              ? 'border-violet-500 ring-2 ring-violet-500/50'
              : 'border-transparent hover:border-zinc-600'
          )}
        >
          <img
            src={url}
            alt={`生成结果 ${i + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}
