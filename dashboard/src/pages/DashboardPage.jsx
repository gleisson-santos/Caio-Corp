import { useState, useEffect } from 'react'
import { useAgents } from '../context/AgentContext'
import { useTasks } from '../context/TaskContext'
import { api } from '../services/api'
import NotificationFeed from '../components/NotificationFeed'

const statusConfig = {
  online: 'Online',
  busy: 'Trabalhando',
  idle: 'Disponível',
  offline: 'Offline',
}

const badgeLabel = {
  success: '✓ OK',
  warning: '⚠ Alerta',
  info: 'ℹ Info',
  error: '✗ Erro',
}

export default function DashboardPage({ onNavigate }) {
  const { agents, onlineCount } = useAgents()
  const { tasks, activities, tasksByStatus } = useTasks()
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    api.getDashboardMetrics().then(setMetrics)
  }, [tasks])

  const ceo = agents.find(a => a.tier === 0)
  const teamAgents = agents.filter(a => a.tier > 0)

  return (
    <>
      {/* Page Header */}
      <div className="page-header fade-in-up">
        <h2>Painel de Controle</h2>
        <p>Gerencie seus agentes, monitore atividades e acompanhe métricas em tempo real.</p>
      </div>

      {/* CEO Hero Card */}
      {ceo && (
        <div className="ceo-hero fade-in-up fade-in-up-delay-1">
          <div className="ceo-hero-content">
            <div className="ceo-avatar">{ceo.icon}</div>
            <div className="ceo-info">
              <h3>{ceo.name}</h3>
              <div className="role">{ceo.role}</div>
              <div className="description">{ceo.description}</div>
            </div>
            <div className="ceo-stats">
              <div className="ceo-stat">
                <div className="value">{agents.length}</div>
                <div className="label">Agentes</div>
              </div>
              <div className="ceo-stat">
                <div className="value">24/7</div>
                <div className="label">Uptime</div>
              </div>
              <div className="ceo-stat">
                <div className="value">{metrics?.tokensToday || '—'}</div>
                <div className="label">Tokens Hoje</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid: Metrics + Notifications */}
      <div className="dashboard-grid fade-in-up fade-in-up-delay-2">
        <div className="dashboard-main">
          {/* Metrics */}
          <div className="section-title">Métricas</div>
          <div className="metrics-grid">
            <div className="metric-card" onClick={() => onNavigate('agents')}>
              <div className="metric-label">Agentes Ativos</div>
              <div className="metric-value green">{onlineCount}</div>
              <div className="metric-change positive">de {agents.length} total</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Tokens Consumidos</div>
              <div className="metric-value accent">{metrics?.tokensToday || '—'}</div>
              <div className="metric-change positive">↓ 12% vs média</div>
            </div>
            <div className="metric-card" onClick={() => onNavigate('tasks')}>
              <div className="metric-label">Tarefas Ativas</div>
              <div className="metric-value warm">{tasksByStatus.running.length}</div>
              <div className="metric-change positive">{tasksByStatus.pending.length} pendentes</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Alertas Hoje</div>
              <div className="metric-value red">{metrics?.alertsToday || 0}</div>
              <div className="metric-change negative">1 urgente</div>
            </div>
          </div>

          {/* Agent Grid */}
          <div className="section-title fade-in-up fade-in-up-delay-3">Equipe de Agentes</div>
          <div className="agents-grid">
            {teamAgents.map((agent, i) => (
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
                  {agent.capabilities.map((skill) => (
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
              {activities.map((act) => (
                <div key={act.id} className="activity-item">
                  <span className="activity-time">{act.time}</span>
                  <span className="activity-agent">{act.agent}</span>
                  <span className="activity-message">{act.message}</span>
                  <span className={`activity-badge ${act.type}`}>
                    {badgeLabel[act.type] || act.type}
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
