import { useEffect, useState } from "react";

/**
 * Keeps a conditionally-rendered element mounted while its exit animation
 * plays, then unmounts it after `exitDuration` ms.
 *
 * Usage:
 *   const { mounted, closing } = useAnimatedPresence(open, 110);
 *   {mounted && <div className={closing ? "is-closing" : "is-entering"}>...</div>}
 */
export function useAnimatedPresence(open: boolean, exitDuration = 110) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, exitDuration);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return { mounted, closing };
}
