import React, { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { AlertTriangle, Clock, TrendingUp, CheckCircle2, ListTodo, Flame, Plus } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { CATEGORIES, PRIORITIES } from '../utils/constants'
import { isOverdue, isDueToday, formatDueDate } from '../utils/taskUtils'
import clsx from 'clsx'

const PIE_COLORS = ['#f43f5e', '#f59e0b', '#60a5fa', '#64748b']

export default function Dashboard() {
  const { tasks, openModal, setView } = useTaskStore()
  const getStats = useTaskStore(s => s.getStats)
  const stats = getStats()

  const completionData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i)
      const dayStr = format(d, 'yyyy-MM-dd')
      const count = tasks.filter(t => {
        if (!t.completedAt) return false
        return format(new Date(t.completedAt), 'yyyy-MM-dd') === dayStr
      }).length
      return { day: format(d, 'EEE'), count }
    })
  }, [tasks])

  const categoryData = useMemo(() => {
    return Object.entries(CATEGORIES).map(([key, cat]) => ({
      name: cat.label,
      count: tasks.filter(t => t.category === key).length,
      color: cat.color,
    })).filter(d => d.count > 0).sort((a, b) => b.count - a.count)
  }, [tasks])

  const priorityData = useMemo(() => {
    return Object.entries(PRIORITIES).map(([key, pri], i) => ({
      name: pri.label,
      value: tasks.filter(t => t.priority === key && t.status !== 'completed').length,
      color: PIE_COLORS[i],
    })).filter(d => d.value > 0)
  }, [tasks])

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed' && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [tasks])

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-surface-950 font-semibold text-sm transition-colors"
        >
          <Plus size={15} />
          New Task
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={<ListTodo size={18} className="text-slate-400" />}  label="Total Tasks"  value={stats.total}        sub="all tasks"            />
        <MetricCard icon={<CheckCircle2 size={18} className="text-emerald-400" />} label="Completed"  value={stats.completed}    sub={`${stats.completionRate}% rate`} accent="emerald" />
        <MetricCard icon={<Flame size={18} className="text-cyan-400" />}         label="In Progress" value={stats.inProgress}   sub="active now"           accent="cyan" />
        <MetricCard icon={<AlertTriangle size={18} className="text-rose-400" />}  label="Overdue"     value={stats.overdue}      sub="need attention"       accent={stats.overdue > 0 ? 'rose' : null} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5 mb-5">
        {/* Area Chart */}
        <div className="col-span-2 bg-surface-900 border border-surface-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Completion Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tasks completed over the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-xs text-slate-400">Completed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={completionData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2236" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2940', borderRadius: 8, padding: '8px 12px' }}
                labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                itemStyle={{ color: '#22d3ee', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="count" name="Completed" stroke="#22d3ee" strokeWidth={2} fill="url(#cyanGrad)" dot={{ r: 3, fill: '#22d3ee', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Donut */}
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">By Priority</h3>
          <p className="text-xs text-slate-500 mb-4">Active tasks</p>
          {priorityData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%" innerRadius={38} outerRadius={56} paddingAngle={3} dataKey="value">
                    {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #1e2940', borderRadius: 8, padding: '6px 10px' }}
                    itemStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {priorityData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-slate-400">{d.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-300">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-600 text-sm">No active tasks</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Category Bar */}
        <div className="col-span-2 bg-surface-900 border border-surface-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Tasks by Category</h3>
          <p className="text-xs text-slate-500 mb-4">All tasks</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: -8 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={65} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #1e2940', borderRadius: 8, padding: '6px 10px' }}
                itemStyle={{ fontSize: 11 }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]} maxBarSize={18}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming */}
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Upcoming</h3>
            <button onClick={() => setView('tasks')} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">View all</button>
          </div>
          <div className="space-y-2">
            {upcomingTasks.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4">All caught up!</p>
            )}
            {upcomingTasks.map(task => {
              const overdue = isOverdue(task)
              const today = isDueToday(task)
              return (
                <div key={task.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-700 transition-colors">
                  <div className="w-1 h-12 rounded-full mt-0.5 shrink-0" style={{ background: PRIORITIES[task.priority]?.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: overdue ? '#f43f5e' : today ? '#fbbf24' : '#64748b' }}>
                      {overdue ? '⚠ Overdue' : today ? '⏰ Today' : formatDueDate(task.dueDate)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, sub, accent }) {
  const accentMap = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    cyan:    'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    rose:    'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }
  const base = 'bg-surface-900 border border-surface-700'
  return (
    <div className={clsx('rounded-xl p-4', accent ? accentMap[accent] : base)}>
      <div className="flex items-center justify-between mb-3">
        {icon}
      </div>
      <p className="font-display font-bold text-2xl text-white font-mono">{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
    </div>
  )
}
