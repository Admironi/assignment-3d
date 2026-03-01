export const MODEL_IDS = ["model-a", "model-b"] as const;

export type ModelId = (typeof MODEL_IDS)[number];

export type ViewMode = "2d" | "3d";

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type ModelTransform = {
  id: ModelId;
  modelPath: string;
  position: Vec3;
  rotationY: number;
  radius: number;
};

export type ModelsMap = Record<ModelId, ModelTransform>;

export const DEFAULT_MODELS: ModelsMap = {
  "model-a": {
    id: "model-a",
    modelPath: "/models/model-a.glb",
    position: { x: -3, y: 0, z: 0 },
    rotationY: 0,
    radius: 1.6,
  },
  "model-b": {
    id: "model-b",
    modelPath: "/models/model-b.glb",
    position: { x: 3, y: 0, z: 0 },
    rotationY: 0,
    radius: 1.6,
  },
};

export function cloneModels(models: ModelsMap): ModelsMap {
  return {
    "model-a": {
      ...models["model-a"],
      position: { ...models["model-a"].position },
    },
    "model-b": {
      ...models["model-b"],
      position: { ...models["model-b"].position },
    },
  };
}
