import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import {
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Microscope,
  Award,
  HeartHandshake,
  CheckCircle2,
  CalendarDays,
  ArrowLeft,
  ChevronDown,
  Layers,
  Zap,
  Activity,
  Compass,
  PhoneCall,
  MessageCircle,
  Check,
  Shield,
  Clock,
  Quote,
} from 'lucide-react';
import { clinic, branches as fallbackBranches } from '@/data/clinicData';
import { useWeeklySchedule } from '@/hooks/useSchedule';
import { MagneticButton } from '@/components/ui/MagneticButton';

gsap.registerPlugin(ScrollTrigger);

// Exact cutout portrait URL for Dr. Ahmed Zaghloul
const DOCTOR_PORTRAIT_URL =
  'https://i.postimg.cc/m2W4gjwt/106929042-3317889038271540-2818272907474417516-n-1-removebg-preview.png';

interface AboutPageProps {
  onOpenBooking: (serviceName?: string, branchId?: string) => void;
  onNavigateHome?: (targetAnchor?: string) => void;
}

/**
 * 3D Medical Laser Core & Cellular Mesh Canvas
 * Built with Three.js WebGL: dual icosahedron core, organic wireframes, cyan/teal particle field.
 * Smooth mouse-tracking parallax, scroll-depth rotation, auto-pauses offscreen.
 */
function MedicalCore3DCanvas({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL availability using a detached test canvas
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
        return;
      }
    } catch {
      setIsWebGLSupported(false);
      return;
    }

    // Set up Scene, Camera, Renderer safely
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (err) {
      console.warn('WebGLRenderer init error:', err);
      setIsWebGLSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.5;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Outer Organic Mesh: Dual Icosahedron Core
    const outerGeo = new THREE.IcosahedronGeometry(2.1, 3);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerMesh);

    // Inner Medical Nucleus Mesh
    const innerGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Cellular Floating Particle Cloud (Cyan + Teal)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 3.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const ratio = Math.random();
      colors[i * 3] = ratio * 0.0 + (1 - ratio) * 0.22;
      colors[i * 3 + 1] = ratio * 0.96 + (1 - ratio) * 0.74;
      colors[i * 3 + 2] = ratio * 0.83 + (1 - ratio) * 0.97;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetRotY = (e.clientX / innerWidth - 0.5) * 0.7;
      targetRotX = (e.clientY / innerHeight - 0.5) * 0.7;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let scrollOffset = 0;
    const handleScroll = () => {
      scrollOffset = window.scrollY * 0.0012;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();

      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      if (!prefersReducedMotion) {
        outerMesh.rotation.y = elapsed * 0.18 + currentRotY + scrollOffset;
        outerMesh.rotation.x = elapsed * 0.12 + currentRotX;

        innerMesh.rotation.y = -elapsed * 0.24 - currentRotY;
        innerMesh.rotation.z = elapsed * 0.15 + scrollOffset;

        particles.rotation.y = elapsed * 0.05 + currentRotY * 0.5;
        particles.rotation.x = -elapsed * 0.03 + currentRotX * 0.5;

        const scale = 1 + Math.sin(elapsed * 1.6) * 0.035;
        outerMesh.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [prefersReducedMotion]);

  if (!isWebGLSupported) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="relative w-80 h-80 rounded-full border border-[#00F5D4]/20 animate-[spin_20s_linear_infinite]">
          <div className="absolute inset-4 rounded-full border border-teal-500/30 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-10 rounded-full border border-cyan-400/20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-80" />
    </div>
  );
}

/**
 * Spatial Spotlight Card with Clinical Intelligence Animation Interactions
 * - Staggered scroll entrance for card, icon, and number badge
 * - Interactive hover state: vertical elevation (-6px), teal border & glow, top badge shift, icon micro-pulse, cyan number glow
 * - Animated bottom progress line expanding across full card width
 * - Medical light scan pass sweeping from top to bottom
 * - Mobile touch play-once animation on viewport entry
 */
interface SpatialSpotlightCardProps {
  num: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  index: number;
}

