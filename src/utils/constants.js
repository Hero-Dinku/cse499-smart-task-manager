export const CATEGORIES = {
  work:     { label: 'Work',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', dot: 'bg-violet-400' },
  personal: { label: 'Personal', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  dot: 'bg-emerald-400' },
  academic: { label: 'Academic', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  dot: 'bg-cyan-400' },
  health:   { label: 'Health',   color: '#fb7185', bg: 'rgba(251,113,133,0.12)', dot: 'bg-rose-400' },
  finance:  { label: 'Finance',  color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  dot: 'bg-amber-400' },
  other:    { label: 'Other',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: 'bg-slate-400' },
}

export const PRIORITIES = {
  critical: { label: 'Critical', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   border: '#f43f5e', order: 0 },
  high:     { label: 'High',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: '#f59e0b', order: 1 },
  medium:   { label: 'Medium',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: '#60a5fa', order: 2 },
  low:      { label: 'Low',      color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: '#64748b', order: 3 },
}

export const STATUSES = {
  'todo':        { label: 'To Do',       color: '#64748b' },
  'in-progress': { label: 'In Progress', color: '#60a5fa' },
  'completed':   { label: 'Done',        color: '#34d399' },
}

export const CATEGORY_LIST  = Object.entries(CATEGORIES).map(([k, v]) => ({ value: k, ...v }))
export const PRIORITY_LIST  = Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, ...v })).sort((a, b) => a.order - b.order)
export const STATUS_LIST    = Object.entries(STATUSES).map(([k, v]) => ({ value: k, ...v }))
