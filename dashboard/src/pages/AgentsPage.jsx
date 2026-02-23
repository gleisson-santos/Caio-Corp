import { useState } from 'react'
import PageHeader from '../components/PageHeader'

// === AGENT DATA ===
const agents = [
  {
    id: 'email-sentinel',
    name: 'Email Sentinel',
    role: 'Security Guard',
    icon: '🛡️',
    iconClass: 'sentinel',
    status: 'online',
    description: 'Monitoramento 24h de e-mails com alertas inteligentes via Telegram, leitura automática e resumos por IA.',
    skills: ['IMAP', 'SMTP', 'Resumos IA', 'Alertas', '24/7'],
    panel: 'email',
  },
  {
    id: 'schedule-master',
    name: 'Schedule Master',
    role: 'Time Keeper',
    icon: '📅',
    iconClass: 'scheduler',
    status: 'online',
    description: 'Gerencia agendamentos no Google Calendar, configura lembretes via cron e envia alertas 30 minutos antes de cada evento.',
    skills: ['Google Calendar', 'Cron Jobs', 'Alertas', 'Lembretes', 'Telegram'],
    panel: 'schedule',
  },
  {
    id: 'doc-specialist',
    name: 'Doc Specialist',
    role: 'Executive Assistant',
    icon: '📊',
    iconClass: 'docs',
    status: 'busy',
    description: 'Transforma dados em apresentações PPTX profissionais, gera relatórios PDF, analisa planilhas Excel e cria gráficos.',
    skills: ['PPTX', 'Excel', 'PDF', 'Charts', 'Análise de Dados'],
    panel: 'docs',
  },
  {
    id: 'code-analyst',
    name: 'Code Analyst',
    role: 'CTO',
    icon: '🧑‍💻',
    iconClass: 'code',
    status: 'online',
    description: 'Auditoria de segurança, refatoração, análise de performance e revisão de código.',
    skills: ['OWASP', 'TDD', 'Python', 'JS', 'Docker'],
    panel: 'generic',
  },
  {
    id: 'web-cloner',
    name: 'Web Cloner',
    role: 'Scraper Specialist',
    icon: '🕷️',
    iconClass: 'scraper',
    status: 'idle',
    description: 'Clonagem inteligente de sites, scraping de dados estruturados e automação web.',
    skills: ['Scraping', 'HTTP', 'DOM', 'API', 'JSON'],
    panel: 'generic',
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    role: 'Copywriter',
    icon: '✍️',
    iconClass: 'writer',
    status: 'idle',
    description: 'Criação de textos persuasivos, artigos, copy para landing pages e SEO.',
    skills: ['SEO', 'Copy', 'Blog', 'Social', 'Landing Pages'],
    panel: 'generic',
  },
]

// === EMAIL DATA ===
const emails = [
  {
    id: 1,
    from: 'contato@embasa.ba.gov.br',
    subject: 'Relatório Trimestral — Urgente',
    date: '22/02 21:45',
    priority: 'urgent',
    summary: 'Diretor solicita relatório trimestral de performance do Consórcio Nova Bolandeira II até sexta-feira. Inclui dados de materiais utilizados e divergências encontradas.',
    body: 'Prezado Gleisson,\n\nConforme alinhado na última reunião, solicito o envio do relatório trimestral de performance...',
    read: false,
  },
  {
    id: 2,
    from: 'noreply@vivo.com.br',
    subject: 'Sua fatura está disponível — R$ 189,90',
    date: '22/02 20:30',
    priority: 'normal',
    summary: 'Fatura Vivo Fibra vencendo em 25/02/2026 no valor de R$ 189,90. Código de barras disponível para pagamento.',
    body: 'Olá Gleisson,\n\nSua fatura de fevereiro já está disponível...',
    read: true,
  },
  {
    id: 3,
    from: 'thiago@automatizze.pro',
    subject: 'Re: Reunião de alinhamento — Confirmação',
    date: '22/02 19:15',
    priority: 'info',
    summary: 'Thiago confirmou presença na reunião de segunda-feira às 10h via Google Meet. Pauta: sprint review e planejamento.',
    body: 'Fala Gleisson!\n\nConfirmado para segunda 10h. Mando o link do Meet amanhã...',
    read: true,
  },
  {
    id: 4,
    from: 'alerts@github.com',
    subject: '[Caio-Corp/nanobot] New deployment successful',
    date: '22/02 18:00',
    priority: 'info',
    summary: 'Deploy do nanobot/dashboard concluído com sucesso no branch main. Image Docker atualizada no Docker Hub.',
    body: 'Your deployment has been successfully completed...',
    read: true,
  },
]

