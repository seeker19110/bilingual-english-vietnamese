import { Skeleton } from '../Skeleton'

export default function StudioLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in w-full">
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-40 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md space-y-3">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md space-y-3">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
