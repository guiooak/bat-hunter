import { RefObject, useEffect } from 'react';

// Publishes the height of the panel docked at the bottom of a game page as
// --bh-dock-height, so floating buttons (music, chat) stay right above it on
// phones. A page has a single docked panel.
export function useDockHeight(ref: RefObject<HTMLElement>, gap = 8) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty('--bh-dock-height', `${el.offsetHeight + gap}px`);
    const observer = new ResizeObserver(publish);

    publish();
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--bh-dock-height');
    };
  }, [ref, gap]);
}
