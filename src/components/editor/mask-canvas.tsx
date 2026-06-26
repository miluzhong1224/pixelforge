'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface MaskCanvasProps {
  imageUrl: string;
  onMaskChange: (maskDataUrl: string | null) => void;
  brushSize?: number;
}

export function MaskCanvas({ imageUrl, onMaskChange, brushSize = 30 }: MaskCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [loaded, setLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const maskCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setLoaded(true);

      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      // Resize both canvases to fit the container
      const maxWidth = canvas.parentElement?.clientWidth || 768;
      const maxHeight = 600;
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }

      // Init mask canvas
      const mCtx = maskCanvas.getContext('2d');
      if (mCtx) {
        mCtx.fillStyle = 'rgba(0,0,0,0)';
        mCtx.fillRect(0, 0, width, height);
        maskCtxRef.current = mCtx;
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = maskCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const drawMask = useCallback(
    (x: number, y: number) => {
      const ctx = maskCtxRef.current;
      if (!ctx) return;

      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      if (mode === 'draw') {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
      }
      ctx.fill();

      // Reset composite mode
      if (mode === 'erase') {
        ctx.globalCompositeOperation = 'source-over';
      }

      // Export mask
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        onMaskChange(maskCanvas.toDataURL('image/png'));
      }
    },
    [brushSize, mode, onMaskChange]
  );

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      const pos = getPos(e);
      drawMask(pos.x, pos.y);
    },
    [getPos, drawMask]
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      drawMask(pos.x, pos.y);
    },
    [isDrawing, getPos, drawMask]
  );

  const handleEnd = useCallback(() => {
    setIsDrawing(false);
  }, []);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-[#f5f5f5] p-1">
          <button
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'draw' ? 'bg-red-600/20 text-red-400' : 'text-[#666666] hover:text-[#0d0d0d]/80'
            }`}
          >
            🖌️ 涂抹</button>
          <button
            onClick={() => setMode('erase')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'erase' ? 'bg-zinc-600 text-[#0d0d0d]' : 'text-[#666666] hover:text-[#0d0d0d]/80'
            }`}
          >
            🧹 擦除</button>
        </div>
        <span className="text-xs text-[#666666]/60">
          画笔: {brushSize}px — 涂抹红色覆盖需要修改的区域
        </span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-[#e5e5e5]/50 bg-white inline-block">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        <canvas
          ref={maskCanvasRef}
          className="relative cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>
    </div>
  );
}
