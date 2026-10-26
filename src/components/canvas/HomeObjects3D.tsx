import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, QuadraticBezierLine, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const FloatingCluster = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0.55} floatIntensity={0.95}>
        <RoundedBox args={[1.15, 1.15, 1.15]} radius={0.08} smoothness={6} position={[-1.75, 1.15, -0.4]}>
          <meshStandardMaterial color="#f1f1ef" metalness={0.45} roughness={0.3} />
        </RoundedBox>
      </Float>

      <Float speed={1} rotationIntensity={0.8} floatIntensity={1.1}>
        <mesh position={[2.1, 0.25, -1.2]} rotation={[0.4, 0.2, 0.8]}>
          <torusGeometry args={[0.75, 0.12, 18, 80]} />
          <meshStandardMaterial color="#c9c9c3" metalness={0.5} roughness={0.24} />
        </mesh>
      </Float>

      <Float speed={0.9} rotationIntensity={1.1} floatIntensity={1.3}>
        <mesh position={[1.1, -1.8, 0.6]} rotation={[0.3, 0.4, 0]}>
          <octahedronGeometry args={[0.82, 0]} />
          <meshStandardMaterial color="#ffffff" metalness={0.35} roughness={0.38} />
        </mesh>
      </Float>

      <Float speed={1.35} rotationIntensity={0.45} floatIntensity={0.9}>
        <mesh position={[-2.2, -1.3, -0.8]} rotation={[0.6, 0.5, 0.3]}>
          <cylinderGeometry args={[0.22, 0.22, 1.45, 20]} />
          <meshStandardMaterial color="#b2b2ad" metalness={0.55} roughness={0.28} />
        </mesh>
      </Float>

      <QuadraticBezierLine
        start={[-2.35, -0.65, -1.3]}
        mid={[0, 2.05, -0.8]}
        end={[2.45, -0.2, -1.15]}
        color="#d7d7d2"
        lineWidth={1.1}
        transparent
        opacity={0.38}
      />
    </group>
  );
};

export const HomeObjects3D = () => {
  return (
    <div className="home-section__canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.5], fov: 34 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, -2, 2]} intensity={0.85} color="#d4d4cf" />
        <FloatingCluster />
      </Canvas>
    </div>
  );
};
