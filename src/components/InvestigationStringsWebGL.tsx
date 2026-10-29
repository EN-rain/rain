import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface PinPosition {
  id: string;
  xPct: number; // 0 - 100%
  yPct: number; // 0 - 100%
}

export interface StringConnection {
  from: string;
  to: string;
  sag?: number; // Catenary sag in canvas units
  tension?: number;
}

export interface ActiveObstacleBox {
  minX: number; // in percentage of board content (0 - 100)
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ActiveItemObstacles {
  itemId: string;
  frameBox?: ActiveObstacleBox;
  noteBox?: ActiveObstacleBox;
}

export interface InvestigationStringsWebGLProps {
  pins?: PinPosition[];
  connections?: StringConnection[];
  activeItemId?: string | null;
  obstacles?: ActiveItemObstacles | null;
  lampOn?: boolean;
  active?: boolean;
  entered?: boolean;
  className?: string;
}

const DEFAULT_PINS: PinPosition[] = [
  { id: 'item-1', xPct: 14, yPct: 7 },
  { id: 'item-2', xPct: 47, yPct: 10 },
  { id: 'item-3', xPct: 80, yPct: 6 },
  { id: 'item-4', xPct: 16, yPct: 58 },
  { id: 'item-5', xPct: 48, yPct: 60 },
  { id: 'item-6', xPct: 80, yPct: 57 },
];

const DEFAULT_CONNECTIONS: StringConnection[] = [
  { from: 'item-1', to: 'item-2', sag: 11 },
  { from: 'item-2', to: 'item-3', sag: 9 },
  { from: 'item-1', to: 'item-4', sag: 5 },
  { from: 'item-2', to: 'item-5', sag: 8 },
  { from: 'item-4', to: 'item-5', sag: 13 },
  { from: 'item-5', to: 'item-6', sag: 11 },
  { from: 'item-3', to: 'item-6', sag: 7 },
  { from: 'item-2', to: 'item-4', sag: 15 },
];

function pointInBox(x: number, y: number, box: ActiveObstacleBox): boolean {
  return x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY;
}

function lineIntersectsLine(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 1e-8) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function segmentIntersectsBox(
  x1: number, y1: number, x2: number, y2: number,
  box: ActiveObstacleBox
): boolean {
  if (pointInBox(x1, y1, box) || pointInBox(x2, y2, box)) {
    return true;
  }
  if (lineIntersectsLine(x1, y1, x2, y2, box.minX, box.minY, box.maxX, box.minY)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, box.minX, box.maxY, box.maxX, box.maxY)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, box.minX, box.minY, box.minX, box.maxY)) return true;
  if (lineIntersectsLine(x1, y1, x2, y2, box.maxX, box.minY, box.maxX, box.maxY)) return true;
  return false;
}

function curveIntersectsObstacle(
  curvePoints: Array<{ x: number; y: number }>,
  box?: ActiveObstacleBox
): boolean {
  if (!box) return false;
  for (let i = 0; i < curvePoints.length - 1; i++) {
    const p1 = curvePoints[i];
    const p2 = curvePoints[i + 1];
    if (segmentIntersectsBox(p1.x, p1.y, p2.x, p2.y, box)) {
      return true;
    }
  }
  return false;
}

function checkYarnIntersectsObstacles(
  pctPoints: Array<{ x: number; y: number }>,
  obstacles?: ActiveItemObstacles | null
): boolean {
  if (!obstacles) return false;
  if (obstacles.frameBox && curveIntersectsObstacle(pctPoints, obstacles.frameBox)) {
    return true;
  }
  if (obstacles.noteBox && curveIntersectsObstacle(pctPoints, obstacles.noteBox)) {
    return true;
  }
  return false;
}

interface StringMeshEntry {
  mainMesh: THREE.Mesh;
  shadowMesh: THREE.Mesh;
  mainGeom: THREE.TubeGeometry;
  shadowGeom: THREE.TubeGeometry;
  mainMaterial: THREE.MeshStandardMaterial;
  shadowMaterial: THREE.MeshBasicMaterial;
  basePoints: THREE.Vector3[];
  pctPoints: Array<{ x: number; y: number }>;
  sag: number;
  fromId: string;
  toId: string;
  index: number;
  phase: number;
  currentOpacity: number;
  targetOpacity: number;
}

const VIRTUAL_WIDTH = 1024;
const VIRTUAL_HEIGHT = 477;

