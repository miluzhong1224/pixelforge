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
        <label className="text-xs font-medium text-[#666666] uppercase tracking-wider">{label}</label>
        <span className="text-xs text-[#666666]/60">{value.length}/{maxLength}</span>
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
        className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-2.5 text-sm text-[#0d0d0d] placeholder:text-[#666666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] focus-visible:border-[#0066ff] transition-colors"
      />
    </div>
  );
}
