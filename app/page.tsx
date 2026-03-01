'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SceneCanvas from '@/components/scene/SceneCanvas';
import RotationPanel from '@/components/ui/RotationPanel';
import ViewToggle from '@/components/ui/ViewToggle';
import {
  cloneModels,
  DEFAULT_MODELS,
  MODEL_IDS,
  type ModelId,
  type ModelTransform,
  type ModelsMap,
  type Vec3,
  type ViewMode,
} from '@/models/model';
import { loadModelTransforms, saveModelTransform } from '@/models/model-store';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [models, setModels] = useState<ModelsMap>(() =>
    cloneModels(DEFAULT_MODELS),
  );
  const [selectedId, setSelectedId] = useState<ModelId>('model-a');
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string>('');

  const saveTimers = useRef<
    Partial<Record<ModelId, ReturnType<typeof setTimeout>>>
  >({});

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const loaded = await loadModelTransforms();
        if (active) {
          setModels(loaded);
        }
      } catch {
        if (active) {
          setError('Failed to laod Firestore data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timers = saveTimers.current;

    return () => {
      MODEL_IDS.forEach((id) => {
        const timer = timers[id];
        if (timer) {
          clearTimeout(timer);
        }
      });
    };
  }, []);

  const queueSave = useCallback((model: ModelTransform, immediate = false) => {
    const timer = saveTimers.current[model.id];
    if (timer) {
      clearTimeout(timer);
    }

    if (immediate) {
      void saveModelTransform(model).catch(() => {
        setError('Failed to save to Firestore.');
      });
      return;
    }

    saveTimers.current[model.id] = setTimeout(() => {
      void saveModelTransform(model).catch(() => {
        setError('Failed to save to Firestore.');
      });
    }, 120);
  }, []);

  const canPlace = useCallback(
    (id: ModelId, nextPosition: Vec3) => {
      const moving = models[id];

      for (const candidateId of MODEL_IDS) {
        if (candidateId === id) {
          continue;
        }

        const fixed = models[candidateId];
        const dx = nextPosition.x - fixed.position.x;
        const dz = nextPosition.z - fixed.position.z;
        const minDistance = moving.radius + fixed.radius;

        if (dx * dx + dz * dz < minDistance * minDistance) {
          return false;
        }
      }

      return true;
    },
    [models],
  );

  const updateModel = useCallback(
    (
      id: ModelId,
      patch: Partial<Pick<ModelTransform, 'position' | 'rotationY'>>,
      immediate = false,
    ) => {
      let nextModel: ModelTransform | null = null;

      setModels((current) => {
        const base = current[id];
        nextModel = {
          ...base,
          ...patch,
          position: patch.position
            ? { ...patch.position }
            : { ...base.position },
        };

        return {
          ...current,
          [id]: nextModel,
        };
      });

      if (nextModel) {
        queueSave(nextModel, immediate);
      }
    },
    [queueSave],
  );

  const handleDrag = useCallback(
    (id: ModelId, nextPosition: Vec3) => {
      if (!canPlace(id, nextPosition)) {
        return;
      }

      updateModel(id, { position: nextPosition });
    },
    [canPlace, updateModel],
  );

  const handleDragEnd = useCallback(
    (id: ModelId) => {
      queueSave(models[id], true);
    },
    [models, queueSave],
  );

  const handleRotate = useCallback(
    (rotationY: number) => {
      updateModel(selectedId, { rotationY });
    },
    [selectedId, updateModel],
  );

  const selectedModel = useMemo(() => models[selectedId], [models, selectedId]);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 bg-neutral-50 px-4 py-3">
        <h1 className="text-base font-semibold">3D Assignment</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <RotationPanel model={selectedModel} onRotate={handleRotate} />
        </div>
      </header>

      {error ? (
        <div className="px-4 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {loading ? <div className="px-4 py-2 text-sm">Loading...</div> : null}

      <main className="h-[calc(100vh-73px)]">
        <SceneCanvas
          viewMode={viewMode}
          models={models}
          selectedId={selectedId}
          dragging={dragging}
          onSelect={setSelectedId}
          onDrag={handleDrag}
          onDragStateChange={setDragging}
          onDragEnd={handleDragEnd}
        />
      </main>
    </div>
  );
}
