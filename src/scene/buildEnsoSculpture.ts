import * as THREE from 'three';

// Pre-allocated module-scope math helpers (Zero GC in render loop)
const _mat4 = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scale = new THREE.Vector3();
const _color = new THREE.Color();

export interface EmberInstanceData {
  radius: number;
  lon: number;
  lat: number;
  speed: number;
  phase: number;
  baseScale: THREE.Vector3;
}

export interface EnsoSculptureRig {
  rootGroup: THREE.Group;
  embersMesh: THREE.InstancedMesh;
  starsMesh: THREE.InstancedMesh;
  emberData: EmberInstanceData[];
  customMaterials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
  update: (
    elapsed: number,
    delta: number,
    flowSpeed: number,
    spatialBlend: number,
    paletteColors: {
      deepInk: [number, number, number];
      coreBlue: [number, number, number];
      brightEdge: [number, number, number];
      emberPrimary: [number, number, number];
    }
  ) => void;
  dispose: () => void;
}

export function buildEnsoSculpture(
  _renderer: THREE.WebGLRenderer,
  _isSoftwareGl: boolean
): EnsoSculptureRig {
  const rootGroup = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const customMaterials: THREE.Material[] = [];

  // ---------------------------------------------------------------------------
  // Sparse 3D Instanced Embers Rotating on the Sphere (10 subtle flecks)
  // ---------------------------------------------------------------------------
  const emberCount = 10;
  const emberGeo = new THREE.OctahedronGeometry(0.0085, 1);
  geometries.push(emberGeo);

  const emberMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xf27835),
    transparent: true,
    opacity: 0.85,
  });
  customMaterials.push(emberMat);

  const embersMesh = new THREE.InstancedMesh(emberGeo, emberMat, emberCount);
  embersMesh.frustumCulled = false;

  const emberData: EmberInstanceData[] = [];
  for (let i = 0; i < emberCount; i++) {
    const radius = 0.55 + Math.random() * 0.78;
    const lon = -1.2 + Math.random() * 2.4;
    const lat = -0.75 + Math.random() * 0.55;
    const speed = 0.20 + Math.random() * 0.08;
    const phase = Math.random() * Math.PI * 2;
    const s = 0.65 + Math.random() * 0.75;
    const baseScale = new THREE.Vector3(s, s * 1.25, s);

    emberData.push({ radius, lon, lat, speed, phase, baseScale });

    _pos.set(-0.8, -0.3, 0.1);
    _quat.identity();
    _mat4.compose(_pos, _quat, baseScale);
    embersMesh.setMatrixAt(i, _mat4);

    _color.setHSL(0.045 + Math.random() * 0.035, 0.92, 0.56 + Math.random() * 0.15);
    embersMesh.setColorAt(i, _color);
  }
  embersMesh.instanceMatrix.needsUpdate = true;
  if (embersMesh.instanceColor) embersMesh.instanceColor.needsUpdate = true;
  embersMesh.computeBoundingSphere();
  rootGroup.add(embersMesh);

  // ---------------------------------------------------------------------------
  // Sparse 3D Instanced Stars (18 subtle pinpricks)
  // ---------------------------------------------------------------------------
  const starCount = 18;
  const starGeo = new THREE.OctahedronGeometry(0.004, 0);
  geometries.push(starGeo);

  const starMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xeef4ff),
    transparent: true,
    opacity: 0.55,
  });
  customMaterials.push(starMat);

  const starsMesh = new THREE.InstancedMesh(starGeo, starMat, starCount);
  starsMesh.frustumCulled = false;

  for (let i = 0; i < starCount; i++) {
    const sx = -2.2 + Math.random() * 1.65;
    const sy = -1.25 + Math.random() * 2.5;
    const sz = 0.05 + (Math.random() - 0.5) * 0.4;
    _pos.set(sx, sy, sz);
    const sc = 0.5 + Math.random() * 0.7;
    _scale.set(sc, sc, sc);
    _quat.identity();
    _mat4.compose(_pos, _quat, _scale);
    starsMesh.setMatrixAt(i, _mat4);
  }
  starsMesh.instanceMatrix.needsUpdate = true;
  starsMesh.computeBoundingSphere();
  rootGroup.add(starsMesh);

  // ---------------------------------------------------------------------------
  // Per-frame Update: Spherical Orbit of Embers
  // ---------------------------------------------------------------------------
  const sphereCenterX = -0.72;
  const sphereCenterY = 0.06;
  const tilt = -0.32;
  const cosTilt = Math.cos(tilt);
  const sinTilt = Math.sin(tilt);

  const update: EnsoSculptureRig['update'] = (
    elapsed,
    _delta,
    flowSpeed,
    _spatialBlend,
    paletteColors
  ) => {
    const activeSpeed = Math.max(flowSpeed, 0.35);

    emberMat.color.setRGB(...paletteColors.emberPrimary);
    for (let i = 0; i < emberCount; i++) {
      const d = emberData[i];
      const rawLon = d.lon + elapsed * activeSpeed * d.speed;
      const wrappedLon = ((((rawLon + 1.35) % 2.7) + 2.7) % 2.7) - 1.35;

      const cosLat = Math.cos(d.lat);
      const sx = Math.sin(wrappedLon) * cosLat * d.radius;
      const sy = Math.sin(d.lat) * d.radius;
      const sz = Math.cos(wrappedLon) * cosLat * 0.35;

      const tx = sx * cosTilt - sy * sinTilt;
      const ty = sx * sinTilt + sy * cosTilt;

      _pos.set(sphereCenterX + tx, sphereCenterY + ty, 0.05 + sz);
      _euler.set(elapsed * 0.6 + d.phase, elapsed * 0.8, d.phase);
      _quat.setFromEuler(_euler);

      const limbFade = Math.max(0.0, Math.cos(wrappedLon * 1.1));
      _scale.copy(d.baseScale).multiplyScalar(limbFade);

      _mat4.compose(_pos, _quat, _scale);
      embersMesh.setMatrixAt(i, _mat4);
    }
    embersMesh.instanceMatrix.needsUpdate = true;
  };

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    customMaterials.forEach((m) => m.dispose());
  };

  return {
    rootGroup,
    embersMesh,
    starsMesh,
    emberData,
    customMaterials,
    geometries,
    update,
    dispose,
  };
}
