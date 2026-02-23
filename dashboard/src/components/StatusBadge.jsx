const statusConfig = {
  online: { label: 'Online', color: 'online' },
  busy: { label: 'Trabalhando', color: 'busy' },
  idle: { label: 'Disponível', color: 'idle' },
  offline: { label: 'Offline', color: 'offline' },
}

export default function StatusBadge({ status = 'offline', size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.offline
  return (
    <div className={`agent-status ${config.color} status-${size}`}>
      <span className="dot"></span>
      {config.label}
    </div>
  )
}
