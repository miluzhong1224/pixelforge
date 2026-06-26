'use client';

import { useState } from 'react';
import { TEMPLATES, CATEGORIES, type PromptTemplate } from '@/data/templates';
import { X, Search, Sparkles } from 'lucide-react';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: PromptTemplate) => void;
}

export function TemplateSelector({ open, onClose, onSelect }: TemplateSelectorProps) {
  const [category, setCategory] = useState<string>('推荐');
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = TEMPLATES.filter((t) => {
    if (category !== '推荐' && t.category !== category) return false;
    if (search && !t.title.includes(search) && !t.prompt.includes(search)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white border border-[#2a2d35] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#2a2d35] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#5b7fff]" />
            <h2 className="text-lg font-semibold text-[#ececee]">Prompt 模板库</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8b8b96] hover:text-[#ececee]/80 hover:bg-[#15181d] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#2a2d35] shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8b96]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模板..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#15181d] border border-[#2a2d35] text-sm text-[#ececee] placeholder:text-[#8b8b96] focus:outline-none focus:ring-2 focus:ring-[#5b7fff]"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2 border-b border-[#2a2d35] flex gap-1 shrink-0 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-[#5b7fff]/20 text-[#5b7fff] border border-[#5b7fff]/30'
                  : 'text-[#8b8b96] border border-transparent hover:text-[#ececee]/80 hover:bg-[#15181d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="p-5 grid grid-cols-2 gap-3 overflow-y-auto">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelect(t);
                onClose();
              }}
              className="text-left p-4 rounded-xl bg-[#15181d]/50 border border-[#2a2d35]/50 hover:border-[#5b7fff]/50 hover:bg-[#15181d] transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{t.emoji}</span>
                <span className="text-sm font-medium text-[#ececee]">{t.title}</span>
                <span className="text-[10px] text-[#8b8b96]/60 border-[#2a2d35] px-1.5 py-0.5 rounded ml-auto">
                  {t.category}
                </span>
              </div>
              <p className="text-xs text-[#8b8b96] line-clamp-2 group-hover:text-[#8b8b96] transition-colors">
                {t.prompt}
              </p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-sm text-[#8b8b96]">没有匹配的模板</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
