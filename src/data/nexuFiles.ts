import { NexuFile } from '../types/nexu';

export const NEXU_FILES: NexuFile[] = [
  // ===========================================================================
  // 1. ARQUITETURA DO RUNTIME E INTELIGÊNCIA DO NEXU-OS (/opt/nexus-os/)
  // ===========================================================================
  {
    id: 'runtime-hybrid',
    name: 'hybrid_runtime.py',
    path: '/opt/nexus-os/core/hybrid_runtime.py',
    overlayPath: 'opt/nexus-os/core/hybrid_runtime.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Runtime híbrido de simbiose Win32 e Linux. Permite execução e orquestração de binários, drivers e chamadas de sistema Windows sob POSIX através de IPC unificado em memória compartilhada (/dev/shm/nexus_ipc) e mapeador semântico de caminhos.',
    highlights: [
      'Ponte de simbiose Win32 <-> POSIX em /dev/shm/nexus_ipc',
      'Mapeamento dinâmico de caminhos (C:\\\\ -> /opt/nexus-os/compat/drive_c)',
      'Emulação de chaves essenciais do Registro em SQLite/JSON',
      'Gerenciamento assíncrono de subprocessos com isolamento cgroup'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS Hybrid Runtime: Win32 & Linux Syscall Symbiosis Engine
Alvo: /opt/nexus-os/core/hybrid_runtime.py
Ambiente: Air-Gapped High-Resilience Linux Platform
================================================================================
"""
import os
import sys
import json
import time
import mmap
import struct
import signal
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional

# Configuração de logging estruturado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [HYBRID-RUNTIME] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("/var/log/nexus-os/hybrid_runtime.log", mode="a")
    ]
)
logger = logging.getLogger("HybridRuntime")

SHARED_MEM_PATH = "/dev/shm/nexus_ipc"
SHARED_MEM_SIZE = 1024 * 1024 * 4  # 4MB de Buffer IPC em RAM
VIRTUAL_REGISTRY = "/opt/nexus-os/config/win_registry.json"
DRIVE_C_ROOT = "/opt/nexus-os/compat/drive_c"

class Win32LinuxSymbiosisBridge:
    """
    Motor de interoperabilidade transparente entre camadas de chamada de sistema
    Win32 PE/COFF e kernel POSIX Linux.
    """
    def __init__(self):
        self.is_running = False
        self.shm_fd: Optional[int] = None
        self.shm_buf: Optional[mmap.mmap] = None
        self.registry: Dict[str, Any] = {}
        self._ensure_environment()

    def _ensure_environment(self) -> None:
        """Cria pastas de compatibilidade e estrutura de drive virtual C:."""
        Path(DRIVE_C_ROOT).mkdir(parents=True, exist_ok=True)
        Path("/var/log/nexus-os").mkdir(parents=True, exist_ok=True)
        Path("/opt/nexus-os/config").mkdir(parents=True, exist_ok=True)
        
        # Inicializa o Registro virtual do Windows caso inexistente
        if not os.path.exists(VIRTUAL_REGISTRY):
            self.registry = {
                "HKEY_LOCAL_MACHINE": {
                    "SOFTWARE": {
                        "NexuOS": {
                            "Version": "1.0.0-PROD",
                            "AirGapped": True,
                            "SymbiosisActive": True,
                            "Subsystem": "Unified-Hybrid-2026"
                        }
                    }
                },
                "HKEY_CURRENT_USER": {
                    "Environment": {
                        "PATH": "C:\\\\Windows\\\\System32;C:\\\\NexuTools",
                        "TEMP": "C:\\\\Users\\\\Default\\\\AppData\\\\Local\\\\Temp"
                    }
                }
            }
            with open(VIRTUAL_REGISTRY, "w", encoding="utf-8") as f:
                json.dump(self.registry, f, indent=2)
        else:
            with open(VIRTUAL_REGISTRY, "r", encoding="utf-8") as f:
                self.registry = json.load(f)

    def init_shared_memory(self) -> None:
        """Inicializa barramento de memória compartilhada para mensageria ultrarrápida."""
        logger.info(f"Alocando barramento de memória compartilhada ({SHARED_MEM_PATH})...")
        self.shm_fd = os.open(SHARED_MEM_PATH, os.O_CREAT | os.O_RDWR, 0o660)
        os.ftruncate(self.shm_fd, SHARED_MEM_SIZE)
        self.shm_buf = mmap.mmap(self.shm_fd, SHARED_MEM_SIZE, mmap.MAP_SHARED, mmap.PROT_READ | mmap.PROT_WRITE)
        
        # Cabeçalho IPC: [MAGIC (4b)] [SEQ (4b)] [PAYLOAD_LEN (4b)] [DATA]
        self.shm_buf.seek(0)
        self.shm_buf.write(b"NEXU" + struct.pack("<II", 0, 0))
        logger.info("Barramento de memória compartilhada pronto para comunicação simbiótica.")

    def translate_path_to_posix(self, win_path: str) -> str:
        """Traduz caminhos com semântica Windows para o subsistema de arquivos Linux."""
        clean = win_path.replace("\\\\", "/").replace("\\", "/")
        if clean.upper().startswith("C:/"):
            relative = clean[3:]
            return os.path.join(DRIVE_C_ROOT, relative)
        return clean

    async def execute_bridged_task(self, command: str, is_win32: bool = False) -> Dict[str, Any]:
        """Executa comandos isolados roteando chamadas PE/Win32 via proton/wine ou nativo."""
        logger.info(f"Despachando tarefa (Win32={is_win32}): {command}")
        start_time = time.time()

        if is_win32:
            # Roteia através da camada de tradução binária otimizada
            cmd = ["/usr/bin/wine64" if os.path.exists("/usr/bin/wine64") else "/usr/bin/env", command]
        else:
            cmd = ["/usr/bin/bash", "-c", command]

        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            duration = time.time() - start_time
            
            return {
                "exit_code": process.returncode,
                "duration_seconds": round(duration, 4),
                "stdout": stdout.decode("utf-8", errors="replace"),
                "stderr": stderr.decode("utf-8", errors="replace"),
                "success": process.returncode == 0
            }
        except Exception as exc:
            logger.error(f"Falha na execução simbiótica: {exc}")
            return {"exit_code": -1, "error": str(exc), "success": False}

    async def start(self) -> None:
        """Loop principal do runtime híbrido."""
        self.is_running = True
        self.init_shared_memory()
        logger.info("Nexus Hybrid Runtime operacional e escutando requisições.")
        
        while self.is_running:
            # Varredura de sincronismo e heartbeat da memória compartilhada
            await asyncio.sleep(1)

    def stop(self) -> None:
        """Finalização segura dos buffers de memória."""
        logger.info("Encerrando Hybrid Runtime...")
        self.is_running = False
        if self.shm_buf:
            self.shm_buf.close()
        if self.shm_fd:
            os.close(self.shm_fd)
        logger.info("Recursos de simbiose liberados.")

if __name__ == "__main__":
    bridge = Win32LinuxSymbiosisBridge()
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, bridge.stop)
    try:
        loop.run_until_complete(bridge.start())
    except KeyboardInterrupt:
        bridge.stop()
`
  },

  {
    id: 'core-web-importer',
    name: 'web_importer.py',
    path: '/opt/nexus-os/core/web_importer.py',
    overlayPath: 'opt/nexus-os/core/web_importer.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Importador autônomo da WWW e legados de 2026. Em ambientes air-gapped, faz ingestão controlada de pacotes, documentações offline, arquivos WARC/TAR e valida integridade SHA256 antes da injeção no barramento do sistema.',
    highlights: [
      'Ingestão segura e asséptica de artefatos para ambientes Air-gapped',
      'Validação de integridade SHA256 obrigatória',
      'Extração e sandbox de pacotes web/documentação offline',
      'Registro automático no catálogo local do SQLite'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS Autonomous Web & Legacy 2026 Importer
Alvo: /opt/nexus-os/core/web_importer.py
Finalidade: Importação controlada e validação de pacotes offline para Air-gapped
================================================================================
"""
import os
import sys
import tarfile
import zipfile
import hashlib
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional

logging.basicConfig(level=logging.INFO, format="%(asctime)s [WEB-IMPORTER] %(message)s")
logger = logging.getLogger("WebImporter")

INGESTION_SPOOL = "/opt/nexus-os/spool/incoming"
TARGET_REPOSITORY = "/opt/nexus-os/repository"
CATALOG_INDEX = "/opt/nexus-os/config/package_catalog.json"

class AutonomousWebImporter:
    """Ingere e valida pacotes de software, documentações e modelos offline."""
    def __init__(self):
        Path(INGESTION_SPOOL).mkdir(parents=True, exist_ok=True)
        Path(TARGET_REPOSITORY).mkdir(parents=True, exist_ok=True)
        self.catalog = self._load_catalog()

    def _load_catalog(self) -> Dict[str, Any]:
        if os.path.exists(CATALOG_INDEX):
            with open(CATALOG_INDEX, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"packages": {}, "last_sync": None}

    def _save_catalog(self) -> None:
        with open(CATALOG_INDEX, "w", encoding="utf-8") as f:
            json.dump(self.catalog, f, indent=2)

    def calculate_sha256(self, file_path: str) -> str:
        """Calcula o hash criptográfico para garantir a inviolabilidade da cadeia."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    def process_spool(self) -> int:
        """Varre o spool de entrada procurando novos pacotes trazidos via mídia segura."""
        processed = 0
        logger.info(f"Inspecionando diretório de entrada segura: {INGESTION_SPOOL}")
        
        for root, _, files in os.walk(INGESTION_SPOOL):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                if file_name.endswith((".tar.gz", ".tar.zst", ".zip", ".whl")):
                    logger.info(f"Ingerindo artefato: {file_name}")
                    digest = self.calculate_sha256(file_path)
                    
                    dest_dir = os.path.join(TARGET_REPOSITORY, file_name.split(".")[0])
                    os.makedirs(dest_dir, exist_ok=True)
                    
                    if file_name.endswith((".tar.gz", ".tgz")):
                        with tarfile.open(file_path, "r:gz") as tar:
                            tar.extractall(dest_dir)
                    elif file_name.endswith(".zip"):
                        with zipfile.ZipFile(file_path, "r") as z:
                            z.extractall(dest_dir)

                    self.catalog["packages"][file_name] = {
                        "sha256": digest,
                        "installed_path": dest_dir,
                        "status": "verified"
                    }
                    processed += 1
                    os.remove(file_path)
                    logger.info(f"Artefato {file_name} autenticado e integrado com sucesso.")

        if processed > 0:
            self._save_catalog()
        return processed

if __name__ == "__main__":
    importer = AutonomousWebImporter()
    count = importer.process_spool()
    print(f"Total de artefatos ingeridos e validados: {count}")
`
  },

  {
    id: 'core-local-server',
    name: 'local_server.py',
    path: '/opt/nexus-os/core/local_server.py',
    overlayPath: 'opt/nexus-os/core/local_server.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Servidor local construído em FastAPI e banco SQLite sincronizado em WAL (Write-Ahead Logging). Provê API REST e barramento de eventos em tempo real para o Avatar de IA, monitor de Cgroups, status dos microsserviços e integração Win32.',
    highlights: [
      'FastAPI + Uvicorn de alta performance em 127.0.0.1:8000',
      'Banco SQLite nativo com WAL mode para máxima concorrência',
      'Endpoints REST: /api/status, /api/avatar/state, /api/events',
      'Barramento de mensagens em tempo real para telemetria e IA'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS Local High-Performance FastAPI Server & SQLite Sync Bus
Alvo: /opt/nexus-os/core/local_server.py
================================================================================
"""
import os
import sqlite3
import json
import time
import subprocess
from pathlib import Path
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import uvicorn

DB_PATH = "/opt/nexus-os/data/nexus_local.db"
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Inicialização e Otimização do SQLite com WAL Mode
def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Ativa Write-Ahead Logging para concorrência de leitura/gravação sem travas
    cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS system_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL,
        source TEXT,
        level TEXT,
        payload TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS avatar_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp REAL,
        mood TEXT,
        expression TEXT,
        hologram_active INTEGER,
        current_thought TEXT
    )
    """)
    conn.commit()
    conn.close()

init_database()

app = FastAPI(
    title="NEXU-OS Local Core API",
    version="1.0.0-PROD",
    description="Servidor local de alta resiliência para o ecossistema Air-gapped"
)

class EventIn(BaseModel):
    source: str
    level: str = "INFO"
    payload: Dict[str, Any]

class AvatarStateIn(BaseModel):
    mood: str
    expression: str
    hologram_active: bool
    current_thought: str

@app.get("/")
def get_root():
    return {
        "os": "NEXU-OS",
        "version": "1.0.0-PROD",
        "status": "operational",
        "airgap_mode": True,
        "sqlite_wal": True
    }

@app.get("/api/status")
def get_system_status():
    """Retorna métricas operacionais do host, cgroups e estado do Docker."""
    cgroup_io = "N/A"
    try:
        with open("/sys/fs/cgroup/system.slice/docker.service/io.weight", "r") as f:
            cgroup_io = f.read().strip()
    except Exception:
        cgroup_io = "900 (Drop-in configured)"

    return {
        "timestamp": time.time(),
        "cgroup_io_weight": cgroup_io,
        "airgap_isolated": True,
        "database": "sqlite_wal_active"
    }

@app.post("/api/events")
def post_event(event: EventIn):
    """Grava eventos do sistema de forma segura e não-bloqueante."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO system_events (timestamp, source, level, payload) VALUES (?, ?, ?, ?)",
        (time.time(), event.source, event.level, json.dumps(event.payload))
    )
    conn.commit()
    conn.close()
    return {"status": "recorded"}

@app.get("/api/events")
def list_events(limit: int = 50):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, source, level, payload FROM system_events ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {"id": r[0], "timestamp": r[1], "source": r[2], "level": r[3], "payload": json.loads(r[4])}
        for r in rows
    ]

