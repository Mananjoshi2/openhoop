import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircle, MapPin, Users, Bell, Zap, ChevronRight,
  Search, Plus, Smartphone, Globe,
} from 'lucide-react';
import Logo from '../components/Logo';
import BallIcon from '../components/BallIcon';
import { fetchStats } from '../hooks/useCourts';

function CourtLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]"
      viewBox="0 0 800 450" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect x="40" y="25" width="720" height="400" rx="4" stroke="white" strokeWidth="2.5" />
      <line x1="400" y1="25" x2="400" y2="425" stroke="white" strokeWidth="2" />
      <circle cx="400" cy="225" r="65" stroke="white" strokeWidth="2" />
      <circle cx="400" cy="225" r="3" fill="white" />
      <rect x="40" y="143" width="160" height="164" stroke="white" strokeWidth="2" />
      <path d="M 200 185 A 40 40 0 0 1 200 265" stroke="white" strokeWidth="1.5" />
      <path d="M 200 143 A 60 60 0 0 1 200 307" stroke="white" strokeWidth="2" />
      <path d="M 200 143 A 60 60 0 0 0 200 307" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M 79 100 A 244 244 0 0 1 79 350" stroke="white" strokeWidth="2" />
      <rect x="600" y="143" width="160" height="164" stroke="white" strokeWidth="2" />
      <path d="M 600 185 A 40 40 0 0 0 600 265" stroke="white" strokeWidth="1.5" />
      <path d="M 600 143 A 60 60 0 0 0 600 307" stroke="white" strokeWidth="2" />
      <path d="M 600 143 A 60 60 0 0 1 600 307" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
      <path d="M 721 100 A 244 244 0 0 0 721 350" stroke="white" strokeWidth="2" />
    </svg>
  );
}

const FEATURES = [
  { icon: Search,     title: 'Find Courts',     desc: 'Discover every outdoor court near you — mapped, verified, and updated by the community.', color: 'text-orange-400', glow: 'shadow-orange-500/20' },
  { icon: Plus,       title: 'Add Your Court',  desc: 'Know a hidden gem? Drop a pin, fill the details, and put it on the map for everyone.', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  { icon: Users,      title: 'See Who\'s Out',  desc: 'Check who\'s at each court in real time. No more showing up to an empty or packed court.', color: 'text-blue-400', glow: 'shadow-blue-500/20' },
  { icon: Bell,       title: 'Get Notified',    desc: 'Notify me when a full court opens up — stop refreshing, start playing.', color: 'text-violet-400', glow: 'shadow-violet-500/20' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Open the App',    desc: 'See a live map of every court near you, color-coded by activity level.' },
  { step: '02', title: 'Pick Your Court', desc: 'Check players, surface, lights, and who\'s already out there.' },
  { step: '03', title: 'Check In & Run',  desc: 'One tap to check in. Let others know the game is on.' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const step = Math.ceil(target / 40);
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(cur);
      if (cur >= target) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [target]);
  return <>{val}{suffix}</>;
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6 },
});

export default function Landing({ onOpen, onVision }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { fetchStats().then(setStats); }, []);

  const statItems = [
    { value: stats?.total ?? '—',       label: 'Courts mapped',    color: 'text-white' },
    { value: stats?.active ?? '—',      label: 'Active games',     color: 'text-orange-400' },
    { value: stats?.free ?? '—',        label: 'Free right now',   color: 'text-emerald-400' },
    { value: stats?.players ?? '—',     label: 'Players out',      color: 'text-blue-400' },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080e1a] text-white">
      <CourtLines />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-orange-500/8 blur-[120px]" />
        <div className="absolute -left-48 top-1/2 h-[500px] w-[500px] rounded-full bg-blue-500/6 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-[#080e1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size="text-xl" />
          <div className="flex items-center gap-3">
            <button onClick={onVision} className="rounded-full px-4 py-2 text-sm font-medium text-white/60 transition hover:text-white">
              Vision
            </button>
            <button
              onClick={onOpen}
              className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] transition hover:bg-orange-600 active:scale-[.98]"
            >
              Open Map →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <motion.div {...fade(0)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400" />
          Live court data · Toronto
        </motion.div>

        <motion.h1 {...fade(0.08)} className="mb-5 text-5xl font-black tracking-tight sm:text-7xl">
          Find your run.
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Own the court.
          </span>
        </motion.h1>

        <motion.p {...fade(0.16)} className="mx-auto max-w-2xl text-lg leading-relaxed text-white/50">
          OpenHoop is the crowdsourced basketball court finder. See which courts are free,
          who's balling, and check in with one tap — no Google Maps rabbit holes.
        </motion.p>

        {/* Stats strip */}
        <motion.div {...fade(0.24)} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statItems.map(({ value, label, color }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/5 px-6 py-4 text-center backdrop-blur">
              <div className={`text-3xl font-black ${color}`}>
                {typeof value === 'number' ? <AnimatedCounter target={value} /> : value}
              </div>
              <div className="mt-0.5 text-xs text-white/40">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div {...fade(0.32)} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpen}
            className="group inline-flex items-center gap-2.5 rounded-2xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(255,107,0,0.35)] transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[0_16px_48px_rgba(255,107,0,0.45)] active:translate-y-0"
          >
            <PlayCircle className="h-5 w-5 transition group-hover:scale-110" />
            Find Courts Near Me
          </button>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white">
            <Smartphone className="h-5 w-5" /> Download (Soon)
          </button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-1 text-white/20 text-xs">
            <ChevronRight className="h-4 w-4 rotate-90 animate-bounce" />
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">Features</div>
          <h2 className="text-4xl font-black tracking-tight">Built for ballers</h2>
          <p className="mt-3 text-white/40">Everything you need to find your next run.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={`group rounded-3xl border border-white/8 bg-white/4 p-6 transition hover:border-white/15 hover:bg-white/7 hover:shadow-xl ${f.glow}`}
            >
              <div className={`mb-4 inline-flex rounded-2xl bg-white/8 p-3 ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mb-2 text-base font-bold">{f.title}</div>
              <div className="text-sm leading-relaxed text-white/45">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-400">How It Works</div>
          <h2 className="text-4xl font-black tracking-tight">From zero to game in 30 seconds</h2>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-3">
          <div className="absolute inset-x-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />
          {HOW_IT_WORKS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-orange-500/10 text-2xl font-black text-orange-400">
                {s.step}
              </div>
              <div className="mb-2 text-lg font-bold">{s.title}</div>
              <div className="text-sm leading-relaxed text-white/45">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-orange-500/8 to-transparent p-10 text-center"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/15 blur-[60px]" />
          <BallIcon className="mx-auto mb-5 h-14 w-14 text-orange-400 opacity-80" />
          <h3 className="mb-3 text-3xl font-black tracking-tight">Be part of the game.</h3>
          <p className="mx-auto mb-8 max-w-md text-white/50">
            Add your local courts, check in with your squad, and help build the map that basketball deserves.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={onOpen} className="rounded-2xl bg-orange-500 px-8 py-3.5 font-bold text-white shadow-[0_8px_32px_rgba(255,107,0,0.35)] transition hover:bg-orange-600 active:scale-[.98]">
              Open the Map
            </button>
            <button onClick={onVision} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-medium text-white/80 transition hover:bg-white/10">
              <Globe className="h-4 w-4" /> Our Vision
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/20">
        OpenHoop · Toronto · Built by ballers, for ballers
      </footer>
    </div>
  );
}
