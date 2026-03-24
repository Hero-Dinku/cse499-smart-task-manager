import React from 'react'
import { LayoutDashboard, CheckSquare, Sparkles, Plus, Circle, AlertTriangle, Clock } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import clsx from 'clsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks',     label: 'My Tasks',  icon: CheckSquare },
  { id: 'ai',        label: 'AI Assistant', icon: Sparkles },
]

export default function Sidebar() {
  const { view, setView, openModal, getStats } = useTaskStore()
  const stats = getStats()

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-surface-700 bg-surface-900 h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-surface-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <CheckSquare size={15} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="font-display font-700 text-[15px] leading-none text-white tracking-tight">Smart Tasks</h1>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono tracking-widest uppercase">Manager</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              view === id
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700'
            )}
          >
            <Icon size={16} />
            {label}
            {id === 'ai' && (
              <span className="ml-auto text-[9px] font-mono font-bold uppercase tracking-widest text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded">
                AI
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="px-3 pb-2">
        <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">Quick Stats</p>
        <div className="space-y-1">
          <StatRow
            icon={<Circle size={8} className="text-rose-400 fill-rose-400" />}
            label="Overdue"
            value={stats.overdue}
            valueClass={stats.overdue > 0 ? 'text-rose-400' : 'text-slate-500'}
          />
          <StatRow
            icon={<Clock size={11} className="text-amber-400" />}
            label="Due Today"
            value={stats.dueToday}
            valueClass={stats.dueToday > 0 ? 'text-amber-400' : 'text-slate-500'}
          />
          <StatRow
            icon={<Circle size={8} className="text-cyan-400 fill-cyan-400" />}
            label="In Progress"
            value={stats.inProgress}
            valueClass="text-cyan-400"
          />
        </div>
      </div>

      {/* New Task Button */}
      <div className="p-3 pt-2 border-t border-surface-700">
        <button
          onClick={() => openModal()}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          New Task
        </button>
      </div>

      {/* Completion Rate */}
      <div className="px-3 pb-5">
        <div className="rounded-lg bg-surface-800 border border-surface-600 p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-slate-500">Completion Rate</span>
            <span className="font-mono text-sm font-medium text-cyan-400">{stats.completionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-600 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">{stats.completed}/{stats.total} tasks done</p>
        </div>
      </div>
    </aside>
  )
}

function StatRow({ icon, label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-surface-700 transition-colors">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className={`text-xs font-mono font-medium ${valueClass}`}>{value}</span>
    </div>
  )
}
