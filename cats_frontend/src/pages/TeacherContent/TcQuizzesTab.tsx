import { useEffect, useState } from 'react'
import { Icon } from '../../components/IconMap'
import {
  tcGetQuizzes, tcCreateQuiz, tcUpdateQuiz, tcDeleteQuiz,
  tcGetQuestions, tcCreateQuestion, tcUpdateQuestion, tcDeleteQuestion,
  tcGetCategories,
  type TcQuiz, type TcQuestion, type TcOption, type TcCategory,
} from '../../api/teacherContent'

type QuizForm = { category_id: string; title: string; description: string; kind: string; difficulty: string; time_limit_seconds: string; is_active: boolean }
type QForm = { quiz_id: number; type: string; prompt: string; scenario: string; explanation: string; points: number; options: TcOption[] }
const emptyOpt = (): TcOption => ({ label: '', text: '', is_correct: false })

export function TcQuizzesTab() {
  const [quizzes, setQuizzes] = useState<TcQuiz[]>([])
  const [questions, setQuestions] = useState<TcQuestion[]>([])
  const [cats, setCats] = useState<TcCategory[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [showQForm, setShowQForm] = useState(false)
  const [editingQ, setEditingQ] = useState<TcQuiz | null>(null)
  const [qForm, setQForm] = useState<QuizForm>({ category_id: '', title: '', description: '', kind: 'regular', difficulty: 'easy', time_limit_seconds: '', is_active: true })
  const [showQxForm, setShowQxForm] = useState(false)
  const [editingQx, setEditingQx] = useState<TcQuestion | null>(null)
  const [qxForm, setQxForm] = useState<QForm>({ quiz_id: 0, type: 'multiple_choice', prompt: '', scenario: '', explanation: '', points: 1, options: [emptyOpt(), emptyOpt()] })
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [qr, cr] = await Promise.all([tcGetQuizzes(), tcGetCategories()])
      setQuizzes(qr.quizzes); setCats(cr.categories)
    } catch { setErr('Failed to load') }
  }
  async function loadQuestions(quizId: number) {
    try { const r = await tcGetQuestions(quizId); setQuestions(r.questions) } catch { setErr('Failed to load questions') }
  }
  useEffect(() => { load() }, [])

  function openCreateQuiz() { setQForm({ category_id: cats[0]?.id ? String(cats[0].id) : '', title: '', description: '', kind: 'regular', difficulty: 'easy', time_limit_seconds: '', is_active: true }); setEditingQ(null); setShowQForm(true) }
  function openEditQuiz(q: TcQuiz) { setQForm({ category_id: String(q.category_id), title: q.title, description: q.description || '', kind: q.kind, difficulty: q.difficulty, time_limit_seconds: q.time_limit_seconds ? String(q.time_limit_seconds) : '', is_active: q.is_active }); setEditingQ(q); setShowQForm(true) }

  async function onSaveQuiz() {
    setSaving(true); setErr(null)
    try {
      const p = { category_id: +qForm.category_id, title: qForm.title, description: qForm.description || undefined, kind: qForm.kind, difficulty: qForm.difficulty, time_limit_seconds: qForm.time_limit_seconds ? +qForm.time_limit_seconds : null, is_active: qForm.is_active }
      if (editingQ) await tcUpdateQuiz(editingQ.id, p); else await tcCreateQuiz(p)
      setShowQForm(false); load()
    } catch { setErr('Save failed') } finally { setSaving(false) }
  }

  async function onDeleteQuiz(id: number) {
    if (!confirm('Delete this quiz and all its questions?')) return
    try { await tcDeleteQuiz(id); if (selectedQuiz === id) setSelectedQuiz(null); load() } catch { setErr('Delete failed') }
  }

  function openCreateQuestion(quizId: number) { setQxForm({ quiz_id: quizId, type: 'multiple_choice', prompt: '', scenario: '', explanation: '', points: 1, options: [emptyOpt(), emptyOpt()] }); setEditingQx(null); setShowQxForm(true) }
  function openEditQuestion(q: TcQuestion) { setQxForm({ quiz_id: q.quiz_id, type: q.type, prompt: q.prompt, scenario: q.scenario || '', explanation: q.explanation || '', points: q.points, options: q.options.map(o => ({ label: o.label, text: o.text, is_correct: o.is_correct })) }); setEditingQx(q); setShowQxForm(true) }

  async function onSaveQuestion() {
    setSaving(true); setErr(null)
    try {
      const p = { ...qxForm, scenario: qxForm.scenario || undefined, explanation: qxForm.explanation || undefined }
      if (editingQx) await tcUpdateQuestion(editingQx.id, p); else await tcCreateQuestion(p)
      setShowQxForm(false); if (selectedQuiz) loadQuestions(selectedQuiz)
    } catch { setErr('Save failed') } finally { setSaving(false) }
  }

  async function onDeleteQuestion(id: number) {
    if (!confirm('Delete question?')) return
    try { await tcDeleteQuestion(id); if (selectedQuiz) loadQuestions(selectedQuiz) } catch { setErr('Delete failed') }
  }

  function updateOpt(i: number, k: keyof TcOption, v: string | boolean) { const o = [...qxForm.options]; (o[i] as Record<string, unknown>)[k] = v; setQxForm(f => ({ ...f, options: o })) }

  const sf: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--page-bg)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Quizzes</h2>
        <button className="moduleCta primary" onClick={openCreateQuiz}><Icon name="add" size={16} /> New Quiz</button>
      </div>
      {err && <div className="modulesError">{err}</div>}
      {quizzes.length === 0 && <div className="tcEmpty"><Icon name="quiz" size={40} /><p>No quizzes yet.</p></div>}
      {quizzes.map(q => (
        <div key={q.id} className="rptCard" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{q.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{q.category?.name} · {q.kind} · {q.difficulty} · {q.questions_count ?? 0} questions</div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: q.is_active ? '#22c55e20' : '#94a3b820', color: q.is_active ? '#22c55e' : '#94a3b8', fontWeight: 700, display: 'inline-block', marginTop: 4 }}>{q.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openEditQuiz(q)}>Edit</button>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => { setSelectedQuiz(q.id); loadQuestions(q.id) }}>Questions</button>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#ef4444' }} onClick={() => onDeleteQuiz(q.id)}>Delete</button>
            </div>
          </div>

          {selectedQuiz === q.id && (
            <div style={{ marginTop: 10, borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>QUESTIONS</span>
                <button className="moduleCta" style={{ padding: '4px 12px', fontSize: '0.78rem' }} onClick={() => openCreateQuestion(q.id)}>+ Add Question</button>
              </div>
              {questions.filter(qx => qx.quiz_id === q.id).map((qx, i) => (
                <div key={qx.id} style={{ background: 'var(--page-bg)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Q{i + 1}: {qx.prompt}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>{qx.options.length} options · {qx.points} pt{qx.points !== 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="moduleCta" style={{ padding: '3px 10px', fontSize: '0.75rem' }} onClick={() => openEditQuestion(qx)}>Edit</button>
                    <button className="moduleCta" style={{ padding: '3px 10px', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => onDeleteQuestion(qx.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Quiz Modal */}
      {showQForm && (
        <div className="tcModal" onClick={() => setShowQForm(false)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{editingQ ? 'Edit Quiz' : 'Add Quiz'}</h2><button className="tcModalClose" onClick={() => setShowQForm(false)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Title *</label><input style={sf} value={qForm.title} onChange={e => setQForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="tcField"><label>Description</label><textarea style={{ ...sf, height: 70 }} value={qForm.description} onChange={e => setQForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="tcField"><label>Category</label><select style={sf} value={qForm.category_id} onChange={e => setQForm(f => ({ ...f, category_id: e.target.value }))}>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div className="tcField"><label>Kind</label><select style={sf} value={qForm.kind} onChange={e => setQForm(f => ({ ...f, kind: e.target.value }))}><option value="regular">Regular</option><option value="pretest">Pre-test</option><option value="posttest">Post-test</option></select></div>
              <div className="tcField"><label>Difficulty</label><select style={sf} value={qForm.difficulty} onChange={e => setQForm(f => ({ ...f, difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              <div className="tcField"><label>Time Limit (sec)</label><input style={sf} type="number" value={qForm.time_limit_seconds} onChange={e => setQForm(f => ({ ...f, time_limit_seconds: e.target.value }))} placeholder="Leave blank = no limit" /></div>
            </div>
            <div className="tcField"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={qForm.is_active} onChange={e => setQForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setShowQForm(false)}>Cancel</button><button className="moduleCta primary" onClick={onSaveQuiz} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQxForm && (
        <div className="tcModal" onClick={() => setShowQxForm(false)}>
          <div className="tcModalBox" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{editingQx ? 'Edit Question' : 'Add Question'}</h2><button className="tcModalClose" onClick={() => setShowQxForm(false)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Question Prompt *</label><textarea style={{ ...sf, height: 80 }} value={qxForm.prompt} onChange={e => setQxForm(f => ({ ...f, prompt: e.target.value }))} /></div>
            <div className="tcField"><label>Scenario / Context</label><textarea style={{ ...sf, height: 60 }} value={qxForm.scenario} onChange={e => setQxForm(f => ({ ...f, scenario: e.target.value }))} placeholder="Optional background scenario" /></div>
            <div className="tcField"><label>Explanation (shown after)</label><textarea style={{ ...sf, height: 60 }} value={qxForm.explanation} onChange={e => setQxForm(f => ({ ...f, explanation: e.target.value }))} /></div>
            <div className="tcField"><label>Points</label><input style={{ ...sf, width: 80 }} type="number" min={1} value={qxForm.points} onChange={e => setQxForm(f => ({ ...f, points: +e.target.value }))} /></div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>OPTIONS (check correct answer)</label>
                <button className="moduleCta" style={{ padding: '3px 10px', fontSize: '0.76rem' }} onClick={() => setQxForm(f => ({ ...f, options: [...f.options, emptyOpt()] }))}>+ Option</button>
              </div>
              {qxForm.options.map((o, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <input type="checkbox" checked={o.is_correct} onChange={e => updateOpt(i, 'is_correct', e.target.checked)} title="Correct answer" />
                  <input style={{ ...sf, width: 60 }} placeholder="A" value={o.label} onChange={e => updateOpt(i, 'label', e.target.value)} />
                  <input style={{ ...sf, flex: 1 }} placeholder="Option text" value={o.text} onChange={e => updateOpt(i, 'text', e.target.value)} />
                  {qxForm.options.length > 2 && <button onClick={() => setQxForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button>}
                </div>
              ))}
            </div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setShowQxForm(false)}>Cancel</button><button className="moduleCta primary" onClick={onSaveQuestion} disabled={saving}>{saving ? 'Saving…' : 'Save Question'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
