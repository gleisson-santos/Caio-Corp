/**
 * Caio Corp — API Service Layer
 * 
 * Centralizes all data access. Attempts real API calls and falls back to mocks.
 */

const BASE_URL = 'http://localhost:18791'

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms))

// ─── UTILS ─────────────────────────────────────────────────────────

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options)
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`)
        return await response.json()
    } catch (error) {
        console.warn(`API call to ${endpoint} failed, falling back to mock.`, error)
        return null
    }
}

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
        performanceMetrics: { tasksCompleted: 312, averageExecutionTime: 4.2, successRate: 98.5, errorRate: 1.5, activeTasksCount: 3 },
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
        performanceMetrics: { tasksCompleted: 1847, averageExecutionTime: 1.8, successRate: 99.2, errorRate: 0.8, activeTasksCount: 1 },
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
        performanceMetrics: { tasksCompleted: 523, averageExecutionTime: 2.1, successRate: 97.8, errorRate: 2.2, activeTasksCount: 2 },
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
        performanceMetrics: { tasksCompleted: 89, averageExecutionTime: 12.5, successRate: 95.0, errorRate: 5.0, activeTasksCount: 1 },
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
        progress: 72,
        createdAt: new Date('2026-02-23T08:00:00'),
    },
    {
        id: 'task-002',
        title: 'Gerar relatório semanal',
        description: 'Compilar métricas da semana e gerar apresentação PPTX.',
        assignedTo: 'doc-specialist',
        priority: 'medium',
        status: 'running',
        progress: 45,
        createdAt: new Date('2026-02-23T14:00:00'),
    },
]

const WORKFLOWS = [
    {
        id: 'wf-001',
        name: 'Rotina Matinal',
        description: 'Verificar emails, agenda do dia e enviar resumo no Telegram.',
        tasks: ['task-001'],
        schedule: '0 9 * * *',
        status: 'active',
        lastRun: new Date('2026-02-23T09:00:00'),
        executionHistory: [{ date: new Date('2026-02-23T09:00:00'), duration: 12, status: 'success' }],
    },
]

const ACTIVITIES = [
    { id: 1, time: '22:03', agent: 'Email Sentinel', agentId: 'email-sentinel', message: 'Novo e-mail de contato@embasa.ba.gov.br resumido com IA.', type: 'info', timestamp: new Date('2026-02-23T22:03:00') },
]

// ─── STATE ─────────────────────────────────────────────────────────

let _agents = [...AGENTS]
let _tasks = [...TASKS]
let _activities = [...ACTIVITIES]
let _nextTaskId = 7
let _settings = { ...defaultSettings }

// ─── EXPORTed API ──────────────────────────────────────────────────

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
        const real = await fetchAPI('/api/agents')
        if (real) return real
        await delay()
        return [..._agents]
    },

    async updateAgent(id, data) {
        await delay(500)
        const idx = _agents.findIndex(a => a.id === id)
        if (idx > -1) _agents[idx] = { ..._agents[idx], ...data }
        return _agents[idx]
    },

    // ── Tasks & Workflows ────────────────────────────────
    async getTasks() {
        const real = await fetchAPI('/api/tasks')
        if (real) return real
        await delay()
        return [..._tasks]
    },

    async createTask(data) {
        await delay(1000)
        const newTask = {
            ...data,
            id: `task-${_nextTaskId++}`,
            status: 'pending',
            progress: 0,
            createdAt: new Date(),
        }
        _tasks.unshift(newTask)
        return newTask
    },

    async deleteTask(id) {
        await delay(300)
        _tasks = _tasks.filter(t => t.id !== id)
        return true
    },

    async executeTask(id) {
        await delay(500)
        const task = _tasks.find(t => t.id === id)
        if (task) {
            task.status = 'running'
            task.progress = 10
            const int = setInterval(() => {
                task.progress += 15
                if (task.progress >= 100) {
                    task.progress = 100
                    task.status = 'completed'
                    clearInterval(int)
                }
            }, 1000)
        }
        return task
    },

    async getWorkflows() {
        await delay()
        return [...WORKFLOWS]
    },

    // ── Monitoring & Logs ──────────────────────────────
    async getDashboardMetrics() {
        const real = await fetchAPI('/api/status')
        if (real) return real

        await delay()
        return {
            agentsOnline: _agents.filter(a => a.status === 'online').length,
            tokensToday: 12450,
            docsGenerated: 42,
            alertsToday: 2,
            tokenHistory: [12, 18, 15, 22, 30, 25, 28, 35, 42, 38, 45, 52],
        }
    },

    async getActivities() {
        await delay()
        return [..._activities]
    },

    async getServices() {
        const real = await fetchAPI('/api/status')
        if (real && real.services) return real.services

        await delay()
        return [
            { id: 'tg', name: 'Telegram', status: 'online', uptime: '14d 2h', response: '120ms', icon: '📱' },
            { id: 'email', name: 'Email (IMAP)', status: 'online', uptime: '14d 2h', response: '4.2s', icon: '📧' },
            { id: 'wa', name: 'WhatsApp', status: 'offline', uptime: '0s', response: '—', icon: '💬' },
            { id: 'search', name: 'Brave Search', status: 'online', uptime: 'N/A', response: '350ms', icon: '🔍' },
        ]
    },

    async getSystemInfo() {
        await delay()
        return [
            { label: 'Uso de CPU', value: '12%' },
            { label: 'Uso de Memória', value: '256MB' },
            { label: 'Versão Gateway', value: 'v3.0.0' },
        ]
    },

    async getAlerts() {
        await delay()
        return []
    },

    async getTokenHistory() {
        await delay()
        return [12, 18, 15, 22, 30, 25, 28, 35, 42, 38, 45, 52]
    },

    // ── Actions ──────────────────────────────────────────
    async generateExtra(type) {
        return await fetchAPI(`/api/extras/generate/${type}`, { method: 'POST' })
    }
}
