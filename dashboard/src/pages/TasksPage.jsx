import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import { useAgents } from '../context/AgentContext'
import PageHeader from '../components/PageHeader'

const priorityConfig = {
    critical: { label: '🔴 Crítica', className: 'priority-critical' },
    high: { label: '🟠 Alta', className: 'priority-high' },
    medium: { label: '🟡 Média', className: 'priority-medium' },
    low: { label: '🟢 Baixa', className: 'priority-low' },
}

const statusConfig = {
    pending: { label: 'Pendente', icon: '⏳' },
    running: { label: 'Em Execução', icon: '▶️' },
    completed: { label: 'Concluída', icon: '✅' },
    failed: { label: 'Falhou', icon: '❌' },
}

const workflowStatusConfig = {
    active: { label: 'Ativo', className: 'wf-active' },
    inactive: { label: 'Inativo', className: 'wf-inactive' },
    paused: { label: 'Pausado', className: 'wf-paused' },
}

export default function TasksPage() {
    const { tasks, workflows, tasksByStatus, createTask, deleteTask, executeTask, deleteWorkflow } = useTasks()
    const { agents } = useAgents()
    const [activeTab, setActiveTab] = useState('tasks')
    const [filter, setFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', estimatedDuration: 30 })

    // Filtered tasks
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

    // Format date
    const formatDate = (d) => {
        if (!d) return '—'
        const dt = new Date(d)
        return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    }

    // Handle create
    const handleCreate = async () => {
        if (!newTask.title.trim()) return
        await createTask({
            ...newTask,
            dueDate: new Date(Date.now() + 86400000),
            estimatedDuration: parseInt(newTask.estimatedDuration) || 30,
        })
        setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', estimatedDuration: 30 })
        setShowCreateModal(false)
    }

    return (
        <>
            <PageHeader
                title="Tarefas & Workflows"
                description="Gerencie tarefas, atribua a agentes e acompanhe workflows automatizados."
            />

            {/* Tabs */}
            <div className="tasks-tabs fade-in-up fade-in-up-delay-1">
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    📋 Tarefas <span className="tab-count">{tasks.length}</span>
                </button>
                <button className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
                    🔄 Workflows <span className="tab-count">{workflows.length}</span>
                </button>
            </div>

            {activeTab === 'tasks' && (
                <>
                    {/* Task Stats */}
                    <div className="task-stats fade-in-up fade-in-up-delay-1">
                        <div className="task-stat-card" onClick={() => setFilter('all')}>
                            <div className="task-stat-value">{tasks.length}</div>
                            <div className="task-stat-label">Total</div>
                        </div>
                        <div className="task-stat-card running" onClick={() => setFilter('running')}>
                            <div className="task-stat-value">{tasksByStatus.running.length}</div>
                            <div className="task-stat-label">Em Execução</div>
                        </div>
                        <div className="task-stat-card pending" onClick={() => setFilter('pending')}>
                            <div className="task-stat-value">{tasksByStatus.pending.length}</div>
                            <div className="task-stat-label">Pendentes</div>
                        </div>
                        <div className="task-stat-card completed" onClick={() => setFilter('completed')}>
                            <div className="task-stat-value">{tasksByStatus.completed.length}</div>
                            <div className="task-stat-label">Concluídas</div>
                        </div>
                    </div>

                    {/* Action bar */}
                    <div className="task-action-bar fade-in-up fade-in-up-delay-2">
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            + Nova Tarefa
                        </button>
                        <div className="task-filter-group">
                            {['all', 'pending', 'running', 'completed', 'failed'].map(f => (
                                <button
                                    key={f}
                                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f === 'all' ? 'Todas' : statusConfig[f]?.label || f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="task-list fade-in-up fade-in-up-delay-2">
                        {filteredTasks.length === 0 && (
                            <div className="empty-state">Nenhuma tarefa encontrada.</div>
                        )}
                        {filteredTasks.map((task) => {
                            const agent = agents.find(a => a.id === task.assignedTo)
                            const priority = priorityConfig[task.priority] || priorityConfig.medium
                            const status = statusConfig[task.status] || statusConfig.pending
                            return (
                                <div key={task.id} className={`task-card ${task.status}`}>
                                    <div className="task-card-header">
                                        <div className="task-card-title">
                                            <span className="task-status-icon">{status.icon}</span>
                                            <h4>{task.title}</h4>
                                        </div>
                                        <span className={`priority-badge ${priority.className}`}>{priority.label}</span>
                                    </div>
                                    <p className="task-card-desc">{task.description}</p>
                                    <div className="task-card-meta">
                                        <span className="task-meta-item">
                                            {agent ? `${agent.icon} ${agent.name}` : '—'}
                                        </span>
                                        <span className="task-meta-item">📅 {formatDate(task.dueDate)}</span>
                                        <span className="task-meta-item">⏱ {task.estimatedDuration}min</span>
                                    </div>
                                    {/* Progress bar */}
                                    {task.status === 'running' && (
                                        <div className="task-progress">
                                            <div className="task-progress-bar" style={{ width: `${task.progress}%` }}>
                                                <span>{task.progress}%</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Actions */}
                                    <div className="task-card-actions">
                                        {task.status === 'pending' && (
                                            <button className="btn-sm btn-accent" onClick={() => executeTask(task.id)}>▶ Executar</button>
                                        )}
                                        <button className="btn-sm btn-danger" onClick={() => deleteTask(task.id)}>🗑</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {activeTab === 'workflows' && (
                <div className="workflow-list fade-in-up fade-in-up-delay-2">
                    {workflows.length === 0 && <div className="empty-state">Nenhum workflow encontrado.</div>}
                    {workflows.map(wf => {
                        const wfStatus = workflowStatusConfig[wf.status] || workflowStatusConfig.inactive
                        return (
                            <div key={wf.id} className="workflow-card">
                                <div className="workflow-card-header">
                                    <div>
                                        <h4>{wf.name}</h4>
                                        <p>{wf.description}</p>
                                    </div>
                                    <span className={`wf-status-badge ${wfStatus.className}`}>{wfStatus.label}</span>
                                </div>
                                <div className="workflow-card-meta">
                                    <span>⏰ Cron: <code>{wf.schedule}</code></span>
                                    <span>📋 {wf.tasks.length} tarefa(s)</span>
                                    <span>🕐 Última: {formatDate(wf.lastRun)}</span>
                                    <span>➡️ Próxima: {formatDate(wf.nextRun)}</span>
                                </div>
                                {wf.executionHistory.length > 0 && (
                                    <div className="workflow-history">
                                        <div className="workflow-history-title">Histórico</div>
                                        {wf.executionHistory.slice(0, 3).map((ex, i) => (
                                            <div key={i} className={`wf-history-item ${ex.status}`}>
                                                <span>{formatDate(ex.date)}</span>
                                                <span>{ex.duration}min</span>
                                                <span className={`wf-exec-status ${ex.status}`}>
                                                    {ex.status === 'success' ? '✅' : '❌'} {ex.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="task-card-actions">
                                    <button className="btn-sm btn-danger" onClick={() => deleteWorkflow(wf.id)}>🗑 Remover</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Create Task Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Nova Tarefa</h3>
                        <div className="modal-form">
                            <div className="form-group">
                                <label>Título</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Ex: Enviar relatório mensal"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Detalhes da tarefa..."
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Atribuir a</label>
                                    <select
                                        value={newTask.assignedTo}
                                        onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}
                                    >
                                        <option value="">Selecione um agente</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Prioridade</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                                    >
                                        <option value="low">🟢 Baixa</option>
                                        <option value="medium">🟡 Média</option>
                                        <option value="high">🟠 Alta</option>
                                        <option value="critical">🔴 Crítica</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Duração (min)</label>
                                    <input
                                        type="number"
                                        value={newTask.estimatedDuration}
                                        onChange={e => setNewTask(p => ({ ...p, estimatedDuration: e.target.value }))}
                                        min={1}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleCreate}>Criar Tarefa</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
