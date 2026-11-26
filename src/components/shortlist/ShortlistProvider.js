'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'learningskills.shortlist.v1';
const ShortlistContext = createContext(null);

/**
 * The multi-course enquiry shortlist.
 *
 * A visitor browsing courses can add several to a shortlist and then submit one
 * enquiry covering all of them, which is the core conversion mechanic of the
 * site. State lives in localStorage so the selection survives navigation, a
 * refresh, or coming back the next day — no account required.
 *
 * Only { id, title, slug } is stored. Prices, durations and availability are
 * always re-read from the database at submit time so a stale browser copy can
 * never feed wrong data into an enquiry.
 */
export function ShortlistProvider({ children, maxItems = 8 }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Read once on mount — never during render, so SSR and the first client paint match.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed
              .filter((item) => item && Number(item.id) > 0 && typeof item.title === 'string')
              .slice(0, maxItems)
              .map((item) => ({ id: Number(item.id), title: item.title, slug: item.slug || '' }))
          );
        }
      }
    } catch {
      /* corrupt or unavailable storage — start empty */
    }
    setHydrated(true);
  }, [maxItems]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* private browsing / quota — the in-memory list still works */
    }
  }, [items, hydrated]);

  const has = useCallback((id) => items.some((item) => item.id === Number(id)), [items]);

  const add = useCallback(
    (course) => {
      const id = Number(course?.id);
      if (!id) return { ok: false, reason: 'invalid' };
      let result = { ok: true, reason: 'added' };
      setItems((prev) => {
        if (prev.some((item) => item.id === id)) {
          result = { ok: false, reason: 'duplicate' };
          return prev;
        }
        if (prev.length >= maxItems) {
          result = { ok: false, reason: 'full' };
          return prev;
        }
        return [...prev, { id, title: course.title, slug: course.slug || '' }];
      });
      return result;
    },
    [maxItems]
  );

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== Number(id)));
  }, []);

  const toggle = useCallback(
    (course) => {
      const id = Number(course?.id);
      if (has(id)) {
        remove(id);
        return { ok: true, reason: 'removed' };
      }
      return add(course);
    },
    [has, add, remove]
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      ids: items.map((item) => item.id),
      maxItems,
      isFull: items.length >= maxItems,
      hydrated,
      has,
      add,
      remove,
      toggle,
      clear,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [items, maxItems, hydrated, has, add, remove, toggle, clear, drawerOpen]
  );

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) {
    throw new Error('useShortlist must be used inside <ShortlistProvider>');
  }
  return ctx;
}