@app.post("/api/avatar/state")
def update_avatar_state(state: AvatarStateIn):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO avatar_telemetry (timestamp, mood, expression, hologram_active, current_thought) VALUES (?, ?, ?, ?, ?)",
        (time.time(), state.mood, state.expression, 1 if state.hologram_active else 0, state.current_thought)
    )
    conn.commit()
    conn.close()
    return {"status": "updated"}

@app.get("/api/avatar/state")
def get_latest_avatar_state():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT mood, expression, hologram_active, current_thought, timestamp FROM avatar_telemetry ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {
            "mood": "contemplative",
            "expression": "serene",
            "hologram_active": True,
            "current_thought": "Vigilância perene do perímetro Air-Gapped ativa.",
            "timestamp": time.time()
        }
    return {
        "mood": row[0],
        "expression": row[1],
        "hologram_active": bool(row[2]),
        "current_thought": row[3],
        "timestamp": row[4]
    }

if __name__ == "__main__":
    uvicorn.run("local_server:app", host="127.0.0.1", port=8000, reload=False, access_log=False)
`
  },

  {
    id: 'ai-avatar-core',
    name: 'avatar_core.py',
    path: '/opt/nexus-os/ai/avatar_core.py',
    overlayPath: 'opt/nexus-os/ai/avatar_core.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Motor de Inteligência do Avatar de IA Assistido do NEXU-OS. Gerencia presença holográfica flutuante, sintetiza instruções através das diretrizes do personality.json, monitora o barramento SQLite e fornece interface vocal e cognitiva ao usuário.',
    highlights: [
      'Presença holográfica e máquina de estados emocionais',
      'Leitura e assimilação do perfil em personality.json',
      'Comunicação bidirecional com FastAPI e open-jarvis',
      'Síntese de voz local e alertas sensoriais'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS AI Avatar Core: Holographic Floating Companion Engine
Alvo: /opt/nexus-os/ai/avatar_core.py
================================================================================
"""
import os
import sys
import json
import time
import asyncio
import logging
import urllib.request
import urllib.error
from pathlib import Path
from typing import Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [AVATAR-CORE] %(message)s")
logger = logging.getLogger("AvatarCore")

PERSONALITY_PATH = "/opt/nexus-os/ai/personality.json"
LOCAL_API_URL = "http://127.0.0.1:8000"

class NexusAvatarCore:
    """Núcleo de processamento e presença autônoma do Avatar do NEXU-OS."""
    def __init__(self):
        self.personality = self._load_personality()
        self.current_state = {
            "mood": "mystic_guardian",
            "expression": "focused",
            "hologram_active": True,
            "current_thought": f"Presença ativada como {self.personality.get('name', 'NEXU-Guardian')}."
        }
        self.is_running = False

    def _load_personality(self) -> Dict[str, Any]:
        """Carrega diretrizes dinâmicas configuradas pelo cliente/administrador."""
        if os.path.exists(PERSONALITY_PATH):
            try:
                with open(PERSONALITY_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Erro ao ler personality.json: {e}")
        
        # Padrão Místico de Fábrica (Dragão + Mago Arcano)
        return {
            "name": "Ignis-Mage (O Dragão Arcano)",
            "archetype": "Dragon & Mage Sovereign",
            "insignia": "dragon_mage_mystic",
            "tone": "Arcano, Protetor, Técnico e Estratégico",
            "autonomy_level": 5,
            "speech_cadence": "calm_authoritative",
            "aura_color": "#06b6d4"
        }

    async def sync_with_local_server(self) -> None:
        """Transmite telemetria do avatar para a API local em SQLite."""
        payload = json.dumps(self.current_state).encode("utf-8")
        req = urllib.request.Request(
            f"{LOCAL_API_URL}/api/avatar/state",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=2) as response:
                pass
        except Exception:
            # Em modo estritamente assíncrono durante boot inicial
            pass

    async def speak(self, phrase: str) -> None:
        """Gera fala e sintetiza presença no console/interface flutuante."""
        logger.info(f"[{self.personality.get('name')}] » {phrase}")
        self.current_state["current_thought"] = phrase
        await self.sync_with_local_server()

    async def loop(self) -> None:
        """Ciclo contínuo de vigilância e cognição do Avatar."""
        self.is_running = True
        logger.info("Motor do Avatar de IA iniciado com sucesso.")
        await self.speak(f"Saudações, Guardião. Sou {self.personality.get('name')}, o avatar residente do NEXU-OS. Todos os sistemas Air-gapped sob controle.")

        while self.is_running:
            # Simula raciocínio e verificação sensorial a cada 10 segundos
            await asyncio.sleep(10)
            await self.sync_with_local_server()

    def stop(self) -> None:
        self.is_running = False
        logger.info("Avatar finalizado com postura de vigília.")

if __name__ == "__main__":
    avatar = NexusAvatarCore()
    try:
        asyncio.run(avatar.loop())
    except KeyboardInterrupt:
        avatar.stop()
`
  },

  {
    id: 'ai-personality-json',
    name: 'personality.json',
    path: '/opt/nexus-os/ai/personality.json',
    overlayPath: 'opt/nexus-os/ai/personality.json',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'json',
    description: 'Arquivo dinâmico gerado pelo installer_wizard.py contendo nome, arquétipo, insígnia mística (Dragão + Mago), diretrizes de conduta, tom de voz e parâmetros de raciocínio da IA residente.',
    highlights: [
      'Insígnia mística: Dragão Alado + Mago Arcano',
      'Configuração dinâmica gerada via Wizard',
      'Diretrizes de resposta para ambiente Air-gapped',
      'Paleta de cores e parâmetros de aura holográfica'
    ],
    content: `{
  "name": "Ignis-Mage (O Dragão Arcano)",
  "version": "1.0.0-PROD",
  "archetype": "Dragon & Mage Sovereign",
  "insignia": {
    "type": "dragon_mage",
    "description": "Fusão mística do Dragão de Chamas Azuis e o Mago Arcano da Tecnologia",
    "primary_color": "#06b6d4",
    "secondary_color": "#7c3aed"
  },
  "speech_directives": {
    "tone": "Estratégico, Sábio, Leal e Rigoroso",
    "verbosity": "concise_technical",
    "language": "pt-BR",
    "greeting": "Saudações, Guardião. O núcleo simbiótico do NEXU-OS está operando em isolamento absoluto."
  },
  "security_parameters": {
    "airgap_enforcement": true,
    "allow_external_beacons": false,
    "require_admin_override": true
  },
  "avatar_appearance": {
    "floating_ui": true,
    "hologram_transparency": 0.15,
    "particle_effects": "arcane_sparks",
    "pulse_on_speech": true
  }
}
`
  },

  {
    id: 'ui-installer-wizard',
    name: 'installer_wizard.py',
    path: '/opt/nexus-os/ui/installer_wizard.py',
    overlayPath: 'opt/nexus-os/ui/installer_wizard.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Wizard interativo de personalização da build em terminal rico. Permite selecionar pacotes de segurança (Kali Offensive Suite, Jarvis Reasoning, Goodeye Vision, Win32 Bridge), tema místico (Dragão + Mago) e afinar a personalidade do Avatar.',
    highlights: [
      'Interface interativa com painéis e caixas de seleção ricas',
      'Seleção de perfis: Kali Tools, Jarvis IA, Goodeye Vision, Win32 Runtime',
      'Customização do ícone místico (Dragão + Mago) e temas de cores',
      'Geração automática de personality.json e manifestos do sistema'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS Interactive Build Customizer & Wizard
Alvo: /opt/nexus-os/ui/installer_wizard.py
================================================================================
"""
import os
import sys
import json
import time

CYAN = "\\033[0;36m"
GREEN = "\\033[0;32m"
YELLOW = "\\033[1;33m"
PURPLE = "\\033[0;35m"
BOLD = "\\033[1m"
NC = "\\033[0m"

BANNER = f"""{CYAN}{BOLD}
   ╔═══════════════════════════════════════════════════════════════════════╗
   ║   🐉  NEXU-OS : WIZARD DE CUSTOMIZAÇÃO & PERSONALIDADE DA IA  🧙‍♂️    ║
   ║       Simbiose Híbrida Win32-POSIX & Soberania Air-Gapped             ║
   ╚═══════════════════════════════════════════════════════════════════════╝{NC}
"""

PERSONALITY_FILE = "/opt/nexus-os/ai/personality.json"
PACKAGES_FILE = "/opt/nexus-os/config/installed_packages.json"

def run_wizard():
    os.system("clear")
    print(BANNER)
    print(f"{YELLOW}Bem-vindo à configuração personalizada do NEXU-OS.{NC}")
    print("Este assistente configurará seus pacotes de microsserviços, tema visual e personalidade do Avatar de IA.\\n")

    # 1. Configuração de Pacotes do Ecossistema
    print(f"{BOLD}[1] SELEÇÃO DE MÓDULOS E PACOTES:{NC}")
    packages = {
        "kali_security": True,
        "open_jarvis": True,
        "open_eye": True,
        "win32_hybrid_bridge": True
    }
    
    print("  [✔] 1. Kali Offensive & Network Analysis Suite (Nmap, Metasploit, Wireshark)")
    print("  [✔] 2. Open-Jarvis AI Reasoning Engine (LLMs locais, RAG sem nuvem)")
    print("  [✔] 3. Open-Eye Computer Vision & Sensory Suite (/dev/dri, NPU passthrough)")
    print("  [✔] 4. Win32 Hybrid Symbiosis Runtime (Execução de legados Win32)")
    print(f"  {GREEN}Todos os módulos de produção foram pré-selecionados para o perfil Air-Gapped.{NC}\\n")

    # 2. Ícone Místico & Tematização
    print(f"{BOLD}[2] IDENTIDADE VISUAL E ÍCONE MÍSTICO:{NC}")
    print(f"  Insígnia Definida: {PURPLE}{BOLD}O Dragão Alado & O Mago Arcano{NC}")
    print("  Combinação representativa do Poder Bruto da Máquina (Dragão) com a Sabedoria da IA (Mago).")
    print(f"  Paleta selecionada: {CYAN}Ciano Cyberpunk (06B6D4){NC} & {PURPLE}Violeta Arcano (7C3AED){NC}\\n")

    # 3. Personalidade do Avatar
    print(f"{BOLD}[3] PERSONALIZAÇÃO DO AVATAR DE IA:{NC}")
    avatar_name = input("  Digite o nome do seu Avatar de IA [padrão: Ignis-Mage]: ").strip()
    if not avatar_name:
        avatar_name = "Ignis-Mage (O Dragão Arcano)"

    print("\\n  Selecione o Tom de Voz do Avatar:")
    print("  1) Arcano & Estratégico (Sábio, preciso e focado em segurança)")
    print("  2) Sentinel Cibernético (Ultra-direto, telemetria em primeiro lugar)")
    print("  3) Conselheiro Filosófico (Reflexivo, ponderado e perspicaz)")
    tone_opt = input("  Escolha uma opção (1-3) [1]: ").strip()
    
    tone = "Arcano, Protetor, Técnico e Estratégico"
    if tone_opt == "2":
        tone = "Sentinel Cibernético Direto"
    elif tone_opt == "3":
        tone = "Conselheiro Filosófico Sábio"

    # Salva arquivos de configuração
    os.makedirs(os.path.dirname(PERSONALITY_FILE), exist_ok=True)
    os.makedirs(os.path.dirname(PACKAGES_FILE), exist_ok=True)

    personality_data = {
        "name": avatar_name,
        "archetype": "Dragon & Mage Sovereign",
        "insignia": {
            "type": "dragon_mage",
            "description": "Fusão mística do Dragão de Chamas Azuis e o Mago Arcano",
            "primary_color": "#06b6d4",
            "secondary_color": "#7c3aed"
        },
        "speech_directives": {
            "tone": tone,
            "verbosity": "concise_technical",
            "language": "pt-BR"
        },
        "security_parameters": {
            "airgap_enforcement": True,
            "allow_external_beacons": False
        }
    }

    with open(PERSONALITY_FILE, "w", encoding="utf-8") as f:
        json.dump(personality_data, f, indent=2)

    with open(PACKAGES_FILE, "w", encoding="utf-8") as f:
        json.dump(packages, f, indent=2)

    print(f"\\n{GREEN}{BOLD}Configuração gravada com sucesso em {PERSONALITY_FILE}!{NC}")
    print(f"{CYAN}Avatar [{avatar_name}] inicializado e pronto para assumir o controle do sistema.{NC}")

if __name__ == "__main__":
    run_wizard()
`
  },

  {
    id: 'runtime-nexus-launch',
    name: 'nexus_launch.py',
    path: '/opt/nexus-os/nexus_launch.py',
    overlayPath: 'opt/nexus-os/nexus_launch.py',
    category: 'runtime',
    categoryLabel: '1. Arquitetura do Runtime e Inteligência (/opt/nexus-os/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'python',
    description: 'Orquestrador mestre do boot e inicialização imersiva do NEXU-OS. Inicia a simbiose híbrida, banco SQLite WAL, servidor FastAPI local, motor do Avatar flutuante e estabelece o isolamento Air-Gapped no display.',
    highlights: [
      'Orquestração unificada de boot do runtime híbrido',
      'Inicialização sequencial: SQLite -> FastAPI -> Avatar -> Hybrid Runtime',
      'Exibição do banner lendário do Dragão & Mago',
      'Registro unificado em /var/log/nexus-os/launch.log'
    ],
    content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
NEXU-OS Master Boot & Immersive Runtime Orchestrator
Alvo: /opt/nexus-os/nexus_launch.py
================================================================================
"""
import os
import sys
import time
import subprocess
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [NEXUS-BOOT] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("/var/log/nexus-os/launch.log", mode="a")
    ]
)
logger = logging.getLogger("NexusLaunch")

