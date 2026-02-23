import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import DocumentsPage from './pages/DocumentsPage'
import MonitorPage from './pages/MonitorPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [focusAgent, setFocusAgent] = useState(null)

  const handleNavigate = (page, agentId) => {
    setActivePage(page)
    if (agentId) {
      setFocusAgent(agentId)
    } else {
      setFocusAgent(null)
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'agents':
        return <AgentsPage focusAgent={focusAgent} />
      case 'documents':
        return <DocumentsPage />
      case 'monitor':
        return <MonitorPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
