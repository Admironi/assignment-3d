'use client';

import type { ViewMode } from '@/models/model';

type ViewToggleProps = {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
};

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  const base = 'rounded px-3 py-1.5 text-sm font-medium border';

  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange('3d')}
        className={`${base} ${
          value === '3d'
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-transparent bg-transparent text-neutral-700'
        }`}
      >
        3D
      </button>
      <button
        type="button"
        onClick={() => onChange('2d')}
        className={`${base} ${
          value === '2d'
            ? 'border-neutral-900 bg-neutral-900 text-white'
            : 'border-transparent bg-transparent text-neutral-700'
        }`}
      >
        2D Top
      </button>
    </div>
  );
}
