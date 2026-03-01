"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, OrthographicCamera, PerspectiveCamera } from "@react-three/drei";
import DraggableModel from "@/components/scene/DraggableModel";
import type { ModelId, ModelsMap, Vec3, ViewMode } from "@/models/model";

type SceneCanvasProps = {
  viewMode: ViewMode;
  models: ModelsMap;
  selectedId: ModelId;
  dragging: boolean;
  onSelect: (id: ModelId) => void;
  onDrag: (id: ModelId, next: Vec3) => void;
  onDragStateChange: (dragging: boolean) => void;
  onDragEnd: (id: ModelId) => void;
};

export default function SceneCanvas({
  viewMode,
  models,
  selectedId,
  dragging,
  onSelect,
  onDrag,
  onDragStateChange,
  onDragEnd,
}: SceneCanvasProps) {
  return (
    <Canvas shadows dpr={[1, 1.5]}>
      <color attach="background" args={["#f5f5f5"]} />
      {viewMode === "3d" ? (
        <PerspectiveCamera makeDefault position={[11, 9, 11]} fov={50} />
      ) : (
        <OrthographicCamera makeDefault position={[0, 32, 0]} rotation={[-Math.PI / 2, 0, 0]} zoom={30} near={0.1} far={200} />
      )}

      <ambientLight intensity={0.65} />
      <directionalLight position={[12, 18, 8]} intensity={1} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      <Grid args={[80, 80]} cellSize={1} cellThickness={0.7} sectionSize={5} sectionThickness={1.2} fadeDistance={90} fadeStrength={1.2} />

      {Object.values(models).map((model) => (
        <DraggableModel
          key={model.id}
          id={model.id}
          modelPath={model.modelPath}
          position={model.position}
          rotationY={model.rotationY}
          selected={selectedId === model.id}
          onSelect={onSelect}
          onDrag={onDrag}
          onDragStateChange={onDragStateChange}
          onDragEnd={onDragEnd}
        />
      ))}

      <OrbitControls
        enablePan
        enableZoom
        enableRotate={viewMode === "3d" && !dragging}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.02}
      />
    </Canvas>
  );
}
