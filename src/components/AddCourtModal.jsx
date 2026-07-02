import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, ChevronRight, Check } from 'lucide-react';

const SURFACES = ['concrete', 'asphalt', 'hardwood', 'rubber'];

export default function AddCourtModal({ onClose, onSubmit, pendingLatLng, onRequestMapClick }) {
  const [step, setStep] = useState(pendingLatLng ? 2 : 1); // 1=click map, 2=fill form
  const [form, setForm] = useState({
    name: '',
    address: '',
    hoops: 2,
    surface: 'concrete',
    lights: false,
    added_by: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const readyToClose = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => { readyToClose.current = true; }, 150);
    return () => clearTimeout(t);
  }, []);

  const lat = pendingLatLng?.lat;
  const lng = pendingLatLng?.lng;

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })),
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!lat || !lng || !form.name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, lat, lng, hoops: Number(form.hoops) });
      setDone(true);
      setTimeout(onClose, 1400);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 transition';
  const labelCls = 'block mb-1.5 text-sm font-medium text-white/70';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => { if (readyToClose.current) onClose(); }}
    >
        <motion.div
          initial={{ y: 48, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 48, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424] text-white shadow-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />

          <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-white/40 hover:bg-white/10 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {done ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="text-xl font-bold">Court Added!</div>
                <div className="mt-1 text-sm text-white/50">Thanks for growing the community 🏀</div>
              </motion.div>
            ) : step === 1 ? (
              <>
                <h3 className="mb-1 text-lg font-extrabold">Add a Court</h3>
                <p className="text-sm text-white/50">First, drop a pin on the map where the court is.</p>
                <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-orange-500/30 bg-orange-500/5 p-8 text-center">
                  <MapPin className="mb-3 h-10 w-10 text-orange-400" />
                  <div className="font-semibold text-white/90">Click anywhere on the map</div>
                  <div className="mt-1 text-sm text-white/40">Close this and tap the court location</div>
                </div>
                <button
                  onClick={() => { onRequestMapClick(); onClose(); }}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.3)] hover:bg-orange-600 transition active:scale-[.98]"
                >
                  Drop a pin <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <h3 className="mb-0.5 text-lg font-extrabold">Court Details</h3>
                <p className="mb-5 text-sm text-white/50">
                  {lat && lng ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Fill in the details below'}
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className={labelCls}>Court name *</label>
                    <input {...field('name')} placeholder="e.g. Christie Pits" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Address (optional)</label>
                    <input {...field('address')} placeholder="e.g. 750 Bloor St W, Toronto" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Hoops</label>
                      <select {...field('hoops')} className={inputCls}>
                        {[1, 2, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Surface</label>
                      <select {...field('surface')} className={inputCls}>
                        {SURFACES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3">
                    <input type="checkbox" id="lights" {...field('lights')} className="h-4 w-4 accent-orange-500 rounded" />
                    <label htmlFor="lights" className="text-sm text-white/80 cursor-pointer">Has lights (night play)</label>
                  </div>
                  <div>
                    <label className={labelCls}>Your name (optional)</label>
                    <input {...field('added_by')} placeholder="Who's adding this court?" className={inputCls} />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !form.name.trim()}
                    className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(255,107,0,0.3)] hover:bg-orange-600 transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding…' : 'Add Court to Map'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
}
