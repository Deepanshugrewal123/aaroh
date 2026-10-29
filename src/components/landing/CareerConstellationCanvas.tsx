"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CareerConstellationCanvasProps {
  activeDisciplineIndex?: number;
  scrollProgress?: number;
  isDark?: boolean;
}

// 7 Multidisciplinary Orbital Coordinates & Colors
const DISCIPLINE_NODES = [
  { id: "tech", label: "Engineering & Systems", color: 0x4f75ff, lightColor: 0x2563eb, pos: [2.8, 0.4, 0.5] },
  { id: "design", label: "Design & UX", color: 0x2dd4bf, lightColor: 0x0d9488, pos: [-2.6, 0.8, -0.6] },
  { id: "finance", label: "Commerce & Valuation", color: 0xf59e0b, lightColor: 0xd97706, pos: [2.1, -1.2, -1.4] },
  { id: "policy", label: "Law & Public Policy", color: 0xa855f7, lightColor: 0x7c3aed, pos: [-1.8, -1.5, 0.8] },
  { id: "science", label: "Science & Research", color: 0x06b6d4, lightColor: 0x0891b2, pos: [0.8, 1.9, -1.0] },
  { id: "healthcare", label: "Healthcare & Life", color: 0x10b981, lightColor: 0x059669, pos: [-0.9, 1.8, 1.2] },
  { id: "media", label: "Media & Journalism", color: 0xf43f5e, lightColor: 0xe11d48, pos: [0.2, -2.1, -0.3] },
];

