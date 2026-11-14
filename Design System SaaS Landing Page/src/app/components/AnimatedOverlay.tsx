import { useLayoutEffect, useRef, type MouseEventHandler, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useIsPresent } from "motion/react";
import { usePrefersReducedMotion } from "../utils/motion";

interface AnimatedOverlayProps {
  open: boolean;
  className: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
}

function Overlay({ className, onClick, children }: Omit<AnimatedOverlayProps, "open">) {
  const isPresent = useIsPresent();
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (isPresent) previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shouldRestoreFocus = !isPresent && ref.current?.contains(document.activeElement);
    if (ref.current) ref.current.inert = !isPresent;
    if (shouldRestoreFocus && previousFocus.current?.isConnected) {
      previousFocus.current.focus();
    }
  }, [isPresent]);

  return (
    <m.div
      ref={ref}
      className={className}
      onClick={onClick}
      onKeyDown={event => {
        if (event.key !== "Tab" || !ref.current) return;
        const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
        )).filter(element => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          event.preventDefault();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current.querySelector('[role="dialog"]'))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      aria-hidden={!isPresent || undefined}
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      {children}
    </m.div>
  );
}

export function AnimatedOverlay({ open, ...props }: AnimatedOverlayProps) {
  return <LazyMotion features={domAnimation}><AnimatePresence>{open && <Overlay {...props} />}</AnimatePresence></LazyMotion>;
}
