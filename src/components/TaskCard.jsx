import React, { useState } from 'react'
import { Calendar, Clock, Trash2, Edit3, ChevronDown, ChevronUp, CheckCircle2, Circle } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { CATEGORIES, PRIORITIES } from '../utils/constants'
import { isOverdue, isDueToday, formatDueDate, getSubtaskProgress } from '../utils/taskUtils'
import clsx from 'clsx'

export default function TaskCard({ task }) {
  const { updateTask, deleteTask, toggleSubtask, openModal } = useTaskStore()
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const cat = CATEGORIES[task.category]
  const pri = PRIORITIES[task.priority]
  const overdue = isOverdue(task)
  const today = isDueToday(task)
  const progress = getSubtaskProgress(task.subtasks)
  const done = task.status === 'completed'

  const handleStatusCycle = () => {
    const cycle = { 'todo': 'in-progress', 'in-progress': 'completed', 'completed': 'todo' }
    updateTask(task.id, { status: cycle[task.status] })
  }

  const handleDelete = () => {
    setDeleting(true)
    setTimeout(() => deleteTask(task.id), 200)
  }

  return (
    <div
      className={clsx(
        'bg-surface-900 border rounded-xl overflow-hidden card-hover group transition-all',
        deleting && 'opacity-0 scale-95',
        done ? 'border-surface-700 opacity-70' : 'border-surface-700'
      )}
    >
      {/* Priority Bar */}
      <div className="h-0.5 w-full" style={{ background: done ? '#1e2940' : pri.color }} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <button onClick={handleStatusCycle} className="mt-0.5 shrink-0 transition-transform hover:scale-110">
            {task.status === 'completed'
              ? <CheckCircle2 size={18} className="text-emerald-400" />
              : task.status === 'in-progress'
              ? <div className="w-[18px] h-[18px] rounded-full border-2 border-cyan-400 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-cyan-400" /></div>
              : <Circle size={18} className="text-slate-600" />
            }
          </button>

          <div className="flex-1 min-w-0">
            {/* Title + Actions */}
            <div className="flex items-start gap-2">
              <h4 className={clsx('text-sm font-medium flex-1', done ? 'text-slate-500 line-through' : 'text-slate-100')}>{task.title}</h4>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openModal(task)} className="p-1 rounded-md hover:bg-surface-600 text-slate-500 hover:text-slate-300 transition-colors">
                  <Edit3 size={13} />
                </button>
                <button onClick={handleDelete} className="p-1 rounded-md hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
            )}

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority Badge */}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full font-mono" style={{ color: pri.color, background: pri.bg }}>
                {pri.label}
              </span>

              {/* Category Badge */}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: cat.color, background: cat.bg }}>
                {cat.label}
              </span>

              {/* Due Date */}
              {task.dueDate && (
                <div className={clsx('flex items-center gap-1 text-[11px]', overdue ? 'text-rose-400' : today ? 'text-amber-400' : 'text-slate-500')}>
                  <Calendar size={11} />
                  {overdue ? 'Overdue' : formatDueDate(task.dueDate)}
                </div>
              )}

              {/* Estimated Time */}
              {task.estimatedMinutes > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <Clock size={11} />
                  {task.estimatedMinutes >= 60 ? `${Math.round(task.estimatedMinutes / 60)}h` : `${task.estimatedMinutes}m`}
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map(tag => (
                  <span key={tag} className="text-[10px] text-slate-500 bg-surface-700 px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            )}

            {/* Subtask Progress */}
            {progress && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                    {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    {progress.done}/{progress.total} subtasks
                  </button>
                  <span className="text-[11px] font-mono text-slate-500">{progress.pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-surface-600 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-500/60 transition-all duration-500" style={{ width: `${progress.pct}%` }} />
                </div>

                {/* Expanded Subtasks */}
                {expanded && (
                  <div className="mt-2 space-y-1 animate-fade-in">
                    {task.subtasks.map(st => (
                      <button
                        key={st.id}
                        onClick={() => toggleSubtask(task.id, st.id)}
                        className="w-full flex items-center gap-2 text-left py-1 hover:bg-surface-700 rounded px-1 transition-colors group/st"
                      >
                        {st.completed
                          ? <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          : <Circle size={13} className="text-slate-600 group-hover/st:text-slate-400 shrink-0" />
                        }
                        <span className={clsx('text-xs', st.completed ? 'text-slate-500 line-through' : 'text-slate-300')}>{st.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