export function CareerConstellationCanvas({
  activeDisciplineIndex = 0,
  scrollProgress = 0,
  isDark = true,
}: CareerConstellationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Keep refs for fast animation updates without tearing down the Three.js scene on scroll
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;
  const activeDisciplineRef = useRef(activeDisciplineIndex);
  activeDisciplineRef.current = activeDisciplineIndex;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup with atmospheric fog
    const scene = new THREE.Scene();
    const fogColor = isDark ? 0x0b1020 : 0xf8fafc;
    scene.fog = new THREE.FogExp2(fogColor, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 8.5);

    // 3. WebGL Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = isDark ? 1.15 : 0.95;
      container.appendChild(renderer.domElement);
    } catch {
      setWebGLSupported(false);
      return;
    }

    // 4. Procedural Particle Texture
    const particleTexture = createCircularParticleTexture();

    // 5. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x223355 : 0x94a3b8, isDark ? 1.2 : 0.8);
    scene.add(ambientLight);

    const primaryLight = new THREE.PointLight(isDark ? 0x4f75ff : 0x2563eb, 3.5, 20);
    primaryLight.position.set(3, 4, 4);
    scene.add(primaryLight);

    const secondaryLight = new THREE.PointLight(isDark ? 0x2dd4bf : 0x0d9488, 2.8, 18);
    secondaryLight.position.set(-4, -2, 3);
    scene.add(secondaryLight);

    // 6. Volumetric Star / Telemetry Particles
    const particleCount = window.innerWidth < 768 ? 450 : 850;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    const colorA = new THREE.Color(isDark ? 0x4f75ff : 0x2563eb);
    const colorB = new THREE.Color(isDark ? 0x2dd4bf : 0x0d9488);
    const colorC = new THREE.Color(isDark ? 0xa855f7 : 0x7c3aed);

    for (let i = 0; i < particleCount; i++) {
      // Cloud distribution with elliptical spread
      const radius = 2.5 + Math.random() * 9.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      positions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * 0.8 + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = radius * Math.cos(phi) * Math.cos(theta);

      // Color variation across particles
      const mixRatio = Math.random();
      const mixedColor = mixRatio < 0.5 ? colorA.clone().lerp(colorB, mixRatio * 2) : colorB.clone().lerp(colorC, (mixRatio - 0.5) * 2);

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;

      speeds[i] = 0.2 + Math.random() * 0.8;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: window.innerWidth < 768 ? 0.08 : 0.12,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      opacity: isDark ? 0.75 : 0.55,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 7. Central Beacon (Aaroh Career Compass Core)
    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // Inner core sphere
    const innerCoreGeometry = new THREE.SphereGeometry(0.55, 32, 32);
    const innerCoreMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x6d8dff : 0x2563eb,
      emissive: isDark ? 0x3b5ccc : 0x1d4ed8,
      emissiveIntensity: isDark ? 0.6 : 0.3,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
    compassGroup.add(innerCore);

    // Outer faceted icosahedron cage
    const outerCageGeometry = new THREE.IcosahedronGeometry(0.95, 1);
    const outerCageMaterial = new THREE.MeshStandardMaterial({
      color: isDark ? 0x2dd4bf : 0x0d9488,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.45 : 0.35,
    });
    const outerCage = new THREE.Mesh(outerCageGeometry, outerCageMaterial);
    compassGroup.add(outerCage);

    // Subtle equatorial rings
    const ringGeometry = new THREE.RingGeometry(1.2, 1.25, 48);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: isDark ? 0x6d8dff : 0x3b5ccc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
    });
    const equatorialRing = new THREE.Mesh(ringGeometry, ringMaterial);
    equatorialRing.rotation.x = Math.PI / 2;
    compassGroup.add(equatorialRing);

    // 8. 7 Multidisciplinary Career Nodes & Halos
    const nodeMeshes: {
      group: THREE.Group;
      sphere: THREE.Mesh;
      halo: THREE.Mesh;
      baseColor: THREE.Color;
      id: string;
    }[] = [];

    DISCIPLINE_NODES.forEach((node) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(node.pos[0], node.pos[1], node.pos[2]);

      const baseColor = new THREE.Color(isDark ? node.color : node.lightColor);

      // Core node sphere
      const sphereGeo = new THREE.SphereGeometry(0.18, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: baseColor,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.7,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      nodeGroup.add(sphere);

      // Pulsing halo ring
      const haloGeo = new THREE.RingGeometry(0.24, 0.32, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: baseColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(halo);

      scene.add(nodeGroup);
      nodeMeshes.push({ group: nodeGroup, sphere, halo, baseColor, id: node.id });
    });

    // 9. Interconnected Constellation Lines
    const lineCoords: number[] = [];
    // Connect each node to central compass
    DISCIPLINE_NODES.forEach((node) => {
      lineCoords.push(0, 0, 0);
      lineCoords.push(node.pos[0], node.pos[1], node.pos[2]);
    });
    // Connect adjacent nodes
    for (let i = 0; i < DISCIPLINE_NODES.length; i++) {
      const nextIdx = (i + 1) % DISCIPLINE_NODES.length;
      lineCoords.push(DISCIPLINE_NODES[i].pos[0], DISCIPLINE_NODES[i].pos[1], DISCIPLINE_NODES[i].pos[2]);
      lineCoords.push(DISCIPLINE_NODES[nextIdx].pos[0], DISCIPLINE_NODES[nextIdx].pos[1], DISCIPLINE_NODES[nextIdx].pos[2]);
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lineCoords, 3));
    const linesMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x4f75ff : 0x2563eb,
      transparent: true,
      opacity: isDark ? 0.22 : 0.15,
    });
    const constellationLines = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(constellationLines);

    // 10. Pointer Interaction & Parallax Lerp State
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handlePointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 11. Resize handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    };
    window.addEventListener("resize", handleResize);

    // 12. Visibility handling
    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 13. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Rotate compass beacon
      if (!prefersReducedMotion) {
        innerCore.rotation.y = elapsedTime * 0.25;
        outerCage.rotation.x = elapsedTime * 0.18;
        outerCage.rotation.y = -elapsedTime * 0.22;
        equatorialRing.rotation.z = elapsedTime * 0.12;

        // Subtle slow particle rotation
        particles.rotation.y = elapsedTime * 0.035;
        particles.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

        // Orbiting lights
        primaryLight.position.x = Math.cos(elapsedTime * 0.35) * 4;
        primaryLight.position.z = Math.sin(elapsedTime * 0.35) * 4 + 2;

        secondaryLight.position.x = -Math.cos(elapsedTime * 0.4) * 4.5;
        secondaryLight.position.y = Math.sin(elapsedTime * 0.3) * 2.5;
      }

      // Active Discipline Node Pulse & Halo Orientation
      nodeMeshes.forEach((meshItem, idx) => {
        meshItem.halo.lookAt(camera.position);

        const isCurrentActive = idx === activeDisciplineRef.current;
        const targetScale = isCurrentActive ? 1.45 + Math.sin(elapsedTime * 4) * 0.15 : 1.0;
        meshItem.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

        const haloMat = meshItem.halo.material as THREE.MeshBasicMaterial;
        const targetOpacity = isCurrentActive ? 0.85 : 0.35;
        haloMat.opacity += (targetOpacity - haloMat.opacity) * 0.08;
      });

      // Scroll-Driven Camera Journey Interpolation
      // 0.00 = Hero panoramic
      // 0.25 = Explore constellations
      // 0.50 = 4-Step Proof corridor
      // 0.75 = Reality shift & micro-trials
      // 1.00 = Launchpad warp
      const progress = Math.max(0, Math.min(1, scrollProgressRef.current));

      let targetCamX = mouse.x * 0.8;
      let targetCamY = 0.8 - mouse.y * 0.5 - progress * 1.2;
      let targetCamZ = 8.5;

      if (progress < 0.25) {
        // Hero: Wide panoramic view
        targetCamZ = 8.5 - progress * 4;
      } else if (progress < 0.5) {
        // Constellation explorer: Sweep closer to active discipline node
        const activeNode = DISCIPLINE_NODES[activeDisciplineRef.current] || DISCIPLINE_NODES[0];
        targetCamX = activeNode.pos[0] * 0.5 + mouse.x * 0.5;
        targetCamY = activeNode.pos[1] * 0.4 - mouse.y * 0.4;
        targetCamZ = 5.8;
      } else if (progress < 0.75) {
        // Proof framework: descend down the central timeline
        targetCamX = -1.2 + mouse.x * 0.6;
        targetCamY = -0.6 - mouse.y * 0.4;
        targetCamZ = 6.2;
      } else {
        // Climax Launchpad: Warp zoom in toward core compass
        const warpProgress = (progress - 0.75) / 0.25;
        targetCamX = mouse.x * 0.4;
        targetCamY = -0.2 - mouse.y * 0.3;
        targetCamZ = 6.2 - warpProgress * 2.8;

        // Particle speed boost at launchpad
        if (!prefersReducedMotion) {
          particles.rotation.y = elapsedTime * (0.035 + warpProgress * 0.15);
        }
      }

      if (window.innerWidth < 768) {
        targetCamZ += 2.0; // Extra clearance on mobile viewports
      }

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      camera.lookAt(0, -progress * 0.4, 0);

      renderer?.render(scene, camera);
    };

    animate();

    // 14. Complete Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }

      particleGeometry.dispose();
      particleMaterial.dispose();
      innerCoreGeometry.dispose();
      innerCoreMaterial.dispose();
      outerCageGeometry.dispose();
      outerCageMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();

      nodeMeshes.forEach((item) => {
        item.sphere.geometry.dispose();
        (item.sphere.material as THREE.Material).dispose();
        item.halo.geometry.dispose();
        (item.halo.material as THREE.Material).dispose();
      });
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {!webGLSupported && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/15 via-canvas to-canvas opacity-70" />
      )}
    </div>
  );
}

// Procedural soft-glow circular particle sprite (No external image file dependencies)
function createCircularParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.85)");
    gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.25)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
