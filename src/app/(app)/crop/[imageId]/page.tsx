'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { CropCanvas } from '@/components/crop/crop-canvas';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Download } from 'lucide-react';

interface ImageData { id: string; prompt: string; result_urls: string[]; }

const SUPABASE_URL = 'https://pnowmoquisuqomhfsvza.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FBMRbDCZw-kZuhuHjDwtQQ_ajLWMtf6';

export default function CropPage({ params }: { params: Promise<{ imageId: string }> }) {
  const { imageId } = use(params);
  const router = useRouter();
  const [image, setImage] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cropped, setCropped] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/images?id=eq.${imageId}&limit=1`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    }).then(r => r.json()).then(d => {
      if (d[0]) setImage(d[0]);
      setLoading(false);
    });
  }, [imageId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#353945] border-t-[#5b7fff] animate-spin" /></div>;
  if (!image) return <div className="text-center py-20"><h2 className="text-lg font-semibold text-[#ececee]/80">未找到该图片</h2></div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-[#8b8b96] hover:text-[#ececee]/80 hover:bg-[#15181d] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#ececee]">智能裁剪</h1>
            <p className="text-sm text-[#8b8b96]">拖拽选区或四角手柄调整裁剪范围</p>
          </div>
        </div>
        {cropped && (
          <a href={cropped} download className="inline-flex items-center h-10 px-5 rounded-lg bg-[#5b7fff] text-white text-sm font-medium hover:bg-[#4b6fd9] transition-colors">
            <Download size={14} className="mr-1.5" /> 下载裁剪图
          </a>
        )}
      </div>

      <div className="flex gap-6">
        <div className="flex-1"><CropCanvas imageUrl={image.result_urls?.[0]} onCrop={setCropped} /></div>
        {cropped && (
          <div className="w-80 shrink-0">
            <label className="text-xs font-medium text-[#8b8b96] uppercase tracking-wider mb-2 block">预览</label>
            <img src={cropped} alt="Cropped" className="w-full rounded-xl border border-[#2a2d35]/50" />
          </div>
        )}
      </div>
    </div>
  );
}
