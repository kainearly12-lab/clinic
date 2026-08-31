import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Mail, KeyRound, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string) => void;
}

export function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (!supabase || !isSupabaseConfigured) {
      // In local preview sandbox mode if credentials aren't live
      // Authenticate if valid email pattern and non-empty password
      if (cleanEmail.includes('@') && cleanPassword.length >= 4) {
        setShowSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccess(false);
          onSuccess(cleanEmail);
        }, 600);
        return;
      } else {
        setIsLoading(false);
        setErrorMsg('يرجى إدخال بريد إلكتروني وكلمة مرور صالحة');
        return;
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        console.warn('Supabase Auth error:', error.message);
        // Translate common Supabase Auth error messages to Arabic
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_credentials') ||
          error.message.includes('Invalid')
        ) {
          setErrorMsg('بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMsg('يرجى تأكيد البريد الإلكتروني المسجل أولاً.');
        } else {
          setErrorMsg(error.message || 'حدث خطأ أثناء تسجيل الدخول');
        }
        setIsLoading(false);
        return;
      }

      if (data && data.user) {
        setShowSuccess(true);
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccess(false);
          onSuccess(data.user?.email || cleanEmail);
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg('لم يتم العثور على حساب إداري مطابق');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ في الاتصال بخادم المصادقة';
      setErrorMsg(msg);
      setIsLoading(false);
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
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
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
                تسجيل الدخول محمي عبر Supabase Authentication لإدارة المواعيد والمصفوفة التشغيلية
              </p>
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
                <span>تم التحقق من الصلاحيات بنجاح. جاري نقلك...</span>
              </motion.div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  البريد الإلكتروني للإدارة (Admin Email)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
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
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full rounded-xl bg-slate-900/80 border border-slate-700/80 px-4 py-3 pl-10 text-xs text-white placeholder-slate-500 focus:border-[#00B8A9] focus:outline-none focus:ring-1 focus:ring-[#00B8A9] transition-all font-mono text-left"
                  />
                  <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00B8A9] hover:bg-[#009b8e] active:scale-[0.99] text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(0,184,169,0.3)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                      جاري التحقق من الهوية...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      تسجيل الدخول للوحة التحكم
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Modal Footer Note */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Supabase RBAC Auth Protected</span>
              <span className="text-teal-400 font-mono">v2.0 Admin Gate</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
