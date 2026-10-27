import mudNormalUrl from '../assets/images/mud_normal.jpg';
import texNoiseUrl from '../assets/images/tex_noise.jpg';

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

/**
 * WebGL 2 Circular Mud-Normal Intro Reveal Shader
 * Ported from Silver Palace's circular intro shader (uIsCircle = 1 branch)
 * using mud_normal.jpg + tex_noise.jpg + hardware derivative contour etching (fwidth),
 * transitioning from a white (#ffffff) loading screen into the dark HomeSection.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;
uniform sampler2D tNoise;
uniform float uProgress;
uniform float uAspect;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uCurrentImageSize;
uniform vec2 uNextImageSize;

in vec2 vUv;
out vec4 outColor;

float sampleNoise(vec2 uv) {
  return texture(tNoise, uv).r * 2.0 - 1.0;
}

vec2 coverUv(vec2 uv, vec2 imageSize, vec2 viewportSize) {
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
  float rawProgress = clamp(uProgress, 0.0, 1.0);

  // Smooth progress curve matching Silver Palace circular intro mode
  float eased = smoothstep(0.0, 1.0, rawProgress);
  float progress = mix(eased, rawProgress, 0.25);

  // Center of circular expansion (viewport center with subtle pointer influence)
  vec2 sceneCenter = vec2(0.5, 0.5);
  vec2 maskCenter = mix(sceneCenter, uMouse, 0.06);

  // UV zoom centered on sceneCenter (from Silver Palace uIsCircle branch)
  vec2 currentUV =
    (uv - sceneCenter) * (1.0 - smoothstep(0.15, 1.0, rawProgress) * 0.12) +
    sceneCenter;
  vec2 nextUV =
    (uv - sceneCenter) * (1.0 + smoothstep(0.85, 0.0, rawProgress) * 0.12) +
    sceneCenter;

  vec2 currentSampleUV = coverUv(currentUV, uCurrentImageSize, uResolution);
  vec2 nextSampleUV = coverUv(nextUV, uNextImageSize, uResolution);

  vec4 currentSample = texture(tCurrent, currentSampleUV);
  vec4 nextSample = texture(tNext, nextSampleUV);

  // Mud normal offset (from Silver Palace mud_normal.B0pkdfRk.jpg)
  vec2 mudUv = vec2(uv.x * max(uAspect * 0.65, 1.0), uv.y);
  vec3 mudNormal = texture(tMudNormal, mudUv).rgb;
  float mudStrength = mix(
    0.22,
    0.42,
    0.5 + 0.5 * sin(uTime - uv.x * 10.0)
  );
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  // Pre-computed noise texture sample (tex_noise.C9rNlPPI.jpg)
  vec2 aspectUv = vec2(uv.x * uAspect, uv.y) + vec2(0.0, uTime * 0.02);
  float noiseSpeed = 0.07;
  float currentNoise = sampleNoise(aspectUv * 0.25 - uTime * noiseSpeed * 0.125);

  // Aspect-corrected circular radial distance from center (0 at center, 1 at furthest corners)
  float maxRadius = length(vec2(0.5 * uAspect, 0.5));
  float circularDist =
    length((uv - maskCenter) * vec2(uAspect, 1.0)) / max(maxRadius, 0.001);

  // Circular threshold perturbed by mud_normal and noise:
  // At uProgress = 0 -> threshold > 0 everywhere (100% white loading screen)
  // As uProgress increases -> circle expands radially from center (circularDist = 0) outward
  // At uProgress = 1 -> threshold < sweep everywhere (100% revealed HomeSection)
  float threshold =
    circularDist * 0.78 +
    0.15 +
    mudOffset * 0.52 +
    currentNoise * 0.04;

  // Sweep goes from 0.0 to 1.14 so progress=0 is completely unrevealed and progress=1 clears all corners
  float sweep = progress * 1.14;
  float edge = sweep - threshold;
  float edgeDist = abs(edge);
  float edgeProximity = 1.0 - smoothstep(0.0, 0.26, edgeDist);

  // Hardware derivative contour detection (fwidth on luminance)
  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (rawProgress > 0.005 && rawProgress < 0.995) {
    float currentLuma = dot(currentSample.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(
      fwidth(currentLuma) *
      mix(5.5, 11.0, progress) *
      edgeProximity
    );

    float nextLuma = dot(nextSample.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(
      fwidth(nextLuma) *
      mix(4.5, 8.5, 1.0 - progress) *
      edgeProximity
    );
  }

  // Crisp anti-aliased circular boundary
  float aa = max(fwidth(edge) * 2.5, 0.0015);
  float blendFactor = smoothstep(-aa, aa, edge);

  // Outside the expanding circle (blendFactor = 0):
  // Pure white (#ffffff) loading background with dark etched contour lines near the circular rim
  float outerEdgeBand = (1.0 - smoothstep(0.0, 0.14, edgeDist)) *
    smoothstep(0.01, 0.2, rawProgress);
  float darkContour = clamp(currentEdges.r * outerEdgeBand * 0.85, 0.0, 0.88);
  vec3 outerColor = vec3(1.0 - darkContour);
  float outerAlpha = 1.0;

  // Inside the expanding circle (blendFactor = 1):
  // Near the circular wavefront (edge in [0, 0.20]), show Silver Palace's dark etched contour band
  // with white wireframe lines (nextEdges), dissolving smoothly into the live HomeSection (alpha = 0)
  float innerBand = (1.0 - smoothstep(0.0, 0.18, max(edge, 0.0))) *
    (1.0 - smoothstep(0.82, 0.98, rawProgress));
  vec3 innerWireframe = clamp(nextEdges * 1.35, 0.0, 1.0);
  float innerAlpha = clamp(innerBand * 0.78 + innerWireframe.r * innerBand * 0.22, 0.0, 1.0);
  vec3 innerPremult = innerWireframe * innerAlpha;

  // Luminous rim right on the jagged mud_normal circular boundary
  float transitionActive =
    smoothstep(0.01, 0.06, rawProgress) *
    (1.0 - smoothstep(0.92, 1.0, rawProgress));
  float rimFactor = 1.0 - smoothstep(0.0, 0.008, edgeDist);
  float rimGlow = rimFactor * transitionActive;

  vec3 basePremult = mix(outerColor * outerAlpha, innerPremult, blendFactor);
  float baseAlpha = mix(outerAlpha, innerAlpha, blendFactor);

  // Brighten the circular wavefront rim
  vec3 finalPremult = mix(basePremult, vec3(1.0), rimGlow * 0.9);
  float finalAlpha = max(baseAlpha, rimGlow * 0.9);

  // Ensure complete transparency at the end of the reveal
  float endFade = 1.0 - smoothstep(0.96, 1.0, rawProgress);
  outColor = vec4(finalPremult * endFade, finalAlpha * endFade);
}`;

export type IntroRevealRenderer = {
  draw: (progress: number, time: number) => void;
  resize: () => void;
  dispose: () => void;
};

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create intro reveal shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? 'Unable to compile intro reveal shader.');
  }

  return shader;
}

function requiredUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Missing intro reveal uniform: ${name}`);
  return location;
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${source}`));
    image.src = source;
  });
}

/**
 * Builds high-contrast reference canvases for tCurrent and tNext so hardware
 * derivatives fwidth(currentLuma) and fwidth(nextLuma) produce crisp contour
 * etching along the expanding circular mud_normal boundary.
 */
