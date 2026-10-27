import mudNormalUrl from '../assets/images/mud_normal.jpg';
import texNoiseUrl from '../assets/images/tex_noise.jpg';
import heroImageUrl from '../assets/images/hero.png';

const ABOUT_PORTRAIT_URL = '/assets/aistudio/image_fbee149c.png';

export type TextureKey =
  | 'mudNormal'
  | 'texNoise'
  | 'energyWaveNoise'
  | 'section0'
  | 'section1'
  | 'section2'
  | 'section3';

/**
 * Pre-decodes an image using HTMLImageElement.decode() or createImageBitmap,
 * ensuring image decompression happens off the main compositor thread and pinning
 * the decoded bitmap in memory to prevent frame drops during transitions.
 */
async function preDecodeImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = async () => {
      if (img.decode) {
        try {
          await img.decode();
        } catch {
          // ignore decode errors on unsupported browsers
        }
      }
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Generates high-definition atmospheric textures for each portfolio section.
 * These textures provide the background palette, depth gradients, and atmospheric
 * luminance for the WebGL transition shader WITHOUT painting duplicate DOM text,
 * headers, or cards.
 */
function createSectionAtmosphericCanvas(sectionIndex: number): HTMLCanvasElement {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  if (sectionIndex === 0) {
    // ── SECTION 0: HOME ATMOSPHERE ──
    // Deep obsidian black gradient with subtle radial orb & vignette (pure white & black)
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
    bgGrad.addColorStop(1, '#000000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle monochrome ring aura
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.48, 360, 0, Math.PI * 2);
    ctx.stroke();

    // Geometric alignment markers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(width * 0.14, height * 0.2, 110, 110);
    ctx.strokeRect(width * 0.78, height * 0.62, 85, 85);
  } else if (sectionIndex === 1) {
    // ── SECTION 1: ABOUT ATMOSPHERE ──
    // Stark white editorial field with dark monochrome sphere void on the left
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const sphereGrad = ctx.createRadialGradient(
      width * 0.26,
      height * 0.5,
      30,
      width * 0.26,
      height * 0.5,
      520
    );
    sphereGrad.addColorStop(0, '#000000');
    sphereGrad.addColorStop(0.72, '#0c0c0c');
    sphereGrad.addColorStop(0.88, '#1e1e1e');
    sphereGrad.addColorStop(0.96, 'rgba(0, 0, 0, 0.15)');
    sphereGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sphereGrad;
    ctx.beginPath();
    ctx.arc(width * 0.26, height * 0.5, 520, 0, Math.PI * 2);
    ctx.fill();

    // Enso ink contour ring in crisp monochrome
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width * 0.26, height * 0.5, 410, 0, Math.PI * 2);
    ctx.stroke();
  } else if (sectionIndex === 2) {
    // ── SECTION 2: WORKS ATMOSPHERE ──
    // Deep monochrome black with subtle white energy lines
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020202');
    bgGrad.addColorStop(0.5, '#080808');
    bgGrad.addColorStop(1, '#020202');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle horizontal timeline guides in white
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.28);
    ctx.lineTo(width, height * 0.28);
    ctx.moveTo(0, height * 0.72);
    ctx.lineTo(width, height * 0.72);
    ctx.stroke();
  } else {
    // ── SECTION 3: CONTACT ATMOSPHERE ──
    // Stark white architectural canvas with minimal black lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.65, height * 0.28);
    ctx.lineTo(width, height * 0.28);
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width * 0.35, height * 0.75);
    ctx.stroke();

    // Subtle ambient watermarked symbol outline
    ctx.font = '800 480px sans-serif';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText('@', width * 0.5, height * 0.5);
  }

  return canvas;
}

/**
 * Procedural 256x256 multi-octave energy wave noise texture for fast GPU sampling
 * in the Works horizontal timeline energy wave effect.
 */
