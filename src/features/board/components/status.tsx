/**
 * Whether the board is currently asking the server anything.
 *
 * It is a dot, and deliberately only a dot. A line of text that appears for
 * 40 ms is a line nobody can read — it is motion pretending to be
 * information — so the words live in the label a screen reader and a tooltip
 * read, and the eye gets one thing that spins or does not.
 *
 * `hold` keeps it visible long enough to register. Without that, a fast
 * answer makes it flicker, which is the thing this component exists to stop.
 */
import { component } from '@firsthandjs/dom';
import { t } from '@/shared/i18n';
import { hold } from '@/shared/ui/hold';
import { Dot } from './status.styled';

export type StatusProps = {
  readonly busy: boolean;
};

export const Status = component<StatusProps>((props) => {
  const busy = hold(() => props.busy);

  return (
    <Dot
      $busy={busy.value}
      role="status"
      aria-live="polite"
      aria-label={busy.value ? t('board.reloading') : t('board.upToDate')}
      title={busy.value ? t('board.reloading') : t('board.upToDate')}
    />
  );
});
