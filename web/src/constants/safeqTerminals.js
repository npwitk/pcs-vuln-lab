// Maps a SafeQ terminal code (as it appears in a transaction's raw
// description, e.g. "on terminal 'APC5571_410828_TU_Rangsit'") to a
// human-friendly location name shown on the Thammasat Printer page.
// An unmapped code just falls back to showing the raw code itself, so
// there's nothing to break by adding more of these as they're identified.
export const SAFEQ_TERMINAL_NAMES = {
  APC5571_410828_TU_Rangsit: 'Puay Library',
  APC5571_410871_TU_Rangsit: 'Sor Kor Ror',
};
