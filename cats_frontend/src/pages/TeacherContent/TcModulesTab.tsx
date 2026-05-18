import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../components/IconMap'
import {
  tcGetModules, tcCreateModule, tcUpdateModule, tcDeleteModule,
  tcCreateTopic, tcUpdateTopic, tcDeleteTopic,
  tcGetQuizzes,
  type TcModule, type TcQuiz,
} from '../../api/teacherContent'

type ModForm = { title: string; description: string; is_active: boolean; quiz_id: string }
type TopicForm = { moduleId: number; title: string; content: string; sort_order: number; editingId?: number } | null

// ── Insert sub-dialog types ────────────────────────────────────
type InsertMode = null | 'link' | 'url'

// ── Helper: insert HTML at textarea cursor ─────────────────────
function insertAtCursor(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  html: string,
  onChange: (val: string) => void,
) {
  const el = ref.current
  if (!el) return
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? el.value.length
  const newVal = el.value.slice(0, start) + html + el.value.slice(end)
  onChange(newVal)
  // Restore cursor after inserted text
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + html.length
    el.focus()
  })
}

// ── INSERT Toolbar ─────────────────────────────────────────────
function InsertToolbar({ onInsert }: { onInsert: (html: string) => void }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<InsertMode>(null)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [embedType, setEmbedType] = useState<'iframe' | 'link'>('link')
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function pickOption(opt: InsertMode | 'file' | 'camera') {
    setOpen(false)
    if (opt === 'file') { fileRef.current?.click(); return }
    if (opt === 'camera') { cameraRef.current?.click(); return }
    setMode(opt)
    setLinkUrl(''); setLinkText(''); setEmbedUrl('')
  }

  function readImageFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      const alt = file.name.replace(/\.[^.]+$/, '')
      const html = `<img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px;" />`
      onInsert(html)
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type.startsWith('image/')) {
      readImageFile(file)
    } else {
      // Non-image: insert a download link placeholder
      const html = `<a href="#" download="${file.name}">📎 ${file.name}</a>`
      onInsert(html)
    }
    e.target.value = ''
  }

  function handleInsertLink() {
    if (!linkUrl) return
    const text = linkText || linkUrl
    const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`
    onInsert(html)
    setMode(null)
  }

  function handleInsertUrl() {
    if (!embedUrl) return
    let html = ''
    if (embedType === 'iframe') {
      html = `<iframe src="${embedUrl}" width="100%" height="360" style="border:none;border-radius:10px;" allowfullscreen loading="lazy"></iframe>`
    } else {
      html = `<a href="${embedUrl}" target="_blank" rel="noopener noreferrer">🌐 ${embedUrl}</a>`
    }
    onInsert(html)
    setMode(null)
  }

  const subInputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 8,
    border: '1.5px solid var(--border-color)',
    background: 'var(--page-bg)', color: 'var(--text-primary)',
    fontFamily: 'inherit', fontSize: '0.88rem', width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={menuRef}>
      {/* Hidden file inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* INSERT trigger button */}
      <button
        type="button"
        id="insert-content-btn"
        className="tcInsertBtn"
        onClick={() => { setMode(null); setOpen(o => !o) }}
        title="Insert content"
      >
        <Icon name="add_circle" size={16} />
        INSERT
        <Icon name={open ? 'expand_less' : 'expand_more'} size={15} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="tcInsertMenu" role="menu">
          <button
            type="button"
            className="tcInsertMenuItem"
            role="menuitem"
            id="insert-file-btn"
            onClick={() => pickOption('file')}
          >
            <span className="tcInsertMenuIcon">📁</span>
            <div>
              <div className="tcInsertMenuLabel">Files</div>
              <div className="tcInsertMenuSub">Images, PDFs, documents</div>
            </div>
          </button>

          <button
            type="button"
            className="tcInsertMenuItem"
            role="menuitem"
            id="insert-link-btn"
            onClick={() => pickOption('link')}
          >
            <span className="tcInsertMenuIcon">🔗</span>
            <div>
              <div className="tcInsertMenuLabel">Link</div>
              <div className="tcInsertMenuSub">Hyperlink with custom text</div>
            </div>
          </button>

          <button
            type="button"
            className="tcInsertMenuItem"
            role="menuitem"
            id="insert-url-btn"
            onClick={() => pickOption('url')}
          >
            <span className="tcInsertMenuIcon">🌐</span>
            <div>
              <div className="tcInsertMenuLabel">Browser / URL</div>
              <div className="tcInsertMenuSub">Embed a webpage or video</div>
            </div>
          </button>

          <button
            type="button"
            className="tcInsertMenuItem"
            role="menuitem"
            id="insert-camera-btn"
            onClick={() => pickOption('camera')}
          >
            <span className="tcInsertMenuIcon">📷</span>
            <div>
              <div className="tcInsertMenuLabel">Camera / Gallery</div>
              <div className="tcInsertMenuSub">Take photo or pick from gallery</div>
            </div>
          </button>
        </div>
      )}

      {/* Link sub-dialog */}
      {mode === 'link' && (
        <div className="tcInsertSubDialog" role="dialog" aria-label="Insert link">
          <div className="tcInsertSubDialogHeader">
            <span>🔗 Insert Link</span>
            <button type="button" className="tcModalClose" onClick={() => setMode(null)}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              id="insert-link-url"
              style={subInputStyle}
              placeholder="https://example.com"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              autoFocus
            />
            <input
              id="insert-link-text"
              style={subInputStyle}
              placeholder="Display text (optional)"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="moduleCta" onClick={() => setMode(null)}>Cancel</button>
              <button type="button" className="moduleCta primary" onClick={handleInsertLink} disabled={!linkUrl}>
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL/Embed sub-dialog */}
      {mode === 'url' && (
        <div className="tcInsertSubDialog" role="dialog" aria-label="Insert URL">
          <div className="tcInsertSubDialogHeader">
            <span>🌐 Insert URL / Embed</span>
            <button type="button" className="tcModalClose" onClick={() => setMode(null)}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input
              id="insert-url-input"
              style={subInputStyle}
              placeholder="https://www.youtube.com/embed/..."
              value={embedUrl}
              onChange={e => setEmbedUrl(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {(['link', 'iframe'] as const).map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                  <input
                    type="radio"
                    name="embedType"
                    checked={embedType === t}
                    onChange={() => setEmbedType(t)}
                  />
                  {t === 'link' ? '🔗 As link' : '📺 Embed (iframe)'}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="moduleCta" onClick={() => setMode(null)}>Cancel</button>
              <button type="button" className="moduleCta primary" onClick={handleInsertUrl} disabled={!embedUrl}>
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Tab ───────────────────────────────────────────────────
export function TcModulesTab() {
  const [items, setItems] = useState<TcModule[]>([])
  const [quizzes, setQuizzes] = useState<TcQuiz[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TcModule | null>(null)
  const [form, setForm] = useState<ModForm>({ title: '', description: '', is_active: true, quiz_id: '' })
  const [topicForm, setTopicForm] = useState<TopicForm>(null)
  const [saving, setSaving] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  async function load() {
    try {
      const [mr, qr] = await Promise.all([tcGetModules(), tcGetQuizzes()])
      setItems(mr.modules); setQuizzes(qr.quizzes)
    } catch { setErr('Failed to load') }
  }
  useEffect(() => { load() }, [])

  function openCreate() { setForm({ title: '', description: '', is_active: true, quiz_id: '' }); setEditing(null); setShowForm(true) }
  function openEdit(m: TcModule) { setForm({ title: m.title, description: m.description || '', is_active: m.is_active, quiz_id: m.quiz_id ? String(m.quiz_id) : '' }); setEditing(m); setShowForm(true) }

  async function onSave() {
    setSaving(true); setErr(null)
    try {
      const payload = { title: form.title, description: form.description || undefined, is_active: form.is_active, quiz_id: form.quiz_id ? +form.quiz_id : null }
      if (editing) await tcUpdateModule(editing.id, payload)
      else await tcCreateModule(payload)
      setShowForm(false); load()
    } catch { setErr('Save failed') } finally { setSaving(false) }
  }

  async function onDelete(id: number) {
    if (!confirm('Delete this module and all its topics?')) return
    try { await tcDeleteModule(id); load() } catch { setErr('Delete failed') }
  }

  async function onSaveTopic() {
    if (!topicForm) return; setSaving(true)
    try {
      if (topicForm.editingId) await tcUpdateTopic(topicForm.editingId, { title: topicForm.title, content: topicForm.content, sort_order: topicForm.sort_order })
      else await tcCreateTopic(topicForm.moduleId, { title: topicForm.title, content: topicForm.content, sort_order: topicForm.sort_order })
      setTopicForm(null); load()
    } catch { setErr('Topic save failed') } finally { setSaving(false) }
  }

  async function onDeleteTopic(id: number) {
    if (!confirm('Delete topic?')) return
    try { await tcDeleteTopic(id); load() } catch { setErr('Delete failed') }
  }

  function handleInsert(html: string) {
    if (!topicForm) return
    insertAtCursor(contentRef, html, (newVal) =>
      setTopicForm(f => f ? { ...f, content: newVal } : f)
    )
  }

  const sf: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border-color)', background: 'var(--page-bg)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem', width: '100%' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Training Modules</h2>
        <button className="moduleCta primary" onClick={openCreate}><Icon name="add" size={16} /> New Module</button>
      </div>
      {err && <div className="modulesError">{err}</div>}
      {items.length === 0 && <div className="tcEmpty"><Icon name="library_books" size={40} /><p>No modules yet. Create your first one!</p></div>}
      {items.map(m => (
        <div key={m.id} className="rptCard" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{m.description || '—'} · Quiz: {m.quiz?.title || 'None'}</div>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 99, background: m.is_active ? '#22c55e20' : '#94a3b820', color: m.is_active ? '#22c55e' : '#94a3b8', fontWeight: 700, display: 'inline-block', marginTop: 4 }}>{m.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => openEdit(m)}>Edit</button>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={() => setTopicForm({ moduleId: m.id, title: '', content: '', sort_order: 0 })}>+ Topic</button>
              <button className="moduleCta" style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#ef4444' }} onClick={() => onDelete(m.id)}>Delete</button>
            </div>
          </div>
          {(m.topics || []).map((t, i) => (
            <div key={t.id} style={{ background: 'var(--page-bg)', borderRadius: 8, padding: '8px 12px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Topic {i + 1}: {t.title}</span>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.content.length > 100 ? t.content.slice(0, 100) + '…' : t.content}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button className="moduleCta" style={{ padding: '3px 10px', fontSize: '0.75rem' }} onClick={() => setTopicForm({ moduleId: m.id, title: t.title, content: t.content, sort_order: t.sort_order, editingId: t.id })}>Edit</button>
                <button className="moduleCta" style={{ padding: '3px 10px', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => onDeleteTopic(t.id)}>×</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Module modal */}
      {showForm && (
        <div className="tcModal" onClick={() => setShowForm(false)}>
          <div className="tcModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader"><h2>{editing ? 'Edit Module' : 'Add Module'}</h2><button className="tcModalClose" onClick={() => setShowForm(false)}><Icon name="close" size={20} /></button></div>
            <div className="tcField"><label>Title *</label><input style={sf} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="tcField"><label>Description</label><textarea style={{ ...sf, height: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="tcField">
              <label>Linked Quiz (taken after module)</label>
              <select style={sf} value={form.quiz_id} onChange={e => setForm(f => ({ ...f, quiz_id: e.target.value }))}>
                <option value="">No Quiz</option>
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            <div className="tcField"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label></div>
            <div className="tcModalActions"><button className="moduleCta" onClick={() => setShowForm(false)}>Cancel</button><button className="moduleCta primary" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></div>
          </div>
        </div>
      )}

      {/* Topic modal */}
      {topicForm && (
        <div className="tcModal" onClick={() => setTopicForm(null)}>
          <div className="tcModalBox tcTopicModalBox" onClick={e => e.stopPropagation()}>
            <div className="tcModalHeader">
              <h2>{topicForm.editingId ? 'Edit Topic' : 'Add Topic'}</h2>
              <button className="tcModalClose" onClick={() => setTopicForm(null)}><Icon name="close" size={20} /></button>
            </div>
            <div className="tcField"><label>Title *</label><input style={sf} value={topicForm.title} onChange={e => setTopicForm(f => f ? { ...f, title: e.target.value } : f)} /></div>

            {/* ── Content Editor with INSERT toolbar ── */}
            <div style={{ marginBottom: 12 }}>
              <div className="tcContentEditorHeader">
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Content <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.7 }}>(HTML supported)</span>
                </label>
                <InsertToolbar onInsert={handleInsert} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <textarea
                    ref={contentRef}
                    style={{ ...sf, height: 320, fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
                    value={topicForm.content}
                    onChange={e => setTopicForm(f => f ? { ...f, content: e.target.value } : f)}
                    placeholder="<p>Your content here…</p>"
                    id="topic-content-textarea"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live Preview</label>
                  <div style={{ height: 320, border: '1.5px solid var(--border-color)', borderRadius: 8, padding: 12, overflow: 'auto', fontSize: 14, lineHeight: 1.6, background: 'var(--page-bg)' }}>
                    {topicForm.content
                      ? <div dangerouslySetInnerHTML={{ __html: topicForm.content }} />
                      : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Preview…</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="tcField"><label>Sort Order</label><input style={{ ...sf, width: 80 }} type="number" value={topicForm.sort_order} onChange={e => setTopicForm(f => f ? { ...f, sort_order: +e.target.value } : f)} /></div>
            <div className="tcModalActions">
              <button className="moduleCta" onClick={() => setTopicForm(null)}>Cancel</button>
              <button className="moduleCta primary" onClick={onSaveTopic} disabled={saving}>{saving ? 'Saving…' : 'Save Topic'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
