import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Blur-to-focus reveal: children with [data-reveal] get .is-in when they enter the viewport. */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const items = [root, ...root.querySelectorAll('[data-reveal]')].filter((el) => el.hasAttribute('data-reveal'));
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* True once the element with `id` has scrolled out of view above (or past `fallback` px). */
export function useScrolledPast(id, fallback = 420) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const el = id ? document.getElementById(id) : null;
      const limit = el ? el.offsetTop + el.offsetHeight - 80 : fallback;
      setPast(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [id, fallback]);
  return past;
}

export function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [m, setM] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

/* Sets the `inert` property directly so it behaves the same on React 18 and 19. */
export function useInert(inert) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.inert = Boolean(inert); });
  return ref;
}
