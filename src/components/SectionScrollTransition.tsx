import React, { useEffect, useRef, memo } from 'react';
import {
  createSectionScrollRenderer,
  type SectionScrollRenderer,
} from '../scene/SectionScrollRenderer';

export interface SectionTransitionEventDetail {
  active: boolean;
  fromIndex: number;
  toIndex: number;
  progress: number;
  direction: 1 | -1;
}

const SECTION_META = [
  { number: '01', name: 'HOME' },
  { number: '02', name: 'CONTACTS' },
] as const;

const DEG = Math.PI / 180;

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

type V3 = [number, number, number];
type V2 = [number, number];

function rotAroundAxis(p: V3, a: V3, b: V3, theta: number): V3 {
  if (Math.abs(theta) < 1e-6) return [p[0], p[1], p[2]];
  const ux0 = b[0] - a[0], uy0 = b[1] - a[1], uz0 = b[2] - a[2];
  const len = Math.hypot(ux0, uy0, uz0);
  if (len < 1e-8) return [p[0], p[1], p[2]];
  const ux = ux0 / len, uy = uy0 / len, uz = uz0 / len;
  const px = p[0] - a[0], py = p[1] - a[1], pz = p[2] - a[2];
  const c = Math.cos(theta), s = Math.sin(theta);
  const dot = ux * px + uy * py + uz * pz;
  const cx = uy * pz - uz * py, cy = uz * px - ux * pz, cz = ux * py - uy * px;
  return [
    px * c + cx * s + ux * dot * (1 - c) + a[0],
    py * c + cy * s + uy * dot * (1 - c) + a[1],
    pz * c + cz * s + uz * dot * (1 - c) + a[2],
  ];
}

function rotX(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
}

function rotY(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

function rotZ(p: V3, a: number): V3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}

function norm3(v: V3): V3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

const CELL_OPS: number[][] = [[], [5], [3, 5], [3], [2, 3], [2, 3, 5], [2, 5], [2]];

interface CellData {
  poly: V2[];
  kinds: (string | number)[];
  ops: number[];
  ha: [number, number];
  hb: [number, number];
}

let cellCache: { key: string; cells: CellData[] } | null = null;

function clipKeep(poly: V2[], f: (q: V2) => number): V2[] {
  const out: V2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) {
      const t = fa / (fa - fb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

function hingeIdx(poly: V2[], ang: number, W: number, H: number): [number, number] {
  const sn = Math.sin(ang), cs = Math.cos(ang);
  const t = Math.min(sn > 1e-9 ? W / sn : Infinity, cs > 1e-9 ? H / cs : Infinity);
  const target: V2[] = [[0, 0], [t * sn, t * cs]];
  const res = target.map((tp) => {
    let bi = -1, bd = Infinity;
    for (let k = 0; k < poly.length; k++) {
      const dd = Math.hypot(poly[k][0] - tp[0], poly[k][1] - tp[1]);
      if (dd < bd) { bd = dd; bi = k; }
    }
    return bd < 1e-4 * W ? bi : -1;
  });
  return [res[0], res[1]];
}

function buildCells(W: number, H: number): CellData[] {
  const key = `${W}:${H}`;
  if (cellCache && cellCache.key === key) return cellCache.cells;
  const cells: CellData[] = [];
  const eps = 1e-6 * W;
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 16, b = ((i + 1) * Math.PI) / 16;
    let poly: V2[] = [[0, 0], [W, 0], [W, H], [0, H]];
    poly = clipKeep(poly, (q) => q[0] * Math.cos(a) - q[1] * Math.sin(a));
    poly = clipKeep(poly, (q) => -(q[0] * Math.cos(b) - q[1] * Math.sin(b)));
    const kinds: (string | number)[] = [];
    for (let j = 0; j < poly.length; j++) {
      const p0 = poly[j], p1 = poly[(j + 1) % poly.length];
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      let kind: string | number;
      if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < eps) kind = 'none';
      else if (mx < eps) kind = 'spine';
      else if (Math.abs(mx - W) < eps || my < eps || Math.abs(my - H) < eps) kind = 'edge';
      else kind = Math.round(Math.atan2(mx, my) / (Math.PI / 16));
      kinds.push(kind);
    }
    cells.push({
      poly,
      kinds,
      ops: CELL_OPS[i],
      ha: hingeIdx(poly, a, W, H),
      hb: hingeIdx(poly, b, W, H),
    });
  }
  cellCache = { key, cells };
  return cells;
}

function clipPoly(subject: V2[], clip: V2[]): V2[] {
  let out = subject;
  const m = clip.length;
  for (let e = 0; e < m && out.length; e++) {
    const a = clip[e], b = clip[(e + 1) % m];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const p = input[i], q = input[(i + 1) % input.length];
      const dp = ex * (p[1] - a[1]) - ey * (p[0] - a[0]);
      const dq = ex * (q[1] - a[1]) - ey * (q[0] - a[0]);
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) {
        const t = dp / (dp - dq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
  }
  return out;
}

interface FacetItem {
  pts: V2[];
  uvs: V2[];
  kinds: (string | number)[];
  sortZ: number;
  ndotl: number;
  pn: V3;
  p0: V3;
  isFolded: boolean;
}

function planeDepthAt(it: FacetItem, sx: number, sy: number, cx: number, cy: number, fov: number): number | null {
  const u = sx - cx, v = sy - cy, n = it.pn, w = it.p0;
  const den = (n[0] * u) / fov + (n[1] * v) / fov - n[2];
  if (Math.abs(den) < 1e-9) return null;
  const s = (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] - n[2] * fov) / den;
  return fov - s;
}

