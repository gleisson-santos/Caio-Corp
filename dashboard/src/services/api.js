/**
 * Caio Corp — API Service Layer
 * 
 * Centralizes all data access. Currently uses mock data.
 * When the nanobot REST API is built, replace mocks with fetch() calls.
 * 
 * Usage: import { api } from '../services/api'
 */

// ─── MOCK DATA ─────────────────────────────────────────────────────

const defaultSettings = {
    model: 'gemini/gemini-2.0-flash',
    maxTokens: 8192,
    temperature: 0.7,
    maxToolIterations: 20,
    memoryWindow: 50,
    openrouterKey: 'sk-or-v1-****...****f75e',
    geminiKey: 'AIzaSy****...****7wM',
    braveKey: 'BSA****...****dVk',
    telegramEnabled: true,
    emailEnabled: true,
    whatsappEnabled: false,
    telegramToken: '8132****...****QpmQ',
    botName: 'CaioAgent',
}

const AGENTS = [
    {
        id: 'caio-ceo',
        name: 'Caio',
        role: 'CEO — Maestro Central',
        tier: 0,
        parentId: null,
        icon: '🐱',
        iconClass: 'ceo',
        status: 'online',
        description: 'Orquestrador central da Caio Corp. Recebe ordens, planeja e delega para agentes especializados.',
        capabilities: ['Orquestração', 'Delegação', 'Planejamento', 'Telegram', 'Email'],
        performanceMetrics: {
            tasksCompleted: 312,
            averageExecutionTime: 4.2,
            successRate: 98.5,
            errorRate: 1.5,
            activeTasksCount: 3,
        },
    },
    {
        id: 'email-sentinel',
        name: 'Email Sentinel',
        role: 'Security Guard',
        tier: 1,
        parentId: 'caio-ceo',
        icon: '🛡️',
        iconClass: 'sentinel',
        status: 'online',
        description: 'Monitoramento 24h de e-mails com alertas inteligentes e resumos IA.',
        capabilities: ['IMAP', 'SMTP', 'Resumos IA', 'Alertas 24/7'],
        performanceMetrics: {
            tasksCompleted: 1847,
            averageExecutionTime: 1.8,
            successRate: 99.2,
            errorRate: 0.8,
            activeTasksCount: 1,
        },
    },
    {
        id: 'schedule-master',
        name: 'Schedule Master',
        role: 'Time Keeper',
        tier: 1,
        parentId: 'caio-ceo',
        icon: '📅',
        iconClass: 'scheduler',
        status: 'online',
        description: 'Gerencia agendamentos, Google Calendar e alertas automáticos.',
        capabilities: ['Calendar', 'Cron', 'Alertas', 'Lembretes'],
        performanceMetrics: {
            tasksCompleted: 523,
            averageExecutionTime: 2.1,
            successRate: 97.8,
            errorRate: 2.2,
            activeTasksCount: 2,
        },
    },
    {
        id: 'doc-specialist',
        name: 'Doc Specialist',
        role: 'Executive Assistant',
        tier: 1,
        parentId: 'caio-ceo',
        icon: '📊',
        iconClass: 'docs',
        status: 'busy',
        description: 'Gera documentos, apresentações PPTX e analisa planilhas.',
        capabilities: ['PPTX', 'Excel', 'PDF', 'Charts', 'Análise de Dados'],
        performanceMetrics: {
            tasksCompleted: 89,
            averageExecutionTime: 12.5,
            successRate: 95.0,
            errorRate: 5.0,
            activeTasksCount: 1,
        },
    },
    {
        id: 'code-analyst',
        name: 'Code Analyst',
        role: 'CTO',
        tier: 1,
        parentId: 'caio-ceo',
        icon: '🧑‍💻',
        iconClass: 'code',
        status: 'online',
        description: 'Auditoria de segurança, refatoração e análise de performance.',
        capabilities: ['OWASP', 'TDD', 'Python', 'JS', 'Docker'],
        performanceMetrics: {
            tasksCompleted: 156,
            averageExecutionTime: 8.3,
            successRate: 96.2,
            errorRate: 3.8,
            activeTasksCount: 0,
        },
    },
    {
        id: 'web-cloner',
        name: 'Web Cloner',
        role: 'Scraper Specialist',
        tier: 2,
        parentId: 'code-analyst',
        icon: '🕷️',
        iconClass: 'scraper',
        status: 'idle',
        description: 'Clonagem inteligente de sites, scraping e automação web.',
        capabilities: ['Scraping', 'HTTP', 'DOM', 'API'],
        performanceMetrics: {
            tasksCompleted: 34,
            averageExecutionTime: 15.0,
            successRate: 91.2,
            errorRate: 8.8,
            activeTasksCount: 0,
        },
    },
    {
        id: 'content-writer',
        name: 'Content Writer',
        role: 'Copywriter',
        tier: 2,
        parentId: 'doc-specialist',
        icon: '✍️',
        iconClass: 'writer',
        status: 'idle',
        description: 'Textos persuasivos, artigos, copy para landing pages e SEO.',
        capabilities: ['SEO', 'Copy', 'Blog', 'Social', 'Landing Pages'],
        performanceMetrics: {
            tasksCompleted: 67,
            averageExecutionTime: 6.7,
            successRate: 94.0,
            errorRate: 6.0,
            activeTasksCount: 0,
        },
    },
]