// === SCHEDULE DATA ===
const events = [
  {
    id: 1,
    title: 'Reunião de Sprint Review',
    time: '22:30',
    date: 'Hoje',
    description: 'Review da Sprint 12 com equipe de desenvolvimento',
    location: 'Google Meet — meet.google.com/abc-defg-hij',
    participants: ['Gleisson', 'Thiago', 'Ana'],
    source: 'calendar',
    alert: '30min',
    alertSent: false,
    urgent: true,
  },
  {
    id: 2,
    title: 'Entrega Relatório Trimestral',
    time: '09:00',
    date: 'Amanhã',
    description: 'Enviar relatório de performance ao diretor da Embasa',
    location: 'Email',
    participants: ['Gleisson'],
    source: 'calendar',
    alert: '30min',
    alertSent: false,
    urgent: false,
  },
  {
    id: 3,
    title: 'Daily Standup',
    time: '10:00',
    date: 'Seg, 24/02',
    description: 'Reunião diária de alinhamento da equipe',
    location: 'Google Meet',
    participants: ['Equipe'],
    source: 'calendar',
    alert: '15min',
    alertSent: false,
    urgent: false,
  },
]

const cronJobs = [
  { id: 1, name: 'Lembrete diário de agenda', cron: '0 9 * * *', active: true, nextRun: 'Amanhã 09:00', description: 'Envia no Telegram a lista de compromissos do dia' },
  { id: 2, name: 'Report semanal', cron: '0 17 * * 5', active: true, nextRun: 'Sex 17:00', description: 'Gera e envia relatório semanal de atividades' },
  { id: 3, name: 'Backup workspace', cron: '0 3 * * *', active: true, nextRun: 'Amanhã 03:00', description: 'Backup automático dos arquivos do workspace' },
  { id: 4, name: 'Check de emails', cron: '*/5 * * * *', active: true, nextRun: 'Em 3 min', description: 'Verifica novos emails a cada 5 minutos' },
]

// === DOC DATA ===
const recentDocs = [
  { id: 1, name: 'relatorio-q1.pptx', type: 'PPTX', slides: 12, date: '22/02 21:45', status: 'done', size: '2.4 MB' },
  { id: 2, name: 'analise-vendas.pdf', type: 'PDF', pages: 8, date: '22/02 18:30', status: 'done', size: '1.1 MB' },
  { id: 3, name: 'planilha-materiais.xlsx', type: 'Excel', rows: 1247, date: '21/02 16:00', status: 'analyzing', size: '456 KB' },
  { id: 4, name: 'dashboard-specs.md', type: 'MD', lines: 340, date: '21/02 14:20', status: 'done', size: '12 KB' },
]

const statusConfig = {
  online: 'Online',
  busy: 'Trabalhando',
  idle: 'Disponível',
}

const priorityConfig = {
  urgent: { label: '🔴 Urgente', className: 'priority-urgent' },
  normal: { label: '🟡 Normal', className: 'priority-normal' },
  info: { label: '🔵 Info', className: 'priority-info' },
}