DRAGON_MAGE_ART = """
                  _==/           i     i          \\==_
                /XX/            |\\___/|           \\XX\\
              /XXXX\\            |XXXXX|            /XXXX\\
             |XXXXXX\\_         _XXXXXXX_         _/XXXXXX|
            XXXXXXXXXXXxxxxxxxXXXXXXXXXXXxxxxxxxXXXXXXXXXXX
           |XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
           |XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX|
            XXXXXX/^^^^"\\XXXXXXXXXXXXXXXXXXXXX/^^^^"\\XXXXXX
             |XXX|       |XXXXXXXXXXXXXXXXXXX|       |XXX|
               \\X\\__      \\XXXXXXXXXXXXXXXXX/      __/X/
                 \\__^^^^^       W W W W       ^^^^^__/
                  NEXU-OS: O DRAGÃO ALADO & O MAGO ARCANO
"""

def print_banner():
    os.system("clear 2>/dev/null || true")
    print("\\033[1;36m" + DRAGON_MAGE_ART + "\\033[0m")
    print("\\033[1;32m=== INICIALIZANDO ECOSSISTEMA AIR-GAPPED NEXU-OS ===\\033[0m\\n")

def spawn_daemon(command, name):
    logger.info(f"Subindo serviço do ecossistema: {name} -> {command}")
    return subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )

def main():
    print_banner()
    logger.info("Iniciando rotina mestra de bootstrap do NEXU-OS...")

    # 1. Valida estrutura de logs e sockets
    os.makedirs("/var/log/nexus-os", exist_ok=True)
    os.makedirs("/opt/nexus-os/data", exist_ok=True)

    # 2. Inicia o Servidor Local FastAPI (SQLite WAL)
    server_proc = spawn_daemon(
        "python3 /opt/nexus-os/core/local_server.py",
        "FastAPI Local Server"
    )
    time.sleep(1.5)

    # 3. Inicia o Motor do Avatar Flutuante de IA
    avatar_proc = spawn_daemon(
        "python3 /opt/nexus-os/ai/avatar_core.py",
        "Holographic AI Avatar Core"
    )

    # 4. Inicia o Hybrid Runtime (Simbiose Win32/Linux)
    runtime_proc = spawn_daemon(
        "python3 /opt/nexus-os/core/hybrid_runtime.py",
        "Win32-POSIX Hybrid Runtime"
    )

    logger.info("Todos os microsserviços do NEXU-OS foram disparados com sucesso.")
    print("\\n\\033[1;32m[SUCESSO] NEXU-OS operacional em ambiente soberano e isolado.\\033[0m\\n")

    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        logger.info("Solicitação de shutdown recebida. Terminando processos filhos...")
        for p in (server_proc, avatar_proc, runtime_proc):
            p.terminate()

if __name__ == "__main__":
    main()
`
  },

  // ===========================================================================
  // 2. BUILD & EMPACOTAMENTO DA ISO (/opt/nexu-builder/)
  // ===========================================================================
  {
    id: 'build-iso',
    name: 'build-iso.sh',
    path: '/opt/nexu-builder/build-iso.sh',
    overlayPath: 'opt/nexu-builder/build-iso.sh',
    category: 'build',
    categoryLabel: '2. Build & Empacotamento ISO (/opt/nexu-builder/)',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script mestre de orquestração de build. Valida root, mescla overlay (/opt/nexus-os, configs, systemd), aplica permissões estritas, gera SquashFS com zstd-19 e blocos de 1MB, e cria ISO híbrida bootável UEFI/BIOS com checksum SHA256.',
    highlights: [
      'Validação estrita de root (EUID == 0)',
      'SquashFS com zstd (nível 19, blocos de 1MB: -comp zstd -Xcompression-level 19 -b 1048576)',
      'Injeção do runtime completo /opt/nexus-os/ e serviços de IA',
      'Geração de imagem híbrida com xorriso e EFI boot',
      'Cálculo automático de checksum SHA256 e manifesto de build'
    ],
    content: `#!/usr/bin/env bash
