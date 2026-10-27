import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ENSO_FRAGMENT_SHADER, ENSO_VERTEX_SHADER } from '../shaders/ensoHorizonShader';
import { buildEnsoSculpture } from '../scene/buildEnsoSculpture';
import { EnsoSceneConfig, PALETTE_PRESETS } from '../types';
import { webglPerformanceTracker } from '../hooks/useWebGLPerformanceMonitor';

interface WebGLCanvasProps {
  config: EnsoSceneConfig;
}

export const WebGLCanvas: React.FC<WebGLCanvasProps> = ({ config }) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const configRef = useRef<EnsoSceneConfig>(config);
  configRef.current = config;

  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. High-Performance WebGLRenderer (disable stencil/depth buffer overhead where not needed)
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 3. Scene & Fixed Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030306);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 20);
    camera.position.set(0, 0, 3.8);
    camera.lookAt(0, 0, 0);

    // 4. Full-Viewport Calligraphic Shader Plane (1x1 quad — fragment shader does all work)
    const getPlaneDimensionsAtZ0 = (aspect: number) => {
      const dist = 3.8;
      const vFov = THREE.MathUtils.degToRad(40);
      const planeH = 2 * Math.tan(vFov / 2) * dist;
      const planeW = planeH * aspect;
      return { planeW, planeH };
    };

    const initialDims = getPlaneDimensionsAtZ0(width / height);
    const shaderPlaneGeo = new THREE.PlaneGeometry(1, 1, 1, 1);

    const initialPalette = PALETTE_PRESETS[configRef.current.palette];
    const shaderUniforms = {
      uTime: { value: 0 },
      uAspect: { value: width / height },
      uFlowSpeed: { value: configRef.current.flowSpeed },
      uBristleDetail: { value: configRef.current.bristleDetail },
      uInkDensity: { value: configRef.current.inkDensity },
      uEmberIntensity: { value: configRef.current.emberIntensity },
      uHorizonRadius: { value: configRef.current.horizonRadius },
      uDeepInk: { value: new THREE.Color(...initialPalette.deepInk) },
      uCoreBlue: { value: new THREE.Color(...initialPalette.coreBlue) },
      uBrightEdge: { value: new THREE.Color(...initialPalette.brightEdge) },
      uEmberPrimary: { value: new THREE.Color(...initialPalette.emberPrimary) },
      uEmberSecondary: { value: new THREE.Color(...initialPalette.emberSecondary) },
    };

    const shaderPlaneMat = new THREE.ShaderMaterial({
      uniforms: shaderUniforms,
      vertexShader: ENSO_VERTEX_SHADER,
      fragmentShader: ENSO_FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });

    const shaderPlaneMesh = new THREE.Mesh(shaderPlaneGeo, shaderPlaneMat);
    shaderPlaneMesh.scale.set(initialDims.planeW, initialDims.planeH, 1);
    shaderPlaneMesh.renderOrder = -1;
    shaderPlaneMesh.frustumCulled = false;
    scene.add(shaderPlaneMesh);

    // 5. Build Sparse 3D Instanced Particles
    const sculptureRig = buildEnsoSculpture(renderer, isSoftwareGl);
    scene.add(sculptureRig.rootGroup);

    // 6. Pre-compile & Pre-render warm-up frame immediately so shader is hot in VRAM
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    sculptureRig.update(0, 0.016, configRef.current.flowSpeed, 0.0, {
      deepInk: initialPalette.deepInk,
      coreBlue: initialPalette.coreBlue,
      brightEdge: initialPalette.brightEdge,
      emberPrimary: initialPalette.emberPrimary,
    });
    renderer.render(scene, camera);

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const aspect = w / h;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      shaderUniforms.uAspect.value = aspect;
      const dims = getPlaneDimensionsAtZ0(aspect);
      shaderPlaneMesh.scale.set(dims.planeW, dims.planeH, 1);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 8. Animation Loop with Off-Screen Visibility Culling & Software-WebGL FenceSync Pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let isRunning = true;
    let isSectionVisible = true;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!isRunning) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (!isRunning || !isSectionVisible || document.hidden) {
        frameId = 0;
        return;
      }

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const cfg = configRef.current;
      const pal = PALETTE_PRESETS[cfg.palette];

      const perf = webglPerformanceTracker.recordFrame(performance.now());

      // Dynamically adjust particle count on 3D instanced meshes if frame rate drops during scroll
      if (sculptureRig.embersMesh) {
        sculptureRig.embersMesh.count = Math.max(2, Math.round(10 * perf.particleMultiplier));
      }
      if (sculptureRig.starsMesh) {
        sculptureRig.starsMesh.count = Math.max(4, Math.round(18 * perf.particleMultiplier));
      }

      // Dynamically adjust shader blur, bristle detail, and ink density
      shaderUniforms.uTime.value = elapsed;
      shaderUniforms.uBristleDetail.value = cfg.bristleDetail * perf.blurMultiplier;
      shaderUniforms.uInkDensity.value = cfg.inkDensity * (0.4 + 0.6 * perf.blurMultiplier);
      shaderUniforms.uEmberIntensity.value = cfg.emberIntensity * perf.particleMultiplier;

      sculptureRig.update(elapsed, delta, cfg.flowSpeed, 0.0, {
        deepInk: pal.deepInk,
        coreBlue: pal.coreBlue,
        brightEdge: pal.brightEdge,
        emberPrimary: pal.emberPrimary,
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    const startLoopIfNeeded = () => {
      if (isRunning && isSectionVisible && !document.hidden && frameId === 0) {
        clock.getDelta(); // reset delta spike after pause
        tick();
      }
    };

    const handleVisibilityEvent = (e: Event) => {
      const visible = Boolean((e as CustomEvent<boolean>).detail);
      if (visible !== isSectionVisible) {
        isSectionVisible = visible;
        if (isSectionVisible) {
          startLoopIfNeeded();
        }
      }
    };

    const handleDocVisibility = () => {
      if (!document.hidden) {
        startLoopIfNeeded();
      }
    };

    window.addEventListener('about-webgl-visibility', handleVisibilityEvent);
    document.addEventListener('visibilitychange', handleDocVisibility);

    tick();

    const cleanup = () => {
      if (!isRunning) return;
      isRunning = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('about-webgl-visibility', handleVisibilityEvent);
      window.removeEventListener('portfolio-navigate', handleNavigation);
      document.removeEventListener('visibilitychange', handleDocVisibility);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      try {
        shaderPlaneGeo.dispose();
        shaderPlaneMat.dispose();
        sculptureRig.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
      } catch {
        // ignore errors during teardown
      }
    };

    const handleNavigation = (e: Event) => {
      const detail = (e as CustomEvent<{ path?: string }>).detail;
      if (detail?.path && detail.path.startsWith('/projects')) {
        cleanup();
      }
    };

    window.addEventListener('portfolio-navigate', handleNavigation);

    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none pointer-events-none bg-[#030306]">
      <div ref={canvasMountRef} className="w-full h-full" />

      {contextLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 text-white p-8" />
      )}
    </div>
  );
};
