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
        <label className="text-xs font-medium text-[#8b8b96] uppercase tracking-wider">{label}</label>
        <span className="text-xs text-[#8b8b96]/60">{value.length}/{maxLength}</span>
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
        className="w-full resize-none rounded-lg border border-[#2a2d35] bg-[#15181d] px-3 py-2.5 text-sm text-[#ececee] placeholder:text-[#8b8b96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b7fff] focus-visible:border-[#5b7fff] transition-colors"
      />
    </div>
  );
}
