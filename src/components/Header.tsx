import React from 'react';
import { Shield, HardDrive, Cpu, Terminal, Download, Play, CheckCircle2, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenSim: () => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
  activeView: 'code' | 'avatar' | 'terminal' | 'arch' | 'compliance';
  setActiveView: (view: 'code' | 'avatar' | 'terminal' | 'arch' | 'compliance') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSim,
  onDownloadZip,
  isDownloading,
  activeView,
  setActiveView,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <span className="text-lg">🐉</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg tracking-wider text-white">NEXU-OS</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  v1.0.0-PROD
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-950 text-purple-300 border border-purple-800/80">
                  DRAGON & MAGE
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AIR-GAPPED
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Simbiose Win32/POSIX • Avatar de IA • SquashFS zstd-19 • Cgroups v2 IOWeight=900
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'code'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Arquivos & Overlay
            </button>
            <button
              onClick={() => setActiveView('avatar')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'avatar'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>🐉</span>
              <span>Avatar & Wizard</span>
            </button>
            <button
              onClick={() => setActiveView('terminal')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'terminal'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Terminal & QEMU
            </button>
            <button
              onClick={() => setActiveView('arch')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors hidden md:flex items-center gap-1.5 ${
                activeView === 'arch'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Arquitetura & Cgroups
            </button>
            <button
              onClick={() => setActiveView('compliance')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeView === 'compliance'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auditoria Air-Gap
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenSim}
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Simular execução de build-iso.sh no terminal"
            >
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simular Build</span>
            </button>

            <button
              onClick={onDownloadZip}
              disabled={isDownloading}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-cyan-900/30 transition disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Empacotando...' : 'Baixar Overlay (.zip)'}</span>
            </button>
          </div>
        </div>

        {/* Quick Specs Bar */}
        <div className="py-1.5 border-t border-slate-900/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-mono">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-cyan-400" />
              RootFS: <strong className="text-slate-200 font-semibold">SquashFS zstd-19 (1MB block)</strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Docker cgroup: <strong className="text-slate-200 font-semibold">IOWeight=900 (PostgreSQL)</strong>
            </span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              Logs: <strong className="text-slate-200 font-semibold">journald 500M / docker 50m×3</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>QA: QEMU / KVM + CI Headless</span>
            <span>Alertas: Telegram Webhook</span>
          </div>
        </div>
      </div>
    </header>
  );
};
