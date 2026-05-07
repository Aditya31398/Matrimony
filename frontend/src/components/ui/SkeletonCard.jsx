export function SkeletonProfileCard() {
  return (
    <div className="bg-white rounded-32 overflow-hidden shadow-card animate-pulse">
      <div className="aspect-[3/4] bg-surface-container shimmer" />
      <div className="p-4 flex justify-between items-center">
        <div className="h-4 w-24 bg-surface-container rounded-full shimmer" />
        <div className="flex gap-2">
          <div className="h-6 w-12 bg-secondary-fixed rounded-full shimmer" />
          <div className="h-6 w-14 bg-tertiary-fixed rounded-full shimmer" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonStoryCard() {
  return (
    <div className="bg-white rounded-24 overflow-hidden shadow-card animate-pulse">
      <div className="h-[280px] bg-surface-container shimmer" />
      <div className="p-6 space-y-3">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-3 w-3 bg-surface-container-high rounded-full shimmer" />
          ))}
        </div>
        <div className="h-4 w-full bg-surface-container rounded-full shimmer" />
        <div className="h-4 w-4/5 bg-surface-container rounded-full shimmer" />
        <div className="h-4 w-3/5 bg-surface-container rounded-full shimmer" />
        <div className="pt-3 border-t border-slate-50">
          <div className="h-4 w-32 bg-surface-container rounded-full shimmer" />
          <div className="h-3 w-24 bg-surface-container rounded-full shimmer mt-2" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonInterestCard() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-[20px] shadow-card animate-pulse">
      <div className="w-20 h-20 rounded-2xl bg-surface-container shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-surface-container rounded-full shimmer" />
        <div className="h-3 w-32 bg-surface-container rounded-full shimmer" />
        <div className="flex gap-2">
          <div className="h-7 w-16 bg-surface-container rounded-lg shimmer" />
          <div className="h-7 w-16 bg-surface-container rounded-lg shimmer" />
        </div>
      </div>
    </div>
  )
}
