'use client';

import { X, Download, Maximize2, Minimize2, Pen } from 'lucide-react';
import { useState } from 'react';

interface ImageViewerProps {
  url: string | null;
  onClose?: () => void;
  onEdit?: () => void;
}

export function ImageViewer({ url, onClose, onEdit }: ImageViewerProps) {
  const [zoomed, setZoomed] = useState(false);

  if (!url) {
    return (
      <div className="aspect-square rounded-xl bg-[#15181d]/50 border border-dashed border-[#2a2d35]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-sm text-[#8b8b96]">选择一张结果预览</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-white border border-[#2a2d35]/50 group">
      <img
        src={url}
        alt="Preview"
        className={cn(
          'w-full transition-transform duration-300 cursor-zoom-in',
          zoomed ? 'scale-150' : 'scale-100'
        )}
        onClick={() => setZoomed(!zoomed)}
      />

      {/* Top toolbar — zoom, download */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setZoomed(!zoomed)}
          className="p-2 rounded-lg bg-white/90 text-[#8b8b96] hover:text-[#ececee] border border-[#2a2d35]/50 transition-colors"
        >
          {zoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <a
          href={url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/90 text-[#8b8b96] hover:text-[#ececee] border border-[#2a2d35]/50 transition-colors"
        >
          <Download size={16} />
        </a>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/90 text-[#8b8b96] hover:text-[#ececee] border border-[#2a2d35]/50 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Bottom action bar — "二次编辑" CTA */}
      {onEdit && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#ececee]/95 via-[#ececee]/70 to-transparent">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#5b7fff] hover:bg-[#4b6fd9] text-white text-sm font-medium shadow-lg shadow-violet-600/30 transition-all hover:shadow-xl hover:shadow-violet-600/40 active:scale-[0.98]"
          >
            <Pen size={16} />
            二次编辑（局部重绘 / 修改）
          </button>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: (string | undefined | false | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}
