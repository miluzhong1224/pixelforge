'use client';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  maxLength?: number;
}

export function PromptInput({ value, onChange, label, placeholder, maxLength = 500 }: PromptInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-zinc-600">{value.length}/{maxLength}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= maxLength) {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors"
      />
    </div>
  );
}
