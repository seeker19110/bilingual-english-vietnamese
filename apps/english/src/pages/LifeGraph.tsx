import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import { listLifeGraphNodes, listLifeGraphEdges } from '../lib/lifeGraphApi'
import type {
  LifeGraphNode,
  LifeGraphEdge,
  LifeGraphNodeType,
} from '../../../../packages/core-contracts/lifeGraph'

const NODE_ICONS: Record<LifeGraphNodeType, React.ReactNode> = {
  Person: <User className="w-5 h-5 text-blue-400" />,
  Goal: <Target className="w-5 h-5 text-green-400" />,
  Project: <GitMerge className="w-5 h-5 text-purple-400" />,
  Skill: <Star className="w-5 h-5 text-yellow-400" />,
  Organization: <Building className="w-5 h-5 text-gray-400" />,
  Event: <Calendar className="w-5 h-5 text-pink-400" />,
  Commitment: <GitCommit className="w-5 h-5 text-orange-400" />,
  Constraint: <AlertTriangle className="w-5 h-5 text-red-400" />,
  Decision: <Activity className="w-5 h-5 text-teal-400" />,
}

export default function LifeGraph() {
  const nav = useNavigate()
  const [nodes, setNodes] = useState<LifeGraphNode[]>([])
  const [edges, setEdges] = useState<LifeGraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [n, e] = await Promise.all([listLifeGraphNodes(), listLifeGraphEdges()])
        setNodes(n)
        setEdges(e)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout onBack={() => nav('/profile')} />
        <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
          <PageHeader title="Mạng lưới cá nhân" />
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <Layout onBack={() => nav('/profile')} />
        <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
          <PageHeader title="Mạng lưới cá nhân" />
          <div className="p-4 text-red-400 bg-red-950/20 m-4 rounded-xl border border-red-900/50">
            {error}
          </div>
        </main>
      </div>
    )
  }

  // Phân nhóm node theo type
  const nodesByType = nodes.reduce(
    (acc, node) => {
      const list = acc[node.type] || []
      list.push(node)
      acc[node.type] = list
      return acc
    },
    {} as Record<string, LifeGraphNode[]>,
  )

  return (
    <div className="min-h-dvh bg-zinc-950">
      <Layout onBack={() => nav('/profile')} />
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-[calc(1.5rem+var(--bnav-h))] space-y-6">
        <PageHeader
          title="Mạng lưới cá nhân (Life Graph)"
          subtitle="Mô hình dữ liệu cá nhân của bạn"
        />

        <div className="space-y-8 pb-32">
          <div className="text-zinc-400 text-sm bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
            Đây là mô hình dữ liệu cá nhân của bạn. Mỗi yếu tố (Mục tiêu, Kỹ năng, ...) là một{' '}
            <strong>Node</strong>, kết nối với nhau qua các <strong>Edge</strong>. Dữ liệu này giúp
            Gia sư AI hiểu ngữ cảnh của bạn tốt hơn.
          </div>

          {Object.entries(nodesByType).map(([type, typeNodes]) => (
            <div key={type} className="space-y-4">
              <h2 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                {NODE_ICONS[type as LifeGraphNodeType]}
                {type} ({typeNodes.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {typeNodes.map((node) => {
                  const outgoingEdges = edges.filter((e) => e.fromNodeId === node.id)
                  return (
                    <div
                      key={node.id}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition rounded-xl p-4 space-y-3 shadow-sm"
                    >
                      <div className="font-semibold text-zinc-100">{node.label}</div>

                      {outgoingEdges.length > 0 && (
                        <div className="pt-3 mt-3 border-t border-zinc-800/50 space-y-2">
                          <div className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider">
                            Liên kết (Edges)
                          </div>
                          <div className="space-y-2">
                            {outgoingEdges.map((edge) => {
                              const targetNode = nodes.find((n) => n.id === edge.toNodeId)
                              return (
                                <div
                                  key={edge.id}
                                  className="flex items-start gap-2 text-sm bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50"
                                >
                                  <span className="text-zinc-400 shrink-0 mt-0.5">
                                    {edge.relation}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0 mt-1" />
                                  <span className="text-zinc-300 font-medium break-words">
                                    {targetNode?.label || 'Unknown'}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {nodes.length === 0 && (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 border-dashed">
              <Target className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
              Chưa có dữ liệu Life Graph.
              <br />
              Hãy cập nhật mục tiêu học tập ở Hồ sơ.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
