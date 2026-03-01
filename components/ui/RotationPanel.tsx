'use client';

import type { ModelTransform } from '@/models/model';

type RotationPanelProps = {
  model?: ModelTransform;
  onRotate: (rotationY: number) => void;
};

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export default function RotationPanel({ model, onRotate }: RotationPanelProps) {
  const disabled = !model;
  const valueDeg = model ? Math.round(radiansToDegrees(model.rotationY)) : 0;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-300 bg-white px-3 py-2">
      <span className="text-sm font-medium">Rotation</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => model && onRotate(model.rotationY - Math.PI / 12)}
        className="rounded border border-neutral-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        -15
      </button>
      <input
        type="range"
        min={-180}
        max={180}
        step={1}
        value={valueDeg}
        disabled={disabled}
        onChange={(event) =>
          onRotate(degreesToRadians(Number(event.target.value)))
        }
        className="w-44"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => model && onRotate(model.rotationY + Math.PI / 12)}
        className="rounded border border-neutral-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        +15
      </button>
      <span className="w-14 text-right text-sm tabular-nums">
        {valueDeg}deg
      </span>
    </div>
  );
}
