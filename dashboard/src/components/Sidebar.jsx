import { useState } from 'react'
import { useTasks } from '../context/TaskContext'

const navItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'agents', icon: '🤖', label: 'Agentes' },
  { id: 'tasks', icon: '📋', label: 'Tarefas' },
  { id: 'documents', icon: '📄', label: 'Documentos' },
  { id: 'monitor', icon: '📡', label: 'Monitoramento' },
  { id: 'settings', icon: '⚙️', label: 'Configurações' },
]

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)
  const { tasksByStatus } = useTasks()
  const pendingCount = tasksByStatus.running.length + tasksByStatus.pending.length

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-logo" onClick={() => onNavigate('dashboard')}>
        <div className="logo-icon">C</div>
        {!collapsed && (
          <div>
            <h1>Caio Corp</h1>
            <span>Agent Platform</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && item.label}
            {!collapsed && item.id === 'tasks' && pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? '→' : '←'}
        </button>
        <div className="status-badge">
          <div className="status-dot"></div>
          {!collapsed && 'Sistema operacional — v3.0'}
        </div>
      </div>
    </aside>
  )
}