function SpatialSpotlightCard({
  num,
  title,
  desc,
  tag,
  icon: Icon,
  index,
}: SpatialSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [mobileScanned, setMobileScanned] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsHovered(false);
    }
  };

  // Trigger mobile play-once animation when entering viewport
  const handleViewportEnter = () => {
    if (isTouchDevice && !mobileScanned) {
      const timer = setTimeout(() => {
        setMobileScanned(true);
      }, index * 120 + 250);
      return () => clearTimeout(timer);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      onViewportEnter={handleViewportEnter}
      transition={{
        duration: 0.65,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={!isTouchDevice ? { y: -6 } : undefined}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-3xl p-px overflow-hidden transition-all duration-400 bg-gradient-to-b from-white/10 via-white/5 to-transparent ${
        isHovered
          ? 'shadow-[0_20px_50px_rgba(0,245,212,0.2)] border-cyan-400/40'
          : 'shadow-lg border-transparent'
      }`}
      style={{
        transitionProperty: 'transform, box-shadow, border-color',
        transitionDuration: '0.4s',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered && !isTouchDevice ? 1 : 0,
          background: `radial-gradient(380px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 245, 212, 0.22), rgba(14, 165, 233, 0.08), transparent 70%)`,
        }}
      />

      {/* Card Content Container */}
      <div
        className={`relative z-10 h-full rounded-[23px] backdrop-blur-xl p-8 flex flex-col justify-between border transition-all duration-400 overflow-hidden ${
          isHovered
            ? 'bg-slate-900/90 border-cyan-400/40 shadow-[inset_0_0_20px_rgba(0,245,212,0.08)]'
            : 'bg-[#0c1424]/90 border-cyan-500/20'
        }`}
      >
        {/* Medical Light Scan Beam Pass */}
        <motion.div
          key={isHovered ? 'hover-scan' : isTouchDevice && mobileScanned ? 'mobile-scan' : 'idle'}
          initial={{ top: '0%', opacity: 0 }}
          animate={
            isHovered
              ? {
                  top: ['0%', '100%'],
                  opacity: [0, 0.9, 0.9, 0],
                }
              : isTouchDevice && mobileScanned
              ? {
                  top: ['0%', '100%'],
                  opacity: [0, 0.9, 0.9, 0],
                }
              : { top: '0%', opacity: 0 }
          }
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          className="pointer-events-none absolute left-0 right-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent z-20 filter drop-shadow-[0_0_6px_#00F5D4]"
        />

        <div>
          {/* Top Row: Icon + Massive Outlined Stroke Number */}
          <div className="flex items-start justify-between gap-4">
            {/* Top Icon with Micro-Pulse on Hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.15 + index * 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              animate={
                isHovered
                  ? { scale: [1, 1.12, 1] }
                  : isTouchDevice && mobileScanned
                  ? { scale: [1, 1.1, 1] }
                  : { scale: 1 }
              }
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#00F5D4]/20 via-teal-500/10 to-transparent border border-[#00F5D4]/30 grid place-items-center text-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.25)] group-hover:shadow-[0_0_35px_rgba(0,245,212,0.5)] transition-shadow duration-300"
            >
              <Icon className="h-7 w-7" />
            </motion.div>

            {/* Massive Outlined Stroke Number with Cyan Glow */}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.18 + index * 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-5xl font-black font-mono tracking-tighter text-transparent select-none transition-all duration-300"
              style={{
                WebkitTextStroke: isHovered ? '1.8px #00F5D4' : '1.5px #00F5D4',
                textShadow: isHovered
                  ? '0 0 25px rgba(0,245,212,0.7), 0 0 45px rgba(0,245,212,0.35)'
                  : '0 0 10px rgba(0,245,212,0.2)',
              }}
            >
              {num}
            </motion.span>
          </div>

          {/* Tag Capsule with 2px Upward Shift on Hover */}
          <div className="mt-6">
            <div
              className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border transition-all duration-300 ${
                isHovered
                  ? 'text-[#00F5D4] bg-[#00F5D4]/15 border-[#00F5D4]/40 -translate-y-0.5 shadow-[0_0_15px_rgba(0,245,212,0.25)]'
                  : 'text-[#00F5D4] bg-[#00F5D4]/10 border-[#00F5D4]/20 translate-y-0'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>{tag}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-black text-white mt-4 group-hover:text-[#00F5D4] transition-colors leading-snug">
            {title}
          </h3>

          {/* Description */}
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Bottom Section with Animated Progress Line */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-colors mb-3">
            <span>معايير إكلينيكية معتمدة</span>
            <div
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                isHovered
                  ? 'bg-[#00F5D4] shadow-[0_0_14px_#00F5D4] scale-125'
                  : 'bg-[#00F5D4]/80'
              }`}
            />
          </div>

          {/* Animated Bottom Progress Line (Expands across full width on hover) */}
          <div className="w-full h-[2px] rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00F5D4] via-teal-300 to-cyan-400 transition-all duration-500 ease-out"
              style={{
                width: isHovered || (isTouchDevice && mobileScanned) ? '100%' : '24px',
                boxShadow: isHovered ? '0 0 10px rgba(0,245,212,0.6)' : 'none',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Awwwards Luxury Stacking Pillar Card Component
 * Wide horizontal landscape layout, dark glassmorphism, dynamic cursor radial glow, glowing numbers
 */
function StackedPillarCard({
  num,
  badge,
  title,
  desc,
  icon: Icon,
  tags,
  quote,
  index,
  total,
}: {
  num: string;
  badge: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  quote?: string;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: 10 + index }}
      className="gsap-stack-card absolute inset-x-0 top-0 w-full max-w-5xl mx-auto rounded-3xl p-px overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-gradient-to-r from-cyan-500/30 via-teal-500/20 to-white/10 transition-shadow duration-500 hover:shadow-[0_25px_70px_rgba(0,245,212,0.25)] select-none"
    >
      {/* Dynamic Cursor Spotlight Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 245, 212, 0.22), rgba(14, 165, 233, 0.08), transparent 70%)`,
        }}
      />

      {/* Luxury Dark Glassmorphism Container */}
      <div className="relative z-10 w-full min-h-[260px] md:min-h-[220px] rounded-[23px] backdrop-blur-xl bg-slate-950/80 border border-cyan-500/20 p-6 sm:p-8 md:p-9 flex flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Glow Orb in Corner */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Sleek Horizontal Flex Layout */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 w-full">
          {/* Side Column: Icon + Step Badge + Massive Glowing Identifier */}
          <div className="flex sm:flex-row md:flex-col items-center sm:items-center md:items-start justify-between md:justify-center gap-3 shrink-0 w-full md:w-auto md:min-w-[190px] border-b md:border-b-0 md:border-l border-white/10 pb-4 md:pb-0 md:pl-7">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-[#00F5D4]/20 via-teal-500/10 to-transparent border border-[#00F5D4]/35 grid place-items-center text-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.25)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              {/* Glowing Numerical Identifier */}
              <span
                className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-transparent select-none"
                style={{
                  WebkitTextStroke: '1.5px #00F5D4',
                  textShadow: isHovered
                    ? '0 0 25px rgba(0,245,212,0.7)'
                    : '0 0 15px rgba(0,245,212,0.35)',
                }}
              >
                {num}
              </span>
            </div>

            <span className="text-[11px] font-mono font-bold text-[#00F5D4] uppercase tracking-wider bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/25 whitespace-nowrap">
              {badge}
            </span>
          </div>

          {/* Main Content: Title, Description, Tags stretched widely */}
          <div className="flex-1 flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-white hover:text-[#00F5D4] transition-colors leading-snug">
                  {title}
                </h3>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                  <span>0{index + 1} / 0{total}</span>
                </span>
              </div>

              <p className="mt-2.5 text-slate-300 text-sm sm:text-base leading-relaxed">
                {desc}
              </p>
            </div>

            {/* Tags Row */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 hover:border-[#00F5D4]/40 hover:text-white transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00F5D4] shrink-0" />
                  <span>{tag}</span>
                </span>
              ))}
              {quote && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs italic text-emerald-400/90 font-medium mr-auto">
                  <Quote className="h-3.5 w-3.5 inline text-emerald-400" />
                  <span>{quote}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Animated Continuous Border-Beam Card with 3D Tilt Micro-Interactions
 */
function BorderBeamCard({
  num,
  title,
  desc,
  icon: Icon,
  tags,
}: {
  num: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 320, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 320, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative rounded-3xl p-[1.5px] overflow-hidden group transition-shadow duration-500 shadow-[0_12px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_55px_rgba(0,245,212,0.22)]"
    >
      {/* Continuous Border Beam Animation Container */}
      <div className="absolute inset-[-100%] animate-[spin_8s_linear_infinite] opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_280deg,#00F5D4_340deg,#38BDF8_360deg)]" />

      {/* Card Content Body */}
      <div className="relative z-10 h-full rounded-[22.5px] bg-[#0c1424]/95 backdrop-blur-2xl p-7 sm:p-9 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00F5D4]/25 to-teal-500/5 border border-[#00F5D4]/40 grid place-items-center text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.25)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,245,212,0.5)] transition-all duration-300">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/25">
                مبدأ {num}
              </span>
            </div>

            <div className="text-3xl font-black font-mono text-slate-600 group-hover:text-[#00F5D4] transition-colors">
              {num}
            </div>
          </div>

          {/* Title & Desc */}
          <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#00F5D4] transition-colors leading-snug">
            {title}
          </h3>

          <p className="mt-3.5 text-slate-300 text-sm sm:text-base leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Tags Row */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/[0.04] px-3 py-1 rounded-lg border border-white/5 group-hover:border-[#00F5D4]/30 group-hover:text-white transition-all"
            >
              <Check className="h-3 w-3 text-[#00F5D4]" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Main Standalone Masterpiece AboutPage Component
 */
export function AboutPage({ onOpenBooking, onNavigateHome }: AboutPageProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [activePillar, setActivePillar] = useState<'skin' | 'laser' | 'hair'>('skin');
  const mainRef = useRef<HTMLDivElement>(null);
  const laserPathRef = useRef<SVGPathElement>(null);

  // Dynamic Branches from Supabase schedule service
  const { branches: activeBranchesList } = useWeeklySchedule();

  const dynamicBranchNames = useMemo(() => {
    if (activeBranchesList && activeBranchesList.length > 0) {
      return activeBranchesList.map((b) => b.nameAr);
    }
    return fallbackBranches.map((b) => b.nameAr);
  }, [activeBranchesList]);

  const dynamicBranchString = useMemo(() => {
    return dynamicBranchNames.join(' • ');
  }, [dynamicBranchNames]);

  // Set Page Title and Meta Tags
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'من نحن | عيادات Androderma للجلدية والليزر — د. أحمد زغلول';

    const metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'تعرف على رؤية وفلسفة عيادات Androderma للجلدية والتجميل والليزر بإشراف د. أحمد زغلول. معايير طبية صارمة، أحدث تقنيات الليزر المعتمدة، وخطط علاج مخصصة لكل بشرة.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  // GSAP Entrance Animations & ScrollTrigger
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Headline word reveal animation
      gsap.from('.gsap-hero-word', {
        y: 60,
        opacity: 0,
        stagger: 0.08,
        duration: 1,
        ease: 'power4.out',
        clearProps: 'transform,opacity',
      });

      // Reveal elements
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      });

      // GSAP ScrollTrigger Awwwards Stacking Cards Animation for "منظومة علاجية متكاملة"
      const stackCards = gsap.utils.toArray<HTMLElement>('.gsap-stack-card');
      if (stackCards.length > 0) {
        const total = stackCards.length;

        // Set initial positions
        stackCards.forEach((card, idx) => {
          if (idx === 0) {
            gsap.set(card, {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
            });
          } else {
            gsap.set(card, {
              yPercent: 120,
              scale: 0.95,
              opacity: 0,
              filter: 'blur(0px)',
            });
          }
        });

        const stackTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.gsap-stack-section',
            start: 'top top',
            end: () => `+=${total * 100}%`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 0; i < total - 1; i++) {
          const current = stackCards[i];
          const next = stackCards[i + 1];

          stackTl
            .to(
              current,
              {
                scale: 0.95 - i * 0.02,
                yPercent: -4 * (i + 1),
                opacity: 0.5,
                filter: 'blur(4px)',
                duration: 1,
                ease: 'power1.inOut',
              },
              `stack-${i}`
            )
            .to(
              next,
              {
                yPercent: 0,
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power1.inOut',
              },
              `stack-${i}`
            );
        }
      }

      // Journey Steps staggered reveal
      gsap.from('.gsap-journey-step', {
        scrollTrigger: {
          trigger: '.gsap-journey-container',
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.2,
        duration: 0.9,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      // Laser Path Scroll Progress Animation
      if (laserPathRef.current) {
        const pathLength = laserPathRef.current.getTotalLength();
        gsap.set(laserPathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        gsap.to(laserPathRef.current, {
          scrollTrigger: {
            trigger: '.gsap-journey-container',
            start: 'top 75%',
            end: 'bottom 60%',
            scrub: 1,
          },
          strokeDashoffset: 0,
          ease: 'none',
        });
      }

      // Cinematic Quote Scaling Entrance on Scroll
      gsap.from('.gsap-cinematic-quote', {
        scrollTrigger: {
          trigger: '.gsap-quote-section',
          start: 'top 80%',
          end: 'center 50%',
          scrub: 1,
        },
        scale: 0.92,
        opacity: 0.5,
        y: 40,
        ease: 'power2.out',
      });
    }, mainRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Stacking Pillars Dataset for "منظومة علاجية متكاملة"
  const stackPillars = useMemo(
    () => [
      {
        num: '01',
        badge: 'PILLAR 01 • EVIDENCE BASED',
        title: 'الفلسفة الطبية المبنية على الدليل',
        desc: 'نعتمد على الطب القائم على الدليل (Evidence-Based Dermatology). كل تقنية نستخدمها وكل خطة علاجية نصيغها تستند إلى دراسات علمية معتمدة ونتائج إكلينيكية موثقة، لضمان أعلى نسب الأمان وتفادي أي إجراءات زائدة لا تحتاجها حالتك.',
        icon: Stethoscope,
        tags: ['دقة التشخيص السريري', 'أمان الإجراءات المعتمدة', 'نتائج واقعية مستدامة'],
      },
      {
        num: '02',
        badge: 'PILLAR 02 • SMART LASER',
        title: 'التطور التكنولوجي وأنظمة الليزر الذكية',
        desc: 'نستثمر باستمرار في أحدث أجهزة الليزر الطبية المعتمدة من الهيئات الرقابية الدولية، والمزودة بأنظمة تبريد متطورة تحمي سطح الجلد وتمنحك أقصى درجات الراحة أثناء الجلسات وبأطوال موجية مخصصة بدقة.',
        icon: Zap,
        tags: ['⚡ تبريد فائق للجلد', '🔬 أطوال موجية مخصصة', '🛡️ معايير أمان عالمية'],
      },
      {
        num: '03',
        badge: 'PILLAR 03 • TAILORED CARE',
        title: 'التجربة المخصصة لكل مراجع',
        desc: 'لكل شخص طبيعة بشرة فريدة ونمط حياة مختلف. لذلك، نصمم لك برنامج علاج متكامل يشمل الجلسات العيادية والروتين المنزلي المتوافق تماماً مع أهدافك دون باقات تجارية عامة.',
        icon: HeartHandshake,
        tags: ['خطة علاجية مخصصة', 'متابعة روتين منزلي', 'ميثاق إكلينيكي موثق'],
        quote: 'خطة علاجية تُفصل خصيصاً لك، وليست باقات عامة ثابتة.',
      },
      {
        num: '04',
        badge: 'PILLAR 04 • CLINICAL QUALITY',
        title: 'الثقة وجودة الرعاية الإكلينيكية',
        desc: 'نلتزم بأعلى معايير التعقيم الطبي ومكافحة العدوى، ونعتمد على مواد ومستهلكات طبية أصلية 100% معتمدة رسمياً، مع توثيق إلكتروني دقيق لسجلات المراجعين وتاريخ الجلسات لضمان متابعة مستمرة ونتائج قابلة للقياس.',
        icon: ShieldCheck,
        tags: ['تعقيم فوري ومستمر', 'مواد أصلية معتمدة 100%', 'سجل طبي رقمي موثق'],
      },
    ],
    []
  );

  // Pillar Treatment Data
  const pillarData = useMemo(
    () => ({
      skin: {
        id: 'skin',
        title: 'صحة ونضارة البشرة وعلاج الأمراض الجلدية',
        badge: 'DERMATOLOGY & SKIN REPAIR',
        desc: 'لا نتعامل مع البشرة كسطح تجميلي مؤقت، بل كنسيج حيوي معقد يتطلب تشخيصاً سريرياً دقيقاً لطبقات الجلد وتحديد المسببات الجذرية قبل صياغة أي خطة علاجية مخصصة.',
        points: [
          'بروتوكولات علاج حب الشباب وآثاره والتصبغات العميقة المستعصية',
          'تحفيز إنتاج الكولاجين الطبيعي واستعادة نضارة الأنسجة التالفة',
          'جلسات التقشير الطبي والترطيب العميق المخصص لدرجة حساسية البشرة',
          'خطط وقائية متكاملة لروتين العناية المنزلي للحفاظ على استدامة النتائج',
        ],
        icon: Microscope,
        accent: 'from-teal-500/20 via-teal-900/30 to-emerald-500/10',
        glow: '#00F5D4',
      },
      laser: {
        id: 'laser',
        title: 'الليزر والتجميل الطبي الآمن',
        badge: 'ADVANCED MEDICAL LASER',
        desc: 'منظومات ليزر إكلينيكية متطورة معتمدة دولياً ومزودة بأنظمة تبريد هوائي ومائي ديناميكية ذكية لضمان أقصى درجات الأمان والراحة التامة دون التسبب في أي أضرار جانبية أو تصبغات عكسية.',
        points: [
          'إزالة الشعر بالليزر بأطوال موجية مخصصة بدقة لكل لون ونمط بشرة',
          'علاج الندبات الجراحية والحفر العميقة وتجديد ملمس ونقاء الجلد',
          'جلسات الفراكشنال ليزر الدقيقة لتجديد الطبقات العميقة وتحفيز الإيلاستين',
          'معايير تعقيم صارمة وأعلى بروتوكولات الأمان الطبي بإشراف استشاري مباشر',
        ],
        icon: Zap,
        accent: 'from-cyan-500/20 via-cyan-900/30 to-teal-500/10',
        glow: '#38BDF8',
      },
      hair: {
        id: 'hair',
        title: 'علاجات الشعر وفروة الرأس المتقدمة',
        badge: 'SCALP & FOLLICULAR CARE',
        desc: 'تقييم ميكروسكوبي شامل لجذور وبصيلات الشعر وأسباب التساقط، ووضع بروتوكولات علاجية تجمع بين التغذية الخلوية، حقن البلازما عالية التركيز (PRP)، والميزوثيرابي الدقيق.',
        points: [
          'فحص ميكروسكوبي دقيق لكثافة الفروة وجودة الدورة الدموية للبصيلات',
          'جلسات البلازما المكثفة والميزوثيرابي الغني بالفيتامينات وعوامل النمو',
          'برامج علاج التساقط الوراثي والتفاعلي وتقوية الشعر الخفيف والمجهد',
          'متابعة دورية موثقة بالصور التقييمية لمراقبة استعادة الكثافة الطبيعية',
        ],
        icon: Activity,
        accent: 'from-emerald-500/20 via-emerald-900/30 to-teal-500/10',
        glow: '#10B981',
      },
    }),
    []
  );

  return (
    <div
      ref={mainRef}
      className="relative min-h-screen bg-[#070b14] text-slate-100 overflow-x-hidden selection:bg-[#00F5D4]/30 selection:text-[#00F5D4]"
      dir="rtl"
    >
      {/* 1. Subtle SVG Noise Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="pointer-events-none fixed -top-40 right-1/4 h-[550px] w-[550px] rounded-full bg-[#00F5D4]/10 blur-[160px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[180px] z-0" />
      <div className="pointer-events-none fixed bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[160px] z-0" />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO — EDITORIAL LUXURY & ASYMMETRICAL GLASS ARCH              */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* 3D Medical Core Canvas Background */}
        <MedicalCore3DCanvas prefersReducedMotion={prefersReducedMotion} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Editorial Manifesto with Staggered Word Masking */}
            <div className="lg:col-span-7 flex flex-col items-start text-right">
              {/* Floating Glass Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 rounded-full px-4 py-2 bg-[#00F5D4]/10 border border-[#00F5D4]/30 backdrop-blur-xl shadow-[0_0_25px_rgba(0,245,212,0.2)] mb-6"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="text-xs font-black tracking-widest text-[#00F5D4] uppercase font-mono">
                  رؤية د. أحمد زغلول — التجميل القائم على الدليل
                </span>
              </motion.div>

              {/* Giant Editorial Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.3] sm:leading-[1.18] text-white tracking-tight">
                <span className="inline-block gsap-hero-word text-slate-200">بشرتك</span>{' '}
                <span className="inline-block gsap-hero-word text-slate-200">تستحق</span>{' '}
                <span className="inline-block gsap-hero-word bg-gradient-to-l from-[#00F5D4] via-teal-200 to-white bg-clip-text text-transparent">
                  تجربة طبية
                </span>{' '}
                <span className="inline-block gsap-hero-word bg-gradient-to-l from-[#00F5D4] via-teal-200 to-white bg-clip-text text-transparent">
                  مبنية على الدقة
                </span>{' '}
                <span className="inline-block gsap-hero-word text-slate-100">والتجميل</span>{' '}
                <span className="inline-block gsap-hero-word text-[#00F5D4]">الآمن.</span>
              </h1>

              {/* Narrative Story Copy */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.8 }}
                className="mt-6 text-base sm:text-lg leading-relaxed text-slate-300 max-w-2xl font-normal"
              >
                في عيادات <span className="text-white font-bold">Androderma</span>، نؤمن بأن جمال البشرة الطبيعي
                ينبع من صحتها الحقيقية. ندمج بين الفحص السريري الدقيق وأحدث منظومات الليزر المعتمدة دولياً،
                لنقدم لكل مراجع خطة علاجية مخصصة قائمة على الواقعية والنتائج المستدامة دون مبالغة تجارية.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <MagneticButton
                  onClick={() => onOpenBooking()}
                  className="rounded-full bg-[#00F5D4] px-8 py-4 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)] hover:shadow-[0_0_40px_rgba(0,245,212,0.65)] hover:bg-[#20ffd9] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>احجز استشارتك التخصصية</span>
                  </span>
                </MagneticButton>

                {onNavigateHome && (
                  <button
                    onClick={() => onNavigateHome('services')}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5D4]/40 backdrop-blur-xl transition-all cursor-pointer"
                  >
                    <span>استكشف المنظومة العلاجية</span>
                    <ArrowLeft className="h-4 w-4 text-[#00F5D4]" />
                  </button>
                )}
              </motion.div>

              {/* Clinical Trust Badges Row */}
              <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 w-full text-right">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/25 grid place-items-center text-[#00F5D4] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">معايير طبية صارمة</div>
                    <div className="text-[11px] text-slate-400">سلامة المرضى أولوية مطلقة</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/25 grid place-items-center text-[#00F5D4] shrink-0">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">تشخيص سريري مخصص</div>
                    <div className="text-[11px] text-slate-400">بناءً على طبقات كل بشرة</div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/25 grid place-items-center text-[#00F5D4] shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">أحدث أجهزة الليزر</div>
                    <div className="text-[11px] text-slate-400">أنظمة تبريد وحماية للبشرة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Glassmorphic Arch Frame with Glowing Aura */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
              >
                {/* Volumetric Glowing Cyan Aura behind Portrait */}
                <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-[#00F5D4]/30 via-teal-500/15 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#00F5D4]/30 pointer-events-none animate-pulse" />

                {/* Floating Top Vision Badge */}
                <div className="absolute -top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#090D16]/95 border border-[#00F5D4]/45 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
                  <span className="text-xs font-black text-white">رؤية د. أحمد زغلول</span>
                </div>

                {/* Custom Architectural Arch Container with Dynamic Backdrop Blur */}
                <div className="relative z-10 overflow-hidden rounded-t-[140px] rounded-b-3xl p-1 bg-gradient-to-b from-[#00F5D4]/45 via-teal-500/20 to-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
                  <div className="relative rounded-t-[136px] rounded-b-[22px] overflow-hidden bg-gradient-to-b from-[#0e1628]/95 via-[#0a0f1d]/95 to-[#070b14] backdrop-blur-xl pt-8 px-4 pb-0">
                    {/* Background Radial Light Accent */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#00F5D4]/20 blur-2xl pointer-events-none" />

                    <img
                      src={DOCTOR_PORTRAIT_URL}
                      alt="د. أحمد زغلول — استشاري الجلدية والليزر وتجميل البشرة"
                      className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)] filter brightness-105 contrast-105"
                      loading="eager"
                    />

                    {/* Bottom Gradient Fade */}
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-transparent pointer-events-none z-20" />
                  </div>
                </div>

                {/* Floating Doctor Bio Capsule */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="absolute -bottom-5 inset-x-4 sm:inset-x-6 z-30 rounded-2xl bg-[#090D16]/95 border border-[#00F5D4]/35 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.75)] backdrop-blur-xl text-center"
                >
                  <div className="text-base font-black text-white">د. أحمد زغلول</div>
                  <div className="text-xs font-bold text-[#00F5D4] mt-0.5">
                    استشاري الأمراض الجلدية وتجميل البشرة والليزر
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    المشرف الطبي العام ومؤسس عيادات Androderma
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="mt-16 flex flex-col items-center justify-center text-slate-400">
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500 mb-2">
              SCROLL TO EXPLORE
            </span>
            <ChevronDown className="h-4 w-4 text-[#00F5D4] animate-bounce" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: "WHO WE ARE" — ASYMMETRIC SPATIAL SHOWCASE                     */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <span className="h-1.5 w-6 bg-[#00F5D4] rounded-full" />
              <span>هويتنا ورسالتنا الإنسانية</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              "لسنا فقط عيادة… نحن تجربة طبية متكاملة."
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
              تأسست عيادات Androderma لتقدم مفهوماً علاجياً وتجميلياً متفرداً يركز على سلامتك واستدامة نتائجك أولاً.
            </p>
          </div>

          {/* Spatial Interactive Grid with Cursor Spotlight Effect */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SpatialSpotlightCard
              num="01"
              tag="CLINICAL DIAGNOSIS"
              title="الدقة في الفحص"
              desc="تقييم سريري تفصيلي لطبقات الجلد وتحديد المسببات الجذرية قبل الشروع في أي جلسة أو إجراء تجميلي."
              icon={Microscope}
              index={0}
            />

            <SpatialSpotlightCard
              num="02"
              tag="SAFETY PROTOCOLS"
              title="الأمان الطبي أولاً"
              desc="أحدث أجهزة الليزر العالمية المعتمدة والمزودة بأنظمة تبريد ذكية لحماية البشرة من التصبغات والآثار الجانبية."
              icon={ShieldCheck}
              index={1}
            />

            <SpatialSpotlightCard
              num="03"
              tag="TAILORED PLANS"
              title="بروتوكول مخصص"
              desc="خطة علاجية تُفصل خصيصاً وفقاً لدرجة تحسس بشرتك ونمط حياتك وتطلعاتك الواقعية دون باقات تجارية عامة."
              icon={HeartHandshake}
              index={2}
            />

            <SpatialSpotlightCard
              num="04"
              tag="CONTINUOUS CARE"
              title="متابعة دورية مستمرة"
              desc="رعاية إكلينيكية لا تنتهي بانتهاء الجلسة، بل تشمل بروتوكولات المتابعة المنزلية لضمان استقرار وتطور النتائج."
              icon={Activity}
              index={3}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: AWWWARDS STACKING CARDS ("منظومة علاجية متكاملة")               */}
      {/* ========================================================================= */}
      <section className="gsap-stack-section relative min-h-screen flex flex-col justify-center items-center py-20 lg:py-28 border-t border-white/5 overflow-hidden bg-gradient-to-b from-[#070b14] via-[#080d19] to-[#070b14]">
        {/* Atmospheric Ambient Glow Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full bg-[#00F5D4]/5 blur-[160px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Header */}
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3 bg-[#00F5D4]/10 px-3.5 py-1.5 rounded-full border border-[#00F5D4]/20">
              <Layers className="h-4 w-4" />
              <span>ركائز التميز الطبي</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              منظومة علاجية متكاملة
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              أربعة أبعاد رئيسية تشكل تجربة المراجع داخل عيادات Androderma وتحدد جودة الرعاية وسلامة النتائج
            </p>
          </div>

          {/* Stacking Cards Stage */}
          <div className="relative w-full max-w-5xl mx-auto min-h-[380px] sm:min-h-[320px] md:min-h-[240px]">
            {stackPillars.map((pillar, idx) => (
              <StackedPillarCard
                key={pillar.num}
                num={pillar.num}
                badge={pillar.badge}
                title={pillar.title}
                desc={pillar.desc}
                icon={pillar.icon}
                tags={pillar.tags}
                quote={pillar.quote}
                index={idx}
                total={stackPillars.length}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: GLOWING LASER TIMELINE PATH ("رحلة التميز الطبي")             */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-[#070b14] via-[#09101d] to-[#070b14] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <Compass className="h-4 w-4" />
              <span>مراحل تجربة المراجع</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              رحلة التميز الطبي
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              كيف نضمن لك تجربة علاجية استثنائية من اللحظة الأولى وحتى استدامة النتائج
            </p>
          </div>

          <div className="gsap-journey-container relative">
            {/* Desktop SVG Connecting Glowing Laser Path */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-0">
              <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
                {/* Background Dim Guide Track */}
                <path
                  d="M 50 50 Q 275 10 500 50 T 950 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                {/* Glowing Animated Laser Line */}
                <path
                  ref={laserPathRef}
                  d="M 50 50 Q 275 10 500 50 T 950 50"
                  fill="none"
                  stroke="#00F5D4"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_12px_#00F5D4]"
                />
              </svg>
            </div>

            {/* 4 Sequential Milestones Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {/* Step 1: الرؤية والتشخيص */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-[#0c1424]/90 border border-cyan-500/25 hover:border-[#00F5D4]/60 backdrop-blur-xl shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00F5D4] bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/25">
                    STAGE 01
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/35 grid place-items-center text-[#00F5D4] font-mono font-black text-sm">
                    01
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                  الرؤية والتشخيص
                </h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  فحص سريري متكامل للبشرة وتحديد الاحتياجات الفعلية بكل دقة وشفافية دون افتراضات سريعة.
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-[#00F5D4]">
                  استشارة تخصصية معمقة
                </div>
              </div>

              {/* Step 2: الدقة في التخطيط */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-[#0c1424]/90 border border-cyan-500/25 hover:border-[#00F5D4]/60 backdrop-blur-xl shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/25">
                    STAGE 02
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/35 grid place-items-center text-cyan-400 font-mono font-black text-sm">
                    02
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mt-6 group-hover:text-cyan-300 transition-colors">
                  الدقة في التخطيط
                </h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  صياغة خطة علاجية مخصصة تجمع بين أحدث التقنيات وعدد الجلسات الفعلي لتحقيق الهدف المطلوب.
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-cyan-400">
                  خطة علاجية مخصصة
                </div>
              </div>

              {/* Step 3: التكنولوجيا والأمان */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-[#0c1424]/90 border border-cyan-500/25 hover:border-[#00F5D4]/60 backdrop-blur-xl shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">
                    STAGE 03
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/35 grid place-items-center text-emerald-400 font-mono font-black text-sm">
                    03
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mt-6 group-hover:text-emerald-300 transition-colors">
                  التكنولوجيا والأمان
                </h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  تنفيذ الجلسات بأحدث أجهزة الليزر المزودة بالتبريد المتطور وتحت إشراف طبي صارم لراحتك.
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-emerald-400">
                  تنفيذ دقيق بأعلى تبريد
                </div>
              </div>

              {/* Step 4: التجربة والنتائج */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-[#0c1424]/90 border border-cyan-500/25 hover:border-[#00F5D4]/60 backdrop-blur-xl shadow-xl transition-all group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#00F5D4] bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/25">
                    STAGE 04
                  </span>
                  <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/35 grid place-items-center text-[#00F5D4] font-mono font-black text-sm">
                    04
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                  التجربة والنتائج
                </h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  متابعة مستمرة وإرشادات وقائية لضمان استقرار وتطور النتائج الجمالية والصحية على المدى الطويل.
                </p>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-bold text-[#00F5D4]">
                  استدامة وتألق طويل المدى
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: INTERACTIVE TREATMENT PILLARS SWITCHER                        */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 border-t border-white/5">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <Microscope className="h-4 w-4" />
              <span>مجالات التخصص الإكلينيكي</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              المنظومة العلاجية التخصصية
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              تخصصات طبية دقيقة تلبي كافة احتياجات بشرتك وشعرك بأعلى معايير الأمان
            </p>
          </div>

          {/* Interactive Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-12">
            <button
              onClick={() => setActivePillar('skin')}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activePillar === 'skin'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Microscope className="h-4 w-4" />
              <span>صحة ونضارة البشرة</span>
            </button>

            <button
              onClick={() => setActivePillar('laser')}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activePillar === 'laser'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>الليزر والتجميل الطبي</span>
            </button>

            <button
              onClick={() => setActivePillar('hair')}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activePillar === 'hair'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>علاجات الشعر وفروة الرأس</span>
            </button>
          </div>

          {/* Active Pillar Card Display */}
          <div className="max-w-4xl mx-auto">
            {Object.values(pillarData).map((pillar) => {
              if (pillar.id !== activePillar) return null;
              const Icon = pillar.icon;

              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#0e1628]/95 via-[#0a101d]/95 to-transparent border border-cyan-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 grid place-items-center text-[#00F5D4] shadow-[0_0_25px_rgba(0,245,212,0.3)]">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/25">
                          {pillar.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                          {pillar.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
                    {pillar.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                    {pillar.points.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5"
                      >
                        <CheckCircle2 className="h-5 w-5 text-[#00F5D4] shrink-0 mt-0.5" />
                        <span className="text-sm font-bold text-slate-200 leading-snug">
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => onOpenBooking(pillar.title)}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#00F5D4] text-slate-950 text-xs font-black hover:bg-[#20ffd9] shadow-[0_0_20px_rgba(0,245,212,0.3)] transition-all cursor-pointer"
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span>حجز استشارة لهذا التخصص</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: WHY ANDRODERMA? — CONTINUOUS BORDER-BEAM CARDS                 */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-[#070b14] via-[#09101e] to-[#070b14] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <ShieldCheck className="h-4 w-4" />
              <span>معايير الثقة والضمان الطبي</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              لماذا يختلف اختيار Androderma؟
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              خمسة مبادئ إكلينيكية تجعل تجربتك معنا الأكثر أماناً وموثوقية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BorderBeamCard
              num="01"
              title="إشراف طبي مباشر ومتخصص"
              desc="كل فحص وخطة علاجية تتم بإشراف د. أحمد زغلول وفريق طبي مدرب على أحدث البروتوكولات الجلدية."
              icon={Stethoscope}
              tags={['استشاري متخصص', 'إشراف مباشر', 'فريق مدرب']}
            />

            <BorderBeamCard
              num="02"
              title="أجهزة ليزر معتمدة بأنظمة تبريد"
              desc="نعتمد فقط على المنظومات الطبية المعتمدة دولياً، المزودة بأنظمة تبريد ذكية لحماية البشرة وضمان راحة تامة."
              icon={Zap}
              tags={['أجهزة أصلية', 'تبريد متطور', 'راحة تامة']}
            />

            <BorderBeamCard
              num="03"
              title="خطط علاجية مخصصة لكل بشرة"
              desc="لا نؤمن بالقوالب الجاهزة. خطتك تصمم بناءً على تحليل عميق لنوع بشرتك ونمط حياتك وتاريخك الطبي."
              icon={HeartHandshake}
              tags={['تشخيص فردي', 'بدون قوالب', 'واقعية النتائج']}
            />

            <BorderBeamCard
              num="04"
              title="أعلى بروتوكولات التعقيم والسلامة"
              desc="تطبيق صارم لمعايير مكافحة العدوى والتعقيم الطبي الفوري واستخدام مستهلكات أحادية الاستخدام معتمدة."
              icon={Shield}
              tags={['تعقيم دوري', 'أمان مكافحة العدوى', 'مستهلكات معتمدة']}
            />

            <BorderBeamCard
              num="05"
              title="متابعة مستمرة واستشارات دورية"
              desc="علاقتنا بك مستمرة بعد الجلسات، مع تقييم دوري للنتائج وتحديث روتين العناية المنزلي وفق تطور البشرة."
              icon={Clock}
              tags={['متابعة دورية', 'روتين منزلي', 'دعم مستمر']}
            />

            {/* Special 6th Card: Direct Quick Booking Trigger */}
            <div className="relative rounded-3xl p-8 sm:p-9 bg-gradient-to-br from-[#00F5D4]/15 via-teal-900/20 to-[#0c1424] border border-[#00F5D4]/40 flex flex-col justify-between backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,245,212,0.15)] group hover:border-[#00F5D4] transition-all">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#00F5D4] text-slate-950 grid place-items-center shadow-[0_0_25px_rgba(0,245,212,0.5)]">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-black text-white mt-6">
                  جاهز لتجربة طبية متكاملة؟
                </h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                  احجز موعد كشفك التخصصي الآن في أقرب فرع إليك، ودعنا نصمم لك خطة العلاج الأنسب لبشرتك.
                </p>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full rounded-2xl bg-[#00F5D4] py-3.5 text-center text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(0,245,212,0.4)] hover:bg-[#20ffd9] transition-all cursor-pointer"
                >
                  احجز موعدك الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: CINEMATIC FULL-BLEED QUOTE TRANSITION                         */}
      {/* ========================================================================= */}
      <section className="gsap-quote-section relative py-28 sm:py-36 bg-[#060911] overflow-hidden border-t border-white/5">
        {/* Giant Ambient Background Quotation Marks */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-5 text-[#00F5D4] font-serif text-[350px] leading-none">
          “
        </div>

        {/* Ethereal Floating Cyan Smoke Particles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#00F5D4]/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="gsap-cinematic-quote space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-4 py-1.5 rounded-full border border-[#00F5D4]/25">
              <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
              <span>الميثاق الإكلينيكي</span>
            </div>

            <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight sm:leading-snug max-w-4xl mx-auto">
              "التجميل الحقيقي يبدأ من{' '}
              <span className="bg-gradient-to-l from-[#00F5D4] via-teal-200 to-white bg-clip-text text-transparent">
                القرار الطبي الصحيح
              </span>
              ، وليس من كثرة الإجراءات."
            </blockquote>

            <div className="pt-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-[#00F5D4] to-teal-400 mb-3 shadow-[0_0_20px_rgba(0,245,212,0.4)]">
                <img
                  src={DOCTOR_PORTRAIT_URL}
                  alt="د. أحمد زغلول"
                  className="w-full h-full object-cover object-top rounded-full bg-slate-900"
                />
              </div>
              <div className="text-base font-black text-white">د. أحمد زغلول</div>
              <div className="text-xs text-[#00F5D4] font-bold mt-0.5">
                استشاري الأمراض الجلدية والليزر وتجميل البشرة
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: DYNAMIC CTA BANNER WITH LIVE SUPABASE BRANCH RESOLUTION       */}
      {/* ========================================================================= */}
      <section className="relative py-20 sm:py-28 bg-[#070b14] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 overflow-hidden bg-gradient-to-br from-[#0e1628]/95 via-[#0a101d]/95 to-[#070b14] border border-[#00F5D4]/40 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center">
            {/* Pulsating Cyan Aura */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 rounded-full bg-[#00F5D4]/20 blur-[120px] pointer-events-none animate-pulse" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-4 py-1.5 rounded-full border border-[#00F5D4]/25">
                <CalendarDays className="h-3.5 w-3.5 text-[#00F5D4]" />
                <span>حجز موعد فحص استشاري</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                ابدأ رحلة العناية ببشرتك مع{' '}
                <span className="bg-gradient-to-l from-[#00F5D4] via-teal-200 to-white bg-clip-text text-transparent">
                  د. أحمد زغلول
                </span>
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                نستقبلكم في فروعنا المجهزة بأحدث التقنيات الطبية:
                <br />
                <span className="font-bold text-[#00F5D4] mt-1 inline-block">
                  📍 {dynamicBranchString}
                </span>
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <MagneticButton
                  onClick={() => onOpenBooking()}
                  className="rounded-full bg-[#00F5D4] px-9 py-4 text-base font-black text-slate-950 shadow-[0_0_30px_rgba(0,245,212,0.45)] hover:shadow-[0_0_45px_rgba(0,245,212,0.7)] hover:bg-[#20ffd9] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>احجز استشارتك الآن</span>
                  </span>
                </MagneticButton>

                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5D4]/40 backdrop-blur-xl transition-all"
                  >
                    <PhoneCall className="h-4 w-4 text-[#00F5D4]" />
                    <span>اتصال مباشر: {clinic.phone}</span>
                  </a>
                )}

                {clinic.whatsapp && (
                  <a
                    href={`https://wa.me/${clinic.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-200 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-400 backdrop-blur-xl transition-all text-emerald-300"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span>واتساب العيادة</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
