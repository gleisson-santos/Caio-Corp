import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const TaskContext = createContext(null)

export function TaskProvider({ children }) {
    const [tasks, setTasks] = useState([])
    const [workflows, setWorkflows] = useState([])
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    const loadAll = useCallback(async () => {
        setLoading(true)
        try {
            const [t, w, a] = await Promise.all([
                api.getTasks(),
                api.getWorkflows(),
                api.getActivities(20),
            ])
            setTasks(t)
            setWorkflows(w)
            setActivities(a)
        } catch (err) {
            console.error('Failed to load tasks:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadAll() }, [loadAll])

    // ── Task CRUD ──────────────────────────────────────
    const createTask = async (data) => {
        const task = await api.createTask(data)
        setTasks(prev => [...prev, task])
        return task
    }

    const updateTask = async (id, data) => {
        const updated = await api.updateTask(id, data)
        setTasks(prev => prev.map(t => t.id === id ? updated : t))
        return updated
    }

    const deleteTask = async (id) => {
        await api.deleteTask(id)
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    const executeTask = async (id) => {
        const updated = await api.executeTask(id)
        setTasks(prev => prev.map(t => t.id === id ? updated : t))
        return updated
    }

    // ── Workflow CRUD ──────────────────────────────────
    const createWorkflow = async (data) => {
        const wf = await api.createWorkflow(data)
        setWorkflows(prev => [...prev, wf])
        return wf
    }

    const deleteWorkflow = async (id) => {
        await api.deleteWorkflow(id)
        setWorkflows(prev => prev.filter(w => w.id !== id))
    }

    // ── Computed ──────────────────────────────────────
    const tasksByStatus = {
        pending: tasks.filter(t => t.status === 'pending'),
        running: tasks.filter(t => t.status === 'running'),
        completed: tasks.filter(t => t.status === 'completed'),
        failed: tasks.filter(t => t.status === 'failed'),
    }

    const value = {
        tasks,
        workflows,
        activities,
        loading,
        tasksByStatus,
        createTask,
        updateTask,
        deleteTask,
        executeTask,
        createWorkflow,
        deleteWorkflow,
        refresh: loadAll,
    }

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

export function useTasks() {
    const ctx = useContext(TaskContext)
    if (!ctx) throw new Error('useTasks must be used within TaskProvider')
    return ctx
}
