import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AgentContext = createContext(null)

export function AgentProvider({ children }) {
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)

    const loadAgents = useCallback(async () => {
        setLoading(true)
        try {
            const data = await api.getAgents()
            setAgents(data)
        } catch (err) {
            console.error('Failed to load agents:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { loadAgents() }, [loadAgents])

    const createAgent = async (data) => {
        const agent = await api.createAgent(data)
        setAgents(prev => [...prev, agent])
        return agent
    }

    const updateAgent = async (id, data) => {
        const updated = await api.updateAgent(id, data)
        setAgents(prev => prev.map(a => a.id === id ? updated : a))
        return updated
    }

    const deleteAgent = async (id) => {
        await api.deleteAgent(id)
        setAgents(prev => prev.filter(a => a.id !== id))
    }

    const getAgent = (id) => agents.find(a => a.id === id) || null

    // Computed
    const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'busy').length
    const tierGroups = {
        0: agents.filter(a => a.tier === 0),
        1: agents.filter(a => a.tier === 1),
        2: agents.filter(a => a.tier === 2),
    }

    const value = {
        agents,
        loading,
        onlineCount,
        tierGroups,
        getAgent,
        createAgent,
        updateAgent,
        deleteAgent,
        refresh: loadAgents,
    }

    return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
}

export function useAgents() {
    const ctx = useContext(AgentContext)
    if (!ctx) throw new Error('useAgents must be used within AgentProvider')
    return ctx
}
