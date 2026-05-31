'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CinematicLayerProps {
  className?: string;
}

export default function CinematicLayer({ className }: CinematicLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Bokeh particles
    const PARTICLE_COUNT = isMobile ? 100 : 220;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const warmColors = [
      new THREE.Color(0xff8c42),  // warm orange
      new THREE.Color(0xffb347),  // amber
      new THREE.Color(0xffd28a),  // golden
      new THREE.Color(0xfff4e0),  // warm white
      new THREE.Color(0x4da6ff),  // soft blue accent
      new THREE.Color(0xffe0b2),  // peach
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 18;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 6 - 1;

      const col = warmColors[Math.floor(Math.random() * warmColors.length)];
      colors[i3]     = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      sizes[i] = Math.random() * 28 + 6;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Soft bokeh circle texture
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 64;
    texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   'rgba(255,255,255,0.95)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(texCanvas);

    const material = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Secondary smaller particles layer
    const MINI_COUNT = isMobile ? 150 : 380;
    const miniPositions = new Float32Array(MINI_COUNT * 3);
    const miniColors = new Float32Array(MINI_COUNT * 3);
    const miniSizes = new Float32Array(MINI_COUNT);
    const miniPhases = new Float32Array(MINI_COUNT);

    for (let i = 0; i < MINI_COUNT; i++) {
      const i3 = i * 3;
      miniPositions[i3]     = (Math.random() - 0.5) * 20;
      miniPositions[i3 + 1] = (Math.random() - 0.5) * 12;
      miniPositions[i3 + 2] = (Math.random() - 0.5) * 4;
      const col = warmColors[Math.floor(Math.random() * warmColors.length)];
      miniColors[i3]     = col.r;
      miniColors[i3 + 1] = col.g;
      miniColors[i3 + 2] = col.b;
      miniSizes[i] = Math.random() * 8 + 2;
      miniPhases[i] = Math.random() * Math.PI * 2;
    }

    const miniGeo = new THREE.BufferGeometry();
    miniGeo.setAttribute('position', new THREE.BufferAttribute(miniPositions, 3));
    miniGeo.setAttribute('color', new THREE.BufferAttribute(miniColors, 3));
    miniGeo.setAttribute('size', new THREE.BufferAttribute(miniSizes, 1));

    const miniMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      map: texture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const miniParticles = new THREE.Points(miniGeo, miniMat);
    scene.add(miniParticles);

    // Mouse parallax
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouse);

    // Resize
    let lastWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Animation
    let time = 0;
    const posArray = geometry.attributes.position.array as Float32Array;
    const miniPosArray = miniGeo.attributes.position.array as Float32Array;
    const origPositions = positions.slice();
    const origMiniPositions = miniPositions.slice();

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      time += 0.0035;

      // Float bokeh particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posArray[i3]     = origPositions[i3]     + Math.sin(time * 0.4 + phases[i]) * 0.3;
        posArray[i3 + 1] = origPositions[i3 + 1] + Math.cos(time * 0.3 + phases[i] * 1.3) * 0.25;
        posArray[i3 + 2] = origPositions[i3 + 2] + Math.sin(time * 0.2 + phases[i] * 0.7) * 0.15;
      }
      geometry.attributes.position.needsUpdate = true;

      // Float mini particles
      for (let i = 0; i < MINI_COUNT; i++) {
        const i3 = i * 3;
        miniPosArray[i3]     = origMiniPositions[i3]     + Math.sin(time * 0.5 + miniPhases[i]) * 0.2;
        miniPosArray[i3 + 1] = origMiniPositions[i3 + 1] + Math.cos(time * 0.35 + miniPhases[i] * 1.5) * 0.18;
      }
      miniGeo.attributes.position.needsUpdate = true;

      // Camera parallax
      camera.position.x += (mouseRef.current.x * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (mouseRef.current.y * 0.25 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      miniGeo.dispose();
      material.dispose();
      miniMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}
