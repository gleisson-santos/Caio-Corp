import { useState, useEffect, useRef } from 'react'
import { useAgents } from '../context/AgentContext'
import { useTasks } from '../context/TaskContext'
import PageHeader from '../components/PageHeader'

const statusConfig = {
  online: 'Online',
  busy: 'Trabalhando',
  idle: 'Disponível',
  offline: 'Offline',
}

const priorityConfig = {
  urgent: { label: '🔴 Urgente', className: 'priority-urgent' },
  normal: { label: '🟡 Normal', className: 'priority-normal' },
  info: { label: '🔵 Info', className: 'priority-info' },
}

// === EMAIL DATA (static demo) ===
const emails = [
  { id: 1, from: 'contato@embasa.ba.gov.br', subject: 'Relatório Trimestral — Urgente', date: '22/02 21:45', priority: 'urgent', summary: 'Solicitação de envio do relatório trimestral de performance até sexta-feira.', body: 'Prezado Gleisson,\n\nConforme alinhado na reunião de planejamento...', read: false },
  { id: 2, from: 'noreply@hostgator.com.br', subject: 'Fatura #HG-2026-0223 — Vencimento Amanhã', date: '22/02 21:30', priority: 'urgent', summary: 'Fatura de R$ 189,90 do Server Cloud Pro vencendo amanhã.', body: 'Olá Gleisson,\n\nSua fatura de R$ 189,90 está disponível...', read: false },
  { id: 3, from: 'thiago.dev@gmail.com', subject: 'Re: Alinhamento Sprint 12', date: '22/02 20:15', priority: 'normal', summary: 'Thiago confirmou presença na reunião de segunda às 10h.', body: 'Fala Gleisson!\n\nConfirmado para segunda 10h...', read: true },
  { id: 4, from: 'alerts@github.com', subject: '[Caio-Corp/nanobot] New deployment successful', date: '22/02 18:00', priority: 'info', summary: 'Deploy concluído com sucesso no branch main.', body: 'Your deployment has been successfully completed...', read: true },
]

// === SCHEDULE DATA (static demo) ===
const events = [
  { id: 1, title: 'Reunião de Sprint Review', time: '22:30', date: 'Hoje', description: 'Review da Sprint 12', location: 'Google Meet', participants: ['Thiago', 'Ana', 'Carlos'], source: 'calendar', alert: '30min', urgent: true },
  { id: 2, title: 'Enviar Relatório Trimestral', time: '18:00', date: 'Amanhã', description: 'Compilar dados e enviar para diretoria', location: 'Email', participants: ['Diretoria'], source: 'task', alert: '1h', urgent: true },
  { id: 3, title: 'Daily Standup', time: '09:00', date: 'Seg, 24/02', description: 'Reunião diária de alinhamento', location: 'Google Meet', participants: ['Equipe'], source: 'calendar', alert: '15min', urgent: false },
]

const cronJobs = [
  { id: 1, name: 'Lembrete diário de agenda', cron: '0 9 * * *', active: true, nextRun: 'Amanhã 09:00', description: 'Envia no Telegram a lista de compromissos do dia' },
  { id: 2, name: 'Verificação de emails prioritários', cron: '*/30 * * * *', active: true, nextRun: 'Em 15 min', description: 'Analisa caixa de entrada e alerta sobre urgentes' },
  { id: 3, name: 'Backup semanal workspace', cron: '0 3 * * 0', active: false, nextRun: 'Domingo 03:00', description: 'Compacta e envia workspace para Google Drive' },
]

const docs = [
  { id: 1, name: 'relatorio-q1-2026.pptx', type: 'PPTX', lines: 12, date: '22/02 21:45', status: 'done', size: '2.4 MB' },
  { id: 2, name: 'analise-performance.pdf', type: 'PDF', lines: 45, date: '22/02 20:30', status: 'done', size: '890 KB' },
  { id: 3, name: 'dados-vendas.xlsx', type: 'XLSX', lines: 1200, date: '22/02 19:15', status: 'processing', size: '156 KB' },
  { id: 4, name: 'dashboard-specs.md', type: 'MD', lines: 340, date: '21/02 14:20', status: 'done', size: '12 KB' },
]

