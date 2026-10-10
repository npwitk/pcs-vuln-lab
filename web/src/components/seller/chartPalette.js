// Series colours for the seller charts: the dataviz skill's validated
// categorical palette, in its fixed slot order, with separate steps for
// dark mode. Checked with validate_palette.js against this site's card
// surfaces (#FFFFFF light, #1A1A1A dark): all hard checks pass in both
// modes. Three light-mode slots sit under 3:1 contrast on white, so every
// charted value is also available as text (legend totals, table view).
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

// "Others" (every sheet without its own line) and single-series marks that
// carry no identity, like a sparkline for a sheet with no slot.
const MUTED = { light: '#898781', dark: '#898781' };

// Recessive chart chrome.
const CHROME = {
  light: { grid: '#EBEBEF', axis: '#86868B' },
  dark: { grid: '#2D2D2D', axis: '#8E8E93' },
};

export const MAX_SLOTS = SERIES.light.length;
export const LINE_LIMIT = 5;

export const seriesColor = (mode, slot) => (slot == null ? MUTED[mode] || MUTED.light : (SERIES[mode] || SERIES.light)[slot]);
export const mutedColor = (mode) => MUTED[mode] || MUTED.light;
export const chromeColors = (mode) => CHROME[mode] || CHROME.light;

/**
 * A fixed colour slot per sheet, so a sheet keeps its colour whichever
 * metric or range is shown (colour follows the entity, never its rank).
 * Slots go to the seller's best sellers of all time, ties broken by id;
 * sheets past the eighth get none and are always part of "Others".
 */
export function assignSlots(cheatSheets) {
  const ranked = [...cheatSheets].sort((a, b) =>
    (b.purchase_count || 0) - (a.purchase_count || 0) || a.cheatsheet_id - b.cheatsheet_id);
  const slots = {};
  ranked.slice(0, MAX_SLOTS).forEach((cs, i) => { slots[cs.cheatsheet_id] = i; });
  return slots;
}
