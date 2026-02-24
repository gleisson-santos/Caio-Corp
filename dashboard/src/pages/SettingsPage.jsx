import { useState, useEffect } from 'react'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'

export default function SettingsPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('model')

  useEffect(() => {
    api.getSettings().then(data => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const tabs = [
    { id: 'model', label: '🤖 Modelo', icon: '🤖' },
    { id: 'keys', label: '🔑 API Keys', icon: '🔑' },
    { id: 'channels', label: '📡 Canais', icon: '📡' },
    { id: 'system', label: '💻 Sistema', icon: '💻' },
  ]

  if (loading && !settings) {
    return (
      <>
        <PageHeader title="Configurações" description="Carregando..." />
        <div className="loading-state fade-in-up">⏳ Carregando configurações...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Configure o modelo de IA, API keys, canais de comunicação e preferências do sistema."
        action={
          <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave} disabled={loading}>
            {saved ? '✓ Salvo!' : loading ? '⏳ Salvando...' : '💾 Salvar Alterações'}
          </button>
        }
      />

      <div className="settings-layout fade-in-up fade-in-up-delay-1">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Model Tab */}
          {activeTab === 'model' && (
            <div className="settings-section">
              <div className="settings-group">
                <label className="setting-label">Modelo Principal</label>
                <input
                  type="text"
                  className="setting-input"
                  value={settings.model}
                  onChange={(e) => update('model', e.target.value)}
                />
                <span className="setting-hint">Ex: gemini/gemini-2.0-flash, openrouter/meta-llama/llama-3.3-70b-instruct:free</span>
              </div>

              <div className="settings-row">
                <div className="settings-group">
                  <label className="setting-label">Max Tokens</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={settings.maxTokens}
                    onChange={(e) => update('maxTokens', parseInt(e.target.value))}
                  />
                </div>
                <div className="settings-group">
                  <label className="setting-label">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    className="setting-input"
                    value={settings.temperature}
                    onChange={(e) => update('temperature', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="settings-row">
                <div className="settings-group">
                  <label className="setting-label">Max Tool Iterations</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={settings.maxToolIterations}
                    onChange={(e) => update('maxToolIterations', parseInt(e.target.value))}
                  />
                </div>
                <div className="settings-group">
                  <label className="setting-label">Memory Window</label>
                  <input
                    type="number"
                    className="setting-input"
                    value={settings.memoryWindow}
                    onChange={(e) => update('memoryWindow', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div className="settings-section">
              <div className="settings-group">
                <label className="setting-label">🔑 OpenRouter API Key</label>
                <div className="key-input-row">
                  <input type="password" className="setting-input mono" value={settings.openrouterKey} readOnly />
                  <button className="btn-agent btn-secondary-agent">📋 Copiar</button>
                </div>
              </div>
              <div className="settings-group">
                <label className="setting-label">🔑 Google Gemini API Key</label>
                <div className="key-input-row">
                  <input type="password" className="setting-input mono" value={settings.geminiKey} readOnly />
                  <button className="btn-agent btn-secondary-agent">📋 Copiar</button>
                </div>
              </div>
              <div className="settings-group">
                <label className="setting-label">🔑 Brave Search API Key</label>
                <div className="key-input-row">
                  <input type="password" className="setting-input mono" value={settings.braveKey} readOnly />
                  <button className="btn-agent btn-secondary-agent">📋 Copiar</button>
                </div>
              </div>
              <div className="setting-hint" style={{ marginTop: '16px' }}>
                ⚠️ As chaves são mascaradas por segurança. Edite diretamente no <code>~/.nanobot/config.json</code>
              </div>
            </div>
          )}

          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="settings-section">
              <div className="channel-card">
                <div className="channel-info">
                  <span className="channel-icon">📱</span>
                  <div>
                    <div className="channel-name">Telegram</div>
                    <div className="channel-detail">Bot: @{settings.botName}bot</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.telegramEnabled}
                    onChange={() => update('telegramEnabled', !settings.telegramEnabled)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="channel-card">
                <div className="channel-info">
                  <span className="channel-icon">📧</span>
                  <div>
                    <div className="channel-name">Email (IMAP)</div>
                    <div className="channel-detail">Monitoramento de inbox ativo</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={() => update('emailEnabled', !settings.emailEnabled)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="channel-card">
                <div className="channel-info">
                  <span className="channel-icon">💬</span>
                  <div>
                    <div className="channel-name">WhatsApp (Evolution API)</div>
                    <div className="channel-detail">Requer bridge configuration</div>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.whatsappEnabled}
                    onChange={() => update('whatsappEnabled', !settings.whatsappEnabled)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="settings-section">
              <div className="system-cards">
                <div className="system-card">
                  <div className="system-card-icon">🐱</div>
                  <div className="system-card-title">Caio Corp Agent</div>
                  <div className="system-card-version">v3.0.0</div>
                  <div className="system-card-detail">nanobot framework</div>
                </div>
                <div className="system-card">
                  <div className="system-card-icon">🐳</div>
                  <div className="system-card-title">Docker</div>
                  <div className="system-card-version">24.0.7</div>
                  <div className="system-card-detail">Container runtime</div>
                </div>
                <div className="system-card">
                  <div className="system-card-icon">🐍</div>
                  <div className="system-card-title">Python</div>
                  <div className="system-card-version">3.14.0</div>
                  <div className="system-card-detail">Runtime language</div>
                </div>
                <div className="system-card">
                  <div className="system-card-icon">⚡</div>
                  <div className="system-card-title">Vite</div>
                  <div className="system-card-version">7.3.1</div>
                  <div className="system-card-version-label">Dashboard bundler</div>
                </div>
              </div>

              <div className="danger-zone">
                <div className="section-title-sm">⚠️ Zona de Perigo</div>
                <div className="danger-actions">
                  <button className="btn-danger">🔄 Reiniciar Gateway</button>
                  <button className="btn-danger">🗑️ Limpar Cache</button>
                  <button className="btn-danger destructive">💣 Reset Completo</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

