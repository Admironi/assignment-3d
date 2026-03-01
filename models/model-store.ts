import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cloneModels, DEFAULT_MODELS, MODEL_IDS, type ModelTransform, type ModelsMap } from "@/models/model";

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function loadModelTransforms(): Promise<ModelsMap> {
  const merged = cloneModels(DEFAULT_MODELS);

  await Promise.all(
    MODEL_IDS.map(async (id) => {
      const snapshot = await getDoc(doc(db, "models", id));

      if (!snapshot.exists()) {
        return;
      }

      const data = snapshot.data();
      const source = merged[id];
      const position =
        typeof data.position === "object" && data.position !== null
          ? (data.position as Record<string, unknown>)
          : {};

      merged[id] = {
        ...source,
        rotationY: asNumber(data.rotationY, source.rotationY),
        position: {
          x: asNumber(position.x, source.position.x),
          y: asNumber(position.y, source.position.y),
          z: asNumber(position.z, source.position.z),
        },
      };
    }),
  );

  return merged;
}

export async function saveModelTransform(model: ModelTransform): Promise<void> {
  await setDoc(
    doc(db, "models", model.id),
    {
      position: model.position,
      rotationY: model.rotationY,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
