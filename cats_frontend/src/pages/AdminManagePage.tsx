import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { getApiErrorMessage } from '../api/error'
import {
  adminGetModules, adminCreateModule, adminUpdateModule, adminDeleteModule,
  adminGetQuestions, adminCreateQuestion, adminUpdateQuestion, adminDeleteQuestion,
  adminGetSimulations, adminCreateSimulation, adminUpdateSimulation, adminDeleteSimulation,
  adminCreateStep, adminUpdateStep, adminDeleteStep,
  adminCreateChoice, adminUpdateChoice, adminDeleteChoice,
  adminCreateModuleTopic, adminUpdateModuleTopic, adminDeleteModuleTopic,
  type AdminModule, type AdminModuleTopic, type AdminQuestion, type AdminOption,
  type AdminSimulation, type AdminStep, type AdminChoice,
} from '../api/admin'
import { getQuizzes, type ApiQuiz } from '../api/quizzes'
import { getQuizCategories, type ApiQuizCategory } from '../api/quizzes'
import { AdminLayout } from './AdminDashboardPage'
import './AdminDashboardPage.css'
import './AdminManagePage.css'

type Tab = 'modules' | 'questions' | 'simulations'

export default function AdminManagePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('modules')

  if (!user || user.role !== 'admin') return null

  return (
    <AdminLayout activeTab="content" pageTitle="Content Management" pageSubtitle="Add, edit, and manage training content">
      <div className="adminTabs">
        {(['modules', 'questions', 'simulations'] as Tab[]).map(t => (
          <button key={t} className={`adminTab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'modules' ? '📚 Modules' : t === 'questions' ? '❓ Questions' : '🛡️ Simulations'}
          </button>
        ))}
      </div>
      {tab === 'modules' && <ModulesTab />}
      {tab === 'questions' && <QuestionsTab />}
      {tab === 'simulations' && <SimulationsTab />}
    </AdminLayout>
  )
}

/* ═══════════════ MODULES TAB ═══════════════ */
function ModulesTab() {
  const [items, setItems] = useState<AdminModule[]>([])
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AdminModule | null>(null)
  const [form, setForm] = useState<{ title: string; description: string; is_active: boolean; quiz_id: number | '' }>({ title: '', description: '', is_active: true, quiz_id: '' })

  const [topicForm, setTopicForm] = useState<{ moduleId: number; title: string; content: string; sort_order: number; editingId?: number } | null>(null)

  async function load() {
    try { 
      const [mr, qr] = await Promise.all([adminGetModules(), getQuizzes()])
      setItems(mr.modules); setQuizzes(qr.quizzes)
    } catch (e) { setError(getApiErrorMessage(e, 'Load failed')) }
  }
  useEffect(() => { load() }, [])

  function openCreate() { setForm({ title: '', description: '', is_active: true, quiz_id: '' }); setEditing(null); setShowForm(true) }
  function openEdit(m: AdminModule) { setForm({ title: m.title, description: m.description || '', is_active: m.is_active, quiz_id: m.quiz_id || '' }); setEditing(m); setShowForm(true) }

  async function onSave() {
    setError(null)
    const dataToSave = { ...form, quiz_id: form.quiz_id === '' ? null : +form.quiz_id }
    try {
      if (editing) { await adminUpdateModule(editing.id, dataToSave) }
      else { await adminCreateModule(dataToSave) }
      setShowForm(false); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed')) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this module?')) return
    try { await adminDeleteModule(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed')) }
  }

  function openAddTopic(moduleId: number) { setTopicForm({ moduleId, title: '', content: '', sort_order: 0 }) }
  function openEditTopic(t: AdminModuleTopic) { setTopicForm({ moduleId: t.training_module_id, title: t.title, content: t.content, sort_order: t.sort_order, editingId: t.id }) }

  async function onSaveTopic() {
    if (!topicForm) return; setError(null)
    try {
      const { moduleId, title, content, sort_order, editingId } = topicForm
      if (editingId) { await adminUpdateModuleTopic(editingId, { title, content, sort_order }) }
      else { await adminCreateModuleTopic(moduleId, { title, content, sort_order }) }
      setTopicForm(null); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save topic failed')) }
  }

  async function onDeleteTopic(id: number) {
    if (!confirm('Delete this topic?')) return
    try { await adminDeleteModuleTopic(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete topic failed')) }
  }

  return (
    <div className="adminCard">
      <div className="adminCardHead">
        <span className="adminCardTitle">Training Modules</span>
        <button className="adminBtn primary" onClick={openCreate}><span className="material-symbols-outlined">add</span> Add Module</button>
      </div>
      {error && <div className="adminError">{error}</div>}
      {items.length === 0 ? <div className="adminEmpty">No modules yet.</div> : items.map(m => (
        <div key={m.id} className="adminCard" style={{ marginBottom: 14 }}>
          <div className="adminCardHead">
            <div>
              <div className="adminCardTitle">{m.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,28,48,0.5)' }}>Quiz: {m.quiz?.title || 'None'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="adminBtn sm" onClick={() => openEdit(m)}>Edit</button>
              <button className="adminBtn sm" onClick={() => openAddTopic(m.id)}>+ Topic</button>
              <button className="adminBtn sm danger" onClick={() => onDelete(m.id)}>Delete</button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(11,28,48,0.65)', marginBottom: 10 }}>{m.description || '—'}</div>
          <span className={`adminBadge ${m.is_active ? 'active' : 'inactive'}`}>{m.is_active ? 'Active' : 'Inactive'}</span>

          {(m.topics || []).map((topic, i) => (
            <div key={topic.id} className="adminStepCard" style={{ marginTop: 10 }}>
              <div className="adminStepHead">
                <span className="adminStepTitle">Topic {i + 1}: {topic.title}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="adminBtn sm" onClick={() => openEditTopic(topic)}>Edit</button>
                  <button className="adminBtn sm danger" onClick={() => onDeleteTopic(topic.id)}>×</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(11,28,48,0.6)', whiteSpace: 'pre-wrap' }}>{topic.content.length > 150 ? topic.content.slice(0, 150) + '…' : topic.content}</div>
            </div>
          ))}
        </div>
      ))}
      {showForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setShowForm(false)} />
          <div className="adminModalContent">
            <h3 className="adminModalTitle">{editing ? 'Edit Module' : 'Add Module'}</h3>
            <div className="adminField"><label className="adminLabel">Title</label><input className="adminInput" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Description</label><textarea className="adminTextarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="adminField">
              <label className="adminLabel">Linked Quiz (Taken after module)</label>
              <select className="adminSelect" value={form.quiz_id} onChange={e => setForm({ ...form, quiz_id: e.target.value ? parseInt(e.target.value, 10) : '' })}>
                <option value="">No Quiz</option>
                {quizzes.map(qz => <option key={qz.id} value={qz.id}>{qz.title}</option>)}
              </select>
            </div>
            <div className="adminField"><label className="adminOptionCheck"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label></div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {topicForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setTopicForm(null)} />
          <div className="adminModalContent" style={{ maxWidth: 700 }}>
            <h3 className="adminModalTitle">{topicForm.editingId ? 'Edit Topic' : 'Add Topic'}</h3>
            <div className="adminField"><label className="adminLabel">Title</label><input className="adminInput" value={topicForm.title} onChange={e => setTopicForm({ ...topicForm, title: e.target.value })} /></div>
            <div className="adminField">
              <label className="adminLabel">Content (Rich Text / Markdown supported)</label>
              <textarea className="adminTextarea" style={{ height: 250, fontFamily: 'monospace' }} placeholder="Supports basic HTML and text..." value={topicForm.content} onChange={e => setTopicForm({ ...topicForm, content: e.target.value })} />
            </div>
            <div className="adminField"><label className="adminLabel">Sort Order</label><input className="adminInput" type="number" value={topicForm.sort_order} onChange={e => setTopicForm({ ...topicForm, sort_order: +e.target.value })} /></div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setTopicForm(null)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSaveTopic}>Save Topic</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════ QUESTIONS TAB ═══════════════ */
function QuestionsTab() {
  const [items, setItems] = useState<AdminQuestion[]>([])
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AdminQuestion | null>(null)
  const emptyOpt = (): AdminOption => ({ label: '', text: '', is_correct: false })
  const [form, setForm] = useState({ quiz_id: 0, type: 'multiple_choice', prompt: '', scenario: '', explanation: '', points: 1, options: [emptyOpt(), emptyOpt()] as AdminOption[] })

  async function load() {
    try {
      const [qr, qzr] = await Promise.all([adminGetQuestions(), getQuizzes()])
      setItems(qr.questions); setQuizzes(qzr.quizzes)
    } catch (e) { setError(getApiErrorMessage(e, 'Load failed')) }
  }
  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ quiz_id: quizzes[0]?.id || 0, type: 'multiple_choice', prompt: '', scenario: '', explanation: '', points: 1, options: [emptyOpt(), emptyOpt()] })
    setEditing(null); setShowForm(true)
  }
  function openEdit(q: AdminQuestion) {
    setForm({
      quiz_id: q.quiz_id, type: q.type, prompt: q.prompt, scenario: q.scenario || '', explanation: q.explanation || '', points: q.points,
      options: q.options.map(o => ({ label: o.label, text: o.text, is_correct: o.is_correct }))
    })
    setEditing(q); setShowForm(true)
  }

  function updateOpt(idx: number, field: string, val: string | boolean) {
    const opts = [...form.options]; (opts[idx] as Record<string, unknown>)[field] = val; setForm({ ...form, options: opts })
  }
  function addOpt() { setForm({ ...form, options: [...form.options, emptyOpt()] }) }
  function removeOpt(idx: number) { setForm({ ...form, options: form.options.filter((_, i) => i !== idx) }) }

  async function onSave() {
    setError(null)
    try {
      if (editing) { await adminUpdateQuestion(editing.id, { ...form, scenario: form.scenario || null, explanation: form.explanation || null }) }
      else { await adminCreateQuestion({ ...form, scenario: form.scenario || undefined, explanation: form.explanation || undefined }) }
      setShowForm(false); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed')) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this question and its options?')) return
    try { await adminDeleteQuestion(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed')) }
  }

  return (
    <div className="adminCard">
      <div className="adminCardHead">
        <span className="adminCardTitle">Quiz Questions</span>
        <button className="adminBtn primary" onClick={openCreate}><span className="material-symbols-outlined">add</span> Add Question</button>
      </div>
      {error && <div className="adminError">{error}</div>}
      {items.length === 0 ? <div className="adminEmpty">No questions yet.</div> : (
        <table className="adminTable">
          <thead><tr><th>Quiz</th><th>Type</th><th>Prompt</th><th>Pts</th><th>Options</th><th>Actions</th></tr></thead>
          <tbody>{items.map(q => (
            <tr key={q.id}>
              <td>{q.quiz?.title || `#${q.quiz_id}`}</td>
              <td>{q.type}</td>
              <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.prompt}</td>
              <td>{q.points}</td>
              <td>{q.options.length}</td>
              <td>
                <button className="adminBtn sm" onClick={() => openEdit(q)}>Edit</button>{' '}
                <button className="adminBtn sm danger" onClick={() => onDelete(q.id)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
      {showForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setShowForm(false)} />
          <div className="adminModalContent">
            <h3 className="adminModalTitle">{editing ? 'Edit Question' : 'Add Question'}</h3>
            <div className="adminRow">
              <div className="adminField">
                <label className="adminLabel">Quiz</label>
                <select className="adminSelect" value={form.quiz_id} onChange={e => setForm({ ...form, quiz_id: +e.target.value })}>
                  {quizzes.map(qz => <option key={qz.id} value={qz.id}>{qz.title}</option>)}
                </select>
              </div>
              <div className="adminField">
                <label className="adminLabel">Type</label>
                <select className="adminSelect" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="scenario">Scenario</option>
                </select>
              </div>
              <div className="adminField"><label className="adminLabel">Points</label><input className="adminInput" type="number" min={1} value={form.points} onChange={e => setForm({ ...form, points: +e.target.value })} /></div>
            </div>
            <div className="adminField"><label className="adminLabel">Prompt</label><textarea className="adminTextarea" value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Scenario (optional)</label><textarea className="adminTextarea" value={form.scenario} onChange={e => setForm({ ...form, scenario: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Explanation</label><textarea className="adminTextarea" value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} /></div>
            <div className="adminField">
              <label className="adminLabel">Options</label>
              {form.options.map((o, i) => (
                <div key={i} className="adminOptionRow">
                  <input type="text" placeholder="Label" style={{ maxWidth: 60 }} value={o.label} onChange={e => updateOpt(i, 'label', e.target.value)} />
                  <input type="text" placeholder="Option text" value={o.text} onChange={e => updateOpt(i, 'text', e.target.value)} />
                  <label className="adminOptionCheck"><input type="checkbox" checked={o.is_correct} onChange={e => updateOpt(i, 'is_correct', e.target.checked)} /> Correct</label>
                  {form.options.length > 2 && <button className="adminBtn sm danger" onClick={() => removeOpt(i)}>×</button>}
                </div>
              ))}
              <button className="adminBtn sm" onClick={addOpt}>+ Add Option</button>
            </div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════ SIMULATIONS TAB ═══════════════ */
function SimulationsTab() {
  const [items, setItems] = useState<AdminSimulation[]>([])
  const [categories, setCategories] = useState<ApiQuizCategory[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<AdminSimulation | null>(null)
  const [form, setForm] = useState({ category_id: 0, title: '', description: '', difficulty: 'easy', time_limit_seconds: 300, max_score: 100, is_active: true })
  const [stepForm, setStepForm] = useState<{ simId: number; title: string; prompt: string; education: string; editingId?: number } | null>(null)
  const [choiceForm, setChoiceForm] = useState<{ stepId: number; text: string; is_safe: boolean; score_delta: number; feedback: string; explanation: string; editingId?: number } | null>(null)

  async function load() {
    try {
      const [sr, cr] = await Promise.all([adminGetSimulations(), getQuizCategories()])
      setItems(sr.simulations); setCategories(cr.categories)
    } catch (e) { setError(getApiErrorMessage(e, 'Load failed')) }
  }
  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ category_id: categories[0]?.id || 0, title: '', description: '', difficulty: 'easy', time_limit_seconds: 300, max_score: 100, is_active: true })
    setEditing(null); setShowForm(true)
  }
  function openEdit(s: AdminSimulation) {
    setForm({ category_id: s.category_id, title: s.title, description: s.description || '', difficulty: s.difficulty, time_limit_seconds: s.time_limit_seconds || 300, max_score: s.max_score, is_active: s.is_active })
    setEditing(s); setShowForm(true)
  }

  async function onSave() {
    setError(null)
    try {
      if (editing) { await adminUpdateSimulation(editing.id, form) }
      else { await adminCreateSimulation(form) }
      setShowForm(false); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save failed')) }
  }

  async function onDeleteSim(id: number) {
    if (!confirm('Delete this simulation and all its steps/choices?')) return
    try { await adminDeleteSimulation(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete failed')) }
  }

  /* Step handlers */
  function openAddStep(simId: number) { setStepForm({ simId, title: '', prompt: '', education: '' }) }
  function openEditStep(step: AdminStep) { setStepForm({ simId: step.simulation_id, title: step.title, prompt: step.prompt, education: step.education || '', editingId: step.id }) }

  async function onSaveStep() {
    if (!stepForm) return; setError(null)
    try {
      if (stepForm.editingId) { await adminUpdateStep(stepForm.editingId, { title: stepForm.title, prompt: stepForm.prompt, education: stepForm.education || null }) }
      else { await adminCreateStep(stepForm.simId, { title: stepForm.title, prompt: stepForm.prompt, education: stepForm.education || undefined }) }
      setStepForm(null); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save step failed')) }
  }

  async function onDeleteStep(id: number) {
    if (!confirm('Delete this step and its choices?')) return
    try { await adminDeleteStep(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete step failed')) }
  }

  /* Choice handlers */
  function openAddChoice(stepId: number) { setChoiceForm({ stepId, text: '', is_safe: false, score_delta: 0, feedback: '', explanation: '' }) }
  function openEditChoice(c: AdminChoice) { setChoiceForm({ stepId: c.step_id, text: c.text, is_safe: c.is_safe, score_delta: c.score_delta, feedback: c.feedback || '', explanation: c.explanation || '', editingId: c.id }) }

  async function onSaveChoice() {
    if (!choiceForm) return; setError(null)
    try {
      const data = { text: choiceForm.text, is_safe: choiceForm.is_safe, score_delta: choiceForm.score_delta, feedback: choiceForm.feedback || undefined, explanation: choiceForm.explanation || undefined }
      if (choiceForm.editingId) { await adminUpdateChoice(choiceForm.editingId, data) }
      else { await adminCreateChoice(choiceForm.stepId, data) }
      setChoiceForm(null); load()
    } catch (e) { setError(getApiErrorMessage(e, 'Save choice failed')) }
  }

  async function onDeleteChoice(id: number) {
    if (!confirm('Delete this choice?')) return
    try { await adminDeleteChoice(id); load() } catch (e) { setError(getApiErrorMessage(e, 'Delete choice failed')) }
  }

  return (
    <div className="adminCard">
      <div className="adminCardHead">
        <span className="adminCardTitle">Simulations</span>
        <button className="adminBtn primary" onClick={openCreate}><span className="material-symbols-outlined">add</span> Add Simulation</button>
      </div>
      {error && <div className="adminError">{error}</div>}
      {items.length === 0 ? <div className="adminEmpty">No simulations yet.</div> : items.map(sim => (
        <div key={sim.id} className="adminCard" style={{ marginBottom: 14 }}>
          <div className="adminCardHead">
            <div>
              <div className="adminCardTitle">{sim.title}</div>
              <div style={{ fontSize: 12, color: 'rgba(11,28,48,0.5)' }}>{sim.category?.name || 'Uncategorized'} · {sim.difficulty} · {sim.max_score} pts</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="adminBtn sm" onClick={() => openEdit(sim)}>Edit</button>
              <button className="adminBtn sm" onClick={() => openAddStep(sim.id)}>+ Step</button>
              <button className="adminBtn sm danger" onClick={() => onDeleteSim(sim.id)}>Delete</button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(11,28,48,0.65)', marginBottom: 10 }}>{sim.description || '—'}</div>
          <span className={`adminBadge ${sim.is_active ? 'active' : 'inactive'}`}>{sim.is_active ? 'Active' : 'Inactive'}</span>

          {(sim.steps || []).map(step => (
            <div key={step.id} className="adminStepCard">
              <div className="adminStepHead">
                <span className="adminStepTitle">Step {step.step_order}: {step.title}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="adminBtn sm" onClick={() => openEditStep(step)}>Edit</button>
                  <button className="adminBtn sm" onClick={() => openAddChoice(step.id)}>+ Choice</button>
                  <button className="adminBtn sm danger" onClick={() => onDeleteStep(step.id)}>×</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(11,28,48,0.6)', marginBottom: 6, whiteSpace: 'pre-wrap' }}>{step.prompt.length > 120 ? step.prompt.slice(0, 120) + '…' : step.prompt}</div>
              {step.choices.map(ch => (
                <div key={ch.id} className={`adminChoiceRow ${ch.is_safe ? 'safe' : 'unsafe'}`}>
                  <span>{ch.text} <span className={`adminBadge ${ch.is_safe ? 'safe' : 'unsafe'}`}>{ch.is_safe ? 'safe' : 'unsafe'}</span> ({ch.score_delta > 0 ? '+' : ''}{ch.score_delta})</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="adminBtn sm" onClick={() => openEditChoice(ch)}>Edit</button>
                    <button className="adminBtn sm danger" onClick={() => onDeleteChoice(ch.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Simulation form modal */}
      {showForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setShowForm(false)} />
          <div className="adminModalContent">
            <h3 className="adminModalTitle">{editing ? 'Edit Simulation' : 'Add Simulation'}</h3>
            <div className="adminField"><label className="adminLabel">Title</label><input className="adminInput" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Description</label><textarea className="adminTextarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="adminRow">
              <div className="adminField">
                <label className="adminLabel">Category</label>
                <select className="adminSelect" value={form.category_id} onChange={e => setForm({ ...form, category_id: +e.target.value })}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="adminField">
                <label className="adminLabel">Difficulty</label>
                <select className="adminSelect" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="adminRow">
              <div className="adminField"><label className="adminLabel">Time Limit (sec)</label><input className="adminInput" type="number" value={form.time_limit_seconds} onChange={e => setForm({ ...form, time_limit_seconds: +e.target.value })} /></div>
              <div className="adminField"><label className="adminLabel">Max Score</label><input className="adminInput" type="number" value={form.max_score} onChange={e => setForm({ ...form, max_score: +e.target.value })} /></div>
            </div>
            <div className="adminField"><label className="adminOptionCheck"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label></div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Step form modal */}
      {stepForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setStepForm(null)} />
          <div className="adminModalContent">
            <h3 className="adminModalTitle">{stepForm.editingId ? 'Edit Step' : 'Add Step'}</h3>
            <div className="adminField"><label className="adminLabel">Title</label><input className="adminInput" value={stepForm.title} onChange={e => setStepForm({ ...stepForm, title: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Prompt</label><textarea className="adminTextarea" value={stepForm.prompt} onChange={e => setStepForm({ ...stepForm, prompt: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Education Tip</label><textarea className="adminTextarea" value={stepForm.education} onChange={e => setStepForm({ ...stepForm, education: e.target.value })} /></div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setStepForm(null)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSaveStep}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Choice form modal */}
      {choiceForm && (
        <div className="adminModal">
          <div className="adminModalBg" onClick={() => setChoiceForm(null)} />
          <div className="adminModalContent">
            <h3 className="adminModalTitle">{choiceForm.editingId ? 'Edit Choice' : 'Add Choice'}</h3>
            <div className="adminField"><label className="adminLabel">Text (use "ACTION: description" format)</label><textarea className="adminTextarea" value={choiceForm.text} onChange={e => setChoiceForm({ ...choiceForm, text: e.target.value })} /></div>
            <div className="adminRow">
              <div className="adminField"><label className="adminOptionCheck"><input type="checkbox" checked={choiceForm.is_safe} onChange={e => setChoiceForm({ ...choiceForm, is_safe: e.target.checked })} /> Safe Choice</label></div>
              <div className="adminField"><label className="adminLabel">Score Delta</label><input className="adminInput" type="number" value={choiceForm.score_delta} onChange={e => setChoiceForm({ ...choiceForm, score_delta: +e.target.value })} /></div>
            </div>
            <div className="adminField"><label className="adminLabel">Feedback</label><textarea className="adminTextarea" value={choiceForm.feedback} onChange={e => setChoiceForm({ ...choiceForm, feedback: e.target.value })} /></div>
            <div className="adminField"><label className="adminLabel">Explanation</label><textarea className="adminTextarea" value={choiceForm.explanation} onChange={e => setChoiceForm({ ...choiceForm, explanation: e.target.value })} /></div>
            <div className="adminActions">
              <button className="adminBtn" onClick={() => setChoiceForm(null)}>Cancel</button>
              <button className="adminBtn primary" onClick={onSaveChoice}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
