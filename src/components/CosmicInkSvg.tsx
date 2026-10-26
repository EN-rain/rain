import React, { useEffect, useMemo, useRef } from 'react';

// ============================================================================
// Pure SVG Cosmic Ink & 3D Rotating Sphere Animation
// Calibrated to 1920x1080 (16:9) reference space matching image_f38fa5ad.png
// Sphere Center: (294, 503), Base Horizon Radius: 647
// ============================================================================

const CX = 294;
const CY = 503;
const BASE_R = 647;

// Deterministic PRNG so SSR/mount renders identical artisanal brushwork every time
function createSeededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Builds a closed SVG path for a full circle with multi-harmonic organic wobble
// so when rotated around (CX, CY), the brushstroke edge undulates naturally.
function buildOrganicRingPath(
  cx: number,
  cy: number,
  baseRadius: number,
  amp1: number,
  freq1: number,
  phase1: number,
  amp2: number,
  freq2: number,
  phase2: number,
  segments = 120
): string {
  const pts: string[] = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const r =
      baseRadius +
      Math.sin(theta * freq1 + phase1) * amp1 +
      Math.cos(theta * freq2 + phase2) * amp2;
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  pts.push('Z');
  return pts.join(' ');
}

// Builds an open calligraphic arc path between [startDeg, endDeg] with radial bristle wave
function buildCalligraphicArcPath(
  cx: number,
  cy: number,
  baseRadius: number,
  startDeg: number,
  endDeg: number,
  wobbleAmp: number,
  wobbleFreq: number,
  wobblePhase: number,
  steps = 72
): { d: string; approxLen: number } {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const pts: string[] = [];
  let len = 0;
  let prevX = 0;
  let prevY = 0;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = startRad + (endRad - startRad) * t;
    // Slight widening near the bottom and upper sweep to match reference curvature
    const bandMod = 1 + 0.012 * Math.sin(theta * 1.5 - 0.4);
    const r =
      baseRadius * bandMod +
      Math.sin(theta * wobbleFreq + wobblePhase) * wobbleAmp +
      Math.cos(theta * (wobbleFreq * 2.3) - wobblePhase * 1.7) * (wobbleAmp * 0.45);
    const x = cx + Math.cos(theta) * r;
    const y = cy + Math.sin(theta) * r;
    if (i > 0) {
      len += Math.hypot(x - prevX, y - prevY);
    }
    prevX = x;
    prevY = y;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return { d: pts.join(' '), approxLen: Math.round(len) };
}

// Builds the left-hand cosmic void clip path (covers left viewport + follows circular horizon at r=645)
function buildVoidClipPath(): string {
  const startDeg = -82;
  const endDeg = 82;
  const steps = 90;
  const pts: string[] = ['M -300,-180', `L ${(CX + Math.cos((startDeg * Math.PI) / 180) * BASE_R).toFixed(1)},-180`];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const theta = ((startDeg + (endDeg - startDeg) * t) * Math.PI) / 180;
    const r = BASE_R + Math.sin(theta * 7.0 + 0.8) * 2.5;
    const x = CX + Math.cos(theta) * r;
    const y = CY + Math.sin(theta) * r;
    pts.push(`L ${x.toFixed(1)},${y.toFixed(1)}`);
  }

  pts.push('L -300,1260 Z');
  return pts.join(' ');
}

