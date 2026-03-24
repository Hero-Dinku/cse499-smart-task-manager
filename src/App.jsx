import React from 'react'
import { useTaskStore } from './store/taskStore'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import TaskList from './components/TaskList'
import AIPanel from './components/AIPanel'
import TaskModal from './components/TaskModal'

export default function App() {
  const { view, isModalOpen } = useTaskStore()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {view === 'dashboard' && <Dashboard />}
          {view === 'tasks'     && <TaskList />}
          {view === 'ai'        && <AIPanel />}
        </main>
      </div>
      {isModalOpen && <TaskModal />}
    </div>
  )
}