function orderByDepth(items: FacetItem[], cx: number, cy: number, fov: number): FacetItem[] {
  const n = items.length;
  const info = items.map((it) => {
    const P = it.pts, k = P.length;
    let area = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < k; i++) {
      const a = P[i], b = P[(i + 1) % k];
      area += a[0] * b[1] - b[0] * a[1];
      if (a[0] < minX) minX = a[0];
      if (a[0] > maxX) maxX = a[0];
      if (a[1] < minY) minY = a[1];
      if (a[1] > maxY) maxY = a[1];
    }
    return {
      poly: area >= 0 ? P : P.slice().reverse(),
      area: Math.abs(area) / 2,
      minX,
      maxX,
      minY,
      maxY,
    };
  });

  const adj: number[][] = [];
  const indeg = new Array(n).fill(0);
  for (let i = 0; i < n; i++) adj.push([]);

  for (let i = 0; i < n; i++) {
    const A = info[i];
    if (A.area < 1e-3) continue;
    for (let j = i + 1; j < n; j++) {
      const B = info[j];
      if (B.area < 1e-3) continue;
      if (A.maxX <= B.minX || B.maxX <= A.minX || A.maxY <= B.minY || B.maxY <= A.minY) continue;
      const c = clipPoly(A.poly, B.poly);
      if (c.length < 3) continue;
      let ar = 0, gx = 0, gy = 0;
      for (let k = 0; k < c.length; k++) {
        const p = c[k], q = c[(k + 1) % c.length];
        const cr = p[0] * q[1] - q[0] * p[1];
        ar += cr;
        gx += (p[0] + q[0]) * cr;
        gy += (p[1] + q[1]) * cr;
      }
      if (Math.abs(ar) * 0.5 < 0.02) continue;
      gx /= 3 * ar;
      gy /= 3 * ar;
      const za = planeDepthAt(items[i], gx, gy, cx, cy, fov);
      const zb = planeDepthAt(items[j], gx, gy, cx, cy, fov);
      if (za === null || zb === null || Math.abs(za - zb) < 1e-6) continue;
      if (za < zb) {
        adj[i].push(j);
        indeg[j]++;
      } else {
        adj[j].push(i);
        indeg[i]++;
      }
    }
  }

  const done = new Array(n).fill(false);
  const out: FacetItem[] = [];
  for (let step = 0; step < n; step++) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!done[i] && indeg[i] <= 0 && (best < 0 || items[i].sortZ < items[best].sortZ)) best = i;
    }
    if (best < 0) {
      for (let i = 0; i < n; i++) {
        if (!done[i] && (best < 0 || items[i].sortZ < items[best].sortZ)) best = i;
      }
    }
    done[best] = true;
    out.push(items[best]);
    for (let k = 0; k < adj[best].length; k++) indeg[adj[best][k]]--;
  }
  return out;
}

