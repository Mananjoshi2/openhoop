const MAP = {
  free: { label: 'Free Court',       bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', dot: 'bg-emerald-400' },
  some: { label: 'Pickup forming',   bg: 'bg-amber-500/20  text-amber-300  border-amber-500/30',   dot: 'bg-amber-400' },
  full: { label: 'Game in progress', bg: 'bg-red-500/20    text-red-300    border-red-500/30',      dot: 'bg-red-400 animate-pulse' },
};

export default function StatusPill({ status, size = 'sm' }) {
  const { label, bg, dot } = MAP[status] || MAP.free;
  const px = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${bg} ${px}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
