import React, { useState } from 'react';
import { AIRGAP_AUDIT_RULES } from '../data/nexuFiles';
import { 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Copy, 
  Check, 
  Terminal, 
  Lock, 
  WifiOff, 
  HardDrive,
  FileCheck
} from 'lucide-react';

export const AirGapChecklist: React.FC = () => {
  const [botToken, setBotToken] = useState('7123456789:AAF_mock_token_for_airgap_testing');
  const [chatId, setChatId] = useState('-100987654321');
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [copiedPayload, setCopiedPayload] = useState(false);

  const sampleAlertPayload = `🚨 *ALERTA CRÍTICO: FALHA DE SANIDADE NO NEXU-OS*
*Host:* \`nexu-node-01.airgap.internal\`
*Timestamp:* \`${new Date().toISOString()}\`
*Ambiente:* Air-Gapped Production

*Falhas Detectadas:*
• 4. Unidade Systemd (open-jarvis.service): Unidade não está ativa ou falhou
• 7. Conformidade de Rede: Rota WAN pública não autorizada detectada!

*Ação Recomendada:* Inspecione o journal do sistema via:
\`journalctl -xeu nexu-firstboot-sanity.service\``;

  const handleSimulateTelegram = () => {
    setIsSending(true);
    setTestResult({ status: 'idle', message: '' });

    setTimeout(() => {
      setIsSending(false);
      setTestResult({
        status: 'success',
        message: 'Payload formatado com sucesso! A requisição curl para a API do Telegram foi simulada com HTTP 200 OK.',
      });
    }, 900);
  };

  const copyCurlCommand = () => {
    const curl = `curl -s -X POST "https://api.telegram.org/bot${botToken}/sendMessage" \\
  -d chat_id="${chatId}" \\
  -d parse_mode="Markdown" \\
  --data-urlencode "text=${sampleAlertPayload}"`;

    navigator.clipboard.writeText(curl);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 space-y-6 custom-scrollbar h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              Auditoria de Conformidade & Isolamento Air-Gapped
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Verificação dos 8 pilares técnicos de segurança, imutabilidade, restrição de I/O em cgroups e tolerância a falhas implementados no NEXU-OS.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              8/8 Itens Aprovados
            </span>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AIRGAP_AUDIT_RULES.map((rule, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-sm hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <h4 className="font-semibold text-white text-xs">{rule.title}</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-bold uppercase">
                Conforme
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {rule.desc}
            </p>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
              <code className="text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 truncate max-w-full">
                {rule.code}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Telegram Alert Tester Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-white text-sm">
              Validador de Alerta Crítico no Primeiro Boot (API do Telegram)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            /etc/nexu-os/alerts.conf (chmod 600)
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Caso qualquer teste de sanidade falhe no primeiro boot (<code className="text-slate-300">ConditionFirstBoot=true</code>), 
          o script <code className="text-slate-300">sanity-test.sh</code> gera um relatório estruturado e despacha automaticamente para o bot configurado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              TELEGRAM_BOT_TOKEN
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              TELEGRAM_CHAT_ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Payload Preview */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Payload Markdown despachado:</span>
            <button
              onClick={copyCurlCommand}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Copiado!' : 'Copiar comando cURL'}</span>
            </button>
          </div>
          <pre className="p-3 bg-slate-950 border border-slate-800 rounded-md font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap select-text">
            {sampleAlertPayload}
          </pre>
        </div>

        {/* Send simulation button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            {testResult.message && (
              <span className={testResult.status === 'success' ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
                {testResult.message}
              </span>
            )}
          </div>

          <button
            onClick={handleSimulateTelegram}
            disabled={isSending}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-md text-xs font-semibold shadow-md transition disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Despachando...' : 'Testar Envio do Alerta'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
