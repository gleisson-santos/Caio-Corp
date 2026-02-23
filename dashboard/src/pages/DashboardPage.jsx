import NotificationFeed from '../components/NotificationFeed'

const agents = [
  {
    id: 'email-sentinel',
    name: 'Email Sentinel',
    role: 'Security Guard',
    icon: '🛡️',
    iconClass: 'sentinel',
    status: 'online',
    description: 'Monitoramento 24h de e-mails com alertas inteligentes e resumos IA.',
    skills: ['IMAP', 'SMTP', 'Resumos IA', '24/7'],
  },
  {
    id: 'schedule-master',
    name: 'Schedule Master',
    role: 'Time Keeper',
    icon: '📅',
    iconClass: 'scheduler',
    status: 'online',
    description: 'Gerencia agendamentos, Google Calendar e alertas automáticos.',
    skills: ['Calendar', 'Cron', 'Alertas', 'Lembretes'],
  },
  {
    id: 'doc-specialist',
    name: 'Doc Specialist',
    role: 'Executive Assistant',
    icon: '📊',
    iconClass: 'docs',
    status: 'busy',
    description: 'Gera documentos, apresentações PPTX e analisa planilhas.',
    skills: ['PPTX', 'Excel', 'PDF', 'Charts'],
  },
  {
    id: 'code-analyst',
    name: 'Code Analyst',
    role: 'CTO',
    icon: '🧑‍💻',
    iconClass: 'code',
    status: 'online',
    description: 'Auditoria de segurança, refatoração e análise de performance.',
    skills: ['OWASP', 'TDD', 'Python', 'JS'],
  },
  {
    id: 'web-cloner',
    name: 'Web Cloner',
    role: 'Scraper Specialist',
    icon: '🕷️',
    iconClass: 'scraper',
    status: 'idle',
    description: 'Clonagem inteligente de sites, scraping e automação web.',
    skills: ['Scraping', 'HTTP', 'DOM', 'API'],
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    role: 'Copywriter',
    icon: '✍️',
    iconClass: 'writer',
    status: 'idle',
    description: 'Textos persuasivos, artigos, copy para landing pages e SEO.',
    skills: ['SEO', 'Copy', 'Blog', 'Social'],
  },
]

const activities = [
  { time: '22:03', agent: 'Email Sentinel', message: 'Novo e-mail de contato@embasa.ba.gov.br resumido com IA.', badge: 'info' },
  { time: '21:50', agent: 'Schedule Master', message: 'Alerta enviado: Reunião de Sprint em 30 minutos.', badge: 'warning' },
  { time: '21:45', agent: 'Doc Specialist', message: 'Apresentação "Relatório Q1" gerada com sucesso (12 slides).', badge: 'success' },
  { time: '21:30', agent: 'Caio CEO', message: 'Delegou análise de performance ao Code Analyst.', badge: 'info' },
  { time: '21:15', agent: 'Code Analyst', message: 'Auditoria completa: 0 vulnerabilidades críticas.', badge: 'success' },
  { time: '20:45', agent: 'Email Sentinel', message: 'Alerta Telegram: fatura vencendo amanhã — R$ 189,90.', badge: 'warning' },
]

const statusConfig = {
  online: 'Online',
  busy: 'Trabalhando',
  idle: 'Disponível',
}

export default function DashboardPage({ onNavigate }) {
  return (
    <>
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <h2>Painel de Controle</h2>
        <p>Gerencie seus agentes, monitore atividades e acompanhe métricas em tempo real.</p>
      </div>

      {/* CEO Hero Card */}
      <div className="ceo-hero fade-in-up fade-in-up-delay-1">
        <div className="ceo-hero-content">
          <div className="ceo-avatar">🐱</div>
          <div className="ceo-info">
            <h3>Caio</h3>
            <div className="role">CEO — Maestro Central</div>
            <div className="description">
              Orquestrador central da Caio Corp. Recebe suas ordens, planeja a estratégia
              e delega tarefas para os agentes especializados.
            </div>
          </div>
          <div className="ceo-stats">
            <div className="ceo-stat">
              <div className="value">6</div>
              <div className="label">Agentes</div>
            </div>
            <div className="ceo-stat">
              <div className="value">24/7</div>
              <div className="label">Uptime</div>
            </div>
            <div className="ceo-stat">
              <div className="value">142k</div>
              <div className="label">Tokens Hoje</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid: Metrics + Notifications */}
      <div className="dashboard-grid fade-in-up fade-in-up-delay-2">
        <div className="dashboard-main">
          {/* Metrics */}
          <div className="section-title">Métricas</div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Agentes Ativos</div>
              <div className="metric-value green">4</div>
              <div className="metric-change positive">↑ 2 desde ontem</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Tokens Consumidos</div>
              <div className="metric-value accent">142.8k</div>
              <div className="metric-change positive">↓ 12% vs média</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Documentos Gerados</div>
              <div className="metric-value warm">23</div>
              <div className="metric-change positive">↑ 5 esta semana</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Alertas Hoje</div>
              <div className="metric-value red">3</div>
              <div className="metric-change negative">1 urgente</div>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="section-title fade-in-up fade-in-up-delay-3">Equipe de Agentes</div>
          <div className="agents-grid">
            {agents.map((agent, i) => (
              <div
                key={agent.id}
                className={`agent-card fade-in-up fade-in-up-delay-${Math.min(i + 1, 6)}`}
                onClick={() => onNavigate('agents', agent.id)}
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
                  {agent.skills.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Log */}
          <div className="section-title fade-in-up fade-in-up-delay-5">Atividade Recente</div>
          <div className="activity-section fade-in-up fade-in-up-delay-6">
            <div className="activity-log">
              {activities.map((act, i) => (
                <div key={i} className="activity-item">
                  <span className="activity-time">{act.time}</span>
                  <span className="activity-agent">{act.agent}</span>
                  <span className="activity-message">{act.message}</span>
                  <span className={`activity-badge ${act.badge}`}>
                    {act.badge === 'success' ? '✓ OK' : act.badge === 'warning' ? '⚠ Alerta' : 'ℹ Info'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Feed — Right panel */}
        <div className="dashboard-notifications fade-in-up fade-in-up-delay-2">
          <NotificationFeed />
        </div>
      </div>
    </>
  )
}