function createEnergyWaveNoiseCanvas(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // Multi-harmonic sine + pseudo-random noise lookup
      const fx = x / size;
      const fy = y / size;
      const wave1 = Math.sin(fx * Math.PI * 4.0) * 0.5 + 0.5;
      const wave2 = Math.cos(fy * Math.PI * 6.0) * 0.5 + 0.5;
      const noiseVal = Math.random() * 0.35 + (wave1 * 0.4 + wave2 * 0.25);
      const val = Math.min(255, Math.max(0, Math.round(noiseVal * 255)));

      data[idx] = val; // R
      data[idx + 1] = Math.round(val * 0.85); // G
      data[idx + 2] = 255; // B (violet bias)
      data[idx + 3] = 255; // A
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * TextureManager
 *
 * Pre-decodes and caches WebGL textures used for scroll transitions and the energy
 * wave effect in persistent GPU memory, preventing garbage collection stalls and
 * layout thrashing during continuous user scrolling.
 */
class TextureManager {
  private decodedImages = new Map<string, HTMLImageElement>();
  private glTextureCache = new WeakMap<
    WebGLRenderingContext | WebGL2RenderingContext,
    Map<string, WebGLTexture>
  >();
  private activeContexts = new Set<WebGLRenderingContext | WebGL2RenderingContext>();
  private preloadingPromise: Promise<void> | null = null;
  private isPreloaded = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Begin background decoding of image assets as early as possible
      this.preloadBitmaps();
    }
  }

  public async preloadBitmaps(): Promise<void> {
    if (this.preloadingPromise) return this.preloadingPromise;

    this.preloadingPromise = (async () => {
      const [mudImg, noiseImg, heroImg, aboutImg] = await Promise.all([
        preDecodeImage(mudNormalUrl),
        preDecodeImage(texNoiseUrl),
        preDecodeImage(heroImageUrl),
        preDecodeImage(ABOUT_PORTRAIT_URL),
      ]);

      if (mudImg) this.decodedImages.set('mudNormal', mudImg);
      if (noiseImg) this.decodedImages.set('texNoise', noiseImg);
      if (heroImg) this.decodedImages.set('hero', heroImg);
      if (aboutImg) this.decodedImages.set('aboutPortrait', aboutImg);

      this.isPreloaded = true;
    })();

    return this.preloadingPromise;
  }

  public async getOrInitContextTextures(
    gl: WebGLRenderingContext | WebGL2RenderingContext
  ): Promise<Map<string, WebGLTexture>> {
    let contextMap = this.glTextureCache.get(gl);
    if (contextMap) {
      return contextMap;
    }

    await this.preloadBitmaps();

    contextMap = new Map<string, WebGLTexture>();
    this.glTextureCache.set(gl, contextMap);
    this.activeContexts.add(gl);

    // 1. mudNormal texture
    const mudImg = this.decodedImages.get('mudNormal');
    if (mudImg) {
      const mudTex = this.createGLTexture(gl, mudImg, gl.REPEAT, gl.REPEAT);
      if (mudTex) contextMap.set('mudNormal', mudTex);
    }

    // 2. texNoise texture
    const noiseImg = this.decodedImages.get('texNoise');
    if (noiseImg) {
      const noiseTex = this.createGLTexture(gl, noiseImg, gl.REPEAT, gl.REPEAT);
      if (noiseTex) contextMap.set('texNoise', noiseTex);
    }

    // 3. Section atmospheric background textures (0..3)
    for (let i = 0; i <= 3; i++) {
      const canvas = createSectionAtmosphericCanvas(i);
      const tex = this.createGLTexture(gl, canvas, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
      if (tex) contextMap.set(`section${i}`, tex);
    }

    // 4. Energy wave noise texture
    const waveCanvas = createEnergyWaveNoiseCanvas();
    const waveTex = this.createGLTexture(gl, waveCanvas, gl.REPEAT, gl.REPEAT);
    if (waveTex) contextMap.set('energyWaveNoise', waveTex);

    return contextMap;
  }

  public createGLTexture(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    source: TexImageSource,
    wrapS: number,
    wrapT: number
  ): WebGLTexture | null {
    const texture = gl.createTexture();
    if (!texture) return null;

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

  public getTexture(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    key: string
  ): WebGLTexture | null {
    const contextMap = this.glTextureCache.get(gl);
    return contextMap?.get(key) ?? null;
  }

  public bindTexture(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    unit: number,
    key: string
  ): boolean {
    const texture = this.getTexture(gl, key);
    if (!texture) return false;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    return true;
  }

  public disposeContext(gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    const contextMap = this.glTextureCache.get(gl);
    if (contextMap) {
      contextMap.forEach((tex) => {
        try {
          if (gl.isTexture(tex)) {
            gl.deleteTexture(tex);
          }
        } catch {
          // ignore if context already lost
        }
      });
      contextMap.clear();
      this.glTextureCache.delete(gl);
    }
    this.activeContexts.delete(gl);
  }

  public disposeAll(): void {
    const contexts = Array.from(this.activeContexts);
    for (const gl of contexts) {
      this.disposeContext(gl);
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch {
        // ignore
      }
    }
    this.activeContexts.clear();
  }
}

export const textureManager = new TextureManager();
