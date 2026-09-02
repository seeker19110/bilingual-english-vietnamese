import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../../lib/usePageTitle'
import {
  GitCommit,
  GitMerge,
  Target,
  User,
  Star,
  Building,
  Calendar,
  AlertTriangle,
  Loader2,
  Activity,
  ArrowRight,
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Brain,
  Shield,
  Zap,
  Clock,
  Layers,
  Sparkles,
  X,
} from 'lucide-react'
import Layout from '../../../components/Layout'
import PageHeader from '../../../components/PageHeader'
import { PageShell } from '@core/PageShell'
import CrossDomainSynergyCard from '../../../components/LifeGraph/CrossDomainSynergyCard'
import OutcomeCalibrationCard from '../../../components/DecisionLedger/OutcomeCalibrationCard'
import { useToast } from '@core/ToastProvider'
import {
  listLifeGraphNodes,
  listLifeGraphEdges,
  createLifeGraphNode,
} from '../../../lib/lifeGraphApi'
import {
  listPersonalFacts,
  declarePersonalFact,
  deletePersonalFact,
  listMemories,
  ingestMemory,
  deleteMemory,
  listAutomation,
  updateAutomationGrantStatus,
  syncCrossDomainGraph,
  exportPersonalData,
  erasePersonalData,
} from '../../../lib/knowledgeFabricApi'
import type {
  LifeGraphNode,
  LifeGraphEdge,
  LifeGraphNodeType,
} from '@dhcb/core-contracts/lifeGraph'
import type { PersonalFact, Sensitivity } from '@dhcb/core-contracts/personalFact'
import type { MemoryRecord, MemoryNamespace } from '@dhcb/core-contracts/personalMemory'
import type { AutomationGrant, ActionReceipt } from '@dhcb/core-contracts/automation'
import { useDialogBehavior } from '../../../components/useDialogBehavior'

const NODE_ICONS: Record<LifeGraphNodeType, React.ReactNode> = {
  Person: <User className="w-4 h-4 text-blue-400 theme-light:text-blue-800" />,
  Goal: <Target className="w-4 h-4 text-emerald-400 theme-light:text-emerald-800" />,
  Project: <GitMerge className="w-4 h-4 text-purple-400 theme-light:text-purple-800" />,
  Skill: <Star className="w-4 h-4 text-amber-400 theme-light:text-amber-800" />,
  Organization: <Building className="w-4 h-4 text-zinc-400" />,
  Event: <Calendar className="w-4 h-4 text-pink-400 theme-light:text-pink-800" />,
  Commitment: <GitCommit className="w-4 h-4 text-orange-400 theme-light:text-orange-800" />,
  Constraint: <AlertTriangle className="w-4 h-4 text-rose-400 theme-light:text-rose-800" />,
  Decision: <Activity className="w-4 h-4 text-teal-400 theme-light:text-teal-800" />,
}

const TABS = [
  { id: 'graph', label: 'Mạng lưới Cá nhân', icon: Layers },
  { id: 'synergy', label: 'Cộng hưởng & Đối soát', icon: Activity },
  { id: 'facts', label: 'Sự thật & Ràng buộc', icon: Brain },
  { id: 'memories', label: 'Bộ nhớ Ký ức', icon: Sparkles },
  { id: 'automation', label: 'Quyền Tự động', icon: Zap },
]

