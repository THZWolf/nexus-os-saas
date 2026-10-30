import JSZip from 'jszip';
import { NEXU_FILES } from '../data/nexuFiles';

export async function generateOverlayZip(): Promise<Blob> {
  const zip = new JSZip();

  // Cria a pasta raiz do overlay
  const overlayFolder = zip.folder('nexu-os-overlay');

  NEXU_FILES.forEach((file) => {
    // Normaliza o caminho dentro do zip
    const relPath = file.overlayPath;
    overlayFolder?.file(relPath, file.content);
  });

  // Adiciona README de deployment e instruções de permissões
  const readmeContent = `# NEXU-OS Enterprise Overlay Package
Versão: 1.0.0-PROD
Data de Empacotamento: ${new Date().toISOString()}

## Como Aplicar este Overlay na Máquina de Build:

1. Descompacte este pacote em:
   /opt/nexu-builder/overlay/

   Exemplo:
   sudo unzip nexu-os-overlay.zip -d /opt/nexu-builder/

2. Conceda as permissões de execução nos scripts essenciais:
   sudo chmod +x /opt/nexus-os/*.py /opt/nexus-os/core/*.py /opt/nexus-os/ai/*.py /opt/nexus-os/ui/*.py
   sudo chmod +x /opt/nexu-builder/build-iso.sh
   sudo chmod +x /opt/nexu-builder/test-iso-qemu.sh
   sudo chmod +x /opt/nexu-builder/test-iso-headless.sh
   sudo chmod +x /opt/nexu-os/cleanup-docker.sh
   sudo chmod +x /opt/nexu-os/sanity-test.sh
   sudo chmod +x /usr/local/bin/nexu-status.sh

3. Permissões de unidades e configurações:
   sudo chmod 644 /opt/nexus-os/ai/personality.json
   sudo chmod 644 /etc/systemd/system/*.service
   sudo chmod 644 /etc/systemd/system/*.timer
   sudo chmod 644 /etc/systemd/system/docker.service.d/*.conf
   sudo chmod 644 /etc/systemd/journald.conf
   sudo chmod 644 /etc/docker/daemon.json
   sudo chmod 600 /etc/nexu-os/alerts.conf (após preencher as credenciais)

4. Inicie o processo de compilação da ISO com SquashFS zstd-19:
   sudo /opt/nexu-builder/build-iso.sh

5. Valide a imagem gerada com o teste de máquina virtual:
   sudo /opt/nexu-builder/test-iso-qemu.sh
`;
  overlayFolder?.file('README.md', readmeContent);

  // Adiciona o script de aplicação rápida de permissões
  const installPerms = `#!/bin/bash
set -e
echo "Aplicando permissões do NEXU-OS no sistema..."
chmod +x /opt/nexus-os/*.py 2>/dev/null || true
chmod +x /opt/nexus-os/core/*.py 2>/dev/null || true
chmod +x /opt/nexus-os/ai/*.py 2>/dev/null || true
chmod +x /opt/nexus-os/ui/*.py 2>/dev/null || true
chmod 644 /opt/nexus-os/ai/personality.json 2>/dev/null || true
chmod +x /opt/nexu-builder/*.sh 2>/dev/null || true
chmod +x /opt/nexu-os/*.sh 2>/dev/null || true
chmod +x /usr/local/bin/*.sh 2>/dev/null || true
chmod 644 /etc/systemd/system/*.service 2>/dev/null || true
chmod 644 /etc/systemd/system/*.timer 2>/dev/null || true
chmod 644 /etc/systemd/system/docker.service.d/*.conf 2>/dev/null || true
chmod 644 /etc/systemd/journald.conf 2>/dev/null || true
chmod 644 /etc/docker/daemon.json 2>/dev/null || true
echo "Permissões aplicadas com sucesso!"
`;
  overlayFolder?.file('apply-permissions.sh', installPerms);

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
