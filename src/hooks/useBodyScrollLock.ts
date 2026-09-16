import { useEffect } from 'react';

/**
 * Custom hook to lock background page scrolling when a modal/drawer is open.
 * Prevents wheel and touch scrolling on the background while allowing
 * internal scrolling inside designated scrollable containers (.service-modal-body, .mobile-drawer-panel).
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalOverscrollBehavior = document.documentElement.style.overscrollBehavior;

    // Immediately stop any momentum or active smooth scrolling cleanly
    try {
      window.scrollTo({ top: window.scrollY, behavior: 'instant' as ScrollBehavior });
    } catch {
      // fallback
    }

    // Lock page root
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';

    // Prevent wheel events from scrolling background when pointer is on backdrop or non-scrollable area
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        e.preventDefault();
        return;
      }

      // Check if mouse is within a scrollable modal container
      const scrollable = target.closest<HTMLElement>('.service-modal-body, .mobile-drawer-panel');
      if (!scrollable) {
        e.preventDefault();
        return;
      }

      // Prevent boundary scroll chaining if at top/bottom
      const isScrollableVertical = scrollable.scrollHeight > scrollable.clientHeight;
      if (!isScrollableVertical) {
        e.preventDefault();
        return;
      }

      const atTop = scrollable.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1 && e.deltaY > 0;
      if (atTop || atBottom) {
        e.preventDefault();
      }
    };

    // Prevent touch gestures on backdrop from moving background page
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        e.preventDefault();
        return;
      }

      const scrollable = target.closest<HTMLElement>('.service-modal-body, .mobile-drawer-panel');
      if (!scrollable) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overscrollBehavior = originalOverscrollBehavior;
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isLocked]);
}
