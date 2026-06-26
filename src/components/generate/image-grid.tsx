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
            className="aspect-square rounded-xl bg-[#15181d] border border-[#2a2d35]/50 animate-pulse"
          >
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 rounded-full border-2 border-[#353945] border-t-[#5b7fff] animate-spin" />
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
            className="aspect-square rounded-xl bg-[#15181d]/50 border border-dashed border-[#2a2d35]/50 flex items-center justify-center"
          >
            <span className="text-[#8b8b96]/60 text-sm">空</span>
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
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b7fff]',
            selectedIndex === i
              ? 'border-[#5b7fff] ring-2 ring-[#5b7fff]/50'
              : 'border-transparent hover:border-[#353945]'
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
