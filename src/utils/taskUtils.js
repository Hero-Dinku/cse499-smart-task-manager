import { format, isToday, isTomorrow, isPast, isWithinInterval, addDays, startOfDay } from 'date-fns'

export function isOverdue(task) {
  if (!task.dueDate || task.status === 'completed') return false
  return isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
}

export function isDueToday(task) {
  if (!task.dueDate || task.status === 'completed') return false
  return isToday(new Date(task.dueDate))
}

export function isDueSoon(task) {
  if (!task.dueDate || task.status === 'completed') return false
  const due = new Date(task.dueDate)
  return isWithinInterval(due, { start: startOfDay(new Date()), end: addDays(new Date(), 3) })
}

export function formatDueDate(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d')
}

export function getSubtaskProgress(subtasks) {
  if (!subtasks?.length) return null
  const done = subtasks.filter(s => s.completed).length
  return { done, total: subtasks.length, pct: Math.round((done / subtasks.length) * 100) }
}

export function getCompletionsByDay(tasks, days = 7) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dayStr = format(d, 'MMM d')
    const count = tasks.filter(t => {
      if (!t.completedAt) return false
      return isToday(new Date(t.completedAt))
        ? i === 0
        : format(new Date(t.completedAt), 'MMM d') === dayStr
    }).length
    result.push({ day: format(d, 'EEE'), date: dayStr, count })
  }
  return result
}

export function getTasksByCategory(tasks) {
  const counts = {}
  tasks.forEach(t => {
    counts[t.category] = (counts[t.category] || 0) + 1
  })
  return counts
}

export function sortTasks(tasks, sortBy) {
  const sorted = [...tasks]
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  switch (sortBy) {
    case 'priority': return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    case 'dueDate':  return sorted.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
    case 'created':  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'title':    return sorted.sort((a, b) => a.title.localeCompare(b.title))
    default: return sorted
  }
}
