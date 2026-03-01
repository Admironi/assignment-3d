"use client";

import { useMemo, useRef, useState } from "react";
import { ThreeEvent, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import type { ModelId, Vec3 } from "@/models/model";

type DraggableModelProps = {
  id: ModelId;
  modelPath: string;
  position: Vec3;
  rotationY: number;
  selected: boolean;
  onSelect: (id: ModelId) => void;
  onDrag: (id: ModelId, next: Vec3) => void;
  onDragStateChange: (dragging: boolean) => void;
  onDragEnd: (id: ModelId) => void;
};

const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export default function DraggableModel({
  id,
  modelPath,
  position,
  rotationY,
  selected,
  onSelect,
  onDrag,
  onDragStateChange,
  onDragEnd,
}: DraggableModelProps) {
  const gltf = useLoader(GLTFLoader, modelPath);
  const { scene, localOffset } = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(cloned);
    const center = bounds.getCenter(new THREE.Vector3());
    const minY = Number.isFinite(bounds.min.y) ? bounds.min.y : 0;

    return {
      scene: cloned,
      localOffset: {
        x: -center.x,
        y: -minY,
        z: -center.z,
      },
    };
  }, [gltf.scene]);
  const dragOffset = useRef(new THREE.Vector3());
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(id);
    setDragging(true);
    onDragStateChange(true);

    const hit = new THREE.Vector3();
    if (event.ray.intersectPlane(dragPlane, hit)) {
      dragOffset.current.set(position.x - hit.x, 0, position.z - hit.z);
    }

    const target = event.target as unknown as {
      setPointerCapture?: (pointerId: number) => void;
    };
    target.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging) {
      return;
    }

    event.stopPropagation();
    const hit = new THREE.Vector3();

    if (event.ray.intersectPlane(dragPlane, hit)) {
      onDrag(id, {
        x: hit.x + dragOffset.current.x,
        y: 0,
        z: hit.z + dragOffset.current.z,
      });
    }
  };

  const handlePointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!dragging) {
      return;
    }

    event.stopPropagation();
    setDragging(false);
    onDragStateChange(false);
    onDragEnd(id);

    const target = event.target as unknown as {
      releasePointerCapture?: (pointerId: number) => void;
    };
    target.releasePointerCapture?.(event.pointerId);
  };

  return (
    <group
      position={[position.x, position.y, position.z]}
      rotation={[0, rotationY, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerMissed={() => setDragging(false)}
    >
      <primitive object={scene} position={[localOffset.x, localOffset.y, localOffset.z]} />
      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.7, 1.85, 48]} />
          <meshBasicMaterial color="#1f2937" />
        </mesh>
      ) : null}
    </group>
  );
}
