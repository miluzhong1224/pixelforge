'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

interface Comment { id: string; name: string; text: string; time: string; }

function loadComments(imageId: string): Comment[] {
  try { return JSON.parse(localStorage.getItem(`pf_cmt_${imageId}`) || '[]'); } catch { return []; }
}
function saveComments(imageId: string, comments: Comment[]) {
  localStorage.setItem(`pf_cmt_${imageId}`, JSON.stringify(comments));
}

export function CommentModal({ imageId, open, onClose }: { imageId: string; open: boolean; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [nick, setNick] = useState('');

  useEffect(() => {
    if (open) {
      setComments(loadComments(imageId));
      // 自动获取登录用户名
      fetch('/api/auth/session').then(r => r.json()).then(d => {
        const n = d?.user?.name || d?.user?.email?.split('@')[0] || '用户';
        setNick(n);
      }).catch(() => setNick('用户'));
    }
  }, [imageId, open]);

  const send = () => {
    if (!text.trim()) return;
    const c: Comment = { id: Date.now().toString(), name: nick || '用户', text: text.trim(), time: new Date().toLocaleString('zh-CN') };
    const updated = [c, ...comments];
    setComments(updated);
    saveComments(imageId, updated);
    setText('');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative w-full max-w-lg max-h-[80vh] bg-white border border-[#e5e5e5] rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-4" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[#e5e5e5] flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-[#0d0d0d]">评论 ({comments.length})</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#666666] hover:text-[#0d0d0d]/80"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {comments.length === 0 && <p className="text-sm text-[#666666] text-center py-8">暂无评论，来说两句</p>}
          {comments.map(c => (
            <div key={c.id} className="p-3 rounded-xl bg-[#f5f5f5]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#0d0d0d]/80">{c.name}</span>
                <span className="text-[10px] text-[#666666]/60">{c.time}</span>
              </div>
              <p className="text-sm text-[#666666]">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[#e5e5e5] shrink-0">
          <p className="text-[10px] text-[#666666]/60 mb-1.5">评论身份：{nick}</p>
          <div className="flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="写下你的评论..." className="flex-1 h-9 rounded-lg bg-[#f5f5f5] px-3 text-sm text-[#0d0d0d] placeholder:text-[#666666]/60 focus:outline-none focus:ring-2 focus:ring-[#0066ff]" />
            <button onClick={send} disabled={!text.trim()} className="h-9 w-9 rounded-lg bg-[#0066ff] text-white flex items-center justify-center hover:bg-[#0052cc] disabled:opacity-40 transition-colors"><Send size={15} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
