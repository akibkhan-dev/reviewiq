import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Star,
  Quote,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Review, SentimentType } from '../types';
import { NavTab } from './Sidebar';

interface ReviewIQNeuralCoreProps {
  onNavigate?: (tab: NavTab) => void;
  onSelectReview?: (review: Review) => void;
  reviewCount?: number;
}

interface StreamBatch {
  id: string;
  label: string;
  positive: {
    customerName: string;
    productName: string;
    rating: number;
    reviewSnippet: string;
    confidence: number;
    keyAspects: string[];
    sentiment: SentimentType;
  };
  neutral: {
    customerName: string;
    productName: string;
    rating: number;
    reviewSnippet: string;
    confidence: number;
    keyAspects: string[];
    sentiment: SentimentType;
  };
  negative: {
    customerName: string;
    productName: string;
    rating: number;
    reviewSnippet: string;
    confidence: number;
    keyAspects: string[];
    sentiment: SentimentType;
  };
  aiInsight: {
    title: string;
    targetProduct: string;
    insightSnippet: string;
    recommendedAction: string;
    confidence: number;
    impactLevel: 'High' | 'Critical' | 'Strategic';
  };
}

const STREAM_BATCHES: StreamBatch[] = [
  {
    id: 'batch-1',
    label: 'Hardware & Travel Audio Batch',
    positive: {
      customerName: 'Marcus Vance',
      productName: 'NovaTech AudioPro ANC Headphones',
      rating: 5,
      reviewSnippet:
        'The active noise cancellation is practically magic on flights. Soundstage is deep, crisp highs, and the battery easily lasted through my 14-hour transpacific trip.',
      confidence: 97,
      keyAspects: ['Active Noise Cancellation', 'Battery Endurance', 'Acoustics'],
      sentiment: 'Positive',
    },
    neutral: {
      customerName: 'Sophia Miller',
      productName: 'NovaCharge Duo 100W',
      rating: 4,
      reviewSnippet:
        'Charges both my laptop and phone rapidly at full wattage. Only minor annoyance is that the GaN brick gets quite warm during simultaneous 65W+35W draw.',
      confidence: 78,
      keyAspects: ['Dual Fast Charging', 'GaN Heat Dissipation'],
      sentiment: 'Neutral',
    },
    negative: {
      customerName: 'Elena Rostova',
      productName: 'NovaPulse Smartwatch v2',
      rating: 2,
      reviewSnippet:
        'Heart rate monitor is erratic during high-intensity sprint sessions, often dropping readings completely. Very frustrated considering the premium price tag.',
      confidence: 94,
      keyAspects: ['Heart Rate Accuracy', 'Sensor Calibration', 'Value'],
      sentiment: 'Negative',
    },
    aiInsight: {
      title: 'Ecosystem Sentiment Synthesis',
      targetProduct: 'NovaTech Multi-Product Fleet',
      insightSnippet:
        'Battery longevity and ANC achieve 96% positive sentiment across audio hardware. Conversely, smartwatch optical sensor precision under high-dynamic acceleration accounts for 68% of negative triage tickets.',
      recommendedAction: 'Expedite OTA firmware v2.1 algorithm update for optical sensor filtering.',
      confidence: 98,
      impactLevel: 'Strategic',
    },
  },
  {
    id: 'batch-2',
    label: 'Computing & Creator Suite Batch',
    positive: {
      customerName: 'Liam Chen',
      productName: 'NovaBook Ultra 16',
      rating: 5,
      reviewSnippet:
        'Compile times for my Rust projects dropped by 45% compared to my M2 machine. Keyboard travel is sublime and thermals stay completely whisper quiet under load.',
      confidence: 98,
      keyAspects: ['Compiler Velocity', 'Whisper Thermals', 'Keyboard Travel'],
      sentiment: 'Positive',
    },
    neutral: {
      customerName: 'Brian O’Connor',
      productName: 'NovaTech AudioPro ANC Headphones',
      rating: 3,
      reviewSnippet:
        'Audio fidelity is exceptional, but multi-point Bluetooth switching between my MacBook and Pixel drops audio for 3-4 seconds when incoming calls ring.',
      confidence: 82,
      keyAspects: ['Multipoint Handshake', 'Bluetooth Latency'],
      sentiment: 'Neutral',
    },
    negative: {
      customerName: 'David Kalu',
      productName: 'NovaCam 4K Stream',
      rating: 1,
      reviewSnippet:
        'Software constantly crashes on Windows 11 after the latest firmware patch. Customer support took 6 days to reply with an automated template that was useless.',
      confidence: 99,
      keyAspects: ['Driver Stability', 'Windows 11 Crash', 'Support SLA'],
      sentiment: 'Negative',
    },
    aiInsight: {
      title: 'Thermal & Driver Correlation Analysis',
      targetProduct: 'NovaBook & NovaCam Drivers',
      insightSnippet:
        'Developer advocacy (+45% speed rating) leads the computing category, but camera software crashes on Windows 11 represent the fastest-growing ticket surge (+34% week-over-week).',
      recommendedAction: 'Roll back camera driver patch 1.4.2 and triage customer support automated replies.',
      confidence: 96,
      impactLevel: 'Critical',
    },
  },
  {
    id: 'batch-3',
    label: 'Accessories & Daily Usability Batch',
    positive: {
      customerName: 'Maya Patel',
      productName: 'NovaPulse Smartwatch v2',
      rating: 5,
      reviewSnippet:
        'The AMOLED display brightness in direct desert sunlight is unbeatable. Sleep tracking stages match my Oura ring with pinpoint 98% accuracy.',
      confidence: 95,
      keyAspects: ['AMOLED Outdoor Lumens', 'Sleep Stage Tracking'],
      sentiment: 'Positive',
    },
    neutral: {
      customerName: 'Carlos Ramirez',
      productName: 'NovaBook Ultra 16',
      rating: 3,
      reviewSnippet:
        'The display is gorgeous and performance is top tier, but at 2.1kg it is slightly heavy in my backpack for daily commuting on the subway.',
      confidence: 76,
      keyAspects: ['Weight & Portability', 'Screen Quality'],
      sentiment: 'Neutral',
    },
    negative: {
      customerName: 'Rachel Kim',
      productName: 'NovaCharge Duo 100W',
      rating: 2,
      reviewSnippet:
        'The folding prongs became loose after just 3 weeks of travel and now slip out of loose hotel wall sockets. Expected better build quality.',
      confidence: 92,
      keyAspects: ['Folding Prong Tolerance', 'Socket Grip'],
      sentiment: 'Negative',
    },
    aiInsight: {
      title: 'Mechanical Tolerance & Display Satisfaction',
      targetProduct: 'NovaCharge & NovaPulse',
      insightSnippet:
        'Display brightness and sleep tracking score 94% approval, but physical hardware retention on folding charging pins indicates a tooling friction defect in batch #4.',
      recommendedAction: 'Notify the Shenzhen tooling partner to reinforce mechanical prong spring detents.',
      confidence: 94,
      impactLevel: 'High',
    },
  },
];

