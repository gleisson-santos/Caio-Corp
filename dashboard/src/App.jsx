import { useState } from 'react'
import './App.css'

// === DATA ===
const agents = [
  {
    id: 'code-analyst',
    name: 'Code Analyst',
    role: 'CTO',
    icon: '🧑‍💻',
    iconClass: 'code',
    status: 'online',
    description: 'Auditoria de segurança, refatoração e análise de performance de código.',
    skills: ['OWASP', 'TDD', 'Python', 'JS'],
  },
  {
    id: 'design-director',
    name: 'Design Director',
    role: 'Creative Lead',
    icon: '🎨',
    iconClass: 'design',
    status: 'idle',
    description: 'Análise de UI/UX, guidelines de design e prototipagem visual.',
    skills: ['Figma', 'UX', 'A11y', 'CSS'],
  },
  {
    id: 'doc-specialist',
    name: 'Doc Specialist',
    role: 'Executive Assistant',
    icon: '📊',
    iconClass: 'docs',
    status: 'busy',
    description: 'Transforma Excel e dados em apresentações PPTX e relatórios PDF profissionais.',
    skills: ['PPTX', 'Excel', 'PDF', 'Charts'],
  },
  {
    id: 'email-sentinel',
    name: 'Email Sentinel',
    role: 'Security Guard',
    icon: '🛡️',
    iconClass: 'sentinel',
    status: 'online',
    description: 'Monitoramento 24h de e-mails com alertas inteligentes via Telegram.',
    skills: ['IMAP', 'SMTP', 'Alerts', '24/7'],
  },
  {
    id: 'web-cloner',
    name: 'Web Cloner',
    role: 'Scraper Specialist',
    icon: '🕷️',
    iconClass: 'scraper',
    status: 'idle',
    description: 'Clonagem inteligente de sites, scraping de dados e automação web.',
    skills: ['Scraping', 'HTTP', 'DOM', 'API'],
  },
  {
    id: 'content-writer',
    name: 'Content Writer',
    role: 'Copywriter',
    icon: '✍️',
    iconClass: 'writer',
    status: 'idle',
    description: 'Criação de textos persuasivos, artigos, copy para landing pages e SEO.',
    skills: ['SEO', 'Copy', 'Blog', 'Social'],
  },
]

const activities = [
  { time: '19:15', agent: 'Email Sentinel', message: 'Novo e-mail de contato@embasa.ba.gov.br detectado e resumido.', badge: 'info' },
  { time: '19:10', agent: 'Doc Specialist', message: 'Apresentação "Relatório Q1" gerada com sucesso (12 slides).', badge: 'success' },
  { time: '18:45', agent: 'Code Analyst', message: 'Auditoria de segurança completa: 0 vulnerabilidades críticas.', badge: 'success' },
  { time: '18:30', agent: 'Caio CEO', message: 'Delegou tarefa de análise de performance ao Code Analyst.', badge: 'info' },
  { time: '17:55', agent: 'Web Cloner', message: 'Dados extraídos de 3 páginas salvas em workspace/data/.', badge: 'success' },
  { time: '17:20', agent: 'Email Sentinel', message: 'Alerta enviado ao Telegram: fatura vencendo amanhã.', badge: 'warning' },
]

const statusConfig = {
  online: 'Online',
  busy: 'Trabalhando',
  idle: 'Disponível',
}

function App() {
  const [activeNav, setActiveNav] = useState('dashboard')

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">C</div>
          <div>
            <h1>Caio Corp</h1>
            <span>Agent Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'agents', icon: '🤖', label: 'Agentes' },
            { id: 'documents', icon: '📄', label: 'Documentos' },
            { id: 'monitor', icon: '📡', label: 'Monitoramento' },
            { id: 'settings', icon: '⚙️', label: 'Configurações' },
          ].map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-badge">
            <div className="status-dot"></div>
            Sistema operacional — v3.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
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

        {/* Metrics */}
        <div className="section-title fade-in-up fade-in-up-delay-2">Métricas</div>
        <div className="metrics-grid fade-in-up fade-in-up-delay-2">
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
      </main>
    </div>
  )
}

export default App
