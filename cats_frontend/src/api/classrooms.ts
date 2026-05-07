import { api } from './client'

export interface Classroom {
  id: number
  teacher_id: number
  name: string
  description: string | null
  code: string
  qr_code_path: string | null
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  students_count?: number
  students?: ClassroomStudent[]
  quizzes?: ClassroomResource[]
  simulations?: ClassroomResource[]
  modules?: ClassroomResource[]
  teacher?: { id: number; name: string; email: string }
}

export interface ClassroomStudent {
  id: number
  name: string
  email: string
  role: string
  pivot: { joined_at: string; status: string }
}

export interface ClassroomResource {
  id: number
  title: string
  description: string | null
  pivot: {
    assigned_at: string
    due_date: string | null
    is_active: boolean
    is_completed?: boolean
    score?: number | null
    time_limit_seconds?: number | null
  }
}

export interface QRCodeData {
  qr_code_url: string
  classroom_code: string
  join_url: string
}

export interface TeacherStudentProgressRow {
  id: number
  name: string
  email: string
  xp: number
  last_login_at: string | null
  modules: { completed: number; total: number; percent: number }
  quizzes: { attempts_completed: number; avg_percent: number; last_percent: number | null }
  simulations: { runs_completed: number; avg_percent: number; last_percent: number | null }
}

export interface TeacherClassroomReport {
  generated_at: string
  classroom: { id: number; name: string; code: string; status: string }
  totals: { students: number; modules_assigned: number; quizzes_assigned: number; simulations_assigned: number }
  summary: { avg_module_completion_percent: number; avg_quiz_percent: number; avg_simulation_percent: number }
  students: TeacherStudentProgressRow[]
}

export interface TeacherSummaryReport {
  generated_at: string
  totals: { classrooms: number; students: number; modules_assigned: number; quizzes_assigned: number; simulations_assigned: number }
  averages: { avg_module_completion_percent: number; avg_quiz_percent: number; avg_simulation_percent: number }
  classrooms: Array<{
    id: number
    name: string
    code: string
    status: string
    students: number
    avg_module_completion_percent: number
    avg_quiz_percent: number
    avg_simulation_percent: number
  }>
}

// ── Teacher API ──────────────────────────────────────────────────────────────

export const teacherClassroomAPI = {
  getClassrooms: () =>
    api.get<{ classrooms: Classroom[] }>('/api/teacher/classrooms').then(r => r.data),

  createClassroom: (data: { name: string; description?: string }) =>
    api.post<{ classroom: Classroom }>('/api/teacher/classrooms', data).then(r => r.data),

  getClassroom: (id: number) =>
    api.get<{ classroom: Classroom }>(`/api/teacher/classrooms/${id}`).then(r => r.data),

  updateClassroom: (id: number, data: { name?: string; description?: string; status?: string }) =>
    api.patch<{ classroom: Classroom }>(`/api/teacher/classrooms/${id}`, data).then(r => r.data),

  deleteClassroom: (id: number) =>
    api.delete(`/api/teacher/classrooms/${id}`),

  getQRCode: (id: number) =>
    api.get<QRCodeData>(`/api/teacher/classrooms/${id}/qr-code`).then(r => r.data),

  regenerateCode: (id: number) =>
    api.post<{ classroom: Classroom }>(`/api/teacher/classrooms/${id}/regenerate-code`).then(r => r.data),

  getStudents: (id: number) =>
    api.get<{ students: ClassroomStudent[] }>(`/api/teacher/classrooms/${id}/students`).then(r => r.data),

  removeStudent: (classroomId: number, studentId: number) =>
    api.delete(`/api/teacher/classrooms/${classroomId}/students/${studentId}`),

  assignQuiz: (classroomId: number, data: { quiz_id: number; due_date?: string; time_limit_seconds?: number }) =>
    api.post(`/api/teacher/classrooms/${classroomId}/quizzes`, data),

  removeQuiz: (classroomId: number, quizId: number) =>
    api.delete(`/api/teacher/classrooms/${classroomId}/quizzes/${quizId}`),

  assignSimulation: (classroomId: number, data: { simulation_id: number; due_date?: string; time_limit_seconds?: number }) =>
    api.post(`/api/teacher/classrooms/${classroomId}/simulations`, data),

  removeSimulation: (classroomId: number, simulationId: number) =>
    api.delete(`/api/teacher/classrooms/${classroomId}/simulations/${simulationId}`),

  assignModule: (classroomId: number, data: { module_id: number; due_date?: string }) =>
    api.post(`/api/teacher/classrooms/${classroomId}/modules`, data),

  removeModule: (classroomId: number, moduleId: number) =>
    api.delete(`/api/teacher/classrooms/${classroomId}/modules/${moduleId}`),

  getAnalytics: (id: number) =>
    api.get(`/api/teacher/classrooms/${id}/analytics`).then(r => r.data),
}

export const teacherReportsAPI = {
  getSummary: (params?: { from?: string; to?: string }) =>
    api.get<TeacherSummaryReport>('/api/teacher/reports/summary', { params }).then(r => r.data),

  getClassroom: (classroomId: number, params?: { from?: string; to?: string }) =>
    api.get<TeacherClassroomReport>(`/api/teacher/reports/classrooms/${classroomId}`, { params }).then(r => r.data),

  downloadSummaryCsv: (params?: { from?: string; to?: string }) =>
    api.get('/api/teacher/reports/summary', { params: { ...params, format: 'csv' }, responseType: 'blob' }).then(r => r.data as Blob),

  downloadClassroomCsv: (classroomId: number, params?: { from?: string; to?: string }) =>
    api.get(`/api/teacher/reports/classrooms/${classroomId}`, { params: { ...params, format: 'csv' }, responseType: 'blob' }).then(r => r.data as Blob),
}

// ── Student API ──────────────────────────────────────────────────────────────

export const studentClassroomAPI = {
  getClassrooms: () =>
    api.get<{ classrooms: Classroom[] }>('/api/student/classrooms').then(r => r.data),

  joinClassroom: (code: string) =>
    api.post<{ message: string; classroom: Classroom }>('/api/student/classrooms/join', { code }).then(r => r.data),

  verifyCode: (code: string) =>
    api.post<{ valid: boolean; classroom?: Classroom }>('/api/student/classrooms/verify-code', { code }).then(r => r.data),

  getClassroom: (id: number) =>
    api.get<{ classroom: Classroom }>(`/api/student/classrooms/${id}`).then(r => r.data),

  leaveClassroom: (id: number) =>
    api.post(`/api/student/classrooms/${id}/leave`),

  getQuizzes: (id: number) =>
    api.get<{ quizzes: ClassroomResource[] }>(`/api/student/classrooms/${id}/quizzes`).then(r => r.data),

  getSimulations: (id: number) =>
    api.get<{ simulations: ClassroomResource[] }>(`/api/student/classrooms/${id}/simulations`).then(r => r.data),

  getModules: (id: number) =>
    api.get<{ modules: ClassroomResource[] }>(`/api/student/classrooms/${id}/modules`).then(r => r.data),
}
