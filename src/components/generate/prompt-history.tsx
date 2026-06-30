'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

const STORAGE_KEY = 'pf_prompt_history';
const MAX_ITEMS = 20;

export function getPromptHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function addPromptToHistory(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return;
  const history = getPromptHistory().filter(p => p !== trimmed);
  history.unshift(trimmed);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ITEMS)));
}

export function PromptHistory({ onSelect, open, onClose }: { onSelect: (p: string) => void; open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    if (open) setItems(getPromptHistory());
  }, [open]);

  if (!open || items.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#f5f5f5] border border-[#e5e5e5] rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#e5e5e5]/50">
        <span className="text-[11px] text-[#666666] flex items-center gap-1"><Clock size={12} />最近使用</span>
        <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setItems([]); onClose(); }} className="text-[10px] text-[#666666]/60 hover:text-[#666666]">清空</button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {items.map((p, i) => (
          <button key={i} onClick={() => { onSelect(p); onClose(); }}
            className="w-full text-left px-3 py-2 text-sm text-[#0d0d0d]/80 hover:border-[#e5e5e5] transition-colors border-b border-[#e5e5e5]/30 last:border-0 flex items-start gap-2"
          >
            <span className="text-[#666666]/60 text-[10px] mt-0.5 shrink-0">{i + 1}</span>
            <span className="line-clamp-2">{p}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