function createLuminanceCanvas(
  isWhiteBg: boolean
): HTMLCanvasElement {
  const width = 1600;
  const height = 1000;
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return offscreen;

  if (isWhiteBg) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  } else {
    // Deep obsidian black gradient matching HomeSection #020202
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.48,
      80,
      width * 0.5,
      height * 0.48,
      width * 0.65
    );
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.45, '#040404');
    bgGrad.addColorStop(1, '#020202');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  return offscreen;
}

function createTextureFromSource(
  gl: WebGL2RenderingContext,
  source: TexImageSource,
  unit: number,
  wrapMode: number
): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error('Unable to create intro reveal texture.');

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  return texture;
}

export async function createIntroRevealRenderer(
  canvas: HTMLCanvasElement
): Promise<IntroRevealRenderer> {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  if (!gl) throw new Error('WebGL 2 is unavailable.');

  const [mudImage, noiseImage] = await Promise.all([
    loadImage(mudNormalUrl),
    loadImage(texNoiseUrl),
  ]);

  const currentCanvas = createLuminanceCanvas(true);
  const nextCanvas = createLuminanceCanvas(false);

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create intro reveal program.');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      gl.getProgramInfoLog(program) ?? 'Unable to link intro reveal program.'
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

  const textures = [
    createTextureFromSource(gl, currentCanvas, 0, gl.CLAMP_TO_EDGE),
    createTextureFromSource(gl, nextCanvas, 1, gl.CLAMP_TO_EDGE),
    createTextureFromSource(gl, mudImage, 2, gl.REPEAT),
    createTextureFromSource(gl, noiseImage, 3, gl.REPEAT),
  ];

  gl.uniform1i(requiredUniform(gl, program, 'tCurrent'), 0);
  gl.uniform1i(requiredUniform(gl, program, 'tNext'), 1);
  gl.uniform1i(requiredUniform(gl, program, 'tMudNormal'), 2);
  gl.uniform1i(requiredUniform(gl, program, 'tNoise'), 3);

  const uProgress = requiredUniform(gl, program, 'uProgress');
  const uAspect = requiredUniform(gl, program, 'uAspect');
  const uTime = requiredUniform(gl, program, 'uTime');
  const uResolution = requiredUniform(gl, program, 'uResolution');
  const uMouse = requiredUniform(gl, program, 'uMouse');
  const uCurrentImageSize = requiredUniform(gl, program, 'uCurrentImageSize');
  const uNextImageSize = requiredUniform(gl, program, 'uNextImageSize');

  gl.uniform2f(uCurrentImageSize, currentCanvas.width, currentCanvas.height);
  gl.uniform2f(uNextImageSize, nextCanvas.width, nextCanvas.height);
  gl.uniform2f(uMouse, 0.5, 0.5);

  const handleMouseMove = (event: MouseEvent) => {
    const x = event.clientX / Math.max(window.innerWidth, 1);
    const y = 1.0 - event.clientY / Math.max(window.innerHeight, 1);
    gl.useProgram(program);
    gl.uniform2f(uMouse, x, y);
  };
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uAspect, width / Math.max(height, 1));
  };

  const draw = (progress: number, time: number) => {
    resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uProgress, progress);
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    try {
      window.removeEventListener('mousemove', handleMouseMove);
      textures.forEach((texture) => {
        if (texture && gl.isTexture(texture)) {
          gl.deleteTexture(texture);
        }
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      if (gl.isBuffer(buffer)) {
        gl.deleteBuffer(buffer);
      }
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
      // Ignore errors on teardown
    }
  };

  draw(0, 0);
  return { draw, resize, dispose };
}
