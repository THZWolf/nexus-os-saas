import React, { useState } from 'react';
import { NexuFile } from '../types/nexu';
import { 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Shield, 
  Layers, 
  Key,
  Info
} from 'lucide-react';

interface CodeViewerProps {
  file: NexuFile;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ file }) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(file.content);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopyBashCommand = () => {
    const isExec = file.permissions.includes('755');
    const isStrictSec = file.permissions.includes('600');
    const chmodCmd = isExec 
      ? `chmod 755 "${file.path}"` 
      : isStrictSec 
      ? `chmod 600 "${file.path}"` 
      : `chmod 644 "${file.path}"`;

    const command = `sudo mkdir -p "$(dirname "${file.path}")" && sudo tee "${file.path}" > /dev/null << 'EOF'\n${file.content}\nEOF\nsudo ${chmodCmd}`;
    
    navigator.clipboard.writeText(command);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = file.content.split('\n');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
      {/* File Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-mono text-base font-bold text-white flex items-center gap-1.5">
                <span className="text-cyan-400 font-semibold">{file.name}</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {file.language.toUpperCase()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                <Key className="w-3 h-3" />
                {file.permissions}
              </span>
            </div>

            {/* Path mapping */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Destino Host:</span>
                <code className="text-cyan-300 font-semibold bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  {file.path}
                </code>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">No Overlay:</span>
                <code className="text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                  /overlay/{file.overlayPath}
                </code>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={handleCopyBashCommand}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-md text-xs font-mono font-medium border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
              title="Copiar comando shell completo com mkdir e chmod para colar direto no terminal"
            >
              {copiedCommand ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Comando Copiado!</span>
                </>
              ) : (
                <>
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copiar como Bash Command</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyRaw}
              className="px-3 py-1.5 bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 rounded-md text-xs font-medium border border-cyan-700/60 transition flex items-center gap-1.5"
            >
              {copiedRaw ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSingle}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs border border-slate-700 transition"
              title="Baixar arquivo individual"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Description Box */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-md border border-slate-800">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p>{file.description}</p>
            {file.highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {file.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60"
                  >
                    <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Editor Body with Line Numbers */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs text-slate-200 select-text p-4">
        <div className="min-w-full">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                  <td className="w-12 text-right pr-4 text-slate-400 select-none font-mono text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="whitespace-pre font-mono leading-relaxed pl-2 text-slate-100">
                    {renderColoredLine(line, file.language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Simple syntax colorizer for bash, ini, and json
function renderColoredLine(line: string, language: NexuFile['language']) {
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-slate-400 italic">{line}</span>;
  }

  if (language === 'bash') {
    if (line.trim().startsWith('readonly') || line.trim().startsWith('export')) {
      return <span className="text-purple-300 font-semibold">{line}</span>;
    }
    if (line.includes('log_info') || line.includes('log_success') || line.includes('echo')) {
      return <span className="text-emerald-300">{line}</span>;
    }
    if (line.includes('mksquashfs') || line.includes('xorriso') || line.includes('docker') || line.includes('chmod') || line.includes('qemu')) {
      return <span className="text-cyan-300 font-semibold">{line}</span>;
    }
  }

  if (language === 'ini') {
    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
      return <span className="text-amber-300 font-bold">{line}</span>;
    }
    if (line.includes('=')) {
      const [key, ...rest] = line.split('=');
      return (
        <span>
          <span className="text-cyan-300">{key}</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-300">{rest.join('=')}</span>
        </span>
      );
    }
  }

  if (language === 'json') {
    if (line.includes('":')) {
      const parts = line.split('":');
      return (
        <span>
          <span className="text-cyan-300">{parts[0]}"</span>:
          <span className="text-amber-300">{parts.slice(1).join('":')}</span>
        </span>
      );
    }
  }

  if (language === 'python') {
    if (line.trim().startsWith('def ') || line.trim().startsWith('async def ') || line.trim().startsWith('class ')) {
      return <span className="text-cyan-300 font-bold">{line}</span>;
    }
    if (line.trim().startsWith('@')) {
      return <span className="text-amber-300 font-semibold">{line}</span>;
    }
    if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
      return <span className="text-purple-300">{line}</span>;
    }
    if (line.includes('return ') || line.includes('await ') || line.includes('async ')) {
      return <span className="text-emerald-300">{line}</span>;
    }
  }

  if (language === 'yaml') {
    if (line.trim().startsWith('- name:')) {
      return <span className="text-emerald-300 font-medium">{line}</span>;
    }
    if (line.includes(':')) {
      const [k, ...v] = line.split(':');
      return (
        <span>
          <span className="text-cyan-300 font-medium">{k}:</span>
          <span className="text-amber-200">{v.join(':')}</span>
        </span>
      );
    }
  }

  return <span>{line}</span>;
}
