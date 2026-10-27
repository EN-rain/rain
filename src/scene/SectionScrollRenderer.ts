import { textureManager } from '../utils/TextureManager';
import { performanceMonitor } from '../hooks/usePerformanceMonitor';

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * WebGL 2 Section Scroll Transition Shader
 * Ported from https://github.com/EN-rain/web000 (RouteTransitionRenderer.ts)
 * Uses mud_normal.jpg directional wavefront + hardware derivative luminance contours (fwidth)
 * + 1.0 <-> 1.3 UV scale warp + pulsing rim glow to transition between sections.
 * All textures are pre-decoded and pinned in memory via TextureManager.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCurrentImageSize;
uniform vec2 uNextImageSize;
uniform float uCurrentEdgeMultiplier;
uniform float uNextEdgeMultiplier;
uniform float uDirection;
uniform float uBlurIntensity;

in vec2 vUv;
out vec4 outColor;

vec2 scaleUv(vec2 uv, float scale, vec2 center) {
  return (uv - center) / scale + center;
}

vec2 coverUv(
  vec2 uv,
  vec2 imageSize,
  vec2 viewportSize
) {
  float imageRatio = imageSize.x / max(imageSize.y, 1.0);
  float viewportRatio = viewportSize.x / max(viewportSize.y, 1.0);
  vec2 scaled = vec2(1.0);

  if (viewportRatio > imageRatio) {
    scaled.y = imageRatio / viewportRatio;
  } else {
    scaled.x = viewportRatio / imageRatio;
  }

  vec2 offset = (1.0 - scaled) * 0.5;
  return offset + uv * scaled;
}

