import { useState, useEffect, useCallback } from 'react';

export function useCourts() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourts = useCallback(async () => {
    try {
      const res = await fetch('/api/courts');
      if (!res.ok) throw new Error('Failed to fetch courts');
      const data = await res.json();
      setCourts(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCourts(); }, [fetchCourts]);

  const checkIn = useCallback(async (courtId, alias = 'Anonymous') => {
    const res = await fetch(`/api/courts/${courtId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias }),
    });
    if (!res.ok) throw new Error('Check-in failed');
    await fetchCourts();
  }, [fetchCourts]);

  const addCourt = useCallback(async (payload) => {
    const res = await fetch('/api/courts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to add court');
    await fetchCourts();
    return res.json();
  }, [fetchCourts]);

  return { courts, loading, error, refetch: fetchCourts, checkIn, addCourt };
}

export async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}
