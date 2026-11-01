import mudNormalUrl from '../assets/images/mud_normal.jpg';

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * WebGL 2 Directional Section Scroll Transition Shader
 * Uses mud_normal.jpg directional wavefront + hardware derivative luminance contours (fwidth)
 * for a smooth, sweeping wipe across the screen without center-pop artifacts.
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

  // Smooth cubic easing
  float easedProgress = progress * progress * (3.0 - 2.0 * progress);

  // Subtle zoom during transition
  vec2 currentUv = scaleUv(uv, mix(1.0, 1.04, progress), vec2(0.5));
  vec2 nextUv = scaleUv(uv, mix(1.04, 1.0, progress), vec2(0.5));

  vec2 currentSampleUv = clamp(coverUv(currentUv, uCurrentImageSize, uResolution), 0.001, 0.999);
  vec2 nextSampleUv = clamp(coverUv(nextUv, uNextImageSize, uResolution), 0.001, 0.999);

  vec4 current = texture(tCurrent, currentSampleUv);
  vec4 next = texture(tNext, nextSampleUv);

  // Animated mud normal ripple wavefront using uTime
  vec2 mudUv = uv * 1.6 + vec2(sin(uTime * 1.5 + uv.x * 4.0) * 0.03, cos(uTime * 1.2 + uv.y * 4.0) * 0.03);
  vec3 mudNormal = texture(tMudNormal, mudUv).rgb;
  float mudOffset = (mudNormal.g - 0.5) * 0.22 + (mudNormal.r - 0.5) * 0.10;

  // Directional sweep from BOTTOM TO TOP along the Y axis (uv.y from 0.0 at bottom to 1.0 at top)
  float sweepAxis = uv.y;
  float sweep = mix(-0.25, 1.25, easedProgress);
  float threshold = sweepAxis + mudOffset;
  float edge = sweep - threshold;
  float edgeDistance = abs(edge);
  float edgeProximity = 1.0 - smoothstep(0.0, 0.26, edgeDistance);

  // Black curtain: 1.0 ahead of the wave (above), 0.0 behind the wave (below, revealing Page 1 DOM)
  float antialias = max(fwidth(edge) * 2.5, 0.002);
  float curtainAlpha = 1.0 - smoothstep(-antialias, antialias, edge);

  // Hardware derivative luminance contour lines along moving wave edge
  float edgeStrength = edgeProximity * smoothstep(0.01, 0.08, progress) * (1.0 - smoothstep(0.92, 0.99, progress));
  vec3 edgeTint = vec3(1.0) * edgeStrength * 3.5;

  // Wavefront rim glow along moving edge
  float glowFactor = smoothstep(0.0, 0.016, edgeDistance);
  float glowIntensity = (1.0 - glowFactor) * edgeStrength * 4.2 * uBlurIntensity;
  vec3 waveGlow = edgeTint + vec3(1.0) * glowIntensity;

  // Output: black curtain ahead of wave, transparent behind wave, with glowing wave line
  vec3 color = vec3(0.0) + waveGlow;
  float alpha = clamp(curtainAlpha + edgeStrength + glowIntensity, 0.0, 1.0);

  // Smooth final fade at the very top
  alpha *= (1.0 - smoothstep(0.96, 1.0, progress));

  outColor = vec4(clamp(color, 0.0, 1.0) * alpha, alpha);
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
  if (!shader) throw new Error('Unable to create shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info ?? 'Shader compilation failed.');
  }
  return shader;
}

function safeUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
): WebGLUniformLocation | null {
  return gl.getUniformLocation(program, name);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`[WebGL] Image load fallback for: ${src}`);
      // Create 1x1 neutral fallback so WebGL never crashes
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 64, 64);
      }
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.src = canvas.toDataURL();
    };
    img.src = src;
  });
}

