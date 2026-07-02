import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';

const SPORTS = [
  { title: 'Soccer',     emoji: '⚽', desc: 'Find 5v5, 7v7, and weekend pick-up leagues near you. Book your spot before it fills.', color: 'from-green-500/20 to-emerald-500/10', border: 'border-green-500/20' },
  { title: 'Volleyball', emoji: '🏐', desc: 'Beach or indoor. Find hitting partners, join rec leagues, and track your games.', color: 'from-blue-500/20 to-sky-500/10', border: 'border-blue-500/20' },
  { title: 'Tennis',     emoji: '🎾', desc: 'Reserve courts, find hitting partners by skill level, track your ladder ranking.', color: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/20' },
  { title: 'Pickleball', emoji: '🏓', desc: 'The fastest growing sport. Find open courts and organize dinkers near you.', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20' },
  { title: 'Hockey',     emoji: '🏒', desc: 'Outdoor rinks in winter, ball hockey in summer. Find your crew.', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/20' },
  { title: 'Badminton',  emoji: '🏸', desc: 'Gym nights, park games, and competitive players — all on one map.', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/20' },
];

const ROADMAP = [
  { q: 'Now',    label: 'Basketball Toronto',   done: true },
  { q: 'Q3 25',  label: 'Check-in & live chat', done: false },
  { q: 'Q4 25',  label: 'More cities (NYC, LA)', done: false },
  { q: '2026',   label: 'Multi-sport expansion', done: false },
];

export default function Vision({ onBack }) {
  return (
    <div className="min-h-screen bg-[#080e1a] text-white">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#080e1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <button onClick={onBack} className="rounded-xl p-2 text-white/50 transition hover:bg-white/8 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Logo size="text-xl" />
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-orange-400">Vision</div>
          <h2 className="mb-4 text-5xl font-black tracking-tight">
            Beyond basketball.
            <br />
            <span className="text-white/30">Beyond one city.</span>
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-white/50">
            OpenHoop is the starting point. We're building the universal pick-up sports network —
            so wherever you are and whatever you play, you can find a game in minutes.
          </p>
        </motion.div>

        {/* Roadmap */}
        <div className="mt-14 mb-16">
          <div className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/30">Roadmap</div>
          <div className="flex flex-wrap gap-3">
            {ROADMAP.map((r, i) => (
              <motion.div
                key={r.q}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 ${r.done ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-white/8 bg-white/5 text-white/50'}`}
              >
                <span className={`h-2 w-2 rounded-full ${r.done ? 'bg-orange-400' : 'bg-white/20'}`} />
                <span className="text-xs font-semibold opacity-50">{r.q}</span>
                <span className="text-sm font-medium">{r.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sports grid */}
        <div className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/30">Coming Sports</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPORTS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 transition hover:scale-[1.01] ${s.color} ${s.border}`}
            >
              <div className="mb-4 text-5xl">{s.emoji}</div>
              <div className="mb-2 text-xl font-bold">{s.title}</div>
              <div className="mb-5 text-sm leading-relaxed text-white/50">{s.desc}</div>
              <div className="inline-flex items-center gap-1.5 text-sm font-medium text-white/30 group-hover:text-white/60 transition">
                Coming soon <ChevronRight className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-8 py-3.5 font-bold text-white shadow-[0_8px_32px_rgba(255,107,0,0.35)] transition hover:bg-orange-600 active:scale-[.98]"
          >
            Back to the courts
          </button>
        </div>
      </div>
    </div>
  );
}
