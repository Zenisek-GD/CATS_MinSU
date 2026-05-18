import { useEffect, useState } from 'react'
import { Icon } from '../../components/IconMap'
import {
  tcGetSimulations, tcCreateSimulation, tcUpdateSimulation, tcDeleteSimulation,
  tcCreateStep, tcUpdateStep, tcDeleteStep,
  tcCreateChoice, tcUpdateChoice, tcDeleteChoice,
  tcCreateVideo, tcDeleteVideo,
  tcGetCategories,
  type TcSimulation, type TcStep, type TcChoice, type TcVideo, type TcCategory,
} from '../../api/teacherContent'

type SimForm = { category_id: string; title: string; description: string; difficulty: string; time_limit_seconds: string; max_score: string; is_active: boolean }
type StepForm = { simId: number; title: string; prompt: string; education: string; step_order: number; editingId?: number } | null
type ChoiceForm = { stepId: number; text: string; is_safe: boolean; score_delta: number; feedback: string; explanation: string; next_step_id: string; sort_order: number; editingId?: number } | null
type VideoForm = { simId: number; title: string; description: string; video_url: string; sort_order: number } | null

export function TcSimulationsTab() {
  const [sims, setSims] = useState<TcSimulation[]>([])
  const [cats, setCats] = useState<TcCategory[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TcSimulation | null>(null)
  const [form, setForm] = useState<SimForm>({ category_id: '', title: '', description: '', difficulty: 'easy', time_limit_seconds: '', max_score: '100', is_active: true })
  const [expanded, setExpanded] = useState<number | null>(null)
  const [stepForm, setStepForm] = useState<StepForm>(null)
  const [choiceForm, setChoiceForm] = useState<ChoiceForm>(null)
  const [videoForm, setVideoForm] = useState<VideoForm>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [sr, cr] = await Promise.all([tcGetSimulations(), tcGetCategories()])
      setSims(sr.simulations); setCats(cr.categories)
    } catch { setErr('Failed to load') }
  }
  useEffect(() => { load() }, [])

  function openCreate() { setForm({ category_id: cats[0]?.id ? String(cats[0].id) : '', title: '', description: '', difficulty: 'easy', time_limit_seconds: '', max_score: '100', is_active: true }); setEditing(null); setShowForm(true) }
  function openEdit(s: TcSimulation) { setForm({ category_id: String(s.category_id), title: s.title, description: s.description || '', difficulty: s.difficulty, time_limit_seconds: s.time_limit_seconds ? String(s.time_limit_seconds) : '', max_score: String(s.max_score), is_active: s.is_active }); setEditing(s); setShowForm(true) }

  async function onSave() {
    setSaving(true); setErr(null)
    try {
      if (!form.category_id) throw new Error('Please select a category.')
      if (!form.title.trim()) throw new Error('Title is required.')
      const p = { category_id: +form.category_id, title: form.title, description: form.description || undefined, difficulty: form.difficulty, time_limit_seconds: form.time_limit_seconds ? +form.time_limit_seconds : null, max_score: +form.max_score, is_active: form.is_active }
      if (editing) await tcUpdateSimulation(editing.id, p); else await tcCreateSimulation(p)
      setShowForm(false); load()
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Save failed') } finally { setSaving(false) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this simulation?')) return
    try { await tcDeleteSimulation(id); if (expanded === id) setExpanded(null); load() } catch { setErr('Delete failed') }
  }

  async function onSaveStep() {
    if (!stepForm) return; setSaving(true)
    try {
      const p = { title: stepForm.title, prompt: stepForm.prompt, education: stepForm.education || undefined, step_order: stepForm.step_order }
      if (stepForm.editingId) await tcUpdateStep(stepForm.editingId, p); else await tcCreateStep(stepForm.simId, p)
      setStepForm(null); load()
    } catch { setErr('Save step failed') } finally { setSaving(false) }
  }

  async function onDeleteStep(id: number) {
    if (!confirm('Delete step and all choices?')) return
    try { await tcDeleteStep(id); load() } catch { setErr('Delete failed') }
  }

  async function onSaveChoice() {
    if (!choiceForm) return; setSaving(true)
    try {
      const p = { text: choiceForm.text, is_safe: choiceForm.is_safe, score_delta: choiceForm.score_delta, feedback: choiceForm.feedback || undefined, explanation: choiceForm.explanation || undefined, next_step_id: choiceForm.next_step_id ? +choiceForm.next_step_id : null, sort_order: choiceForm.sort_order }
      if (choiceForm.editingId) await tcUpdateChoice(choiceForm.editingId, p); else await tcCreateChoice(choiceForm.stepId, p)
      setChoiceForm(null); load()
    } catch { setErr('Save choice failed') } finally { setSaving(false) }
  }

  async function onDeleteChoice(id: number) {
    if (!confirm('Delete choice?')) return
    try { await tcDeleteChoice(id); load() } catch { setErr('Delete failed') }
  }

  async function onSaveVideo() {
    if (!videoForm) return; setSaving(true)
    try {
      await tcCreateVideo(videoForm.simId, { title: videoForm.title, description: videoForm.description || undefined, video_url: videoForm.video_url || undefined, sort_order: videoForm.sort_order })
      setVideoForm(null); load()
    } catch { setErr('Save video failed') } finally { setSaving(false) }
  }

  async function onDeleteVideo(id: number) {
    if (!confirm('Delete video?')) return
    try { await tcDeleteVideo(id); load() } catch { setErr('Delete failed') }
  }

  const sf: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--page-bg)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%' }
  const btnSm: React.CSSProperties = { padding: '4px 10px', fontSize: '0.75rem' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Simulations</h2>
        <button className="moduleCta primary" onClick={openCreate}><Icon name="add" size={16} /> New Simulation</button>
      </div>
      {err && <div className="modulesError">{err}</div>}
      {sims.length === 0 && <div className="tcEmpty"><Icon name="security" size={40} /><p>No simulations yet.</p></div>}

      {sims.map(s => (
        <div key={s.id} className="rptCard" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.category?.name} · {s.difficulty} · max {s.max_score} pts</div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: s.is_active ? '#22c55e20' : '#94a3b820', color: s.is_active ? '#22c55e' : '#94a3b8', fontWeight: 700, display: 'inline-block', marginTop: 4 }}>{s.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="moduleCta" style={btnSm} onClick={() => openEdit(s)}>Edit</button>
              <button className="moduleCta" style={btnSm} onClick={() => setExpanded(expanded === s.id ? null : s.id)}>{expanded === s.id ? 'Collapse' : 'Expand'}</button>
              <button className="moduleCta" style={{ ...btnSm, color: '#ef4444' }} onClick={() => onDelete(s.id)}>Delete</button>
            </div>
          </div>

          {expanded === s.id && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>

              {/* Videos Section */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>🎬 INTRO VIDEOS</span>
                  <button className="moduleCta" style={btnSm} onClick={() => setVideoForm({ simId: s.id, title: '', description: '', video_url: '', sort_order: (s as TcSimulation & { videos?: TcVideo[] }).videos?.length ?? 0 })}>+ Video</button>
                </div>
                {((s as TcSimulation & { videos?: TcVideo[] }).videos || []).map((v: TcVideo) => (
                  <div key={v.id} style={{ background: 'var(--page-bg)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{v.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{v.video_url || 'No URL'}</div>
                    </div>
                    <button className="moduleCta" style={{ ...btnSm, color: '#ef4444' }} onClick={() => onDeleteVideo(v.id)}>×</button>
                  </div>
                ))}
              </div>

              {/* Steps Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>📋 STEPS</span>
                <button className="moduleCta" style={btnSm} onClick={() => setStepForm({ simId: s.id, title: '', prompt: '', education: '', step_order: (s.steps?.length ?? 0) + 1 })}>+ Step</button>
              </div>
              {(s.steps || []).map((step: TcStep, si: number) => (
                <div key={step.id} style={{ background: 'var(--page-bg)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Step {si + 1}: {step.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.prompt.length > 80 ? step.prompt.slice(0, 80) + '…' : step.prompt}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="moduleCta" style={btnSm} onClick={() => setStepForm({ simId: s.id, title: step.title, prompt: step.prompt, education: step.education || '', step_order: step.step_order, editingId: step.id })}>Edit</button>
                      <button className="moduleCta" style={btnSm} onClick={() => setChoiceForm({ stepId: step.id, text: '', is_safe: true, score_delta: 0, feedback: '', explanation: '', next_step_id: '', sort_order: step.choices?.length ?? 0 })}>+ Choice</button>
                      <button className="moduleCta" style={{ ...btnSm, color: '#ef4444' }} onClick={() => onDeleteStep(step.id)}>×</button>
                    </div>
                  </div>
                  {(step.choices || []).map((c: TcChoice, ci: number) => (
                    <div key={c.id} style={{ marginLeft: 16, marginTop: 6, padding: '6px 10px', borderRadius: 6, background: c.is_safe ? '#22c55e12' : '#ef444412', border: `1px solid ${c.is_safe ? '#22c55e30' : '#ef444430'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{ci + 1}. {c.text}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 8 }}>{c.is_safe ? '✅ Safe' : '⚠️ Risky'} · {c.score_delta >= 0 ? '+' : ''}{c.score_delta} pts</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="moduleCta" style={btnSm} onClick={() => setChoiceForm({ stepId: step.id, text: c.text, is_safe: c.is_safe, score_delta: c.score_delta, feedback: c.feedback || '', explanation: c.explanation || '', next_step_id: c.next_step_id ? String(c.next_step_id) : '', sort_order: c.sort_order, editingId: c.id })}>Edit</button>
                        <button className="moduleCta" style={{ ...btnSm, color: '#ef4444' }} onClick={() => onDeleteChoice(c.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Simulation Modal */}
      {showForm && (
        <div className="tcModal" onClick={() => setShowForm(false)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{editing ? 'Edit Simulation' : 'Add Simulation'}</h2><button className="tcModalClose" onClick={() => setShowForm(false)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Title *</label><input style={sf} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="tcField"><label>Description</label><textarea style={{ ...sf, height: 70 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="tcField"><label>Category *</label>
              {cats.length === 0
                ? <div style={{ fontSize: '0.82rem', color: '#ef4444', padding: '8px 0' }}>⚠️ No categories found. Ask an admin to create quiz categories first.</div>
                : <select style={sf} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                    <option value="">— Select category —</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              }
            </div>
              <div className="tcField"><label>Difficulty</label><select style={sf} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
              <div className="tcField"><label>Time Limit (sec)</label><input style={sf} type="number" value={form.time_limit_seconds} onChange={e => setForm(f => ({ ...f, time_limit_seconds: e.target.value }))} /></div>
              <div className="tcField"><label>Max Score</label><input style={sf} type="number" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} /></div>
            </div>
            <div className="tcField"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setShowForm(false)}>Cancel</button><button className="moduleCta primary" onClick={onSave} disabled={saving || !form.category_id || !form.title.trim()}>{saving ? 'Saving…' : 'Save'}</button></div>
          </div>
        </div>
      )}

      {/* Step Modal */}
      {stepForm && (
        <div className="tcModal" onClick={() => setStepForm(null)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{stepForm.editingId ? 'Edit Step' : 'Add Step'}</h2><button className="tcModalClose" onClick={() => setStepForm(null)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Title *</label><input style={sf} value={stepForm.title} onChange={e => setStepForm(f => f ? { ...f, title: e.target.value } : f)} /></div>
            <div className="tcField"><label>Prompt / Scenario *</label><textarea style={{ ...sf, height: 100 }} value={stepForm.prompt} onChange={e => setStepForm(f => f ? { ...f, prompt: e.target.value } : f)} /></div>
            <div className="tcField"><label>Educational Note (shown after)</label><textarea style={{ ...sf, height: 70 }} value={stepForm.education} onChange={e => setStepForm(f => f ? { ...f, education: e.target.value } : f)} /></div>
            <div className="tcField"><label>Step Order</label><input style={{ ...sf, width: 80 }} type="number" value={stepForm.step_order} onChange={e => setStepForm(f => f ? { ...f, step_order: +e.target.value } : f)} /></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setStepForm(null)}>Cancel</button><button className="moduleCta primary" onClick={onSaveStep} disabled={saving}>{saving ? 'Saving…' : 'Save Step'}</button></div>
          </div>
        </div>
      )}

      {/* Choice Modal */}
      {choiceForm && (
        <div className="tcModal" onClick={() => setChoiceForm(null)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{choiceForm.editingId ? 'Edit Choice' : 'Add Choice'}</h2><button className="tcModalClose" onClick={() => setChoiceForm(null)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Choice Text *</label><textarea style={{ ...sf, height: 70 }} value={choiceForm.text} onChange={e => setChoiceForm(f => f ? { ...f, text: e.target.value } : f)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="tcField"><label>Score Delta</label><input style={sf} type="number" value={choiceForm.score_delta} onChange={e => setChoiceForm(f => f ? { ...f, score_delta: +e.target.value } : f)} /></div>
              <div className="tcField"><label>Next Step ID (optional)</label><input style={sf} type="number" value={choiceForm.next_step_id} onChange={e => setChoiceForm(f => f ? { ...f, next_step_id: e.target.value } : f)} placeholder="Leave blank = end" /></div>
            </div>
            <div className="tcField"><label>Feedback (shown to student)</label><textarea style={{ ...sf, height: 60 }} value={choiceForm.feedback} onChange={e => setChoiceForm(f => f ? { ...f, feedback: e.target.value } : f)} /></div>
            <div className="tcField"><label>Explanation</label><textarea style={{ ...sf, height: 60 }} value={choiceForm.explanation} onChange={e => setChoiceForm(f => f ? { ...f, explanation: e.target.value } : f)} /></div>
            <div className="tcField"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={choiceForm.is_safe} onChange={e => setChoiceForm(f => f ? { ...f, is_safe: e.target.checked } : f)} /> Safe choice (correct behaviour)</label></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setChoiceForm(null)}>Cancel</button><button className="moduleCta primary" onClick={onSaveChoice} disabled={saving}>{saving ? 'Saving…' : 'Save Choice'}</button></div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoForm && (
        <div className="tcModal" onClick={() => setVideoForm(null)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>Add Intro Video</h2><button className="tcModalClose" onClick={() => setVideoForm(null)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Title *</label><input style={sf} value={videoForm.title} onChange={e => setVideoForm(f => f ? { ...f, title: e.target.value } : f)} /></div>
            <div className="tcField"><label>Video URL (YouTube / direct link)</label><input style={sf} value={videoForm.video_url} onChange={e => setVideoForm(f => f ? { ...f, video_url: e.target.value } : f)} placeholder="https://youtube.com/watch?v=..." /></div>
            <div className="tcField"><label>Description</label><textarea style={{ ...sf, height: 60 }} value={videoForm.description} onChange={e => setVideoForm(f => f ? { ...f, description: e.target.value } : f)} /></div>
            <div className="tcField"><label>Sort Order</label><input style={{ ...sf, width: 80 }} type="number" value={videoForm.sort_order} onChange={e => setVideoForm(f => f ? { ...f, sort_order: +e.target.value } : f)} /></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setVideoForm(null)}>Cancel</button><button className="moduleCta primary" onClick={onSaveVideo} disabled={saving}>{saving ? 'Saving…' : 'Add Video'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
