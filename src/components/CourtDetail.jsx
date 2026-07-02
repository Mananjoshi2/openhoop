import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Zap, Bell, PlayCircle, Star, Layers } from 'lucide-react';
import StatusPill from './StatusPill';
import BallIcon from './BallIcon';

const INITIALS_COLORS = [
  'bg-orange-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-fuchsia-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500',
];

function Avatar({ name }) {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const color = INITIALS_COLORS[seed % INITIALS_COLORS.length];
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md ${color}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color = 'text-white/70' }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5 text-center">
      <Icon className={`mb-1 h-3.5 w-3.5 ${color}`} />
      <div className="text-base font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

export default function CourtDetail({ court, onClose, onCheckIn, onNotify }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!court) return null;

  async function handleJoin() {
    if (checkedIn || loading) return;
    setLoading(true);
    try {
      await onCheckIn(court.id);
      setCheckedIn(true);
    } finally {
      setLoading(false);
    }
  }

  const checkins = court.checkins || [];
  const aliases = checkins.length > 0
    ? checkins.slice(0, 8).map(c => c.player_alias)
    : court.players > 0 ? Array.from({ length: Math.min(court.players, 6) }, (_, i) => `P${i + 1}`) : [];

  const liveLine =
    court.status === 'full'
      ? `Full game running — ${court.players} players here.`
      : court.status === 'some'
      ? `${court.players} player${court.players !== 1 ? 's' : ''} here now — runs starting soon.`
      : 'Court is wide open. First one there!';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/6 p-3">
        <button
          onClick={onClose}
          className="mb-3 flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courts
        </button>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
            <BallIcon className="h-5 w-5 text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-extrabold text-white leading-tight">{court.name}</h3>
            {court.address && (
              <div className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{court.address}</span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2.5">
          <StatusPill status={court.status} />
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatBadge icon={Users}  label="Players" value={court.players}               color="text-orange-400" />
          <StatBadge icon={Layers} label="Hoops"   value={court.hoops}                 color="text-blue-400" />
          <StatBadge icon={Zap}    label="Lights"  value={court.lights ? 'Yes' : 'No'} color={court.lights ? 'text-yellow-400' : 'text-white/30'} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/60 capitalize">
            {court.surface} surface
          </span>
          {court.source === 'osm' && (
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
              OSM verified
            </span>
          )}
          {court.source === 'user' && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              Community added
            </span>
          )}
        </div>

        {/* Live status */}
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-orange-300">
            <Zap className="h-3 w-3" /> Live status
          </div>
          <p className="text-sm leading-relaxed text-white/80">{liveLine}</p>
        </div>

        {/* Who's here */}
        {aliases.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">Who's here</div>
            <div className="flex flex-wrap gap-1.5">
              {aliases.map((a, i) => <Avatar key={i} name={a} />)}
            </div>
          </div>
        )}
      </div>

      {/* CTA strip */}
      <div className="flex-shrink-0 border-t border-white/6 p-3 space-y-2">
        <button
          onClick={handleJoin}
          disabled={checkedIn || loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.3)] transition hover:bg-orange-600 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checkedIn
            ? <><Star className="h-4 w-4 fill-current" /> Checked In!</>
            : loading ? 'Joining…'
            : <><PlayCircle className="h-4 w-4" /> Check In</>}
        </button>
        <button
          onClick={() => onNotify(court)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 active:scale-[.98]"
        >
          <Bell className="h-4 w-4" /> Notify When Free
        </button>
      </div>
    </div>
  );
}
