/**
 * Every word on screen, from JSON files: one per feature, per language.
 *
 * ```
 * src/locales/en/board.json      src/locales/de/board.json
 * src/locales/en/boards.json     src/locales/de/boards.json
 * ```
 *
 * A key is `feature.name`, so `t('board.addCard')` reads
 * `locales/<language>/board.json` → `addCard`. Splitting by feature is what
 * keeps a translation file reviewable and a merge conflict small; splitting by
 * language is what lets the second one be *fetched* rather than bundled.
 *
 * Which is what happens here: English is imported, German is an `import()`
 * that runs when somebody asks for it. `translator()` is built for that —
 * "could answer differently" is wider than "the language changed", and a
 * namespace arriving late is exactly the other case. When it lands, `changed()`
 * re-runs the expressions that read `t` and nothing else: the board does not
 * re-render, the cards keep their DOM, and a card being dragged keeps being
 * dragged.
 */
import { translator } from '@firsthandjs/i18n';
import board from '../locales/en/board.json';
import boards from '../locales/en/boards.json';
import kind from '../locales/en/kind.json';
import nav from '../locales/en/nav.json';
import signIn from '../locales/en/signIn.json';

/** The shape every language has, taken from the one that is always here. */
const english = { board, boards, kind, nav, signIn };

type Bundle = typeof english;
type Feature = keyof Bundle;

/** `board.addCard`, `boards.title`, `kind.BUG` — feature, then name. */
export type Key = {
  [F in Feature]: `${F}.${Extract<keyof Bundle[F], string>}`;
}[Feature];

const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

const loaded: Partial<Record<Language, Bundle>> = { en: english };

/**
 * German, when it is wanted. Vite turns each `import()` into its own chunk, so
 * an English-speaking visitor never downloads a word of it.
 */
const fetchers: Record<Exclude<Language, 'en'>, () => Promise<Bundle>> = {
  de: async () => ({
    board: (await import('../locales/de/board.json')).default,
    boards: (await import('../locales/de/boards.json')).default,
    kind: (await import('../locales/de/kind.json')).default,
    nav: (await import('../locales/de/nav.json')).default,
    signIn: (await import('../locales/de/signIn.json')).default,
  }),
};

const STORAGE = 'firsthand-kanban.language';

function restore(): Language {
  try {
    const held = localStorage.getItem(STORAGE);
    return LANGUAGES.includes(held as Language) ? (held as Language) : 'en';
  } catch {
    return 'en';
  }
}

let current: Language = restore();
const listeners = new Set<() => void>();
const announce = (): void => {
  for (const changed of listeners) {
    changed();
  }
};

/**
 * Plurals, because "1 cards" is the thing everybody notices.
 *
 * `Intl.PluralRules` decides which form applies, which is the browser's job
 * and not a table anybody should write by hand. The key itself is the general
 * form; a `_one`, `_few` or `_many` beside it is used when the language asks
 * for one and the file has it. Another language adds keys, not code.
 */
function pick(strings: Record<string, string>, name: string, count: number): string | undefined {
  const rule = new Intl.PluralRules(current).select(count);
  return strings[`${name}_${rule}`] ?? strings[name];
}

export const { t, language } = translator({
  translate: (key: Key, values?: Record<string, string | number>): string => {
    const [feature, name] = key.split('.') as [Feature, string];
    // Until a language has arrived, English answers. A missing word is worse
    // than an English one, and this is the whole of the fallback.
    const strings = (loaded[current] ?? english)[feature] as Record<string, string>;
    const text =
      values?.['count'] === undefined
        ? (strings[name] ?? key)
        : (pick(strings, name, Number(values['count'])) ?? key);
    return values === undefined
      ? text
      : text.replace(/\{\{(\w+)\}\}/g, (_, held: string) => String(values[held] ?? ''));
  },
  language: () => current,
  subscribe: (changed) => {
    listeners.add(changed);
    return () => listeners.delete(changed);
  },
});

/** Switches between the two languages this showcase ships with. */
export function toggleLanguage(): void {
  const next: Language = current === 'en' ? 'de' : 'en';
  current = next;
  try {
    localStorage.setItem(STORAGE, next);
  } catch {
    // A private window still switches; it just does not remember.
  }
  // Twice, when the file is not here yet: once for the language, which swaps
  // whatever is loaded, and once when the download lands.
  announce();
  if (loaded[next] === undefined && next !== 'en') {
    void fetchers[next]().then((bundle) => {
      loaded[next] = bundle;
      announce();
    });
  }
}

// Somebody who left the application in German gets it back in German, which
// means fetching it before the first paint rather than after it.
if (current !== 'en') {
  void fetchers[current]().then((bundle) => {
    loaded[current] = bundle;
    announce();
  });
}