export const InvestigationStringsWebGL: React.FC<InvestigationStringsWebGLProps> = ({
  pins = DEFAULT_PINS,
  connections = DEFAULT_CONNECTIONS,
  activeItemId = null,
  obstacles = null,
  lampOn = false,
  active = true,
  entered = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeItemIdRef = useRef(activeItemId);
  const obstaclesRef = useRef(obstacles);
  const lampOnRef = useRef(lampOn);
  const activeRef = useRef(active);
  const enteredRef = useRef(entered);
  const enterStartTimeRef = useRef<number>(performance.now());
  const startLoopRef = useRef<(() => void) | null>(null);
  const rebuildMeshesRef = useRef<((p: PinPosition[], c: StringConnection[]) => void) | null>(null);

  activeItemIdRef.current = activeItemId;
  obstaclesRef.current = obstacles;
  lampOnRef.current = lampOn;
  activeRef.current = active;

  useEffect(() => {
    enteredRef.current = entered;
    if (entered) {
      enterStartTimeRef.current = performance.now();
      startLoopRef.current?.();
    }
  }, [entered]);

  useEffect(() => {
    if (active) {
      startLoopRef.current?.();
    }
  }, [active]);

  useEffect(() => {
    const effectivePins = pins.length > 0 ? pins : DEFAULT_PINS;
    rebuildMeshesRef.current?.(effectivePins, connections);
  }, [pins, connections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let animationFrameId: number | null = null;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      0,
      VIRTUAL_WIDTH,
      VIRTUAL_HEIGHT,
      0,
      -100,
      200
    );
    camera.position.z = 80;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(VIRTUAL_WIDTH, VIRTUAL_HEIGHT, false);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 2.4);
    dirLight.position.set(250, 450, 200);
    scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0xaa7766, 1.3);
    scene.add(ambLight);

    let stringEntries: StringMeshEntry[] = [];
    let geometryDisposables: THREE.BufferGeometry[] = [];

    const clearMeshes = () => {
      stringEntries.forEach((entry) => {
        scene.remove(entry.mainMesh);
        scene.remove(entry.shadowMesh);
        entry.mainMaterial.dispose();
        entry.shadowMaterial.dispose();
      });
      geometryDisposables.forEach((g) => g.dispose());
      stringEntries = [];
      geometryDisposables = [];
    };

    const buildMeshes = (currentPins: PinPosition[], currentConnections: StringConnection[]) => {
      clearMeshes();

      const pinMap = new Map<string, PinPosition>();
      currentPins.forEach((p) => pinMap.set(p.id, p));

      currentConnections.forEach((conn, index) => {
        const p1 = pinMap.get(conn.from);
        const p2 = pinMap.get(conn.to);
        if (!p1 || !p2) return;

        const x1 = (p1.xPct / 100) * VIRTUAL_WIDTH;
        const y1 = VIRTUAL_HEIGHT - (p1.yPct / 100) * VIRTUAL_HEIGHT;
        const x2 = (p2.xPct / 100) * VIRTUAL_WIDTH;
        const y2 = VIRTUAL_HEIGHT - (p2.yPct / 100) * VIRTUAL_HEIGHT;

        const sagAmount = conn.sag ?? 10;
        const N_SAMPLES = 28;
        const points: THREE.Vector3[] = [];
        const shadowPoints: THREE.Vector3[] = [];
        const pctPoints: Array<{ x: number; y: number }> = [];

        for (let i = 0; i <= N_SAMPLES; i++) {
          const t = i / N_SAMPLES;
          const xt = x1 + t * (x2 - x1);
          const yt = y1 + t * (y2 - y1) - 4 * t * (1 - t) * sagAmount;
          const zt = 8 + 4 * t * (1 - t) * 6;

          points.push(new THREE.Vector3(xt, yt, zt));
          shadowPoints.push(new THREE.Vector3(xt + 2.5, yt - 3.5, 0.5));

          const xtPct = p1.xPct + t * (p2.xPct - p1.xPct);
          const ytPct = p1.yPct + t * (p2.yPct - p1.yPct) + 4 * t * (1 - t) * ((sagAmount / VIRTUAL_HEIGHT) * 100);
          pctPoints.push({ x: xtPct, y: ytPct });
        }

        const mainCurve = new THREE.CatmullRomCurve3(points);
        const mainGeom = new THREE.TubeGeometry(mainCurve, 36, 1.15, 8, false);
        geometryDisposables.push(mainGeom);

        const mainMat = new THREE.MeshStandardMaterial({
          color: 0xd21d28,
          roughness: 0.35,
          metalness: 0.1,
          emissive: 0x220205,
          emissiveIntensity: 0.15,
          transparent: true,
          opacity: 1.0,
        });

        const mainMesh = new THREE.Mesh(mainGeom, mainMat);
        scene.add(mainMesh);

        const shadowCurve = new THREE.CatmullRomCurve3(shadowPoints);
        const shadowGeom = new THREE.TubeGeometry(shadowCurve, 36, 1.35, 6, false);
        geometryDisposables.push(shadowGeom);

        const shadowMat = new THREE.MeshBasicMaterial({
          color: 0x140803,
          transparent: true,
          opacity: 0.38,
        });

        const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
        scene.add(shadowMesh);

        stringEntries.push({
          mainMesh,
          shadowMesh,
          mainGeom,
          shadowGeom,
          mainMaterial: mainMat,
          shadowMaterial: shadowMat,
          basePoints: points,
          pctPoints,
          sag: sagAmount,
          fromId: conn.from,
          toId: conn.to,
          index,
          phase: index * 0.73,
          currentOpacity: 1.0,
          targetOpacity: 1.0,
        });
      });

      lastEvaluatedActiveId = undefined;
      renderer?.render(scene, camera);
    };

    let lastEvaluatedActiveId: string | null | undefined = undefined;
    let lastEvaluatedObstacles: ActiveItemObstacles | null | undefined = undefined;

    rebuildMeshesRef.current = buildMeshes;
    buildMeshes(pins.length > 0 ? pins : DEFAULT_PINS, connections);

    const clock = new THREE.Clock();

    const renderLoop = () => {
      animationFrameId = null;
      if (disposed || !activeRef.current) return;

      const elapsedTime = clock.getElapsedTime();
      const currentActiveId = activeItemIdRef.current;
      const currentObstacles = obstaclesRef.current;

      // Only evaluate 2D curve-vs-box intersections when active item or obstacles change
      if (
        currentActiveId !== lastEvaluatedActiveId ||
        currentObstacles !== lastEvaluatedObstacles
      ) {
        lastEvaluatedActiveId = currentActiveId;
        lastEvaluatedObstacles = currentObstacles;

        stringEntries.forEach((entry) => {
          if (currentActiveId) {
            const isConnected = entry.fromId === currentActiveId || entry.toId === currentActiveId;
            const isIntersecting = checkYarnIntersectsObstacles(entry.pctPoints, currentObstacles);
            if (isIntersecting) {
              entry.targetOpacity = 0.08;
            } else if (isConnected) {
              entry.targetOpacity = 0.15;
            } else {
              entry.targetOpacity = 1.0;
            }
          } else {
            entry.targetOpacity = 1.0;
          }
        });
      }

      const introElapsedSec = (performance.now() - enterStartTimeRef.current) * 0.001;
      const isEntered = enteredRef.current;

      stringEntries.forEach((entry) => {
        // Staggered 3D yarn string draw-in on Page 2 intro
        if (!isEntered) {
          entry.mainGeom.setDrawRange(0, 0);
          entry.shadowGeom.setDrawRange(0, 0);
          return;
        }

        const delaySec = 0.28 + entry.index * 0.055;
        const rawDraw = Math.max(0, Math.min(1, (introElapsedSec - delaySec) / 0.42));
        // Ease-out cubic
        const drawProgress = 1 - Math.pow(1 - rawDraw, 3);
        if (drawProgress < 1) {
          const segs = Math.floor(drawProgress * 36);
          entry.mainGeom.setDrawRange(0, segs * 48);
          entry.shadowGeom.setDrawRange(0, segs * 36);
        } else {
          entry.mainGeom.setDrawRange(0, Infinity);
          entry.shadowGeom.setDrawRange(0, Infinity);
        }

        entry.currentOpacity += (entry.targetOpacity - entry.currentOpacity) * 0.12;
        entry.mainMaterial.opacity = entry.currentOpacity * drawProgress;
        entry.shadowMaterial.opacity = entry.currentOpacity * 0.38 * drawProgress;

        const isConnectedToActive =
          currentActiveId && (entry.fromId === currentActiveId || entry.toId === currentActiveId);

        if (isConnectedToActive && entry.currentOpacity > 0.3) {
          const pulse = (Math.sin(elapsedTime * 4.0) + 1) * 0.5;
          entry.mainMaterial.emissiveIntensity = 0.35 + pulse * 0.3;
          entry.mainMaterial.color.setHex(0xff2e38);
        } else {
          entry.mainMaterial.emissiveIntensity = 0.15;
          entry.mainMaterial.color.setHex(0xd21d28);
        }

        const wave = Math.sin(elapsedTime * 2.2 + entry.phase) * 0.4;
        entry.mainMesh.position.y = wave;
        entry.mainMesh.position.z = Math.cos(elapsedTime * 1.8 + entry.phase) * 0.3;
      });

      const targetDir = lampOnRef.current ? 2.4 : 0.8;
      const targetAmb = lampOnRef.current ? 1.3 : 0.45;
      dirLight.intensity += (targetDir - dirLight.intensity) * 0.08;
      ambLight.intensity += (targetAmb - ambLight.intensity) * 0.08;

      renderer?.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!canvas || !renderer) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        renderer.setSize(rect.width, rect.height, false);
      }
    };

    startLoopRef.current = () => {
      if (animationFrameId === null && !disposed && activeRef.current) {
        handleResize();
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    if (activeRef.current) {
      startLoopRef.current();
    }

    return () => {
      disposed = true;
      startLoopRef.current = null;
      rebuildMeshesRef.current = null;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearMeshes();
      renderer?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-[4] ${className}`}
      style={{
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
};

export default InvestigationStringsWebGL;