export default function AgentsPage({ focusAgent }) {
  const { agents } = useAgents()
  const { tasks } = useTasks()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const selectedRef = useRef(null)

  // Auto-select agent from focusAgent prop
  useEffect(() => {
    if (focusAgent) {
      const agent = agents.find(a => a.id === focusAgent)
      if (agent) setSelectedAgent(agent)
    }
  }, [focusAgent, agents])

  // Auto-scroll to selected agent panel
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedAgent])

  // Get tasks for an agent
  const getAgentTasks = (agentId) => tasks.filter(t => t.assignedTo === agentId)

  // Render agent detail panel
  const renderAgentPanel = (agent) => {
    if (!agent) return null
    const agentTasks = getAgentTasks(agent.id)
    const metrics = agent.performanceMetrics

    switch (agent.iconClass) {
      case 'sentinel':
        return (
          <div className="agent-panel-content">
            <div className="panel-section">
              <h4>📧 Últimos Emails Processados</h4>
              <div className="email-list">
                {emails.map(email => (
                  <div key={email.id} className={`email-item ${email.read ? 'read' : 'unread'}`}>
                    <div className="email-header">
                      <span className="email-from">{email.from}</span>
                      <span className={`email-priority ${email.priority}`}>{priorityConfig[email.priority]?.label}</span>
                    </div>
                    <div className="email-subject">{email.subject}</div>
                    <div className="email-summary">{email.summary}</div>
                    <div className="email-date">{email.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'scheduler':
        return (
          <div className="agent-panel-content">
            <div className="panel-section">
              <h4>📅 Próximos Eventos</h4>
              <div className="events-list">
                {events.map(ev => (
                  <div key={ev.id} className={`event-item ${ev.urgent ? 'urgent' : ''}`}>
                    <div className="event-header">
                      <span className="event-title">{ev.title}</span>
                      <span className="event-time">{ev.date} — {ev.time}</span>
                    </div>
                    <div className="event-location">📍 {ev.location}</div>
                    <div className="event-participants">👥 {ev.participants.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel-section">
              <h4>⏰ Cron Jobs</h4>
              <div className="cron-list">
                {cronJobs.map(job => (
                  <div key={job.id} className={`cron-item ${job.active ? 'active' : 'inactive'}`}>
                    <div className="cron-header">
                      <span className="cron-name">{job.name}</span>
                      <span className={`cron-status ${job.active ? 'on' : 'off'}`}>{job.active ? '● ON' : '○ OFF'}</span>
                    </div>
                    <div className="cron-expression"><code>{job.cron}</code> — Próximo: {job.nextRun}</div>
                    <div className="cron-desc">{job.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'docs':
      case 'writer':
        return (
          <div className="agent-panel-content">
            <div className="panel-section">
              <h4>📄 Documentos Recentes</h4>
              <div className="docs-list">
                {docs.map(doc => (
                  <div key={doc.id} className="doc-item">
                    <span className="doc-icon">{doc.type === 'PPTX' ? '📊' : doc.type === 'PDF' ? '📕' : doc.type === 'XLSX' ? '📗' : '📝'}</span>
                    <div className="doc-info">
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-meta">{doc.size} · {doc.date}</div>
                    </div>
                    <span className={`doc-status ${doc.status}`}>
                      {doc.status === 'done' ? '✅' : '⏳'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="agent-panel-content">
            <div className="panel-section">
              <h4>📋 Tarefas Atribuídas</h4>
              {agentTasks.length === 0 ? (
                <div className="empty-state">Nenhuma tarefa atribuída.</div>
              ) : (
                <div className="task-mini-list">
                  {agentTasks.map(t => (
                    <div key={t.id} className={`task-mini-item ${t.status}`}>
                      <span className="task-mini-title">{t.title}</span>
                      <span className="task-mini-status">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <PageHeader
        title="Agentes"
        description="Gerencie seus agentes de IA, visualize capacidades e monitore performance."
      />

      {/* Agent Grid */}
      <div className="section-title fade-in-up fade-in-up-delay-1">Equipe ({agents.length} agentes)</div>
      <div className="agents-grid fade-in-up fade-in-up-delay-1">
        {agents.map((agent, i) => (
          <div
            key={agent.id}
            className={`agent-card fade-in-up fade-in-up-delay-${Math.min(i + 1, 6)} ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
            onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
          >
            <div className="agent-card-header">
              <div className={`agent-icon ${agent.iconClass}`}>
                {agent.icon}
              </div>
              <div>
                <div className="agent-name">{agent.name}</div>
                <div className="agent-role">{agent.role}</div>
              </div>
              <div className={`agent-status ${agent.status}`}>
                <span className="dot"></span>
                {statusConfig[agent.status]}
              </div>
            </div>
            <div className="agent-description">{agent.description}</div>
            <div className="agent-skills">
              {agent.capabilities.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
            {/* Performance bar */}
            <div className="agent-perf-bar">
              <div className="perf-label">Taxa de Sucesso</div>
              <div className="perf-track">
                <div className="perf-fill" style={{ width: `${agent.performanceMetrics.successRate}%` }}></div>
              </div>
              <span className="perf-value">{agent.performanceMetrics.successRate}%</span>
            </div>
            {agent.tier > 0 && (
              <div className="agent-tier-badge">Tier {agent.tier}</div>
            )}
            {agent.tier === 0 && (
              <div className="agent-tier-badge ceo-badge">CEO</div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Agent Detail Panel */}
      {selectedAgent && (
        <div className="agent-detail-panel fade-in-up" ref={selectedRef}>
          <div className="agent-detail-header">
            <div className={`agent-icon large ${selectedAgent.iconClass}`}>{selectedAgent.icon}</div>
            <div>
              <h3>{selectedAgent.name}</h3>
              <span className="agent-role">{selectedAgent.role}</span>
            </div>
            <button className="btn-close" onClick={() => setSelectedAgent(null)}>✕</button>
          </div>

          {/* Metrics Grid */}
          <div className="agent-metrics-grid">
            <div className="agent-metric">
              <div className="agent-metric-value">{selectedAgent.performanceMetrics.tasksCompleted}</div>
              <div className="agent-metric-label">Tarefas Completas</div>
            </div>
            <div className="agent-metric">
              <div className="agent-metric-value">{selectedAgent.performanceMetrics.averageExecutionTime}s</div>
              <div className="agent-metric-label">Tempo Médio</div>
            </div>
            <div className="agent-metric">
              <div className="agent-metric-value">{selectedAgent.performanceMetrics.successRate}%</div>
              <div className="agent-metric-label">Sucesso</div>
            </div>
            <div className="agent-metric">
              <div className="agent-metric-value">{selectedAgent.performanceMetrics.activeTasksCount}</div>
              <div className="agent-metric-label">Ativas Agora</div>
            </div>
          </div>

          {/* Agent-specific panel */}
          {renderAgentPanel(selectedAgent)}
        </div>
      )}
    </>
  )
}
