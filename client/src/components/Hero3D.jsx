import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Float, Sparkles } from "@react-three/drei";

function Ring() {
  const tilt = useRef();
  const spin = useRef();
  useFrame((s, dt) => {
    spin.current.rotation.y += dt * 0.6;
    tilt.current.rotation.x += (s.pointer.y * 0.5 + 0.35 - tilt.current.rotation.x) * 0.06;
    tilt.current.rotation.z += (-s.pointer.x * 0.4 - tilt.current.rotation.z) * 0.06;
  });
  return (
    <group ref={tilt}>
      <group ref={spin}>
        <mesh>
          <torusGeometry args={[1, 0.17, 48, 128]} />
          <meshStandardMaterial color="#d6b25e" metalness={1} roughness={0.12} />
        </mesh>
        <mesh position={[0, 1.28, 0]} scale={[1, 1.3, 1]}>
          <octahedronGeometry args={[0.38, 0]} />
          <meshPhysicalMaterial color="#cfeaff" metalness={0} roughness={0} transmission={1} thickness={1.2} ior={2.3} flatShading />
        </mesh>
      </group>
    </group>
  );
}

export default function Hero3D() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0.4, 4.6], fov: 38 }} gl={{ alpha: true }}>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        <Lightformer form="rect" intensity={3} position={[0, 1, -5]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffe2b0" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={3} position={[5, 2, 2]} rotation-y={-Math.PI / 2} scale={4} />
      </Environment>
      <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.9}><Ring /></Float>
      <Sparkles count={45} scale={6} size={3} speed={0.4} color="#f3d9a0" />
    </Canvas>
  );
}
