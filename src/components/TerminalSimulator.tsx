import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Flame, 
  Send
} from 'lucide-react';

type CommandMode = 'nexus_launch' | 'build' | 'sanity' | 'status' | 'qemu';

export const TerminalSimulator: React.FC = () => {
  const [mode, setMode] = useState<CommandMode>('nexus_launch');
  const [isRunning, setIsRunning] = useState(false);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines]);

  const clearTerminal = () => {
    setOutputLines([]);
  };

  const copyTerminal = () => {
    navigator.clipboard.writeText(outputLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSimulation = () => {
    setIsRunning(true);
    setOutputLines([]);

    if (mode === 'nexus_launch') {
      runNexusLaunchSimulation();
    } else if (mode === 'build') {
      runBuildSimulation();
    } else if (mode === 'sanity') {
      runSanitySimulation(simulateFailure);
    } else if (mode === 'status') {
      runStatusSimulation();
    } else if (mode === 'qemu') {
      runQemuSimulation();
    }
  };

  const runNexusLaunchSimulation = () => {
    const steps = [
      { text: "\u001b[36m\u001b[1m                  _==/           i     i          \\==_\u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m                /XX/            |\\___/|           \\XX\\\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m              /XXXX\\            |XXXXX|            /XXXX\\\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m             |XXXXXX\\_         _XXXXXXX_         _/XXXXXX|\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m            XXXXXXXXXXXxxxxxxxXXXXXXXXXXXxxxxxxxXXXXXXXXXXX\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m           |XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m           |XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m            XXXXXX/^^^^\"\\XXXXXXXXXXXXXXXXXXXXX/^^^^\"\\XXXXXX\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m             |XXX|       |XXXXXXXXXXXXXXXXXXX|       |XXX|\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m               \\X\\__      \\XXXXXXXXXXXXXXXXX/      __/X/\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m                 \\__^^^^^       W W W W       ^^^^^__/\u001b[0m", delay: 70 },
      { text: "\u001b[36m\u001b[1m                  NEXU-OS: O DRAGÃO ALADO & O MAGO ARCANO\u001b[0m", delay: 100 },
      { text: "\u001b[32m=== INICIALIZANDO ECOSSISTEMA AIR-GAPPED NEXU-OS ===\u001b[0m", delay: 150 },
      { text: "[INFO] Inicializando banco SQLite com WAL Mode em /opt/nexus-os/data/nexus_local.db...", delay: 200 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m SQLite PRAGMA journal_mode=WAL; configurado para alta concorrência.", delay: 150 },
      { text: "[INFO] Subindo daemon: FastAPI Local Server -> uvicorn 127.0.0.1:8000 (access_log=False)...", delay: 200 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Servidor local ativo em http://127.0.0.1:8000.", delay: 150 },
      { text: "[INFO] Subindo daemon: Holographic AI Avatar Core (Ignis-Mage)...", delay: 200 },
      { text: "  -> Carregando diretrizes de /opt/nexus-os/ai/personality.json", delay: 100 },
      { text: "  -> Tom: Arcano, Protetor, Técnico e Estratégico", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Presença holográfica ativada e sincronizada com SQLite.", delay: 150 },
      { text: "[INFO] Subindo daemon: Win32-POSIX Hybrid Runtime...", delay: 200 },
      { text: "  -> Mapeando barramento de memória compartilhada /dev/shm/nexus_ipc (4MB)...", delay: 150 },
      { text: "  -> Registro virtual carregado: HKEY_LOCAL_MACHINE\\SOFTWARE\\NexuOS", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Camada de simbiose binária Win32 operacional.", delay: 150 },
      { text: "[INFO] Verificando conformidade do perímetro Air-Gapped...", delay: 150 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Zero gateways de saída não autorizados. Isolamento soberano ativo.", delay: 150 },
      { text: "\u001b[32m=================================================================\u001b[0m", delay: 100 },
      { text: "\u001b[32mNEXU-OS pronto para operação com suporte total a microsserviços e IA.\u001b[0m", delay: 100 },
      { text: "\u001b[36m[Ignis-Mage] » Saudações, Guardião. Todos os sistemas sob vigilância perpétua.\u001b[0m", delay: 200 }
    ];

    executeStepSequence(steps);
  };

  const runBuildSimulation = () => {
    const steps = [
      { text: "\u001b[36m\u001b[1m  _   _ _______  ___   _       ____   _____ \u001b[0m", delay: 100 },
      { text: "\u001b[36m\u001b[1m | \\ | | ____\\ \\/ / | | |     / __ \\ / ____|\u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m |  \\| | |__   \\  /| | | |____| |  | | (___  \u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m | . ` |  __|  /  \\| | | |____| |  | |\\___ \\ \u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m | |\\  | |____/ /\\ \\ |_| |    | |__| |____) |\u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m |_| \\_|______/_/  \\_\\___/      \\____/|_____/ \u001b[0m", delay: 80 },
      { text: "\u001b[34m[INFO]\u001b[0m Iniciando compilação do NEXU-OS v1.0.0-PROD...", delay: 200 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 1: Validando privilégios e dependências do ambiente host...", delay: 200 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Privilégios de ROOT (EUID=0) validados.", delay: 150 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Dependências verificadas: mksquashfs, xorriso, grub-mkrescue, rsync, zstd, sha256sum.", delay: 200 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 2: Inicializando diretórios de compilação em /opt/nexu-builder/workspace...", delay: 200 },
      { text: "\u001b[34m[INFO]\u001b[0m Sincronizando RootFS base para área de staging...", delay: 300 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 3: Injetando overlay e aplicando permissões de segurança corporativa...", delay: 250 },
      { text: "  -> Injetando /overlay/etc/systemd/system/docker.service.d/iowait.conf", delay: 100 },
      { text: "  -> Injetando /overlay/etc/systemd/system/open-jarvis.service (IOWeight=800, RAM=14G)", delay: 100 },
      { text: "  -> Injetando /overlay/etc/systemd/system/open-eye.service (DeviceAllow=/dev/dri)", delay: 100 },
      { text: "  -> Injetando /overlay/etc/systemd/journald.conf (SystemMaxUse=500M)", delay: 100 },
      { text: "  -> Injetando /overlay/etc/docker/daemon.json (log-opts: 50m * 3)", delay: 100 },
      { text: "  -> Injetando scripts: /usr/local/bin/nexu-status.sh, sanity-test.sh, cleanup-docker.sh", delay: 150 },
      { text: "\u001b[34m[INFO]\u001b[0m Normalizando permissões: chmod 755 em scripts executáveis, chmod 644 em systemd units...", delay: 200 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Overlay injetado e permissões normalizadas com sucesso.", delay: 150 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 4: Habilitando serviços no multi-user.target do RootFS...", delay: 200 },
      { text: "  -> Habilitado: docker.service", delay: 80 },
      { text: "  -> Habilitado: open-jarvis.service", delay: 80 },
      { text: "  -> Habilitado: open-eye.service", delay: 80 },
      { text: "  -> Habilitado: nexu-status-boot.service", delay: 80 },
      { text: "  -> Habilitado: nexu-cleanup.timer", delay: 80 },
      { text: "  -> Habilitado: nexu-firstboot-sanity.service", delay: 80 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 5: Compactando RootFS com SquashFS [zstd nível 19, blocos de 1MB]...", delay: 300 },
      { text: "  [mksquashfs] Executando: mksquashfs /opt/nexu-builder/workspace/rootfs filesystem.squashfs -comp zstd -Xcompression-level 19 -b 1048576 -noappend", delay: 400 },
      { text: "  [zstd-19] Paralelismo: 8 threads | Tamanho do bloco: 1048576 bytes (1.00 MB)", delay: 300 },
      { text: "  [progress] [████████████████████░░░░░░░░░░] 52% (2.8 GB / 5.4 GB original)", delay: 400 },
      { text: "  [progress] [██████████████████████████████] 100% (SquashFS final: 1.42 GB - Razão: 3.8:1)", delay: 500 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m SquashFS gerado com sucesso em: /opt/nexu-builder/workspace/iso_root/live/filesystem.squashfs", delay: 200 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 6: Configurando bootloader híbrido (GRUB UEFI + BIOS Legacy)...", delay: 200 },
      { text: "\u001b[34m[INFO]\u001b[0m Etapa 7: Gerando imagem ISO bootável com xorriso...", delay: 300 },
      { text: "  xorriso 1.5.4 : RockRidge filesystem created with 785640 blocks", delay: 200 },
      { text: "  Calculando Checksum SHA256 da ISO...", delay: 300 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m =================================================================", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m BUILD DO NEXU-OS CONCLUÍDO COM ÊXITO!", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m ISO Gerada: /opt/nexu-builder/dist/nexu-os-1.0.0-PROD-20261030-x86_64.iso", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Checksum SHA256: 4f8b2c8a9e7d12f3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m Manifesto de build gravado em: dist/nexu-os-1.0.0-PROD.manifest.json", delay: 100 },
      { text: "\u001b[32m[SUCCESS]\u001b[0m =================================================================", delay: 100 },
    ];

    executeStepSequence(steps);
  };

  const runSanitySimulation = (isFail: boolean) => {
    const steps = [
      { text: "=================================================================", delay: 80 },
      { text: "       NEXU-OS AUTOMATED SANITY TEST SUITE", delay: 80 },
      { text: "=================================================================", delay: 80 },
      { text: "Iniciando verificação de conformidade operacional...", delay: 150 },
      { text: "  [\u001b[32mPASS\u001b[0m] 1. Systemd Init PID 1", delay: 200 },
      { text: "  [\u001b[32mPASS\u001b[0m] 2. Docker Daemon Responsivo (Docker v26.1, overlay2 storage)", delay: 250 },
      { text: "  [\u001b[32mPASS\u001b[0m] 3. Integridade e Permissões dos Scripts (+x em /opt/nexu-os e /usr/local/bin)", delay: 200 },
      { 
        text: isFail 
          ? "  [\u001b[31mFAIL\u001b[0m] 4. Registro das Unidades Systemd de IA -> open-jarvis.service inativo (crashloop)" 
          : "  [\u001b[32mPASS\u001b[0m] 4. Registro das Unidades Systemd de IA (open-jarvis, open-eye, docker)", 
        delay: 300 
      },
      { text: "  [\u001b[32mPASS\u001b[0m] 5. Cgroups IOWeight=900 Drop-in (/etc/systemd/system/docker.service.d/iowait.conf)", delay: 200 },
      { text: "  [\u001b[32mPASS\u001b[0m] 6. Limite Rígido Journald (500M) em /etc/systemd/journald.conf", delay: 200 },
      { 
        text: isFail
          ? "  [\u001b[31mFAIL\u001b[0m] 7. Conformidade de Rede Air-Gapped -> Rota WAN pública 0.0.0.0/0 detectada!"
          : "  [\u001b[32mPASS\u001b[0m] 7. Conformidade de Rede Air-Gapped (Nenhum Gateway WAN Não Autorizado)", 
        delay: 250 
      },
      { text: "=================================================================", delay: 100 },
      { 
        text: isFail 
          ? "Total de testes: 7 | Falhas: 2" 
          : "Total de testes: 7 | Falhas: 0", 
        delay: 100 
      },
      { 
        text: isFail
          ? "\u001b[31m[RESULTADO] Teste de sanidade FALHOU com 2 erro(s).\u001b[0m"
          : "\u001b[32m[RESULTADO] Todos os testes de sanidade foram APROVADOS com sucesso!\u001b[0m",
        delay: 150
      },
    ];

    if (isFail) {
      steps.push(
        { text: "\u001b[34m[INFO] Enviando alerta crítico via Telegram...\u001b[0m", delay: 200 },
        { text: "POST https://api.telegram.org/bot<TOKEN>/sendMessage", delay: 150 },
        { text: "Payload despachado: [🚨 ALERTA CRÍTICO: FALHA DE SANIDADE NO NEXU-OS]", delay: 150 },
        { text: "\u001b[32m[TELEGRAM API]\u001b[0m HTTP 200 OK - Mensagem entregue ao grupo de incidentes.", delay: 200 },
        { text: "Processo finalizado com exit code 1.", delay: 100 }
      );
    } else {
      steps.push(
        { text: "Primeiro boot validado. Criando marcador /var/lib/nexu-os/firstboot.done", delay: 150 },
        { text: "Processo finalizado com exit code 0.", delay: 100 }
      );
    }

    executeStepSequence(steps);
  };

  const runStatusSimulation = () => {
    const steps = [
      { text: "\u001b[36m\u001b[1m  _   _ _______  __ _    _        ____   _____ \u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m | \\ | | ____\\ \\/ /| |  | |      / __ \\ / ____|\u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m |  \\| | |__   \\  / | |  | |_____| |  | | (___  \u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m | . ` |  __|  /  \\ | |  | |_____| |  | |\\___ \\ \u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m | |\\  | |____/ /\\ \\| |__| |     | |__| |____) |\u001b[0m", delay: 80 },
      { text: "\u001b[36m\u001b[1m |_| \\_|______/_/  \\_\\\\____/       \\____/|_____/ \u001b[0m", delay: 80 },
      { text: "     ENTERPRISE SYSTEM STATUS & TELEMETRY", delay: 100 },
      { text: "", delay: 50 },
      { text: "\u001b[1m[1] IDENTIFICAÇÃO DO SISTEMA\u001b[0m", delay: 100 },
      { text: "  Host:         \u001b[36mnexu-node-01.airgap.internal\u001b[0m", delay: 80 },
      { text: "  Kernel:       \u001b[36m6.6.48-nexu-hardened\u001b[0m (x86_64)", delay: 80 },
      { text: "  Uptime:       \u001b[36mup 4 days, 18 hours, 32 minutes\u001b[0m", delay: 80 },
      { text: "  Data Local:   \u001b[36m2026-10-30 17:54:12 UTC\u001b[0m", delay: 80 },
      { text: "", delay: 50 },
      { text: "\u001b[1m[2] CONFINAMENTO DE REDE (AIR-GAPPED COMPLIANCE)\u001b[0m", delay: 100 },
      { text: "  Isolamento:   \u001b[32m[✔ TOTALMENTE ISOLADO]\u001b[0m (Nenhum gateway externo configurado)", delay: 100 },
      { text: "  Interfaces:   lo (127.0.0.1/8) eth0 (10.200.5.14/24) docker0 (172.17.0.1/16)", delay: 100 },
      { text: "", delay: 50 },
      { text: "\u001b[1m[3] CONTROLE DE CGROUPS & PRIORIZAÇÃO DE I/O\u001b[0m", delay: 100 },
      { text: "  Docker IOWeight: \u001b[32m900\u001b[0m (Meta: 900) - cgroups v2 unified", delay: 100 },
      { text: "  Memória RAM:     \u001b[36m8.4Gi / 32Gi (Swap: 0B / 0B desativado para segurança)\u001b[0m", delay: 100 },
      { text: "", delay: 50 },
      { text: "\u001b[1m[4] ESTADO DOS MICROSSERVIÇOS DE IA\u001b[0m", delay: 100 },
      { text: "  docker.service:       \u001b[32m[ATIVO / OPERACIONAL]\u001b[0m (Engine 26.1.4)", delay: 80 },
      { text: "  open-jarvis.service:  \u001b[32m[ATIVO / OPERACIONAL]\u001b[0m (LLM Engine - 14G limit)", delay: 80 },
      { text: "  open-eye.service:     \u001b[32m[ATIVO / OPERACIONAL]\u001b[0m (Vision NPU /dev/dri - 10G limit)", delay: 80 },
      { text: "  nexu-cleanup.timer:   \u001b[32m[ATIVO / OPERACIONAL]\u001b[0m (Próximo disparo: Domingo 03:00)", delay: 80 },
      { text: "", delay: 50 },
      { text: "\u001b[1m[5] ARMAZENAMENTO E LIMITES DE LOG\u001b[0m", delay: 100 },
      { text: "  Journald Disk: \u001b[36m142.4M\u001b[0m (Limite Rígido: 500M - 28.4% consumido)", delay: 80 },
      { text: "  Docker Pool:   \u001b[36m18.2G / 120G (15% ocupado)\u001b[0m", delay: 80 },
      { text: "", delay: 50 },
      { text: "=================================================================", delay: 50 },
      { text: "\u001b[32mNEXU-OS pronto para operação com suporte nativo a microsserviços.\u001b[0m", delay: 100 },
    ];

    executeStepSequence(steps);
  };

  const runQemuSimulation = () => {
    const steps = [
      { text: "[CI] Inicializando máquina virtual Headless com QEMU...", delay: 150 },
      { text: "[CI] Imagem: /opt/nexu-builder/dist/nexu-os-1.0.0-PROD-x86_64.iso", delay: 150 },
      { text: "[CI] Parâmetros: qemu-system-x86_64 -m 4096 -smp 2 -nographic -serial file:/tmp/nexu-serial-boot.log", delay: 200 },
      { text: "SeaBIOS (version 1.15.0-1)", delay: 150 },
      { text: "Carregando kernel Linux /live/vmlinuz...", delay: 200 },
      { text: "Carregando initrd /live/initrd.img...", delay: 200 },
      { text: "[    0.000000] Linux version 6.6.48 (root@nexu-builder) #1 SMP PREEMPT_DYNAMIC", delay: 100 },
      { text: "[    0.000000] Command line: boot=live quiet loglevel=3 systemd.unified_cgroup_hierarchy=1 console=ttyS0", delay: 100 },
      { text: "[    0.142100] cgroup: Disabling net_prio, cgroup v2 unified hierarchy enabled", delay: 100 },
      { text: "[    0.351200] SquashFS 4.0: mounted filesystem with zstd compression (1048576 byte blocks)", delay: 150 },
      { text: "[    1.120500] systemd 254.8-1 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR +CGROUP_V2)", delay: 150 },
      { text: "[    1.890000] [  OK  ] Started systemd-journald.service (Cap 500M)", delay: 100 },
      { text: "[    2.340000] [  OK  ] Started Docker Application Container Engine (IOWeight=900)", delay: 150 },
      { text: "[    3.100000] [  OK  ] Started open-jarvis.service (MemoryMax=14G)", delay: 150 },
      { text: "[    3.800000] [  OK  ] Started open-eye.service (DeviceAllow=/dev/dri)", delay: 150 },
      { text: "[    4.200000] [  OK  ] Finished NEXU-OS Print Operational Status Banner on Boot.", delay: 150 },
      { text: "[    4.600000] Executando /opt/nexu-os/sanity-test.sh (ConditionFirstBoot=true)...", delay: 250 },
      { text: "[    5.100000] [PASS] 1. Systemd Init PID 1", delay: 100 },
      { text: "[    5.300000] [PASS] 2. Docker Daemon Responsivo", delay: 100 },
      { text: "[    5.500000] [PASS] 3. Integridade e Permissões dos Scripts (+x)", delay: 100 },
      { text: "[    5.700000] [PASS] 4. Registro das Unidades Systemd de IA", delay: 100 },
      { text: "[    5.900000] [PASS] 5. Cgroups IOWeight=900 Drop-in", delay: 100 },
      { text: "[    6.100000] [PASS] 6. Limite Rígido Journald (500M)", delay: 100 },
      { text: "[    6.300000] [PASS] 7. Conformidade de Rede Air-Gapped", delay: 100 },
      { text: "[    6.500000] Todos os testes de sanidade foram APROVADOS com sucesso!", delay: 150 },
      { text: "[CI] SUCESSO! Asserção de sanidade confirmada nos logs seriais em 6.5s.", delay: 200 },
      { text: "[CI] Testes headless concluídos com êxito. Código de saída: 0", delay: 100 },
    ];

    executeStepSequence(steps);
  };

  const executeStepSequence = (steps: { text: string; delay: number }[]) => {
    let currentIdx = 0;

    const printNext = () => {
      if (currentIdx < steps.length) {
        const step = steps[currentIdx];
        setOutputLines((prev) => [...prev, step.text]);
        currentIdx++;
        setTimeout(printNext, step.delay);
      } else {
        setIsRunning(false);
      }
    };

    printNext();
  };

  const getShellPrompt = () => {
    switch (mode) {
      case 'nexus_launch':
        return 'root@nexus-core:/opt/nexus-os# python3 nexus_launch.py';
      case 'build':
        return 'root@nexu-builder:/opt/nexu-builder# ./build-iso.sh';
      case 'sanity':
        return 'root@nexu-host:/opt/nexu-os# ./sanity-test.sh';
      case 'status':
        return 'root@nexu-node-01:~# /usr/local/bin/nexu-status.sh';
      case 'qemu':
        return 'runner@github-actions:/workspace# ./opt/nexu-builder/test-iso-headless.sh';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden p-4">
      {/* Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-t-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Script Selection Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { setMode('nexus_launch'); clearTerminal(); }}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
              mode === 'nexus_launch'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            nexus_launch.py (Boot Simbiótico)
          </button>
          <button
            onClick={() => { setMode('build'); clearTerminal(); }}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
              mode === 'build'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            build-iso.sh (SquashFS zstd-19)
          </button>
          <button
            onClick={() => { setMode('sanity'); clearTerminal(); }}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
              mode === 'sanity'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            sanity-test.sh (7 Probes)
          </button>
          <button
            onClick={() => { setMode('status'); clearTerminal(); }}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
              mode === 'status'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            nexu-status.sh (Live Console)
          </button>
          <button
            onClick={() => { setMode('qemu'); clearTerminal(); }}
            disabled={isRunning}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition ${
              mode === 'qemu'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            test-iso-headless.sh (QEMU CI)
          </button>
        </div>

        {/* Options & Action Buttons */}
        <div className="flex items-center space-x-3">
          {mode === 'sanity' && (
            <label className="flex items-center space-x-2 text-xs text-slate-300 font-medium cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-md border border-slate-800">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500/30"
              />
              <span className={simulateFailure ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                Simular Falha (Gatilho Telegram)
              </span>
            </label>
          )}

          <button
            onClick={clearTerminal}
            disabled={isRunning}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-md border border-slate-700 transition"
            title="Limpar Terminal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={copyTerminal}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-md border border-slate-700 transition"
            title="Copiar logs do terminal"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-md text-xs font-semibold shadow-md transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Executando...' : 'Executar Comando'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Display */}
      <div className="flex-1 bg-black border-x border-b border-slate-800 rounded-b-xl p-4 font-mono text-xs overflow-auto custom-scrollbar select-text shadow-inner">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="ml-2 font-semibold text-slate-400">nexu-tty1 • VT100 Emulator</span>
          </div>
          <span className="text-cyan-400">zstd-19 • cgroups-v2 • IOWeight=900</span>
        </div>

        {/* Command Prompt Line */}
        <div className="text-cyan-300 font-semibold mb-3 flex items-center gap-2">
          <span className="text-emerald-400">➜</span>
          <span>{getShellPrompt()}</span>
          {isRunning && <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1"></span>}
        </div>

        {/* Lines Output */}
        {outputLines.length === 0 && !isRunning && (
          <div className="text-slate-400 py-8 text-center space-y-2">
            <TerminalIcon className="w-8 h-8 mx-auto text-slate-400" />
            <p>Clique em <strong className="text-cyan-400">"Executar Comando"</strong> para simular a execução em tempo real.</p>
            <p className="text-[11px] text-slate-400">
              O simulador reproduz com precisão os códigos de retorno, streams de progresso do SquashFS e saída serial do QEMU.
            </p>
          </div>
        )}

        <div className="space-y-0.5 leading-relaxed">
          {outputLines.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">
              {formatTerminalAnsi(line)}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

// ANSI color converter for terminal simulator
function formatTerminalAnsi(text: string) {
  // Replace simple ANSI codes
  if (text.includes('\u001b[32m') || text.includes('[PASS]') || text.includes('[SUCCESS]') || text.includes('APROVADOS')) {
    return <span className="text-emerald-400">{text.replace(/\u001b\[\d+m/g, '')}</span>;
  }
  if (text.includes('\u001b[31m') || text.includes('[FAIL]') || text.includes('[ERROR]') || text.includes('FALHOU')) {
    return <span className="text-rose-400 font-semibold">{text.replace(/\u001b\[\d+m/g, '')}</span>;
  }
  if (text.includes('\u001b[34m') || text.includes('[INFO]')) {
    return <span className="text-cyan-400">{text.replace(/\u001b\[\d+m/g, '')}</span>;
  }
  if (text.includes('\u001b[33m') || text.includes('[WARN]')) {
    return <span className="text-amber-400">{text.replace(/\u001b\[\d+m/g, '')}</span>;
  }
  if (text.includes('\u001b[36m')) {
    return <span className="text-cyan-300 font-semibold">{text.replace(/\u001b\[\d+m/g, '')}</span>;
  }
  if (text.startsWith('  ->')) {
    return <span className="text-slate-300">{text}</span>;
  }
  if (text.includes('[progress]') || text.includes('SquashFS final:')) {
    return <span className="text-indigo-300 font-semibold">{text}</span>;
  }

  return <span className="text-slate-200">{text.replace(/\u001b\[\d+m/g, '')}</span>;
}