// === COMPONENT ===
export default function AgentsPage({ focusAgent }) {
  const [selectedAgent, setSelectedAgent] = useState(focusAgent || null)
  const [expandedEmail, setExpandedEmail] = useState(null)
  const [expandedEvent, setExpandedEvent] = useState(null)
  const [emailFilter, setEmailFilter] = useState('all')
  const [cronToggles, setCronToggles] = useState(
    cronJobs.reduce((acc, j) => ({ ...acc, [j.id]: j.active }), {})
  )

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  const filteredEmails = emailFilter === 'all' ? emails
    : emailFilter === 'unread' ? emails.filter(e => !e.read)
    : emails.filter(e => e.priority === 'urgent')

  return (
    <>
      <PageHeader
        title="Agentes Especializados"
        description="Gerencie, monitore e interaja com cada agente da equipe Caio Corp."
      />

      {/* Agent Grid */}
      <div className="agents-page-grid fade-in-up fade-in-up-delay-1">
        {agents.map((agent, i) => (
          <div
            key={agent.id}
            className={`agent-card-lg ${selectedAgent === agent.id ? 'selected' : ''} fade-in-up fade-in-up-delay-${Math.min(i + 1, 6)}`}
            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
          >
            <div className="agent-card-header">
              <div className={`agent-icon ${agent.iconClass}`}>{agent.icon}</div>
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
              {agent.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
            <div className="agent-actions">
              <button className="btn-agent btn-primary-agent">💬 Conversar</button>
              <button className="btn-agent btn-secondary-agent">📋 Ver Logs</button>
              <button className="btn-agent btn-secondary-agent">⚙️ Config</button>
            </div>
          </div>
        ))}
      </div>

      {/* Specialized Panel */}
      {selectedAgentData && (
        <div className="agent-detail-panel fade-in-up">
          {/* ==================== EMAIL SENTINEL ==================== */}
          {selectedAgentData.panel === 'email' && (
            <div className="email-panel">
              <div className="panel-header">
                <h3>🛡️ Email Sentinel — Inbox Inteligente</h3>
                <div className="email-stats">
                  <span className="stat-pill">{emails.length} emails hoje</span>
                  <span className="stat-pill urgent">{emails.filter(e => e.priority === 'urgent').length} urgentes</span>
                  <span className="stat-pill">{emails.filter(e => !e.read).length} não lidos</span>
                </div>
              </div>

              {/* Filters */}
              <div className="email-filters">
                {['all', 'unread', 'urgent'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${emailFilter === f ? 'active' : ''}`}
                    onClick={() => setEmailFilter(f)}
                  >
                    {f === 'all' ? 'Todos' : f === 'unread' ? 'Não Lidos' : 'Urgentes'}
                  </button>
                ))}
              </div>

              {/* Email List */}
              <div className="email-list">
                {filteredEmails.map(email => {
                  const isExpanded = expandedEmail === email.id
                  const priority = priorityConfig[email.priority]
                  return (
                    <div
                      key={email.id}
                      className={`email-item ${isExpanded ? 'expanded' : ''} ${!email.read ? 'unread' : ''}`}
                      onClick={() => setExpandedEmail(isExpanded ? null : email.id)}
                    >
                      <div className="email-main">
                        <div className="email-indicator">
                          {!email.read && <div className="unread-dot"></div>}
                        </div>
                        <div className="email-content">
                          <div className="email-from-row">
                            <span className="email-from">{email.from}</span>
                            <span className="email-date">{email.date}</span>
                          </div>
                          <div className="email-subject">{email.subject}</div>
                          <div className="email-summary">
                            <span className="summary-icon">🧠</span>
                            {email.summary}
                          </div>
                        </div>
                        <span className={`priority-badge ${priority.className}`}>{priority.label}</span>
                      </div>
                      {isExpanded && (
                        <div className="email-expanded">
                          <div className="email-body-preview">
                            <div className="body-label">📄 Email Original</div>
                            <pre>{email.body}</pre>
                          </div>
                          <div className="email-actions-row">
                            <button className="btn-agent btn-primary-agent">↩️ Responder</button>
                            <button className="btn-agent btn-secondary-agent">📌 Arquivar</button>
                            <button className="btn-agent btn-secondary-agent">✓ Marcar como lido</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ==================== SCHEDULE MASTER ==================== */}
          {selectedAgentData.panel === 'schedule' && (
            <div className="schedule-panel">
              <div className="panel-header">
                <h3>📅 Schedule Master — Agenda & Alertas</h3>
                <div className="email-stats">
                  <span className="stat-pill">{events.length} eventos hoje</span>
                  <span className="stat-pill">{Object.values(cronToggles).filter(Boolean).length} crons ativos</span>
                  <span className="stat-pill urgent">Próximo em 25min</span>
                </div>
              </div>

              <div className="schedule-grid">
                {/* Timeline */}
                <div className="timeline-section">
                  <div className="section-title-sm">📆 Próximos Eventos</div>
                  <div className="timeline">
                    {events.map(event => {
                      const isExpanded = expandedEvent === event.id
                      return (
                        <div
                          key={event.id}
                          className={`timeline-item ${isExpanded ? 'expanded' : ''} ${event.urgent ? 'urgent' : ''}`}
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        >
                          <div className="timeline-dot-line">
                            <div className={`timeline-dot ${event.urgent ? 'urgent' : ''}`}></div>
                            <div className="timeline-line"></div>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <div className="timeline-time">
                                <span className="time-value">{event.time}</span>
                                <span className="time-date">{event.date}</span>
                              </div>
                              <div className="timeline-title">{event.title}</div>
                              <div className="timeline-badges">
                                <span className={`source-badge ${event.source}`}>
                                  {event.source === 'calendar' ? '🗓️ Calendar' : '⏱️ Cron'}
                                </span>
                                {event.urgent && (
                                  <span className="alert-badge pulse">⏰ Em 25 min</span>
                                )}
                              </div>
                            </div>
                            {isExpanded && (
                              <div className="timeline-detail">
                                <div className="detail-row">📝 {event.description}</div>
                                <div className="detail-row">📍 {event.location}</div>
                                <div className="detail-row">👥 {event.participants.join(', ')}</div>
                                <div className="detail-row">🔔 Alerta: {event.alert} antes</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cron Jobs */}
                <div className="cron-section">
                  <div className="section-title-sm">⏱️ Alertas Programados</div>
                  <div className="cron-list">
                    {cronJobs.map(job => (
                      <div key={job.id} className="cron-item">
                        <div className="cron-info">
                          <div className="cron-name">{job.name}</div>
                          <div className="cron-description">{job.description}</div>
                          <div className="cron-meta">
                            <span className="cron-expression">{job.cron}</span>
                            <span className="cron-next">Próx: {job.nextRun}</span>
                          </div>
                        </div>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={cronToggles[job.id]}
                            onChange={(e) => {
                              e.stopPropagation()
                              setCronToggles(prev => ({ ...prev, [job.id]: !prev[job.id] }))
                            }}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== DOC SPECIALIST ==================== */}
          {selectedAgentData.panel === 'docs' && (
            <div className="docs-panel">
              <div className="panel-header">
                <h3>📊 Doc Specialist — Documentos & Dados</h3>
                <div className="email-stats">
                  <span className="stat-pill">{recentDocs.length} documentos</span>
                  <span className="stat-pill">{recentDocs.filter(d => d.status === 'analyzing').length} em análise</span>
                </div>
              </div>

              {/* Capabilities */}
              <div className="docs-capabilities">
                <div className="capability-card">
                  <div className="capability-icon">📑</div>
                  <div className="capability-name">Apresentações</div>
                  <div className="capability-desc">PPTX profissionais com gráficos e design corporativo</div>
                </div>
                <div className="capability-card">
                  <div className="capability-icon">📊</div>
                  <div className="capability-name">Análise de Dados</div>
                  <div className="capability-desc">Lê e analisa planilhas Excel, CSV com insights por IA</div>
                </div>
                <div className="capability-card">
                  <div className="capability-icon">📄</div>
                  <div className="capability-name">Relatórios PDF</div>
                  <div className="capability-desc">Gera relatórios formatados a partir de dados brutos</div>
                </div>
                <div className="capability-card">
                  <div className="capability-icon">📈</div>
                  <div className="capability-name">Gráficos</div>
                  <div className="capability-desc">Cria visualizações de dados e charts profissionais</div>
                </div>
              </div>

              {/* Recent Documents */}
              <div className="section-title-sm">📁 Documentos Recentes</div>
              <div className="docs-table">
                <div className="docs-table-header">
                  <span className="col-name">Arquivo</span>
                  <span className="col-type">Tipo</span>
                  <span className="col-info">Info</span>
                  <span className="col-size">Tamanho</span>
                  <span className="col-date">Data</span>
                  <span className="col-status">Status</span>
                </div>
                {recentDocs.map(doc => (
                  <div key={doc.id} className="docs-table-row">
                    <span className="col-name">
                      <span className="doc-icon">
                        {doc.type === 'PPTX' ? '📑' : doc.type === 'PDF' ? '📄' : doc.type === 'Excel' ? '📊' : '📝'}
                      </span>
                      {doc.name}
                    </span>
                    <span className="col-type"><span className="type-badge">{doc.type}</span></span>
                    <span className="col-info">
                      {doc.slides ? `${doc.slides} slides` : doc.pages ? `${doc.pages} páginas` : doc.rows ? `${doc.rows} linhas` : `${doc.lines} linhas`}
                    </span>
                    <span className="col-size">{doc.size}</span>
                    <span className="col-date">{doc.date}</span>
                    <span className="col-status">
                      <span className={`doc-status ${doc.status}`}>
                        {doc.status === 'done' ? '✅ Concluído' : '🔄 Analisando...'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== GENERIC PANEL ==================== */}
          {selectedAgentData.panel === 'generic' && (
            <div className="generic-panel">
              <div className="panel-header">
                <h3>{selectedAgentData.icon} {selectedAgentData.name} — Detalhes</h3>
              </div>
              <div className="generic-stats-grid">
                <div className="generic-stat">
                  <div className="generic-stat-value accent">47</div>
                  <div className="generic-stat-label">Tarefas completas</div>
                </div>
                <div className="generic-stat">
                  <div className="generic-stat-value green">98%</div>
                  <div className="generic-stat-label">Taxa de sucesso</div>
                </div>
                <div className="generic-stat">
                  <div className="generic-stat-value warm">2.3s</div>
                  <div className="generic-stat-label">Tempo médio</div>
                </div>
                <div className="generic-stat">
                  <div className="generic-stat-value">12.4k</div>
                  <div className="generic-stat-label">Tokens usados</div>
                </div>
              </div>
              <div className="generic-recent">
                <div className="section-title-sm">📋 Atividade Recente</div>
                <div className="generic-activity">
                  <div className="generic-activity-item">
                    <span className="activity-time-sm">21:30</span>
                    <span>Auditoria de segurança em 47 arquivos — 0 críticos</span>
                  </div>
                  <div className="generic-activity-item">
                    <span className="activity-time-sm">20:15</span>
                    <span>Refatoração do módulo de autenticação concluída</span>
                  </div>
                  <div className="generic-activity-item">
                    <span className="activity-time-sm">19:00</span>
                    <span>Análise de performance: 12% de melhoria no tempo de resposta</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
