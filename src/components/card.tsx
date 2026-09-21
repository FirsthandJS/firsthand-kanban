/**
 * One card, and the three things that can happen to it.
 *
 * A component with no data of its own: it takes props and hands events back.
 * Props are accessors here — `props.title` is read where it is used, which is
 * what lets a moved card's DOM node stay put while its column changes.
 */
import { component } from '@firsthandjs/dom';
import { KIND_LABEL, type Kind } from '../setup/theme';
import { Actions, Marker, Tile, Title } from './card.styled';

export interface CardProps {
  readonly title: string;
  readonly kind: Kind;
  /** In the first column: there is nothing to its left. */
  readonly first: boolean;
  readonly last: boolean;
  readonly busy: boolean;
  readonly onBack: () => void;
  readonly onForward: () => void;
  readonly onDelete: () => void;
}

export const CardTile = component<CardProps>((props) => (
  <Tile $kind={props.kind}>
    <Marker>{KIND_LABEL[props.kind]}</Marker>
    <Title>{props.title}</Title>
    <Actions>
      <button
        type="button"
        aria-label="Move left"
        disabled={props.first || props.busy}
        onClick={props.onBack}
      >
        ←
      </button>
      <button
        type="button"
        aria-label="Move right"
        disabled={props.last || props.busy}
        onClick={props.onForward}
      >
        →
      </button>
      <button
        type="button"
        aria-label="Delete card"
        disabled={props.busy}
        onClick={props.onDelete}
      >
        <wa-icon name="trash" />
      </button>
    </Actions>
  </Tile>
));
