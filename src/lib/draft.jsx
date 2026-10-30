import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'radiantedge-draft-v1';
const CONFIRM_KEY = 'radiantedge-last-booking';

const blank = () => ({
  type: '', pkg: '', stories: 0, addons: [], date: '', time: '',
  name: '', phone: '', email: '', address: '',
  ref: `RER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
});

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch { /* storage blocked */ }
  return blank();
}

const Ctx = createContext(null);

export function DraftProvider({ children }) {
  const [draft, setDraft] = useState(load);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(draft)); } catch { /* ignore */ }
  }, [draft]);

  const update = useCallback((patch) => setDraft((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) })), []);
  const reset = useCallback(() => setDraft(blank()), []);
  const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useDraft = () => useContext(Ctx);

export function saveConfirmation(c) {
  try { sessionStorage.setItem(CONFIRM_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}
export function readConfirmation() {
  try { return JSON.parse(sessionStorage.getItem(CONFIRM_KEY) || 'null'); } catch { return null; }
}

export function draftComplete(d) {
  return Boolean(d.type && d.pkg && d.stories && d.date && d.time && d.name && d.phone && d.email && d.address);
}
