import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';

interface YumekaMascotProps {
  modelUrl?: string;
  animationUrl?: string;
  className?: string;
  active?: boolean;
}

export const YumekaMascot: React.FC<YumekaMascotProps> = ({
  modelUrl = '/models/Yumeka_Current.vrm',
  animationUrl = '/models/intro_char_animation.json',
  className = '',
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vrmRef = useRef<VRM | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const clipRef = useRef<THREE.AnimationClip | null>(null);

  // Mouse tracking targets
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseSmoothRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Blinking cycle
  const blinkTimerRef = useRef<number>(0);
  const nextBlinkIntervalRef = useRef<number>(3.0);
  const isBlinkingRef = useRef<boolean>(false);
  const blinkProgressRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animId: number;
    let isDisposed = false;

    // Scene
    const scene = new THREE.Scene();

    // Camera - framed to capture the mascot's upper body and gestures
    const camera = new THREE.PerspectiveCamera(
      28,
      container.clientWidth / container.clientHeight,
      0.1,
      20.0
    );
    camera.position.set(0.0, 0.92, 2.15);
    camera.lookAt(0.0, 0.88, 0.0);

    // Pure transparent WebGL Renderer - NO BG
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0); // completely transparent
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Clean neutral lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    dirLight.position.set(1.5, 2.5, 2.0);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xccddff, 1.0);
    fillLight.position.set(-1.5, 1.5, 1.5);
    scene.add(fillLight);

    // Look target for native VRM eye gaze tracking
    const lookTarget = new THREE.Object3D();
    scene.add(lookTarget);
    lookTarget.position.set(0, 1.15, 2.0);

    // Track mouse coordinates for interactive subtle lookAt
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (window.innerWidth * 0.5);
      const ny = (e.clientY - cy) / (window.innerHeight * 0.5);
      mouseTargetRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle container resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const applyAnimation = (vrm: VRM, clip: THREE.AnimationClip) => {
      const mixer = new THREE.AnimationMixer(vrm.scene);
      mixerRef.current = mixer;
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();
    };

    // Load Animation Clip (extracted and retargeted from Rokoko FBX)
    fetch(animationUrl)
      .then((res) => res.json())
      .then((clipJson) => {
        if (isDisposed) return;
        const clip = THREE.AnimationClip.parse(clipJson);
        clipRef.current = clip;
        if (vrmRef.current) {
          applyAnimation(vrmRef.current, clip);
        }
      })
      .catch((err) => {
        console.warn('Animation load failed, fallback to default pose:', err);
      });

    // Load VRM model
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;
        const vrm = gltf.userData.vrm as VRM;
        vrmRef.current = vrm;

        // Rotate VRM 0.0 to face forward
        VRMUtils.rotateVRM0(vrm);

        // Position model
        vrm.scene.position.set(0, 0, 0);
        scene.add(vrm.scene);

        // Connect native lookAt gaze tracker
        if (vrm.lookAt) {
          vrm.lookAt.target = lookTarget;
        }

        // If animation clip is already loaded, apply it
        if (clipRef.current) {
          applyAnimation(vrm, clipRef.current);
        }
      },
      undefined,
      (err) => {
        if (isDisposed) return;
        console.error('Failed to load VRM model:', err);
      }
    );

    const clock = new THREE.Clock();

    // Render loop
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Mouse tracking interpolation
      const target = mouseTargetRef.current;
      mouseSmoothRef.current.x += (target.x - mouseSmoothRef.current.x) * (delta * 4.0);
      mouseSmoothRef.current.y += (target.y - mouseSmoothRef.current.y) * (delta * 4.0);

      const vrm = vrmRef.current;
      const mixer = mixerRef.current;

      // Update mixer playback
      if (mixer) {
        mixer.update(delta);
      }

      // Update look target position for natural gaze tracking
      lookTarget.position.set(
        mouseSmoothRef.current.x * 0.8,
        1.15 - mouseSmoothRef.current.y * 0.5,
        2.0
      );

      if (vrm) {
        // Natural eye blinking
        blinkTimerRef.current += delta;
        if (!isBlinkingRef.current && blinkTimerRef.current > nextBlinkIntervalRef.current) {
          isBlinkingRef.current = true;
          blinkTimerRef.current = 0;
          blinkProgressRef.current = 0;
          nextBlinkIntervalRef.current = 2.5 + Math.random() * 3.5;
        }

        if (isBlinkingRef.current) {
          blinkProgressRef.current += delta * 7.5;
          if (blinkProgressRef.current < 1.0) {
            const blinkVal = Math.sin(blinkProgressRef.current * Math.PI);
            vrm.expressionManager?.setValue('blink', blinkVal);
          } else {
            vrm.expressionManager?.setValue('blink', 0);
            isBlinkingRef.current = false;
          }
        }

        vrm.update(delta);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      scene.clear();
      renderer.dispose();
    };
  }, [modelUrl, animationUrl]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none pointer-events-none bg-transparent ${className}`}
      style={{
        opacity: active ? 1 : 0,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-transparent pointer-events-none block"
      />
    </div>
  );
};

export default YumekaMascot;
