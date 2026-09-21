/**
 * Web Awesome: the controls, and where its icons come from.
 *
 * Components are imported one by one rather than through the autoloader, so
 * the bundle carries the six that are used and not the other fifty.
 *
 * The icon library is pointed at `public/icons`. By default `<wa-icon>`
 * fetches from the Font Awesome CDN, which is a fine default and a poor
 * dependency for a demo someone clones on a train — these are four hand-cut
 * SVGs, resolved by the same `name` attribute the library documents.
 */
import '@awesome.me/webawesome/dist/styles/webawesome.css';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/avatar/avatar.js';
import '@awesome.me/webawesome/dist/components/spinner/spinner.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';
import { registerIconLibrary } from '@awesome.me/webawesome';

registerIconLibrary('default', {
  resolver: (name: string) => `/icons/${name}.svg`,
});
