import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { AdminLayout } from './AdminDashboardPage'
import './AdminFeedbackPage.css'

interface Feedback {
  id: number
  user: {
    id: number
    name: string
    email: string
    participant_code: string | null
  }
  feedback_type: string
  quiz_id: number | null
  simulation_id: number | null
  training_module_id: number | null
  usability_score: number | null
  relevance_score: number | null
  practicality_score: number | null
  engagement_score: number | null
  comment: string | null
  perceived_difficulty: string | null
  would_recommend: boolean
  admin_notes: string | null
  admin_result: string | null
  status: string
  created_at: string
}

export function AdminFeedbackPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [adminNotes, setAdminNotes] = useState('')
  const [adminResult, setAdminResult] = useState('')
  const [updateStatus, setUpdateStatus] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [totalPages, setTotalPages] = useState(1)

  const token = localStorage.getItem('cats_token')

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }

    if (!token) {
      setError('Authentication token not found. Please log in again.')
      setLoading(false)
      return
    }

    fetchFeedback()
  }, [filterType, filterStatus, page])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/admin/feedback?page=${page}&per_page=${perPage}`
      if (filterType !== 'all') url += `&feedback_type=${filterType}`
      if (filterStatus !== 'all') url += `&status=${filterStatus}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: Failed to fetch feedback`)
      }

      const data = await response.json()
      
      // Handle Laravel paginated response structure
      if (data.data && Array.isArray(data.data)) {
        setFeedback(data.data)
        setTotalPages(data.last_page || 1)
      } else if (Array.isArray(data)) {
        setFeedback(data)
        setTotalPages(1)
      } else {
        throw new Error('Unexpected response format')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error loading feedback'
      console.error('Feedback fetch error:', err)
      setError(errorMsg)
      setFeedback([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFeedback = (item: Feedback) => {
    setSelectedFeedback(item)
    setAdminNotes(item.admin_notes || '')
    setAdminResult(item.admin_result || '')
    setUpdateStatus(item.status || 'pending')
  }

  const handleSaveNotes = async () => {
    if (!selectedFeedback || !token) {
      setError('Missing authentication or feedback selection')
      return
    }

    try {
      const response = await fetch(`/api/admin/feedback/${selectedFeedback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          admin_notes: adminNotes,
          admin_result: adminResult,
          status: updateStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Error ${response.status}: Failed to update feedback`)
      }

      setSelectedFeedback(null)
      fetchFeedback()
      alert('Feedback updated successfully')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating feedback'
      alert(errorMsg)
      console.error('Update error:', err)
    }
  }

  const handleExport = async () => {
    if (!token) {
      alert('Authentication token not found. Please log in again.')
      return
    }

    try {
      let url = '/api/admin/feedback/export/csv'
      if (filterType !== 'all') url += `?feedback_type=${filterType}`

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(errorData || `Error ${response.status}: Export failed`)
      }

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error exporting feedback'
      alert(errorMsg)
      console.error('Export error:', err)
    }
  }

  const getAvgScore = (scores: (number | null)[]) => {
    const filtered = scores.filter((s): s is number => s !== null)
    return filtered.length > 0 ? (filtered.reduce((a, b) => a + b, 0) / filtered.length).toFixed(1) : '-'
  }

  if (loading && feedback.length === 0) {
    return (
      <AdminLayout activeTab="feedback" pageTitle="Feedback Management" pageSubtitle="Review and manage user feedback">
        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading feedback...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout activeTab="feedback" pageTitle="Feedback Management" pageSubtitle="Review and manage user feedback">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="adminBtn adminBtnPrimary" onClick={handleExport}>
              Export to CSV
            </button>
          </div>
        </div>

        {error && <div className="adminError">{error}</div>}

        {feedback.length === 0 && !error && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            No feedback found. Try adjusting your filters.
          </div>
        )}

        {feedback.length > 0 && (
          <>
            <div className="adminFilters">
              <div className="adminFilterGroup">
                <label>Type:</label>
                <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1) }}>
                  <option value="all">All Types</option>
                  <option value="quiz">Quiz</option>
                  <option value="simulation">Simulation</option>
                  <option value="module">Module</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="adminFilterGroup">
                <label>Status:</label>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="flagged">Flagged</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="adminFilterGroup">
                <label>Per Page:</label>
                <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>

            <div className="adminContent">
              <div className="adminTable">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Scores</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                        <td>{item.user?.name || 'Unknown'} ({item.user?.participant_code || 'N/A'})</td>
                        <td>{item.feedback_type}</td>
                        <td>
                          {getAvgScore([item.usability_score, item.relevance_score, item.practicality_score, item.engagement_score])} / 5
                        </td>
                        <td>
                          <span className={`adminBadge adminBadge${item.status}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="adminBtn adminBtnSmall"
                            onClick={() => handleSelectFeedback(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="adminPagination">
                <button
                  className="adminBtn adminBtnSmall"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="adminBtn adminBtnSmall"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="adminModal">
          <div className="adminModalContent">
            <div className="adminModalHeader">
              <h2>Feedback Details</h2>
              <button className="adminBtnClose" onClick={() => setSelectedFeedback(null)}>✕</button>
            </div>

            <div className="adminModalBody">
              <div className="adminDetailRow">
                <label>User:</label>
                <span>{selectedFeedback.user?.name} ({selectedFeedback.user?.email})</span>
              </div>

              <div className="adminDetailRow">
                <label>Type:</label>
                <span>{selectedFeedback.feedback_type}</span>
              </div>

              <div className="adminDetailRow">
                <label>Date:</label>
                <span>{new Date(selectedFeedback.created_at).toLocaleString()}</span>
              </div>

              <div className="adminDetailRow">
                <label>Scores:</label>
                <div className="adminScores">
                  <div>Usability: {selectedFeedback.usability_score || '-'}/5</div>
                  <div>Relevance: {selectedFeedback.relevance_score || '-'}/5</div>
                  <div>Practicality: {selectedFeedback.practicality_score || '-'}/5</div>
                  <div>Engagement: {selectedFeedback.engagement_score || '-'}/5</div>
                </div>
              </div>

              <div className="adminDetailRow">
                <label>Would Recommend:</label>
                <span>{selectedFeedback.would_recommend ? 'Yes' : 'No'}</span>
              </div>

              <div className="adminDetailRow">
                <label>Difficulty:</label>
                <span>{selectedFeedback.perceived_difficulty || '-'}</span>
              </div>

              <div className="adminDetailRow">
                <label>Comment:</label>
                <p className="adminComment">{selectedFeedback.comment || 'No comment'}</p>
              </div>

              <div className="adminDetailRow">
                <label>Admin Notes:</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add analysis or notes..."
                  rows={4}
                />
              </div>

              <div className="adminDetailRow">
                <label>Result/Action:</label>
                <textarea
                  value={adminResult}
                  onChange={(e) => setAdminResult(e.target.value)}
                  placeholder="Document actions taken or results..."
                  rows={3}
                />
              </div>

              <div className="adminDetailRow">
                <label>Status:</label>
                <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="flagged">Flagged</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="adminModalFooter">
              <button className="adminBtn" onClick={() => setSelectedFeedback(null)}>
                Cancel
              </button>
              <button className="adminBtn adminBtnPrimary" onClick={handleSaveNotes}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
