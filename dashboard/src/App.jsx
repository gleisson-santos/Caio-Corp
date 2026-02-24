import { useState } from 'react'
import { AgentProvider } from './context/AgentContext'
import { TaskProvider } from './context/TaskContext'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import AgentsPage from './pages/AgentsPage'
import TasksPage from './pages/TasksPage'
import DocumentsPage from './pages/DocumentsPage'
import MonitorPage from './pages/MonitorPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [focusAgent, setFocusAgent] = useState(null)

  const handleNavigate = (page, agentId) => {
    setActivePage(page)
    setFocusAgent(agentId || null)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />
      case 'agents':
        return <AgentsPage focusAgent={focusAgent} />
      case 'tasks':
        return <TasksPage />
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
    <AgentProvider>
      <TaskProvider>
        <div className="app-layout">
          <Sidebar activePage={activePage} onNavigate={handleNavigate} />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </TaskProvider>
    </AgentProvider>
  )
}

export default App
