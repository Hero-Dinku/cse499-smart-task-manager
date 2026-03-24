import React, { useState } from 'react'
import { Sparkles, Key, AlertTriangle, TrendingUp, Lightbulb, ArrowUpDown, Loader2, ChevronRight, Settings, CheckCircle2 } from 'lucide-react'
import { useTaskStore } from '../store/taskStore'
import { PRIORITIES } from '../utils/constants'
import clsx from 'clsx'

export default function AIPanel() {
  const { tasks, apiKey, setApiKey, updateTask } = useTaskStore()
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set())

  const activeTasks = tasks.filter(t => t.status !== 'completed')

  const analyze = async () => {
    if (!apiKey) { setShowKeyInput(true); return }
    setLoading(true)
    setError(null)
    setResult(null)
    setAppliedSuggestions(new Set())

    const taskSummary = activeTasks.map(t => ({
      id: t.id,
      title: t.title,
      category: t.category,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      estimatedMinutes: t.estimatedMinutes,
      tags: t.tags,
    }))

    const prompt = `You are a productivity coach analyzing a task list. Provide smart insights and recommendations.

Current tasks (active only):
${JSON.stringify(taskSummary, null, 2)}

Today's date: ${new Date().toISOString()}

Analyze these tasks and respond ONLY with a valid JSON object — no markdown, no backticks, no extra text. Use this exact structure:
{
  "overallScore": <integer 1-10>,
  "scoreLabel": "<short label like 'Well managed' or 'Needs attention'>",
  "insights": ["<insight1>", "<insight2>", "<insight3>"],
  "riskAlerts": [
    {"taskId": "<id>", "title": "<task title>", "risk": "<risk description>", "severity": "low|medium|high"}
  ],
  "prioritySuggestions": [
    {"taskId": "<id>", "title": "<task title>", "currentPriority": "<priority>", "suggestedPriority": "<critical|high|medium|low>", "reason": "<brief reason>"}
  ],
  "productivityTips": ["<tip1>", "<tip2>", "<tip3>"]
}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content?.find(c => c.type === 'text')?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
    } catch (e) {
      setError(e.message || 'Failed to analyze tasks. Check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  const applySuggestion = (suggestion) => {
    updateTask(suggestion.taskId, { priority: suggestion.suggestedPriority })
    setAppliedSuggestions(prev => new Set([...prev, suggestion.taskId]))
  }

  const saveKey = () => {
    setApiKey(keyDraft.trim())
    setKeyDraft('')
    setShowKeyInput(false)
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-violet-400" />
            <h2 className="font-display text-2xl font-bold text-white">AI Assistant</h2>
          </div>
          <p className="text-slate-400 text-sm">Powered by Claude — smart analysis of your task list</p>
        </div>
        <button
          onClick={() => setShowKeyInput(v => !v)}
          className={clsx('flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors',
            apiKey ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15' : 'border-surface-600 text-slate-400 hover:bg-surface-700'
          )}
        >
          <Key size={12} />
          {apiKey ? 'API Key Set' : 'Set API Key'}
        </button>
      </div>

      {/* API Key Input */}
      {showKeyInput && (
        <div className="bg-surface-900 border border-surface-600 rounded-xl p-5 mb-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-1">Anthropic API Key</h3>
          <p className="text-xs text-slate-500 mb-3">Your key is stored locally and never sent anywhere except Anthropic's API.</p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="sk-ant-..."
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
            <button onClick={saveKey} className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-surface-950 rounded-lg text-sm font-semibold transition-colors">Save</button>
            {apiKey && <button onClick={() => { setApiKey(''); setShowKeyInput(false) }} className="px-4 py-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/20 rounded-lg text-sm transition-colors">Remove</button>}
          </div>
          {apiKey && <p className="text-xs text-emerald-400 mt-2">✓ API key is currently set</p>}
        </div>
      )}

      {/* Analyze Button */}
      <div className="bg-surface-900 border border-surface-700 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">Analyze My Tasks</h3>
            <p className="text-sm text-slate-400 mb-4">
              Claude will review your {activeTasks.length} active tasks and provide priority recommendations, deadline risk alerts, and productivity insights.
            </p>
            {!apiKey && (
              <p className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-4">
                Set your Anthropic API key above to enable AI analysis.
              </p>
            )}
            <button
              onClick={analyze}
              disabled={loading || activeTasks.length === 0}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all',
                loading || activeTasks.length === 0
                  ? 'bg-surface-700 text-slate-500 cursor-not-allowed'
                  : 'bg-violet-500 hover:bg-violet-400 text-white'
              )}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {loading ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-4 mb-6 flex gap-3 items-start animate-slide-up">
          <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-300">Analysis failed</p>
            <p className="text-xs text-rose-400/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">
          {/* Score Card */}
          <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 flex items-center gap-5">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#1a2236" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#8b5cf6" strokeWidth="6"
                  strokeDasharray={`${(result.overallScore / 10) * 163} 163`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-lg text-violet-300">{result.overallScore}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Task Health Score</p>
              <p className="font-display font-bold text-xl text-white mt-0.5">{result.scoreLabel}</p>
              <p className="text-xs text-slate-500 mt-0.5">out of 10</p>
            </div>
          </div>

          {/* Insights */}
          {result.insights?.length > 0 && (
            <Section icon={<TrendingUp size={15} className="text-cyan-400" />} title="Key Insights">
              {result.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-surface-800">
                  <ChevronRight size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-300">{insight}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Risk Alerts */}
          {result.riskAlerts?.length > 0 && (
            <Section icon={<AlertTriangle size={15} className="text-amber-400" />} title="Risk Alerts">
              {result.riskAlerts.map((alert, i) => {
                const sev = { low: 'bg-blue-500/10 border-blue-500/20 text-blue-400', medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400', high: 'bg-rose-500/10 border-rose-500/20 text-rose-400' }
                return (
                  <div key={i} className={clsx('p-3 rounded-lg border', sev[alert.severity])}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs mt-0.5 opacity-80">{alert.risk}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-current opacity-70 shrink-0">{alert.severity}</span>
                    </div>
                  </div>
                )
              })}
            </Section>
          )}

          {/* Priority Suggestions */}
          {result.prioritySuggestions?.length > 0 && (
            <Section icon={<ArrowUpDown size={15} className="text-violet-400" />} title="Priority Suggestions">
              {result.prioritySuggestions.map((s, i) => {
                const applied = appliedSuggestions.has(s.taskId)
                const current = PRIORITIES[s.currentPriority]
                const suggested = PRIORITIES[s.suggestedPriority]
                return (
                  <div key={i} className="p-3 rounded-lg bg-surface-800 border border-surface-600">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{s.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono" style={{ color: current?.color, background: current?.bg }}>{s.currentPriority}</span>
                          <span className="text-slate-600 text-xs">→</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-mono" style={{ color: suggested?.color, background: suggested?.bg }}>{s.suggestedPriority}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">{s.reason}</p>
                      </div>
                      <button
                        onClick={() => !applied && applySuggestion(s)}
                        disabled={applied || s.currentPriority === s.suggestedPriority}
                        className={clsx('shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all',
                          applied ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 cursor-default'
                                  : s.currentPriority === s.suggestedPriority ? 'text-slate-600 border border-surface-600 cursor-default'
                                  : 'text-slate-300 border border-surface-500 hover:bg-surface-700'
                        )}
                      >
                        {applied ? <><CheckCircle2 size={12} /> Applied</> : 'Apply'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </Section>
          )}

          {/* Tips */}
          {result.productivityTips?.length > 0 && (
            <Section icon={<Lightbulb size={15} className="text-amber-400" />} title="Productivity Tips">
              {result.productivityTips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-amber-400 font-mono text-xs mt-0.5 shrink-0">0{i + 1}</span>
                  <p className="text-sm text-slate-300">{tip}</p>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="text-center py-8 text-slate-600">
          <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Run an analysis to see AI recommendations</p>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
