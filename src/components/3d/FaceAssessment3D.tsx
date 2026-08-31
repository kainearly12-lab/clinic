import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  CalendarDays,
  RotateCcw,
  Layers,
  ChevronLeft,
  Smartphone,
  Maximize2,
  Stethoscope,
} from 'lucide-react';
import { FaceMeshCanvas } from './FaceMeshCanvas';
import { skinZones, SkinZone } from '@/data/skinZonesData';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Canvas encountered an error, falling back to 2D view:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface FaceAssessment3DProps {
  onSelectServiceAndProceed: (serviceId: string, zoneName: string) => void;
  onQuickBook: (treatmentTitle: string) => void;
}

export function FaceAssessment3D({
  onSelectServiceAndProceed,
  onQuickBook,
}: FaceAssessment3DProps) {
  const [selectedZone, setSelectedZone] = useState<SkinZone>(skinZones[0]);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // Check for WebGL capability and prefers-reduced-motion
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        setViewMode('2d');
      }
    } catch {
      setWebGlSupported(false);
      setViewMode('2d');
    }

    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionMedia.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionMedia.addEventListener('change', handleMotionChange);
    return () => motionMedia.removeEventListener('change', handleMotionChange);
  }, []);

  const handleZoneSelect = (zone: SkinZone) => {
    setSelectedZone(zone);
  };

  const handleResetCamera = () => {
    setSelectedZone(skinZones[0]);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar: 3D / 2D Toggle + Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>خريطة الوجه التفاعلية ثلاثية الأبعاد (3D Facial Mesh)</span>
              <span className="hidden sm:inline-block rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                فحص تشريحي متقدم
              </span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">
              اسحب لتدوير المجسم 360° وانقر على أي منطقة لاستعراض التوصية الطبية والبروتوكول
            </span>
          </div>
        </div>

        {/* 3D vs 2D Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200 dark:border-gray-700">
          {webGlSupported && (
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                viewMode === '3d'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>مجسم 3D</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>مخطط 2D سريع</span>
          </button>
        </div>
      </div>

      {/* CLEAN 2-COLUMN SIDE-BY-SIDE GRID (No Overlapping) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
        
        {/* LEFT COLUMN: 3D VIEWPORT CONTAINER (lg:col-span-7) */}
        <div className="lg:col-span-7 h-[550px] relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 shadow-2xl flex flex-col justify-between">
          
          {/* Futuristic Medical Grid Background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00B8A9_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-teal-500/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-[100px]" />

          {/* Top Floating Zone Indicator */}
          <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 rounded-full bg-slate-900/85 border border-teal-500/40 px-3.5 py-1.5 text-xs font-bold text-teal-300 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B8A9] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B8A9]" />
              </span>
              <span>المنطقة المحددة: {selectedZone.nameAr}</span>
            </div>

            <button
              type="button"
              onClick={handleResetCamera}
              className="pointer-events-auto flex items-center gap-1 rounded-full bg-slate-900/85 border border-white/10 hover:border-teal-400/50 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all backdrop-blur-md shadow-md active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>

          {/* 3D Wireframe Canvas Viewport or 2D Interactive Fallback */}
          <div className="relative w-full flex-1">
            {viewMode === '3d' && webGlSupported ? (
              <CanvasErrorBoundary
                fallback={
                  <div className="relative w-full h-full p-6 flex flex-col justify-center items-center text-center">
                    <div className="max-w-xs space-y-3">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-500/10 border border-[#00B8A9]/40 text-[#00B8A9]">
                        <Layers className="h-7 w-7" />
                      </div>
                      <h4 className="text-base font-extrabold text-white">
                        المخطط التشريحي لمناطق الوجه
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        اختر من الأزرار التفاعلية أدناه للانتقال المباشر للمنطقة وفحص بروتوكولاتها
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm mt-6">
                      {skinZones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => handleZoneSelect(zone)}
                          className={`rounded-2xl p-3 text-right transition-all border ${
                            selectedZone.id === zone.id
                              ? 'bg-teal-900/60 border-[#00B8A9] text-white ring-2 ring-[#00B8A9]/30'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-teal-500/50'
                          }`}
                        >
                          <span className="block text-xs font-black">{zone.nameAr}</span>
                          <span className="block text-[10px] text-teal-400 mt-0.5">{zone.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                }
              >
                <FaceMeshCanvas
                  selectedZone={selectedZone}
                  onSelectZone={handleZoneSelect}
                  reducedMotion={reducedMotion}
                />
              </CanvasErrorBoundary>
            ) : (
              /* 2D Interactive Anatomical Map Fallback */
              <div className="relative w-full h-full p-6 flex flex-col justify-center items-center text-center">
                <div className="max-w-xs space-y-3">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-500/10 border border-[#00B8A9]/40 text-[#00B8A9]">
                    <Layers className="h-7 w-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    المخطط التشريحي لمناطق الوجه
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    اختر من الأزرار التفاعلية أدناه للانتقال المباشر للمنطقة وفحص بروتوكولاتها
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm mt-6">
                  {skinZones.map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => handleZoneSelect(zone)}
                      className={`rounded-2xl p-3 text-right transition-all border ${
                        selectedZone.id === zone.id
                          ? 'bg-teal-900/60 border-[#00B8A9] text-white ring-2 ring-[#00B8A9]/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-teal-500/50'
                      }`}
                    >
                      <span className="block text-xs font-black">{zone.nameAr}</span>
                      <span className="block text-[10px] text-teal-400 mt-0.5">{zone.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Quick Zone Pills Bar inside the Stage */}
          <div className="p-3 border-t border-white/10 bg-slate-950/90 backdrop-blur-md relative z-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {skinZones.map((zone) => {
                const isActive = selectedZone.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => handleZoneSelect(zone)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#00B8A9] text-slate-950 shadow-[0_0_12px_rgba(0,184,169,0.5)] font-black scale-105'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-white/5'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? 'bg-slate-950' : 'bg-teal-400'
                      }`}
                    />
                    <span>{zone.nameAr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INDEPENDENT SIDE PANEL (lg:col-span-5) */}
        <div className="lg:col-span-5 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedZone.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl bg-white/95 dark:bg-[#161a24]/95 border border-teal-900/10 dark:border-teal-500/30 p-6 sm:p-7 shadow-xl backdrop-blur-xl text-right flex flex-col justify-between h-full min-h-[550px]"
            >
              <div>
                {/* Zone Tag & Service Category */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-700/50 px-3 py-1 text-[11px] font-black text-teal-800 dark:text-teal-300">
                    {selectedZone.tag}
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-wider">
                    {selectedZone.nameEn}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                  {selectedZone.nameAr}
                </h3>

                {/* Clinical Description */}
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-medium">
                  {selectedZone.descriptionAr}
                </p>

                {/* Recommended Treatments in this Zone */}
                <div className="mt-5 border-t border-slate-100 dark:border-gray-800/80 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-gray-200 mb-2.5">
                    <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>البروتوكولات الطبية المقترحة لهذه المنطقة:</span>
                  </div>

                  <div className="space-y-2">
                    {selectedZone.treatments.map((treatment, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-[#1a202c] p-2.5 px-3.5 border border-slate-200/70 dark:border-gray-700/60"
                      >
                        <span className="text-xs font-bold text-slate-800 dark:text-gray-200">
                          {treatment}
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-[#00B8A9] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note about Sessions & Diagnosis */}
                <div className="mt-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 p-3 border border-teal-200/60 dark:border-teal-800/40 text-[11px] font-semibold text-teal-900 dark:text-teal-300">
                  <span>💡 {selectedZone.priceNote}</span>
                </div>
              </div>

              {/* Action Buttons: Proceed with Quiz or Instant WhatsApp / Direct Booking */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800/80 space-y-2.5">
                <button
                  type="button"
                  onClick={() =>
                    onSelectServiceAndProceed(
                      selectedZone.targetServiceId,
                      selectedZone.nameAr
                    )
                  }
                  className="btn-primary w-full py-3.5 text-xs sm:text-sm font-black shadow-md hover:shadow-lg gap-2"
                >
                  <span>اعتماد هذه المنطقة ومتابعة التوصية الطبية</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onQuickBook(selectedZone.nameAr)}
                  className="btn-secondary w-full py-2.5 text-xs font-bold text-teal-800 dark:text-teal-300"
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>حجز استشارة مباشرة لمنطقة {selectedZone.nameAr.split(' ')[0]}</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