void main() {
  vec2 uv = vUv;
  float progress = clamp(uProgress, 0.0, 1.0);
  float direction = uDirection >= 0.0 ? 1.0 : -1.0;

  float easedProgress = mix(
    progress * progress * (3.0 - 2.0 * progress),
    progress,
    0.25
  );

  // Exact UV zoom from RouteTransitionRenderer.ts (1.0 -> 1.3 on outgoing, 1.3 -> 1.0 on incoming)
  vec2 currentUv = scaleUv(uv, mix(1.0, 1.3, progress), vec2(0.5));
  vec2 nextUv = scaleUv(uv, mix(1.3, 1.0, progress), vec2(0.5));

  vec2 currentSampleUv = clamp(coverUv(currentUv, uCurrentImageSize, uResolution), 0.001, 0.999);
  vec2 nextSampleUv = clamp(coverUv(nextUv, uNextImageSize, uResolution), 0.001, 0.999);

  vec4 current = texture(tCurrent, currentSampleUv);
  vec4 next = texture(tNext, nextSampleUv);

  // Mud normal directional threshold from RouteTransitionRenderer.ts
  vec3 mudNormal = texture(tMudNormal, uv).rgb;
  float mudStrength = mix(
    0.3,
    0.6,
    0.5 + 0.5 * sin(uTime - uv.x * 10.0)
  );
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  float verticalAxis = direction > 0.0 ? uv.y : (1.0 - uv.y);
  float directionalAxis = direction > 0.0 ? uv.x : (1.0 - uv.x);
  float centerMix =
    (1.0 - smoothstep(-0.4, 0.6, abs(uv.x - 0.5))) * 0.5;
  float threshold = mix(verticalAxis, directionalAxis, centerMix);
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + 0.2 + mudOffset;
  threshold = clamp(threshold * 0.5 + 0.5, 0.04, 0.96);

  // Map sweep slightly beyond [0, 1] so progress=0 is 100% current and progress=1 is 100% next
  float sweep = mix(-0.02, 1.02, easedProgress);
  float edge = sweep - threshold;
  float edgeDistance = abs(edge);
  float edgeProximity = 1.0 - smoothstep(0.0, 0.32, edgeDistance);

  // Hardware derivative luminance contour lines (fwidth)
  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (progress > 0.005 && progress < 0.995) {
    float currentLuma = dot(current.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(
      fwidth(currentLuma) *
      mix(5.0, 10.0, easedProgress) *
      uCurrentEdgeMultiplier *
      edgeProximity
    );
    float nextLuma = dot(next.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(
      fwidth(nextLuma) *
      mix(3.0, 6.0, 1.0 - easedProgress) *
      uNextEdgeMultiplier *
      edgeProximity
    );
  }

  float antialias = max(fwidth(edge) * 3.0, 0.002);
  float blendFactor = smoothstep(-antialias, antialias, edge);
  float currentEdgeStrength =
    smoothstep(0.0, 0.5, easedProgress) * edgeProximity;
  float nextEdgeStrength =
    smoothstep(0.2, 0.8, 1.0 - easedProgress) * edgeProximity;

  // Tint contour edges with pure crisp white luminance (strictly monochrome black and white)
  vec3 edgeTintCurrent = vec3(1.0) * currentEdges;
  vec3 edgeTintNext = vec3(1.0) * nextEdges;

  current = mix(
    current,
    vec4(edgeTintCurrent, 1.0),
    clamp(
      smoothstep(0.0, 0.5, easedProgress) *
        currentEdgeStrength *
        uCurrentEdgeMultiplier,
      0.0,
      1.0
    )
  );
  next = mix(
    next,
    vec4(edgeTintNext, 1.0),
    clamp(
      smoothstep(0.2, 0.8, 1.0 - easedProgress) *
        nextEdgeStrength *
        uNextEdgeMultiplier,
      0.0,
      1.0
    )
  );

  vec4 outputColor = mix(current, next, blendFactor);

  // Enforce pure monochrome luminance so NO purple or chroma appears
  float monoLuma = dot(outputColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 monoColor = vec3(monoLuma);

  float transitionActive =
    smoothstep(0.01, 0.08, progress) *
    (1.0 - smoothstep(0.92, 1.0, progress));
  float glowFactor = smoothstep(0.0, 0.006, edgeDistance);
  float glowMultiplier = mix(
    2.5,
    9.0,
    0.5 + 0.5 * sin(uTime + uv.x * 10.0)
  ) * uBlurIntensity;
  float glowMix = (1.0 - glowFactor) * transitionActive;

  // Pure white wavefront rim glow (strictly white and black, no purple)
  vec3 litColor = mix(monoColor, vec3(1.0) * glowMultiplier, glowMix);
  litColor = clamp(litColor, 0.0, 1.0);

  // Energy wavefront & atmosphere transition alpha:
  // The wavefront beam and glow sweep across the screen, smoothly blending with live DOM sections underneath
  float waveBandAlpha = edgeProximity * smoothstep(0.005, 0.06, progress) * (1.0 - smoothstep(0.94, 0.995, progress));
  float transitionBell = sin(progress * 3.14159265);
  float finalAlpha = clamp(waveBandAlpha * 0.92 + glowMix * 1.1 + transitionBell * 0.4, 0.0, 1.0);

  // Premultiplied alpha output
  outColor = vec4(litColor * finalAlpha, finalAlpha);
}`;

export type SectionScrollRenderer = {
  draw: (
    fromIndex: number,
    toIndex: number,
    progress: number,
    direction: 1 | -1,
    time: number
  ) => void;
  resize: () => void;
  dispose: () => void;
};

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create section scroll transition shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? 'Unable to compile section scroll transition shader.');
  }

  return shader;
}

function requiredUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Missing section transition uniform: ${name}`);
  return location;
}

export async function createSectionScrollRenderer(
  canvas: HTMLCanvasElement
): Promise<SectionScrollRenderer> {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  if (!gl) throw new Error('WebGL 2 is unavailable.');

  // Pre-decode and cache all transition textures in memory via TextureManager
  await textureManager.getOrInitContextTextures(gl);

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create section scroll transition program.');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      gl.getProgramInfoLog(program) ?? 'Unable to link section scroll transition program.'
    );
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uTCurrent = requiredUniform(gl, program, 'tCurrent');
  const uTNext = requiredUniform(gl, program, 'tNext');
  const uTMudNormal = requiredUniform(gl, program, 'tMudNormal');
  const uProgress = requiredUniform(gl, program, 'uProgress');
  const uTime = requiredUniform(gl, program, 'uTime');
  const uResolution = requiredUniform(gl, program, 'uResolution');
  const uCurrentImageSize = requiredUniform(gl, program, 'uCurrentImageSize');
  const uNextImageSize = requiredUniform(gl, program, 'uNextImageSize');
  const uCurrentEdgeMultiplier = requiredUniform(gl, program, 'uCurrentEdgeMultiplier');
  const uNextEdgeMultiplier = requiredUniform(gl, program, 'uNextEdgeMultiplier');
  const uDirection = requiredUniform(gl, program, 'uDirection');
  const uBlurIntensity = requiredUniform(gl, program, 'uBlurIntensity');

  gl.uniform1i(uTCurrent, 0);
  gl.uniform1i(uTNext, 1);
  gl.uniform1i(uTMudNormal, 2);
  gl.uniform2f(uCurrentImageSize, 1600, 1000);
  gl.uniform2f(uNextImageSize, 1600, 1000);
  gl.uniform1f(uCurrentEdgeMultiplier, 1.15);
  gl.uniform1f(uNextEdgeMultiplier, 1.15);
  gl.uniform1f(uBlurIntensity, 1.0);

  const resize = () => {
    const perf = performanceMonitor.getMetrics();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * perf.dprScale;
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uResolution, width, height);
  };

  resize();

  const draw = (
    fromIndex: number,
    toIndex: number,
    progress: number,
    direction: 1 | -1,
    time: number
  ) => {
    const perf = performanceMonitor.recordFrame(performance.now());
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const safeFrom = Math.max(0, Math.min(3, fromIndex));
    const safeTo = Math.max(0, Math.min(3, toIndex));

    // Bind pre-cached textures from TextureManager
    textureManager.bindTexture(gl, 0, `section${safeFrom}`);
    textureManager.bindTexture(gl, 1, `section${safeTo}`);
    textureManager.bindTexture(gl, 2, 'mudNormal');

    gl.uniform1i(uTCurrent, 0);
    gl.uniform1i(uTNext, 1);
    gl.uniform1i(uTMudNormal, 2);

    gl.uniform1f(uProgress, progress);
    gl.uniform1f(uDirection, direction);
    gl.uniform1f(uTime, time);
    gl.uniform1f(uBlurIntensity, perf.blurIntensity);
    gl.uniform1f(uCurrentEdgeMultiplier, 1.15 * perf.blurMultiplier);
    gl.uniform1f(uNextEdgeMultiplier, 1.15 * perf.blurMultiplier);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    try {
      // 1. Explicitly dispose all cached WebGL textures for this context
      textureManager.disposeContext(gl);

      // 2. Unbind and delete vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      if (gl.isBuffer(buffer)) {
        gl.deleteBuffer(buffer);
      }

      // 3. Detach shaders, delete shaders, and delete shader program
      if (gl.isProgram(program)) {
        gl.useProgram(null);
        if (gl.isShader(vertexShader)) {
          gl.detachShader(program, vertexShader);
          gl.deleteShader(vertexShader);
        }
        if (gl.isShader(fragmentShader)) {
          gl.detachShader(program, fragmentShader);
          gl.deleteShader(fragmentShader);
        }
        gl.deleteProgram(program);
      }

      // 4. Force context loss to immediately free GPU memory handles
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Ignore errors if context already lost or torn down
    }
  };

  return { draw, resize, dispose };
}
