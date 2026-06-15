'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const RATIOS = [
  { label: '自由', value: 0 },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
];

interface Props {
  imageUrl: string;
  onCrop: (dataUrl: string) => void;
}

export function CropCanvas({ imageUrl, onCrop }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [ratio, setRatio] = useState(0);
  const [crop, setCrop] = useState({ x: 50, y: 50, w: 300, h: 300 });
  const [dragging, setDragging] = useState<'move' | 'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => setImg(i);
    i.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const W = canvasRef.current.width;
    const H = canvasRef.current.height;
    ctx.clearRect(0, 0, W, H);

    // Draw image
    ctx.drawImage(img, 0, 0, W, H);

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, W, H);

    // Clear crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(crop.x, crop.y, crop.w, crop.h);
    ctx.clip();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    ctx.restore();

    // Crop border
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Handles
    const handles = [
      { x: crop.x, y: crop.y },
      { x: crop.x + crop.w, y: crop.y },
      { x: crop.x, y: crop.y + crop.h },
      { x: crop.x + crop.w, y: crop.y + crop.h },
    ];
    handles.forEach((h) => {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
      ctx.fillStyle = '#fff';
      ctx.fillRect(h.x - 2, h.y - 2, 4, 4);
    });
  }, [img, crop]);

  const getPos = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = canvasRef.current!.width / rect.width;
    const sy = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }, []);

  const handleDown = useCallback((e: React.MouseEvent) => {
    const pos = getPos(e);
    const handleSize = 10;
    const near = (px: number, py: number) => Math.abs(pos.x - px) < handleSize && Math.abs(pos.y - py) < handleSize;

    if (near(crop.x, crop.y)) setDragging('tl');
    else if (near(crop.x + crop.w, crop.y)) setDragging('tr');
    else if (near(crop.x, crop.y + crop.h)) setDragging('bl');
    else if (near(crop.x + crop.w, crop.y + crop.h)) setDragging('br');
    else if (pos.x > crop.x && pos.x < crop.x + crop.w && pos.y > crop.y && pos.y < crop.y + crop.h) {
      setDragging('move');
      setDragStart({ x: pos.x - crop.x, y: pos.y - crop.y });
    }
  }, [crop, getPos]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const pos = getPos(e);
    const W = canvasRef.current.width;
    const H = canvasRef.current.height;

    setCrop((prev) => {
      let { x, y, w, h } = prev;
      if (dragging === 'move') {
        x = Math.max(0, Math.min(W - w, pos.x - dragStart.x));
        y = Math.max(0, Math.min(H - h, pos.y - dragStart.y));
      } else {
        if (dragging.includes('r')) w = Math.max(50, Math.min(W - x, pos.x - x));
        if (dragging.includes('l')) { const nx = Math.max(0, Math.min(x + w - 50, pos.x)); w += x - nx; x = nx; }
        if (dragging.includes('b')) h = Math.max(50, Math.min(H - y, pos.y - y));
        if (dragging.includes('t')) { const ny = Math.max(0, Math.min(y + h - 50, pos.y)); h += y - ny; y = ny; }
        if (ratio) {
          h = w / ratio;
          if (h > H - y) { h = H - y; w = h * ratio; }
          if (x + w > W) { w = W - x; h = w / ratio; }
        }
      }
      return { x, y, w, h };
    });
  }, [dragging, dragStart, ratio, getPos]);

  const handleUp = () => setDragging(null);

  const doCrop = () => {
    if (!img) return;
    const c = document.createElement('canvas');
    const scaleX = img.naturalWidth / canvasRef.current!.width;
    const scaleY = img.naturalHeight / canvasRef.current!.height;
    c.width = crop.w * scaleX;
    c.height = crop.h * scaleY;
    c.getContext('2d')?.drawImage(img, crop.x * scaleX, crop.y * scaleY, c.width, c.height, 0, 0, c.width, c.height);
    onCrop(c.toDataURL('image/jpeg', 0.85));
  };

  if (!img) return <div className="aspect-square rounded-xl bg-zinc-800/50 animate-pulse" />;

  return (
    <div className="space-y-4">
      {/* Ratio selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {RATIOS.map((r) => (
          <button key={r.label} onClick={() => setRatio(r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              ratio === r.value ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30' : 'text-zinc-500 border border-transparent hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}>{r.label}</button>
        ))}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={600} height={600}
        className="w-full max-w-[600px] rounded-xl border border-zinc-700/50 cursor-crosshair"
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
      />

      <button onClick={doCrop}
        className="inline-flex items-center h-10 px-5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors">
        裁剪并保存
      </button>
    </div>
  );
}