export default function LifeGraph() {
  usePageTitle('Bản đồ cuộc sống | Đồng hành cùng bạn')
  const nav = useNavigate()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<
    'graph' | 'synergy' | 'facts' | 'memories' | 'automation'
  >('graph')
  const [loading, setLoading] = useState(true)

  // Graph state
  const [nodes, setNodes] = useState<LifeGraphNode[]>([])
  const [edges, setEdges] = useState<LifeGraphEdge[]>([])
  const [nodeFilter, setNodeFilter] = useState<string>('all')
  const [showAddNodeModal, setShowAddNodeModal] = useState(false)
  // 4 hộp thoại nội tuyến của trang này — mỗi cái một bộ 6 hành vi a11y bắt buộc.
  const closeAddNode = useCallback(() => setShowAddNodeModal(false), [])
  const addNodeDialog = useDialogBehavior(closeAddNode, showAddNodeModal)
  const [newNodeType, setNewNodeType] = useState<LifeGraphNodeType>('Goal')
  const [newNodeLabel, setNewNodeLabel] = useState('')
  const [syncingGraph, setSyncingGraph] = useState(false)

  // Facts state
  const [facts, setFacts] = useState<PersonalFact[]>([])
  const [showAddFactModal, setShowAddFactModal] = useState(false)
  const closeAddFact = useCallback(() => setShowAddFactModal(false), [])
  const addFactDialog = useDialogBehavior(closeAddFact, showAddFactModal)
  const [newFactCategory, setNewFactCategory] = useState<string>('preference')
  const [newFactKey, setNewFactKey] = useState('')
  const [newFactValue, setNewFactValue] = useState('')
  const [newFactSensitivity, setNewFactSensitivity] = useState<Sensitivity>('personal')

  // Memories state
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [memoryNamespaceFilter, setMemoryNamespaceFilter] = useState<string>('all')
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false)
  const closeAddMemory = useCallback(() => setShowAddMemoryModal(false), [])
  const addMemoryDialog = useDialogBehavior(closeAddMemory, showAddMemoryModal)
  const [newMemNamespace, setNewMemNamespace] = useState<MemoryNamespace>('semantic')
  const [newMemContent, setNewMemContent] = useState('')

  // Automation state
  const [grants, setGrants] = useState<AutomationGrant[]>([])
  const [receipts, setReceipts] = useState<ActionReceipt[]>([])

  // Privacy & export modal
  const [showEraseModal, setShowEraseModal] = useState(false)
  const closeErase = useCallback(() => setShowEraseModal(false), [])
  const eraseDialog = useDialogBehavior(closeErase, showEraseModal)
  const [erasing, setErasing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [n, e, f, m, auto] = await Promise.all([
        listLifeGraphNodes(),
        listLifeGraphEdges(),
        listPersonalFacts().catch(() => []),
        listMemories().catch(() => []),
        listAutomation().catch(() => ({ grants: [], receipts: [] })),
      ])
      setNodes(n)
      setEdges(e)
      setFacts(f)
      setMemories(m)
      setGrants(auto.grants)
      setReceipts(auto.receipts)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi tải dữ liệu cá nhân')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    // Gọi qua then() để mọi setState chạy trong callback bất đồng bộ
    // (luật react-hooks/set-state-in-effect — không setState đồng bộ trong effect).
    void Promise.resolve().then(loadAllData)
  }, [loadAllData])

  // ── Graph Handlers ───────────────────────────────────────────────────────────

  const handleSyncCrossDomain = async () => {
    setSyncingGraph(true)
    try {
      const summary = await syncCrossDomainGraph()
      toast.success(
        `Đồng bộ thành công ${summary.nodesCreatedOrUpdated} nodes và ${summary.edgesCreatedOrUpdated} edges đa miền!`,
      )
      await loadAllData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi đồng bộ đa miền')
    } finally {
      setSyncingGraph(false)
    }
  }

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNodeLabel.trim()) return
    try {
      const res = await createLifeGraphNode(newNodeType, newNodeLabel.trim())
      setNodes((prev) => [...prev, res.node])
      setNewNodeLabel('')
      setShowAddNodeModal(false)
      toast.success(`Đã thêm ${newNodeType}: ${res.node.label}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi tạo node')
    }
  }

  // ── Facts Handlers ───────────────────────────────────────────────────────────

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFactKey.trim() || !newFactValue.trim()) return
    try {
      const res = await declarePersonalFact({
        category: newFactCategory,
        key: newFactKey.trim(),
        value: newFactValue.trim(),
        sensitivity: newFactSensitivity,
      })
      setFacts((prev) => [...prev, res.fact])
      setNewFactKey('')
      setNewFactValue('')
      setShowAddFactModal(false)
      toast.success(`Đã lưu sự thật: ${newFactKey}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi khai báo sự thật')
    }
  }

  const handleDeleteFact = async (id: string) => {
    try {
      await deletePersonalFact(id)
      setFacts((prev) => prev.filter((f) => f.id !== id))
      toast.info('Đã xóa sự thật cá nhân')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi xóa sự thật')
    }
  }

  // ── Memory Handlers ──────────────────────────────────────────────────────────

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemContent.trim()) return
    try {
      const res = await ingestMemory({
        namespace: newMemNamespace,
        content: newMemContent.trim(),
        provenance: 'user_declared_ui',
        sensitivity: 'personal',
      })
      if (res.memory) {
        setMemories((prev) => [...prev, res.memory!])
      }
      setNewMemContent('')
      setShowAddMemoryModal(false)
      toast.success('Đã lưu ký ức vào Knowledge Fabric')
      await loadAllData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi tạo ký ức')
    }
  }

  const handleDeleteMemory = async (id: string) => {
    try {
      await deleteMemory(id)
      setMemories((prev) => prev.filter((m) => m.id !== id))
      toast.info('Đã xóa bản ghi ký ức')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi xóa ký ức')
    }
  }

  // ── Automation Handlers ──────────────────────────────────────────────────────

  const handleToggleGrant = async (
    grant: AutomationGrant,
    action: 'pause' | 'resume' | 'revoke',
  ) => {
    const version = grant.version ?? grant.schemaVersion ?? 1
    try {
      const res = await updateAutomationGrantStatus(grant.id, action, version)
      setGrants((prev) => prev.map((g) => (g.id === grant.id ? res.grant : g)))
      toast.success(`Đã cập nhật trạng thái quyền: ${action}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi cập nhật quyền tự động')
    }
  }

  // ── Portability & Erasure ───────────────────────────────────────────────────

  const handleExportData = async () => {
    setExporting(true)
    try {
      const data = await exportPersonalData()
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `donghanh_personal_data_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Đã tải xuống file xuất dữ liệu 13 schemas thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi xuất dữ liệu')
    } finally {
      setExporting(false)
    }
  }

  const handleFullErase = async () => {
    setErasing(true)
    try {
      const res = await erasePersonalData()
      toast.success(`Đã xóa vĩnh viễn ${res.erasedRecordsCount} bản ghi trên toàn bộ 13 schemas.`)
      setShowEraseModal(false)
      await loadAllData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(msg || 'Lỗi khi xóa dữ liệu')
    } finally {
      setErasing(false)
    }
  }

  const filteredNodes = nodeFilter === 'all' ? nodes : nodes.filter((n) => n.type === nodeFilter)
  const filteredMemories =
    memoryNamespaceFilter === 'all'
      ? memories
      : memories.filter((m) => m.namespace === memoryNamespaceFilter)

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
        <Layout onBack={() => nav('/trang-ca-nhan')} title="Mạng lưới & Ký ức" />
        {/* [2026-09-02, đợt 4 thiết kế lại desktop] width="standard". */}
        <PageShell
          width="standard"
          baseWidth="max-w-4xl"
          className="!pt-12 !pb-12 flex flex-1 flex-col items-center justify-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-accent-400 theme-light:text-accent-800 mb-3" />
          <p className="text-zinc-400 text-sm">Đang tải cấu trúc tri thức cá nhân...</p>
        </PageShell>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col">
      <Layout onBack={() => nav('/trang-ca-nhan')} title="Mạng lưới & Ký ức" />

      {/* [2026-09-02, đợt 4 thiết kế lại desktop] width="standard". */}
      <PageShell
        width="standard"
        baseWidth="max-w-4xl"
        className="!pt-6 !pb-20 flex flex-1 flex-col space-y-6"
      >
        {/* Top Header & Privacy Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <PageHeader
            title="Mạng Lưới Tri Thức & Ký Ức"
            subtitle="Toàn quyền kiểm soát Life Graph, Facts, Ký ức và Quyền tự động hóa."
            className="mb-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="tap-44 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 font-medium transition flex items-center gap-1.5 shadow-sm"
              title="Xuất toàn bộ dữ liệu 13 schemas dưới dạng file JSON (GDPR Portability)"
            >
              {exporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-accent-400 theme-light:text-accent-800" />
              )}
              Xuất JSON
            </button>
            <button
              onClick={() => setShowEraseModal(true)}
              className="tap-44 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs text-rose-400 theme-light:text-rose-800 font-medium transition flex items-center gap-1.5"
              title="Xóa vĩnh viễn toàn bộ dữ liệu trên toàn bộ 13 schemas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa sạch
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-accent-500 text-[#09090b] shadow-md shadow-accent-500/20'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* ── TAB 1: LIFE GRAPH ──────────────────────────────────────────────── */}
        {activeTab === 'graph' && (
          <div className="space-y-5 animate-fade-in">
            {/* Graph Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-zinc-400 font-medium">Loại:</span>
                {['all', 'Goal', 'Skill', 'Project', 'Decision', 'Constraint'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNodeFilter(t)}
                    className={`tap-44-y px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      nodeFilter === t
                        ? 'bg-zinc-800 text-accent-300 theme-light:text-accent-800 border border-accent-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t === 'all' ? 'Tất cả' : t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncCrossDomain}
                  disabled={syncingGraph}
                  className="tap-44 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition flex items-center gap-1.5"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-accent-400 theme-light:text-accent-800 ${syncingGraph ? 'animate-spin' : ''}`}
                  />
                  Đồng bộ đa miền
                </button>
                <button
                  onClick={() => setShowAddNodeModal(true)}
                  className="tap-44 px-3 py-1.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-xs font-medium text-[#09090b] transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm Node
                </button>
              </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredNodes.length === 0 ? (
                <div className="col-span-full py-12 text-center text-zinc-500 text-sm">
                  Chưa có node nào trong Life Graph. Hãy bấm &quot;Thêm Node&quot; hoặc &quot;Đồng
                  bộ đa miền&quot;!
                </div>
              ) : (
                filteredNodes.map((node) => {
                  const nodeEdges = edges.filter(
                    (e) => e.fromNodeId === node.id || e.toNodeId === node.id,
                  )
                  return (
                    <div
                      key={node.id}
                      className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 hover:border-zinc-700 transition flex flex-col justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">
                            {NODE_ICONS[node.type] || (
                              <GitCommit className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium">
                              {node.type}
                            </span>
                            <h4 className="font-semibold text-zinc-100 text-sm mt-1">
                              {node.label}
                            </h4>
                          </div>
                        </div>
                        {node.archivedAt && (
                          <span className="text-[11px] text-zinc-500 uppercase font-mono">
                            Archived
                          </span>
                        )}
                      </div>

                      {/* Associated Edges */}
                      {nodeEdges.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                          <div className="text-[11px] text-zinc-400 font-medium">
                            Liên kết ({nodeEdges.length}):
                          </div>
                          {nodeEdges.map((e) => (
                            <div
                              key={e.id}
                              className="text-[11px] text-zinc-300 flex items-center gap-1.5"
                            >
                              <ArrowRight className="w-3 h-3 text-accent-400 theme-light:text-accent-800 shrink-0" />
                              <span className="font-mono text-accent-300 theme-light:text-accent-800">
                                {e.relation}
                              </span>
                              <span className="text-zinc-500 truncate">({e.provenance})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 1.5: CROSS-DOMAIN SYNERGY & OUTCOME CALIBRATION ─────────── */}
        {activeTab === 'synergy' && (
          <div className="space-y-6 animate-fade-in">
            <CrossDomainSynergyCard />
            <OutcomeCalibrationCard />
          </div>
        )}

        {/* ── TAB 2: PERSONAL FACTS ─────────────────────────────────────────── */}
        {activeTab === 'facts' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="text-xs text-zinc-300 font-medium">
                Tổng cộng:{' '}
                <span className="text-accent-300 theme-light:text-accent-800 font-semibold">
                  {facts.length}
                </span>{' '}
                sự thật cá nhân
              </div>
              <button
                onClick={() => setShowAddFactModal(true)}
                className="tap-44 px-3 py-1.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-xs font-medium text-[#09090b] transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Khai báo Sự thật
              </button>
            </div>

            <div className="space-y-2.5">
              {facts.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Chưa có thông tin sự thật nào được lưu. Bạn có thể tự khai báo hoặc trò chuyện với
                  Bạn Đồng Hành AI.
                </div>
              ) : (
                facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-accent-300 theme-light:text-accent-800 text-xs font-medium">
                          {fact.namespace}
                        </span>
                        <code className="text-zinc-200 text-xs font-semibold">{fact.key}</code>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                          {fact.sensitivity}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-100 font-medium leading-relaxed">
                        {typeof fact.value === 'string' ? fact.value : JSON.stringify(fact.value)}
                      </p>
                      <div className="text-[11px] text-zinc-500">
                        Nguồn:{' '}
                        <span className="text-zinc-400">{fact.source?.type || fact.origin}</span> ·
                        Độ tin cậy:{' '}
                        <span className="text-emerald-400 theme-light:text-emerald-800">
                          {Math.round((fact.confidence || 1) * 100)}%
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteFact(fact.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                      title="Xóa sự thật này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: MEMORIES ──────────────────────────────────────────────── */}
        {activeTab === 'memories' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-xs text-zinc-400 font-medium">Namespace:</span>
                {['all', 'semantic', 'episodic', 'preference', 'commitment', 'domain'].map((ns) => (
                  <button
                    key={ns}
                    onClick={() => setMemoryNamespaceFilter(ns)}
                    className={`tap-44-y px-2.5 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                      memoryNamespaceFilter === ns
                        ? 'bg-zinc-800 text-accent-300 theme-light:text-accent-800 border border-accent-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {ns}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAddMemoryModal(true)}
                className="tap-44 px-3 py-1.5 rounded-xl bg-accent-500 hover:bg-accent-400 text-xs font-medium text-[#09090b] transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Tạo Ký ức
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredMemories.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  Chưa có bản ghi ký ức nào trong namespace này.
                </div>
              ) : (
                filteredMemories.map((mem) => (
                  <div
                    key={mem.id}
                    className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 theme-light:text-purple-800 text-xs font-medium">
                          {mem.namespace}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                          {mem.sensitivity}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-100 font-medium leading-relaxed">
                        {mem.content}
                      </p>
                      <div className="text-[11px] text-zinc-500">
                        Nguồn: <span className="text-zinc-400">{mem.provenance}</span> · Lưu đến:{' '}
                        <span className="text-zinc-400">
                          {mem.retainUntil
                            ? new Date(mem.retainUntil).toLocaleDateString('vi-VN')
                            : 'Vô thời hạn'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
                      title="Xóa ký ức này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: AUTOMATION & RECEIPTS ─────────────────────────────────── */}
        {activeTab === 'automation' && (
          <div className="space-y-5 animate-fade-in">
            {/* Grants Section */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-accent-400 theme-light:text-accent-800" />
                Quyền Tự Động Hóa Đã Cấp ({grants.length})
              </h3>

              <div className="space-y-2.5">
                {grants.length === 0 ? (
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-500 text-sm">
                    Chưa có quyền tự động hoá nào được cấp. Mọi hành vi AI đều cần xác nhận thủ
                    công.
                  </div>
                ) : (
                  grants.map((grant) => {
                    const isActive = grant.status === 'active'
                    const isPaused = grant.status === 'paused'
                    return (
                      <div
                        key={grant.id}
                        className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100 text-sm">
                              {grant.capabilityId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 theme-light:text-emerald-800'
                                  : isPaused
                                    ? 'bg-amber-500/10 text-amber-400 theme-light:text-amber-800'
                                    : 'bg-rose-500/10 text-rose-400 theme-light:text-rose-800'
                              }`}
                            >
                              {grant.status}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            Trigger: <span className="text-zinc-300">{grant.trigger.type}</span> ·
                            Ngân sách:{' '}
                            <span className="text-accent-300 theme-light:text-accent-800">
                              {grant.budget.maxRunsPerHour} lượt/h
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isActive && (
                            <button
                              onClick={() => handleToggleGrant(grant, 'pause')}
                              className="tap-44 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-amber-300 theme-light:text-amber-800 font-medium transition"
                            >
                              Tạm dừng
                            </button>
                          )}
                          {isPaused && (
                            <button
                              onClick={() => handleToggleGrant(grant, 'resume')}
                              className="tap-44 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-[#fff] font-medium transition"
                            >
                              Tiếp tục
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleGrant(grant, 'revoke')}
                            className="tap-44 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/40 theme-light:bg-rose-50 text-xs text-rose-400 theme-light:text-rose-800 font-medium transition"
                          >
                            Thu hồi
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Action Receipts Section */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                Biên Nhận Thực Thi Bất Biến ({receipts.length})
              </h3>

              <div className="space-y-2">
                {receipts.length === 0 ? (
                  <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 text-center text-zinc-500 text-sm">
                    Chưa có biên nhận thực thi tự động nào.
                  </div>
                ) : (
                  receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-medium text-zinc-200">{rec.action}</div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">
                          Idempotency: {rec.idempotencyKey}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-semibold ${
                            rec.status === 'success'
                              ? 'text-emerald-400 theme-light:text-emerald-800'
                              : 'text-rose-400 theme-light:text-rose-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {new Date(rec.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </PageShell>

      {/* ── Add Node Modal ──────────────────────────────────────────────────── */}
      {showAddNodeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          {...addNodeDialog.backdropProps}
        >
          <div
            {...addNodeDialog.dialogProps}
            className="max-w-md w-full max-h-[90dvh] overflow-y-auto focus:outline-none"
          >
            <form
              onSubmit={handleAddNode}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-scale-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 id={addNodeDialog.titleId} className="font-semibold text-white text-sm">
                  Thêm Node Mới vào Life Graph
                </h3>
                <button
                  type="button"
                  onClick={closeAddNode}
                  aria-label="Đóng"
                  className="tap-44 shrink-0 w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Loại Node</label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as LifeGraphNodeType)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                >
                  <option value="Goal">Goal (Mục tiêu)</option>
                  <option value="Skill">Skill (Kỹ năng)</option>
                  <option value="Project">Project (Dự án)</option>
                  <option value="Decision">Decision (Quyết định)</option>
                  <option value="Constraint">Constraint (Rào cản)</option>
                  <option value="Event">Event (Sự kiện)</option>
                  <option value="Commitment">Commitment (Cam kết)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Tên / Nhãn Node</label>
                <input
                  type="text"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="vd: Học IELTS 7.0, Kỹ năng SQL..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-[#09090b] text-xs font-medium shadow-sm"
                >
                  Thêm Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Fact Modal ──────────────────────────────────────────────────── */}
      {showAddFactModal && (
        <form
          onSubmit={handleAddFact}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          {/* Lớp nền ở đây là chính thẻ <form>, nên không gắn "bấm nền để đóng" —
              tránh mất dữ liệu đang gõ; Escape vẫn đóng được. */}
          <div
            {...addFactDialog.dialogProps}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scale-in max-h-[90dvh] overflow-y-auto focus:outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 id={addFactDialog.titleId} className="font-semibold text-white text-sm">
                Khai Báo Sự Thật Cá Nhân
              </h3>
              <button
                type="button"
                onClick={closeAddFact}
                aria-label="Đóng"
                className="tap-44 shrink-0 w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Phân loại</label>
              <select
                value={newFactCategory}
                onChange={(e) => setNewFactCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
              >
                <option value="preference">Preference (Sở thích/Thói quen)</option>
                <option value="constraint">Constraint (Ràng buộc)</option>
                <option value="identity">Identity (Định danh/Nghề nghiệp)</option>
                <option value="goal">Goal (Mục tiêu)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Từ khóa (Key)</label>
              <input
                type="text"
                value={newFactKey}
                onChange={(e) => setNewFactKey(e.target.value)}
                placeholder="vd: preferred_study_time, learning_pace..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nội dung giá trị</label>
              <input
                type="text"
                value={newFactValue}
                onChange={(e) => setNewFactValue(e.target.value)}
                placeholder="vd: Thích học vào 20:00 tối mỗi ngày"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Mức độ nhạy cảm</label>
              <select
                value={newFactSensitivity}
                onChange={(e) => setNewFactSensitivity(e.target.value as Sensitivity)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
              >
                <option value="public">Public (Công khai)</option>
                <option value="personal">Personal (Cá nhân)</option>
                <option value="sensitive">Sensitive (Nhạy cảm)</option>
                <option value="restricted">Restricted (Bảo mật cao)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFactModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-[#09090b] text-xs font-medium shadow-sm"
              >
                Lưu Sự Thật
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Add Memory Modal ────────────────────────────────────────────────── */}
      {showAddMemoryModal && (
        <form
          onSubmit={handleAddMemory}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          {/* Lớp nền ở đây là chính thẻ <form>, nên không gắn "bấm nền để đóng". */}
          <div
            {...addMemoryDialog.dialogProps}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scale-in max-h-[90dvh] overflow-y-auto focus:outline-none"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 id={addMemoryDialog.titleId} className="font-semibold text-white text-sm">
                Thêm Ký Ức Mới
              </h3>
              <button
                type="button"
                onClick={closeAddMemory}
                aria-label="Đóng"
                className="tap-44 shrink-0 w-11 h-11 -mr-2 -mt-2 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Namespace</label>
              <select
                value={newMemNamespace}
                onChange={(e) => setNewMemNamespace(e.target.value as MemoryNamespace)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 outline-none"
              >
                <option value="semantic">Semantic (Tri thức/Hiểu biết)</option>
                <option value="episodic">Episodic (Sự kiện đã qua)</option>
                <option value="preference">Preference (Sở thích)</option>
                <option value="commitment">Commitment (Cam kết)</option>
                <option value="domain">Domain (Ngữ cảnh môn học)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nội dung ký ức</label>
              <textarea
                value={newMemContent}
                onChange={(e) => setNewMemContent(e.target.value)}
                placeholder="Nhập điều bạn muốn AI ghi nhớ lâu dài..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 outline-none resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMemoryModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-400 text-[#09090b] text-xs font-medium shadow-sm"
              >
                Lưu Ký Ức
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Erase Modal ─────────────────────────────────────────────────────── */}
      {showEraseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          {...eraseDialog.backdropProps}
        >
          <div
            {...eraseDialog.dialogProps}
            className="bg-zinc-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scale-in max-h-[90dvh] overflow-y-auto focus:outline-none"
          >
            <div className="flex items-center gap-2 text-rose-400 theme-light:text-rose-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 id={eraseDialog.titleId} className="font-semibold text-white text-base">
                Xác Nhận Xóa Sạch Dữ Liệu
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Hành động này sẽ thực hiện <strong>Atomic Cascade Erasure</strong> trên toàn bộ 13
              schemas PostgreSQL (bao gồm Life Graph, Personal Facts, Memories, Automation Grants,
              Lịch sử trò chuyện). Dữ liệu sẽ biến mất vĩnh viễn và không thể khôi phục.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeErase}
                disabled={erasing}
                className="tap-44 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleFullErase}
                disabled={erasing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#fff] text-xs font-medium shadow-sm flex items-center gap-1.5"
              >
                {erasing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Xác Nhận Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
