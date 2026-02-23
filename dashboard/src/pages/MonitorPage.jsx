import PageHeader from '../components/PageHeader'

const services = [
  { name: 'Caio Agent', icon: '🐱', status: 'online', uptime: '99.8%', lastCheck: '1 min', response: '145ms' },
  { name: 'Telegram Bot', icon: '📱', status: 'online', uptime: '99.9%', lastCheck: '30s', response: '89ms' },
  { name: 'Email IMAP', icon: '📧', status: 'online', uptime: '98.5%', lastCheck: '2 min', response: '340ms' },
  { name: 'Dashboard', icon: '📊', status: 'online', uptime: '100%', lastCheck: '5s', response: '12ms' },
  { name: 'Google Calendar', icon: '📅', status: 'online', uptime: '99.7%', lastCheck: '5 min', response: '210ms' },
  { name: 'OpenRouter API', icon: '🤖', status: 'busy', uptime: '95.2%', lastCheck: '1 min', response: '1.2s' },
]

const tokenHistory = [42, 38, 55, 48, 67, 53, 71, 62, 85, 73, 91, 82, 96, 88, 75, 68, 92, 87, 79, 95, 103, 98, 112, 142]

const logs = [
  { time: '22:13:02', level: 'INFO', message: 'Telegram bot @CaioAgentbot connected' },
  { time: '22:12:58', level: 'INFO', message: 'Agent loop started' },
  { time: '22:12:55', level: 'INFO', message: 'Starting telegram channel...' },
  { time: '22:12:55', level: 'INFO', message: 'Starting email channel...' },
  { time: '22:12:50', level: 'INFO', message: 'Heartbeat started (every 1800s)' },
  { time: '22:12:48', level: 'INFO', message: 'Email send tool registered' },
  { time: '22:12:45', level: 'INFO', message: 'Google Calendar tool registered' },
  { time: '22:12:40', level: 'DEBUG', message: 'Loading config from ~/.nanobot/config.json' },
  { time: '22:12:38', level: 'INFO', message: 'Gateway starting...' },
  { time: '22:10:15', level: 'WARNING', message: 'Model gemini/gemini-2.0-flash-lite failed, trying fallback...' },
  { time: '22:09:50', level: 'INFO', message: 'Processing message from telegram:205798346' },
  { time: '22:05:30', level: 'INFO', message: 'Memory consolidation: 2 messages archived' },
]

const systemInfo = [
  { label: 'OS', value: 'Ubuntu 22.04 LTS' },
  { label: 'Docker', value: '24.0.7' },
  { label: 'Python', value: '3.14.0' },
  { label: 'Node.js', value: '22.15.0' },
  { label: 'Nanobot', value: 'v3.0.0' },
  { label: 'Uptime', value: '14d 7h 32m' },
]

const levelColors = {
  INFO: '#00d4aa',
  DEBUG: '#78909c',
  WARNING: '#ffb347',
  ERROR: '#ff5252',
}

export default function MonitorPage() {
  const maxToken = Math.max(...tokenHistory)

  return (
    <>
      <PageHeader
        title="Monitoramento"
        description="Status dos serviços, consumo de tokens e logs do gateway em tempo real."
      />

      {/* Service Status Grid */}
      <div className="section-title fade-in-up fade-in-up-delay-1">Status dos Serviços</div>
      <div className="monitor-grid fade-in-up fade-in-up-delay-1">
        {services.map(svc => (
          <div key={svc.name} className="monitor-card">
            <div className="monitor-card-header">
              <span className="monitor-icon">{svc.icon}</span>
              <span className="monitor-name">{svc.name}</span>
              <span className={`monitor-status ${svc.status}`}>
                <span className="dot"></span>
                {svc.status === 'online' ? 'Online' : 'Instável'}
              </span>
            </div>
            <div className="monitor-stats">
              <div className="monitor-stat">
                <div className="monitor-stat-label">Uptime</div>
                <div className="monitor-stat-value">{svc.uptime}</div>
              </div>
              <div className="monitor-stat">
                <div className="monitor-stat-label">Resposta</div>
                <div className="monitor-stat-value">{svc.response}</div>
              </div>
              <div className="monitor-stat">
                <div className="monitor-stat-label">Último check</div>
                <div className="monitor-stat-value">{svc.lastCheck}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Token Chart */}
      <div className="section-title fade-in-up fade-in-up-delay-2">Consumo de Tokens (24h)</div>
      <div className="token-chart fade-in-up fade-in-up-delay-2">
        <div className="sparkline">
          {tokenHistory.map((val, i) => (
            <div
              key={i}
              className="spark-bar"
              style={{ height: `${(val / maxToken) * 100}%` }}
              title={`${val}k tokens`}
            >
              <span className="spark-tooltip">{val}k</span>
            </div>
          ))}
        </div>
        <div className="sparkline-labels">
          <span>00h</span>
          <span>06h</span>
          <span>12h</span>
          <span>18h</span>
          <span>Agora</span>
        </div>
      </div>

      {/* Logs + System Info */}
      <div className="monitor-bottom fade-in-up fade-in-up-delay-3">
        {/* Gateway Logs */}
        <div className="logs-section">
          <div className="section-title">Logs do Gateway</div>
          <div className="log-viewer">
            {logs.map((log, i) => (
              <div key={i} className="log-line">
                <span className="log-time">{log.time}</span>
                <span className="log-level" style={{ color: levelColors[log.level] }}>{log.level}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="system-info-section">
          <div className="section-title">Sistema</div>
          <div className="system-info-list">
            {systemInfo.map(info => (
              <div key={info.label} className="system-info-item">
                <span className="system-label">{info.label}</span>
                <span className="system-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
