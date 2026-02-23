import { useState } from 'react'

const navItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'agents', icon: '🤖', label: 'Agentes' },
  { id: 'documents', icon: '📄', label: 'Documentos' },
  { id: 'monitor', icon: '📡', label: 'Monitoramento' },
  { id: 'settings', icon: '⚙️', label: 'Configurações' },
]

export default function Sidebar({ activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-logo">
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
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-badge">
          <div className="status-dot"></div>
          {!collapsed && 'Sistema operacional — v3.0'}
        </div>
      </div>
    </aside>
  )
}
