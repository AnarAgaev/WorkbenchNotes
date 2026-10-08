// src/components/ui/InlineEdit.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function InlineEdit({
  initialValue,
  onSave,
  onCancel,
  autoFocus = true,
  placeholder,
  className = "",
  inputClassName = "",
}: {
  initialValue: string;
  onSave: (nextValue: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (autoFocus) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [autoFocus]);

  const finishSave = () => {
    const t = value.trim();
    if (!t) {
      onCancel?.();
      return;
    }
    onSave(t);
  };

  return (
    <div className={className}>
      <input
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={e => setValue(e.target.value)}
        onClick={e => e.stopPropagation()}
        onBlur={finishSave}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            finishSave();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel?.();
          }
        }}
        className={inputClassName}
      />
    </div>
  );
}
