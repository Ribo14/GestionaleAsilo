export default function CreditiBar({ residui, totali }) {
  const pct = totali > 0 ? Math.round((residui / totali) * 100) : 0
  const color =
    pct > 30 ? 'bg-primary' : pct > 10 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{residui} residui</span>
        <span>{totali} totali</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