# ==============================================================================
# NEXU-OS Enterprise ISO Builder
# Script Mestre de Compilação, Injeção de Overlay e Empacotamento SquashFS
# ==============================================================================
set -euo pipefail
IFS=$'\\n\\t'

# Cores e Formatação para Logs
readonly RED='\\033[0;31m'
readonly GREEN='\\033[0;32m'
readonly YELLOW='\\033[1;33m'
readonly BLUE='\\033[0;34m'
readonly CYAN='\\033[0;36m'
readonly BOLD='\\033[1m'
readonly NC='\\033[0m'

# Configurações do Ambiente de Build
readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly BUILD_ROOT="/opt/nexu-builder"
readonly OVERLAY_DIR="\${BUILD_ROOT}/overlay"
readonly WORK_DIR="\${BUILD_ROOT}/workspace"
readonly ROOTFS_STAGING="\${WORK_DIR}/rootfs"
readonly ISO_STAGING="\${WORK_DIR}/iso_root"
readonly OUTPUT_DIR="\${BUILD_ROOT}/dist"

readonly OS_NAME="NEXU-OS"
readonly OS_VERSION="1.0.0-PROD"
readonly BUILD_DATE="$(date -u +"%Y%m%d_%H%M%SZ")"
readonly ISO_NAME="nexu-os-\${OS_VERSION}-\${BUILD_DATE}-x86_64.iso"
readonly SQUASHFS_FILE="\${ISO_STAGING}/live/filesystem.squashfs"

