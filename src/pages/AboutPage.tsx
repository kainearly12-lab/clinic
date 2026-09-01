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
  UserCheck,
  Compass,
  PhoneCall,
  MessageCircle,
  MapPin,
  Check,
  Sliders,
  Shield,
  Clock,
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
 * 3D Medical Laser Core / Skin Cell Mesh Canvas
 * Built with Three.js WebGL: organic dodecahedron wireframe mesh + floating cyan particle field + volumetric glow
 * Responds to mouse move and scroll depth, auto-pauses when off-screen, falls back to lightweight SVG/CSS on mobile
 */
function MedicalCore3DCanvas({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL availability using a detached test canvas (avoids tainting the real canvas context)
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
      opacity: 0.22,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerMesh);

    // Inner Medical Nucleus Mesh
    const innerGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Cellular Floating Particle Cloud (Cyan + Teal)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Gradient from #00F5D4 (0, 0.96, 0.83) to #38BDF8 (0.22, 0.74, 0.97)
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
      opacity: 0.75,
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
      targetRotY = (e.clientX / innerWidth - 0.5) * 0.8;
      targetRotX = (e.clientY / innerHeight - 0.5) * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Scroll depth interaction
    let scrollOffset = 0;
    const handleScroll = () => {
      scrollOffset = window.scrollY * 0.001;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with visibility optimization
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

      // Smooth rotation interpolation
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      if (!prefersReducedMotion) {
        outerMesh.rotation.y = elapsed * 0.18 + currentRotY + scrollOffset;
        outerMesh.rotation.x = elapsed * 0.12 + currentRotX;

        innerMesh.rotation.y = -elapsed * 0.25 - currentRotY;
        innerMesh.rotation.z = elapsed * 0.15 + scrollOffset;

        particles.rotation.y = elapsed * 0.06 + currentRotY * 0.5;
        particles.rotation.x = -elapsed * 0.04 + currentRotX * 0.5;

        // Subtle breathing scale
        const scale = 1 + Math.sin(elapsed * 1.5) * 0.035;
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
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
}

/**
 * Interactive 3D Tilt Card with Glowing Border Beam for Trust Principles
 */
function TrustPrincipleCard({
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    setMousePos({ x: mouseX, y: mouseY });
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
      className="relative rounded-3xl p-px overflow-hidden group transition-shadow duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_rgba(0,245,212,0.18)]"
    >
      {/* Moving Border Beam Background Effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 245, 212, 0.45), rgba(14, 165, 233, 0.15), transparent 70%)`,
        }}
      />

      {/* Default Border Line */}
      <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-[#00F5D4]/40 transition-colors pointer-events-none" />

      {/* Card Body */}
      <div className="relative z-10 h-full rounded-[23px] bg-[#0c1322]/90 backdrop-blur-xl p-7 sm:p-9 flex flex-col justify-between">
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#00F5D4]/20 to-teal-500/5 border border-[#00F5D4]/30 grid place-items-center text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,245,212,0.4)] transition-all duration-300">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/20">
                مبدأ {num}
              </span>
            </div>

            <div className="text-3xl font-black font-mono text-slate-700 group-hover:text-[#00F5D4] transition-colors">
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
 * Main Standalone AboutPage Component
 */
export function AboutPage({ onOpenBooking, onNavigateHome }: AboutPageProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [activePillar, setActivePillar] = useState<'skin' | 'laser' | 'hair'>('skin');
  const mainRef = useRef<HTMLDivElement>(null);

  // Dynamic Branches from Supabase schedule service (live-updates if branches change)
  const { branches: activeBranchesList } = useWeeklySchedule();

  // Compute clean display list of active branches
  const dynamicBranchNames = useMemo(() => {
    if (activeBranchesList && activeBranchesList.length > 0) {
      return activeBranchesList.map((b) => b.nameAr);
    }
    return fallbackBranches.map((b) => b.nameAr);
  }, [activeBranchesList]);

  const dynamicBranchString = useMemo(() => {
    return dynamicBranchNames.join(' • ');
  }, [dynamicBranchNames]);

  // Set Page Title and Meta Tags for SEO
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

  // GSAP Entrance Animations
  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Reveal titles with class `.gsap-reveal`
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
      });

      // Bento cards staggered entrance
      gsap.from('.gsap-bento-card', {
        scrollTrigger: {
          trigger: '.gsap-bento-container',
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      });

      // Journey Steps staggered reveal
      gsap.from('.gsap-journey-step', {
        scrollTrigger: {
          trigger: '.gsap-journey-container',
          start: 'top 85%',
        },
        y: 35,
        opacity: 0,
        stagger: 0.18,
        duration: 0.85,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });

      // Editorial Quote Animation
      gsap.from('.gsap-quote-content', {
        scrollTrigger: {
          trigger: '.gsap-quote-container',
          start: 'top 80%',
        },
        scale: 0.95,
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, mainRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Pillar Content Definition
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
        className="fixed inset-0 pointer-events-none opacity-[0.035] z-50 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 right-1/4 h-[550px] w-[550px] rounded-full bg-[#00F5D4]/10 blur-[150px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -left-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[170px] z-0" />
      <div className="pointer-events-none fixed bottom-20 right-10 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[150px] z-0" />

      {/* ========================================================================= */}
      {/* SECTION 1: RADICAL ASYMMETRICAL MAGAZINE HERO                            */}
      {/* ========================================================================= */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* 3D Medical Core Canvas Background */}
        <MedicalCore3DCanvas prefersReducedMotion={prefersReducedMotion} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Editorial Manifesto & Storytelling Hierarchy */}
            <div className="lg:col-span-7 flex flex-col items-start text-right">
              {/* Editorial Meta Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-3 rounded-full px-4 py-1.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,245,212,0.15)] mb-6"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#00F5D4] animate-pulse" />
                <span className="text-xs font-black tracking-widest text-[#00F5D4] uppercase font-mono">
                  رؤية وفلسفة العيادة • CLINICAL MANIFESTO
                </span>
              </motion.div>

              {/* Main Headline: Editorial Emphasis on Clinical Precision */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.3] sm:leading-[1.2] text-white tracking-tight">
                <span className="block text-slate-200">بشرتك تستحق</span>
                <span className="block mt-2 bg-gradient-to-l from-[#00F5D4] via-teal-200 to-white bg-clip-text text-transparent">
                  تجربة طبية مبنية على الدقة
                </span>
                <span className="block mt-1 text-slate-100">والتجميل الآمن.</span>
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
                  className="rounded-full bg-[#00F5D4] px-8 py-4 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.35)] hover:shadow-[0_0_35px_rgba(0,245,212,0.55)] hover:bg-[#20ffd9] transition-all"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>احجز استشارتك التخصصية</span>
                  </span>
                </MagneticButton>

                {onNavigateHome && (
                  <button
                    onClick={() => onNavigateHome('services')}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F5D4]/40 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <span>استكشف المنظومة العلاجية</span>
                    <ArrowLeft className="h-4 w-4 text-[#00F5D4]" />
                  </button>
                )}
              </motion.div>

              {/* Clinical Trust Badges Row */}
              <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 w-full text-right">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 grid place-items-center text-[#00F5D4] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">معايير طبية صارمة</div>
                    <div className="text-[11px] text-slate-400">سلامة المرضى أولوية مطلقة</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 grid place-items-center text-[#00F5D4] shrink-0">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">تشخيص سريري مخصص</div>
                    <div className="text-[11px] text-slate-400">بناءً على طبقات كل بشرة</div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 grid place-items-center text-[#00F5D4] shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">أحدث أجهزة الليزر</div>
                    <div className="text-[11px] text-slate-400">أنظمة تبريد وحماية للبشرة</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Asymmetrical Arch Frame for Dr. Ahmed Zaghloul */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md"
              >
                {/* Layered Architectural Glow Halo */}
                <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-[#00F5D4]/25 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#00F5D4]/25 pointer-events-none animate-pulse" />

                {/* Floating Top Vision Badge */}
                <div className="absolute -top-4 right-4 z-30 inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#090D16]/95 border border-[#00F5D4]/40 shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#00F5D4]" />
                  <span className="text-xs font-black text-white">رؤية د. أحمد زغلول</span>
                </div>

                {/* Custom Architectural Arch Container */}
                <div className="relative z-10 overflow-hidden rounded-t-[140px] rounded-b-3xl p-1 bg-gradient-to-b from-[#00F5D4]/40 via-teal-500/20 to-white/5 shadow-[0_25px_60px_rgba(0,0,0,0.8)]">
                  <div className="relative rounded-t-[136px] rounded-b-[22px] overflow-hidden bg-gradient-to-b from-[#0e1628] via-[#0a0f1d] to-[#070b14] pt-8 px-4 pb-0">
                    {/* Background Radial Light Accent */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#00F5D4]/15 blur-2xl pointer-events-none" />

                    <img
                      src={DOCTOR_PORTRAIT_URL}
                      alt="د. أحمد زغلول — استشاري الجلدية والليزر وتجميل البشرة"
                      className="relative z-10 w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)] filter brightness-105 contrast-105"
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
                  className="absolute -bottom-5 inset-x-4 sm:inset-x-6 z-30 rounded-2xl bg-[#090D16]/95 border border-[#00F5D4]/30 p-4 shadow-[0_15px_35px_rgba(0,0,0,0.7)] backdrop-blur-xl text-center"
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
      {/* SECTION 2: "WHO WE ARE" — HUMAN IDENTITY SECTION                         */}
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
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-slate-300 leading-relaxed text-base sm:text-lg">
              <p className="gsap-reveal">
                تأسست عيادات <span className="text-white font-bold">Androderma</span> برؤية طبية واضحة: إرساء معايير جديدة
                في طب الجلدية والتجميل والليزر تجمع بين الدقة العلمية الصارمة وأرقى مستويات الرعاية الإنسانية. نرفض الحلول
                التجارية السريعة والوعود غير الواقعية، ونلتزم بتقديم تقييم صادق لكل مراجع.
              </p>
              <p className="gsap-reveal">
                في كل فرع من فروعنا عبر القاهرة والجيزة، يجد المراجع بيئة علاجية راقية تحترم خصوصيته وتمنحه الوقت الكافي
                لفهم حالته وخياراته العلاجية بكل شفافية، مع تطبيق أعلى بروتوكولات التعقيم والسلامة بإشراف طبي مباشر.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-3xl font-black text-[#00F5D4] font-mono">01</div>
                <div className="mt-2 text-sm font-bold text-white">الدقة في الفحص</div>
                <div className="mt-1 text-xs text-slate-400">تقييم سريري دقيق قبل بدء أي إجراء</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-3xl font-black text-[#00F5D4] font-mono">02</div>
                <div className="mt-2 text-sm font-bold text-white">الأمان أولاً</div>
                <div className="mt-1 text-xs text-slate-400">أحدث أجهزة الليزر المعتمدة والمزودة بالتبريد</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-3xl font-black text-[#00F5D4] font-mono">03</div>
                <div className="mt-2 text-sm font-bold text-white">علاج مخصص</div>
                <div className="mt-1 text-xs text-slate-400">بروتوكول تفصيلي يراعي طبيعة ونمط حياتك</div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00F5D4]/40 transition-colors">
                <div className="text-3xl font-black text-[#00F5D4] font-mono">04</div>
                <div className="mt-2 text-sm font-bold text-white">متابعة مستمرة</div>
                <div className="mt-1 text-xs text-slate-400">رعاية دورية لضمان استقرار وتطور النتائج</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: EDITORIAL QUOTE & DR. AHMED ZAGHLOUL STORY                    */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-[#070b14] via-[#0c1220] to-[#070b14] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.07] via-white/[0.02] to-transparent border border-white/15 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
            {/* Ambient Lighting Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#00F5D4]/15 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />

            <div className="grid gap-10 lg:grid-cols-12 items-center">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase">
                  <Sparkles className="h-4 w-4" />
                  <span>فلسفة الطبيب المؤسس</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                  د. أحمد زغلول
                </h3>
                <p className="text-sm font-bold text-[#00F5D4]">
                  استشاري الأمراض الجلدية والليزر وتجميل البشرة
                </p>

                {/* Glowing Attributed Quote */}
                <blockquote className="relative p-6 sm:p-8 rounded-2xl bg-black/50 border-r-4 border-[#00F5D4] text-slate-100 text-base sm:text-xl font-medium leading-relaxed italic shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  "التجميل الحقيقي ليس قالباً مكرراً يُفرض على الجميع، بل هو فن إبراز الملامح الطبيعية وإعادة الحيوية
                  للبشرة بأسس طبية دقيقة تحافظ على سلامة الإنسان قبل كل شيء."
                </blockquote>

                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                  يحرص د. أحمد زغلول على إشرافه المباشر على البروتوكولات العلاجية المتبعة في العيادة، مع التركيز المستمر
                  على تدريب وتطوير الكادر الطبي والتمريضي، ومواكبة أحدث المستجدات العلمية في طب التجميل والجلدية عالمياً.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                <div className="h-20 w-20 rounded-full bg-[#00F5D4]/15 border border-[#00F5D4]/40 grid place-items-center text-[#00F5D4] mb-4 shadow-[0_0_30px_rgba(0,245,212,0.25)]">
                  <UserCheck className="h-10 w-10" />
                </div>
                <div className="text-base font-black text-white">الاهتمام بالإنسان أولاً</div>
                <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                  نستمع لتطلعاتك ومخاوفك، ونقدم لك التقييم الطبي الصحيح بكل أمانة وشفافية
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: SPATIAL BENTO STORYTELLING GRID (100% COMPLETE & VISIBLE)      */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 border-t border-white/5">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <Layers className="h-4 w-4" />
              <span>ركائز التميز الطبي</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              منظومة علاجية متكاملة
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              أربعة أبعاد رئيسية تشكل تجربة المراجع داخل عيادات Androderma
            </p>
          </div>

          <div className="gsap-bento-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Card 1: الفلسفة الطبية المبنية على الدليل (Large - 7 cols) */}
            <div className="gsap-bento-card lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 grid place-items-center text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.2)]">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-[#00F5D4] uppercase tracking-widest bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/20">
                    PILLAR 01
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-6">الفلسفة الطبية المبنية على الدليل</h3>
                <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                  نعتمد على الطب القائم على الدليل (Evidence-Based Dermatology). كل تقنية نستخدمها وكل خطة علاجية
                  نصيغها تستند إلى دراسات علمية معتمدة ونتائج إكلينيكية موثقة، لضمان أعلى نسب الأمان وتفادي أي إجراءات
                  زائدة لا تحتاجها حالتك.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                  <span>دقة التشخيص السريري</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                  <span>أمان الإجراءات المعتمدة</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00F5D4] shrink-0" />
                  <span>نتائج واقعية مستدامة</span>
                </div>
              </div>
            </div>

            {/* Card 2: التطور التكنولوجي وأنظمة الليزر الذكية (5 cols) */}
            <div className="gsap-bento-card lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 grid place-items-center text-cyan-400 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                    PILLAR 02
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-6">التطور التكنولوجي وأنظمة الليزر</h3>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  نستثمر باستمرار في أحدث أجهزة الليزر الطبية المعتمدة من الهيئات الرقابية الدولية، والمزودة بأنظمة
                  تبريد متطورة تحمي سطح الجلد وتمنحك أقصى درجات الراحة أثناء الجلسات.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300">
                  تبريد فائق للجلد
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300">
                  أطوال موجية مخصصة
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-teal-300">
                  معايير أمان عالمية
                </span>
              </div>
            </div>

            {/* Card 3: التجربة المخصصة (5 cols) */}
            <div className="gsap-bento-card lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    PILLAR 03
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-6">التجربة المخصصة لكل مراجع</h3>
                <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                  لكل شخص طبيعة بشرة فريدة ونمط حياة مختلف. لذلك، نصمم لك برنامج علاج متكامل يشمل الجلسات العيادية
                  والروتين المنزلي المتوافق تماماً مع أهدافك.
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 italic">
                "خطة علاجية تُفصل خصيصاً لك، وليست باقات عامة ثابتة."
              </div>
            </div>

            {/* Card 4: معايير الجودة والنتائج (Large - 7 cols) */}
            <div className="gsap-bento-card lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/15 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 grid place-items-center text-[#00F5D4] shadow-[0_0_20px_rgba(0,245,212,0.2)]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-mono text-[#00F5D4] uppercase tracking-widest bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/20">
                    PILLAR 04
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mt-6">الثقة وجودة الرعاية الإكلينيكية</h3>
                <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
                  نحرص على المتابعة الدورية بعد كل جلسة، وتقييم استجابة البشرة وتحديث الخطة العلاجية لضمان وصولك إلى
                  أفضل نتيجة مستدامة ممكنة مع الحفاظ التام على خصوصيتك وأمانك.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="text-sm font-bold text-[#00F5D4]">دقة الفحص</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">تشخيص سريري</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="text-sm font-bold text-[#00F5D4]">تعقيم فائق</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">بروتوكول صارم</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="text-sm font-bold text-[#00F5D4]">متابعة لصيقة</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">بعد كل جلسة</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                  <div className="text-sm font-bold text-[#00F5D4]">أمان مطلق</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">أحدث التقنيات</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CLINIC JOURNEY WITH GLOWING CONNECTING LINE & STEP NODES       */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-[#070b14] via-[#0b101c] to-[#070b14] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <Compass className="h-4 w-4" />
              <span>مسار التطور والالتزام</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              رحلة التميز الطبي
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              أربع محطات متسلسلة ترسم مسار الرعاية العلاجية والتجميلية في Androderma
            </p>
          </div>

          <div className="gsap-journey-container relative">
            {/* Desktop Connecting Glowing Line */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-gradient-to-r from-[#00F5D4]/20 via-[#00F5D4] to-[#00F5D4]/20 -translate-y-12 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[#00F5D4] blur-[3px] opacity-60 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 1: الرؤية */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30 grid place-items-center text-[#00F5D4] font-mono font-black text-xl shadow-[0_0_20px_rgba(0,245,212,0.25)] group-hover:scale-110 transition-transform">
                      01
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-3 py-1 rounded-full border border-[#00F5D4]/20">
                      VISION
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                    الرؤية والهدف
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    تأسيس نموذج طبي رائد يغير المفهوم التقليدي للتجميل التجاري نحو رعاية جلدية مبنية على الأمان الطبي
                    والتشخيص الواقعي.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-[#00F5D4] font-bold">
                  تأسيس المعايير السريرية
                </div>
              </div>

              {/* Step 2: الدقة */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 grid place-items-center text-cyan-400 font-mono font-black text-xl shadow-[0_0_20px_rgba(14,165,233,0.25)] group-hover:scale-110 transition-transform">
                      02
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      PRECISION
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                    الدقة والتشخيص
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    بناء بروتوكولات فحص تفصيلية تتيح الكشف الدقيق عن المشكلات الجلدية وتحديد مرحلة العلاج بدقة
                    متناهية دون تخمين.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-cyan-400 font-bold">
                  خطط علاج موثقة
                </div>
              </div>

              {/* Step 3: التقنية */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 grid place-items-center text-teal-300 font-mono font-black text-xl shadow-[0_0_20px_rgba(20,184,166,0.25)] group-hover:scale-110 transition-transform">
                      03
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-300 tracking-widest uppercase bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                      TECHNOLOGY
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                    أحدث التقنيات
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    تجهيز فروع العيادة بأحدث منظومات الليزر المعتمدة دولياً وتوفير أفضل وسائل التبريد لحماية سطح البشرة.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-teal-300 font-bold">
                  أجهزة طبية معتمدة
                </div>
              </div>

              {/* Step 4: التجربة */}
              <div className="gsap-journey-step relative p-8 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-[#00F5D4]/50 transition-all flex flex-col justify-between backdrop-blur-xl shadow-xl group">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-emerald-400 font-mono font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:scale-110 transition-transform">
                      04
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      EXPERIENCE
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mt-6 group-hover:text-[#00F5D4] transition-colors">
                    التجربة المتكاملة
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
                    توفير تجربة مراجع استثنائية تشمل الاستقبال الراقي، الخصوصية التامة، والمتابعة الدورية المستمرة.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-emerald-400 font-bold">
                  رضا وثقة مستدامة
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: DERMATOLOGY / LASER / HAIR EXPERIENCE (TREATMENT PILLARS)     */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 border-t border-white/5">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <Sparkles className="h-4 w-4" />
              <span>المحاور العلاجية الرئيسية</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              مجالات تخصصنا الطبي
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              فلسفة علاجية متخصصة لكل مجال من مجالات العناية بالجلد والشعر والليزر
            </p>
          </div>

          {/* Pillar Selector Tabs */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            <button
              onClick={() => setActivePillar('skin')}
              className={`px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePillar === 'skin'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              البشرة والجلدية
            </button>
            <button
              onClick={() => setActivePillar('laser')}
              className={`px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePillar === 'laser'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              علاجات الليزر المتقدمة
            </button>
            <button
              onClick={() => setActivePillar('hair')}
              className={`px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activePillar === 'hair'
                  ? 'bg-[#00F5D4] text-slate-950 shadow-[0_0_25px_rgba(0,245,212,0.4)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              علاجات الشعر والفروة
            </button>
          </div>

          {/* Active Pillar Card Display */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={activePillar}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`p-8 sm:p-12 rounded-3xl bg-gradient-to-br ${pillarData[activePillar].accent} bg-[#0c1322] border border-white/15 backdrop-blur-2xl shadow-2xl`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase">
                    {pillarData[activePillar].badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {pillarData[activePillar].title}
                  </h3>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-[#00F5D4] shrink-0">
                  {React.createElement(pillarData[activePillar].icon, { className: 'h-7 w-7' })}
                </div>
              </div>

              <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-8">
                {pillarData[activePillar].desc}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-white/10">
                {pillarData[activePillar].points.map((pt, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="h-5 w-5 text-[#00F5D4] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: TRUST ARCHITECTURE — "لماذا يختلف اختيار Androderma؟"         */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 border-t border-white/5 bg-gradient-to-b from-[#070b14] via-[#090e1a] to-[#070b14]">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="gsap-reveal text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase mb-3">
              <ShieldCheck className="h-4 w-4" />
              <span>معايير الثقة والالتزام</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              لماذا يختلف اختيار Androderma؟
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              خمسة مبادئ جوهرية تحكم كل استشارة وجلسة علاجية داخل فروعنا
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TrustPrincipleCard
              num="01"
              title="يبدأ العلاج بفهم الحالة وليس ببيع الجلسات"
              desc="نمنحك استشارة وافية لفحص طبقات الجلد ومناقشة التاريخ الطبي والتطلعات العلاجية قبل اتخاذ أي قرار أو بدء أي إجراء."
              icon={Stethoscope}
              tags={['فحص سريري متأنٍ', 'لا عروض عشوائية', 'تشخيص موثق']}
            />

            <TrustPrincipleCard
              num="02"
              title="كل بشرة تحتاج خطة علاج مخصصة ومستقلة"
              desc="لا توجد وصفة موحدة تناسب الجميع؛ لذلك نصمم برنامجاً دقيقاً يتناسب مع نوع بشرتك ولونها ودرجة تحسسها وأسلوب حياتك."
              icon={Sliders}
              tags={['تخصيص كامل', 'مراعاة نمط الحياة', 'تدرج علاجي آمن']}
            />

            <TrustPrincipleCard
              num="03"
              title="التكنولوجيا تخدم القرار الطبي ولا تقوده"
              desc="الأجهزة المتقدمة أداة في يد الطبيب المتخصص وليست بديلاً عن الفحص السريري، ونختار الطول الموجي المناسب لكل حالة بعناية."
              icon={Zap}
              tags={['أطوال موجية مخصصة', 'إشراف استشاري', 'تبريد ذكي']}
            />

            <TrustPrincipleCard
              num="04"
              title="السلامة والأمان تأتي دائماً قبل النتيجة التجميلية"
              desc="نلتزم بأعلى معايير الحماية والتبريد والتعقيم لضمان عدم حدوث أي مضاعفات أو حروق أو تصبغات عكسية لاحقة."
              icon={Shield}
              tags={['تبريد هوائي فائق', 'تعقيم معتمد', 'صفر مجازفة']}
            />

            <TrustPrincipleCard
              num="05"
              title="المتابعة الدورية جزء لا يتجزأ من نجاح العلاج"
              desc="نبقى على تواصل مستمر معك بعد كل جلسة لمتابعة استجابة الأنسجة وتطور النتيجة والإجابة عن كل استفساراتك بكل اهتمام."
              icon={Clock}
              tags={['متابعة بعد الجلسة', 'تقييم مستمر', 'دعم طبي دائم']}
            />

            {/* Extra Highlighting Card: Clinical Excellence */}
            <div className="relative rounded-3xl p-8 bg-gradient-to-br from-[#00F5D4]/15 via-teal-900/20 to-transparent border border-[#00F5D4]/30 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,245,212,0.15)]">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#00F5D4]/20 border border-[#00F5D4]/40 grid place-items-center text-[#00F5D4] mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-white">التزامنا تجاه كل مراجع</h3>
                <p className="mt-3 text-slate-200 text-sm leading-relaxed">
                  أن تكون تجربتك في Androderma هي المعيار الأكثر راحة وأماناً وشفافية في العناية ببشرتك وصحتها.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#00F5D4]/20">
                <button
                  onClick={() => onOpenBooking()}
                  className="w-full rounded-xl bg-[#00F5D4] py-3 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(0,245,212,0.35)] hover:bg-[#20ffd9] transition-all cursor-pointer"
                >
                  احجز استشارتك الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: FULL-BLEED EDITORIAL CINEMATIC QUOTE EXPERIENCE              */}
      {/* ========================================================================= */}
      <section className="gsap-quote-container relative py-32 sm:py-44 bg-gradient-to-b from-[#070b14] via-[#091122] to-[#070b14] border-y border-[#00F5D4]/20 overflow-hidden text-center">
        {/* Giant Glowing Ambient Quotation Marks */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 font-serif text-[180px] sm:text-[280px] leading-none text-[#00F5D4]/5 pointer-events-none select-none">
          “
        </div>
        <div className="absolute top-1/2 right-10 -translate-y-1/2 font-serif text-[180px] sm:text-[280px] leading-none text-[#00F5D4]/5 pointer-events-none select-none">
          ”
        </div>

        {/* Floating Background Particle Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#00F5D4]/15 via-teal-500/10 to-transparent blur-[140px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 gsap-quote-content">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#00F5D4]/10 border border-[#00F5D4]/30 backdrop-blur-md mb-8">
            <Sparkles className="h-4 w-4 text-[#00F5D4]" />
            <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase">
              PHILOSOPHY OF REAL BEAUTY
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            "التجميل الحقيقي يبدأ من القرار الطبي الصحيح."
          </h2>

          <p className="mt-8 text-slate-200 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            نحن هنا لنرافقك في رحلة عناية متكاملة تمنح بشرتك النضارة والصحة التي تستحقها، بأمان وثقة وإشراف استشاري مستمر.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#00F5D4]" />
            <span className="text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase">
              عيادات ANDRODERMA التخصصية
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#00F5D4]" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: DYNAMIC FINAL CTA WITH LIVE BRANCH RESOLUTION                 */}
      {/* ========================================================================= */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.09] via-white/[0.04] to-transparent border border-white/15 p-8 sm:p-14 text-center backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.7)]">
            {/* Pulsating Cyan Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-[#00F5D4]/15 blur-[130px] pointer-events-none animate-pulse" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#00F5D4] tracking-widest uppercase bg-[#00F5D4]/10 px-3.5 py-1.5 rounded-full border border-[#00F5D4]/20 mb-4">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>ابدأ رحلتك العلاجية اليوم</span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 leading-tight">
                احجز استشارتك مع نخبة أطباء الجلدية والليزر
              </h2>

              {/* Dynamic Branch Description */}
              <p className="mt-5 text-slate-200 text-sm sm:text-base leading-relaxed">
                اختر الفرع الأقرب إليك في <span className="text-[#00F5D4] font-bold">{dynamicBranchString}</span>،
                واحصل على تقييم سريري شامل وخطة علاجية مخصصة بالكامل لحالة بشرتك.
              </p>

              {/* Booking Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <MagneticButton
                  onClick={() => onOpenBooking()}
                  className="rounded-full bg-[#00F5D4] px-9 py-4 text-base font-black text-slate-950 shadow-[0_0_30px_rgba(0,245,212,0.4)] hover:shadow-[0_0_40px_rgba(0,245,212,0.6)] hover:bg-[#20ffd9] transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>احجز موعدك الآن</span>
                  </span>
                </MagneticButton>

                <a
                  href={`https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(clinic.whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>تواصل عبر واتساب</span>
                </a>

                <a
                  href={`tel:${clinic.phone}`}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <PhoneCall className="h-4 w-4 text-[#00F5D4]" />
                  <span>{clinic.phoneDisplay}</span>
                </a>
              </div>

              {/* Dynamic Live Branches Footer Line */}
              <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300">
                <MapPin className="h-3.5 w-3.5 text-[#00F5D4]" />
                <span className="font-bold text-white">فروعنا المتاحة:</span>
                <span className="text-slate-300">{dynamicBranchString}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
