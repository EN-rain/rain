import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  createIntroRevealRenderer,
  type IntroRevealRenderer,
} from '../scene/IntroRevealRenderer';

type LoadingScreenProps = {
  progress: number;
  statusText?: string;
  isComplete: boolean;
  onRevealStart?: () => void;
  onComplete: () => void;
};

const VS = `attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.0,1.0);}`;
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v;
uniform sampler2D tex;
uniform vec2 res,hole;
uniform float vp,swirl,dsp,dur,rmax,sink,lensE,tm,vR;
float tauOf(float r0){return clamp((vp-r0/rmax*dsp)/dur,0.0,1.0);}
float fr(float r0){float t=tauOf(r0);return sink+(r0-sink)*pow(1.0-pow(t,1.5),1.8);}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.0;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(17.3,9.1);a*=.5;}return s;}
void main(){
  vec2 pix0=vec2(v.x*.5+.5,.5-v.y*.5)*res;
  vec2 d0=pix0-hole;float r00=length(d0);
  vec2 pix=pix0;
  if(r00>1.0&&lensE>1.0){float rs=r00-lensE*lensE/r00;pix=hole+d0/r00*rs;}
  vec2 d=pix-hole;float r=length(d);
  float ta=0.0;
  if(r>=sink){
    float lo=sink,hi=rmax*1.05;
    for(int i=0;i<16;i++){float m=.5*(lo+hi);if(fr(m)<r)lo=m;else hi=m;}
    float r0=.5*(lo+hi);
    if(abs(fr(r0)-r)<=1.5){
      float t=tauOf(r0);
      float th=atan(d.y,d.x)-swirl*(.35*t+1.4*pow(t,2.6));
      vec2 rad=vec2(cos(th),sin(th)),tan_=vec2(-rad.y,rad.x);
      vec2 P=hole+rad*r0;
      float sl=clamp(r0/r,1.0,14.0);
      float a=0.0;
      for(int i=-3;i<=3;i++){
        vec2 q=P+tan_*(float(i)*sl/6.0);
        vec2 uv=q/res;
        a+=(uv.x>=0.0&&uv.x<=1.0&&uv.y>=0.0&&uv.y<=1.0)?texture2D(tex,uv).a:0.0;
      }
      ta=a/7.0*(1.0-smoothstep(.8,1.0,t));
    }
  }
  gl_FragColor=vec4(0.0,0.0,0.0,ta);
}`;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 4),
  io: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t),
};

const LOAD = 1800;
const SUCT = 2300;
const SH = 620;
const EARLY = 540;
const COLL = SH - EARLY;

interface MeshItem {
  s: HTMLCanvasElement;
  x: number;
  y: number;
  ox: number;
  oy: number;
  w: number;
  h: number;
  isCounter?: boolean;
  isBar?: boolean;
  isRule?: boolean;
}

export const LoadingScreen = ({
  progress,
  statusText,
  isComplete,
  onRevealStart,
  onComplete,
}: LoadingScreenProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  // Singularity canvases (#c, #g, #o)
  const cvRef = useRef<HTMLCanvasElement>(null);
  const gcRef = useRef<HTMLCanvasElement>(null);
  const ovRef = useRef<HTMLCanvasElement>(null);

  const rendererRef = useRef<IntroRevealRenderer | null>(null);
  const rendererPromiseRef = useRef<Promise<IntroRevealRenderer | null> | null>(null);

  // Store props and callbacks in refs so rendering loops always read current values
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const statusTextRef = useRef(statusText);
  statusTextRef.current = statusText;
  const isCompleteRef = useRef(isComplete);
  isCompleteRef.current = isComplete;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onRevealStartRef = useRef(onRevealStart);
  onRevealStartRef.current = onRevealStart;

  const [singularityDone, setSingularityDone] = useState(false);

  // 1. Initialize Original Git Circular Mud-Normal Reveal Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;

    const initPromise = createIntroRevealRenderer(canvas)
      .then((renderer) => {
        if (disposed) {
          renderer.dispose();
          return null;
        }
        rendererRef.current = renderer;
        renderer.draw(0, 0);
        return renderer;
      })
      .catch(() => null);

    rendererPromiseRef.current = initPromise;

    const handleResize = () => {
      rendererRef.current?.resize();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  // 2. Clean LOADING Text + Animated Loading Lines -> Blackhole Tidal Spaghettification
  useEffect(() => {
    const cv = cvRef.current;
    const gc = gcRef.current;
    const ov = ovRef.current;
    if (!cv || !gc || !ov) return;

    const ctx = cv.getContext('2d');
    const octx = ov.getContext('2d');
    const gl = gc.getContext('webgl', {
      premultipliedAlpha: false,
      alpha: true,
      antialias: false,
    });
    if (!ctx || !octx || !gl) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let gs = Math.min(dpr, 1.5);
    let cx = W / 2;
    let cy = H / 2;
    let hx = cx;
    let hy = cy;
    let thx = cx;
    let thy = cy;
    let meshes: MeshItem[] = [];
    let layoutBw = 0;
    let layoutBy = 0;
    let layoutTopRuleY = 0;
    let layoutBotRuleY = 0;
    let layoutMaxR = 400;
    let counter: { font: string; y: number } | null = null;
    let T = 0;
    let last = 0;
    let phaseName = '';
    let layer: HTMLCanvasElement | null = null;
    let layerAll: HTMLCanvasElement | null = null;
    let vrot = 0;
    let pm = 0;
    let rafId = 0;
    let disposed = false;

    const swirl = 3.4;
    const stretch = 3.0;
    const speed = 1.0;

    let prog: WebGLProgram | null = null;
    let tex: WebGLTexture | null = null;
    let vbo: WebGLBuffer | null = null;
    const loc: Record<string, WebGLUniformLocation | null> = {};
    let locP = 0;

    function initGL() {
      if (!gl) return;
      const sh = (t: number, s: string) => {
        const o = gl.createShader(t)!;
        gl.shaderSource(o, s);
        gl.compileShader(o);
        return o;
      };
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      locP = gl.getAttribLocation(prog, 'p');
      ['tex', 'res', 'hole', 'vp', 'swirl', 'dsp', 'dur', 'rmax', 'sink', 'lensE', 'tm', 'vR'].forEach(
        (n) => (loc[n] = gl.getUniformLocation(prog!, n))
      );
      vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(locP);
      gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.disable(gl.BLEND);
    }

    function uploadTex() {
      if (!gl || !tex || !layerAll) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layerAll);
    }

    function drawGL(vp: number, sw: number, st: number, holeR: number) {
      if (!gl || !prog || !tex) return;
      const dsp = Math.min(0.9, 0.45 + 0.18 * (st - 1));
      const dur = 1 - dsp;
      const rmax = layoutMaxR;
      gl.useProgram(prog);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc.tex, 0);
      gl.uniform2f(loc.res, W, H);
      gl.uniform2f(loc.hole, hx, hy);
      gl.uniform1f(loc.vp, vp);
      gl.uniform1f(loc.swirl, sw);
      gl.uniform1f(loc.dsp, dsp);
      gl.uniform1f(loc.dur, dur);
      gl.uniform1f(loc.rmax, rmax);
      gl.uniform1f(loc.sink, Math.max(3, holeR * 0.2));
      gl.uniform1f(loc.lensE, holeR * 0.95);
      gl.uniform1f(loc.tm, vrot);
      gl.uniform1f(loc.vR, holeR);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function sprite(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
      const o = document.createElement('canvas');
      o.width = Math.max(4, Math.ceil(w * dpr));
      o.height = Math.max(4, Math.ceil(h * dpr));
      const c = o.getContext('2d')!;
      c.scale(dpr, dpr);
      draw(c);
      return o;
    }

    function add(item: Omit<MeshItem, 'ox' | 'oy'>) {
      meshes.push({ ...item, ox: item.x, oy: item.y });
    }

    function text(
      str: string,
      x: number,
      y: number,
      font: string,
      align: 'left' | 'center' | 'right' = 'left',
      track = 0,
      extra: Record<string, boolean> = {}
    ) {
      if (!ctx) return x;
      ctx.save();
      ctx.font = font;
      const ch = [...str];
      const ws = ch.map((c) => ctx.measureText(c).width);
      ctx.restore();
      const total = ws.reduce((a, b) => a + b, 0) + Math.max(0, ch.length - 1) * track;
      let px = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      const startX = px;
      const match = font.match(/(\d+(?:\.\d+)?)px/);
      const fs = match ? parseFloat(match[1]) : 14;
      const h = Math.ceil(fs * 1.35);
      ch.forEach((c, i) => {
        if (c !== ' ') {
          const w = Math.ceil(ws[i] + fs * 0.3);
          const s = sprite(w, h, (g) => {
            g.font = font;
            g.fillStyle = '#0a0a0a';
            g.textBaseline = 'middle';
            g.textAlign = 'center';
            g.fillText(c, w / 2, h / 2);
          });
          add({ s, x: px + ws[i] / 2, y, w, h, ...extra });
        }
        px += ws[i] + track;
      });
      return startX;
    }

    function rule(x1: number, x2: number, y: number, th: number, extra: Record<string, boolean> = {}) {
      const n = 28;
      const pw = (x2 - x1) / n;
      for (let i = 0; i < n; i++) {
        const w = Math.ceil(pw + 2);
        const h = Math.ceil(th + 4);
        const s = sprite(w, h, (g) => {
          g.fillStyle = '#0a0a0a';
          g.fillRect(0, 2, w, th);
        });
        add({ s, x: x1 + (i + 0.5) * pw, y, w, h, isRule: true, ...extra });
      }
    }

    function build() {
      if (!cv) return;
      meshes = [];

      // Match git LoadingScreen.tsx typography & layout:
      // 1. Clean "LOADING" heading in Sora with wide 0.3em tracking
      const headingSize = Math.min(60, Math.max(32, W * 0.048));
      const headingTrack = Math.round(headingSize * 0.3);
      const headingFont = `600 ${headingSize}px "Sora", sans-serif`;
      const headingY = cy - 32;

      text('LOADING', cx, headingY, headingFont, 'center', headingTrack);

      // 2. Main loading progress line + animated upper/lower framing lines
      const bw = Math.min(560, W - 56);
      const by = cy + 22;
      const topRuleY = cy - 88;
      const botRuleY = cy + 96;

      // Bake full-length lines into `isBar: true` so `layerAll` (for WebGL suction) has them all
      rule(cx - bw / 2, cx + bw / 2, by, 2.5, { isBar: true });
      rule(cx - bw * 0.38, cx + bw * 0.38, topRuleY, 1.2, { isBar: true });
      rule(cx - bw * 0.24, cx + bw * 0.24, botRuleY, 1.2, { isBar: true });

      // 3. Percentage counter in IBM Plex Mono below the main progress line
      const pctFont = `500 12px "IBM Plex Mono", monospace`;
      const pctY = by + 28;
      text('100%', cx, pctY, pctFont, 'center', 2.4, { isCounter: true });

      counter = {
        font: pctFont,
        y: pctY,
      };
      layoutBw = bw;
      layoutBy = by;
      layoutTopRuleY = topRuleY;
      layoutBotRuleY = botRuleY;
      layoutMaxR = Math.hypot(bw * 0.55, 110) + 48;

      const mk = (skipDynamic: boolean) => {
        const c = document.createElement('canvas');
        c.width = cv.width;
        c.height = cv.height;
        const g = c.getContext('2d')!;
        g.scale(dpr, dpr);
        for (const m of meshes) {
          if (skipDynamic && (m.isCounter || m.isBar)) continue;
          g.drawImage(m.s, m.ox - m.w / 2, m.oy - m.h / 2, m.w, m.h);
        }
        return c;
      };
      layer = mk(true);
      layerAll = mk(false);
      uploadTex();
    }

    function resize() {
      if (!cv || !ov || !gc || !ctx || !octx || !gl) return;
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      gs = Math.min(dpr, 1.5);
      for (const c of [cv, ov]) {
        c.width = Math.floor(W * dpr);
        c.height = Math.floor(H * dpr);
      }
      gc.width = Math.floor(W * gs);
      gc.height = Math.floor(H * gs);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gl.viewport(0, 0, gc.width, gc.height);
      cx = W / 2;
      cy = H / 2;
      hx = thx = cx;
      hy = thy = cy;
      build();
    }

    function loading(progVal: number, alpha: number, slide: number, timeMs: number, statusStr?: string) {
      if (!ctx || !layer || !counter) return;
      const pct = Math.min(100, Math.max(0, Math.floor(progVal)));
      const str = `${pct}%`;
      const ratio = clamp(progVal / 100);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(0, slide);

      // Draw static "LOADING" heading
      ctx.drawImage(layer, 0, 0, W, H);

      // 1. Main loading line track & animated progress fill
      const barLeft = cx - layoutBw / 2;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.12)';
      ctx.fillRect(barLeft, layoutBy - 1, layoutBw, 2.2);

      const fillW = layoutBw * ratio;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(barLeft, layoutBy - 1, fillW, 2.2);

      // Subtle traveling pulse line along the active track
      const scanPos = ((timeMs * 0.0014) % 1) * layoutBw;
      const scanW = Math.min(64, layoutBw * 0.18);
      const scanX = Math.max(barLeft, Math.min(barLeft + layoutBw - scanW, barLeft + scanPos - scanW / 2));
      ctx.fillStyle = 'rgba(10, 10, 10, 0.28)';
      ctx.fillRect(scanX, layoutBy - 1, scanW, 2.2);

      // 2. Upper & lower animated framing lines expanding from center
      const topHalfW = layoutBw * 0.38 * E.out(ratio);
      if (topHalfW > 1) {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.55)';
        ctx.fillRect(cx - topHalfW, layoutTopRuleY - 0.5, topHalfW * 2, 1.2);
        // End ticks
        ctx.fillRect(cx - topHalfW, layoutTopRuleY - 3, 1.2, 6);
        ctx.fillRect(cx + topHalfW - 1.2, layoutTopRuleY - 3, 1.2, 6);
      }

      const botHalfW = layoutBw * 0.24 * E.out(ratio);
      if (botHalfW > 1) {
        ctx.fillStyle = 'rgba(10, 10, 10, 0.45)';
        ctx.fillRect(cx - botHalfW, layoutBotRuleY - 0.5, botHalfW * 2, 1.2);
      }

      // 3. Percentage text centered below the loading line
      ctx.font = counter.font;
      ctx.fillStyle = 'rgba(10, 10, 10, 0.72)';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(str.split('').join(' '), cx, counter.y);

      // 4. Clean status indicator text
      if (statusStr) {
        ctx.font = '500 10.5px "IBM Plex Mono", monospace';
        ctx.fillStyle = 'rgba(10, 10, 10, 0.42)';
        ctx.letterSpacing = '0.08em';
        ctx.fillText(statusStr.toUpperCase(), cx, counter.y + 22);
      }

      ctx.restore();
    }

    function drawHole(R: number) {
      if (!octx) return;
      octx.fillStyle = '#000';
      octx.beginPath();
      octx.arc(hx, hy, R, 0, 6.2832);
      octx.fill();
    }

    let displayProgress = 0;
    let loadingTime = 0;
    let suctionTime = 0;
    let isSuctionStarted = false;
    let completeHoldTimer = 0;

    function frame(now: number) {
      if (disposed || !ctx || !octx || !gl) return;
      const dt = Math.min(64, now - last || 16);
      last = now;

      hx += (thx - hx) * 0.12;
      hy += (thy - hy) * 0.12;

      let ph = 'LOADING';

      if (!isSuctionStarted) {
        loadingTime += dt;
        const target = Math.min(100, Math.max(0, progressRef.current));
        // Smoothly animate towards target progress with responsive ease
        displayProgress += (target - displayProgress) * 0.14;

        if (isCompleteRef.current && displayProgress >= 99.4) {
          displayProgress = 100;
          completeHoldTimer += dt;
          if (completeHoldTimer >= 180) {
            isSuctionStarted = true;
          }
        }
        ph = 'LOADING';
      } else {
        suctionTime += dt;
        if (suctionTime < SUCT) {
          ph = 'SUCTION';
        } else if (suctionTime < SUCT + COLL) {
          ph = 'COLLAPSING';
        } else {
          ph = 'DONE';
        }
      }

      phaseName = ph;

      ctx.clearRect(0, 0, W, H);
      octx.clearRect(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      let hole = 0;
      if (ph === 'LOADING') {
        const a = E.out(clamp(loadingTime / 450));
        vrot = 0;
        pm = 0;
        loading(displayProgress, a, 16 * (1 - a), loadingTime, statusTextRef.current);
      } else {
        const ts = suctionTime;
        if (ph === 'SUCTION') {
          const u = clamp((ts - 40) / (SUCT - 40));
          const vp = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          hole =
            (42 * E.sine(clamp(ts / 550)) + 16 * vp) *
            (1 - E.sine(clamp((ts - (SUCT - EARLY)) / SH)));
          const dsp = Math.min(0.9, 0.45 + 0.18 * (stretch - 1));
          const tv = clamp(vp / (1 - dsp + 0.3 * dsp));
          const m = swirl * (0.35 * tv + 1.4 * Math.pow(tv, 2.6)) * speed;
          vrot += Math.max(m - pm, dt * 0.0006 * speed);
          pm = m;
          drawGL(vp, swirl, stretch, hole);
        } else if (ph === 'COLLAPSING') {
          hole = 58 * (1 - E.sine(clamp((ts - (SUCT - EARLY)) / SH)));
          vrot += dt * 0.0006 * speed;
        }
      }

      if (hole > 0.2) {
        drawHole(hole);
      }

      if (ph === 'DONE' && hole <= 0.2) {
        setSingularityDone(true);
        return;
      }

      rafId = requestAnimationFrame(frame);
    }

    let rt: number;
    const onResize = () => {
      clearTimeout(rt);
      rt = window.setTimeout(resize, 120);
    };
    window.addEventListener('resize', onResize);

    initGL();
    Promise.all([
      document.fonts?.load('600 48px "Sora"'),
      document.fonts?.load('500 12px "IBM Plex Mono"'),
    ])
      .catch(() => {})
      .then(() => {
        if (disposed) return;
        resize();
        rafId = requestAnimationFrame(frame);
      });

    return () => {
      disposed = true;
      clearTimeout(rt);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
      if (gl) {
        if (tex) gl.deleteTexture(tex);
        if (vbo) gl.deleteBuffer(vbo);
        if (prog) gl.deleteProgram(prog);
      }
    };
  }, []);

  // 3. Exact Git Reveal Effect After Blackhole Collapse
  useEffect(() => {
    if (!isComplete || !singularityDone) return;

    let cancelled = false;
    let rafId: number | null = null;
    let tween: gsap.core.Timeline | null = null;

    const startReveal = async () => {
      const renderer =
        rendererRef.current ?? (await rendererPromiseRef.current) ?? null;
      if (cancelled) return;

      const container = containerRef.current;
      const ui = uiRef.current;
      const homeEl = document.querySelector<HTMLElement>('#home .home-section');

      // Fallback if WebGL2 is unavailable
      if (!renderer) {
        tween = gsap.timeline({
          onComplete: () => {
            if (!cancelled) onCompleteRef.current();
          },
        });
        tween.call(() => {
          if (!cancelled) onRevealStartRef.current?.();
        }, [], 0.4);
        if (ui) {
          tween.to(ui, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0);
        }
        if (container) {
          tween.to(container, { opacity: 0, duration: 0.75, ease: 'power2.inOut' }, 0.15);
        }
        return;
      }

      const state = { progress: 0 };
      let shaderTime = 0;
      let halfwayTriggered = false;

      // Guarantee opaque white frame is drawn on WebGL2 reveal canvas before container goes transparent
      renderer.resize();
      renderer.draw(0, 0);

      const tick = () => {
        if (cancelled) return;
        shaderTime += 0.01;
        if (!halfwayTriggered && state.progress >= 0.5) {
          halfwayTriggered = true;
          onRevealStartRef.current?.();
        }
        renderer.draw(state.progress, shaderTime);
        if (state.progress < 1) {
          rafId = window.requestAnimationFrame(tick);
        }
      };

      // Switch container background to transparent so the premultiplied-alpha
      // WebGL canvas controls the reveal from white (#ffffff) over the live HomeSection
      if (container) {
        container.style.background = 'transparent';
        container.style.pointerEvents = 'none';
      }

      if (homeEl) {
        gsap.set(homeEl, { scale: 1.12, transformOrigin: 'center center' });
      }

      rafId = window.requestAnimationFrame(tick);

      tween = gsap.timeline({
        onComplete: () => {
          if (rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
          if (homeEl) {
            gsap.set(homeEl, { clearProps: 'scale,transformOrigin' });
          }
          if (!cancelled) {
            onCompleteRef.current();
          }
        },
      });

      if (ui) {
        tween.to(
          ui,
          {
            opacity: 0,
            scale: 0.96,
            duration: 0.24,
            ease: 'power2.out',
          },
          0
        );
      }

      tween.to(
        state,
        {
          progress: 1,
          duration: 1.65,
          ease: 'none',
        },
        0.06
      );

      if (homeEl) {
        tween.to(
          homeEl,
          {
            scale: 1,
            duration: 1.65,
            ease: 'power2.out',
          },
          0.06
        );
      }
    };

    void startReveal();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      tween?.kill();
    };
  }, [isComplete, singularityDone]);

  return (
    <div
      ref={containerRef}
      className="loading-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        background: '#ffffff',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      {/* Original Git Circular Mud-Normal Reveal WebGL2 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Singularity // Tidal Spaghettification Canvases (#c, #g, #o) */}
      <div
        ref={uiRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <canvas
          ref={cvRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: 0,
          }}
        />
        <canvas
          ref={gcRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: 1,
          }}
        />
        <canvas
          ref={ovRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            zIndex: 2,
          }}
        />
      </div>
    </div>
  );
};
