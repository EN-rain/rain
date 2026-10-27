import { useEffect, useRef, memo } from 'react';
import { performanceMonitor } from '../../hooks/usePerformanceMonitor';
import { textureManager } from '../../utils/TextureManager';

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uProgress;
  uniform float uVelocity;
  uniform vec2 uMouse;
  uniform float uBlurIntensity;
  uniform float uParticleScale;
  uniform sampler2D tWaveNoise;

  // Hash & 2D simplex-style value noise
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p = rot * p * 2.02 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  // Depth-layered particle field with velocity warp streaks
  float particleLayer(vec2 uv, float scale, float speed, float scrollShift, float streak) {
    vec2 p = uv * vec2(scale, scale * (1.0 + streak * 0.35));
    p.x += scrollShift + uTime * speed;
    vec2 id = floor(p);
    vec2 gv = fract(p) - 0.5;

    float rnd = hash21(id);
    if (rnd < mix(0.72, 0.45, uParticleScale)) return 0.0;

    vec2 offset = vec2(fract(rnd * 34.56) - 0.5, fract(rnd * 78.12) - 0.5) * 0.62;
    vec2 d = gv - offset;
    // Stretch horizontally when scroll velocity is high
    d.x /= (1.0 + streak * 3.2);

    float dist = length(d);
    float size = (0.025 + fract(rnd * 13.7) * 0.045);
    float spark = smoothstep(size, 0.0, dist);
    float twinkle = 0.55 + 0.45 * sin(uTime * (2.0 + rnd * 4.0) + rnd * 6.2831);
    return spark * twinkle * smoothstep(0.45, 0.99, rnd);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(1.0, uResolution.y);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    vec2 mouseP = (uMouse - 0.5) * vec2(aspect, 1.0);

    float velAbs = clamp(abs(uVelocity), 0.0, 2.5);
    float scrollOffset = uProgress * 4.2;

    // Subtle pointer ripple influence
    float mouseDist = length(p - mouseP);
    float mouseField = exp(-mouseDist * 3.2) * 0.12;

    // Base dark cosmic obsidian gradient
    vec3 col = mix(vec3(0.016, 0.014, 0.032), vec3(0.038, 0.022, 0.075), uv.y * 0.75 + 0.25 * (1.0 - uv.x));

    // Ambient FBM nebula mist moving horizontally with timeline progress
    vec2 mistUv = vec2(p.x * 1.15 + scrollOffset * 0.55 - uTime * 0.06, p.y * 1.4);
    float mist = fbm(mistUv);
    vec4 texNoiseVal = texture2D(tWaveNoise, fract(mistUv * 0.35 + vec2(uTime * 0.02, 0.0)));
    float mist2 = fbm(mistUv * 1.6 - vec2(uTime * 0.09, scrollOffset * 0.25)) + (texNoiseVal.r - 0.5) * 0.25;

    vec3 violetCore = vec3(0.486, 0.227, 0.929); // #7c3aed
    vec3 lavenderGlow = vec3(0.655, 0.545, 0.980); // #a78bfa
    vec3 cyanSpark = vec3(0.220, 0.741, 0.973); // #38bdf8

    col += violetCore * mist * (0.16 * uBlurIntensity);
    col += lavenderGlow * pow(max(0.0, mist2), 2.2) * (0.14 * uBlurIntensity);

    // Velocity-reactive multi-harmonic energy wave along the horizontal timeline axis
    float waveCenterY = -0.02 + mouseField * 0.35;
    float xPhase = p.x * 2.4 + scrollOffset * 1.85;
    float velBoost = 1.0 + velAbs * 0.85;

    float w1 = sin(xPhase - uTime * 1.35) * 0.085 * velBoost;
    float w2 = cos(xPhase * 1.7 + uTime * 0.95 + mist * 2.2) * 0.055 * velBoost;
    float w3 = sin(xPhase * 3.1 - uTime * 2.1 + uVelocity * 1.5) * (0.022 + velAbs * 0.038);

    float d1 = abs(p.y - (waveCenterY + w1 + w2 * 0.5));
    float d2 = abs(p.y - (waveCenterY - w2 + w3));
    float d3 = abs(p.y - (waveCenterY + w1 * 0.4 - w3 * 1.4));

    float ribbon1 = (0.012 * uBlurIntensity) / (d1 + 0.018 * uBlurIntensity);
    float ribbon2 = (0.008 * uBlurIntensity) / (d2 + 0.024 * uBlurIntensity);
    float ribbon3 = (0.005 * uBlurIntensity) / (d3 + 0.028 * uBlurIntensity);

    col += violetCore * ribbon1 * (0.95 + velAbs * 0.5);
    col += lavenderGlow * ribbon2 * (0.8 + velAbs * 0.4);
    col += cyanSpark * ribbon3 * (0.65 + velAbs * 0.35);

    // 3 depth-layered parallax particle fields with velocity streak warp
    vec2 partUv = vec2(p.x, p.y);
    float pNear = particleLayer(partUv, 7.5, 0.08, scrollOffset * 1.3, velAbs);
    float pMid  = particleLayer(partUv + vec2(3.1, 1.7), 13.0, 0.05, scrollOffset * 0.85, velAbs * 0.7);
    float pFar  = uParticleScale > 0.55 ? particleLayer(partUv + vec2(7.4, -2.3), 22.0, 0.025, scrollOffset * 0.45, velAbs * 0.4) : 0.0;

    col += lavenderGlow * pNear * (0.85 * uParticleScale);
    col += violetCore * pMid * (0.65 * uParticleScale);
    col += cyanSpark * pFar * (0.45 * uParticleScale);

    // Pointer magnetic halo
    col += lavenderGlow * exp(-mouseDist * 4.5) * 0.14;

    // Subtle edge vignette so timeline cards pop with high contrast
    float vig = smoothstep(1.35, 0.25, length(p * vec2(0.72, 1.05)));
    col *= mix(0.42, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const WorksTimelineWebGL = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) return;

    // Initialize or retrieve cached energy wave noise texture from TextureManager
    textureManager.getOrInitContextTextures(gl).then(() => {
      textureManager.bindTexture(gl, 0, 'energyWaveNoise');
    });

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResLoc = gl.getUniformLocation(program, 'uResolution');
    const uProgLoc = gl.getUniformLocation(program, 'uProgress');
    const uVelLoc = gl.getUniformLocation(program, 'uVelocity');
    const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
    const uBlurLoc = gl.getUniformLocation(program, 'uBlurIntensity');
    const uPartScaleLoc = gl.getUniformLocation(program, 'uParticleScale');
    const uNoiseLoc = gl.getUniformLocation(program, 'tWaveNoise');

    if (uNoiseLoc) {
      gl.uniform1i(uNoiseLoc, 0);
    }

    let width = 0;
    let height = 0;
    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(1, Math.floor((rect.width || window.innerWidth) * dpr));
      const nextH = Math.max(1, Math.floor((rect.height || window.innerHeight) * dpr));
      if (nextW !== width || nextH !== height) {
        width = nextW;
        height = nextH;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let targetProgress = 0;
    let currentProgress = 0;
    let targetVelocity = 0;
    let currentVelocity = 0;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;
    let isVisible = true;
    let rafId = 0;
    const startTime = performance.now();

    const handleTimelineScroll = (e: Event) => {
      const detail = (e as CustomEvent<{ progress: number; velocity: number }>).detail;
      if (!detail) return;
      targetProgress = detail.progress;
      targetVelocity = Math.max(-2.5, Math.min(2.5, detail.velocity));
    };

    const handleVisibility = (e: Event) => {
      const visible = Boolean((e as CustomEvent<boolean>).detail);
      if (visible === isVisible) return;
      isVisible = visible;
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isVisible) return;
      targetMouseX = e.clientX / Math.max(1, window.innerWidth);
      targetMouseY = 1.0 - e.clientY / Math.max(1, window.innerHeight);
    };

    window.addEventListener('works-timeline-scroll', handleTimelineScroll);
    window.addEventListener('works-webgl-visibility', handleVisibility);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const render = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }

      const elapsed = (now - startTime) * 0.001;
      const perf = performanceMonitor.recordFrame(now);

      currentProgress += (targetProgress - currentProgress) * 0.12;
      currentVelocity += (targetVelocity - currentVelocity) * 0.16;
      targetVelocity *= 0.88; // Smooth velocity decay when scroll pauses

      currentMouseX += (targetMouseX - currentMouseX) * 0.08;
      currentMouseY += (targetMouseY - currentMouseY) * 0.08;

      gl.useProgram(program);
      textureManager.bindTexture(gl, 0, 'energyWaveNoise');

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform2f(uResLoc, width, height);
      gl.uniform1f(uProgLoc, currentProgress);
      gl.uniform1f(uVelLoc, currentVelocity);
      gl.uniform2f(uMouseLoc, currentMouseX, currentMouseY);
      gl.uniform1f(uBlurLoc, perf.blurIntensity);
      gl.uniform1f(uPartScaleLoc, perf.particleMultiplier);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    let isDisposed = false;
    const cleanup = () => {
      if (isDisposed) return;
      isDisposed = true;

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      window.removeEventListener('resize', resize);
      window.removeEventListener('works-timeline-scroll', handleTimelineScroll);
      window.removeEventListener('works-webgl-visibility', handleVisibility);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('portfolio-navigate', handleNavigation);

      try {
        // 1. Explicitly dispose cached WebGL textures
        textureManager.disposeContext(gl);

        // 2. Unbind and delete buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (gl.isBuffer(quadBuffer)) {
          gl.deleteBuffer(quadBuffer);
        }

        // 3. Detach shaders, delete shaders, and delete program
        if (gl.isProgram(program)) {
          gl.useProgram(null);
          if (gl.isShader(vs)) {
            gl.detachShader(program, vs);
            gl.deleteShader(vs);
          }
          if (gl.isShader(fs)) {
            gl.detachShader(program, fs);
            gl.deleteShader(fs);
          }
          gl.deleteProgram(program);
        }

        // 4. Force context loss
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        // Ignore errors during context release
      }
    };

    const handleNavigation = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full z-0"
    />
  );
});
