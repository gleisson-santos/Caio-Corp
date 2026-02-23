import { useState } from 'react'
import PageHeader from '../components/PageHeader'

const documents = [
  { id: 1, name: 'relatorio-q1.pptx', type: 'PPTX', icon: '📑', size: '2.4 MB', date: '22/02 21:45', agent: 'Doc Specialist', preview: true },
  { id: 2, name: 'analise-vendas.pdf', type: 'PDF', icon: '📄', size: '1.1 MB', date: '22/02 18:30', agent: 'Doc Specialist', preview: true },
  { id: 3, name: 'planilha-materiais.xlsx', type: 'Excel', icon: '📊', size: '456 KB', date: '21/02 16:00', agent: 'Doc Specialist', preview: false },
  { id: 4, name: 'audit-report.md', type: 'MD', icon: '📝', size: '12 KB', date: '21/02 14:20', agent: 'Code Analyst', preview: true },
  { id: 5, name: 'scraped-data.json', type: 'JSON', icon: '📋', size: '89 KB', date: '20/02 19:00', agent: 'Web Cloner', preview: true },
  { id: 6, name: 'landing-copy.md', type: 'MD', icon: '✍️', size: '8 KB', date: '20/02 15:30', agent: 'Content Writer', preview: true },
  { id: 7, name: 'email-summary-feb.md', type: 'MD', icon: '📧', size: '15 KB', date: '19/02 22:00', agent: 'Email Sentinel', preview: true },
  { id: 8, name: 'sprint-12-review.pptx', type: 'PPTX', icon: '📑', size: '3.8 MB', date: '18/02 10:00', agent: 'Doc Specialist', preview: true },
]

const typeColors = {
  PPTX: '#e65100',
  PDF: '#c62828',
  Excel: '#2e7d32',
  MD: '#1565c0',
  JSON: '#6a1b9a',
}

export default function DocumentsPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState(null)

  const types = ['all', ...new Set(documents.map(d => d.type))]

  const filtered = documents.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || d.type === filterType
    return matchSearch && matchType
  })

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Visualize e gerencie todos os documentos gerados pelos agentes."
      />

      {/* Stats */}
      <div className="doc-page-stats fade-in-up fade-in-up-delay-1">
        <div className="doc-stat-card">
          <div className="doc-stat-icon">📑</div>
          <div className="doc-stat-value">{documents.filter(d => d.type === 'PPTX').length}</div>
          <div className="doc-stat-label">Apresentações</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-icon">📄</div>
          <div className="doc-stat-value">{documents.filter(d => d.type === 'PDF').length}</div>
          <div className="doc-stat-label">PDFs</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-icon">📊</div>
          <div className="doc-stat-value">{documents.filter(d => d.type === 'Excel').length}</div>
          <div className="doc-stat-label">Planilhas</div>
        </div>
        <div className="doc-stat-card">
          <div className="doc-stat-icon">📝</div>
          <div className="doc-stat-value">{documents.filter(d => ['MD', 'JSON'].includes(d.type)).length}</div>
          <div className="doc-stat-label">Outros</div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="doc-toolbar fade-in-up fade-in-up-delay-2">
        <div className="doc-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="doc-filters">
          {types.map(t => (
            <button
              key={t}
              className={`filter-btn ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className="doc-table-wrapper fade-in-up fade-in-up-delay-3">
        <div className="docs-table">
          <div className="docs-table-header">
            <span className="col-name">Arquivo</span>
            <span className="col-type">Tipo</span>
            <span className="col-size">Tamanho</span>
            <span className="col-date">Data</span>
            <span className="col-agent">Agente</span>
          </div>
          {filtered.map(doc => (
            <div
              key={doc.id}
              className={`docs-table-row ${selectedDoc === doc.id ? 'selected' : ''}`}
              onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
            >
              <span className="col-name">
                <span className="doc-icon">{doc.icon}</span>
                {doc.name}
              </span>
              <span className="col-type">
                <span className="type-badge" style={{ background: typeColors[doc.type] + '20', color: typeColors[doc.type] }}>
                  {doc.type}
                </span>
              </span>
              <span className="col-size">{doc.size}</span>
              <span className="col-date">{doc.date}</span>
              <span className="col-agent">{doc.agent}</span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div>Nenhum documento encontrado</div>
          </div>
        )}
      </div>
    </>
  )
}
