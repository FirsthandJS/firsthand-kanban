/**
 * Every word on screen, from the feature that says it.
 *
 * ```
 * features/board/locales/en.json     features/board/locales/de.json
 * features/boards/locales/en.json    features/boards/locales/de.json
 * app/shell/locales/en.json          app/shell/locales/de.json
 * ```
 *
 * A key is `namespace.path`, so `t('board.addCard')` reads the board feature's
 * file and `t('board.kinds.BUG')` reads one level further in. Keeping the file
 * beside the feature is what makes a feature deletable: its words go with it,
 * and nothing else was ever reading them.
 *
 * Splitting by language is what lets the second one be *fetched*. English is
 * imported, German is an `import()` that runs when somebody asks for it —
 * `translator()` is built for exactly that, because "could answer differently"
 * is wider than "the language changed". When it lands, `changed()` re-runs the
 * expressions that read `t` and nothing else: the board does not re-render,
 * the cards keep their DOM, and a card being dragged keeps being dragged.
 */
import { translator } from '@firsthandjs/i18n';
import board from '@/features/board/locales/en.json';
import boards from '@/features/boards/locales/en.json';
import nav from '@/app/shell/locales/en.json';
import signIn from '@/features/session/locales/en.json';

/** The shape every language has, taken from the one that is always here. */
const english = { board, boards, nav, signIn };

type Bundle = typeof english;

/**
 * Every key any feature's file holds, as `namespace.path`.
 *
 * Built from the English files, so a key that exists nowhere does not compile,
 * and a key removed from a file stops compiling everywhere it was used.
 */
type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type Key = Leaves<Bundle>;

const LANGUAGES = ['en', 'de'] as const;
export type Language = (typeof LANGUAGES)[number];

const loaded: Partial<Record<Language, Bundle>> = { en: english };

/**
 * German, when it is wanted. Vite turns each `import()` into its own chunk, so
 * an English-speaking visitor never downloads a word of it.
 */
const fetchers: Record<Exclude<Language, 'en'>, () => Promise<Bundle>> = {
  de: async () => ({
    board: (await import('@/features/board/locales/de.json')).default,
    boards: (await import('@/features/boards/locales/de.json')).default,
    nav: (await import('@/app/shell/locales/de.json')).default,
    signIn: (await import('@/features/session/locales/de.json')).default,
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

/** Walks `a.b.c` through a bundle, or gives up and says so. */
function lookup(bundle: Bundle, key: string): unknown {
  let held: unknown = bundle;
  for (const step of key.split('.')) {
    if (typeof held !== 'object' || held === null) {
      return undefined;
    }
    held = (held as Record<string, unknown>)[step];
  }
  return held;
}

/**
 * Plurals, because "1 cards" is the thing everybody notices.
 *
 * `Intl.PluralRules` decides which form applies, which is the browser's job
 * and not a table anybody should write by hand. The key itself is the general
 * form; a `_one`, `_few` or `_many` beside it is used when the language asks
 * for one and the file has it. Another language adds keys, not code.
 */
function plural(bundle: Bundle, key: string, count: number): unknown {
  const rule = new Intl.PluralRules(current).select(count);
  const special = lookup(bundle, `${key}_${rule}`);
  return typeof special === 'string' ? special : lookup(bundle, key);
}

export const { t, language } = translator({
  translate: (key: Key, values?: Record<string, string | number>): string => {
    // Until a language has arrived, English answers. A missing word is worse
    // than an English one, and this is the whole of the fallback.
    const bundle = loaded[current] ?? english;
    const found =
      values?.['count'] === undefined
        ? lookup(bundle, key)
        : plural(bundle, key, Number(values['count']));
    const text = typeof found === 'string' ? found : key;
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
