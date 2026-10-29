import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ScrapbookAtmosphereShaderProps {
  lampOn?: boolean;
  dimLevel?: number; // 0.0 (bright) to 1.0 (deep noir dim)
  activeItemPos?: { x: number; y: number } | null;
  isZoomed?: boolean;
  active?: boolean;
  className?: string;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uDimLevel;      // 0.0 to 1.0
  uniform vec2 uFocusPos;      // Normalized UV space (0 to 1)
  uniform float uFocusActive;  // 0.0 to 1.0
  uniform float uLampWarmth;   // 0.0 (off) to 1.0 (on)

  // Pseudo-random hash for fine film grain
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);

    // 1. Soft Cinematic Anamorphic Vignette
    vec2 d = (uv - vec2(0.5)) * vec2(aspect * 0.85, 1.0);
    float distCenter = length(d);
    float vignette = smoothstep(1.38, 0.55, distCenter);
    float vignetteDarkness = mix(0.50, 0.28, uDimLevel);
    float vignetteFactor = mix(vignetteDarkness, 1.0, vignette);

    // 2. Focus Dimming (Soft peripheral darkening, keeping the focused frame & bottom-right note well-lit)
    float focusMask = 1.0;
    float centerHighlight = 0.0;
    if (uFocusActive > 0.01) {
      vec2 focusDiff = (uv - uFocusPos) * vec2(aspect * 0.72, 0.90);
      float focusDist = length(focusDiff);
      float focusSpot = smoothstep(1.18, 0.42, focusDist);
      focusMask = mix(1.0, mix(0.78, 1.0, focusSpot), uFocusActive);
      centerHighlight = smoothstep(1.05, 0.08, focusDist) * uFocusActive;
    }

    // 3. Subtle Film Grain
    float grain = (hash12(uv * uResolution.xy + vec2(uTime * 41.3)) - 0.5) * 0.022;

    // 4. Color Grading:
    // Natural cool-tinted shadow with clean exposure (zero colored blush or tint)
    vec3 shadowColor = vec3(0.04, 0.05, 0.07);
    vec3 warmTone = vec3(0.10, 0.08, 0.05) * uLampWarmth;

    // Center highlight clears away shadow and vignette so the focused card & its note are crisp and un-shadowed
    float sceneLight = vignetteFactor * focusMask + centerHighlight * 0.65;
    float darkness = 1.0 - clamp(sceneLight, 0.0, 1.0);

    vec3 finalRgb = shadowColor + warmTone + vec3(grain);
    float finalAlpha = clamp(darkness * 0.35 + (1.0 - vignetteFactor) * 0.16 - centerHighlight * 0.75, 0.0, 0.55);

    gl_FragColor = vec4(finalRgb, finalAlpha);
  }
`;

export const ScrapbookAtmosphereShader: React.FC<ScrapbookAtmosphereShaderProps> = ({
  lampOn = true,
  dimLevel = 0.45,
  activeItemPos = null,
  isZoomed = false,
  active = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dimLevelRef = useRef(dimLevel);
  const lampOnRef = useRef(lampOn);
  const isZoomedRef = useRef(isZoomed);
  const focusActiveRef = useRef(isZoomed ? 1.0 : 0.0);
  const lampWarmthRef = useRef(lampOn ? 1.0 : 0.0);
  const activeItemPosRef = useRef(activeItemPos);
  const activeRef = useRef(active);
  const startLoopRef = useRef<(() => void) | null>(null);

  dimLevelRef.current = dimLevel;
  lampOnRef.current = lampOn;
  isZoomedRef.current = isZoomed;
  activeItemPosRef.current = activeItemPos;
  activeRef.current = active;

  useEffect(() => {
    if (active) {
      startLoopRef.current?.();
    }
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number | null = null;
    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    } catch (e) {
      console.warn('Atmosphere shader WebGL init failed:', e);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uDimLevel: { value: dimLevelRef.current },
      uFocusPos: { value: new THREE.Vector2(0.5, 0.5) },
      uFocusActive: { value: focusActiveRef.current },
      uLampWarmth: { value: lampWarmthRef.current },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      if (!renderer || !canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const startTime = performance.now();

    const animate = () => {
      animId = null;
      if (disposed || !activeRef.current) return;

      const elapsed = (performance.now() - startTime) * 0.001;
      uniforms.uTime.value = elapsed;

      const targetLamp = lampOnRef.current ? 1.0 : 0.0;
      lampWarmthRef.current += (targetLamp - lampWarmthRef.current) * 0.08;
      uniforms.uLampWarmth.value = lampWarmthRef.current;

      uniforms.uDimLevel.value += (dimLevelRef.current - uniforms.uDimLevel.value) * 0.08;

      const targetFocus = isZoomedRef.current ? 1.0 : 0.0;
      focusActiveRef.current += (targetFocus - focusActiveRef.current) * 0.08;
      uniforms.uFocusActive.value = focusActiveRef.current;

      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0 && activeItemPosRef.current) {
        const fx = Math.max(0, Math.min(1, activeItemPosRef.current.x / w));
        const fy = Math.max(0, Math.min(1, 1.0 - activeItemPosRef.current.y / h));
        uniforms.uFocusPos.value.set(fx, fy);
      }

      renderer?.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    startLoopRef.current = () => {
      if (animId === null && !disposed && activeRef.current) {
        handleResize();
        animId = requestAnimationFrame(animate);
      }
    };

    // Render one initial frame so the canvas buffer is ready immediately
    renderer.render(scene, camera);
    if (activeRef.current) {
      startLoopRef.current();
    }

    return () => {
      disposed = true;
      startLoopRef.current = null;
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none select-none z-30 ${className}`}
      aria-hidden="true"
    />
  );
};

export default ScrapbookAtmosphereShader;
