import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import useMousePosition from '../hooks/useMousePosition';

/**
 * ThreeBackground — 3D Developer Laptop & Workstation
 * Features:
 * - Sleek anodized aluminum unibody laptop chassis
 * - Dynamic high-res IDE Code Screen texture with syntax highlighting & terminal
 * - Backlit recessed keyboard with glowing key matrix
 * - Floating holographic code brackets and ambient particles
 * - Responsive mouse parallax tilt and smooth scroll-linked traversal
 */

// Helper to create a dynamic high-resolution IDE Screen canvas texture
function createScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // 1. IDE Editor Background
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Editor Titlebar & Window Controls
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, 48);

  // Window dots
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(28, 24, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(52, 24, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath(); ctx.arc(76, 24, 7, 0, Math.PI * 2); ctx.fill();

  // Tab Header
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(110, 8, 220, 40);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(110, 46, 220, 2); // active tab border

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('resolveDoubt.js', 135, 33);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText('DoubtDesk v1.0', 880, 31);

  // 3. Sidebar
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 48, 54, canvas.height - 48);
  ctx.fillStyle = '#3b82f6';
  ctx.font = '20px monospace';
  ctx.fillText('⚡', 18, 90);
  ctx.fillText('📁', 18, 135);
  ctx.fillText('🔍', 18, 180);

  // 4. Line Numbers & Code Content
  const codeLines = [
    { num: '01', color: '#64748b', text: '// CodingMates Doubt Resolution Engine' },
    { num: '02', color: '#a855f7', text: 'import { createDoubtSession } from "@doubtdesk/core";' },
    { num: '03', color: '#64748b', text: '' },
    { num: '04', color: '#3b82f6', text: 'export async function resolveStudentDoubt(doubtId) {' },
    { num: '05', color: '#e2e8f0', text: '  const session = await createDoubtSession(doubtId);' },
    { num: '06', color: '#e2e8f0', text: '  const mentor  = await session.assignAvailableMentor();' },
    { num: '07', color: '#64748b', text: '' },
    { num: '08', color: '#f59e0b', text: '  // Threaded student-mentor clarification' },
    { num: '09', color: '#e2e8f0', text: '  const solution = await mentor.reviewAndClarify(session);' },
    { num: '10', color: '#22c55e', text: '  return session.markStatus("RESOLVED");' },
    { num: '11', color: '#3b82f6', text: '}' },
    { num: '12', color: '#64748b', text: '' },
    { num: '13', color: '#22c55e', text: '✓ STATUS: 100% COMPILED — "Learn Today, Lead Tomorrow."' },
  ];

  ctx.font = '18px "JetBrains Mono", "Courier New", monospace';

  let startY = 90;
  codeLines.forEach((line) => {
    // Line number
    ctx.fillStyle = '#334155';
    ctx.fillText(line.num, 75, startY);

    // Code text
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 120, startY);
    startY += 38;
  });

  // Glowing status line at bottom
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(54, canvas.height - 36, canvas.width - 54, 36);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath(); ctx.arc(80, canvas.height - 18, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('QUEUE ACTIVE  ·  UTF-8  ·  Node.js 20.x  ·  CodingMates Pvt Ltd', 100, canvas.height - 13);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function ThreeBackground() {
  const canvasRef = useRef(null);
  const { normalized } = useMousePosition();
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });
  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);

  useEffect(() => {
    mouseTarget.current = normalized;
  }, [normalized]);

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7.2);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 3. Materials
    // Space gray anodized metallic aluminum
    const aluminumMaterial = new THREE.MeshStandardMaterial({
      color: 0x14171e,
      metalness: 0.88,
      roughness: 0.22,
    });

    // Dark bezel material
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: 0x080a0f,
      metalness: 0.6,
      roughness: 0.4,
    });

    // Emissive Keyboard deck material
    const keyboardDeckMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c0f16,
      metalness: 0.8,
      roughness: 0.35,
    });

    const keycapMaterial = new THREE.MeshStandardMaterial({
      color: 0x182030,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0x1d3557,
      emissiveIntensity: 0.3,
    });

    // 4. Constructing 3D Laptop Workstation
    const laptopGroup = new THREE.Group();
    scene.add(laptopGroup);

    // 4A. Base / Bottom Chassis
    const baseGeo = new THREE.BoxGeometry(3.6, 0.12, 2.4);
    const baseMesh = new THREE.Mesh(baseGeo, aluminumMaterial);
    baseMesh.position.set(0, -0.06, 0);
    laptopGroup.add(baseMesh);

    // Keyboard well
    const keyWellGeo = new THREE.BoxGeometry(3.2, 0.02, 1.3);
    const keyWell = new THREE.Mesh(keyWellGeo, keyboardDeckMaterial);
    keyWell.position.set(0, 0.005, -0.3);
    laptopGroup.add(keyWell);

    // Keyboard Key Grid (Represented with clean beveled keycaps)
    const keysGroup = new THREE.Group();
    const keyCols = 12;
    const keyRows = 4;
    const keyWidth = 0.22;
    const keyHeight = 0.2;
    const gap = 0.04;

    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const keyGeo = new THREE.BoxGeometry(keyWidth, 0.03, keyHeight);
        const keyMesh = new THREE.Mesh(keyGeo, keycapMaterial);
        const x = (c - (keyCols - 1) / 2) * (keyWidth + gap);
        const z = (r - (keyRows - 1) / 2) * (keyHeight + gap) - 0.3;
        keyMesh.position.set(x, 0.02, z);
        keysGroup.add(keyMesh);
      }
    }
    laptopGroup.add(keysGroup);

    // Trackpad
    const trackpadGeo = new THREE.BoxGeometry(1.2, 0.01, 0.7);
    const trackpadMat = new THREE.MeshStandardMaterial({
      color: 0x181e28,
      metalness: 0.9,
      roughness: 0.2,
    });
    const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
    trackpad.position.set(0, 0.01, 0.65);
    laptopGroup.add(trackpad);

    // 4B. Display Lid Group (Hinged at back)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0, -1.2); // hinge position
    lidGroup.rotation.x = -Math.PI / 1.7; // ~106 degrees open
    laptopGroup.add(lidGroup);

    // Display Back Lid
    const lidGeo = new THREE.BoxGeometry(3.6, 0.08, 2.35);
    const lidMesh = new THREE.Mesh(lidGeo, aluminumMaterial);
    lidMesh.position.set(0, 0.04, 1.175);
    lidGroup.add(lidMesh);

    // Display Bezel Frame
    const bezelGeo = new THREE.BoxGeometry(3.5, 0.02, 2.25);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMaterial);
    bezelMesh.position.set(0, 0.081, 1.175);
    lidGroup.add(bezelMesh);

    // Glowing IDE Code Screen
    const screenTexture = createScreenTexture();
    const screenGeo = new THREE.PlaneGeometry(3.3, 2.05);
    const screenMaterial = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMaterial);
    screenMesh.rotation.x = -Math.PI / 2;
    screenMesh.position.set(0, 0.092, 1.175);
    lidGroup.add(screenMesh);

    // 4C. Subtle Floating Holographic Brackets around the Laptop
    const bracketGeo = new THREE.TorusGeometry(2.8, 0.008, 16, 100);
    const bracketMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.28,
    });
    const orbitRing = new THREE.Mesh(bracketGeo, bracketMat);
    orbitRing.rotation.x = Math.PI / 2.4;
    laptopGroup.add(orbitRing);

    // 5. Floating Ambient Sparkle Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 3.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i3 + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.03,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Lighting (Key + Electric Blue Rim + Screen Glow + Ambient)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const blueFill = new THREE.DirectionalLight(0x3b82f6, 1.4);
    blueFill.position.set(-6, -2, 5);
    scene.add(blueFill);

    const screenGlowLight = new THREE.PointLight(0x3b82f6, 1.2, 5);
    screenGlowLight.position.set(0, 1.2, 0);
    laptopGroup.add(screenGlowLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // 7. Animation Loop with Parallax & Scroll Kinematics
    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse coordinates
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.05;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.05;

      // Lerp scroll position
      scrollCurrent.current += (scrollTarget.current - scrollCurrent.current) * 0.05;

      const mx = mouseCurrent.current.x;
      const my = mouseCurrent.current.y;
      const sc = scrollCurrent.current;

      // 3D Workstation Default Perspective Angle & Responsive Parallax Tilt
      laptopGroup.rotation.x = 0.35 + my * 0.3;
      laptopGroup.rotation.y = -0.45 + mx * 0.4 + Math.sin(elapsed * 0.5) * 0.05;
      laptopGroup.rotation.z = Math.sin(elapsed * 0.4) * 0.03;

      // Dynamic Position & Traversal Across Sections
      laptopGroup.position.x = 1.35 + mx * 0.45 - sc * 2.7;
      laptopGroup.position.y = -0.15 + Math.sin(elapsed * 0.8) * 0.12 - my * 0.25;
      laptopGroup.position.z = -sc * 1.2;

      // Floating Orbit Ring Rotation
      orbitRing.rotation.z = elapsed * 0.15;

      // Particles Parallax
      particles.rotation.y = elapsed * 0.03 + mx * 0.1;
      particles.rotation.x = elapsed * 0.02 + my * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      baseGeo.dispose();
      keyWellGeo.dispose();
      trackpadGeo.dispose();
      lidGeo.dispose();
      bezelGeo.dispose();
      screenGeo.dispose();
      bracketGeo.dispose();
      particleGeo.dispose();
      screenTexture.dispose();
      aluminumMaterial.dispose();
      bezelMaterial.dispose();
      keyboardDeckMaterial.dispose();
      keycapMaterial.dispose();
      trackpadMat.dispose();
      screenMaterial.dispose();
      bracketMat.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