// Draw textured triangle via affine transform mapping in Canvas 2D
function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  u0: number, v0: number,
  u1: number, v1: number,
  u2: number, v2: number,
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number
) {
  const det = u0 * (v1 - v2) - v0 * (u1 - u2) + (u1 * v2 - u2 * v1);
  if (Math.abs(det) < 1e-4) return;

  const a = (x0 * (v1 - v2) - v0 * (x1 - x2) + (x1 * v2 - x2 * v1)) / det;
  const c = (u0 * (x1 - x2) - x0 * (u1 - u2) + (u1 * x2 - u2 * x1)) / det;
  const e = (u0 * (v1 * x2 - v2 * x1) - v0 * (u1 * x2 - u2 * x1) + x0 * (u1 * v2 - u2 * v1)) / det;

  const b = (y0 * (v1 - v2) - v0 * (y1 - y2) + (y1 * v2 - y2 * v1)) / det;
  const d = (u0 * (y1 - y2) - y0 * (u1 - u2) + (u1 * y2 - u2 * y1)) / det;
  const f = (u0 * (v1 * y2 - v2 * y1) - v0 * (u1 * y2 - u2 * y1) + y0 * (u1 * v2 - u2 * v1)) / det;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();

  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

type TransitionCallback = () => void;
let globalTriggerTransition: (
  fromPage: 1 | 2,
  toPage: 1 | 2,
  onMid?: TransitionCallback,
  onDone?: TransitionCallback
) => void;

export function triggerSectionTransition(
  fromPage: 1 | 2,
  toPage: 1 | 2,
  onMidpointSwap: () => void,
  onFinish?: () => void
) {
  if (fromPage === toPage) {
    onMidpointSwap();
    onFinish?.();
    return;
  }

  if (globalTriggerTransition) {
    globalTriggerTransition(fromPage, toPage, onMidpointSwap, onFinish);
  } else {
    onMidpointSwap();
    onFinish?.();
  }
}

export interface TerminalTransitionState {
  inTransition: boolean;
  /** 0 = below screen (hidden below viewport), 1 = settled at y=0 */
  slideProgress: number;
  /** Whether the 2D flight has finished and the 3D desk plane should be visible */
  planeLanded: boolean;
  /** Whether camera zoom should trigger (starts when paper plane has 20% flight left before landing) */
  startCameraZoom: boolean;
  /** Exact projected screen coordinates [nx, ny] of the 3D plane resting spot on the desk */
  landingNx: number;
  landingNy: number;
  /** Synchronously renders a fresh frame of the 3D desk and returns its canvas for seamless return transition */
  captureFrame?: () => HTMLCanvasElement | null;
}

export const terminalTransitionState: TerminalTransitionState = {
  inTransition: false,
  slideProgress: 1,
  planeLanded: true,
  startCameraZoom: true,
  landingNx: 0.422,
  landingNy: 0.242,
};

// Global preloaded paper image for paper airplane texture
const globalPaperImg = new Image();
globalPaperImg.src = '/assets/white-page-bg.png';

export const SectionScrollTransition: React.FC = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const airplaneCanvasRef = useRef<HTMLCanvasElement>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const airplaneCanvas = airplaneCanvasRef.current;
    const webglCanvas = webglCanvasRef.current;
    const shadow = shadowRef.current;
    if (!container || !airplaneCanvas || !webglCanvas || !shadow) return;

    const ctx = airplaneCanvas.getContext('2d');
    if (!ctx) return;

    const paperImg = globalPaperImg;

    let webglRenderer: SectionScrollRenderer | null = null;
    createSectionScrollRenderer(webglCanvas)
      .then((instance) => {
        webglRenderer = instance;
        instance.resize();
      })
      .catch((err) => {
        console.error('[WebGL] Renderer initialization error:', err);
      });

    let animStartTime = 0;
    let pendingMidSwap: TransitionCallback | null = null;
    let pendingFinish: TransitionCallback | null = null;
    let midSwapDone = false;
    let animRafId: number | null = null;

    // Offscreen post-processing buffer for directional motion blur during airplane flight
    const blurCanvas = document.createElement('canvas');
    const blurCtx = blurCanvas.getContext('2d');

    const resizeCanvases = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      airplaneCanvas.width = window.innerWidth * dpr;
      airplaneCanvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      blurCanvas.width = window.innerWidth * dpr;
      blurCanvas.height = window.innerHeight * dpr;

      webglRenderer?.resize();
    };

    window.addEventListener('resize', resizeCanvases);
    resizeCanvases();

    // ── RENDER 3D AIRPLANE FOLD FRAME WITH LINED PAPER TEXTURE & MOTION BLUR POST-PROCESSING ──
    const renderAirplane = (pRaw: number, flight: number) => {
      const vw = window.innerWidth, vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);

      if (pRaw <= 0.0005 && flight <= 0.0005) {
        shadow.style.opacity = '0';
        return;
      }

      const p = Math.min(pRaw, 0.78);
      const pFlight = clamp(flight, 0, 1);

      if (pFlight >= 0.999) {
        shadow.style.opacity = '0';
        ctx.clearRect(0, 0, vw, vh);
        return;
      }

      // Smooth flight scaling down to the exact resting size of the 3D plane on top of the CRT monitor
      // At pFlight = 0, flightScale is strictly 1.0 so the fold end frame never changes size
      const flightScale = lerp(1, 0.178, smoothstep(0.0, 0.95, pFlight));
      const spin = 0;

      const H = Math.min(vw * 0.82, vh * 1.17);
      const W = H * 0.35;
      const cover = Math.max(vw / H, vh / (2 * W)) * 1.02;
      const sheetMorph = smoothstep(0.0, 0.07, p);
      const pStep6Open = smoothstep(0.64, 0.78, p);
      const baseS = lerp(cover, 1, sheetMorph) * lerp(1, 0.75, pStep6Open);
      const S = baseS * flightScale;

      const y2 = W * (1 + Math.SQRT2);
      const xWing = H * Math.tan(Math.PI / 16);
      const d = 1.2;

      // NEVER EVER MODIFY THE ANIMATION OF THE FOLDING ANIMATION TO DONE FOLDING
      const pStep2 = smoothstep(0.08, 0.22, p);
      const pStep3 = smoothstep(0.22, 0.36, p);
      const pStep4 = smoothstep(0.36, 0.50, p);
      const pStep5 = smoothstep(0.50, 0.64, p);
      const tuckAngle = -pStep4 * Math.PI;
      const theta5 = (lerp(0, 176, pStep5) - lerp(0, 100, pStep6Open)) * DEG;

      const yOff = -H * 0.5;
      const FOLDS: Record<number, { ex: number; ey: number; h: number; ang: number }> = {
        2: { ex: W, ey: W, h: 0.5 * d, ang: pStep2 * Math.PI },
        3: { ex: W, ey: y2, h: 1.5 * d, ang: pStep3 * Math.PI },
        5: { ex: xWing, ey: H, h: 3.5 * d, ang: theta5 },
      };

      function foldPoint(v: V3, k: number, s: number): V3 {
        const f = FOLDS[k];
        return rotAroundAxis(v, [0, yOff, f.h], [s * f.ex, f.ey + yOff, f.h], -s * f.ang);
      }

      function spinePoint(v: V3, s: number): V3 {
        if (s === 1) return v;
        return rotAroundAxis(v, [0, yOff, -0.5 * d], [0, H + yOff, -0.5 * d], tuckAngle);
      }

      const cells = buildCells(W, H);
      const rawFacets: { verts: V3[]; uvs: V2[]; kinds: (string | number)[]; isFolded: boolean }[] = [];

      function checkFolded(ops: number[]): boolean {
        if (pStep4 > 0.01) return true;
        for (const k of ops) {
          if (k === 2 && pStep2 > 0.01) return true;
          if (k === 3 && pStep3 > 0.01) return true;
          if (k === 5 && pStep5 > 0.01) return true;
        }
        return false;
      }

      [1, -1].forEach((s) => {
        cells.forEach((c) => {
          let verts = c.poly.map((q) => [s * q[0], q[1] + yOff, 0] as V3);

          // Calculate UV coordinates on the sheet [0..1, 0..1]
          const uvs: V2[] = c.poly.map((q) => {
            const xSheet = s * q[0];
            const ySheet = q[1];
            const u = clamp(ySheet / H, 0, 1);
            const v = clamp((xSheet + W) / (2 * W), 0, 1);
            return [u, v];
          });

          c.ops.forEach((k) => {
            verts = verts.map((v) => foldPoint(v, k, s));
          });
          verts = verts.map((v) => spinePoint(v, s));
          rawFacets.push({
            verts,
            uvs,
            kinds: c.kinds,
            isFolded: checkFolded(c.ops),
          });
        });
      });

      const nCell = cells.length;
      function addStrip(
        fa: { verts: V3[]; uvs: V2[] },
        ia: [number, number],
        fb: { verts: V3[]; uvs: V2[] },
        ib: [number, number]
      ) {
        if (ia[0] < 0 || ia[1] < 0 || ib[0] < 0 || ib[1] < 0) return;
        const q: V3[] = [fa.verts[ia[0]], fa.verts[ia[1]], fb.verts[ib[1]], fb.verts[ib[0]]];
        const uvs: V2[] = [fa.uvs[ia[0]], fa.uvs[ia[1]], fb.uvs[ib[1]], fb.uvs[ib[0]]];
        const g = Math.max(
          Math.hypot(q[0][0] - q[3][0], q[0][1] - q[3][1], q[0][2] - q[3][2]),
          Math.hypot(q[1][0] - q[2][0], q[1][2] - q[2][2])
        );
        if (g < 0.01) return;
        rawFacets.push({
          verts: q,
          uvs,
          kinds: ['none', 'none', 'none', 'none'],
          isFolded: true,
        });
      }

      for (let hf = 0; hf < 2; hf++) {
        for (let i = 0; i < nCell - 1; i++) {
          addStrip(rawFacets[hf * nCell + i], cells[i].hb, rawFacets[hf * nCell + i + 1], cells[i + 1].ha);
        }
      }
      addStrip(rawFacets[0], cells[0].ha, rawFacets[nCell], cells[0].ha);

      const shiftX = -W * 0.5 * Math.min(1, 1 - Math.cos(pStep4 * Math.PI));
      const fov = 1400;
      const lightDir = norm3([0.38, -0.42, 0.82]);

      const roll0 = -90 * DEG + 20 * DEG * smoothstep(0.64, 0.78, p);
      const yaw0 = lerp(-0.22 * smoothstep(0.34, 0.50, p), 0.5, pStep6Open);
      const pitch0 = lerp(-0.14 * smoothstep(0.02, 0.25, p), -0.4, pStep6Open);
      const tz0 = -smoothstep(0.01, 0.45, p) * 200;

      interface TransformParams {
        S: number;
        roll: number;
        yaw: number;
        pitch: number;
        spin: number;
        shiftX: number;
        Tx: number;
        Ty: number;
        Tz: number;
        turnYaw?: number;
        tiltUpDown?: number;
        wingBank?: number;
      }

      const rest: TransformParams = {
        S: baseS,
        roll: roll0,
        yaw: yaw0,
        pitch: pitch0,
        spin: 0,
        shiftX,
        Tx: 0,
        Ty: 0,
        Tz: tz0,
      };

      function proj(v: V3, P: TransformParams): { screen: V2; world: V3; scale: number } {
        let q: V3 = [v[0] + P.shiftX, v[1], v[2]];
        if (P.spin) q = rotY(q, P.spin);
        q = [q[0] * P.S, q[1] * P.S, q[2] * P.S];
        q = rotZ(q, P.roll);
        q = rotY(q, P.yaw);
        q = rotX(q, P.pitch);

        // During flight, rotate around the airplane's 3D centroid in screen space:
        // - rotY(turnYaw) turns the plane horizontally LEFT-TO-RIGHT without ever spinning vertically
        // - rotZ(tiltUpDown) pitches the nose gently UP and DOWN along the climb/glide
        // - rotX(wingBank) adds subtle wing banking
        if (P.turnYaw || P.tiltUpDown || P.wingBank) {
          let cBase: V3 = [P.shiftX * P.S, 0, 0];
          cBase = rotZ(cBase, P.roll);
          cBase = rotY(cBase, P.yaw);
          cBase = rotX(cBase, P.pitch);

          let rel: V3 = [q[0] - cBase[0], q[1] - cBase[1], q[2] - cBase[2]];
          if (P.wingBank) rel = rotX(rel, P.wingBank);
          if (P.turnYaw) rel = rotY(rel, P.turnYaw);
          if (P.tiltUpDown) rel = rotZ(rel, P.tiltUpDown);
          q = [cBase[0] + rel[0], cBase[1] + rel[1], cBase[2] + rel[2]];
        }

        const wx = q[0] + P.Tx, wy = q[1] + P.Ty, wz = q[2] + P.Tz;
        const scale = fov / Math.max(200, fov - wz);
        return {
          screen: [vw * 0.5 + wx * scale, vh * 0.5 + wy * scale],
          world: [wx, wy, wz],
          scale,
        };
      }

      const centerLocal: V3 = [0, 0, 0];
      // Exact screen coordinates of the paper plane at the end of the fold (p = 0.78, pFlight = 0)
      const c0 = proj(centerLocal, rest).screen;
      const startNx = c0[0] / vw;
      const startNy = c0[1] / vh;

      // ── ARC-LENGTH PARAMETERIZED LEFT-TO-RIGHT & UP-AND-DOWN FLIGHT PATH ──
      // P0: Exact fold end frame screen position (0.0px shift when folding completes!)
      // P1: Glides left and up while facing left
      // P2: Left turn apex where the plane turns in 3D from facing LEFT to facing RIGHT
      // P3: Climbs smoothly left-to-right across the upper room
      // P4: Swoops gracefully above the monitor
      // P5: Level aerodynamic flare skimming right over the cabinet deck
      // P6: Soft touchdown onto the top of the CRT monitor cabinet
      const lNx = terminalTransitionState.landingNx;
      const lNy = terminalTransitionState.landingNy;

      const flightWaypoints: [number, number][] = [
        [startNx, startNy],
        [0.22, 0.54],
        [0.10, 0.38],
        [0.18, 0.17],
        [lNx - 0.15, lNy - 0.042],
        [lNx - 0.065, lNy - 0.008],
        [lNx, lNy],
      ];

      function getRawCatmullRom(pts: [number, number][], tNorm: number): [number, number] {
        const n = pts.length - 1;
        const s = clamp(tNorm, 0, 1) * n;
        const i = Math.min(Math.floor(s), n - 1);
        const t = s - i;
        const p0 = pts[Math.max(0, i - 1)];
        const p2 = pts[i];
        const p3 = pts[Math.min(n, i + 1)];
        const p4 = pts[Math.min(n, i + 2)];
        const t2 = t * t, t3 = t2 * t;
        const x = 0.5 * (
          2 * p2[0] +
          (-p0[0] + p3[0]) * t +
          (2 * p0[0] - 5 * p2[0] + 4 * p3[0] - p4[0]) * t2 +
          (-p0[0] + 3 * p2[0] - 3 * p3[0] + p4[0]) * t3
        );
        const y = 0.5 * (
          2 * p2[1] +
          (-p0[1] + p3[1]) * t +
          (2 * p0[1] - 5 * p2[1] + 4 * p3[1] - p4[1]) * t2 +
          (-p0[1] + 3 * p2[1] - 3 * p3[1] + p4[1]) * t3
        );
        return [x, y];
      }

      // Build uniform arc-length lookup table so velocity is 100% smooth without spline bunching
      const ARC_SAMPLES = 160;
      const samplePts: [number, number][] = [];
      const arcLen: number[] = [0];
      for (let i = 0; i <= ARC_SAMPLES; i++) {
        const pt = getRawCatmullRom(flightWaypoints, i / ARC_SAMPLES);
        samplePts.push(pt);
        if (i > 0) {
          const prev = samplePts[i - 1];
          const ds = Math.hypot((pt[0] - prev[0]) * vw, (pt[1] - prev[1]) * vh);
          arcLen.push(arcLen[i - 1] + ds);
        }
      }
      const totalArcLen = Math.max(1, arcLen[ARC_SAMPLES]);

      function getPointAtArcLength(sNorm: number): [number, number] {
        const targetD = clamp(sNorm, 0, 1) * totalArcLen;
        let lo = 0, hi = ARC_SAMPLES;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (arcLen[mid] < targetD) lo = mid + 1;
          else hi = mid;
        }
        const idx = Math.max(1, lo);
        const l0 = arcLen[idx - 1], l1 = arcLen[idx];
        const frac = l1 > l0 ? (targetD - l0) / (l1 - l0) : 0;
        const a = samplePts[idx - 1], b = samplePts[idx];
        return [lerp(a[0], b[0], frac), lerp(a[1], b[1], frac)];
      }

      const u = clamp(pFlight, 0, 1);
      const pos = getPointAtArcLength(u);
      const flightTargetX = pos[0] * vw;
      const flightTargetY = pos[1] * vh;

      let turnYaw = 0;
      let tiltUpDown = 0;
      let wingBank = 0;
      let velDirX = -0.96;
      let velDirY = -0.28;
      let speedMag = 0;

      if (u > 0) {
        const du = 0.016;
        const uPrev = Math.max(0, u - du);
        const uNext = Math.min(1, u + du);
        const posPrev = getPointAtArcLength(uPrev);
        const posNext = getPointAtArcLength(uNext);
        const dx = (posNext[0] - posPrev[0]) * vw;
        const dy = (posNext[1] - posPrev[1]) * vh;
        const dist = Math.hypot(dx, dy);
        if (dist > 1e-4) {
          velDirX = dx / dist;
          velDirY = dy / dist;
        }

        // 1. Horizontal 3D Left-to-Right turn (rotY around vertical screen axis):
        // At u = 0..0.24 the plane faces LEFT (turnYaw = 0).
        // Around the left apex (u = 0.24..0.52) it turns smoothly in 3D to face RIGHT.
        // On approach to landing, it aligns with the resting 3D angle (turnYaw = 2.76 rad).
        const turnProgress = smoothstep(0.24, 0.52, u);
        turnYaw = lerp(0, 2.76, turnProgress);

        // 2. Up-and-down nose pitch tilt (rotZ) with aerodynamic landing flare:
        // Tilts gently up when climbing and down when descending,
        // then as it nears the top of the monitor (u = 0.78..0.98), flares nose up (+0.10 rad)
        // to catch air and cushion the descent, leveling out right at touchdown (u = 1.0)
        const verticalSlope = clamp(dy / (Math.abs(dx) + 80), -0.65, 0.65);
        const facingSign = lerp(-1, 1, turnProgress);
        const rawTilt = clamp(verticalSlope * facingSign * 0.52, -0.32, 0.32);
        const flarePitch = Math.sin(smoothstep(0.78, 1.0, u) * Math.PI) * 0.10;
        tiltUpDown = (lerp(0, rawTilt, smoothstep(0.0, 0.12, u)) * (1 - smoothstep(0.80, 0.98, u))) + flarePitch;

        // 3. Aerodynamic wing bank: banks dynamically during the turn, then levels flat onto cabinet
        const turnBank = Math.sin(turnProgress * Math.PI) * 0.28;
        wingBank = turnBank * (1 - smoothstep(0.80, 0.98, u));

        // Speed envelope peaks during the swoop and tapers smoothly to 0 on landing
        speedMag = Math.sin(Math.pow(u, 0.76) * Math.PI) * (1 - smoothstep(0.84, 0.98, u));
      }

      const cur: TransformParams = {
        S,
        roll: roll0,
        yaw: yaw0,
        pitch: pitch0,
        spin,
        shiftX,
        Tx: 0,
        Ty: 0,
        Tz: tz0,
        turnYaw,
        tiltUpDown,
        wingBank,
      };

      if (pFlight > 0) {
        const cc = proj(centerLocal, cur);
        cur.Tx = (flightTargetX - cc.screen[0]) / cc.scale;
        cur.Ty = (flightTargetY - cc.screen[1]) / cc.scale;
      }
      const globalTx = cur.Tx, globalTy = cur.Ty;

      const drawList: FacetItem[] = rawFacets.map((f) => {
        const projected = f.verts.map((v) => proj(v, cur));
        const wv = projected.map((i) => i.world);
        const n = wv.length;
        let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < n; i++) {
          const a = wv[i], b = wv[(i + 1) % n];
          nx += (a[1] - b[1]) * (a[2] + b[2]);
          ny += (a[2] - b[2]) * (a[0] + b[0]);
          nz += (a[0] - b[0]) * (a[1] + b[1]);
          cx += a[0]; cy += a[1]; cz += a[2];
        }
        cx /= n; cy /= n; cz /= n;
        let normal = norm3([nx, ny, nz]);
        const planeN = normal;
        const toCam = norm3([-cx, -cy, fov - cz]);

        let sortZ = cz;
        if (Math.abs(normal[2]) > 0.1) {
          sortZ = cz - (normal[0] * (globalTx - cx) + normal[1] * (globalTy - cy)) / normal[2];
        }
        if (normal[0] * toCam[0] + normal[1] * toCam[1] + normal[2] * toCam[2] < 0) {
          normal = [-normal[0], -normal[1], -normal[2]];
        }
        const ndotl = Math.max(0, normal[0] * lightDir[0] + normal[1] * lightDir[1] + normal[2] * lightDir[2]);
        return {
          pts: projected.map((i) => i.screen),
          uvs: f.uvs,
          kinds: f.kinds,
          sortZ,
          ndotl,
          pn: planeN,
          p0: wv[0],
          isFolded: f.isFolded,
        };
      });

      const drawOrder = orderByDepth(drawList, vw * 0.5, vh * 0.5, fov);

      // ── MASKING: Cut out unfolded paper silhouette from dark backdrop during initial folding only ──
      // Only cut out unfolded facets (!isFolded && pStep4 <= 0.01) so the content inside the paper
      // NEVER goes over the folded paper flaps or outside the paper sheet!
      if (pFlight <= 0.001) {
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, vw, vh);

        if (pStep4 <= 0.01) {
          ctx.globalCompositeOperation = 'destination-out';
          for (let i = 0; i < drawList.length; i++) {
            if (drawList[i].isFolded) continue;
            const pts = drawList[i].pts;
            if (!pts || pts.length < 3) continue;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // ── FOLDED FLAPS & 3D AIRPLANE FACETS (TEXTURED WITH LINED PAPER) ──
      const shadeStrength = smoothstep(0.01, 0.08, p);
      const creaseProg: Record<number, number> = { 1: pStep5, 2: pStep3, 4: pStep2 };
      function edgeAlpha(kind: any) {
        if (kind === 'none') return 0;
        if (kind === 'edge') return 0.3 * shadeStrength;
        if (kind === 'spine') return 0.22 * pStep4;
        const numKind = typeof kind === 'number' ? kind : 0;
        return 0.22 * (creaseProg[numKind] || 0);
      }

      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      const hasPaperImg = paperImg.complete && paperImg.naturalWidth > 0;
      const imgW = hasPaperImg ? paperImg.naturalWidth : 1024;
      const imgH = hasPaperImg ? paperImg.naturalHeight : 576;

      for (let i = 0; i < drawOrder.length; i++) {
        const item = drawOrder[i];
        const pts = item.pts;
        if (!pts || pts.length < 3) continue;

        const isFacetActive = item.isFolded || pStep4 > 0.01;

        if (isFacetActive) {
          // 0. Solid opaque paper base fill first so background/inner canvas NEVER bleeds through seams or hinge strips
          // During flight (pFlight > 0), progressively apply the scene's warm lamp & CRT shader tint
          const shaderMix = smoothstep(0.10, 0.92, pFlight);
          const nd = item.ndotl;
          const baseR = 244 * (0.86 + 0.14 * nd);
          const baseG = 238 * (0.86 + 0.14 * nd);
          const baseB = 226 * (0.86 + 0.14 * nd);
          // Warm gooseneck lamp subsurface scatter + CRT ambient rim
          const shaderR = (178 + 74 * nd);
          const shaderG = (146 + 68 * nd);
          const shaderB = (108 + 56 * nd);
          const r = Math.round(clamp(lerp(baseR, shaderR, shaderMix), 120, 255));
          const g = Math.round(clamp(lerp(baseG, shaderG, shaderMix), 100, 250));
          const b = Math.round(clamp(lerp(baseB, shaderB, shaderMix), 80, 240));
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.closePath();
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fill();

          // 1. Draw textured facet using white-page-bg.png
          if (hasPaperImg && item.uvs && item.uvs.length >= pts.length) {
            for (let j = 1; j < pts.length - 1; j++) {
              drawTexturedTriangle(
                ctx,
                paperImg,
                item.uvs[0][0] * imgW, item.uvs[0][1] * imgH,
                item.uvs[j][0] * imgW, item.uvs[j][1] * imgH,
                item.uvs[j + 1][0] * imgW, item.uvs[j + 1][1] * imgH,
                pts[0][0], pts[0][1],
                pts[j][0], pts[j][1],
                pts[j + 1][0], pts[j + 1][1]
              );
            }
          }

          // 2. 3D lighting shadow + warm lamp / CRT shader overlay
          if (shadeStrength > 0.01) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
            ctx.closePath();
            const shadowAlpha = clamp((1.0 - item.ndotl) * (0.42 + 0.16 * shaderMix) * shadeStrength, 0, 0.72);
            const shR = Math.round(lerp(20, 28, shaderMix));
            const shG = Math.round(lerp(16, 20, shaderMix));
            const shB = Math.round(lerp(14, 15, shaderMix));
            ctx.fillStyle = `rgba(${shR}, ${shG}, ${shB}, ${shadowAlpha})`;
            ctx.fill();

            if (shaderMix > 0.01) {
              // Warm golden lamp glow + subsurface scatter on lit paper facets
              const warmAlpha = clamp((0.12 + 0.22 * item.ndotl) * shaderMix, 0, 0.36);
              ctx.fillStyle = `rgba(255, 188, 96, ${warmAlpha})`;
              ctx.fill();
            }
            ctx.restore();
          }

          // Anti-alias edge stroke to seal seams
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j][0], pts[j][1]);
          ctx.closePath();
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = 'rgba(235, 230, 225, 0.5)';
          ctx.stroke();
          ctx.restore();
        }

        // Crease and fold lines
        ctx.lineWidth = 1.25;
        for (let j = 0; j < pts.length; j++) {
          const a = edgeAlpha(item.kinds[j]);
          if (a < 0.01) continue;
          const q = pts[(j + 1) % pts.length];
          ctx.beginPath();
          ctx.moveTo(pts[j][0], pts[j][1]);
          ctx.lineTo(q[0], q[1]);
          ctx.strokeStyle = `rgba(25, 25, 35, ${a})`;
          ctx.stroke();
        }
      }
      ctx.restore();

      // ── DIRECTIONAL MOTION BLUR POST-PROCESSING PASS (DURING ENTRY FLIGHT ONLY) ──
      if (pFlight > 0.005 && speedMag > 0.02 && blurCtx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        blurCtx.setTransform(1, 0, 0, 1, 0, 0);
        blurCtx.clearRect(0, 0, blurCanvas.width, blurCanvas.height);
        blurCtx.drawImage(airplaneCanvas, 0, 0);

        // Multi-tap directional shutter motion blur along backward velocity vector (-velDirX, -velDirY)
        const maxBlurPx = 28 * speedMag;
        const taps = 6;
        ctx.save();
        for (let tap = 1; tap <= taps; tap++) {
          const frac = tap / taps;
          const offsetX = -velDirX * maxBlurPx * frac;
          const offsetY = -velDirY * maxBlurPx * frac;
          ctx.globalAlpha = (1 - frac * 0.78) * 0.22 * speedMag;
          ctx.drawImage(
            blurCanvas,
            0, 0, blurCanvas.width, blurCanvas.height,
            offsetX, offsetY, vw, vh
          );
        }

        // Dynamic aerodynamic wingtip & tail slipstream motion-blur streaks
        const noseScreen = proj([0, -H * 0.5, 0], cur).screen;
        const lWingScreen = proj([xWing * 0.9, H * 0.48, 2.5 * d], cur).screen;
        const rWingScreen = proj([-xWing * 0.9, H * 0.48, 2.5 * d], cur).screen;
        const streakLen = (48 + 72 * speedMag) * S;

        [
          { pt: lWingScreen, width: 2.2, alpha: 0.34 * speedMag },
          { pt: rWingScreen, width: 2.2, alpha: 0.34 * speedMag },
          { pt: noseScreen, width: 1.4, alpha: 0.20 * speedMag },
        ].forEach(({ pt, width, alpha }) => {
          const ex = pt[0] - velDirX * streakLen;
          const ey = pt[1] - velDirY * streakLen;
          const grad = ctx.createLinearGradient(pt[0], pt[1], ex, ey);
          grad.addColorStop(0, `rgba(255, 232, 185, ${alpha})`);
          grad.addColorStop(0.45, `rgba(255, 205, 130, ${alpha * 0.45})`);
          grad.addColorStop(1, 'rgba(255, 190, 100, 0)');
          ctx.beginPath();
          ctx.moveTo(pt[0], pt[1]);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = grad;
          ctx.lineWidth = width;
          ctx.lineCap = 'round';
          ctx.stroke();
        });
        ctx.restore();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Seamless handoff to 3D model right at touchdown on top of the CRT monitor
      if (pFlight > 0.96) {
        const fadeOut = smoothstep(0.96, 1.0, pFlight);
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeOut})`;
        ctx.fillRect(0, 0, vw, vh);
        ctx.restore();
      }

      shadow.style.opacity = '0';
    };

    // ── TRIGGER TRANSITION CONTROLLER ──
    globalTriggerTransition = (
      fromPage: 1 | 2,
      toPage: 1 | 2,
      onMid?: TransitionCallback,
      onDone?: TransitionCallback
    ) => {
      if (animRafId !== null) {
        cancelAnimationFrame(animRafId);
        animRafId = null;
      }

      pendingMidSwap = onMid ?? null;
      pendingFinish = onDone ?? null;
      midSwapDone = false;
      animStartTime = performance.now();

      container.style.visibility = 'visible';
      container.style.opacity = '1';

      if (fromPage === 1 && toPage === 2) {
        // ── FORWARD: PAPER AIRPLANE FOLD & FLY OUT ANIMATION ──
        airplaneCanvas.style.display = 'block';
        webglCanvas.style.display = 'none';

        // Stage 3D terminal below viewport before folding completes
        terminalTransitionState.inTransition = true;
        terminalTransitionState.slideProgress = 0;
        terminalTransitionState.planeLanded = false;
        terminalTransitionState.startCameraZoom = false;

        const FOLD_DURATION = 1150;   // 1.15s crisp, snappier step-by-step folds (geometry strictly preserved)
        const FLIGHT_DURATION = 1850; // 1.85s brisk left-to-right swoop + landing on top of the monitor
        const SLIDE_DELAY = 240;      // 240ms slide delay
        const SLIDE_DURATION = 1320;  // 1.32s desk slide-up into place
        const TOTAL_DURATION = FOLD_DURATION + FLIGHT_DURATION; // 3.00s

        (window as any).__RENDER_AIRPLANE_EXACT__ = (elapsed: number) => {
          let pFold = 0;
          let flight = 0;
          if (elapsed < FOLD_DURATION) {
            pFold = (elapsed / FOLD_DURATION) * 0.78;
            flight = 0;
            terminalTransitionState.slideProgress = 0;
            terminalTransitionState.planeLanded = false;
            terminalTransitionState.startCameraZoom = false;
          } else {
            pFold = 0.78;
            const flightElapsed = elapsed - FOLD_DURATION;
            const tFlight = Math.min(1, flightElapsed / FLIGHT_DURATION);
            flight = smoothstep(0, 1, tFlight);
            const tSlide = clamp((flightElapsed - SLIDE_DELAY) / SLIDE_DURATION, 0, 1);
            terminalTransitionState.slideProgress = 1 - Math.pow(1 - tSlide, 3);
            terminalTransitionState.startCameraZoom = tFlight >= 0.80;
            terminalTransitionState.planeLanded = tFlight >= 0.97;
          }
          container.style.visibility = 'visible';
          container.style.opacity = '1';
          airplaneCanvas.style.display = 'block';
          renderAirplane(pFold, flight);
        };

        let lastTime = performance.now();
        let animElapsed = 0;

        const stepAirplane = (now: number) => {
          const rawDt = now - lastTime;
          lastTime = now;
          // Clamp delta time to maximum 33ms so heavy scene initialization or thread hiccups NEVER skip the flight
          const dt = Math.min(Math.max(0, rawDt), 33);
          animElapsed += dt;
          const elapsed = animElapsed;

          let pFold = 0;
          let flight = 0;

          if (elapsed < FOLD_DURATION) {
            // NEVER EVER MODIFY THE ANIMATION OF THE FOLDING ANIMATION TO DONE FOLDING
            const t = elapsed / FOLD_DURATION;
            pFold = t * 0.78;
            flight = 0;
            terminalTransitionState.slideProgress = 0;
            terminalTransitionState.planeLanded = false;
            terminalTransitionState.startCameraZoom = false;

            // Once pFold >= 0.55 (pStep4 === 1, plane is folded in half and 100% opaque over solid #000000 backdrop),
            // swap DOM underneath to Page 2 so Page 1 BG is already gone before the fold finishes at 1500ms!
            if (pFold >= 0.55 && !midSwapDone) {
              midSwapDone = true;
              pendingMidSwap?.();
            }
          } else {
            pFold = 0.78;
            const flightElapsed = elapsed - FOLD_DURATION;
            const tFlight = Math.min(1, flightElapsed / FLIGHT_DURATION);
            flight = smoothstep(0, 1, tFlight);

            // Slide the 3D desk object smoothly up from below synced with the left-to-right approach
            const tSlide = clamp((flightElapsed - SLIDE_DELAY) / SLIDE_DURATION, 0, 1);
            terminalTransitionState.slideProgress = 1 - Math.pow(1 - tSlide, 3);

            // Trigger camera zoom when paper plane is at 20% left before it lands (tFlight >= 0.80)
            terminalTransitionState.startCameraZoom = tFlight >= 0.80;

            // Reveal the 3D plane resting on top of the monitor right as touchdown occurs for seamless continuity
            terminalTransitionState.planeLanded = tFlight >= 0.97;

            if (!midSwapDone) {
              midSwapDone = true;
              pendingMidSwap?.();
            }
          }

          renderAirplane(pFold, flight);

          if (elapsed < TOTAL_DURATION) {
            animRafId = requestAnimationFrame(stepAirplane);
          } else {
            try {
              terminalTransitionState.slideProgress = 1;
              terminalTransitionState.planeLanded = true;
              terminalTransitionState.startCameraZoom = true;
              terminalTransitionState.inTransition = false;
              renderAirplane(0.78, 1.0);
              if (!midSwapDone) {
                midSwapDone = true;
                pendingMidSwap?.();
              }
              container.style.visibility = 'hidden';
              container.style.opacity = '0';
              ctx.clearRect(0, 0, airplaneCanvas.width, airplaneCanvas.height);
              shadow.style.opacity = '0';
              animRafId = null;
              pendingFinish?.();
              pendingFinish = null;
            } catch (err: any) {
              console.error('Error in stepAirplane finish:', err);
            }
          }
        };

        animRafId = requestAnimationFrame(stepAirplane);

      } else {
        // ── GO BACK (2 -> 1): WEBGL 2 DIRECTIONAL REVEAL WIPE ──
        airplaneCanvas.style.display = 'none';
        webglCanvas.style.display = 'block';
        shadow.style.opacity = '0';
        webglRenderer?.resize();

        // Capture the live 3D terminal canvas frame so the outgoing scene stays visible and gets wiped away instead of disappearing!
        const capturedCanvas = terminalTransitionState.captureFrame?.();
        if (capturedCanvas && webglRenderer) {
          webglRenderer.setCurrentFromCanvas(capturedCanvas);
        }

        // Synchronously draw the initial opaque curtain frame BEFORE swapping DOM underneath
        webglRenderer?.draw(1, 0, 0, -1, 0);
        if (!midSwapDone) {
          midSwapDone = true;
          pendingMidSwap?.();
        }

        const WEBGL_DURATION = 1150;

        const stepWebgl = (now: number) => {
          const elapsed = Math.max(0, now - animStartTime);
          const progress = Math.min(1, elapsed / WEBGL_DURATION);

          const timeSec = elapsed * 0.0015;
          webglRenderer?.draw(1, 0, progress, -1, timeSec);

          if (progress < 1) {
            animRafId = requestAnimationFrame(stepWebgl);
          } else {
            pendingFinish?.();
            pendingFinish = null;
            webglCanvas.style.display = 'none';
            container.style.visibility = 'hidden';
            container.style.opacity = '0';
            animRafId = null;
          }
        };

        animRafId = requestAnimationFrame(stepWebgl);
      }
    };

    return () => {
      window.removeEventListener('resize', resizeCanvases);
      if (animRafId !== null) cancelAnimationFrame(animRafId);
      webglRenderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="paperViewport"
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen overflow-hidden z-[9999] pointer-events-none"
      style={{ visibility: 'hidden', opacity: 0 }}
    >
      {/* Dynamic Paper Drop Shadow */}
      <div
        ref={shadowRef}
        id="paperShadow"
        className="absolute inset-0 pointer-events-none z-[9999] opacity-0"
      />

      {/* Airplane Canvas (Forward 1 -> 2 Animation) */}
      <div id="paperScene" className="absolute inset-0 z-[9999] pointer-events-none">
        <canvas ref={airplaneCanvasRef} id="airplaneCanvas" className="w-full h-full block" />
      </div>

      {/* WebGL Canvas (Go Back 2 -> 1 Transition) */}
      <canvas
        ref={webglCanvasRef}
        id="webglTransitionCanvas"
        className="absolute inset-0 w-full h-full block z-[9999] pointer-events-none"
        style={{ display: 'none' }}
      />
    </div>
  );
});

export default SectionScrollTransition;
