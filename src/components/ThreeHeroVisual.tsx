import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const ThreeHeroVisual: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let frameId: number;
    let timerId: number;

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

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.03);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 5.2);

    // 2. Renderer
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

    // 3. Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {}

    // 4. Clean Soft Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(5, 6, 4);
    scene.add(keyLight);

    const softViolet = new THREE.DirectionalLight(0x635bff, 1.2);
    softViolet.position.set(-4, -2, -3);
    scene.add(softViolet);

    const fillLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.9);
    scene.add(fillLight);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 5. Central AI Gem Core (Light Frosted Minimal Aesthetics)
    const coreGroup = new THREE.Group();
    rootGroup.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x635bff,
      metalness: 0.1,
      roughness: 0.15,
      transmission: isSoftwareGl ? 0 : 0.75,
      transparent: true,
      opacity: isSoftwareGl ? 0.8 : 0.88,
      ior: 1.5,
      thickness: 0.9,
      clearcoat: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Fine Silver Wireframe Shell
    const wireGeo = new THREE.IcosahedronGeometry(0.98, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // Inner Glowing Pulse Core
    const innerGeo = new THREE.OctahedronGeometry(0.48);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x635bff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.5,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 6. Orbital Titanium Rings
    const ringGeo = new THREE.TorusGeometry(1.65, 0.012, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x635bff,
      transparent: true,
      opacity: 0.3,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    rootGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    rootGroup.add(ring2);

    // 7. Light Theme Floating Review Cards Texture Generator
    function createLightMinimalCardTexture(
      label: string,
      confidence: string,
      colorHex: string,
      quote: string,
      product: string
    ): THREE.CanvasTexture {
      const canvas = document.createElement('canvas');
      canvas.width = 340;
      canvas.height = 145;
      const ctx = canvas.getContext('2d')!;

      // Pure white card with subtle grey border
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(6, 6, 328, 133, 14);
      ctx.fill();

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top badge
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.roundRect(18, 18, 90, 24, 6);
      ctx.fill();

      // Badge label text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label.toUpperCase(), 28, 34);

      // Confidence
      ctx.fillStyle = '#64748B';
      ctx.font = '600 12px sans-serif';
      ctx.fillText(confidence, 118, 34);

      // Product tag
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 11px sans-serif';
      ctx.fillText(product, 230, 34);

      // Review text
      ctx.fillStyle = '#0F172A';
      ctx.font = '600 14px sans-serif';
      ctx.fillText(`"${quote}"`, 18, 80);

      // Bottom fine divider
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, 105);
      ctx.lineTo(322, 105);
      ctx.stroke();

      // Verified mark
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(24, 122, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.font = '500 10px sans-serif';
      ctx.fillText('Verified Customer Review', 34, 125);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    // 8. Floating Review Cards in 3D Space
    const cardsGroup = new THREE.Group();
    rootGroup.add(cardsGroup);

    const cardConfigs = [
      {
        label: 'Positive',
        conf: '98% Conf',
        color: '#16A34A',
        quote: 'Magic noise cancellation',
        product: 'AudioPro ANC',
        pos: new THREE.Vector3(1.85, 0.8, 0.6),
        rot: [0.06, -0.25, 0.03],
      },
      {
        label: 'Neutral',
        conf: '79% Conf',
        color: '#D97706',
        quote: 'Fast GaN, slight warmth',
        product: 'Charge Duo',
        pos: new THREE.Vector3(-1.9, 0.35, 0.7),
        rot: [-0.06, 0.3, -0.03],
      },
      {
        label: 'Negative',
        conf: '96% Conf',
        color: '#E11D48',
        quote: 'Hinge tolerance friction',
        product: 'Ultra 16',
        pos: new THREE.Vector3(0.3, -1.45, 0.8),
        rot: [0.15, 0.0, 0.06],
      },
    ];

    const cardMeshes: THREE.Mesh[] = [];

    cardConfigs.forEach((cfg) => {
      const tex = createLightMinimalCardTexture(cfg.label, cfg.conf, cfg.color, cfg.quote, cfg.product);
      const cardGeo = new THREE.PlaneGeometry(1.65, 0.7);
      const cardMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      cardMesh.position.copy(cfg.pos);
      cardMesh.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);
      cardsGroup.add(cardMesh);
      cardMeshes.push(cardMesh);
    });

    // 9. Soft Ground Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 5, 64, 64, 60);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.08)');
    grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.02)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.9;
    rootGroup.add(shadowPlane);

    // 10. Mouse Parallax Target
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 0.35;
      mouse.targetY = y * 0.25;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 11. Animation Loop
    let clock = new THREE.Clock();

    function renderScene() {
      const time = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      rootGroup.rotation.y = mouse.x * 0.45;
      rootGroup.rotation.x = -mouse.y * 0.3;

      coreGroup.rotation.y = time * 0.3;
      coreGroup.rotation.x = Math.sin(time * 0.2) * 0.1;

      const pulse = 1 + Math.sin(time * 2.2) * 0.06;
      innerMesh.scale.set(pulse, pulse, pulse);

      ring1.rotation.z = time * 0.16;
      ring2.rotation.z = -time * 0.12;

      cardMeshes.forEach((mesh, idx) => {
        const offset = idx * 2.1;
        mesh.position.y = cardConfigs[idx].pos.y + Math.sin(time * 1.4 + offset) * 0.06;
      });

      renderer.render(scene, camera);
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timerId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          timerId = window.setTimeout(cb, 80);
        }
      };
      timerId = window.setTimeout(poll, 5);
    }

    function tick() {
      renderScene();
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);

      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      cardMeshes.forEach((m) => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] md:h-[480px] flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
