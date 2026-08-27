// apps/dhcb/src/pages/Work.tsx — Work Hub UI (V2-15)
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  CheckSquare,
  Users,
  FileText,
  Plus,
  RefreshCw,
  Loader2,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  X,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { useToast } from '@core/ToastProvider'
import {
  listWorkProjects,
  createWorkProject,
  updateWorkProjectStatus,
  listWorkTasks,
  createWorkTask,
  updateWorkTaskStatus,
  listWorkMeetings,
  recordWorkMeeting,
  listWorkDocuments,
  createWorkDocument,
} from '../../../lib/workApi'
import type { WorkProject, WorkTask, WorkMeeting, WorkDocument } from '@dhcb/core-contracts/work'

// `embedded` = đang được nhúng trong trang gộp "Công việc & Đời sống"
// (`/cong-viec-cuoc-song`): khi đó KHÔNG dựng Layout riêng và KHÔNG render
// PageHeader (h1) nữa — trang gộp đã có h1 của nó, hai h1 trên một trang là
// lỗi phân cấp tiêu đề (a11y).
export default function Work({ embedded = false }: { embedded?: boolean } = {}) {
  const nav = useNavigate()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'meetings' | 'documents'>(
    'tasks',
  )
  const [projects, setProjects] = useState<WorkProject[]>([])
  const [tasks, setTasks] = useState<WorkTask[]>([])
  const [meetings, setMeetings] = useState<WorkMeeting[]>([])
  const [documents, setDocuments] = useState<WorkDocument[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Modals
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)

  // Forms
  const [projectForm, setProjectForm] = useState({ name: '', description: '', deadline: '' })
  const [taskForm, setTaskForm] = useState({
    title: '',
    projectId: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    dueAt: '',
  })
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    scheduledAt: '',
    durationMinutes: 30,
    summary: '',
    actionItems: '',
  })
  const [docForm, setDocForm] = useState({
    title: '',
    projectId: '',
    documentType: 'spec' as 'spec' | 'minutes' | 'proposal' | 'report' | 'note',
    summary: '',
    contentUri: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projData, taskData, meetData, docData] = await Promise.all([
        listWorkProjects().catch(() => []),
        listWorkTasks(selectedProjectId || undefined).catch(() => []),
        listWorkMeetings().catch(() => []),
        listWorkDocuments(selectedProjectId || undefined).catch(() => []),
      ])
      setProjects(projData)
      setTasks(taskData)
      setMeetings(meetData)
      setDocuments(docData)
    } catch {
      toast.error('Không thể tải dữ liệu không gian làm việc')
    } finally {
      setLoading(false)
    }
  }, [toast, selectedProjectId])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve().then(loadData)
  }, [loadData])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createWorkProject({
        name: projectForm.name,
        description: projectForm.description || undefined,
        deadline: projectForm.deadline ? new Date(projectForm.deadline).toISOString() : undefined,
      })
      setProjects((prev) => [created, ...prev])
      setShowProjectModal(false)
      setProjectForm({ name: '', description: '', deadline: '' })
      toast.success('Đã tạo dự án thành công!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo dự án')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createWorkTask({
        title: taskForm.title,
        projectId: taskForm.projectId || undefined,
        priority: taskForm.priority,
        dueAt: taskForm.dueAt ? new Date(taskForm.dueAt).toISOString() : undefined,
      })
      setTasks((prev) => [created, ...prev])
      setShowTaskModal(false)
      setTaskForm({ title: '', projectId: '', priority: 'medium', dueAt: '' })
      toast.success('Đã tạo công việc!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo công việc')
    }
  }

  const handleToggleTaskStatus = async (task: WorkTask) => {
    const nextStatus: WorkTask['status'] = task.status === 'done' ? 'todo' : 'done'
    try {
      const updated = await updateWorkTaskStatus(task.id, nextStatus)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      toast.success(nextStatus === 'done' ? 'Đã hoàn thành công việc!' : 'Đã mở lại công việc')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái')
    }
  }

  const handleRecordMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const actionItems = meetingForm.actionItems
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const created = await recordWorkMeeting({
        title: meetingForm.title,
        scheduledAt: new Date(meetingForm.scheduledAt).toISOString(),
        durationMinutes: Number(meetingForm.durationMinutes) || 30,
        summary: meetingForm.summary || undefined,
        actionItems: actionItems.length > 0 ? actionItems : undefined,
      })
      setMeetings((prev) => [created, ...prev])
      setShowMeetingModal(false)
      setMeetingForm({
        title: '',
        scheduledAt: '',
        durationMinutes: 30,
        summary: '',
        actionItems: '',
      })
      toast.success('Đã ghi nhận biên bản cuộc họp!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu cuộc họp')
    }
  }

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const created = await createWorkDocument({
        title: docForm.title,
        projectId: docForm.projectId || undefined,
        documentType: docForm.documentType,
        summary: docForm.summary,
        contentUri: docForm.contentUri || undefined,
      })
      setDocuments((prev) => [created, ...prev])
      setShowDocModal(false)
      setDocForm({ title: '', projectId: '', documentType: 'spec', summary: '', contentUri: '' })
      toast.success('Đã thêm tài liệu!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tạo tài liệu')
    }
  }

  const body = (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 pb-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        {embedded ? (
          <div className="mb-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              Không Gian Công Việc (Work Hub)
            </h2>
            <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed">
              Quản lý dự án, tiến độ công việc, biên bản họp và tài liệu nghiệp vụ
            </p>
          </div>
        ) : (
          <PageHeader
            title="Không Gian Công Việc (Work Hub)"
            subtitle="Quản lý dự án, tiến độ công việc, biên bản họp và tài liệu nghiệp vụ"
            className="mb-0"
          />
        )}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => nav('/work/kanban')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold transition shadow-sm"
            title="Bảng Kanban Tương Tác"
          >
            <FolderKanban className="w-4 h-4" />
            Bảng Kanban
          </button>
          <select
            // Ô lọc không có nhãn hiển thị (chỉ có option "Tất cả dự án") → cần
            // aria-label để trình đọc màn hình biết ô này lọc theo cái gì.
            aria-label="Lọc theo dự án"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm focus:outline-none"
          >
            <option value="">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium border border-zinc-800 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'tasks'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Công việc ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'projects'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          Dự án ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'meetings'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Cuộc họp ({meetings.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeTab === 'documents'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Tài liệu ({documents.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Đang tải dữ liệu công việc...</p>
        </div>
      ) : (
        <div>
          {/* Tab 1: Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">Danh Sách Công Việc</h3>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm công việc
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có công việc nào trong danh sách.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.map((task) => {
                    const isDone = task.status === 'done'
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                          isDone
                            ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className="mt-0.5 text-zinc-400 hover:text-emerald-400 transition"
                          >
                            {isDone ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-500" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4
                              className={`text-sm font-semibold truncate ${
                                isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
                              }`}
                            >
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${
                                  task.priority === 'urgent'
                                    ? 'bg-red-950/80 text-red-400 border border-red-800/40'
                                    : task.priority === 'high'
                                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'
                                }`}
                              >
                                {task.priority}
                              </span>
                              {task.dueAt && (
                                <span className="flex items-center gap-1 text-zinc-400">
                                  <Clock className="w-3 h-3" />
                                  {new Date(task.dueAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">Dự Án Đang Thực Hiện</h3>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tạo dự án mới
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có dự án nào. Nhấn &quot;Tạo dự án mới&quot; để bắt đầu!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-zinc-100 text-base">{proj.name}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase border ${
                            proj.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                              : 'bg-blue-950/80 text-blue-400 border-blue-800/40'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      {proj.description && (
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2">
                          {proj.description}
                        </p>
                      )}
                      {proj.deadline && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 mt-4">
                          <Calendar className="w-3.5 h-3.5" />
                          Hạn chót: {new Date(proj.deadline).toLocaleDateString()}
                        </div>
                      )}
                      <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateWorkProjectStatus(
                              proj.id,
                              proj.status === 'completed' ? 'active' : 'completed',
                            ).then(loadData)
                          }
                          className="text-xs text-zinc-400 hover:text-zinc-200 transition font-medium"
                        >
                          {proj.status === 'completed' ? 'Mở lại dự án' : 'Đánh dấu hoàn thành'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Meetings */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">
                  Biên Bản Cuộc Họp (Meeting Minutes)
                </h3>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ghi lại cuộc họp
                </button>
              </div>

              {meetings.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có biên bản cuộc họp nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((m) => (
                    <div
                      key={m.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-zinc-100 text-base">{m.title}</h4>
                        <span className="text-xs text-zinc-400">
                          {new Date(m.scheduledAt).toLocaleString()} ({m.durationMinutes} phút)
                        </span>
                      </div>
                      {m.summary && (
                        <p className="text-xs text-zinc-300 mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                          {m.summary}
                        </p>
                      )}
                      {m.actionItems && m.actionItems.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-semibold text-zinc-400">Action Items:</span>
                          <ul className="mt-1 space-y-1">
                            {m.actionItems.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-xs text-zinc-300 flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-zinc-200">Tài Liệu Nghiệp Vụ</h3>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm tài liệu
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-500 text-sm">
                  Chưa có tài liệu nào được lưu trữ.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-zinc-100 text-sm">{doc.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 uppercase">
                          {doc.documentType}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-2">{doc.summary}</p>
                      {doc.contentUri && (
                        <div className="text-xs text-blue-400 mt-3 truncate">
                          URI: {doc.contentUri}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Create Project */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Tạo Dự Án Mới</h3>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tên dự án (*)
                </label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="VD: Nâng cấp Platform V2"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Mô tả dự án</label>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="Chi tiết phạm vi và mục tiêu..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Hạn chót (Deadline)
                </label>
                <input
                  type="date"
                  value={projectForm.deadline}
                  onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                  Tạo Dự Án
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Task */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Thêm Công Việc Mới</h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tiêu đề công việc (*)
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="VD: Viết Unit tests cho Career API"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="work-task-project"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Dự án
                  </label>
                  <select
                    id="work-task-project"
                    value={taskForm.projectId}
                    onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Không gán dự án</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="work-task-priority"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Độ ưu tiên
                  </label>
                  <select
                    id="work-task-priority"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Hạn chót</label>
                <input
                  type="date"
                  value={taskForm.dueAt}
                  onChange={(e) => setTaskForm({ ...taskForm, dueAt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                  Tạo Công Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Record Meeting */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Ghi Lại Cuộc Họp</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordMeeting} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tiêu đề cuộc họp (*)
                </label>
                <input
                  type="text"
                  required
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="VD: Weekly Sprint Planning"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Thời gian diễn ra (*)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.scheduledAt}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Thời lượng (Phút)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={meetingForm.durationMinutes}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tóm tắt nội dung
                </label>
                <textarea
                  rows={3}
                  value={meetingForm.summary}
                  onChange={(e) => setMeetingForm({ ...meetingForm, summary: e.target.value })}
                  placeholder="Các quyết định và thảo luận chính..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Action items (Mỗi dòng 1 mục)
                </label>
                <textarea
                  rows={2}
                  value={meetingForm.actionItems}
                  onChange={(e) => setMeetingForm({ ...meetingForm, actionItems: e.target.value })}
                  placeholder="VD: Nam hoàn thiện tài liệu API&#10;Hoa deploy staging..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                  Lưu Biên Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Document */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Thêm Tài Liệu</h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tiêu đề tài liệu (*)
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="VD: Architecture Spec V2"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="work-doc-kind"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Loại tài liệu
                  </label>
                  <select
                    id="work-doc-kind"
                    value={docForm.documentType}
                    onChange={(e) =>
                      setDocForm({
                        ...docForm,
                        documentType: e.target.value as
                          'spec' | 'minutes' | 'proposal' | 'report' | 'note',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="spec">Technical Spec</option>
                    <option value="minutes">Meeting Minutes</option>
                    <option value="proposal">Proposal</option>
                    <option value="report">Report</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="work-doc-project"
                    className="block text-xs font-medium text-zinc-400 mb-1"
                  >
                    Dự án
                  </label>
                  <select
                    id="work-doc-project"
                    value={docForm.projectId}
                    onChange={(e) => setDocForm({ ...docForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Không gán dự án</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Tóm tắt nội dung (*)
                </label>
                <textarea
                  rows={3}
                  required
                  value={docForm.summary}
                  onChange={(e) => setDocForm({ ...docForm, summary: e.target.value })}
                  placeholder="Tóm tắt điểm cốt lõi của tài liệu..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Đường dẫn tài liệu (URI)
                </label>
                <input
                  type="text"
                  value={docForm.contentUri}
                  onChange={(e) => setDocForm({ ...docForm, contentUri: e.target.value })}
                  placeholder="VD: docs/specs/v2-spec.md hoặc https://..."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition"
                >
                  Lưu Tài Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )

  if (embedded) return body

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/')} title="Không Gian Công Việc" />
      {body}
    </div>
  )
}
