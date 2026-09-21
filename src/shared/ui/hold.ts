/**
 * Keeps a flag true for a little longer than it was.
 *
 * A request that answers in 30 ms makes a loading indicator appear and vanish
 * inside one frame, which reads as a flicker rather than as feedback — and a
 * flicker is worse than no indicator at all, because the eye is drawn to it
 * and finds nothing.
 *
 * So: true immediately, false no earlier than `ms` later. Nothing here knows
 * what is loading; it is a signal in and a signal out.
 */
import { computed, effect, onCleanup, signal, type ReadonlyCell } from '@firsthandjs/dom';

export function hold(source: () => boolean, ms = 450): ReadonlyCell<boolean> {
  const held = signal(false);
  let since = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  effect(() => {
    if (source()) {
      clearTimeout(timer);
      since = Date.now();
      held.value = true;
      return;
    }
    // Whatever is left of the minimum, which is nothing if it already passed.
    const left = Math.max(0, ms - (Date.now() - since));
    clearTimeout(timer);
    timer = setTimeout(() => (held.value = false), left);
  });

  onCleanup(() => clearTimeout(timer));

  return computed(() => held.value);
}