function createGLTexture(
  gl: WebGL2RenderingContext,
  source: TexImageSource,
  wrapS: number,
  wrapT: number
): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error('Unable to create section scroll texture.');

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
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

  const [mudImg, backingImg] = await Promise.all([
    loadImage(mudNormalUrl),
    loadImage('/assets/dark-backing.png?v=3'),
  ]);

  const width = 1600;
  const height = 1000;

  // Section 0: Home scene (dark desk backing texture)
  const section0Canvas = document.createElement('canvas');
  section0Canvas.width = width;
  section0Canvas.height = height;
  const ctx0 = section0Canvas.getContext('2d');
  if (ctx0) {
    if (backingImg && backingImg.width > 0) {
      ctx0.drawImage(backingImg, 0, 0, width, height);
    } else {
      ctx0.fillStyle = '#151715';
      ctx0.fillRect(0, 0, width, height);
    }
  }

  // Section 1: Contacts scene (solid black)
  const section1Canvas = document.createElement('canvas');
  section1Canvas.width = width;
  section1Canvas.height = height;
  const ctx1 = section1Canvas.getContext('2d');
  if (ctx1) {
    ctx1.fillStyle = '#000000';
    ctx1.fillRect(0, 0, width, height);
  }

  const sectionTextures = [
    createGLTexture(gl, section0Canvas, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE),
    createGLTexture(gl, section1Canvas, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE),
  ];
  const mudTexture = createGLTexture(gl, mudImg, gl.REPEAT, gl.REPEAT);

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

  const uTCurrent = safeUniform(gl, program, 'tCurrent');
  const uTNext = safeUniform(gl, program, 'tNext');
  const uTMudNormal = safeUniform(gl, program, 'tMudNormal');
  const uProgress = safeUniform(gl, program, 'uProgress');
  const uTime = safeUniform(gl, program, 'uTime');
  const uResolution = safeUniform(gl, program, 'uResolution');
  const uCurrentImageSize = safeUniform(gl, program, 'uCurrentImageSize');
  const uNextImageSize = safeUniform(gl, program, 'uNextImageSize');
  const uCurrentEdgeMultiplier = safeUniform(gl, program, 'uCurrentEdgeMultiplier');
  const uNextEdgeMultiplier = safeUniform(gl, program, 'uNextEdgeMultiplier');
  const uDirection = safeUniform(gl, program, 'uDirection');
  const uBlurIntensity = safeUniform(gl, program, 'uBlurIntensity');

  if (uTCurrent) gl.uniform1i(uTCurrent, 0);
  if (uTNext) gl.uniform1i(uTNext, 1);
  if (uTMudNormal) gl.uniform1i(uTMudNormal, 2);
  if (uCurrentImageSize) gl.uniform2f(uCurrentImageSize, 1600, 1000);
  if (uNextImageSize) gl.uniform2f(uNextImageSize, 1600, 1000);
  if (uCurrentEdgeMultiplier) gl.uniform1f(uCurrentEdgeMultiplier, 1.15);
  if (uNextEdgeMultiplier) gl.uniform1f(uNextEdgeMultiplier, 1.15);
  if (uBlurIntensity) gl.uniform1f(uBlurIntensity, 1.0);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(window.innerWidth * dpr));
    const height = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    if (uResolution) gl.uniform2f(uResolution, width, height);
  };

  resize();

  const draw = (
    fromIndex: number,
    toIndex: number,
    progress: number,
    direction: 1 | -1,
    time: number
  ) => {
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const safeFrom = Math.max(0, Math.min(1, fromIndex));
    const safeTo = Math.max(0, Math.min(1, toIndex));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sectionTextures[safeFrom]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sectionTextures[safeTo]);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, mudTexture);

    if (uTCurrent) gl.uniform1i(uTCurrent, 0);
    if (uTNext) gl.uniform1i(uTNext, 1);
    if (uTMudNormal) gl.uniform1i(uTMudNormal, 2);

    if (uProgress) gl.uniform1f(uProgress, progress);
    if (uDirection) gl.uniform1f(uDirection, direction);
    if (uTime) gl.uniform1f(uTime, time);
    if (uBlurIntensity) gl.uniform1f(uBlurIntensity, 1.0);
    if (uCurrentEdgeMultiplier) gl.uniform1f(uCurrentEdgeMultiplier, 1.15);
    if (uNextEdgeMultiplier) gl.uniform1f(uNextEdgeMultiplier, 1.15);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    try {
      sectionTextures.forEach((tex) => {
        if (gl.isTexture(tex)) gl.deleteTexture(tex);
      });
      if (gl.isTexture(mudTexture)) gl.deleteTexture(mudTexture);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      if (gl.isBuffer(buffer)) gl.deleteBuffer(buffer);
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
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      // Ignore errors if context already lost
    }
  };

  return { draw, resize, dispose };
}
