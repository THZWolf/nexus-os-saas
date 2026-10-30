import React, { useState } from 'react';
import { NexuFile } from '../types/nexu';
import { 
  FileCode, 
  Terminal, 
  Sliders, 
  ScrollText, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Search, 
  Folder,
  FolderOpen
} from 'lucide-react';

interface FileExplorerProps {
  files: NexuFile[];
  activeFile: NexuFile;
  onSelectFile: (file: NexuFile) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFile,
  onSelectFile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupa os arquivos por categoria
  const categories: { key: NexuFile['category']; label: string; icon: React.ReactNode }[] = [
    { key: 'runtime', label: '1. Runtime & Inteligência (/opt/nexus-os/)', icon: <Cpu className="w-4 h-4 text-cyan-400" /> },
    { key: 'build', label: '2. Build & Empacotamento ISO (/opt/nexu-builder/)', icon: <Terminal className="w-4 h-4 text-indigo-400" /> },
    { key: 'cgroups', label: '3. Desempenho & Cgroups (IA/PG/Server)', icon: <Sliders className="w-4 h-4 text-amber-400" /> },
    { key: 'logs', label: '4. Gerenciamento de Logs & Limpeza', icon: <ScrollText className="w-4 h-4 text-emerald-400" /> },
    { key: 'status', label: '5. Monitoramento & Sanidade (Telegram)', icon: <Activity className="w-4 h-4 text-blue-400" /> },
    { key: 'sanity', label: '5.1 Validação de Sanidade & Alertas', icon: <ShieldCheck className="w-4 h-4 text-rose-400" /> },
    { key: 'qa', label: '6. QA, QEMU & CI/CD Pipeline', icon: <Folder className="w-4 h-4 text-purple-400" /> },
  ];

  const getPermissionBadge = (perm: string) => {
    if (perm.includes('755')) {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
          755 (+x)
        </span>
      );
    }
    if (perm.includes('600')) {
      return (
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 font-semibold">
          600 (sec)
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
        644
      </span>
    );
  };

  const getExtensionColor = (lang: NexuFile['language']) => {
    switch (lang) {
      case 'bash': return 'text-cyan-400';
      case 'ini': return 'text-amber-400';
      case 'json': return 'text-emerald-400';
      case 'yaml': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)]">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filtrar arquivos, caminhos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Árvore de Overlay (/overlay/)</span>
          <span className="font-mono text-cyan-400">{filteredFiles.length} arquivos</span>
        </div>
      </div>

      {/* Files List Categorized */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {categories.map((cat) => {
          const catFiles = filteredFiles.filter((f) => f.category === cat.key);
          if (catFiles.length === 0) return null;
          const isCollapsed = collapsedCategories[cat.key];

          return (
            <div key={cat.key} className="space-y-1">
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-800/60 text-slate-300 text-xs font-semibold tracking-wide transition group"
              >
                <div className="flex items-center space-x-2 truncate">
                  {isCollapsed ? (
                    <Folder className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                  ) : (
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  {catFiles.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="pl-3 space-y-1 border-l border-slate-800 ml-3">
                  {catFiles.map((file) => {
                    const isSelected = activeFile.id === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => onSelectFile(file)}
                        className={`w-full text-left px-2.5 py-2 rounded-md transition flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-cyan-950/70 text-cyan-200 border border-cyan-800/80 shadow-sm'
                            : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 truncate">
                            <FileCode className={`w-3.5 h-3.5 ${getExtensionColor(file.language)}`} />
                            <span className="font-mono text-xs font-medium truncate">
                              {file.name}
                            </span>
                          </div>
                          {getPermissionBadge(file.permissions)}
                        </div>

                        <div className="font-mono text-[10px] text-slate-400 truncate pl-5">
                          {file.overlayPath}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            Arquivos de Produção
          </span>
          <span className="text-slate-400">100% Cobertura</span>
        </div>
      </div>
    </aside>
  );
};
