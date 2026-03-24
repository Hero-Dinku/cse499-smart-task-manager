import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

const now = Date.now()
const d = (offset) => new Date(now + offset * 86400000).toISOString()
const past = (offset) => new Date(now - offset * 86400000).toISOString()

const SEED_TASKS = [
  {
    id: uuidv4(), title: 'Design system architecture', description: 'Plan microservices structure and define API contracts between frontend and backend.',
    category: 'work', priority: 'critical', status: 'in-progress',
    dueDate: d(1), estimatedMinutes: 180, tags: ['architecture', 'planning'],
    subtasks: [
      { id: uuidv4(), title: 'Define service boundaries', completed: true },
      { id: uuidv4(), title: 'Document REST API contracts', completed: false },
      { id: uuidv4(), title: 'Review with team', completed: false },
    ],
    createdAt: past(5), updatedAt: past(1), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Write unit tests for auth module', description: 'Cover login, register, password reset, and token refresh endpoints.',
    category: 'work', priority: 'high', status: 'todo',
    dueDate: d(2), estimatedMinutes: 120, tags: ['testing', 'auth'],
    subtasks: [
      { id: uuidv4(), title: 'Login flow tests', completed: false },
      { id: uuidv4(), title: 'Token expiry tests', completed: false },
    ],
    createdAt: past(3), updatedAt: past(3), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Complete React Native setup', description: 'Initialize Expo project, configure navigation, and set up shared state.',
    category: 'work', priority: 'high', status: 'todo',
    dueDate: d(4), estimatedMinutes: 240, tags: ['mobile', 'setup'],
    subtasks: [
      { id: uuidv4(), title: 'Create Expo project', completed: false },
      { id: uuidv4(), title: 'Install navigation libs', completed: false },
      { id: uuidv4(), title: 'Share Zustand store with web', completed: false },
    ],
    createdAt: past(2), updatedAt: past(2), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Study for algorithms exam', description: 'Review graph algorithms, dynamic programming, and sorting.',
    category: 'academic', priority: 'critical', status: 'todo',
    dueDate: d(0), estimatedMinutes: 180, tags: ['exam', 'algorithms'],
    subtasks: [
      { id: uuidv4(), title: 'Graph traversals (BFS/DFS)', completed: true },
      { id: uuidv4(), title: 'Dynamic programming patterns', completed: false },
      { id: uuidv4(), title: 'Practice LeetCode problems', completed: false },
    ],
    createdAt: past(4), updatedAt: past(1), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Submit project proposal', description: 'Finalize and submit the Smart Task Manager project proposal document.',
    category: 'academic', priority: 'medium', status: 'completed',
    dueDate: past(2), estimatedMinutes: 60, tags: ['proposal', 'submission'],
    subtasks: [],
    createdAt: past(7), updatedAt: past(2), completedAt: past(2), aiScore: null,
  },
  {
    id: uuidv4(), title: 'Morning workout routine', description: '30 min cardio + core strengthening.',
    category: 'health', priority: 'medium', status: 'completed',
    dueDate: past(0), estimatedMinutes: 45, tags: ['fitness'],
    subtasks: [],
    createdAt: past(1), updatedAt: past(0), completedAt: past(0), aiScore: null,
  },
  {
    id: uuidv4(), title: 'Review monthly budget', description: 'Track expenses against budget, identify overspending categories.',
    category: 'finance', priority: 'medium', status: 'todo',
    dueDate: d(5), estimatedMinutes: 30, tags: ['budget', 'monthly'],
    subtasks: [],
    createdAt: past(2), updatedAt: past(2), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Read System Design Interview book', description: 'Complete chapters 4–6 on distributed systems.',
    category: 'personal', priority: 'low', status: 'in-progress',
    dueDate: d(10), estimatedMinutes: 120, tags: ['learning', 'books'],
    subtasks: [
      { id: uuidv4(), title: 'Chapter 4: Caching strategies', completed: true },
      { id: uuidv4(), title: 'Chapter 5: Message queues', completed: false },
      { id: uuidv4(), title: 'Chapter 6: Sharding & replication', completed: false },
    ],
    createdAt: past(6), updatedAt: past(1), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Firebase Cloud Messaging setup', description: 'Implement push notifications for task deadline reminders.',
    category: 'work', priority: 'high', status: 'todo',
    dueDate: d(6), estimatedMinutes: 150, tags: ['notifications', 'firebase'],
    subtasks: [],
    createdAt: past(1), updatedAt: past(1), completedAt: null, aiScore: null,
  },
  {
    id: uuidv4(), title: 'Team standup preparation', description: 'Prepare weekly progress update and blockers for team standup.',
    category: 'work', priority: 'low', status: 'completed',
    dueDate: past(1), estimatedMinutes: 15, tags: ['meetings'],
    subtasks: [],
    createdAt: past(2), updatedAt: past(1), completedAt: past(1), aiScore: null,
  },
  {
    id: uuidv4(), title: 'Set up MongoDB Atlas', description: 'Configure cloud database, create collections, and set up indexes.',
    category: 'work', priority: 'critical', status: 'completed',
    dueDate: past(3), estimatedMinutes: 60, tags: ['database', 'setup'],
    subtasks: [
      { id: uuidv4(), title: 'Create Atlas cluster', completed: true },
      { id: uuidv4(), title: 'Configure network access', completed: true },
      { id: uuidv4(), title: 'Create database indexes', completed: true },
    ],
    createdAt: past(5), updatedAt: past(3), completedAt: past(3), aiScore: null,
  },
  {
    id: uuidv4(), title: 'Write progress report', description: 'Document what has been completed this sprint and what remains.',
    category: 'academic', priority: 'high', status: 'todo',
    dueDate: past(1), estimatedMinutes: 90, tags: ['documentation', 'sprint'],
    subtasks: [],
    createdAt: past(4), updatedAt: past(4), completedAt: null, aiScore: null,
  },
]

