import { useEffect } from "react";

/**
 * D-Pad / arrow-key spatial navigation for Android TV remotes.
 * Moves DOM focus to the visually nearest focusable element in the pressed direction.
 */
const SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

type Dir = "up" | "down" | "left" | "right";

function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function center(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
}

function pick(current: HTMLElement, dir: Dir): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(SELECTOR),
  ).filter((el) => el !== current && visible(el));

  const from = center(current);
  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const el of candidates) {
    const to = center(el);
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    let primary: number;
    let secondary: number;
    if (dir === "up") {
      if (from.r.top - to.r.top < 8) continue;
      primary = from.y - to.y;
      secondary = Math.abs(dx);
    } else if (dir === "down") {
      if (to.r.top - from.r.top < 8) continue;
      primary = to.y - from.y;
      secondary = Math.abs(dx);
    } else if (dir === "left") {
      if (from.r.left - to.r.left < 8) continue;
      primary = from.x - to.x;
      secondary = Math.abs(dy);
    } else {
      if (to.r.left - from.r.left < 8) continue;
      primary = to.x - from.x;
      secondary = Math.abs(dy);
    }

    const score = primary + secondary * 2.2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

export function useSpatialNavigation() {
  useEffect(() => {
    function focusFirst() {
      const first = Array.from(
        document.querySelectorAll<HTMLElement>(SELECTOR),
      ).find(visible);
      first?.focus();
    }

    function onKeyDown(event: KeyboardEvent) {
      const keys: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = keys[event.key];
      if (!dir) return;

      const active = document.activeElement as HTMLElement | null;
      // let text inputs handle horizontal arrows
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA") &&
        (dir === "left" || dir === "right")
      ) {
        return;
      }

      event.preventDefault();
      if (!active || active === document.body || !visible(active)) {
        focusFirst();
        return;
      }

      const next = pick(active, dir);
      if (next) {
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(focusFirst, 400);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, []);
}
