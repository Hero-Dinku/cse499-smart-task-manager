import React, { useMemo } from 'react'
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, X } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { CATEGORY_LIST, PRIORITY_LIST, STATUS_LIST } from '../utils/constants'
import { sortTasks, isOverdue } from '../utils/taskUtils'
import TaskCard from './TaskCard'
import clsx from 'clsx'

const SORT_OPTIONS = [
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate',  label: 'Due Date' },
  { value: 'created',  label: 'Newest' },
  { value: 'title',    label: 'Title' },
]

const KANBAN_COLS = [
  { id: 'todo',        label: 'To Do',       color: '#64748b' },
  { id: 'in-progress', label: 'In Progress',  color: '#60a5fa' },
  { id: 'completed',   label: 'Done',         color: '#34d399' },
]

export default function TaskList() {
  const { filters, setFilter, resetFilters, taskListView, setTaskListView, openModal, getFilteredTasks } = useTaskStore()

  const filtered = getFilteredTasks()

  const sorted = useMemo(() => sortTasks(filtered, filters.sortBy), [filtered, filters.sortBy])

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.priority !== 'all' || filters.status !== 'all'

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">My Tasks</h2>
          <p className="text-slate-400 text-sm mt-1">{sorted.length} task{sorted.length !== 1 ? 's' : ''} {hasActiveFilters ? 'matching filters' : 'total'}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-surface-800 border border-surface-600 rounded-lg p-0.5">
            <button
              onClick={() => setTaskListView('list')}
              className={clsx('p-1.5 rounded-md transition-colors', taskListView === 'list' ? 'bg-surface-600 text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setTaskListView('kanban')}
              className={clsx('p-1.5 rounded-md transition-colors', taskListView === 'kanban' ? 'bg-surface-600 text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold text-sm transition-colors"
          >
            <Plus size={15} /> New Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks, tags..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
            className="w-full bg-surface-900 border border-surface-600 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:border-cyan-500/50 focus:ring-0 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <FilterSelect value={filters.category} onChange={v => setFilter('category', v)} label="Category">
          <option value="all">All Categories</option>
          {CATEGORY_LIST.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </FilterSelect>

        {/* Priority Filter */}
        <FilterSelect value={filters.priority} onChange={v => setFilter('priority', v)} label="Priority">
          <option value="all">All Priorities</option>
          {PRIORITY_LIST.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </FilterSelect>

        {/* Status Filter */}
        <FilterSelect value={filters.status} onChange={v => setFilter('status', v)} label="Status">
          <option value="all">All Statuses</option>
          {STATUS_LIST.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </FilterSelect>

        {/* Sort */}
        <FilterSelect value={filters.sortBy} onChange={v => setFilter('sortBy', v)} label="Sort">
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>Sort: {s.label}</option>)}
        </FilterSelect>

        {/* Reset */}
        {hasActiveFilters && (
          <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors px-2 py-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onNew={() => openModal()} onClear={resetFilters} />
      ) : taskListView === 'kanban' ? (
        <KanbanView tasks={sorted} />
      ) : (
        <ListView tasks={sorted} />
      )}
    </div>
  )
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-cyan-500/50 focus:outline-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function ListView({ tasks }) {
  const overdueTasks = tasks.filter(t => isOverdue(t))
  const otherTasks   = tasks.filter(t => !isOverdue(t))

  return (
    <div className="space-y-5">
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wide">Overdue — {overdueTasks.length}</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map(t => <TaskCard key={t.id} task={t} />)}
          </div>
        </div>
      )}
      {otherTasks.length > 0 && (
        <div className="space-y-2">
          {otherTasks.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
    </div>
  )
}

function KanbanView({ tasks }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {KANBAN_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id)
        return (
          <div key={col.id} className="bg-surface-900 border border-surface-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-medium text-slate-300">{col.label}</span>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-surface-700 px-2 py-0.5 rounded-full">{colTasks.length}</span>
            </div>
            <div className="space-y-2">
              {colTasks.map(t => <TaskCard key={t.id} task={t} />)}
              {colTasks.length === 0 && (
                <div className="h-20 rounded-lg border-2 border-dashed border-surface-600 flex items-center justify-center">
                  <span className="text-xs text-slate-600">No tasks</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ hasFilters, onNew, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-600 flex items-center justify-center mb-4">
        <Search size={24} className="text-slate-600" />
      </div>
      <h3 className="text-slate-300 font-medium mb-1">{hasFilters ? 'No tasks match' : 'No tasks yet'}</h3>
      <p className="text-slate-600 text-sm mb-4">{hasFilters ? 'Try adjusting your filters' : 'Create your first task to get started'}</p>
      {hasFilters
        ? <button onClick={onClear} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Clear filters</button>
        : <button onClick={onNew} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold text-sm transition-colors"><Plus size={14} /> New Task</button>
      }
    </div>
  )
}
