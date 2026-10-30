import React from 'react';
import { 
  Cpu, 
  HardDrive, 
  Layers, 
  ShieldAlert, 
  Sliders, 
  Terminal, 
  Zap, 
  Activity, 
  Send, 
  Workflow,
  Eye,
  Brain,
  Database
} from 'lucide-react';

export const ArchitectureGraph: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 custom-scrollbar h-[calc(100vh-4rem)]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Arquitetura de Subsistemas do NEXU-OS
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Mapeamento de baixa latência e contenção de recursos entre o Kernel Linux, hierarquia unificada de cgroups v2, 
              orquestração systemd para microsserviços de IA, políticas de rotação de log e automação de testes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 bg-cyan-950 text-cyan-300 rounded border border-cyan-800 font-semibold">
              cgroups v2
            </span>
            <span className="px-2.5 py-1 bg-amber-950 text-amber-300 rounded border border-amber-800 font-semibold">
              IOWeight: 900
            </span>
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800 font-semibold">
              zstd-19 SquashFS
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 3 Architectural Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: I/O Cgroups & Data Prioritization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Priorização de I/O & Cgroups</h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
              BFQ / Kyber
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  PostgreSQL & Storage Slice
                </span>
                <span className="font-mono text-amber-400 font-bold">IOWeight=900</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Drop-in em <code className="text-slate-300">docker.service.d/iowait.conf</code>. Assegura que gravações WAL e tabelas de vetores de IA nunca sofram inanição (starvation) sob concorrência intensa.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Escalonamento de CPU
                </span>
                <span className="font-mono text-cyan-400 font-bold">CPUWeight=900</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                9x mais fatias de CFS (Completely Fair Scheduler) comparado a daemons auxiliares do sistema (peso padrão 100).
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">TasksMax & Descritores</span>
                <span className="font-mono text-emerald-400 font-bold">LimitNOFILE=1048576</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Evita falhas do tipo "Too many open files" durante conexões simultâneas de microsserviços.
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: AI Microservices Ecosystem */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm">Microsserviços de IA (Systemd)</h3>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
              Sandboxed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Nexus-Avatar Ignis-Mage */}
            <div className="p-3 bg-slate-950 rounded-lg border border-purple-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-200 flex items-center gap-1.5">
                  <span className="text-sm">🐉</span>
                  nexus-avatar.service
                </span>
                <span className="font-mono text-purple-300 text-[11px]">Ignis-Mage Core</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Avatar de IA com presença holográfica flutuante e insígnia Dragão + Mago. Integração em tempo real com o servidor local e machine state.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] font-mono text-slate-400">
                <span>MemoryMax=4G</span>
                <span>•</span>
                <span>CPUWeight=700</span>
              </div>
            </div>

            {/* Nexus-Server SQLite WAL */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  nexus-server.service
                </span>
                <span className="font-mono text-cyan-300 text-[11px]">FastAPI + WAL</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Servidor local de baixa latência em 127.0.0.1:8000 e SQLite WAL mode para telemetria e barramento de eventos do Avatar.
              </p>
            </div>

            {/* Open-Jarvis */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                  open-jarvis.service
                </span>
                <span className="font-mono text-cyan-300 text-[11px]">14GB Max RAM</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Orquestrador de agentes LLM locais. Configurado com <code className="text-slate-300">MemoryHigh=12G</code> e <code className="text-slate-300">MemoryMax=14G</code>, impedindo invasão do buffer do kernel.
              </p>
            </div>

            {/* Open-Eye */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  open-eye.service
                </span>
                <span className="font-mono text-cyan-300 text-[11px]">10GB Max RAM</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Motor de visão computacional e detecção espacial. Configurado com <code className="text-slate-300">DeviceAllow=/dev/dri rw</code> para aceleração por hardware GPU e NPU local.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Air-Gapped Hygiene & Telegram Alarms */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Higiene de Logs & Resiliência</h3>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
              500MB Cap
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Journald Rígido</span>
                <span className="font-mono text-emerald-400 font-bold">500MB Max</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Garante que a partição volátil em live boot jamais transborde. Arquivos individuais limitados a 50M com expiração de 15 dias.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Docker Log Rotation</span>
                <span className="font-mono text-cyan-400 font-bold">50m × 3 arquivos</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Configurado em <code className="text-slate-300">/etc/docker/daemon.json</code>, limitando o consumo de logs por container a no máximo 150MB.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-rose-400" />
                  Alerta Telegram no FirstBoot
                </span>
                <span className="font-mono text-rose-400 font-bold">Webhook API</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                O serviço <code className="text-slate-300">nexu-firstboot-sanity.service</code> executa 7 testes e, em caso de inconsistência, despacha payload crítico automaticamente.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ISO Packaging & QA Pipeline Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Workflow className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-sm">Pipeline de Empacotamento ISO & QA Automatizado</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-cyan-800/60 space-y-2">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Passo 1</span>
            <div className="font-semibold text-white text-xs">Injeção de Overlay</div>
            <p className="text-slate-400 text-[11px] font-sans">
              Mesclagem de <code className="text-cyan-300">/opt/nexu-builder/overlay</code> e aplicação granular de permissões (755 scripts, 644 units, 600 secrets).
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-indigo-800/60 space-y-2">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Passo 2</span>
            <div className="font-semibold text-white text-xs">SquashFS zstd-19</div>
            <p className="text-slate-400 text-[11px] font-sans">
              Compactação com <code className="text-indigo-300">-b 1048576</code> (1MB) e <code className="text-indigo-300">-Xcompression-level 19</code> para máxima redução e throughput.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-emerald-800/60 space-y-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Passo 3</span>
            <div className="font-semibold text-white text-xs">ISO Híbrida & Checksum</div>
            <p className="text-slate-400 text-[11px] font-sans">
              Criação de imagem bootável UEFI/BIOS com xorriso, geração de checksum SHA256 e gravação do manifesto JSON.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-purple-800/60 space-y-2">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Passo 4</span>
            <div className="font-semibold text-white text-xs">QA Headless em QEMU</div>
            <p className="text-slate-400 text-[11px] font-sans">
              Asserção serial em <code className="text-purple-300">test-iso-headless.sh</code> e workflow no GitHub Actions com fail-fast e upload de artefatos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
