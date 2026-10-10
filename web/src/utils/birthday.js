// Peanut turns 1. Typing one of these into the search opens the party page.
// The server (services/birthdayCampaign.js) decides whether a gift can be
// claimed; these dates here only switch the hints on and off.

export const BIRTHDAY_PATH = '/happy-birthday';
export const BIRTHDAY_STARTS = new Date('2026-10-01T00:00:00+07:00');
export const BIRTHDAY_ENDS = new Date('2026-11-05T00:00:00+07:00'); // through 4 Nov

const PHRASES = ['happybirthday', 'hbd', 'สุขสันต์วันเกิด'];

// Lowercase, and drop anything that isn't a letter or a digit (spaces,
// punctuation, emoji), so "Happy  Birthday!!" and "HBD 🎉" both count. Thai
// vowel and tone marks are combining marks, so they're kept too.
export function normalizePhrase(text) {
  return (text || '').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\p{M}]/gu, '');
}

export function isBirthdayPhrase(text) {
  return PHRASES.includes(normalizePhrase(text));
}

// True while someone is part-way through typing a phrase ("hap", "hb"), for
// the search box's little reaction. Two letters at least, so "h" is quiet.
export function isBirthdayPrefix(text) {
  const n = normalizePhrase(text);
  return n.length >= 2 && PHRASES.some(p => p.startsWith(n) && p !== n);
}

export function isBirthdayWindow(now = new Date()) {
  return now >= BIRTHDAY_STARTS && now < BIRTHDAY_ENDS;
}