export const useTaskStore = create(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      view: 'dashboard',
      filters: { search: '', category: 'all', priority: 'all', status: 'all', sortBy: 'priority' },
      taskListView: 'list',
      apiKey: '',
      editingTask: null,
      isModalOpen: false,

      setView: (view) => set({ view }),
      setApiKey: (apiKey) => set({ apiKey }),
      setTaskListView: (taskListView) => set({ taskListView }),

      setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
      resetFilters: () => set({ filters: { search: '', category: 'all', priority: 'all', status: 'all', sortBy: 'priority' } }),

      openModal: (task = null) => set({ isModalOpen: true, editingTask: task }),
      closeModal: () => set({ isModalOpen: false, editingTask: null }),

      addTask: (task) => set(s => ({
        tasks: [{ ...task, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), completedAt: null, aiScore: null }, ...s.tasks]
      })),

      updateTask: (id, updates) => set(s => ({
        tasks: s.tasks.map(t => t.id === id
          ? { ...t, ...updates, updatedAt: new Date().toISOString(), completedAt: updates.status === 'completed' && t.status !== 'completed' ? new Date().toISOString() : t.completedAt }
          : t
        )
      })),

      deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

      toggleSubtask: (taskId, subtaskId) => set(s => ({
        tasks: s.tasks.map(t => t.id === taskId
          ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st), updatedAt: new Date().toISOString() }
          : t
        )
      })),

      setAiScores: (scores) => set(s => ({
        tasks: s.tasks.map(t => scores[t.id] !== undefined ? { ...t, aiScore: scores[t.id] } : t)
      })),

      getFilteredTasks: () => {
        const { tasks, filters } = get()
        let result = [...tasks]
        if (filters.search) {
          const q = filters.search.toLowerCase()
          result = result.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q)))
        }
        if (filters.category !== 'all') result = result.filter(t => t.category === filters.category)
        if (filters.priority !== 'all') result = result.filter(t => t.priority === filters.priority)
        if (filters.status !== 'all') result = result.filter(t => t.status === filters.status)
        return result
      },

      getStats: () => {
        const tasks = get().tasks
        const total = tasks.length
        const completed = tasks.filter(t => t.status === 'completed').length
        const inProgress = tasks.filter(t => t.status === 'in-progress').length
        const overdue = tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false
          const due = new Date(t.dueDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return due < today
        }).length
        const dueToday = tasks.filter(t => {
          if (!t.dueDate || t.status === 'completed') return false
          const due = new Date(t.dueDate)
          const today = new Date()
          return due.toDateString() === today.toDateString()
        }).length
        return { total, completed, inProgress, todo: total - completed - inProgress, overdue, dueToday, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
      },
    }),
    {
      name: 'smart-task-manager-storage',
      partialize: (s) => ({ tasks: s.tasks, apiKey: s.apiKey, taskListView: s.taskListView }),
    }
  )
)