const TASKS = [
    {
        id: 'task-001',
        title: 'Monitorar emails urgentes',
        description: 'Verificar caixa de entrada a cada 30s e alertar sobre emails prioritários.',
        assignedTo: 'email-sentinel',
        priority: 'high',
        status: 'running',
        dueDate: new Date('2026-02-24T23:59:00'),
        estimatedDuration: 1440,
        actualDuration: null,
        dependencies: [],
        progress: 72,
        result: null,
        error: null,
        createdAt: new Date('2026-02-23T08:00:00'),
    },
    {
        id: 'task-002',
        title: 'Gerar relatório semanal',
        description: 'Compilar métricas da semana e gerar apresentação PPTX.',
        assignedTo: 'doc-specialist',
        priority: 'medium',
        status: 'running',
        dueDate: new Date('2026-02-24T18:00:00'),
        estimatedDuration: 60,
        actualDuration: null,
        dependencies: [],
        progress: 45,
        result: null,
        error: null,
        createdAt: new Date('2026-02-23T14:00:00'),
    },
    {
        id: 'task-003',
        title: 'Auditoria de segurança do nanobot',
        description: 'Analisar código Python do gateway por vulnerabilidades OWASP.',
        assignedTo: 'code-analyst',
        priority: 'high',
        status: 'completed',
        dueDate: new Date('2026-02-23T20:00:00'),
        estimatedDuration: 120,
        actualDuration: 95,
        dependencies: [],
        progress: 100,
        result: { vulnerabilities: 0, suggestions: 3 },
        error: null,
        createdAt: new Date('2026-02-23T10:00:00'),
    },
    {
        id: 'task-004',
        title: 'Lembrete: Reunião Sprint Review',
        description: 'Enviar alerta 30min antes da reunião de sprint.',
        assignedTo: 'schedule-master',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date('2026-02-23T22:00:00'),
        estimatedDuration: 5,
        actualDuration: 2,
        dependencies: [],
        progress: 100,
        result: { alertSent: true },
        error: null,
        createdAt: new Date('2026-02-23T09:00:00'),
    },
    {
        id: 'task-005',
        title: 'Scraping de preços concorrentes',
        description: 'Coletar preços de 3 sites concorrentes e gerar comparativo.',
        assignedTo: 'web-cloner',
        priority: 'low',
        status: 'pending',
        dueDate: new Date('2026-02-25T12:00:00'),
        estimatedDuration: 45,
        actualDuration: null,
        dependencies: [],
        progress: 0,
        result: null,
        error: null,
        createdAt: new Date('2026-02-23T16:00:00'),
    },
    {
        id: 'task-006',
        title: 'Criar copy para landing page',
        description: 'Escrever textos persuasivos para a landing page do produto.',
        assignedTo: 'content-writer',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date('2026-02-26T18:00:00'),
        estimatedDuration: 90,
        actualDuration: null,
        dependencies: ['task-005'],
        progress: 0,
        result: null,
        error: null,
        createdAt: new Date('2026-02-23T16:30:00'),
    },
]

const WORKFLOWS = [
    {
        id: 'wf-001',
        name: 'Rotina Matinal',
        description: 'Verificar emails, agenda do dia e enviar resumo no Telegram.',
        tasks: ['task-001', 'task-004'],
        schedule: '0 9 * * *',
        status: 'active',
        lastRun: new Date('2026-02-23T09:00:00'),
        nextRun: new Date('2026-02-24T09:00:00'),
        executionHistory: [
            { date: new Date('2026-02-23T09:00:00'), duration: 12, status: 'success' },
            { date: new Date('2026-02-22T09:00:00'), duration: 15, status: 'success' },
            { date: new Date('2026-02-21T09:00:00'), duration: 11, status: 'success' },
        ],
    },
    {
        id: 'wf-002',
        name: 'Relatório Semanal',
        description: 'Compilar métricas, gerar PPTX e enviar por email.',
        tasks: ['task-002'],
        schedule: '0 18 * * 5',
        status: 'active',
        lastRun: new Date('2026-02-21T18:00:00'),
        nextRun: new Date('2026-02-28T18:00:00'),
        executionHistory: [
            { date: new Date('2026-02-21T18:00:00'), duration: 45, status: 'success' },
            { date: new Date('2026-02-14T18:00:00'), duration: 52, status: 'success' },
        ],
    },
    {
        id: 'wf-003',
        name: 'Monitoramento de Preços',
        description: 'Scraping diário de preços e alerta de variações.',
        tasks: ['task-005'],
        schedule: '0 8 * * 1-5',
        status: 'inactive',
        lastRun: null,
        nextRun: null,
        executionHistory: [],
    },
]