interface StarSeed {
  lon: number;
  lat: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface EmberSeed {
  lon: number;
  lat: number;
  rx: number;
  ry: number;
  rotDeg: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  coreColor: string;
  glowColor: string;
  speedMult: number;
}

export const CosmicInkSvg: React.FC = () => {
  const starRefs = useRef<(SVGCircleElement | null)[]>([]);
  const emberRefs = useRef<(SVGGElement | null)[]>([]);
  const nebulaGroupRef = useRef<SVGGElement | null>(null);
  const slowRingRef = useRef<SVGGElement | null>(null);
  const midRingRef = useRef<SVGGElement | null>(null);
  const fastRingRef = useRef<SVGGElement | null>(null);
  const innerCutRingRef = useRef<SVGGElement | null>(null);

  // Precompute all deterministic SVG geometry once on mount
  const {
    voidClipD,
    slowWashRings,
    midCobaltRings,
    fastDryBristles,
    innerCutTeeth,
    anchoredArcs,
    outerFlecks,
    stars,
    embers,
  } = useMemo(() => {
    const rand = createSeededRandom(20261026);

    // 1. Slow foundation wash rings (deep midnight indigo & ultramarine body)
    const slowRings = Array.from({ length: 14 }, (_, idx) => {
      const t = idx / 13;
      const r = BASE_R + 4 + t * 56; // 651..707
      const d = buildOrganicRingPath(
        CX,
        CY,
        r,
        2.5 + rand() * 4.5,
        3 + Math.floor(rand() * 5),
        rand() * Math.PI * 2,
        1.5 + rand() * 3.0,
        7 + Math.floor(rand() * 6),
        rand() * Math.PI * 2
      );
      const colors = ['#061138', '#091b58', '#0e2982', '#1438ab', '#1c49cc', '#0b2068'];
      const color = colors[idx % colors.length];
      const strokeWidth = 8 + rand() * 14 * (1 - Math.abs(t - 0.45));
      const dash1 = Math.round(180 + rand() * 340);
      const gap1 = Math.round(25 + rand() * 90);
      const dash2 = Math.round(90 + rand() * 240);
      const gap2 = Math.round(35 + rand() * 110);
      return {
        d,
        color,
        strokeWidth: strokeWidth.toFixed(1),
        dashArray: `${dash1} ${gap1} ${dash2} ${gap2}`,
        dashOffset: Math.round(rand() * 1200),
        opacity: (0.48 + rand() * 0.38).toFixed(2),
      };
    });

    // 2. Medium velocity cobalt bristle striations & dark sumi-ink veins
    const midRings = Array.from({ length: 28 }, (_, idx) => {
      const t = idx / 27;
      const r = BASE_R - 2 + t * 76; // 645..721
      const isSumiVein = idx % 4 === 0 || (t < 0.35 && idx % 3 === 0);
      const isHighlight = t > 0.48 && idx % 3 === 1;

      const d = buildOrganicRingPath(
        CX,
        CY,
        r,
        1.8 + rand() * 3.8,
        4 + Math.floor(rand() * 7),
        rand() * Math.PI * 2,
        1.2 + rand() * 2.4,
        9 + Math.floor(rand() * 8),
        rand() * Math.PI * 2
      );

      let color = '#2155d6';
      if (isSumiVein) {
        color = idx % 2 === 0 ? '#04060e' : '#080e24';
      } else if (isHighlight) {
        color = idx % 2 === 0 ? '#5c93ff' : '#8cb8ff';
      } else {
        const blues = ['#143aa8', '#1f52d4', '#2e6af2', '#3d7bff', '#0c2470'];
        color = blues[idx % blues.length];
      }

      const strokeWidth = isSumiVein
        ? 2.2 + rand() * 5.2
        : isHighlight
        ? 1.2 + rand() * 2.8
        : 2.0 + rand() * 4.5;

      const d1 = Math.round(90 + rand() * 280);
      const g1 = Math.round(30 + rand() * 130);
      const d2 = Math.round(40 + rand() * 180);
      const g2 = Math.round(40 + rand() * 160);
      const d3 = Math.round(120 + rand() * 220);
      const g3 = Math.round(25 + rand() * 95);

      return {
        d,
        color,
        strokeWidth: strokeWidth.toFixed(2),
        dashArray: `${d1} ${g1} ${d2} ${g2} ${d3} ${g3}`,
        dashOffset: Math.round(rand() * 1600),
        opacity: (isSumiVein ? 0.75 + rand() * 0.22 : 0.42 + rand() * 0.45).toFixed(2),
      };
    });

    // 3. Fast outer dry-brush "kasure" flying-white hairs & micro-bristles
    const fastRings = Array.from({ length: 26 }, (_, idx) => {
      const t = idx / 25;
      const r = BASE_R + 48 + t * 50; // 695..745 (outer dry-brush zone)
      const d = buildOrganicRingPath(
        CX,
        CY,
        r,
        2.0 + rand() * 4.2,
        5 + Math.floor(rand() * 8),
        rand() * Math.PI * 2,
        1.0 + rand() * 2.5,
        11 + Math.floor(rand() * 9),
        rand() * Math.PI * 2
      );

      const dryPalette = [
        '#091952',
        '#173eb5',
        '#2b63eb',
        '#4b83ff',
        '#7aaaff',
        '#050918',
        '#1d49c7',
      ];
      const color = dryPalette[idx % dryPalette.length];
      const strokeWidth = 0.65 + (1 - t * 0.65) * (0.8 + rand() * 1.6);

      // Broken dry-brush hair segments separated by wider paper gaps
      const seg1 = Math.round(28 + rand() * 115);
      const gap1 = Math.round(65 + rand() * 210);
      const seg2 = Math.round(15 + rand() * 75);
      const gap2 = Math.round(80 + rand() * 260);
      const seg3 = Math.round(45 + rand() * 140);
      const gap3 = Math.round(55 + rand() * 190);

      return {
        d,
        color,
        strokeWidth: strokeWidth.toFixed(2),
        dashArray: `${seg1} ${gap1} ${seg2} ${gap2} ${seg3} ${gap3}`,
        dashOffset: Math.round(rand() * 2000),
        opacity: (0.35 + (1 - t * 0.5) * 0.52).toFixed(2),
      };
    });

    // 4. Inner sumi-black bristle cut teeth along r = 636..652 so the sphere edge is organic
    const cutTeeth = Array.from({ length: 10 }, (_, idx) => {
      const r = BASE_R - 8 + idx * 2.2;
      const d = buildOrganicRingPath(
        CX,
        CY,
        r,
        2.2 + rand() * 3.5,
        6 + idx,
        rand() * Math.PI * 2,
        1.4 + rand() * 2.2,
        13 + idx * 2,
        rand() * Math.PI * 2
      );
      return {
        d,
        strokeWidth: (2.4 + rand() * 4.2).toFixed(1),
        dashArray: `${Math.round(60 + rand() * 190)} ${Math.round(20 + rand() * 80)} ${Math.round(
          90 + rand() * 220
        )} ${Math.round(30 + rand() * 90)}`,
        dashOffset: Math.round(rand() * 1000),
      };
    });

    // 5. Anchored calligraphic horizon sweeps (preserve exact upper-right icy highlight & bottom sumi-black sweep)
    // while flowing continuously along the arc via animated stroke-dashoffset
    const arcConfigs = [
      // Heavy sumi-black bottom sweep (characteristic thick dark brush pressure at bottom right)
      { r: 656, start: 6, end: 76, width: 22, color: '#04060d', opacity: 0.94, dur: 19, dash: '320 90 240 70' },
      { r: 668, start: 10, end: 78, width: 16, color: '#050813', opacity: 0.9, dur: 23, dash: '260 80 190 90' },
      { r: 680, start: 14, end: 76, width: 11, color: '#070d21', opacity: 0.85, dur: 17, dash: '210 95 160 85' },
      { r: 692, start: 18, end: 75, width: 7.5, color: '#09153b', opacity: 0.8, dur: 21, dash: '180 110 140 90' },
      // Core cobalt & ultramarine horizon body
      { r: 664, start: -72, end: 52, width: 18, color: '#103196', opacity: 0.78, dur: 26, dash: '420 75 310 65' },
      { r: 676, start: -70, end: 46, width: 14, color: '#1d4ed1', opacity: 0.82, dur: 22, dash: '360 85 280 75' },
      { r: 686, start: -66, end: 42, width: 10, color: '#2e68f2', opacity: 0.76, dur: 18, dash: '290 95 220 80' },
      // Longitudinal sumi-black ink veins cutting through the middle of the blue brush
      { r: 671, start: -68, end: 68, width: 4.5, color: '#040711', opacity: 0.92, dur: 20, dash: '240 70 160 95 290 80' },
      { r: 683, start: -64, end: 64, width: 3.6, color: '#060a18', opacity: 0.88, dur: 16, dash: '190 85 230 75 150 90' },
      { r: 695, start: -60, end: 58, width: 2.8, color: '#070e26', opacity: 0.82, dur: 24, dash: '160 95 130 85 210 90' },
      // Bright icy cerulean & electric cobalt outer split bristles on the upper/mid curve
      { r: 694, start: -58, end: 28, width: 6.5, color: '#5991ff', opacity: 0.78, dur: 15, dash: '220 90 170 110' },
      { r: 701, start: -52, end: 24, width: 4.2, color: '#8ab7ff', opacity: 0.84, dur: 19, dash: '180 110 130 95' },
      { r: 707, start: -46, end: 20, width: 2.6, color: '#b8d4ff', opacity: 0.75, dur: 14, dash: '130 120 95 110' },
      // Outer dry-brush dark indigo whisker strands peeling into the white paper
      { r: 713, start: -65, end: 62, width: 2.1, color: '#1539a6', opacity: 0.72, dur: 17, dash: '95 140 65 160 110 130' },
      { r: 719, start: -62, end: 58, width: 1.5, color: '#295ee0', opacity: 0.68, dur: 21, dash: '75 160 55 180 85 150' },
      { r: 726, start: -56, end: 54, width: 1.15, color: '#0d236b', opacity: 0.62, dur: 16, dash: '60 190 40 210 70 175' },
      { r: 733, start: -48, end: 48, width: 0.85, color: '#3b73f5', opacity: 0.54, dur: 19, dash: '45 220 35 240 50 200' },
    ];

    const builtArcs = arcConfigs.map((cfg, i) => {
      const { d, approxLen } = buildCalligraphicArcPath(
        CX,
        CY,
        cfg.r,
        cfg.start,
        cfg.end,
        1.8 + (i % 3) * 1.1,
        5 + (i % 4) * 2,
        i * 1.17
      );
      return {
        ...cfg,
        d,
        approxLen,
      };
    });

    // 6. Outer dry-brush ink flecks & micro-splatter along the rotating ring
    const flecks = Array.from({ length: 42 }, (_, i) => {
      const theta = (i / 42) * Math.PI * 2 + rand() * 0.12;
      const r = BASE_R + 68 + rand() * 34; // 715..749
      const x = CX + Math.cos(theta) * r;
      const y = CY + Math.sin(theta) * r;
      const tangentDeg = (theta * 180) / Math.PI + 90 + (rand() - 0.5) * 14;
      const rx = 1.8 + rand() * 4.5;
      const ry = 0.45 + rand() * 0.95;
      const fleckColors = ['#0c226b', '#1b47c4', '#3973f5', '#060b1c', '#5b92ff'];
      return {
        x: x.toFixed(1),
        y: y.toFixed(1),
        rot: tangentDeg.toFixed(1),
        rx: rx.toFixed(2),
        ry: ry.toFixed(2),
        color: fleckColors[i % fleckColors.length],
        opacity: (0.35 + rand() * 0.48).toFixed(2),
      };
    });

    // 7. Sparse 3D Starfield inside the Cosmic Sphere (34 stars in spherical coordinates)
    const starColPalette = ['#e4eeff', '#ffffff', '#bfd6ff', '#d4e2ff', '#ffeedd'];
    const starSeeds: StarSeed[] = Array.from({ length: 34 }, (_, i) => ({
      lon: rand() * Math.PI * 2,
      lat: (rand() - 0.5) * Math.PI * 0.88,
      r: 0.65 + rand() * 1.15,
      baseAlpha: 0.28 + rand() * 0.62,
      twinkleSpeed: 1.2 + rand() * 2.2,
      twinklePhase: rand() * Math.PI * 2,
      color: starColPalette[i % starColPalette.length],
    }));

    // 8. Sparse Warm Orange/Amber Embers rotating in the lower hemisphere of the 3D sphere
    const emberCorePalette = ['#ff7b3a', '#ff9b54', '#ff6020', '#ffb066', '#f04e18'];
    const emberGlowPalette = ['#ff5112', '#ff7730', '#d93800', '#ff8c42', '#e04008'];
    const emberSeeds: EmberSeed[] = Array.from({ length: 14 }, (_, i) => ({
      lon: (i / 14) * Math.PI * 2 + (rand() - 0.5) * 0.35,
      // Concentrated in the lower hemisphere matching the reference artwork
      lat: 0.05 + rand() * 0.62,
      rx: 1.8 + rand() * 2.6,
      ry: 1.1 + rand() * 1.6,
      rotDeg: -35 + rand() * 70,
      baseAlpha: 0.55 + rand() * 0.42,
      pulseSpeed: 1.5 + rand() * 2.0,
      pulsePhase: rand() * Math.PI * 2,
      coreColor: emberCorePalette[i % emberCorePalette.length],
      glowColor: emberGlowPalette[i % emberGlowPalette.length],
      speedMult: 1.12 + rand() * 0.16,
    }));

    return {
      voidClipD: buildVoidClipPath(),
      slowWashRings: slowRings,
      midCobaltRings: midRings,
      fastDryBristles: fastRings,
      innerCutTeeth: cutTeeth,
      anchoredArcs: builtArcs,
      outerFlecks: flecks,
      stars: starSeeds,
      embers: emberSeeds,
    };
  }, []);

  // 3D Sphere Projection + Continuous Calligraphic Rotation Loop
  // Automatically pauses when Section 1 (About) is scrolled out of view.
  useEffect(() => {
    let rafId = 0;
    let isSectionVisible = true;
    let isRunning = false;
    let lastTime = performance.now();
    let elapsed = 0;

    // 18-degree axial tilt matching the sweeping calligraphic horizon
    const tiltRad = -0.31;
    const cosTilt = Math.cos(tiltRad);
    const sinTilt = Math.sin(tiltRad);
    const SPHERE_R = BASE_R - 8; // 639px radius for inner 3D projection

    const renderFrame = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      elapsed += dt;

      // 1. Rotate the concentric calligraphic brushstroke layers around (CX, CY)
      const slowDeg = (elapsed * 4.2) % 360;
      const midDeg = (elapsed * 6.8) % 360;
      const fastDeg = (elapsed * 9.6) % 360;
      const cutDeg = (elapsed * 5.4) % 360;

      if (slowRingRef.current) {
        slowRingRef.current.setAttribute('transform', `rotate(${slowDeg.toFixed(2)} ${CX} ${CY})`);
      }
      if (midRingRef.current) {
        midRingRef.current.setAttribute('transform', `rotate(${midDeg.toFixed(2)} ${CX} ${CY})`);
      }
      if (fastRingRef.current) {
        fastRingRef.current.setAttribute('transform', `rotate(${fastDeg.toFixed(2)} ${CX} ${CY})`);
      }
      if (innerCutRingRef.current) {
        innerCutRingRef.current.setAttribute('transform', `rotate(${cutDeg.toFixed(2)} ${CX} ${CY})`);
      }

      // Subtle drift for the deep-space nebula clouds inside the sphere
      if (nebulaGroupRef.current) {
        const nebX = Math.sin(elapsed * 0.18) * 38;
        const nebY = Math.cos(elapsed * 0.14) * 24;
        const nebRot = Math.sin(elapsed * 0.09) * 8;
        nebulaGroupRef.current.setAttribute(
          'transform',
          `translate(${nebX.toFixed(1)}, ${nebY.toFixed(1)}) rotate(${nebRot.toFixed(2)} ${CX} ${CY})`
        );
      }

      // 2. Project 3D spherical stars onto the rotating globe
      const baseOmega = 0.21;
      for (let i = 0; i < stars.length; i++) {
        const el = starRefs.current[i];
        if (!el) continue;
        const s = stars[i];
        const lon = s.lon + elapsed * baseOmega;
        const cosLat = Math.cos(s.lat);
        const sinLat = Math.sin(s.lat);

        // 3D Cartesian coordinates on unit sphere (z > 0 is front hemisphere facing viewer)
        const x3d = cosLat * Math.sin(lon);
        const y3d = sinLat;
        const z3d = cosLat * Math.cos(lon);

        if (z3d <= 0.02) {
          el.setAttribute('opacity', '0');
          continue;
        }

        // Apply axial tilt in screen plane
        const tx = x3d * cosTilt - y3d * sinTilt;
        const ty = x3d * sinTilt + y3d * cosTilt;

        // Map onto the sphere canvas (stretch left hemisphere slightly so stars fill x=[0..CX] too)
        const xScale = tx < 0 ? 1.15 : 1.0;
        const sx = CX + tx * SPHERE_R * xScale;
        const sy = CY + ty * SPHERE_R;

        // 3D limb darkening near the curved horizon edge + gentle twinkle
        const limb = Math.min(1, z3d * 2.4);
        const twinkle = 0.82 + 0.18 * Math.sin(elapsed * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * limb * twinkle;

        el.setAttribute('cx', sx.toFixed(1));
        el.setAttribute('cy', sy.toFixed(1));
        el.setAttribute('opacity', alpha.toFixed(2));
      }

      // 3. Project 3D warm orange/amber embers rotating across the lower globe
      for (let i = 0; i < embers.length; i++) {
        const el = emberRefs.current[i];
        if (!el) continue;
        const e = embers[i];
        const lon = e.lon + elapsed * baseOmega * e.speedMult;
        const cosLat = Math.cos(e.lat);
        const sinLat = Math.sin(e.lat);

        const x3d = cosLat * Math.sin(lon);
        const y3d = sinLat;
        const z3d = cosLat * Math.cos(lon);

        if (z3d <= 0.04) {
          el.setAttribute('opacity', '0');
          continue;
        }

        const tx = x3d * cosTilt - y3d * sinTilt;
        const ty = x3d * sinTilt + y3d * cosTilt;

        const sx = CX + tx * (SPHERE_R * 0.92);
        const sy = CY + ty * (SPHERE_R * 0.92);

        // Foreshorten ember slightly near the 3D sphere limb
        const foreshorten = 0.55 + 0.45 * z3d;
        const limb = Math.min(1, z3d * 2.2);
        const pulse = 0.85 + 0.15 * Math.sin(elapsed * e.pulseSpeed + e.pulsePhase);
        const alpha = e.baseAlpha * limb * pulse;
        const spin = e.rotDeg + elapsed * 14;

        el.setAttribute(
          'transform',
          `translate(${sx.toFixed(1)}, ${sy.toFixed(1)}) rotate(${spin.toFixed(1)}) scale(${foreshorten.toFixed(2)}, 1)`
        );
        el.setAttribute('opacity', alpha.toFixed(2));
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    const startLoop = () => {
      if (!isRunning && isSectionVisible && !document.hidden) {
        isRunning = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (isRunning) {
        isRunning = false;
        cancelAnimationFrame(rafId);
      }
    };

    // Render initial static frame immediately so first paint is 100% populated
    isRunning = true;
    renderFrame(performance.now());
    isRunning = false;

    const handleAboutVisibility = (e: Event) => {
      const customEvent = e as CustomEvent<{ visible: boolean }>;
      isSectionVisible = Boolean(customEvent.detail?.visible);
      if (isSectionVisible) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const handleDocVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else if (isSectionVisible) {
        startLoop();
      }
    };

    window.addEventListener('about-webgl-visibility', handleAboutVisibility);
    document.addEventListener('visibilitychange', handleDocVisibility);
    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener('about-webgl-visibility', handleAboutVisibility);
      document.removeEventListener('visibilitychange', handleDocVisibility);
    };
  }, [stars, embers]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none pointer-events-none bg-[#fdfeff]">
      <svg
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        aria-hidden="true"
      >
        <defs>
          {/* 1. Calligraphic Dry-Brush Displacement Filter for Organic Sumi-e Bristle Edges */}
          <filter
            id="cosmic-ink-bristle-filter"
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014 0.032"
              numOctaves="3"
              seed="19"
              result="bristleNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="bristleNoise"
              scale="13"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Subtle finer dry-brush tooth filter for outer flying-white hairs */}
          <filter
            id="cosmic-ink-fine-hairs"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.028 0.065"
              numOctaves="2"
              seed="42"
              result="fineNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="fineNoise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* 2. Right-Hand Horizon Crescent Mask so full rotating rings only appear along the sphere's right rim */}
          <radialGradient id="crescent-fade-grad" cx="294" cy="503" r="780" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="76%" stopColor="#000000" />
            <stop offset="81%" stopColor="#ffffff" />
            <stop offset="97%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          <linearGradient id="horizon-side-mask-grad" x1="180" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="35%" stopColor="#000000" />
            <stop offset="72%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <mask id="enso-horizon-crescent-mask" maskUnits="userSpaceOnUse" x="-100" y="-150" width="1350" height="1380">
            <rect x="-100" y="-150" width="1350" height="1380" fill="url(#horizon-side-mask-grad)" />
          </mask>

          {/* 3. ClipPath for the 3D Cosmic Sphere Void on the Left */}
          <clipPath id="cosmic-void-clip" clipPathUnits="userSpaceOnUse">
            <path d={voidClipD} />
          </clipPath>

          {/* 4. 3D Spherical Volume & Limb-Darkening Gradients */}
          <radialGradient id="void-3d-sphere-grad" cx="420" cy="490" r="610" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#050916" />
            <stop offset="52%" stopColor="#03050c" />
            <stop offset="84%" stopColor="#020307" />
            <stop offset="100%" stopColor="#010104" />
          </radialGradient>

          <radialGradient id="nebula-cloud-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0e2258" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#071233" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#020307" stopOpacity="0" />
          </radialGradient>

          {/* Directional Chromatic Gradient for the Cobalt/Ultramarine/Sumi Brushstroke Rim */}
          <linearGradient id="cobalt-rim-vertical-grad" x1="780" y1="0" x2="740" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1b48c8" />
            <stop offset="28%" stopColor="#3570f7" />
            <stop offset="54%" stopColor="#1e50d6" />
            <stop offset="78%" stopColor="#0d2678" />
            <stop offset="100%" stopColor="#040817" />
          </linearGradient>
        </defs>

        {/* ===================================================================
            LAYER 1: STARK WHITE WASHI CANVAS (RIGHT SIDE)
            =================================================================== */}
        <rect x="0" y="0" width="1920" height="1080" fill="#fdfeff" />

        {/* ===================================================================
            LAYER 2: ROTATING & FLOWING CALLIGRAPHIC ENSO BRUSHSTROKE RIM
            =================================================================== */}
        <g mask="url(#enso-horizon-crescent-mask)">
          {/* Soft cobalt paper bleed / under-glow along the horizon */}
          <circle
            cx={CX}
            cy={CY}
            r={BASE_R + 30}
            fill="none"
            stroke="url(#cobalt-rim-vertical-grad)"
            strokeWidth="58"
            opacity="0.72"
            filter="url(#cosmic-ink-bristle-filter)"
          />

          {/* 2A. Slow-Rotating Deep Indigo & Ultramarine Foundation Wash Rings */}
          <g ref={slowRingRef} filter="url(#cosmic-ink-bristle-filter)">
            {slowWashRings.map((ring, idx) => (
              <path
                key={`slow-${idx}`}
                d={ring.d}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={ring.dashArray}
                strokeDashoffset={ring.dashOffset}
                opacity={ring.opacity}
              />
            ))}
          </g>

          {/* 2B. Medium-Rotating Electric Cobalt Bristle Striations & Sumi-Black Ink Veins */}
          <g ref={midRingRef} filter="url(#cosmic-ink-bristle-filter)">
            {midCobaltRings.map((ring, idx) => (
              <path
                key={`mid-${idx}`}
                d={ring.d}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={ring.dashArray}
                strokeDashoffset={ring.dashOffset}
                opacity={ring.opacity}
              />
            ))}
          </g>

          {/* 2C. Anchored Calligraphic Horizon Sweeps with Continuous Dash-Flow Animation */}
          <g filter="url(#cosmic-ink-bristle-filter)">
            {anchoredArcs.map((arc, idx) => (
              <path
                key={`arc-${idx}`}
                d={arc.d}
                fill="none"
                stroke={arc.color}
                strokeWidth={arc.width}
                strokeLinecap="round"
                strokeDasharray={arc.dash}
                opacity={arc.opacity}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to={-(arc.approxLen || 900)}
                  dur={`${arc.dur}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>

          {/* 2D. Fast-Rotating Outer Dry-Brush "Kasure" Flying-White Hairs & Ink Flecks */}
          <g ref={fastRingRef} filter="url(#cosmic-ink-fine-hairs)">
            {fastDryBristles.map((ring, idx) => (
              <path
                key={`fast-${idx}`}
                d={ring.d}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={ring.dashArray}
                strokeDashoffset={ring.dashOffset}
                opacity={ring.opacity}
              />
            ))}

            {/* Tangential dry-brush ink flecks orbiting along the outer bristle edge */}
            {outerFlecks.map((f, idx) => (
              <ellipse
                key={`fleck-${idx}`}
                cx={f.x}
                cy={f.y}
                rx={f.rx}
                ry={f.ry}
                fill={f.color}
                opacity={f.opacity}
                transform={`rotate(${f.rot} ${f.x} ${f.y})`}
              />
            ))}
          </g>
        </g>

        {/* ===================================================================
            LAYER 3: 3D ROTATING COSMIC SPHERE VOID (LEFT SIDE)
            =================================================================== */}
        <g clipPath="url(#cosmic-void-clip)">
          {/* Deep 3D Sphere Base with Limb Darkening */}
          <rect x="-150" y="-150" width="1250" height="1380" fill="url(#void-3d-sphere-grad)" />

          {/* Subtle Rotating Cosmic Nebula Dust Clouds on the Sphere */}
          <g ref={nebulaGroupRef}>
            <ellipse cx="420" cy="390" rx="340" ry="210" fill="url(#nebula-cloud-grad)" transform="rotate(-18 420 390)" />
            <ellipse cx="310" cy="690" rx="380" ry="240" fill="url(#nebula-cloud-grad)" transform="rotate(14 310 690)" />
          </g>

          {/* 3D Projected Fine Pinprick Stars Rotating Across the Globe */}
          <g>
            {stars.map((s, idx) => (
              <circle
                key={`star-${idx}`}
                ref={(el) => {
                  starRefs.current[idx] = el;
                }}
                cx={CX}
                cy={CY}
                r={s.r}
                fill={s.color}
                opacity={s.baseAlpha}
              />
            ))}
          </g>

          {/* 3D Projected Warm Orange/Amber Embers Rotating Across the Lower Globe */}
          <g>
            {embers.map((e, idx) => (
              <g
                key={`ember-${idx}`}
                ref={(el) => {
                  emberRefs.current[idx] = el;
                }}
                opacity={e.baseAlpha}
              >
                {/* Soft Warm Ember Halo */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={e.rx * 2.2}
                  ry={e.ry * 2.2}
                  fill={e.glowColor}
                  opacity="0.28"
                />
                {/* Crisp Calligraphic Ember Core */}
                <ellipse
                  cx="0"
                  cy="0"
                  rx={e.rx}
                  ry={e.ry}
                  fill={e.coreColor}
                />
              </g>
            ))}
          </g>
        </g>

        {/* ===================================================================
            LAYER 4: INNER CALLIGRAPHIC SUMI-BLACK CUT TEETH
            Seamless ragged bristle transition between the black sphere & blue rim
            =================================================================== */}
        <g mask="url(#enso-horizon-crescent-mask)">
          <g ref={innerCutRingRef} filter="url(#cosmic-ink-bristle-filter)">
            {innerCutTeeth.map((tooth, idx) => (
              <path
                key={`cut-${idx}`}
                d={tooth.d}
                fill="none"
                stroke="#03050a"
                strokeWidth={tooth.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={tooth.dashArray}
                strokeDashoffset={tooth.dashOffset}
                opacity="0.96"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};
