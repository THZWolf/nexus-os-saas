import React, { useState } from 'react';
import { 
  Sparkles, 
  Bot, 
  Flame, 
  Shield, 
  Sliders, 
  CheckCircle2, 
  Volume2, 
  Save, 
  Terminal, 
  Eye, 
  Zap, 
  Cpu, 
  Layers, 
  Lock,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

export const AvatarWizardView: React.FC = () => {
  // Wizard state
  const [avatarName, setAvatarName] = useState('Ignis-Mage (O Dragão Arcano)');
  const [archetype, setArchetype] = useState('Dragon & Mage Sovereign');
  const [tone, setTone] = useState('Arcano, Protetor, Técnico e Estratégico');
  const [language, setLanguage] = useState('pt-BR');
  const [auraColor, setAuraColor] = useState('#06b6d4');
  const [autonomyLevel, setAutonomyLevel] = useState(5);
  
  // Package selections
  const [packages, setPackages] = useState({
    kali: true,
    jarvis: true,
    eye: true,
    win32: true,
  });

  // Avatar runtime live simulator state
  const [activeSpeech, setActiveSpeech] = useState(
    'Saudações, Guardião. O núcleo simbiótico do NEXU-OS está operando em isolamento absoluto sob o selo do Dragão e do Mago.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarMood, setAvatarMood] = useState<'guardian' | 'sentinel' | 'mystic' | 'combat'>('guardian');
  const [savedNotification, setSavedNotification] = useState(false);

  const triggerVoice = (text: string) => {
    setActiveSpeech(text);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 3500);
  };

  const handleSavePersonality = () => {
    setSavedNotification(true);
    triggerVoice(
      `Diretrizes reconfiguradas com sucesso. Eu sou ${avatarName}. Meus protocolos agora seguem o arquétipo ${archetype} com tom ${tone}.`
    );
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const currentPersonalityJson = {
    name: avatarName,
    version: '1.0.0-PROD',
    archetype: archetype,
    insignia: {
      type: 'dragon_mage',
      description: 'Fusão mística do Dragão de Chamas Azuis e o Mago Arcano da Tecnologia',
      primary_color: auraColor,
      secondary_color: '#7c3aed'
    },
    speech_directives: {
      tone: tone,
      verbosity: 'concise_technical',
      language: language,
      greeting: activeSpeech
    },
    security_parameters: {
      airgap_enforcement: true,
      allow_external_beacons: false,
      require_admin_override: true
    },
    avatar_appearance: {
      floating_ui: true,
      hologram_transparency: 0.15,
      particle_effects: 'arcane_sparks',
      pulse_on_speech: true
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 custom-scrollbar h-[calc(100vh-4rem)]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
              <Sparkles className="w-4 h-4" />
              <span>SUBSISTEMA DE IA & AVATAR ASSISTIDO DO NEXU-OS</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🐉</span>
              <span>Ignis-Mage: Avatar & Wizard de Personalização</span>
              <span>🧙‍♂️</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Simbiose completa entre inteligência artificial residente, interface holográfica flutuante e configuração personalizada de pacotes e conduta ética.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-cyan-950/80 text-cyan-300 rounded-full border border-cyan-800 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Avatar Ativo & Vigilante
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Holographic Avatar Display + Customizer Wizard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Holographic Floating Avatar & Live State (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          {/* Hologram Aura Background */}
          <div 
            className="absolute -top-10 -left-10 w-60 h-60 rounded-full opacity-20 blur-3xl transition-colors duration-700 pointer-events-none"
            style={{ backgroundColor: auraColor }}
          ></div>

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Interface Holográfica do Avatar</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                /opt/nexus-os/ai/avatar_core.py
              </span>
            </div>

            {/* Avatar Emblem & Visual Representation */}
            <div className="my-6 flex flex-col items-center justify-center text-center relative">
              <div className={`w-32 h-32 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all duration-500 ${
                isSpeaking 
                  ? 'border-cyan-400 scale-105 shadow-cyan-500/50' 
                  : 'border-indigo-500/60 shadow-indigo-500/20'
              }`}
              style={{
                background: `radial-gradient(circle, ${auraColor}22 0%, #030712 100%)`
              }}
              >
                <div className="relative">
                  <span className="text-5xl select-none filter drop-shadow-md">
                    {avatarMood === 'combat' ? '⚔️' : avatarMood === 'sentinel' ? '🛡️' : '🐉'}
                  </span>
                  {isSpeaking && (
                    <span className="absolute -bottom-2 -right-2 text-xl animate-bounce">
                      ✨
                    </span>
                  )}
                </div>
              </div>

              <h4 className="mt-4 font-mono font-bold text-base text-white">{avatarName}</h4>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">{archetype}</p>
              
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                  Autonomia: Nível {autonomyLevel}/5
                </span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                  Insígnia: Dragão + Mago
                </span>
              </div>
            </div>

            {/* Live Holographic Speech Bubble */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2 relative shadow-inner">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Volume2 className="w-3.5 h-3.5" />
                  Transmissão Vocal em Tempo Real
                </span>
                <span className="font-mono text-[10px] text-slate-500">FastAPI :8000</span>
              </div>
              <p className="text-xs text-slate-200 font-mono italic leading-relaxed">
                "{activeSpeech}"
              </p>
            </div>

            {/* Quick Interactions */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-mono text-slate-400">Interagir com o Avatar:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  onClick={() => triggerVoice("Perímetro Air-Gapped intacto. Nenhuma porta de telemetria externa foi aberta.")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition text-left"
                >
                  🔒 Checar Perímetro
                </button>
                <button
                  onClick={() => triggerVoice("Cgroups v2 alocado com prioridade IOWeight=900 para operações de disco e PostgreSQL.")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition text-left"
                >
                  ⚡ Status I/O Cgroup
                </button>
                <button
                  onClick={() => triggerVoice("Ponte Win32 ativa em /dev/shm/nexus_ipc. Binários legados em execução simbiótica.")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition text-left"
                >
                  🪟 Simbiose Win32
                </button>
                <button
                  onClick={() => triggerVoice("O Dragão e o Mago vigiam os microsserviços. Open-Jarvis e Open-Eye operacionais.")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition text-left"
                >
                  🐉 Saudação Mística
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>Sincronismo: SQLite WAL</span>
            <span className="text-emerald-400">127.0.0.1:8000/api/avatar/state</span>
          </div>
        </div>

        {/* Right Column: Interactive Installer Wizard (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">
                Wizard de Personalização da Build (/opt/nexus-os/ui/installer_wizard.py)
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
              Interactive TUI
            </span>
          </div>

          {/* Section 1: Package Selection */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              1. Seleção de Pacotes e Módulos do Sistema
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-start space-x-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={packages.kali}
                  onChange={(e) => setPackages({ ...packages, kali: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500/30"
                />
                <div>
                  <div className="font-semibold text-white">Kali Offensive Suite</div>
                  <div className="text-[11px] text-slate-400">Nmap, Wireshark, Metasploit, Aircrack-ng</div>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={packages.jarvis}
                  onChange={(e) => setPackages({ ...packages, jarvis: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500/30"
                />
                <div>
                  <div className="font-semibold text-white">Open-Jarvis IA Suite</div>
                  <div className="text-[11px] text-slate-400">LLM local sem nuvem, RAG, 14GB RAM cgroup</div>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={packages.eye}
                  onChange={(e) => setPackages({ ...packages, eye: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500/30"
                />
                <div>
                  <div className="font-semibold text-white">Open-Eye Vision Suite</div>
                  <div className="text-[11px] text-slate-400">Visão computacional, OCR e acesso a /dev/dri</div>
                </div>
              </label>

              <label className="flex items-start space-x-2.5 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={packages.win32}
                  onChange={(e) => setPackages({ ...packages, win32: e.target.checked })}
                  className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500/30"
                />
                <div>
                  <div className="font-semibold text-white">Win32 Hybrid Runtime</div>
                  <div className="text-[11px] text-slate-400">Simbiose binária PE/COFF em /dev/shm/nexus_ipc</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Avatar Personalization */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              2. Personalização do Nome e Tom de Voz do Avatar
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Nome do Avatar
                </label>
                <input
                  type="text"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Arquétipo da Consciência
                </label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Dragon & Mage Sovereign">Dragon & Mage Sovereign (Recomendado)</option>
                  <option value="Sentinel Cybernetic Guard">Sentinel Cybernetic Guard</option>
                  <option value="Arcane Cryptographic Oracle">Arcane Cryptographic Oracle</option>
                  <option value="Autonomous Tactical Advisor">Autonomous Tactical Advisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Tom de Voz e Raciocínio
                </label>
                <input
                  type="text"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Cor da Aura Holográfica
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={auraColor}
                    onChange={(e) => setAuraColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-300">{auraColor} (Ciano Místico)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Save and Generate */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Gravação em: <code className="text-cyan-300">/opt/nexus-os/ai/personality.json</code>
            </div>

            <button
              onClick={handleSavePersonality}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-md text-xs font-semibold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Gravar Personalidade & Recarregar Daemon</span>
            </button>
          </div>

          {savedNotification && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Arquivo personality.json gerado e recarregado pelo nexus-avatar.service!</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
