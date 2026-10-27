import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWebGLPerformanceMonitor, webglPerformanceTracker } from '../hooks/useWebGLPerformanceMonitor';

const Particles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const { particleMultiplier } = useWebGLPerformanceMonitor();
  const maxCount = 1000;
  
  const particlesGeometry = useMemo(() => {
    const positions = new Float32Array(maxCount * 3);
    
    for (let i = 0; i < maxCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useEffect(() => {
    if (particlesGeometry) {
      const activeCount = Math.max(150, Math.round(maxCount * particleMultiplier));
      particlesGeometry.setDrawRange(0, activeCount);
    }
  }, [particlesGeometry, particleMultiplier]);

  useFrame((state) => {
    webglPerformanceTracker.recordFrame(performance.now());
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.02}
        color="#6ee7b7"
        transparent
        opacity={0.6 * particleMultiplier}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const FloatingParticles = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Particles />
      </Canvas>
    </div>
  );
};
