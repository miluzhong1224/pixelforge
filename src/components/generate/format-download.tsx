'use client';

import { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';

const FORMATS = [
  { label: 'PNG', ext: 'png', mime: 'image/png' },
  { label: 'JPEG', ext: 'jpg', mime: 'image/jpeg', quality: 0.9 },
  { label: 'WebP', ext: 'webp', mime: 'image/webp', quality: 0.9 },
];

export function FormatDownload({ url, className }: { url: string; className?: string }) {
  const [fmtIdx, setFmtIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [converting, setConverting] = useState(false);

  const fmt = FORMATS[fmtIdx];

  async function handleDownload() {
    if (fmtIdx === 0) {
      // PNG: direct download
      const a = document.createElement('a');
      a.href = url; a.download = `pixelforge.${fmt.ext}`; a.click();
      return;
    }

    // JPEG/WebP: Canvas convert
    setConverting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = url; });

      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      c.getContext('2d')?.drawImage(img, 0, 0);
      const dataUrl = c.toDataURL(fmt.mime, fmt.quality);

      const a = document.createElement('a');
      a.href = dataUrl; a.download = `pixelforge.${fmt.ext}`; a.click();
    } catch { /* fallback */ } finally { setConverting(false); }
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button onClick={handleDownload} disabled={converting}
        className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-l-lg bg-[#0066ff] text-white text-sm font-medium hover:bg-[#0052cc] transition-colors disabled:opacity-60"
      >
        <Download size={14} />
        {converting ? '转换中...' : `下载 ${fmt.label}`}
      </button>
      <div className="relative">
        <button onClick={() => setOpen(!open)}
          className="flex items-center justify-center h-10 w-8 rounded-r-lg border-l border-[#0066ff]/30 bg-[#0066ff] text-white hover:bg-[#0052cc] transition-colors"
        >
          <ChevronDown size={14} />
        </button>
        {open && (
          <div className="absolute bottom-full right-0 mb-1 bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg shadow-xl overflow-hidden z-30">
            {FORMATS.map((f, i) => (
              <button key={f.label} onClick={() => { setFmtIdx(i); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs whitespace-nowrap transition-colors ${i === fmtIdx ? 'text-[#0066ff] bg-[#0052cc]/10' : 'text-[#666666] hover:text-[#0d0d0d] hover:border-[#e5e5e5]'}`}
              >
                {f.label} {f.quality ? `(${f.quality * 100}%)` : '(无损)'}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
