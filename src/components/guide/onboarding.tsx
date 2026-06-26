'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const STEPS = [
  {
    title: '输入描述词',
    desc: '在左侧输入你想要生成的画面描述，中文即可。点击「AI 优化翻译」可自动转为专业英文 Prompt。',
    highlight: 'prompt-area',
  },
  {
    title: '选择风格模板',
    desc: '点击「模板」按钮，从 12 套预设风格中选择你喜欢的——赛博朋克、水墨国风、二次元等。',
    highlight: 'template-btn',
  },
  {
    title: '开始生成',
    desc: '选好尺寸预设后，点击「开始生成」按钮，AI 将在几秒内为你创作图像。生成后可继续编辑、去背景、放大。',
    highlight: 'generate-btn',
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('pf_onboarding_done');
    if (!seen) setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('pf_onboarding_done', '1');
    setOpen(false);
  };

  if (!open) return null;

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={dismiss} />

      <div className="relative w-full max-w-md mx-4 bg-white border border-[#2a2d35] rounded-2xl shadow-2xl p-6">
        {/* Close */}
        <button onClick={dismiss} className="absolute top-4 right-4 p-1 rounded-lg text-[#8b8b96] hover:text-[#ececee]/80 hover:bg-[#15181d] transition-colors">
          <X size={18} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-colors ${i <= step ? 'bg-[#4b6fd9]' : 'bg-[#15181d]'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-[#5b7fff]/20 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-[#5b7fff]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#ececee] mb-1">{step + 1}. {s.title}</h3>
            <p className="text-sm text-[#8b8b96] leading-relaxed">{s.desc}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-xs text-[#8b8b96] hover:text-[#ececee]/80 transition-colors">
            跳过引导
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-[#8b8b96] hover:text-[#ececee] hover:bg-[#15181d] transition-colors">
                <ChevronLeft size={14} />上一步
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#5b7fff] text-white text-sm font-medium hover:bg-[#4b6fd9] transition-colors">
                下一步<ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={dismiss} className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#5b7fff] text-white text-sm font-medium hover:bg-[#4b6fd9] transition-colors">
                开始创作 ✨
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
