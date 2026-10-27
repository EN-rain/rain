import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWebGLPerformanceMonitor, webglPerformanceTracker } from '../../hooks/useWebGLPerformanceMonitor';

const ParticleCloud = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const { particleMultiplier } = useWebGLPerformanceMonitor();
  const maxCount = 2000;

  const particlesGeometry = useMemo(() => {
    const positions = new Float32Array(maxCount * 3);
    const colors = new Float32Array(maxCount * 3);
    
    for (let i = 0; i < maxCount * 3; i += 3) {
      // Position
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = (Math.random() - 0.5) * 30;
      positions[i + 2] = (Math.random() - 0.5) * 15;
      
      // Vary particle color slightly for depth
      const t = Math.random();
      colors[i] = 0.7 + t * 0.3;     // R
      colors[i + 1] = 0.3 + t * 0.2; // G
      colors[i + 2] = 0.9 + t * 0.1; // B
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  useEffect(() => {
    if (particlesGeometry) {
      const activeCount = Math.max(300, Math.round(maxCount * particleMultiplier));
      particlesGeometry.setDrawRange(0, activeCount);
    }
  }, [particlesGeometry, particleMultiplier]);

  useFrame((state) => {
    webglPerformanceTracker.recordFrame(performance.now());
    if (!pointsRef.current) return;
    
    const time = state.clock.elapsedTime;
    pointsRef.current.rotation.y = time * 0.03;
    pointsRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
  });

  return (
    <points ref={pointsRef} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const ParticleField = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.4
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <ParticleCloud />
      </Canvas>
    </div>
  );
};
