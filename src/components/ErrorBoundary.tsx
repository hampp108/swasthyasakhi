import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Activity, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SwasthyaSakhi ErrorBoundary caught an unhandled error]:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7FAF8] via-[#Eef6f2] to-[#E5F4ED] flex items-center justify-center p-4 font-sans text-[#243B35]">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900">SwasthyaSakhi Field Recovery</h1>
              <p className="text-xs text-slate-500">
                A temporary display error was encountered while initializing the register.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-[11px] font-mono text-slate-600 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 rounded-2xl bg-[#16866A] hover:bg-[#13745c] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Clear Cache & Restart
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>MoHFW ASHA Digital Health Field Portal</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