const ACTIVITIES = [
    { id: 1, time: '22:03', agent: 'Email Sentinel', agentId: 'email-sentinel', message: 'Novo e-mail de contato@embasa.ba.gov.br resumido com IA.', type: 'info', timestamp: new Date('2026-02-23T22:03:00') },
    { id: 2, time: '21:50', agent: 'Schedule Master', agentId: 'schedule-master', message: 'Alerta enviado: Reunião de Sprint em 30 minutos.', type: 'warning', timestamp: new Date('2026-02-23T21:50:00') },
    { id: 3, time: '21:45', agent: 'Doc Specialist', agentId: 'doc-specialist', message: 'Apresentação "Relatório Q1" gerada com sucesso (12 slides).', type: 'success', timestamp: new Date('2026-02-23T21:45:00') },
    { id: 4, time: '21:30', agent: 'Caio', agentId: 'caio-ceo', message: 'Delegou análise de performance ao Code Analyst.', type: 'info', timestamp: new Date('2026-02-23T21:30:00') },
    { id: 5, time: '21:15', agent: 'Code Analyst', agentId: 'code-analyst', message: 'Auditoria completa: 0 vulnerabilidades críticas.', type: 'success', timestamp: new Date('2026-02-23T21:15:00') },
    { id: 6, time: '20:45', agent: 'Email Sentinel', agentId: 'email-sentinel', message: 'Alerta Telegram: fatura vencendo amanhã — R$ 189,90.', type: 'warning', timestamp: new Date('2026-02-23T20:45:00') },
    { id: 7, time: '20:30', agent: 'Schedule Master', agentId: 'schedule-master', message: 'Lembrete criado: Reunião com Thiago amanhã 10h.', type: 'info', timestamp: new Date('2026-02-23T20:30:00') },
    { id: 8, time: '20:15', agent: 'Content Writer', agentId: 'content-writer', message: 'Artigo "Como Automatizar com IA" rascunhado (2.400 palavras).', type: 'success', timestamp: new Date('2026-02-23T20:15:00') },
]

