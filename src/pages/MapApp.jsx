import { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { AnimatePresence, motion } from 'framer-motion';
import L from 'leaflet';
import {
  Search, X, Plus, ChevronRight, Users, Layers, Lightbulb,
  Zap, ArrowLeft, SlidersHorizontal, RefreshCw,
} from 'lucide-react';
import Logo from '../components/Logo';
import StatusPill from '../components/StatusPill';
import CourtDetail from '../components/CourtDetail';
import AddCourtModal from '../components/AddCourtModal';
import Toast from '../components/Toast';
import BallIcon from '../components/BallIcon';
import { useCourts } from '../hooks/useCourts';

// Fix default Leaflet icon path issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// ── Custom branded map pin ───────────────────────────────────────────────────

const STATUS_COLORS = {
  free: { bg: '#10b981', glow: 'rgba(16,185,129,0.5)' },
  some: { bg: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
  full: { bg: '#ef4444', glow: 'rgba(239,68,68,0.5)' },
};

function makePin(status, active = false) {
  const { bg, glow } = STATUS_COLORS[status] || STATUS_COLORS.free;
  const size = active ? 44 : 36;
  const pulse = status === 'full'
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${glow};animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>`
    : '';
  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;filter:drop-shadow(0 4px 12px ${glow})">
        ${pulse}
        <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${bg};transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.25);box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>
        <svg style="position:absolute;inset:0;margin:auto;width:${active ? 20 : 16}px;height:${active ? 20 : 16}px;transform:none;top:${active ? 8 : 6}px;left:${active ? 12 : 10}px;" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M4.5 8c3 1.5 12 1.5 15 0"/><path d="M4.5 16c3-1.5 12-1.5 15 0"/>
        </svg>
      </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// ── Click handler to drop a pin for Add Court flow ──────────────────────────

function MapClickHandler({ active, onMapClick }) {
  useMapEvents({
    click(e) { if (active) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

// ── Court card in sidebar ────────────────────────────────────────────────────

function CourtCard({ court, selected, onClick }) {
  const { bg } = STATUS_COLORS[court.status] || STATUS_COLORS.free;
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition active:scale-[.98] ${
        selected
          ? 'border-orange-500/40 bg-orange-500/10'
          : 'border-white/6 bg-white/4 hover:border-white/12 hover:bg-white/7'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/8">
            <BallIcon className="h-4 w-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">{court.name}</div>
            {court.address && <div className="truncate text-xs text-white/40 mt-0.5">{court.address}</div>}
          </div>
        </div>
        <div className="flex-shrink-0 h-2 w-2 rounded-full mt-1" style={{ background: bg }} />
      </div>
      <div className="flex items-center gap-3 text-xs text-white/50">
        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {court.players}</span>
        <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {court.hoops} hoops</span>
        {court.lights ? <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3 text-yellow-400" /> Lit</span> : null}
      </div>
    </button>
  );
}

// ── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all',  label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'some', label: 'Pickup' },
  { key: 'full', label: 'Game On' },
];

// ── Main MapApp ──────────────────────────────────────────────────────────────

export default function MapApp({ onHome, onVision }) {
  const { courts, loading, error, refetch, checkIn, addCourt } = useCourts();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [addMode, setAddMode] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mapRef = useRef(null);

  const selectedCourt = courts.find((c) => c.id === selected) || null;

  const filtered = courts.filter((c) => {
    const matchQ = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.address || '').toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'all' || c.status === filter;
    return matchQ && matchF;
  });

  const counts = {
    free: courts.filter(c => c.status === 'free').length,
    some: courts.filter(c => c.status === 'some').length,
    full: courts.filter(c => c.status === 'full').length,
  };

  function handleMapClick(latlng) {
    if (!addMode) return;
    setPendingLatLng(latlng);
    setAddMode(false);
    setShowAddModal(true);
  }

  async function handleAddCourt(payload) {
    await addCourt({ ...payload, ...pendingLatLng });
    setPendingLatLng(null);
    setToast({ msg: `"${payload.name}" added to the map! 🏀`, type: 'success' });
  }

  async function handleCheckIn(courtId) {
    await checkIn(courtId, 'Anonymous');
    setToast({ msg: 'Checked in! The court knows you\'re here 🏀', type: 'success' });
  }

  // Fly to court AFTER modal opens (deferred so Leaflet events don't close it)
  useEffect(() => {
    if (!selected) return;
    const court = courts.find((c) => c.id === selected);
    if (!court) return;
    const t = setTimeout(() => {
      const map = mapRef.current;
      if (map) map.flyTo([court.lat, court.lng], 16, { animate: true, duration: 0.8 });
    }, 50);
    return () => clearTimeout(t);
  }, [selected]);

  const center = courts.length > 0 ? [courts[0].lat, courts[0].lng] : [43.6532, -79.3832];

  return (
    <div className="flex h-screen flex-col bg-[#080e1a] text-white">
      {/* Top nav */}
      <div className="flex-shrink-0 border-b border-white/6 bg-[#080e1a]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onHome} className="rounded-xl p-2 text-white/50 transition hover:bg-white/8 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Logo size="text-lg" />
          <div className="ml-auto flex items-center gap-2">
            {/* Active indicator */}
            <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
              <span className="text-white/60">{counts.full} games live</span>
              <span className="h-3 w-px bg-white/10" />
              <span className="text-emerald-400">{counts.free} free</span>
            </div>
            <button
              onClick={() => { setAddMode(true); setShowAddModal(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(255,107,0,0.3)] transition hover:bg-orange-600 active:scale-[.98]"
            >
              <Plus className="h-4 w-4" /> Add Court
            </button>
            <button onClick={onVision} className="rounded-xl border border-white/8 px-3 py-2 text-sm text-white/50 transition hover:bg-white/8 hover:text-white">
              Vision
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -340, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="absolute left-0 top-0 z-20 h-full w-80 overflow-hidden border-r border-white/6 bg-[#0b1121]/95 backdrop-blur-xl sm:relative sm:z-0"
            >
              <AnimatePresence mode="wait" initial={false}>
                {selectedCourt ? (
                  <motion.div
                    key="detail"
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    <CourtDetail
                      court={selectedCourt}
                      onClose={() => setSelected(null)}
                      onCheckIn={handleCheckIn}
                      onNotify={(court) => setToast({ msg: `We'll notify you when ${court.name} opens up.` })}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ x: -60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {/* Search */}
                    <div className="p-3 pb-2">
                      <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                        <Search className="h-4 w-4 flex-shrink-0 text-white/30" />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search courts…"
                          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                        />
                        {search && (
                          <button onClick={() => setSearch('')} className="text-white/30 hover:text-white transition">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1.5 px-3 pb-2">
                      {FILTERS.map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setFilter(f.key)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            filter === f.key
                              ? 'bg-orange-500 text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)]'
                              : 'border border-white/8 text-white/50 hover:bg-white/8 hover:text-white'
                          }`}
                        >
                          {f.label}
                          {f.key !== 'all' && counts[f.key] !== undefined && (
                            <span className="ml-1 opacity-60">({counts[f.key]})</span>
                          )}
                        </button>
                      ))}
                      <button onClick={refetch} className="ml-auto rounded-lg border border-white/8 p-1.5 text-white/30 transition hover:bg-white/8 hover:text-white">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Court list */}
                    <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
                      {loading ? (
                        <div className="flex h-32 items-center justify-center text-sm text-white/30">Loading courts…</div>
                      ) : filtered.length === 0 ? (
                        <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                          <BallIcon className="h-8 w-8 text-white/15" />
                          <div className="text-sm text-white/30">No courts found</div>
                        </div>
                      ) : (
                        filtered.map((court) => (
                          <CourtCard
                            key={court.id}
                            court={court}
                            selected={selected === court.id}
                            onClick={() => setSelected(court.id)}
                          />
                        ))
                      )}
                    </div>

                    {/* Add Court CTA at bottom */}
                    <div className="border-t border-white/6 p-3">
                      <button
                        onClick={() => { setAddMode(true); setShowAddModal(true); }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/8 py-3 text-sm font-medium text-orange-400 transition hover:bg-orange-500/15"
                      >
                        <Plus className="h-4 w-4" /> Know a court? Add it!
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-xl border border-white/8 bg-[#0b1121]/90 px-3 py-2 text-xs font-medium text-white/60 shadow backdrop-blur transition hover:text-white sm:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {sidebarOpen ? 'Hide' : 'Courts'}
        </button>

        {/* Map */}
        <div className="relative flex-1" style={{ cursor: addMode ? 'crosshair' : 'default' }}>
          {/* Add mode banner */}
          <AnimatePresence>
            {addMode && (
              <motion.div
                initial={{ y: -48, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -48, opacity: 0 }}
                className="absolute inset-x-0 top-0 z-30 flex items-center justify-between border-b border-orange-500/20 bg-orange-500/15 px-4 py-2.5 backdrop-blur"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-orange-300">
                  <Zap className="h-4 w-4" /> Click on the map to drop a pin
                </div>
                <button onClick={() => setAddMode(false)} className="text-orange-300/60 hover:text-orange-300 transition">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <MapContainer
            center={center}
            zoom={14}
            style={{ height: '100%', width: '100%', background: '#080e1a' }}
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            <MapClickHandler active={addMode} onMapClick={handleMapClick} />
            {filtered.map((court) => (
              <Marker
                key={court.id}
                position={[court.lat, court.lng]}
                icon={makePin(court.status, selected === court.id)}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent?.stopPropagation();
                    setSelected(court.id);
                  },
                }}
              />
            ))}
            {pendingLatLng && (
              <Marker
                position={[pendingLatLng.lat, pendingLatLng.lng]}
                icon={makePin('some', true)}
              />
            )}
          </MapContainer>

          {/* Zoom controls */}
          <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-1.5">
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#0b1121]/90 text-white/60 shadow backdrop-blur transition hover:bg-white/10 hover:text-white text-lg font-bold"
            >+</button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-[#0b1121]/90 text-white/60 shadow backdrop-blur transition hover:bg-white/10 hover:text-white text-lg font-bold"
            >−</button>
          </div>

          {/* Legend */}
          <div className="absolute bottom-6 left-4 z-20">
            <div className="rounded-2xl border border-white/8 bg-[#0b1121]/90 p-3 text-xs backdrop-blur shadow">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Activity</div>
              {[
                { color: '#10b981', label: 'Free court' },
                { color: '#f59e0b', label: 'Pickup forming' },
                { color: '#ef4444', label: 'Game on' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2 py-0.5 text-white/60">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add court modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddCourtModal
            pendingLatLng={pendingLatLng}
            onClose={() => { setShowAddModal(false); setPendingLatLng(null); setAddMode(false); }}
            onSubmit={handleAddCourt}
            onRequestMapClick={() => { setAddMode(true); setShowAddModal(false); }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast type={toast.type} onDone={() => setToast(null)}>{toast.msg}</Toast>
        )}
      </AnimatePresence>
    </div>
  );
}
