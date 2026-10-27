export const ENSO_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const ENSO_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  uniform float uTime;
  uniform float uAspect;
  uniform float uFlowSpeed;
  uniform float uBristleDetail;
  uniform float uInkDensity;
  uniform float uEmberIntensity;
  uniform float uHorizonRadius;

  uniform vec3 uDeepInk;
  uniform vec3 uCoreBlue;
  uniform vec3 uBrightEdge;
  uniform vec3 uEmberPrimary;
  uniform vec3 uEmberSecondary;

  // ---------------------------------------------------------------------------
  // High-precision hashes & procedural noise
  // ---------------------------------------------------------------------------
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
  }

  float noise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      v += a * noise2D(p);
      p = rot * p * 2.03 + vec2(17.1, 31.7);
      a *= 0.5;
    }
    return v;
  }

  float ridgeFbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.866, 0.5, -0.5, 0.866);
    for (int i = 0; i < 4; i++) {
      float n = noise2D(p);
      n = 1.0 - abs(n * 2.0 - 1.0);
      v += a * n * n;
      p = rot * p * 2.12 + vec2(9.3, 14.8);
      a *= 0.5;
    }
    return v;
  }

  // ---------------------------------------------------------------------------
  // 3D Rotating Sphere Interior (Sparse Starfield & Subtle Embers)
  // ---------------------------------------------------------------------------
  vec3 renderRotatingSphereVoid(vec2 metricRel, float baseRadius, float voidMask, float time) {
    vec3 col = vec3(0.006, 0.007, 0.011);

    // Map 2D disc position onto a true 3D sphere of radius baseRadius
    vec2 normP = metricRel / max(baseRadius, 0.001);
    float r2 = dot(normP, normP);
    float z = sqrt(max(0.0, 1.0 - min(r2, 1.0)));
    vec3 sphereNormal = normalize(vec3(normP.x, normP.y, z));

    // Tilt the sphere's rotational axis slightly (-18 deg) to match the sweeping arc
    float tilt = -0.32;
    mat2 tiltMat = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt));
    vec3 pTilted = sphereNormal;
    pTilted.xy = tiltMat * pTilted.xy;

    // Spherical coordinates (longitude, latitude) rotating continuously over time
    float rotAngle = time * 0.22;
    float lon = atan(pTilted.x, pTilted.z) - rotAngle;
    float lat = asin(clamp(pTilted.y, -1.0, 1.0));

    // Seamless spherical UV for surface/volume features rotating in 3D
    vec2 sphereUv = vec2(lon / 3.14159265, lat / 1.5707963);

    // Subtle rotating dark cosmic cloud bands on the sphere
    float dust = fbm(sphereUv * vec2(4.5, 3.5) + vec2(time * 0.02, 0.0));
    col += vec3(0.005, 0.009, 0.020) * smoothstep(0.48, 0.85, dust) * (0.4 + 0.6 * z);

    // Limb darkening near the sphere edge for 3D depth
    float limb = smoothstep(0.0, 0.35, z);

    // Tier 1: Sparse, fine pinprick stars rotating with the 3D sphere
    {
      vec2 grid = sphereUv * vec2(110.0, 55.0);
      vec2 id = floor(grid);
      vec2 gv = fract(grid) - 0.5;
      vec2 rnd = hash22(id + 19.3);
      float prob = hash12(id + 73.1);
      if (prob > 0.962) {
        vec2 offset = (rnd - 0.5) * 0.68;
        float d = length(gv - offset);
        float twinkle = 0.85 + 0.15 * sin(time * 1.6 + prob * 40.0);
        float star = smoothstep(0.11, 0.01, d) * (0.25 + 0.55 * fract(prob * 19.3)) * twinkle;
        col += vec3(0.82, 0.88, 0.98) * star * limb;
      }
    }

    return col * voidMask;
  }

  void main() {
    vec2 refUv = vec2((vUv.x - 0.5) * (uAspect / 1.77778) + 0.5, vUv.y);
    vec2 pos = vec2(refUv.x * 1.77778, refUv.y);

    // Fixed sphere center and radius calibrated so the rim sits between left & right columns
    vec2 center = vec2(0.205, 0.52);
    float baseRadius = 0.5987 * uHorizonRadius;

    vec2 rel = pos - center;
    float xScale = rel.x < 0.0 ? 0.32 : 1.0;
    vec2 metricRel = vec2(rel.x * xScale, rel.y);

    float r = length(metricRel);

    // Raw angle and continuously rotating angular coordinate so the sphere's rim rotates
    float rawTheta = atan(rel.y, max(rel.x, -0.2));
    float spinTime = uTime * max(uFlowSpeed, 0.35);
    float rotTheta = rawTheta - spinTime * 0.28;

    float dr = r - baseRadius;

    // -------------------------------------------------------------------------
    // Rotating Calligraphic Brushstroke Rim
    // -------------------------------------------------------------------------
    float edgeWobble = (fbm(vec2(rotTheta * 2.4, 1.7 + spinTime * 0.08)) - 0.5) * 0.016;
    float outerSweep = (fbm(vec2(rotTheta * 1.8, 5.3 - spinTime * 0.06)) - 0.5) * 0.022;

    float bandWidthMod = mix(1.18, 0.88, smoothstep(-0.85, 0.82, rawTheta));
    float normDr = (dr - edgeWobble) / (0.118 * bandWidthMod);

    // Longitudinal Sumi-e bristle striations rotating around the perimeter of the sphere
    float warp1 = fbm(vec2(rotTheta * 2.2, normDr * 6.5));
    float warp2 = fbm(vec2(rotTheta * 5.5 + spinTime * 0.15, normDr * 16.0 + warp1 * 2.2));

    float detailScale = mix(0.65, 1.45, uBristleDetail);
    float bristlesCoarse = ridgeFbm(vec2(rotTheta * 1.6, (normDr + warp1 * 0.08) * 18.0 * detailScale));
    float bristlesFine   = ridgeFbm(vec2(rotTheta * 3.8 + spinTime * 0.2, (normDr + warp2 * 0.04) * 46.0 * detailScale));
    float microHairs     = sin((normDr + warp2 * 0.025) * 210.0 * detailScale + warp1 * 6.0) * 0.5 + 0.5;

    float bristleTexture = bristlesCoarse * 0.48 + bristlesFine * 0.36 + microHairs * 0.16;

    // Heavy black brush sweep at the bottom of the sphere
    float bottomBlackSweep = smoothstep(-0.15, -0.78, rawTheta) *
                             smoothstep(0.68, 0.12, normDr + (warp1 - 0.5) * 0.35);

    float innerCut = smoothstep(
      -0.02,
      0.11 + bottomBlackSweep * 0.25,
      normDr + (bristlesCoarse - 0.5) * 0.14 + (warp2 - 0.5) * 0.09
    );

    // Dark sumi-ink ribbons rotating along the sphere's brushstroke ring
    float veinCoord1 = abs(normDr - 0.26 + (warp1 - 0.5) * 0.16);
    float vein1 = smoothstep(0.055 * uInkDensity, 0.008, veinCoord1) *
                  smoothstep(0.32, 0.68, fbm(vec2(rotTheta * 3.5, 11.2)));

    float veinCoord2 = abs(normDr - 0.52 + (warp2 - 0.5) * 0.14);
    float vein2 = smoothstep(0.042 * uInkDensity, 0.006, veinCoord2) *
                  smoothstep(0.36, 0.72, fbm(vec2(rotTheta * 4.8, 23.4)));

    float veinCoord3 = abs(normDr - 0.74 + (warp1 - 0.5) * 0.11);
    float vein3 = smoothstep(0.032 * uInkDensity, 0.004, veinCoord3) *
                  smoothstep(0.42, 0.76, fbm(vec2(rotTheta * 6.2, 37.9)));

    float blackInkVeins = clamp(vein1 * 0.92 + vein2 * 0.85 + vein3 * 0.75 + bottomBlackSweep * 0.88, 0.0, 1.0);

    // Outer dry-brush bristles peeling off as the sphere turns
    float mainBodyOuter = 1.0 - smoothstep(
      0.66,
      0.96,
      normDr + (bristlesCoarse - 0.5) * 0.22 + outerSweep * 2.0
    );

    float dryHairWave = sin((normDr + warp1 * 0.03) * 165.0 * detailScale) * 0.5 + 0.5;
    float dryHairGate = fbm(vec2(rotTheta * 5.2, normDr * 12.0));
    float outerWhisps = smoothstep(0.62, 0.75, normDr) *
                        (1.0 - smoothstep(0.88, 1.22, normDr + (warp2 - 0.5) * 0.18)) *
                        smoothstep(0.62, 0.88, dryHairWave) *
                        smoothstep(0.42, 0.68, dryHairGate);

    float fleckNoise = hash12(floor(vec2(rotTheta * 95.0, normDr * 140.0)));
    float outerFlecks = step(0.975, fleckNoise) *
                        smoothstep(0.78, 0.92, normDr) *
                        (1.0 - smoothstep(1.05, 1.28, normDr)) *
                        smoothstep(0.45, 0.75, dryHairGate);

    float brushCoverage = clamp(mainBodyOuter + outerWhisps * 0.82 + outerFlecks * 0.75, 0.0, 1.0);

    // Chromatic stratification of the cobalt/ultramarine ring
    vec3 ringColor = uDeepInk;
    float cobaltMix = smoothstep(0.08, 0.45, normDr) *
                      smoothstep(0.95, 0.52, normDr) *
                      (0.55 + 0.65 * bristleTexture);
    ringColor = mix(ringColor, uCoreBlue, clamp(cobaltMix, 0.0, 1.0));

    float highlightMix = smoothstep(0.42, 0.78, normDr) *
                         (0.35 + 0.75 * bristlesFine);
    ringColor = mix(ringColor, uBrightEdge, clamp(highlightMix, 0.0, 1.0));

    vec3 sumiBlack = vec3(0.012, 0.015, 0.028);
    ringColor = mix(ringColor, sumiBlack, blackInkVeins);

    vec3 whispColor = mix(uDeepInk * 0.65, uCoreBlue * 0.85, bristlesFine);
    ringColor = mix(ringColor, whispColor, outerWhisps * (1.0 - mainBodyOuter));

    // Composite 3D rotating sphere interior + brushstroke rim + white canvas
    float voidMask = 1.0 - innerCut;
    vec3 voidColor = renderRotatingSphereVoid(metricRel, baseRadius, voidMask, spinTime);

    float paperGrain = (hash12(vUv * 1200.0) - 0.5) * 0.006;
    vec3 whiteCanvas = clamp(vec3(0.996, 0.997, 1.0) + paperGrain, 0.0, 1.0);

    vec3 exteriorAndRing = mix(whiteCanvas, ringColor, brushCoverage);
    vec3 finalColor = mix(voidColor, exteriorAndRing, innerCut);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
