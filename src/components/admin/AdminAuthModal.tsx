import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, KeyRound, X, AlertCircle, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { logAdminActivity } from '@/services/adminService';
import {
  verifyAdminCredentials,
  injectSuperAdminSession,
  isPreviewEnvironment,
} from '@/utils/adminAuth';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string) => void;
  onBackToSite?: () => void;
}

export function AdminAuthModal({ isOpen, onClose, onSuccess, onBackToSite }: AdminAuthModalProps) {
  const isPreview = isPreviewEnvironment();
  const [email, setEmail] = useState(() => (isPreview ? 'kainearly12@gmail.com' : 'admin@androderma.com'));
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync default email if preview state changes
  useEffect(() => {
    if (isPreview && !email) {
      setEmail('kainearly12@gmail.com');
    }
  }, [isPreview, email]);

  const performLoginSuccess = async (authenticatedEmail: string, customLabel?: string) => {
    // 1. Instant session injection into sessionStorage and localStorage
    const session = injectSuperAdminSession(
      authenticatedEmail,
      customLabel ||
        (authenticatedEmail === 'kainearly12@gmail.com'
          ? 'كاين إيرلي (Super Admin)'
          : 'مدير النظام')
    );

    // 2. Asynchronous activity logging (non-blocking)
    logAdminActivity('login', `تسجيل دخول مسؤول (${session.displayName})`).catch(() => {});

    setShowSuccess(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(false);
      onSuccess(session.displayName || authenticatedEmail);
    }, 150);
  };

  // Instant Quick Bypass trigger for preview mode
  const handleQuickPreviewBypass = () => {
    setErrorMsg(null);
    setIsLoading(true);
    performLoginSuccess('kainearly12@gmail.com', 'كاين إيرلي (Super Admin)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني للمسؤول');
      return;
    }

    // 1. SEAMLESS PREVIEW BYPASS:
    // If running in preview environment and email is kainearly12@gmail.com,
    // bypass all external network checks and password validation immediately.
    if (isPreview && cleanEmail === 'kainearly12@gmail.com') {
      setIsLoading(true);
      await performLoginSuccess('kainearly12@gmail.com', 'كاين إيرلي (Super Admin)');
      return;
    }

    // If production, require password
    if (!cleanPassword && !isPreview) {
      setErrorMsg('يرجى إدخال كلمة المرور المعتمدة');
      return;
    }

    setIsLoading(true);

    // 2. If in preview environment with any whitelisted admin, authenticate without network delay
    if (isPreview) {
      const verification = verifyAdminCredentials(cleanEmail, cleanPassword || 'androderma2025');
      if (verification.isValid) {
        await performLoginSuccess(cleanEmail, cleanEmail === 'kainearly12@gmail.com' ? 'كاين إيرلي (Super Admin)' : 'مدير النظام');
        return;
      }
    }

    // 3. In Production (Vercel): Try Supabase Auth first if available
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!error && data?.user) {
          await performLoginSuccess(data.user.email || cleanEmail, 'مدير النظام');
          return;
        }
      } catch (err) {
        console.warn('Supabase Auth attempt exception:', err);
      }
    }

    // 4. Strict Credential Verification against authorized admin matrix
    const verification = verifyAdminCredentials(cleanEmail, cleanPassword);

    if (verification.isValid) {
      await performLoginSuccess(cleanEmail, 'مدير النظام');
    } else {
      setIsLoading(false);
      setErrorMsg(verification.error || 'بيانات الدخول غير صحيحة. تم رفض تسجيل الدخول.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-teal-500/30 bg-[#12161f] p-6 sm:p-8 shadow-2xl text-white z-10"
          >
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#00B8A9]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-teal-900/20 blur-3xl" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3">
                <div className="h-16 w-16 rounded-2xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-[#00B8A9] shadow-[0_0_20px_rgba(0,184,169,0.3)]">
                  <Shield className="h-8 w-8" />
                </div>
              </div>

              <h2 className="font-display text-xl font-black text-white">
                بوابة الإدارة الطبية المعتمدة
              </h2>
              <p className="mt-1 text-xs text-slate-400 max-w-xs">
                تسجيل دخول آمن مشفر لإدارة الحجوزات والمصفوفة التشغيلية لعيادات Androderma
              </p>

              {/* Preview Environment Banner & Direct Bypass Button */}
              {isPreview && (
                <div className="mt-3 w-full p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex flex-col items-center gap-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-[#00B8A9]" />
                    <span>بيئة المعاينة (Preview Bypass Active)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickPreviewBypass}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#00B8A9]/20 hover:bg-[#00B8A9]/30 border border-[#00B8A9]/50 text-[#00B8A9] hover:text-white text-[11px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>⚡ تسجيل دخول فوري مباشر (kainearly12@gmail.com)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </motion.div>
            )}

            {/* Success Banner */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300 font-bold"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>تم التحقق من هوية المسؤول بنجاح. جاري فتح لوحة التحكم...</span>
              </motion.div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني للمسؤول (Admin Email)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kainearly12@gmail.com"
                    dir="ltr"
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none focus:ring-1 focus:ring-[#00B8A9] transition-all font-mono text-left"
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    كلمة المرور (Password)
                  </label>
                  <span className="text-[10px] text-teal-400 font-semibold">
                    {isPreview ? 'مقبولة أي كلمة في المعاينة' : 'تحقق أمني صارم'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isPreview ? 'أي كلمة مرور للمعاينة' : '••••••••'}
                    dir="ltr"
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none focus:ring-1 focus:ring-[#00B8A9] transition-all font-mono text-left"
                  />
                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00B8A9] hover:bg-[#009b8e] active:scale-[0.99] text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(0,184,169,0.3)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      جاري الدخول الفوري...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      تسجيل الدخول المشفر للوحة التحكم
                    </span>
                  )}
                </button>

                {onBackToSite && (
                  <button
                    type="button"
                    onClick={onBackToSite}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all border border-white/5"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span>العودة إلى الموقع الرئيسي للعيادة</span>
                  </button>
                )}
              </div>
            </form>

            {/* Modal Footer Note */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>جلسة مشفرة (Persistent Session)</span>
              <span className="text-teal-400 font-mono">
                {isPreview ? 'Preview Active (Instant Access)' : 'v2.5 Strict Gate'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