export const ReviewIQNeuralCore: React.FC<ReviewIQNeuralCoreProps> = ({
  onNavigate,
  onSelectReview,
  reviewCount = 52,
}) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number>(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [totalProcessedCount, setTotalProcessedCount] = useState<number>(reviewCount);
  const pulseTriggerRef = useRef<() => void>(() => {});

  const currentBatch = STREAM_BATCHES[activeBatchIndex];

  // Advance batch stream
  const handleCycleBatch = () => {
    setActiveBatchIndex((prev) => (prev + 1) % STREAM_BATCHES.length);
    setTotalProcessedCount((prev) => prev + 3);
    triggerEnergyPulse();
  };

  const triggerEnergyPulse = () => {
    setIsPulsing(true);
    pulseTriggerRef.current?.();
    setTimeout(() => setIsPulsing(false), 900);
  };

  // Three.js 3D Neural Intelligence Core Setup
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    let frameId = 0;
    let timerId = 0;

    // Detect software WebGL renderer (SwiftShader / llvmpipe) for optimal pacing
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera (FOV 36, positioned so 100% of the core stays in view)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.35, 4.4);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflection Map
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // fallback
    }

    // 4. Soft Studio Lighting (Cyan, Lavender, and Warm Fill)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyCyanLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    keyCyanLight.position.set(4, 5, 3.5);
    scene.add(keyCyanLight);

    const rimLavenderLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    rimLavenderLight.position.set(-4, -3, -2);
    scene.add(rimLavenderLight);

    const fillHemi = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.85);
    scene.add(fillHemi);

    // 5. Multi-Part Procedural 3D Neural Intelligence Assembly
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Sub-assembly A: Central Translucent Glass Icosahedron Nucleus
    const nucleusGroup = new THREE.Group();
    rootGroup.add(nucleusGroup);

    const nucleusGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.08,
      roughness: 0.12,
      transmission: isSoftwareGl ? 0 : 0.82,
      transparent: true,
      opacity: isSoftwareGl ? 0.85 : 0.9,
      ior: 1.52,
      thickness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    nucleusGroup.add(nucleusMesh);

    // Fine Silver Wireframe Lattice around Nucleus
    const latticeGeo = new THREE.IcosahedronGeometry(0.76, 1);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0x635bff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    nucleusGroup.add(latticeMesh);

    // Inner Glowing Core Point / Lavender Prism
    const innerGeo = new THREE.OctahedronGeometry(0.38, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    nucleusGroup.add(innerMesh);

    // Sub-assembly B: Triple Concentric Orbital Gimbal Rings (Cyan & Lavender)
    const ringGroup = new THREE.Group();
    rootGroup.add(ringGroup);

    const ring1Geo = new THREE.TorusGeometry(1.15, 0.009, 16, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI * 0.25;
    ring1.rotation.y = Math.PI * 0.15;
    ringGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(1.38, 0.008, 16, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.35;
    ring2.rotation.z = Math.PI * 0.2;
    ringGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(1.58, 0.007, 16, 64);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x635bff,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI * 0.4;
    ring3.rotation.z = -Math.PI * 0.15;
    ringGroup.add(ring3);

    // Sub-assembly C: Interconnected Neural Node Constellation
    const nodeCount = 28;
    const nodeCoords: THREE.Vector3[] = [];
    const nodeGroup = new THREE.Group();
    rootGroup.add(nodeGroup);

    const nodeSphereGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const nodeSphereMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
    });

    const phi = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < nodeCount; i++) {
      const theta = 2 * Math.PI * i * (1 - 1 / phi);
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const rad = 1.05 + ((i % 5) * 0.12);
      const pos = new THREE.Vector3(
        Math.cos(theta) * radiusAtY * rad,
        y * rad,
        Math.sin(theta) * radiusAtY * rad
      );
      nodeCoords.push(pos);

      const nodeMesh = new THREE.Mesh(nodeSphereGeo, nodeSphereMat);
      nodeMesh.position.copy(pos);
      nodeGroup.add(nodeMesh);
    }

    // Connect close nodes with thin data line segments
    const lineIndices: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (nodeCoords[i].distanceTo(nodeCoords[j]) < 0.85) {
          lineIndices.push(i, j);
        }
      }
    }

    const linePositions = new Float32Array(lineIndices.length * 3);
    for (let k = 0; k < lineIndices.length; k++) {
      const idx = lineIndices[k];
      linePositions[k * 3] = nodeCoords[idx].x;
      linePositions[k * 3 + 1] = nodeCoords[idx].y;
      linePositions[k * 3 + 2] = nodeCoords[idx].z;
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.35,
    });
    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    nodeGroup.add(networkLines);

    // Sub-assembly D: Ambient Inward Particle Cloud
    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: number[] = [];

    for (let p = 0; p < particleCount; p++) {
      const r = 1.4 + Math.random() * 1.2;
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.5) * Math.PI;
      particlePositions[p * 3] = r * Math.cos(ph) * Math.cos(th);
      particlePositions[p * 3 + 1] = r * Math.sin(ph);
      particlePositions[p * 3 + 2] = r * Math.cos(ph) * Math.sin(th);
      particleVelocities.push(0.003 + Math.random() * 0.005);
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particlePoints);

    // Sub-assembly E: Grounding Soft Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(1.6, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.65;
    scene.add(shadowMesh);

    // Interactivity: Pulse trigger callback
    let pulseProgress = 0;
    pulseTriggerRef.current = () => {
      pulseProgress = 1.0;
    };

    // Mouse parallax tracking
    const targetTilt = { x: 0, y: 0 };
    const currentTilt = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetTilt.x = y * 0.22;
      targetTilt.y = x * 0.35;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Paced animation loop
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 4);
        } else {
          if (sync) gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 60);
        }
      };
      timerId = window.setTimeout(poll, 4);
    }

    function animate() {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth tilt damping
      currentTilt.x += (targetTilt.x - currentTilt.x) * 0.05;
      currentTilt.y += (targetTilt.y - currentTilt.y) * 0.05;

      rootGroup.rotation.x = currentTilt.x;
      rootGroup.rotation.y = time * 0.25 + currentTilt.y;

      // Inner Core Rotations
      nucleusGroup.rotation.y = -time * 0.45;
      nucleusGroup.rotation.x = Math.sin(time * 0.5) * 0.2;
      innerMesh.rotation.z = time * 0.8;

      // Gimbal Ring Rotations
      ring1.rotation.z = time * 0.35;
      ring2.rotation.y = -time * 0.4;
      ring3.rotation.x = time * 0.28;

      // Node constellation gentle floating breathing
      nodeGroup.rotation.y = time * 0.15;

      // Pulse expansion effect
      if (pulseProgress > 0.01) {
        pulseProgress *= 0.92;
        const pulseScale = 1.0 + pulseProgress * 0.16;
        nucleusGroup.scale.set(pulseScale, pulseScale, pulseScale);
        latticeMat.opacity = 0.45 + pulseProgress * 0.5;
      } else {
        nucleusGroup.scale.set(1, 1, 1);
        latticeMat.opacity = 0.45;
      }

      // Particle inward drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let p = 0; p < particleCount; p++) {
        let x = positions[p * 3];
        let y = positions[p * 3 + 1];
        let z = positions[p * 3 + 2];
        const dist = Math.sqrt(x * x + y * y + z * z);
        const speed = particleVelocities[p];

        if (dist > 0.75) {
          positions[p * 3] -= (x / dist) * speed;
          positions[p * 3 + 1] -= (y / dist) * speed;
          positions[p * 3 + 2] -= (z / dist) * speed;
        } else {
          // Reset to outer perimeter
          const r = 2.0 + Math.random() * 0.6;
          const th = Math.random() * Math.PI * 2;
          const ph = (Math.random() - 0.5) * Math.PI;
          positions[p * 3] = r * Math.cos(ph) * Math.cos(th);
          positions[p * 3 + 1] = r * Math.sin(ph);
          positions[p * 3 + 2] = r * Math.cos(ph) * Math.sin(th);
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    }

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);

      // Clean disposal of geometries and materials
      nucleusGeo.dispose();
      nucleusMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      nodeSphereGeo.dispose();
      nodeSphereMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-10 transition-all">
      {/* 1. Header Section: Title, Status Indicator & Stream Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="tracking-wide">AI Sentiment Engine • Neural Intelligence Core</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Real-Time Neural Feedback Processing
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Multi-dimensional sentiment classification and automated theme extraction active across{' '}
            <strong className="text-slate-900 font-semibold">{totalProcessedCount} verified reviews</strong>.
            Incoming customer feedback is tokenized, sentiment-weighted, and mapped to strategic actions.
          </p>
        </div>

        {/* Live Engine Indicator & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Static AI Engine Active Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight">AI Engine Active</span>
              <span className="text-[10px] text-slate-500">142ms Latency • Gemini 3.8 Flash</span>
            </div>
          </div>

          {/* Interactive Stream Switcher */}
          <button
            onClick={handleCycleBatch}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-2xs"
            title="Cycle next review stream batch"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isPulsing ? 'animate-spin' : ''}`} />
            <span>Cycle Live Stream</span>
          </button>

          {/* Trigger Pulse Button */}
          <button
            onClick={triggerEnergyPulse}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Send analytical pulse through neural core"
          >
            <Zap className="w-3.5 h-3.5 text-[#635BFF]" />
            <span>Pulse Core</span>
          </button>
        </div>
      </div>

      {/* 2. Central Visualization Stage: 4 Floating Review Cards + 3D Neural Core in Center */}
      <div className="relative pt-8 pb-4">
        {/* Subtle background circuit coordinates */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="neural-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural-grid)" />
          </svg>
        </div>

        {/* Main Grid: 2 Columns of Cards flanking Central 3D Canvas */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Top = Positive Review, Bottom = AI Insight */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Positive Review Card */}
            <div
              onMouseEnter={() => setHoveredCard('positive')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs ${
                hoveredCard === 'positive'
                  ? 'border-emerald-400 ring-2 ring-emerald-50 shadow-md translate-x-1'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Positive Sentiment
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {currentBatch.positive.confidence}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentBatch.positive.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-semibold text-slate-500 ml-1">
                  by {currentBatch.positive.customerName}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3 italic">
                "{currentBatch.positive.reviewSnippet}"
              </p>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                  {currentBatch.positive.productName}
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-0.5 rounded">
                  Praise Detected
                </span>
              </div>
            </div>

            {/* 2. AI-Generated Strategic Customer Insight Card */}
            <div
              onMouseEnter={() => setHoveredCard('insight')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-5 rounded-2xl bg-indigo-50/50 border transition-all duration-200 shadow-2xs ${
                hoveredCard === 'insight'
                  ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-md translate-x-1'
                  : 'border-indigo-100 hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#635BFF] border border-indigo-200 shadow-2xs">
                  <Brain className="w-3 h-3 text-[#635BFF]" />
                  AI Customer Insight
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  {currentBatch.aiInsight.impactLevel} Priority
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {currentBatch.aiInsight.title}
              </h4>

              <p className="text-xs text-slate-700 leading-relaxed font-normal mb-3">
                {currentBatch.aiInsight.insightSnippet}
              </p>

              <div className="pt-2.5 border-t border-indigo-100/70 flex items-center justify-between text-[11px]">
                <span className="text-[#635BFF] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Actionable Strategy
                </span>
                <span className="text-slate-600 font-medium">
                  {currentBatch.aiInsight.confidence}% Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* Central Column: 3D Neural Intelligence Core Canvas */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square max-w-[380px] max-h-[390px] flex items-center justify-center">
              {/* WebGL Canvas mount container */}
              <div
                ref={canvasMountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                title="Drag to rotate 3D Neural Core"
              />

              {/* Central Core Specs HUD Tag */}
              <div className="absolute -bottom-2 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-slate-200 shadow-xs text-[10px] text-slate-600 font-medium">
                <Activity className="w-3 h-3 text-[#06B6D4]" />
                <span>3D Neural Lattice • Continuous Inference</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 text-center font-medium">
              Interactive 3D Core • Drag cursor to inspect neural pathways
            </p>
          </div>

          {/* Right Column: Top = Neutral Review, Bottom = Negative Review */}
          <div className="lg:col-span-4 space-y-5">
            {/* 3. Neutral Review Card */}
            <div
              onMouseEnter={() => setHoveredCard('neutral')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs ${
                hoveredCard === 'neutral'
                  ? 'border-amber-400 ring-2 ring-amber-50 shadow-md -translate-x-1'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Neutral Sentiment
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {currentBatch.neutral.confidence}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentBatch.neutral.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-semibold text-slate-500 ml-1">
                  by {currentBatch.neutral.customerName}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3 italic">
                "{currentBatch.neutral.reviewSnippet}"
              </p>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                  {currentBatch.neutral.productName}
                </span>
                <span className="text-amber-700 font-semibold bg-amber-50/80 px-2 py-0.5 rounded">
                  Tradeoff Noted
                </span>
              </div>
            </div>

            {/* 4. Negative Review Card */}
            <div
              onMouseEnter={() => setHoveredCard('negative')}
              onMouseLeave={() => setHoveredCard(null)}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-2xs ${
                hoveredCard === 'negative'
                  ? 'border-rose-400 ring-2 ring-rose-50 shadow-md -translate-x-1'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  Negative Sentiment
                </span>
                <span className="text-[11px] font-bold text-slate-700">
                  {currentBatch.negative.confidence}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < currentBatch.negative.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-semibold text-slate-500 ml-1">
                  by {currentBatch.negative.customerName}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3 italic">
                "{currentBatch.negative.reviewSnippet}"
              </p>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-900 truncate max-w-[190px]">
                  {currentBatch.negative.productName}
                </span>
                <span className="text-rose-700 font-semibold bg-rose-50/80 px-2 py-0.5 rounded">
                  Friction Flagged
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Metrics Footer Bar */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Positive: <strong className="text-slate-900 font-semibold">68%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Neutral: <strong className="text-slate-900 font-semibold">18%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Negative: <strong className="text-slate-900 font-semibold">14%</strong></span>
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="text-slate-500">
            Active Batch: <strong className="text-slate-700">{currentBatch.label}</strong>
          </span>
        </div>

        {onNavigate && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
            >
              <span>Explore Analytics Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('analyzer')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#635BFF] hover:underline cursor-pointer"
            >
              <span>Test Single Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
