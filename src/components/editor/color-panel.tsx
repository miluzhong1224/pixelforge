'use client';

import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';

interface ColorPanelProps {
  imageUrl: string;
}

interface Adjustments { brightness: number; contrast: number; saturation: number; warmth: number; blur: number; }

const DEFAULTS: Adjustments = { brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0 };

export function ColorPanel({ imageUrl }: ColorPanelProps) {
  const [adj, setAdj] = useState<Adjustments>(DEFAULTS);

  const filters = [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
    `blur(${adj.blur}px)`,
    adj.warmth > 0 ? `sepia(${adj.warmth}%)` : '',
    adj.warmth < 0 ? `hue-rotate(${Math.abs(adj.warmth)}deg)` : '',
  ].filter(Boolean).join(' ');

  const reset = () => setAdj(DEFAULTS);

  const handleDownload = async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!;
      ctx.filter = filters;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      const a = document.createElement('a');
      a.href = c.toDataURL('image/jpeg', 0.9);
      a.download = 'pixelforge_adjusted.jpg';
      a.click();
    };
    img.src = imageUrl;
  };

  const sliders = [
    { key: 'brightness' as const, label: '亮度', min: 0, max: 200, unit: '%' },
    { key: 'contrast' as const, label: '对比度', min: 0, max: 200, unit: '%' },
    { key: 'saturation' as const, label: '饱和度', min: 0, max: 200, unit: '%' },
    { key: 'warmth' as const, label: '色温', min: -50, max: 50, unit: '' },
    { key: 'blur' as const, label: '模糊', min: 0, max: 10, unit: 'px' },
  ];

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="rounded-xl overflow-hidden border border-[#2a2d35]/50 bg-white">
        <img src={imageUrl} alt="Adjust" className="w-full" style={{ filter: filters }} />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {sliders.map(s => (
          <div key={s.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#8b8b96]">{s.label}</label>
              <span className="text-xs text-[#8b8b96]">{adj[s.key]}{s.unit}</span>
            </div>
            <input type="range" min={s.min} max={s.max} value={adj[s.key]}
              onChange={e => setAdj(p => ({ ...p, [s.key]: Number(e.target.value) }))}
              className="w-full h-1.5 rounded-full bg-[#15181d] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#4b6fd9]" />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={reset} className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg border border-[#2a2d35] text-sm text-[#8b8b96] hover:text-[#ececee] hover:bg-[#15181d] transition-colors">
          <RotateCcw size={13} />重置
        </button>
        <button onClick={handleDownload} className="flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg bg-[#5b7fff] text-sm text-white font-medium hover:bg-[#4b6fd9] transition-colors">
          <Download size={13} />导出
        </button>
      </div>
    </div>
  );
}
