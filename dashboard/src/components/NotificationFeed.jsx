import { useState } from 'react'

const notifications = [
  {
    id: 1,
    agent: 'Email Sentinel',
    icon: '📧',
    type: 'email',
    preview: 'Resumiu 3 emails novos — 1 urgente de contato@embasa.ba.gov.br',
    detail: 'Email 1: Fatura Vivo vencendo 25/02 — R$ 189,90\nEmail 2: Reunião de alinhamento confirmada para segunda 10h\nEmail 3: [URGENTE] Relatório trimestral solicitado pelo diretor',
    time: '2 min',
    unread: true,
  },
  {
    id: 2,
    agent: 'Schedule Master',
    icon: '📅',
    type: 'schedule',
    preview: 'Reunião de Sprint em 30 minutos ⏰',
    detail: '📍 Google Meet — meet.google.com/abc-defg-hij\n👥 Participantes: Gleisson, Thiago, Ana\n📝 Pauta: Review da sprint 12, planejamento sprint 13\n⏰ Alerta enviado ao Telegram',
    time: '5 min',
    unread: true,
  },
  {
    id: 3,
    agent: 'Doc Specialist',
    icon: '📊',
    type: 'success',
    preview: 'Apresentação "Relatório Q1" gerada — 12 slides',
    detail: '📄 Arquivo: workspace/docs/relatorio-q1.pptx\n📊 12 slides com gráficos de performance\n📈 Dados extraídos de planilha-vendas.xlsx\n✅ Formato profissional aplicado',
    time: '15 min',
    unread: false,
  },
  {
    id: 4,
    agent: 'Code Analyst',
    icon: '🧑‍💻',
    type: 'success',
    preview: 'Auditoria de segurança completa — 0 vulnerabilidades críticas',
    detail: '🔍 Arquivos analisados: 47\n✅ Vulnerabilidades críticas: 0\n⚠️ Warnings: 3 (baixa severidade)\n📝 Relatório salvo em workspace/reports/audit-2026-02.md',
    time: '28 min',
    unread: false,
  },
  {
    id: 5,
    agent: 'Email Sentinel',
    icon: '📧',
    type: 'warning',
    preview: 'Alerta: Fatura Vivo vencendo amanhã — R$ 189,90',
    detail: '💰 Valor: R$ 189,90\n📅 Vencimento: 23/02/2026\n🏢 Empresa: Vivo Telefônica\n📨 Email original encaminhado ao Telegram',
    time: '45 min',
    unread: false,
  },
  {
    id: 6,
    agent: 'Schedule Master',
    icon: '📅',
    type: 'info',
    preview: 'Cron ativado: Relatório semanal toda sexta às 17h',
    detail: '⏱️ Cron: 0 17 * * 5\n📊 Ação: Gerar relatório semanal de atividades\n📨 Enviar resumo ao Telegram\n✅ Próxima execução: Sexta 17:00',
    time: '1h',
    unread: false,
  },
]

export default function NotificationFeed() {
  const [expandedId, setExpandedId] = useState(null)
  const unreadCount = notifications.filter(n => n.unread).length

  const typeStyles = {
    email: { bg: '#1a2a3a', border: '#2196f320' },
    schedule: { bg: '#1a2a1a', border: '#4caf5020' },
    success: { bg: '#0d2a1a', border: '#00e67620' },
    warning: { bg: '#2a2a0d', border: '#ffb34720' },
    info: { bg: '#0d1a2a', border: '#00d4aa20' },
  }

  return (
    <div className="notification-feed">
      <div className="notification-header">
        <h3>
          🔔 Notificações
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h3>
      </div>
      <div className="notification-list">
        {notifications.map((notif) => {
          const isExpanded = expandedId === notif.id
          const style = typeStyles[notif.type] || typeStyles.info
          return (
            <div
              key={notif.id}
              className={`notification-item ${isExpanded ? 'expanded' : ''} ${notif.unread ? 'unread' : ''}`}
              style={{ background: style.bg, borderColor: style.border }}
              onClick={() => setExpandedId(isExpanded ? null : notif.id)}
            >
              <div className="notif-main">
                <span className="notif-icon">{notif.icon}</span>
                <div className="notif-content">
                  <div className="notif-agent">{notif.agent}</div>
                  <div className="notif-preview">{notif.preview}</div>
                </div>
                <span className="notif-time">{notif.time}</span>
              </div>
              {isExpanded && (
                <div className="notif-detail">
                  {notif.detail.split('\n').map((line, i) => (
                    <div key={i} className="notif-detail-line">{line}</div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
