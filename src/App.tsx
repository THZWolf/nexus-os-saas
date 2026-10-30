/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NEXU_FILES } from './data/nexuFiles';
import { NexuFile } from './types/nexu';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';
import { TerminalSimulator } from './components/TerminalSimulator';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { AirGapChecklist } from './components/AirGapChecklist';
import { AvatarWizardView } from './components/AvatarWizardView';
import { generateOverlayZip, downloadBlob } from './utils/zipExport';

export default function App() {
  const [activeFile, setActiveFile] = useState<NexuFile>(NEXU_FILES[0]);
  const [activeView, setActiveView] = useState<'code' | 'avatar' | 'terminal' | 'arch' | 'compliance'>('code');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateOverlayZip();
      downloadBlob(blob, 'nexu-os-overlay-v1.0.0-PROD.zip');
    } catch (err) {
      console.error('Falha ao gerar arquivo ZIP do overlay:', err);
      alert('Erro ao empacotar o arquivo ZIP do overlay.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenSim = () => {
    setActiveView('terminal');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        onOpenSim={handleOpenSim}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloading}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'code' && (
          <>
            <FileExplorer
              files={NEXU_FILES}
              activeFile={activeFile}
              onSelectFile={setActiveFile}
            />
            <CodeViewer file={activeFile} />
          </>
        )}

        {activeView === 'avatar' && <AvatarWizardView />}

        {activeView === 'terminal' && <TerminalSimulator />}

        {activeView === 'arch' && <ArchitectureGraph />}

        {activeView === 'compliance' && <AirGapChecklist />}
      </main>
    </div>
  );
}