const SERVICES = [
    { id: 'agent', name: 'Caio Agent', icon: '🐱', status: 'online', uptime: '99.8%', lastCheck: '1 min', response: '145ms' },
    { id: 'telegram', name: 'Telegram Bot', icon: '📱', status: 'online', uptime: '99.9%', lastCheck: '30s', response: '89ms' },
    { id: 'email', name: 'Email IMAP', icon: '📧', status: 'online', uptime: '98.5%', lastCheck: '2 min', response: '340ms' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊', status: 'online', uptime: '100%', lastCheck: '5s', response: '12ms' },
    { id: 'calendar', name: 'Google Calendar', icon: '📅', status: 'online', uptime: '99.7%', lastCheck: '5 min', response: '210ms' },
    { id: 'openrouter', name: 'OpenRouter API', icon: '🤖', status: 'online', uptime: '95.2%', lastCheck: '1 min', response: '1.2s' },
]

const ALERTS = [
    { id: 'alert-1', type: 'warning', title: 'Fatura vencendo amanhã', message: 'R$ 189,90 — Hetzner Cloud', timestamp: new Date('2026-02-23T20:45:00'), acknowledged: false },
    { id: 'alert-2', type: 'info', title: 'Deploy concluído', message: 'nanobot/dashboard atualizado no Docker Hub.', timestamp: new Date('2026-02-23T18:00:00'), acknowledged: true },
    { id: 'alert-3', type: 'error', title: 'SMTP bloqueado', message: 'Porta 587 bloqueada pela VPS — usar relay.', timestamp: new Date('2026-02-23T15:30:00'), acknowledged: false },
]

// ─── SIMULATED DELAY ───────────────────────────────────────────────

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

// ─── API OBJECT ────────────────────────────────────────────────────

let _agents = [...AGENTS]
let _tasks = [...TASKS]
let _workflows = [...WORKFLOWS]
let _activities = [...ACTIVITIES]
let _nextTaskId = 7
let _nextWfId = 4
let _settings = { ...defaultSettings }

export const api = {
    // ── Settings ────────────────────────────────────────
    async getSettings() {
        await delay()
        return { ..._settings }
    },

    async updateSettings(data) {
        await delay(500)
        _settings = { ..._settings, ...data }
        return { ..._settings }
    },

    // ── Agents ───────────────────────────────────────────
    async getAgents() {
        await delay()
        return [..._agents]
    },

    async getAgent(id) {
        await delay()
        return _agents.find(a => a.id === id) || null
    },

    async createAgent(data) {
        await delay(300)
        const agent = {
            id: `agent-${Date.now()}`,
            status: 'idle',
            performanceMetrics: { tasksCompleted: 0, averageExecutionTime: 0, successRate: 0, errorRate: 0, activeTasksCount: 0 },
            ...data,
        }
        _agents.push(agent)
        return agent
    },

    async updateAgent(id, data) {
        await delay(300)
        const idx = _agents.findIndex(a => a.id === id)
        if (idx === -1) throw new Error('Agent not found')
        _agents[idx] = { ..._agents[idx], ...data }
        return _agents[idx]
    },

    async deleteAgent(id) {
        await delay(300)
        _agents = _agents.filter(a => a.id !== id)
    },

    // ── Tasks ────────────────────────────────────────────
    async getTasks() {
        await delay()
        return [..._tasks]
    },

    async createTask(data) {
        await delay(300)
        const task = {
            id: `task-${String(_nextTaskId++).padStart(3, '0')}`,
            status: 'pending',
            progress: 0,
            result: null,
            error: null,
            actualDuration: null,
            dependencies: [],
            createdAt: new Date(),
            ...data,
        }
        _tasks.push(task)
        return task
    },

    async updateTask(id, data) {
        await delay(300)
        const idx = _tasks.findIndex(t => t.id === id)
        if (idx === -1) throw new Error('Task not found')
        _tasks[idx] = { ..._tasks[idx], ...data }
        return _tasks[idx]
    },

    async deleteTask(id) {
        await delay(300)
        _tasks = _tasks.filter(t => t.id !== id)
    },

    async executeTask(id) {
        await delay(500)
        const idx = _tasks.findIndex(t => t.id === id)
        if (idx === -1) throw new Error('Task not found')
        _tasks[idx] = { ..._tasks[idx], status: 'running', progress: 10 }
        return _tasks[idx]
    },

    // ── Workflows ────────────────────────────────────────
    async getWorkflows() {
        await delay()
        return [..._workflows]
    },

    async createWorkflow(data) {
        await delay(300)
        const wf = {
            id: `wf-${String(_nextWfId++).padStart(3, '0')}`,
            status: 'inactive',
            lastRun: null,
            nextRun: null,
            executionHistory: [],
            ...data,
        }
        _workflows.push(wf)
        return wf
    },

    async deleteWorkflow(id) {
        await delay(300)
        _workflows = _workflows.filter(w => w.id !== id)
    },

    // ── Activities ───────────────────────────────────────
    async getActivities(limit = 10) {
        await delay()
        return _activities.slice(0, limit)
    },

    // ── Monitoring ───────────────────────────────────────
    async getServices() {
        await delay()
        return [...SERVICES]
    },

    async getAlerts() {
        await delay()
        return [...ALERTS]
    },

    async getTokenHistory() {
        await delay()
        return [42, 38, 55, 48, 67, 53, 71, 62, 85, 73, 91, 82, 96, 88, 75, 68, 92, 87, 79, 95, 103, 98, 112, 142]
    },

    async getSystemInfo() {
        await delay()
        return [
            { label: 'OS', value: 'Ubuntu 22.04 LTS' },
            { label: 'Docker', value: '24.0.7' },
            { label: 'Python', value: '3.14.0' },
            { label: 'Node.js', value: '22.15.0' },
            { label: 'Nanobot', value: 'v3.0.0' },
            { label: 'Uptime', value: '14d 7h 32m' },
        ]
    },

    // ── Metrics (computed) ───────────────────────────────
    async getDashboardMetrics() {
        await delay()
        const agents = _agents
        const tasks = _tasks
        return {
            agentsOnline: agents.filter(a => a.status === 'online' || a.status === 'busy').length,
            totalAgents: agents.length,
            totalTasks: tasks.length,
            tasksRunning: tasks.filter(t => t.status === 'running').length,
            tasksCompleted: tasks.filter(t => t.status === 'completed').length,
            tasksPending: tasks.filter(t => t.status === 'pending').length,
            tokensToday: '142.8k',
            alertsToday: 3,
        }
    },
}
