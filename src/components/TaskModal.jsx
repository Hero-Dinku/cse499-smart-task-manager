import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, Trash2, GripVertical } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { CATEGORY_LIST, PRIORITY_LIST, STATUS_LIST } from '../utils/constants'
import { v4 as uuidv4 } from 'uuid'
import clsx from 'clsx'

const DEFAULT_FORM = {
  title: '', description: '', category: 'work', priority: 'medium', status: 'todo',
  dueDate: '', estimatedMinutes: '', tags: [], subtasks: [],
}

export default function TaskModal() {
  const { editingTask, closeModal, addTask, updateTask } = useTaskStore()
  const isEditing = !!editingTask

  const [form, setForm] = useState(() => {
    if (!editingTask) return DEFAULT_FORM
    return {
      title:              editingTask.title || '',
      description:        editingTask.description || '',
      category:           editingTask.category || 'work',
      priority:           editingTask.priority || 'medium',
      status:             editingTask.status || 'todo',
      dueDate:            editingTask.dueDate ? editingTask.dueDate.slice(0, 16) : '',
      estimatedMinutes:   editingTask.estimatedMinutes || '',
      tags:               editingTask.tags || [],
      subtasks:           editingTask.subtasks || [],
    }
  })
  const [tagInput, setTagInput] = useState('')
  const [subtaskInput, setSubtaskInput] = useState('')
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      estimatedMinutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes) : 0,
    }
    if (isEditing) {
      updateTask(editingTask.id, payload)
    } else {
      addTask(payload)
    }
    closeModal()
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !form.tags.includes(tag)) set('tags', [...form.tags, tag])
    setTagInput('')
  }

  const removeTag = (tag) => set('tags', form.tags.filter(t => t !== tag))

  const addSubtask = () => {
    const title = subtaskInput.trim()
    if (title) {
      set('subtasks', [...form.subtasks, { id: uuidv4(), title, completed: false }])
      setSubtaskInput('')
    }
  }

  const removeSubtask = (id) => set('subtasks', form.subtasks.filter(s => s.id !== id))

  const toggleSubtask = (id) => set('subtasks', form.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-900 border border-surface-600 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
          <h2 className="font-display font-bold text-base text-white">{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-surface-700 text-slate-500 hover:text-slate-300 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder="Task title..."
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={clsx(
                'w-full bg-surface-800 border rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:outline-none',
                errors.title ? 'border-rose-500/60' : 'border-surface-600 focus:border-cyan-500/50'
              )}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <textarea
            placeholder="Description (optional)..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            rows={2}
            className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
          />

          {/* Row: Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50">
                {CATEGORY_LIST.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50">
                {PRIORITY_LIST.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row: Status + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50">
                {STATUS_LIST.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Estimated Time (minutes)</label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={form.estimatedMinutes}
              onChange={e => set('estimatedMinutes', e.target.value)}
              min={0}
              className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button onClick={addTag} className="px-3 py-2 bg-surface-700 hover:bg-surface-600 border border-surface-600 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <Plus size={15} />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs text-slate-400 bg-surface-700 border border-surface-600 px-2 py-0.5 rounded-full">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-400 transition-colors"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wide mb-1.5 block">Subtasks</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask..."
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask() } }}
                className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              <button onClick={addSubtask} className="px-3 py-2 bg-surface-700 hover:bg-surface-600 border border-surface-600 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                <Plus size={15} />
              </button>
            </div>
            {form.subtasks.length > 0 && (
              <div className="mt-2 space-y-1">
                {form.subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 group/st">
                    <button onClick={() => toggleSubtask(st.id)} className="shrink-0">
                      <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors', st.completed ? 'border-emerald-400 bg-emerald-400/20' : 'border-surface-500')}>
                        {st.completed && <div className="w-2 h-2 rounded-sm bg-emerald-400" />}
                      </div>
                    </button>
                    <span className={clsx('flex-1 text-sm', st.completed ? 'text-slate-600 line-through' : 'text-slate-300')}>{st.title}</span>
                    <button onClick={() => removeSubtask(st.id)} className="opacity-0 group-hover/st:opacity-100 p-0.5 text-slate-600 hover:text-rose-400 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-700">
          <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold text-sm transition-colors">
            {isEditing ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
