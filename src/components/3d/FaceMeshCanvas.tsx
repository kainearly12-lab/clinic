import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { skinZones, SkinZone } from '@/data/skinZonesData';
import { Sparkles, Check, RotateCcw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface FaceMeshCanvasProps {
  selectedZone: SkinZone;
  onSelectZone: (zone: SkinZone) => void;
  reducedMotion?: boolean;
}

/**
 * Procedural Anatomical 3D Human Head Geometry
 * Sculpted with accurate facial topography:
 * - Rounded cranium and parietal curvature
 * - Sloped forehead & supraorbital brow ridge
 * - Realistic concave orbital eye sockets and eyelid crease
 * - Projected nasal bridge, crisp dorsum, apex tip, and alar wings
 * - Prominent zygomatic cheekbones
 * - Detailed philtrum, Cupid's bow, vermilion border, and lips
 * - Structured angular mandible jawline and mental protuberance (chin)
 * - Anatomical cylindrical neck column
 */
function createAnatomicalHeadGeometry(): THREE.BufferGeometry {
  const vSegments = 72;
  const hSegments = 60;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= vSegments; i++) {
    const v = i / vSegments;
    // Y runs from top of cranium (+1.55) down to base of neck (-1.35)
    const y = 1.55 - 2.9 * v;

    for (let j = 0; j <= hSegments; j++) {
      const u = j / hSegments;
      // Angle: 0 is front (+Z), ±PI is back (-Z)
      const angle = (u - 0.5) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Base Cranium & Head dimensions
      let rx = 1.0;
      let rz = 1.16;
      let zOffset = -0.05;

      if (y > 0.85) {
        // Top of skull (Cranium dome)
        const topT = (y - 0.85) / 0.7;
        const domeCurve = Math.sqrt(Math.max(0, 1 - topT * topT));
        rx = (0.84 + 0.26 * (1 - topT)) * domeCurve;
        rz = (1.06 + 0.22 * (1 - topT)) * domeCurve;
        zOffset = -0.12 * (1 - domeCurve);
      } else if (y > 0.2) {
        // Upper face (Forehead, Brow, Eye Orbits)
        const t = (y - 0.2) / 0.65;
        rx = 0.94 + 0.16 * t;
        rz = 1.1 + 0.12 * t;
        zOffset = -0.04 * t;
      } else if (y > -0.55) {
        // Mid face (Cheeks, Nose base, Lips)
        const t = (y + 0.55) / 0.75;
        rx = 0.82 + 0.2 * t;
        rz = 0.94 + 0.2 * t;
        zOffset = 0.02 * (1 - t);
      } else if (y > -0.98) {
        // Lower face (Mandible, Jaw angles, Chin)
        const t = (y + 0.98) / 0.43;
        rx = 0.52 + 0.3 * t;
        rz = 0.76 + 0.18 * t;
        zOffset = 0.2 * (1 - t);
      } else {
        // Neck cylinder
        const t = (y + 1.35) / 0.37;
        rx = 0.58 + 0.08 * t;
        rz = 0.62 + 0.08 * t;
        zOffset = -0.16;
      }

      let px = rx * sinA;
      let pz = rz * cosA + zOffset;
      const py = y;

      // Sculpt detailed facial anatomy on the front hemisphere (cosA > 0)
      if (cosA > 0.02) {
        const frontWeight = Math.pow(cosA, 1.35);
        const centerWeight = Math.exp(-Math.pow(sinA * 4.0, 2));

        // 1. Forehead curvature (y: 0.75 to 1.28)
        if (y > 0.75 && y < 1.28) {
          const fFactor = Math.sin(((y - 0.75) / 0.53) * Math.PI);
          pz += 0.16 * fFactor * frontWeight;
          // Slight frontal bossing on lateral sides
          const bossing = Math.exp(-Math.pow((Math.abs(sinA) - 0.32) * 5.2, 2));
          pz += 0.06 * fFactor * bossing;
        }

        // 2. Brow ridge & Glabella (y: 0.54 to 0.78)
        if (y >= 0.54 && y <= 0.78) {
          const browFactor = Math.sin(((y - 0.54) / 0.24) * Math.PI);
          const supraorbitalArch = Math.exp(-Math.pow((Math.abs(sinA) - 0.38) * 4.2, 2));
          pz += (0.16 + 0.12 * centerWeight + 0.09 * supraorbitalArch) * browFactor * frontWeight;
        }

        // 3. Eye Sockets / Orbital Cavities & Eyelids (y: 0.26 to 0.56, lateral)
        if (y >= 0.26 && y <= 0.56) {
          const eyeYFactor = Math.sin(((y - 0.26) / 0.3) * Math.PI);
          const eyeXFactor = Math.exp(-Math.pow((Math.abs(sinA) - 0.38) * 4.8, 2));
          // Recess orbital cavity
          pz -= 0.26 * eyeYFactor * eyeXFactor;

          // Upper & lower eyelid bulges inside the socket
          if (y > 0.38 && y < 0.5) {
            const upperLid = Math.sin(((y - 0.38) / 0.12) * Math.PI);
            pz += 0.07 * upperLid * eyeXFactor;
          } else if (y >= 0.3 && y <= 0.38) {
            const lowerLid = Math.sin(((y - 0.3) / 0.08) * Math.PI);
            pz += 0.04 * lowerLid * eyeXFactor;
          }
        }

        // 4. Nose Bridge, Dorsum & Tip (y: -0.22 to 0.64, midline)
        if (y >= -0.22 && y <= 0.64) {
          const noseT = (y + 0.22) / 0.86;
          let noseProfile = 0;
          if (noseT > 0.75) {
            // Nasion / Root
            noseProfile = Math.sin(((noseT - 0.75) / 0.25) * Math.PI) * 0.22;
          } else if (noseT > 0.22) {
            // Bridge & Dorsum
            noseProfile = 0.32 + (0.75 - noseT) * 0.44;
          } else {
            // Apex / Nasal Tip
            noseProfile = Math.sin((noseT / 0.22) * (Math.PI / 2)) * 0.56;
          }
          const noseWidth = Math.exp(-Math.pow(sinA * 8.8, 2));
          pz += noseProfile * noseWidth;

          // Nostril flare & alar wings (Ala nasi)
          if (noseT < 0.32 && noseT > 0.04) {
            const alarSpread = Math.exp(-Math.pow((Math.abs(sinA) - 0.18) * 9.8, 2));
            pz += 0.16 * alarSpread;
            px *= (1.0 + 0.12 * alarSpread);
          }
        }

        // 5. Cheekbones (Zygomatic Prominence, y: -0.08 to 0.42, lateral)
        if (y >= -0.08 && y <= 0.42) {
          const cheekY = Math.sin(((y + 0.08) / 0.5) * Math.PI);
          const cheekX = Math.exp(-Math.pow((Math.abs(sinA) - 0.52) * 3.4, 2));
          pz += 0.26 * cheekY * cheekX;
          px *= (1.0 + 0.15 * cheekY * cheekX);
        }

        // 6. Philtrum & Vermilion Lips (y: -0.62 to -0.16)
        if (y >= -0.62 && y <= -0.16) {
          const mouthT = (y + 0.62) / 0.46;
          const mouthCenter = Math.exp(-Math.pow(sinA * 5.4, 2));
          if (mouthT > 0.68) {
            // Upper lip & Philtrum ridge
            const lipFactor = Math.sin(((mouthT - 0.68) / 0.32) * Math.PI);
            pz += 0.22 * lipFactor * mouthCenter;
          } else if (mouthT > 0.44) {
            // Oral fissure (mouth opening slit)
            pz -= 0.07 * mouthCenter;
          } else {
            // Lower lip
            const lipFactor = Math.sin(((mouthT - 0.06) / 0.38) * Math.PI);
            pz += 0.2 * lipFactor * mouthCenter;
          }
          // Mouth corners (commissures)
          const cornerFactor = Math.exp(-Math.pow((Math.abs(sinA) - 0.28) * 8.2, 2));
          pz -= 0.05 * cornerFactor * Math.sin(mouthT * Math.PI);
        }

        // 7. Chin / Mentum (y: -0.98 to -0.6)
        if (y >= -0.98 && y <= -0.6) {
          const chinT = (y + 0.98) / 0.38;
          const chinFactor = Math.sin(chinT * Math.PI);
          const chinCenter = Math.exp(-Math.pow(sinA * 4.6, 2));
          pz += 0.32 * chinFactor * chinCenter;
        }

        // 8. Jawline & Mandible Angles (y: -0.94 to -0.4)
        if (y >= -0.94 && y <= -0.4) {
          const jawY = Math.sin(((y + 0.94) / 0.54) * Math.PI);
          const jawSide = Math.exp(-Math.pow((Math.abs(sinA) - 0.72) * 3.2, 2));
          px *= (1.0 + 0.17 * jawY * jawSide);
          pz += 0.11 * jawY * jawSide;
        }
      }

      positions.push(px, py, pz);
      uvs.push(u, 1 - v);
    }
  }

  // Generate indexed quads / triangles
  for (let i = 0; i < vSegments; i++) {
    for (let j = 0; j < hSegments; j++) {
      const a = i * (hSegments + 1) + j;
      const b = (i + 1) * (hSegments + 1) + j;
      const c = (i + 1) * (hSegments + 1) + (j + 1);
      const d = i * (hSegments + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export const FaceMeshCanvas: React.FC<FaceMeshCanvasProps> = ({
  selectedZone,
  onSelectZone,
  reducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredZone, setHoveredZone] = useState<SkinZone | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<{
    [id: string]: { x: number; y: number; visible: boolean };
  }>({});

  const selectedZoneRef = useRef(selectedZone);
  selectedZoneRef.current = selectedZone;
  const hoveredZoneRef = useRef(hoveredZone);
  hoveredZoneRef.current = hoveredZone;

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 4.5));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const headGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const prevPointerPosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.002 });
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });

  // Update target camera position based on selected zone
  useEffect(() => {
    if (selectedZone) {
      targetCamPosRef.current.set(
        selectedZone.cameraPos[0],
        selectedZone.cameraPos[1],
        selectedZone.cameraPos[2]
      );
      targetLookAtRef.current.set(
        selectedZone.cameraTarget[0],
        selectedZone.cameraTarget[1],
        selectedZone.cameraTarget[2]
      );
    } else {
      targetCamPosRef.current.set(0, 0, 4.5);
      targetLookAtRef.current.set(0, 0, 0);
    }
  }, [selectedZone]);

  const handleResetCamera = useCallback(() => {
    targetCamPosRef.current.set(0, 0, 4.5);
    targetLookAtRef.current.set(0, 0, 0);
    targetRotationRef.current = { x: 0, y: 0 };
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cameraRef.current) {
      const len = targetCamPosRef.current.length();
      if (len > 2.8) {
        targetCamPosRef.current.multiplyScalar(0.88);
      }
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cameraRef.current) {
      const len = targetCamPosRef.current.length();
      if (len < 6.0) {
        targetCamPosRef.current.multiplyScalar(1.14);
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. SCENE & CAMERA SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    camera.position.set(0, 0, 4.5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 2. STUDIO 3-POINT & CYBER RIM LIGHTING SETUP (Blender Character Look)
    // Key Light: Warm directional light for natural skin highlights (#ffffff, intensity: 1.2)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 3.5, 4.5);
    scene.add(keyLight);

    // Fill Light: Soft ambient light to soften dark shadows (#f4e4bc, intensity: 0.6)
    const fillLight = new THREE.DirectionalLight(0xf4e4bc, 0.6);
    fillLight.position.set(-3, 0.5, 3);
    scene.add(fillLight);

    // Base Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0x2d221c, 0.75);
    scene.add(ambientLight);

    // Cyan Rim Light (Cyber Glow): Sharp back/side rim light matching clinic branding (#00B8A9, intensity: 2.0)
    const cyanRimLight = new THREE.DirectionalLight(0x00b8a9, 2.0);
    cyanRimLight.position.set(-4, 1.5, -2.5);
    scene.add(cyanRimLight);

    // Back accent light for jawline & occipital depth
    const backRimLight = new THREE.DirectionalLight(0x00f2de, 1.3);
    backRimLight.position.set(2, -2, -3.5);
    scene.add(backRimLight);

    // Subtle facial accent point light
    const cyanPointLight = new THREE.PointLight(0x00f2de, 1.1, 8);
    cyanPointLight.position.set(0, 1.2, 2.5);
    scene.add(cyanPointLight);

    // 3. 3D ANATOMICAL HEAD GROUP (DUAL-LAYERED SHADING)
    const headGroup = new THREE.Group();
    headGroupRef.current = headGroup;
    scene.add(headGroup);

    // Generate Custom Sculpted Anatomical Head
    const headGeo = createAnatomicalHeadGeometry();

    // Base Surface Layer: Natural human skin shader (MeshPhysicalMaterial)
    const skinMat = new THREE.MeshPhysicalMaterial({
      color: 0xe5b899, // Warm natural human skin base
      roughness: 0.55,
      metalness: 0.04,
      clearcoat: 0.24,
      clearcoatRoughness: 0.38,
      sheen: 0.38,
      sheenColor: new THREE.Color(0xffd5bc),
      reflectivity: 0.45,
    });
    const skinMesh = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(skinMesh);

    // Top Wireframe Layer: Subtle cyan/emerald glowing scanning grid (#00B8A9, opacity: 0.25)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00b8a9,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireframeMesh = new THREE.Mesh(headGeo, wireframeMat);
    wireframeMesh.scale.setScalar(1.001);
    headGroup.add(wireframeMesh);

    // 4. ANATOMICAL LANDMARK CONTOUR LINES
    const contourMat = new THREE.LineBasicMaterial({
      color: 0x00f2de,
      transparent: true,
      opacity: 0.85,
      linewidth: 2,
    });

    const softContourMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65,
    });

    // A. Mandible / Jawline Curve (Texas Contour)
    const jawCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.85, -0.52, 0.0),
      new THREE.Vector3(-0.68, -0.74, 0.62),
      new THREE.Vector3(-0.36, -0.88, 1.05),
      new THREE.Vector3(0, -0.92, 1.22),
      new THREE.Vector3(0.36, -0.88, 1.05),
      new THREE.Vector3(0.68, -0.74, 0.62),
      new THREE.Vector3(0.85, -0.52, 0.0),
    ]);
    const jawLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(jawCurve.getPoints(32)),
      contourMat
    );
    headGroup.add(jawLine);

    // B. Nasal Profile & Bridge Curve
    const noseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, 1.38),
      new THREE.Vector3(0, 0.52, 1.35),
      new THREE.Vector3(0, 0.25, 1.52),
      new THREE.Vector3(0, -0.05, 1.62),
      new THREE.Vector3(0, -0.18, 1.48),
      new THREE.Vector3(0, -0.26, 1.38),
    ]);
    const noseLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(noseCurve.getPoints(24)),
      contourMat
    );
    headGroup.add(noseLine);

    // C. Left & Right Eyebrow Arches
    const leftBrowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 0.68, 1.44),
      new THREE.Vector3(-0.36, 0.74, 1.38),
      new THREE.Vector3(-0.66, 0.66, 1.2),
    ]);
    const rightBrowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.68, 1.44),
      new THREE.Vector3(0.36, 0.74, 1.38),
      new THREE.Vector3(0.66, 0.66, 1.2),
    ]);
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftBrowCurve.getPoints(18)), contourMat)
    );
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightBrowCurve.getPoints(18)), contourMat)
    );

    // D. Left & Right Orbital Eye Rim (Tear Troughs & Under-Eye)
    const leftOrbitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.44, 1.41),
      new THREE.Vector3(-0.38, 0.36, 1.35),
      new THREE.Vector3(-0.62, 0.44, 1.21),
      new THREE.Vector3(-0.4, 0.54, 1.34),
      new THREE.Vector3(-0.16, 0.44, 1.41),
    ]);
    const rightOrbitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.16, 0.44, 1.41),
      new THREE.Vector3(0.38, 0.36, 1.35),
      new THREE.Vector3(0.62, 0.44, 1.21),
      new THREE.Vector3(0.4, 0.54, 1.34),
      new THREE.Vector3(0.16, 0.44, 1.41),
    ]);
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftOrbitCurve.getPoints(24)), softContourMat)
    );
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightOrbitCurve.getPoints(24)), softContourMat)
    );

    // E. Left & Right Cheekbone (Zygomatic) Arcs
    const leftCheekCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.24, 0.05, 1.42),
      new THREE.Vector3(-0.58, 0.12, 1.35),
      new THREE.Vector3(-0.88, 0.08, 1.15),
    ]);
    const rightCheekCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.05, 1.42),
      new THREE.Vector3(0.58, 0.12, 1.35),
      new THREE.Vector3(0.88, 0.08, 1.15),
    ]);
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftCheekCurve.getPoints(18)), softContourMat)
    );
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightCheekCurve.getPoints(18)), softContourMat)
    );

    // F. Lips / Vermilion Border
    const lipsCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, -0.34, 1.26),
      new THREE.Vector3(-0.16, -0.28, 1.36),
      new THREE.Vector3(0, -0.29, 1.39),
      new THREE.Vector3(0.16, -0.28, 1.36),
      new THREE.Vector3(0.35, -0.34, 1.26),
      new THREE.Vector3(0.16, -0.45, 1.33),
      new THREE.Vector3(0, -0.46, 1.36),
      new THREE.Vector3(-0.16, -0.45, 1.33),
      new THREE.Vector3(-0.35, -0.34, 1.26),
    ]);
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(lipsCurve.getPoints(24)), softContourMat)
    );

    // G. Forehead Hairline / Frontal Arch
    const foreheadArch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.75, 1.05, 0.95),
      new THREE.Vector3(-0.45, 1.24, 1.15),
      new THREE.Vector3(0, 1.28, 1.25),
      new THREE.Vector3(0.45, 1.24, 1.15),
      new THREE.Vector3(0.75, 1.05, 0.95),
    ]);
    headGroup.add(
      new THREE.Line(new THREE.BufferGeometry().setFromPoints(foreheadArch.getPoints(20)), softContourMat)
    );

    // 5. ANATOMICAL LANDMARK GLOWING NODES
    const landmarkCoords = [
      [0, 1.05, 1.35], // Forehead
      [0, 0.68, 1.44], // Glabella
      [0, -0.05, 1.62], // Nose Tip
      [-0.42, 0.42, 1.36], // Left under-eye
      [0.42, 0.42, 1.36], // Right under-eye
      [-0.85, 0.06, 1.28], // Left cheek
      [0.85, 0.06, 1.28], // Right cheek
      [0, -0.29, 1.39], // Cupid's Bow
      [0, -0.92, 1.22], // Chin point
      [-0.82, -0.55, 0.4], // Left Jaw angle
      [0.82, -0.55, 0.4], // Right Jaw angle
    ];
    const landmarkPosArray = new Float32Array(landmarkCoords.flat());
    const landmarkGeo = new THREE.BufferGeometry();
    landmarkGeo.setAttribute('position', new THREE.BufferAttribute(landmarkPosArray, 3));
    const landmarkMat = new THREE.PointsMaterial({
      color: 0x00f2de,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const landmarkPoints = new THREE.Points(landmarkGeo, landmarkMat);
    headGroup.add(landmarkPoints);

    // 6. AMBIENT FLOATING MEDICAL PARTICLES
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      const radius = 1.9 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[p * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[p * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[p * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f2de,
      size: 0.04,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    headGroup.add(particles);

    // 7. HOTSPOT 3D DIAGNOSTIC RINGS
    const hotspotMeshes: { zone: SkinZone; outerRing: THREE.Mesh; innerGlow: THREE.Mesh }[] = [];
    const ringGeo = new THREE.RingGeometry(0.065, 0.09, 32);
    const innerDotGeo = new THREE.CircleGeometry(0.045, 24);

    skinZones.forEach((zone) => {
      const spotGroup = new THREE.Group();
      spotGroup.position.set(zone.position[0], zone.position[1], zone.position[2]);
      spotGroup.lookAt(
        zone.position[0] * 1.5,
        zone.position[1] * 1.5,
        zone.position[2] + 2
      );

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00b8a9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const outerRing = new THREE.Mesh(ringGeo, ringMat);
      spotGroup.add(outerRing);

      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      });
      const innerGlow = new THREE.Mesh(innerDotGeo, dotMat);
      innerGlow.position.z = 0.005;
      spotGroup.add(innerGlow);

      headGroup.add(spotGroup);
      hotspotMeshes.push({ zone, outerRing, innerGlow });
    });

    // 8. POINTER & INTERACTION CONTROLS
    let initialPinchDistance: number | null = null;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      setIsInteracting(true);
      if ('touches' in e && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
        return;
      }
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevPointerPosRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length === 2 && initialPinchDistance !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);
        const factor = initialPinchDistance / (currentDist || 1);
        if (cameraRef.current) {
          const currentLen = targetCamPosRef.current.length();
          const newLen = THREE.MathUtils.clamp(currentLen * (factor > 1 ? 1.03 : 0.97), 2.2, 5.2);
          targetCamPosRef.current.setLength(newLen);
        }
        initialPinchDistance = currentDist;
        return;
      }

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingRef.current) {
        const deltaX = clientX - prevPointerPosRef.current.x;
        const deltaY = clientY - prevPointerPosRef.current.y;

        targetRotationRef.current.y += deltaX * 0.007;
        targetRotationRef.current.x += deltaY * 0.005;
        // Clamp vertical pitch
        targetRotationRef.current.x = Math.max(-0.4, Math.min(0.4, targetRotationRef.current.x));

        rotationVelocityRef.current = {
          x: deltaY * 0.002,
          y: deltaX * 0.003,
        };

        prevPointerPosRef.current = { x: clientX, y: clientY };
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsInteracting(false);
      initialPinchDistance = null;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const currentLen = targetCamPosRef.current.length();
      const newLen = THREE.MathUtils.clamp(currentLen * zoomFactor, 2.2, 5.2);
      targetCamPosRef.current.setLength(newLen);
    };

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // 9. RESIZE OBSERVER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // 10. RENDER & ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth rotation with slight inertia
      if (!isDraggingRef.current && !reducedMotion) {
        targetRotationRef.current.y += rotationVelocityRef.current.y;
        rotationVelocityRef.current.y = THREE.MathUtils.lerp(
          rotationVelocityRef.current.y,
          0.0012,
          0.03
        );
      }

      currentRotationRef.current.x = THREE.MathUtils.lerp(
        currentRotationRef.current.x,
        targetRotationRef.current.x,
        0.08
      );
      currentRotationRef.current.y = THREE.MathUtils.lerp(
        currentRotationRef.current.y,
        targetRotationRef.current.y,
        0.08
      );

      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = currentRotationRef.current.x;
        headGroupRef.current.rotation.y = currentRotationRef.current.y;
        if (!reducedMotion) {
          headGroupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.05;
        }
      }

      // Smooth Camera Lerping towards target position & lookAt
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.05);
        currentLookAtRef.current.lerp(targetLookAtRef.current, 0.05);
        cameraRef.current.lookAt(currentLookAtRef.current);
      }

      // Hotspot pulse & scale effects
      hotspotMeshes.forEach(({ zone, outerRing }) => {
        const isSelected = selectedZoneRef.current?.id === zone.id;
        const isHovered = hoveredZoneRef.current?.id === zone.id;

        const baseScale = isSelected ? 1.4 : isHovered ? 1.25 : 1.0;
        const pulse = Math.sin(elapsed * 4 + zone.position[1]) * 0.15;
        const finalScale = baseScale + (isSelected ? pulse : 0);

        outerRing.scale.set(finalScale, finalScale, 1);
        (outerRing.material as THREE.MeshBasicMaterial).color.setHex(
          isSelected ? 0x00f2de : isHovered ? 0xd4af37 : 0x00b8a9
        );
        (outerRing.material as THREE.MeshBasicMaterial).opacity = isSelected ? 1 : 0.75;
      });

      // Calculate 2D Screen coordinates for HTML Hotspot Overlays
      if (cameraRef.current && containerRef.current && headGroupRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        const screenMap: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const tempVec = new THREE.Vector3();

        skinZones.forEach((zone) => {
          tempVec.set(zone.position[0], zone.position[1], zone.position[2]);
          tempVec.applyMatrix4(headGroupRef.current!.matrixWorld);
          tempVec.project(cameraRef.current!);

          const isFacingCamera = tempVec.z < 1;
          const screenX = ((tempVec.x + 1) * w) / 2;
          const screenY = ((-tempVec.y + 1) * h) / 2;

          screenMap[zone.id] = {
            x: screenX,
            y: screenY,
            visible: isFacingCamera,
          };
        });

        setHotspotScreenPositions(screenMap);
      }

      // Render scene
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // 11. CLEANUP ON UNMOUNT
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      canvas.removeEventListener('wheel', onWheel);

      headGeo.dispose();
      skinMat.dispose();
      wireframeMat.dispose();
      contourMat.dispose();
      softContourMat.dispose();
      landmarkGeo.dispose();
      landmarkMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo.dispose();
      innerDotGeo.dispose();
      renderer.dispose();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-slate-900/40 border border-white/10 shadow-inner"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating 2D HTML Hotspot Labels & Click Targets on top of 3D Model */}
      {skinZones.map((zone) => {
        const pos = hotspotScreenPositions[zone.id];
        if (!pos || !pos.visible) return null;
        const isSelected = selectedZone?.id === zone.id;
        const isHovered = hoveredZone?.id === zone.id;

        return (
          <div
            key={zone.id}
            style={{
              position: 'absolute',
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
            }}
            className="group z-10"
          >
            {/* Clickable Touch/Pointer Target */}
            <button
              type="button"
              onClick={() => onSelectZone(zone)}
              onMouseEnter={() => setHoveredZone(zone)}
              onMouseLeave={() => setHoveredZone(null)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 backdrop-blur-md shadow-lg ${
                isSelected
                  ? 'bg-teal-600/90 text-white ring-2 ring-teal-300 ring-offset-2 ring-offset-slate-950 scale-110'
                  : isHovered
                  ? 'bg-amber-500/90 text-slate-950 scale-105 ring-1 ring-amber-300'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-teal-300 border border-teal-500/40 hover:border-teal-400'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isSelected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isSelected ? 'bg-white' : 'bg-teal-400'
                  }`}
                ></span>
              </span>
              <span className="text-[11px] font-extrabold whitespace-nowrap">{zone.nameAr}</span>
              {isSelected && <Check className="h-3 w-3 text-white" />}
            </button>
          </div>
        );
      })}

      {/* Floating Canvas UI Controls Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-teal-500/30 text-teal-300 hover:text-white text-xs font-bold backdrop-blur-md shadow-md transition-all active:scale-95"
          title="إعادة ضبط زاوية الرؤية"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">إعادة ضبط</span>
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-teal-500/30 text-teal-300 hover:text-white backdrop-blur-md shadow-md transition-all active:scale-95"
          title="تكبير العرض"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          className="grid h-8 w-8 place-items-center rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-teal-500/30 text-teal-300 hover:text-white backdrop-blur-md shadow-md transition-all active:scale-95"
          title="تصغير العرض"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-300 text-[11px] font-bold backdrop-blur-md">
        <Sparkles className="h-3 w-3 text-teal-400 animate-pulse" />
        <span>مجسم 3D تشريحي • تدوير حر وتكبير</span>
      </div>

      {/* Helper Footer Hint */}
      <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-md text-[11px] text-slate-300">
        <span className="flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5 text-teal-400" />
          <span>اسحب للتدوير في كافة الاتجاهات أو استخدم عجلة الماوس / اللمس للتكبير</span>
        </span>
        <span className="font-bold text-teal-400">
          {isInteracting ? 'جاري الفحص...' : 'فحص ثلاثي الأبعاد'}
        </span>
      </div>
    </div>
  );
};