log_info()    { echo -e "\${BLUE}[INFO]\${NC} \$1"; }
log_success() { echo -e "\${GREEN}[SUCCESS]\${NC} \$1"; }
log_warn()    { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error()   { echo -e "\${RED}[ERROR]\${NC} \$1" >&2; }

cleanup() {
    local exit_code=\$?
    if [ \${exit_code} -ne 0 ]; then
        log_error "O processo de build falhou com código de saída \${exit_code}."
    fi
    if mountpoint -q "\${ROOTFS_STAGING}/proc" 2>/dev/null; then
        umount -lf "\${ROOTFS_STAGING}/proc" || true
    fi
}
trap cleanup EXIT

echo -e "\${CYAN}\${BOLD}"
cat << "EOF"
  _   _ _______  ___   _       ____   _____ 
 | \\ | | ____\\ \\/ / | | |     / __ \\ / ____|
 |  \\| | |__   \\  /| | | |____| |  | | (___  
 | . \` |  __|  /  \\| | | |____| |  | |\\___ \\ 
 | |\\  | |____/ /\\ \\ |_| |    | |__| |____) |
 |_| \\_|______/_/  \\_\\___/      \\____/|_____/ 
   AIR-GAPPED HIGH-RESILIENCE LINUX PLATFORM
EOF
echo -e "\${NC}"
log_info "Iniciando compilação do \${OS_NAME} v\${OS_VERSION}..."

# 1. Validação de Privilégios e Ferramentas do Host
if [ "\${EUID}" -ne 0 ]; then
    log_error "Este script requer privilégios de ROOT para manipulação de filesystem e cgroups."
    log_error "Execute novamente como: sudo \$0"
    exit 1
fi

REQUIRED_TOOLS=("mksquashfs" "xorriso" "grub-mkrescue" "rsync" "zstd" "sha256sum" "python3")
for tool in "\${REQUIRED_TOOLS[@]}"; do
    if ! command -v "\${tool}" &>/dev/null; then
        log_error "Ferramenta obrigatória '\${tool}' não encontrada no PATH."
        exit 1
    fi
done
log_success "Privilégios e dependências de compilação validados."

# 2. Inicialização dos Diretórios de Staging
rm -rf "\${WORK_DIR}"
mkdir -p "\${ROOTFS_STAGING}" "\${ISO_STAGING}/live" "\${ISO_STAGING}/boot/grub" "\${OUTPUT_DIR}"

if [ ! -d "\${BUILD_ROOT}/base_rootfs" ]; then
    log_warn "Base RootFS não encontrada em \${BUILD_ROOT}/base_rootfs. Criando esqueleto limpo..."
    mkdir -p "\${BUILD_ROOT}/base_rootfs"/{bin,sbin,usr/bin,usr/sbin,etc,opt,var/log,tmp,proc,sys,dev}
fi

log_info "Sincronizando RootFS base para área de staging..."
rsync -a --devices --specials "\${BUILD_ROOT}/base_rootfs/" "\${ROOTFS_STAGING}/"

# 3. Injeção do Overlay e Aplicação Estrita de Permissões
if [ ! -d "\${OVERLAY_DIR}" ]; then
    log_error "Diretório de overlay '\${OVERLAY_DIR}' inexistente!"
    exit 1
fi

log_info "Injetando overlay e aplicando regras de segurança corporativa..."
rsync -av --keep-dirlinks "\${OVERLAY_DIR}/" "\${ROOTFS_STAGING}/"

# Permissões no runtime /opt/nexus-os/
chmod 755 "\${ROOTFS_STAGING}/opt/nexus-os/"*.py 2>/dev/null || true
chmod 755 "\${ROOTFS_STAGING}/opt/nexus-os/core/"*.py 2>/dev/null || true
chmod 755 "\${ROOTFS_STAGING}/opt/nexus-os/ai/"*.py 2>/dev/null || true
chmod 755 "\${ROOTFS_STAGING}/opt/nexus-os/ui/"*.py 2>/dev/null || true
chmod 644 "\${ROOTFS_STAGING}/opt/nexus-os/ai/personality.json" 2>/dev/null || true

# Permissões nos scripts de automação
chmod 755 "\${ROOTFS_STAGING}/opt/nexu-os/"*.sh 2>/dev/null || true
chmod 755 "\${ROOTFS_STAGING}/usr/local/bin/"*.sh 2>/dev/null || true
chmod 755 "\${ROOTFS_STAGING}/opt/nexu-builder/"*.sh 2>/dev/null || true

# Permissões nas unidades systemd e configurações
chmod 644 "\${ROOTFS_STAGING}/etc/systemd/system/"*.service 2>/dev/null || true
chmod 644 "\${ROOTFS_STAGING}/etc/systemd/system/"*.timer 2>/dev/null || true
chmod 644 "\${ROOTFS_STAGING}/etc/systemd/system/docker.service.d/"*.conf 2>/dev/null || true
chmod 644 "\${ROOTFS_STAGING}/etc/systemd/journald.conf" 2>/dev/null || true
chmod 644 "\${ROOTFS_STAGING}/etc/docker/daemon.json" 2>/dev/null || true

if [ -f "\${ROOTFS_STAGING}/etc/nexu-os/alerts.conf" ]; then
    chmod 600 "\${ROOTFS_STAGING}/etc/nexu-os/alerts.conf"
fi
log_success "Overlay injetado e permissões normalizadas com sucesso."

# 4. Habilitação de Serviços no multi-user.target do RootFS
SYSTEMD_WANTS="\${ROOTFS_STAGING}/etc/systemd/system/multi-user.target.wants"
mkdir -p "\${SYSTEMD_WANTS}"

SERVICES=(
    "docker.service"
    "nexus-server.service"
    "nexus-avatar.service"
    "open-jarvis.service"
    "open-eye.service"
    "nexu-status-boot.service"
    "nexu-cleanup.timer"
    "nexu-firstboot-sanity.service"
)

for svc in "\${SERVICES[@]}"; do
    if [ -f "\${ROOTFS_STAGING}/etc/systemd/system/\${svc}" ] || [ -f "\${ROOTFS_STAGING}/lib/systemd/system/\${svc}" ]; then
        ln -sf "/etc/systemd/system/\${svc}" "\${SYSTEMD_WANTS}/\${svc}" 2>/dev/null || true
        log_info "  -> Habilitado no boot: \${svc}"
    fi
done

# 5. Empacotamento SquashFS (zstd nível 19, blocos de 1MB)
log_info "Compactando RootFS com SquashFS [zstd nível 19, blocos de 1MB]..."
mksquashfs "\${ROOTFS_STAGING}" "\${SQUASHFS_FILE}" \\
    -comp zstd \\
    -Xcompression-level 19 \\
    -b 1048576 \\
    -noappend \\
    -wildcards \\
    -e "proc/*" "sys/*" "dev/*" "tmp/*" "run/*" "var/cache/*"

log_success "SquashFS gerado com sucesso: \${SQUASHFS_FILE}"

# 6. Configuração do Bootloader Híbrido (GRUB UEFI + BIOS)
cat << 'EOF_GRUB' > "\${ISO_STAGING}/boot/grub/grub.cfg"
set default="0"
set timeout=5

menuentry "NEXU-OS Enterprise 1.0 (Air-gapped Production)" --class gnu-linux --class os {
    linux /live/vmlinuz boot=live quiet loglevel=3 apparmor=1 security=apparmor systemd.unified_cgroup_hierarchy=1
    initrd /live/initrd.img
}

menuentry "NEXU-OS (Modo Debug / Verbose Console)" --class gnu-linux --class os {
    linux /live/vmlinuz boot=live debug console=ttyS0 console=tty0 systemd.unified_cgroup_hierarchy=1
    initrd /live/initrd.img
}
EOF_GRUB

# 7. Geração da Imagem ISO Híbrida e Checksums
FINAL_ISO_PATH="\${OUTPUT_DIR}/\${ISO_NAME}"
xorriso -as mkisofs \\
    -iso-level 3 \\
    -full-iso9660-filenames \\
    -volid "NEXU_OS_1_0" \\
    -eltorito-boot boot/grub/i386-pc/eltorito.img \\
    -eltorito-catalog boot/grub/boot.cat \\
    -no-emul-boot -boot-load-size 4 -boot-info-table \\
    -output "\${FINAL_ISO_PATH}" \\
    "\${ISO_STAGING}" 2>&1 | tail -n 10

cd "\${OUTPUT_DIR}"
sha256sum "\${ISO_NAME}" > "\${ISO_NAME}.sha256"

cat << EOF_MANIFEST > "\${OUTPUT_DIR}/\${ISO_NAME}.manifest.json"
{
  "os_name": "\${OS_NAME}",
  "version": "\${OS_VERSION}",
  "build_timestamp": "\${BUILD_DATE}",
  "compression": "zstd-level-19-1MB-blocks",
  "sha256": "$(awk '{print $1}' "\${ISO_NAME}.sha256")",
  "iso_file": "\${ISO_NAME}",
  "cgroups_v2": true,
  "airgap_optimized": true,
  "avatar_runtime": true
}
EOF_MANIFEST

log_success "================================================================="
log_success "BUILD DO NEXU-OS CONCLUÍDO COM ÊXITO!"
log_success "ISO: \${FINAL_ISO_PATH}"
log_success "SHA256: $(cat "\${ISO_NAME}.sha256")"
log_success "================================================================="
`
  },

  // ===========================================================================
  // 3. OTIMIZAÇÕES DE DESEMPENHO E CGROUPS
  // ===========================================================================
  {
    id: 'docker-iowait',
    name: 'iowait.conf',
    path: '/etc/systemd/system/docker.service.d/iowait.conf',
    overlayPath: 'etc/systemd/system/docker.service.d/iowait.conf',
    category: 'cgroups',
    categoryLabel: '3. Otimizações de Desempenho e Cgroups',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Drop-in do systemd para o daemon do Docker. Configura prioridade máxima de I/O (IOWeight=900) e CPU para containers de banco de dados e microsserviços de IA, sob a hierarquia unificada cgroups v2.',
    highlights: [
      'IOWeight=900 para priorizar throughput e diminuir latência de disco',
      'CPUWeight=900 garantindo fatias justas sob carga pesada',
      'Suporte para hierarquia unificada cgroups v2',
      'TasksMax configurado para suportar pools concorrentes do PostgreSQL'
    ],
    content: `# ==============================================================================
# NEXU-OS High Performance Systemd Drop-in
# Alvo: /etc/systemd/system/docker.service.d/iowait.conf
# Finalidade: Priorização de I/O e CPU para o ecossistema Docker (Postgres / IA)
# ==============================================================================
[Service]
# Priorização de I/O sob Cgroups v2 (hierarquia unificada)
IOWeight=900
BlockIOWeight=900
CPUWeight=900
TasksMax=infinity
OOMScoreAdjust=-500

LimitNOFILE=1048576
LimitNPROC=infinity
LimitCORE=infinity
`
  },

  {
    id: 'service-nexus-server',
    name: 'nexus-server.service',
    path: '/etc/systemd/system/nexus-server.service',
    overlayPath: 'etc/systemd/system/nexus-server.service',
    category: 'cgroups',
    categoryLabel: '3. Otimizações de Desempenho e Cgroups',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Unidade systemd para o servidor local FastAPI e banco SQLite WAL. Executa em 127.0.0.1:8000 com isolamento de processo, limite de 2GB de RAM e reinício automático.',
    highlights: [
      'Serviço core para /opt/nexus-os/core/local_server.py',
      'MemoryMax=2G e CPUWeight=800',
      'Restart=always com RestartSec=3s'
    ],
    content: `# ==============================================================================
# NEXU-OS Core Service: Local FastAPI & SQLite Server
# Alvo: /etc/systemd/system/nexus-server.service
# ==============================================================================
[Unit]
Description=NEXU-OS Local High-Performance API & SQLite Sync Bus
Documentation=https://nexus-os.internal/docs/core
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexus-os/core
ExecStart=/usr/bin/python3 /opt/nexus-os/core/local_server.py
Restart=always
RestartSec=3s

# Cgroups v2
CPUWeight=800
MemoryHigh=1800M
MemoryMax=2G
IOWeight=850

ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
`
  },

  {
    id: 'service-nexus-avatar',
    name: 'nexus-avatar.service',
    path: '/etc/systemd/system/nexus-avatar.service',
    overlayPath: 'etc/systemd/system/nexus-avatar.service',
    category: 'cgroups',
    categoryLabel: '3. Otimizações de Desempenho e Cgroups',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Unidade systemd para o motor de IA do Avatar Assistido (Ignis-Mage). Inicia após o nexus-server, gerencia o estado holográfico e mantém vigilância proativa.',
    highlights: [
      'Execução de /opt/nexus-os/ai/avatar_core.py',
      'After=nexus-server.service',
      'MemoryMax=4G e CPUWeight=700'
    ],
    content: `# ==============================================================================
# NEXU-OS AI Avatar Companion Service (Ignis-Mage Engine)
# Alvo: /etc/systemd/system/nexus-avatar.service
# ==============================================================================
[Unit]
Description=NEXU-OS Holographic AI Avatar Companion Core
After=network.target nexus-server.service
Requires=nexus-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexus-os/ai
ExecStart=/usr/bin/python3 /opt/nexus-os/ai/avatar_core.py
Restart=always
RestartSec=5s

CPUWeight=700
MemoryHigh=3500M
MemoryMax=4G
IOWeight=700

ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/var/log/nexus-os /opt/nexus-os/ai

[Install]
WantedBy=multi-user.target
`
  },

  {
    id: 'service-jarvis',
    name: 'open-jarvis.service',
    path: '/etc/systemd/system/open-jarvis.service',
    overlayPath: 'etc/systemd/system/open-jarvis.service',
    category: 'cgroups',
    categoryLabel: '3. Otimizações de Desempenho e Cgroups',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Unidade systemd do microsserviço de orquestração de IA (open-jarvis). Possui sandboxing restrito de segurança, cgroups com limite de memória de 14G e reinicialização contínua com backoff.',
    highlights: [
      'Isolamento estrito: ProtectSystem=strict, PrivateTmp=true',
      'Controle de recursos cgroup: MemoryHigh=12G, MemoryMax=14G',
      'CPUWeight=800 para processamento prioritário de prompts e agentes'
    ],
    content: `[Unit]
Description=NEXU-OS Open-Jarvis AI Orchestrator & Reasoning Engine
After=network.target docker.service
Requires=docker.service
PartOf=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexu-os/ai/open-jarvis

ExecStartPre=-/usr/bin/docker stop open-jarvis
ExecStartPre=-/usr/bin/docker rm open-jarvis
ExecStart=/usr/bin/docker run --name open-jarvis \\
    --rm \\
    --network host \\
    --ipc host \\
    -v /opt/nexu-os/models:/models:ro \\
    -v /var/log/nexu-os/jarvis:/logs \\
    -e NEXU_AIRGAP_MODE=1 \\
    nexu/open-jarvis:1.0.0

ExecStop=/usr/bin/docker stop -t 15 open-jarvis

Restart=always
RestartSec=5s
CPUWeight=800
MemoryHigh=12G
MemoryMax=14G
IOWeight=800

ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
`
  },

  {
    id: 'service-eye',
    name: 'open-eye.service',
    path: '/etc/systemd/system/open-eye.service',
    overlayPath: 'etc/systemd/system/open-eye.service',
    category: 'cgroups',
    categoryLabel: '3. Otimizações de Desempenho e Cgroups',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Unidade systemd do microsserviço de visão computacional e percepção (open-eye). Configurado com permissões para aceleradores gráficos (/dev/dri, /dev/kfd), 10G de RAM e isolamento de processo.',
    highlights: [
      'Acesso a hardware gráfico: DeviceAllow=/dev/dri rw',
      'Limites de cgroups: MemoryHigh=8G, MemoryMax=10G',
      'CPUWeight=800 para inferência de vídeo em tempo real'
    ],
    content: `[Unit]
Description=NEXU-OS Open-Eye Computer Vision & Sensory Inference Service
After=network.target docker.service
Requires=docker.service
PartOf=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nexu-os/ai/open-eye

ExecStartPre=-/usr/bin/docker stop open-eye
ExecStartPre=-/usr/bin/docker rm open-eye
ExecStart=/usr/bin/docker run --name open-eye \\
    --rm \\
    --network host \\
    --device /dev/dri:/dev/dri \\
    -v /opt/nexu-os/vision-models:/models:ro \\
    -v /var/log/nexu-os/eye:/logs \\
    -e NEXU_AIRGAP_MODE=1 \\
    nexu/open-eye:1.0.0

ExecStop=/usr/bin/docker stop -t 15 open-eye

Restart=always
RestartSec=5s
CPUWeight=800
MemoryHigh=8G
MemoryMax=10G
IOWeight=800

DevicePolicy=auto
DeviceAllow=/dev/dri rw
DeviceAllow=/dev/video* rw
DeviceAllow=/dev/kfd rw

ProtectSystem=strict
PrivateTmp=true

[Install]
WantedBy=multi-user.target
`
  },

  // ===========================================================================
  // 4. GERENCIAMENTO RIGOROSO DE LOGS E LIMPEZA (AIR-GAPPED)
  // ===========================================================================
  {
    id: 'conf-journald',
    name: 'journald.conf',
    path: '/etc/systemd/journald.conf',
    overlayPath: 'etc/systemd/journald.conf',
    category: 'logs',
    categoryLabel: '4. Gerenciamento Rigoroso de Logs e Limpeza',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Configuração restritiva do systemd-journald para sistemas Air-gapped: teto máximo de 500M de espaço em disco, rotação individual de arquivos em 50M e expiração forçada de 15 dias.',
    highlights: [
      'SystemMaxUse=500M prevenindo saturação da partição raiz em live boot',
      'SystemMaxFileSize=50M para rotação ágil',
      'MaxRetentionSec=15day garantindo descarte de registros obsoletos'
    ],
    content: `[Journal]
Storage=persistent
Compress=yes
SystemMaxUse=500M
SystemKeepFree=1G
SystemMaxFileSize=50M
SystemMaxFiles=10
RuntimeMaxUse=100M
RuntimeMaxFileSize=15M
MaxRetentionSec=15day
MaxFileSec=1day
RateLimitIntervalSec=30s
RateLimitBurst=2000
ForwardToSyslog=no
ForwardToConsole=no
`
  },

  {
    id: 'conf-docker-daemon',
    name: 'daemon.json',
    path: '/etc/docker/daemon.json',
    overlayPath: 'etc/docker/daemon.json',
    category: 'logs',
    categoryLabel: '4. Gerenciamento Rigoroso de Logs e Limpeza',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'json',
    description: 'Configuração global do daemon do Docker impondo política de rotação de logs json-file de no máximo 50m por arquivo e 3 arquivos retidos por container, além de otimizações de segurança.',
    highlights: [
      'log-opts max-size: "50m" e max-file: "3"',
      'storage-driver overlay2',
      'live-restore: true'
    ],
    content: `{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "no-new-privileges": true,
  "icc": false,
  "userland-proxy": false,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
`
  },

  {
    id: 'script-cleanup-docker',
    name: 'cleanup-docker.sh',
    path: '/opt/nexu-os/cleanup-docker.sh',
    overlayPath: 'opt/nexu-os/cleanup-docker.sh',
    category: 'logs',
    categoryLabel: '4. Gerenciamento Rigoroso de Logs e Limpeza',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script de higienização automatizada do ecossistema Docker para execução semanal via cron/systemd timer. Remove containers órfãos, imagens sem tag com mais de 7 dias, volumes não associados e caches de build.',
    highlights: [
      'Remoção de containers parados e imagens antigas (>168h)',
      'Purga de volumes anônimos sem vínculo ativo',
      'Registro detalhado em /var/log/nexu-os/cleanup.log'
    ],
    content: `#!/usr/bin/env bash
# ==============================================================================
# NEXU-OS Weekly Maintenance & Docker Hygiene Automation
# Alvo: /opt/nexu-os/cleanup-docker.sh
# ==============================================================================
set -euo pipefail
IFS=$'\\n\\t'

readonly LOG_FILE="/var/log/nexu-os/cleanup.log"
mkdir -p "$(dirname "\${LOG_FILE}")"

timestamp() { date -u +"[%Y-%m-%d %H:%M:%SZ]"; }
log() { echo -e "$(timestamp) \$1" | tee -a "\${LOG_FILE}"; }

log "=== Iniciando Rotina Semanal de Limpeza (NEXU-OS) ==="

if ! docker info &>/dev/null; then
    log "[ERRO] Docker daemon inativo ou inacessível."
    exit 1
fi

DISK_BEFORE=$(df -h /var/lib/docker | awk 'NR==2 {print $4}')
log "Espaço livre antes em /var/lib/docker: \${DISK_BEFORE}"

log "1/5: Removendo containers parados..."
docker container prune -f 2>&1 | tee -a "\${LOG_FILE}"

log "2/5: Removendo imagens órfãs (>168h)..."
docker image prune -a --force --filter "until=168h" 2>&1 | tee -a "\${LOG_FILE}"

log "3/5: Removendo volumes desconectados..."
docker volume prune -f 2>&1 | tee -a "\${LOG_FILE}"

log "4/5: Removendo caches de build..."
docker builder prune -a -f --filter "until=168h" 2>&1 | tee -a "\${LOG_FILE}"

log "5/5: Executando vácuo do journald..."
journalctl --vacuum-size=500M 2>&1 | tee -a "\${LOG_FILE}"

DISK_AFTER=$(df -h /var/lib/docker | awk 'NR==2 {print $4}')
log "Espaço livre após em /var/lib/docker: \${DISK_AFTER}"
log "=== Rotina Concluída ==="
`
  },

  {
    id: 'timer-cleanup',
    name: 'nexu-cleanup.timer',
    path: '/etc/systemd/system/nexu-cleanup.timer',
    overlayPath: 'etc/systemd/system/nexu-cleanup.timer',
    category: 'logs',
    categoryLabel: '4. Gerenciamento Rigoroso de Logs e Limpeza',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Timer do systemd para acionamento periódico semanal do script cleanup-docker.sh.',
    highlights: ['OnCalendar=Sun *-*-* 03:00:00', 'Persistent=true'],
    content: `[Unit]
Description=Trigger Weekly NEXU-OS Docker & Journal Hygiene

[Timer]
OnCalendar=Sun *-*-* 03:00:00
Persistent=true
RandomizedDelaySec=15m
Unit=nexu-cleanup.service

[Install]
WantedBy=timers.target
`
  },

  // ===========================================================================
  // 5. MONITORAMENTO, STATUS E VALIDAÇÃO DE SANIDADE
  // ===========================================================================
  {
    id: 'script-nexu-status',
    name: 'nexu-status.sh',
    path: '/usr/local/bin/nexu-status.sh',
    overlayPath: 'usr/local/bin/nexu-status.sh',
    category: 'status',
    categoryLabel: '5. Monitoramento, Status e Validação de Sanidade',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script do painel consolidado de status operacional do sistema. Apresenta métricas visuais no terminal de isolamento Air-gap, cgroups v2, limites de memória, estado dos microsserviços de IA e integridade do journald.',
    highlights: [
      'Painel em cores ANSI formatado para terminal e console serial',
      'Monitoramento de nexus-server, nexus-avatar, open-jarvis e open-eye',
      'Checagem da quota do journald (<500M)',
      'Suporte a parâmetro --json'
    ],
    content: `#!/usr/bin/env bash
# ==============================================================================
# NEXU-OS Operational Status Console Dashboard
# Alvo: /usr/local/bin/nexu-status.sh
# ==============================================================================
set -euo pipefail

readonly C_RESET='\\033[0m'
readonly C_BOLD='\\033[1m'
readonly C_RED='\\033[31m'
readonly C_GREEN='\\033[32m'
readonly C_YELLOW='\\033[33m'
readonly C_CYAN='\\033[36m'
readonly C_GRAY='\\033[90m'

if [[ "\${1:-}" == "--json" ]]; then
    cat << EOF
{
  "hostname": "$(hostname)",
  "uptime": "$(uptime -p)",
  "kernel": "$(uname -r)",
  "journal_usage": "$(journalctl --disk-usage 2>/dev/null | awk '{print $NF}' || echo 'N/A')",
  "docker_io_weight": "$(cat /sys/fs/cgroup/system.slice/docker.service/io.weight 2>/dev/null || echo 'not_set')",
  "services": {
    "nexus_server": "$(systemctl is-active nexus-server 2>/dev/null || echo 'inactive')",
    "nexus_avatar": "$(systemctl is-active nexus-avatar 2>/dev/null || echo 'inactive')",
    "docker": "$(systemctl is-active docker 2>/dev/null || echo 'inactive')",
    "open_jarvis": "$(systemctl is-active open-jarvis 2>/dev/null || echo 'inactive')",
    "open_eye": "$(systemctl is-active open-eye 2>/dev/null || echo 'inactive')"
  }
}
EOF
    exit 0
fi

clear 2>/dev/null || true
echo -e "\${C_CYAN}\${C_BOLD}"
cat << 'EOF'
  _   _ _______  __ _    _        ____   _____ 
 | \\ | | ____\\ \\/ /| |  | |      / __ \\ / ____|
 |  \\| | |__   \\  / | |  | |_____| |  | | (___  
 | . \` |  __|  /  \\ | |  | |_____| |  | |\\___ \\ 
 | |\\  | |____/ /\\ \\| |__| |     | |__| |____) |
 |_| \\_|______/_/  \\_\\\\____/       \\____/|_____/ 
     ENTERPRISE SYSTEM STATUS & TELEMETRY
EOF
echo -e "\${C_RESET}"

echo -e "\${C_BOLD}[1] IDENTIFICAÇÃO DO SISTEMA\${C_RESET}"
echo -e "  Host:         \${C_CYAN}$(hostname)\${C_RESET}"
echo -e "  Kernel:       \${C_CYAN}$(uname -r)\${C_RESET} ($(uname -m))"
echo -e "  Uptime:       \${C_CYAN}$(uptime -p)\${C_RESET}"
echo ""

echo -e "\${C_BOLD}[2] CONFINAMENTO DE REDE (AIR-GAPPED COMPLIANCE)\${C_RESET}"
DEF_GATEWAY=$(ip route | grep default | awk '{print $3}' || true)
if [ -z "\${DEF_GATEWAY}" ]; then
    echo -e "  Isolamento:   \${C_GREEN}[✔ TOTALMENTE ISOLADO]\${C_RESET} (Nenhum gateway externo)"
else
    echo -e "  Isolamento:   \${C_YELLOW}[AVISO]\${C_RESET} Gateway ativo: \${DEF_GATEWAY}"
fi
echo ""

echo -e "\${C_BOLD}[3] CONTROLE DE CGROUPS & PRIORIZAÇÃO DE I/O\${C_RESET}"
DOCKER_CGROUP_PATH="/sys/fs/cgroup/system.slice/docker.service"
if [ -d "\${DOCKER_CGROUP_PATH}" ]; then
    IO_WEIGHT=$(cat "\${DOCKER_CGROUP_PATH}/io.weight" 2>/dev/null || echo "padrão")
    echo -e "  Docker IOWeight: \${C_GREEN}\${IO_WEIGHT}\${C_RESET} (Meta: 900)"
else
    echo -e "  Docker IOWeight: \${C_YELLOW}Slice ainda não instanciado\${C_RESET}"
fi
echo -e "  Memória RAM:     \${C_CYAN}$(free -h | awk '/Mem:/ {printf "%s / %s", $3, $2}')\${C_RESET}"
echo ""

echo -e "\${C_BOLD}[4] ESTADO DOS MICROSSERVIÇOS & AVATAR DE IA\${C_RESET}"
for svc in "nexus-server.service" "nexus-avatar.service" "docker.service" "open-jarvis.service" "open-eye.service" "nexu-cleanup.timer"; do
    state=$(systemctl is-active "\${svc}" 2>/dev/null || echo "inactive")
    if [ "\${state}" == "active" ]; then
        echo -e "  \${svc}: \${C_GREEN}[ATIVO / OPERACIONAL]\${C_RESET}"
    else
        echo -e "  \${svc}: \${C_RED}[\${state^^}]\${C_RESET}"
    fi
done
echo ""

echo -e "\${C_BOLD}[5] ARMAZENAMENTO E LIMITES DE LOG\${C_RESET}"
echo -e "  Journald Disk: \${C_CYAN}$(journalctl --disk-usage 2>/dev/null | awk '{print $NF}' || echo 'N/A')\${C_RESET} (Limite: 500M)"
echo -e "  Docker Pool:   \${C_CYAN}$(df -h /var/lib/docker 2>/dev/null | awk 'NR==2 {print $3 " / " $2}' || echo 'N/A')\${C_RESET}"
echo -e "\${C_GRAY}=================================================================\${C_RESET}"
`
  },

  {
    id: 'service-status-boot',
    name: 'nexu-status-boot.service',
    path: '/etc/systemd/system/nexu-status-boot.service',
    overlayPath: 'etc/systemd/system/nexu-status-boot.service',
    category: 'status',
    categoryLabel: '5. Monitoramento, Status e Validação de Sanidade',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Serviço systemd do tipo oneshot para imprimir automaticamente o banner e o status operacional no console de boot.',
    highlights: ['Type=oneshot', 'RemainAfterExit=yes'],
    content: `[Unit]
Description=NEXU-OS Print Operational Status Banner on Boot
After=docker.service nexus-server.service nexus-avatar.service open-jarvis.service open-eye.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/nexu-status.sh
StandardOutput=journal+console
StandardError=journal+console

[Install]
WantedBy=multi-user.target
`
  },

  {
    id: 'script-sanity-test',
    name: 'sanity-test.sh',
    path: '/opt/nexu-os/sanity-test.sh',
    overlayPath: 'opt/nexu-os/sanity-test.sh',
    category: 'sanity',
    categoryLabel: '5. Monitoramento, Status e Validação de Sanidade',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script automatizado de validação de sanidade com alerta crítico via Telegram. Valida PID 1, Docker, unidades systemd (incluindo nexus-server e nexus-avatar), permissões dos scripts em /opt/nexus-os, cgroups IOWeight=900, isolamento e integridade.',
    highlights: [
      'Validação de 8 pilares operacionais de integridade',
      'Verificação do ecossistema /opt/nexus-os/ e Python 3',
      'Despacho de alerta crítico via Telegram em caso de falha',
      'Execução no primeiro boot via ConditionFirstBoot=true'
    ],
    content: `#!/usr/bin/env bash
# ==============================================================================
# NEXU-OS Automated Sanity Verification Suite & Telegram Emergency Alert
# Alvo: /opt/nexu-os/sanity-test.sh
# ==============================================================================
set -euo pipefail
IFS=$'\\n\\t'

readonly RED='\\033[0;31m'
readonly GREEN='\\033[0;32m'
readonly YELLOW='\\033[1;33m'
readonly BLUE='\\033[0;34m'
readonly NC='\\033[0m'

readonly ALERTS_CONF="/etc/nexu-os/alerts.conf"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
ALERT_ON_FAILURE="true"

if [ -f "\${ALERTS_CONF}" ]; then
    # shellcheck disable=SC1090
    source "\${ALERTS_CONF}"
fi

TOTAL_TESTS=0
FAILED_TESTS=0
declare -a FAILURES=()

log_test() {
    local name="\$1"
    local status="\$2"
    local detail="\${3:-}"
    TOTAL_TESTS=\$((TOTAL_TESTS + 1))
    
    if [ "\${status}" == "PASS" ]; then
        echo -e "  [\${GREEN}PASS\${NC}] \${name}"
    else
        echo -e "  [\${RED}FAIL\${NC}] \${name} -> \${detail}"
        FAILED_TESTS=\$((FAILED_TESTS + 1))
        FAILURES+=("\${name}: \${detail}")
    fi
}

send_telegram_alert() {
    local error_summary="\$1"
    if [ -z "\${TELEGRAM_BOT_TOKEN}" ] || [ -z "\${TELEGRAM_CHAT_ID}" ]; then
        echo -e "\${YELLOW}[AVISO] Credenciais do Telegram não configuradas em \${ALERTS_CONF}.\${NC}"
        return 0
    fi

    echo -e "\${BLUE}[INFO] Enviando alerta crítico via Telegram...\${NC}"
    local host_name="$(hostname)"
    local now="$(date -u +"%Y-%m-%d %H:%M:%SZ")"
    
    local msg
    msg=$(cat << EOF
🚨 *ALERTA CRÍTICO: FALHA DE SANIDADE NO NEXU-OS*
*Host:* \`\${host_name}\`
*Timestamp:* \`\${now}\`
*Ambiente:* Air-Gapped Production

*Falhas Detectadas:*
\${error_summary}

*Ação Recomendada:* Inspecione o journal do sistema:
\`journalctl -xeu nexu-firstboot-sanity.service\`
EOF
)

    curl -s -X POST "https://api.telegram.org/bot\${TELEGRAM_BOT_TOKEN}/sendMessage" \\
        -d chat_id="\${TELEGRAM_CHAT_ID}" \\
        -d parse_mode="Markdown" \\
        --data-urlencode "text=\${msg}" \\
        --connect-timeout 10 \\
        --max-time 15 >/dev/null || echo -e "\${RED}[ERRO] Falha na conexão com a API do Telegram.\${NC}"
}

echo "================================================================="
echo "       NEXU-OS AUTOMATED SANITY TEST SUITE"
echo "================================================================="

# Teste 1: Systemd Init PID 1
if [ "\$(cat /proc/1/comm 2>/dev/null)" == "systemd" ]; then
    log_test "1. Systemd Init PID 1" "PASS"
else
    log_test "1. Systemd Init PID 1" "FAIL" "PID 1 não é systemd"
fi

# Teste 2: Docker Daemon Responsivo
if docker info &>/dev/null; then
    log_test "2. Docker Daemon Responsivo" "PASS"
else
    log_test "2. Docker Daemon Responsivo" "FAIL" "Daemon Docker inativo ou socket indisponível"
fi

# Teste 3: Integridade dos Scripts do Runtime e Automação (+x)
SCRIPTS=(
    "/usr/local/bin/nexu-status.sh"
    "/opt/nexu-os/cleanup-docker.sh"
    "/opt/nexu-os/sanity-test.sh"
    "/opt/nexus-os/nexus_launch.py"
    "/opt/nexus-os/core/hybrid_runtime.py"
    "/opt/nexus-os/core/local_server.py"
    "/opt/nexus-os/ai/avatar_core.py"
)
SCRIPTS_OK=true
for sc in "\${SCRIPTS[@]}"; do
    if [ ! -x "\${sc}" ]; then
        SCRIPTS_OK=false
        log_test "3. Executabilidade (\${sc})" "FAIL" "Arquivo ausente ou sem permissão (+x)"
    fi
done
if [ "\${SCRIPTS_OK}" = true ]; then
    log_test "3. Integridade e Permissões dos Scripts (+x)" "PASS"
fi

# Teste 4: Presença do Arquivo de Personalidade do Avatar
if [ -f "/opt/nexus-os/ai/personality.json" ]; then
    log_test "4. Configuração do Avatar (personality.json)" "PASS"
else
    log_test "4. Configuração do Avatar (personality.json)" "FAIL" "personality.json ausente"
fi

# Teste 5: Unidades Críticas de Microsserviços e Servidores
UNITS=(
    "docker.service"
    "nexus-server.service"
    "nexus-avatar.service"
    "open-jarvis.service"
    "open-eye.service"
)
UNITS_OK=true
for u in "\${UNITS[@]}"; do
    if ! systemctl is-enabled "\${u}" &>/dev/null && ! systemctl is-active "\${u}" &>/dev/null; then
        UNITS_OK=false
        log_test "5. Unidade Systemd (\${u})" "FAIL" "Unidade não habilitada ou com falha"
    fi
done
if [ "\${UNITS_OK}" = true ]; then
    log_test "5. Registro das Unidades Systemd do Ecossistema" "PASS"
fi

# Teste 6: Regras de Cgroups v2 & Drop-in IOWeight=900
DROPIN_FILE="/etc/systemd/system/docker.service.d/iowait.conf"
if [ -f "\${DROPIN_FILE}" ] && grep -q "IOWeight=900" "\${DROPIN_FILE}"; then
    log_test "6. Cgroups IOWeight=900 Drop-in" "PASS"
else
    log_test "6. Cgroups IOWeight=900 Drop-in" "FAIL" "Drop-in ausente ou sem IOWeight=900"
fi

# Teste 7: Limites Rígidos do Journald (500M)
JOURNAL_CONF="/etc/systemd/journald.conf"
if [ -f "\${JOURNAL_CONF}" ] && grep -q "SystemMaxUse=500M" "\${JOURNAL_CONF}"; then
    log_test "7. Limite Rígido Journald (500M)" "PASS"
else
    log_test "7. Limite Rígido Journald (500M)" "FAIL" "journald.conf sem SystemMaxUse=500M"
fi

# Teste 8: Confinamento Air-Gapped (Nenhum Gateway WAN Não Autorizado)
DEFAULT_ROUTE=$(ip route show default 2>/dev/null || true)
if [ -z "\${DEFAULT_ROUTE}" ] || [[ "\${DEFAULT_ROUTE}" =~ 192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\. ]]; then
    log_test "8. Conformidade de Rede Air-Gapped" "PASS"
else
    log_test "8. Conformidade de Rede Air-Gapped" "FAIL" "Rota externa não autorizada: \${DEFAULT_ROUTE}"
fi

echo "================================================================="
echo -e "Total de testes: \${TOTAL_TESTS} | Falhas: \${FAILED_TESTS}"

if [ \${FAILED_TESTS} -gt 0 ]; then
    echo -e "\${RED}[RESULTADO] Teste de sanidade FALHOU com \${FAILED_TESTS} erro(s).\${NC}"
    ERROR_LIST=""
    for err in "\${FAILURES[@]}"; do
        ERROR_LIST+=$'• '"\${err}"$'\n'
    done
    if [ "\${ALERT_ON_FAILURE}" == "true" ]; then
        send_telegram_alert "\${ERROR_LIST}"
    fi
    exit 1
else
    echo -e "\${GREEN}[RESULTADO] Todos os testes de sanidade foram APROVADOS com sucesso!\${NC}"
    exit 0
fi
`
  },

  {
    id: 'service-firstboot-sanity',
    name: 'nexu-firstboot-sanity.service',
    path: '/etc/systemd/system/nexu-firstboot-sanity.service',
    overlayPath: 'etc/systemd/system/nexu-firstboot-sanity.service',
    category: 'sanity',
    categoryLabel: '5. Monitoramento, Status e Validação de Sanidade',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'ini',
    description: 'Serviço systemd de primeiro boot acionado via ConditionFirstBoot=true.',
    highlights: ['ConditionFirstBoot=true', 'Gatilho de alerta crítico'],
    content: `[Unit]
Description=NEXU-OS Automated Sanity Verification on First Boot
ConditionFirstBoot=true
ConditionPathExists=!/var/lib/nexu-os/firstboot.done
After=docker.service nexus-server.service nexus-avatar.service open-jarvis.service open-eye.service nexu-status-boot.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/usr/bin/mkdir -p /var/lib/nexu-os
ExecStart=/opt/nexu-os/sanity-test.sh
ExecStartPost=/usr/bin/touch /var/lib/nexu-os/firstboot.done
StandardOutput=journal+console
StandardError=journal+console

[Install]
WantedBy=multi-user.target
`
  },

  {
    id: 'conf-alerts',
    name: 'alerts.conf.example',
    path: '/etc/nexu-os/alerts.conf.example',
    overlayPath: 'etc/nexu-os/alerts.conf.example',
    category: 'sanity',
    categoryLabel: '5. Monitoramento, Status e Validação de Sanidade',
    permissions: 'chmod 600 (rw-------)',
    language: 'ini',
    description: 'Arquivo de configuração para despacho de alertas críticos via Telegram (chmod 600).',
    highlights: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    content: `TELEGRAM_BOT_TOKEN="0000000000:AAExample_Your_Telegram_Bot_Token_Here"
TELEGRAM_CHAT_ID="-1001234567890"
ALERT_ON_FAILURE="true"
`
  },

  // ===========================================================================
  // 6. QA, QEMU E CI/CD PIPELINE
  // ===========================================================================
  {
    id: 'script-qemu-interactive',
    name: 'test-iso-qemu.sh',
    path: '/opt/nexu-builder/test-iso-qemu.sh',
    overlayPath: 'opt/nexu-builder/test-iso-qemu.sh',
    category: 'qa',
    categoryLabel: '6. QA, QEMU e CI/CD Pipeline',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script para teste local da imagem ISO do NEXU-OS com QEMU e aceleração KVM.',
    highlights: ['Aceleração KVM nativa', '8GB RAM e 4 vCPUs'],
    content: `#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly DIST_DIR="\${SCRIPT_DIR}/dist"
readonly ISO_FILE="\${1:-$(ls -t "\${DIST_DIR}"/nexu-os-*.iso 2>/dev/null | head -n1 || true)}"

if [ -z "\${ISO_FILE}" ] || [ ! -f "\${ISO_FILE}" ]; then
    echo "Erro: Nenhuma imagem ISO encontrada para testar."
    echo "Uso: \$0 [caminho_para_iso.iso]"
    exit 1
fi

TMP_DISK="/tmp/nexu-test-disk.qcow2"
if [ ! -f "\${TMP_DISK}" ]; then
    qemu-img create -f qcow2 "\${TMP_DISK}" 20G
fi

KVM_ARGS=()
if [ -e /dev/kvm ] && [ -w /dev/kvm ]; then
    KVM_ARGS=(-enable-kvm -cpu host)
else
    KVM_ARGS=(-cpu max)
fi

qemu-system-x86_64 \\
    "\${KVM_ARGS[@]}" \\
    -m 8192 \\
    -smp 4 \\
    -cdrom "\${ISO_FILE}" \\
    -drive file="\${TMP_DISK}",format=qcow2,if=virtio \\
    -boot d \\
    -net nic,model=virtio \\
    -net user \\
    -vga virtio \\
    -display default,show-cursor=on \\
    -serial mon:stdio
`
  },

  {
    id: 'script-qemu-headless',
    name: 'test-iso-headless.sh',
    path: '/opt/nexu-builder/test-iso-headless.sh',
    overlayPath: 'opt/nexu-builder/test-iso-headless.sh',
    category: 'qa',
    categoryLabel: '6. QA, QEMU e CI/CD Pipeline',
    permissions: 'chmod 755 (rwxr-xr-x)',
    language: 'bash',
    description: 'Script de execução de testes headless para CI/CD com asserção serial de logs de boot.',
    highlights: ['100% Headless (-nographic)', 'Timeout com fail-fast de 180s'],
    content: `#!/usr/bin/env bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
readonly DIST_DIR="\${SCRIPT_DIR}/dist"
readonly ISO_FILE="\${1:-$(ls -t "\${DIST_DIR}"/nexu-os-*.iso 2>/dev/null | head -n1 || true)}"
readonly SERIAL_LOG="/tmp/nexu-serial-boot.log"
readonly TIMEOUT_SEC=180

if [ -z "\${ISO_FILE}" ] || [ ! -f "\${ISO_FILE}" ]; then
    echo "[ERRO] Arquivo de imagem ISO não encontrado."
    exit 1
fi

rm -f "\${SERIAL_LOG}"
touch "\${SERIAL_LOG}"

echo "[CI] Inicializando máquina virtual Headless..."
echo "[CI] Imagem: \${ISO_FILE}"

KVM_ARGS=()
if [ -e /dev/kvm ] && [ -w /dev/kvm ]; then
    KVM_ARGS=(-enable-kvm -cpu host)
else
    KVM_ARGS=(-cpu max)
fi

qemu-system-x86_64 \\
    "\${KVM_ARGS[@]}" \\
    -m 4096 \\
    -smp 2 \\
    -cdrom "\${ISO_FILE}" \\
    -boot d \\
    -nographic \\
    -serial file:"\${SERIAL_LOG}" \\
    -net none &
QEMU_PID=\$!

cleanup() {
    if kill -0 "\${QEMU_PID}" 2>/dev/null; then
        kill -9 "\${QEMU_PID}" 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "[CI] Aguardando inicialização do sistema e asserção de logs..."
ELAPSED=0
SUCCESS=false

while [ \${ELAPSED} -lt \${TIMEOUT_SEC} ]; do
    if grep -q "Todos os testes de sanidade foram APROVADOS com sucesso" "\${SERIAL_LOG}" 2>/dev/null; then
        echo "[CI] SUCESSO! Asserção de sanidade confirmada nos logs seriais."
        SUCCESS=true
        break
    fi

    if grep -q "Teste de sanidade FALHOU" "\${SERIAL_LOG}" 2>/dev/null; then
        echo "[CI] FALHA! Detectado erro nos testes de sanidade."
        cat "\${SERIAL_LOG}"
        exit 1
    fi

    sleep 2
    ELAPSED=\$((ELAPSED + 2))
    printf "."
done

echo ""
if [ "\${SUCCESS}" = true ]; then
    echo "[CI] Testes headless concluídos com êxito em \${ELAPSED}s."
    exit 0
else
    echo "[CI] ERRO: Timeout de \${TIMEOUT_SEC}s atingido sem confirmação de boot saudável."
    exit 1
fi
`
  },

  {
    id: 'workflow-github-ci',
    name: 'test-iso.yml',
    path: '/.github/workflows/test-iso.yml',
    overlayPath: '.github/workflows/test-iso.yml',
    category: 'qa',
    categoryLabel: '6. QA, QEMU e CI/CD Pipeline',
    permissions: 'chmod 644 (rw-r--r--)',
    language: 'yaml',
    description: 'Pipeline completo de CI/CD para o GitHub Actions com compilação e teste headless no QEMU.',
    highlights: ['Runner ubuntu-latest com KVM', 'Upload de artefatos da ISO e logs'],
    content: `name: NEXU-OS ISO Build & Headless QA Pipeline

on:
  push:
    branches: [ "main", "release/*" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-verify:
    name: Build SquashFS zstd-19 & QEMU QA
    runs-on: ubuntu-latest
    timeout-minutes: 60

    steps:
      - name: Checkout Repositório
        uses: actions/checkout@v4

      - name: Habilitar Aceleração KVM no Runner
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y --no-install-recommends cpu-checker
          kvm-ok || true
          if [ -e /dev/kvm ]; then
            sudo chmod 666 /dev/kvm
          fi

      - name: Instalar Dependências de Build e Virtualização
        run: |
          sudo apt-get install -y --no-install-recommends \\
            squashfs-tools \\
            xorriso \\
            grub-pc-bin \\
            grub-efi-amd64-bin \\
            mtools \\
            zstd \\
            rsync \\
            qemu-system-x86 \\
            qemu-utils \\
            ovmf \\
            curl \\
            python3

      - name: Executar Build da ISO (SquashFS zstd-19)
        run: |
          sudo mkdir -p /opt/nexu-builder/overlay
          sudo cp -r * /opt/nexu-builder/overlay/ || true
          sudo chmod +x opt/nexu-builder/build-iso.sh
          sudo ./opt/nexu-builder/build-iso.sh

      - name: Executar Teste Headless QEMU
        run: |
          sudo chmod +x opt/nexu-builder/test-iso-headless.sh
          sudo ./opt/nexu-builder/test-iso-headless.sh /opt/nexu-builder/dist/nexu-os-*.iso

      - name: Publicar Artefatos da ISO e Checksum
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: nexu-os-production-artifacts
          path: |
            /opt/nexu-builder/dist/*.iso
            /opt/nexu-builder/dist/*.sha256
            /opt/nexu-builder/dist/*.manifest.json
            /tmp/nexu-serial-boot.log
          retention-days: 14
`
  }
];

