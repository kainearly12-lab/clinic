import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { CLINIC_LOGO } from '@/data/clinicLogo';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime exception caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'حدث خطأ غير متوقع أثناء تشغيل التطبيق';
      const stackTrace = this.state.error?.stack || this.state.errorInfo?.componentStack || '';

      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-[#0c0e12] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-text"
        >
          {/* Background ambient lighting */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00B8A9]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Logo */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={CLINIC_LOGO}
                  alt="Androderma"
                  className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,184,169,0.3)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-base font-black text-white">عيادات Androderma</h1>
                  <span className="text-xs text-teal-400 font-bold">نظام الأمان والتعافي من الأخطاء</span>
                </div>
              </div>

              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Error Body */}
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200">
                <p className="text-sm font-bold leading-relaxed">
                  تم اكتشاف استثناء أثناء تحميل واجهة المستخدم. يعمل النظام في وضع الأمان لمنع توقف الشاشة.
                </p>
                <p className="mt-1.5 text-xs text-amber-300/80 font-mono break-all text-left dir-ltr">
                  {errorMessage}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00B8A9] hover:bg-[#009b8e] text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(0,184,169,0.25)]"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                  إعادة تحميل الصفحة (Reload)
                </button>

                <button
                  type="button"
                  onClick={this.handleResetStorage}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
                >
                  <Home className="w-4 h-4" />
                  إعادة تعيين الذاكرة المحلية
                </button>
              </div>

              {/* Developer Details Accordion */}
              {stackTrace && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-bold transition-colors py-1"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-teal-400" />
                      تفاصيل الخطأ للمطورين (Developer Diagnostics)
                    </span>
                    {this.state.showDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-48 scrollbar-thin text-left dir-ltr">
                      <p className="text-rose-400 font-bold mb-2">{errorMessage}</p>
                      <pre className="whitespace-pre-wrap">{stackTrace}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Androderma Medical Suite v2.0</span>
              <span className="text-teal-400 font-medium">Safe Mode Active</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
