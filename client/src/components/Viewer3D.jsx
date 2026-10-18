import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Glisser = tourner · molette = zoom
export default function Viewer3D({ url }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 40, position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <Stage environment="city" intensity={0.6} adjustCamera shadows="contact"><Model url={url} /></Stage>
      </Suspense>
      <OrbitControls makeDefault autoRotate autoRotateSpeed={2} enablePan={false} />
    </Canvas>
  );
}