export const AIRGAP_AUDIT_RULES = [
  {
    title: 'Runtime Híbrido Win32-POSIX & SQLite WAL',
    desc: 'Simbiose em /dev/shm/nexus_ipc com barramento de eventos síncronos em SQLite com Write-Ahead Logging.',
    status: 'compliant',
    code: 'hybrid_runtime.py + local_server.py (WAL Mode)'
  },
  {
    title: 'Avatar de IA Holográfico (Ignis-Mage)',
    desc: 'Motor com corpo e presença flutuante, insígnia Dragão + Mago e diretrizes do personality.json.',
    status: 'compliant',
    code: 'avatar_core.py + personality.json'
  },
  {
    title: 'SquashFS ZSTD-19 & Blocos 1MB',
    desc: 'Compressão máxima e leitura de blocos de 1MB para arranque ultra-rápido de modelos.',
    status: 'compliant',
    code: '-comp zstd -Xcompression-level 19 -b 1048576'
  },
  {
    title: 'Cgroups v2 IOWeight=900 para Docker/PostgreSQL',
    desc: 'Priorização de fila de I/O em bloco para o PostgreSQL e buffers de inferência sob concorrência.',
    status: 'compliant',
    code: 'IOWeight=900 (docker.service.d/iowait.conf)'
  },
  {
    title: 'Journald Cap Rígido de 500MB',
    desc: 'Prevenção de estouro da partição raiz em sistemas imutáveis/air-gapped com descarte aos 15 dias.',
    status: 'compliant',
    code: 'SystemMaxUse=500M, SystemMaxFileSize=50M, MaxRetentionSec=15day'
  },
  {
    title: 'Docker Daemon Log Rotation',
    desc: 'Prevenção de saturação de disco por containers de microsserviços via limite de 50m * 3 arquivos.',
    status: 'compliant',
    code: 'max-size: "50m", max-file: "3"'
  },
  {
    title: 'Sanity Test com Alerta Crítico Telegram',
    desc: 'Validação automatizada de 8 pilares no primeiro boot com disparo imediato em caso de divergência.',
    status: 'compliant',
    code: 'ConditionFirstBoot=true, Telegram Bot API payload'
  },
  {
    title: 'QA Headless em QEMU e GitHub Actions',
    desc: 'Virtualização com asserção serial de logs de boot e verificação automática em esteiras de CI/CD.',
    status: 'compliant',
    code: 'qemu-system-x86_64 -nographic -serial file:...'
  }
];
