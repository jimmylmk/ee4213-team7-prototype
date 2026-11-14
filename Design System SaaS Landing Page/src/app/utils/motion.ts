import { useSyncExternalStore } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => true
  );
}

export function scrollIntoViewWithMotion(element: Element, options: ScrollIntoViewOptions = {}) {
  const reducedMotion = window.matchMedia(reducedMotionQuery).matches;
  element.scrollIntoView({ ...options, behavior: reducedMotion ? 'instant' : 'smooth' });
}
