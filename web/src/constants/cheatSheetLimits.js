// Mirrors MAX_SUPPLEMENTARY_FILES in server/routes/cheatSheetFiles.js — kept
// as a separate constant (can't literally share one across the client/server
// boundary) purely so the client can show a friendly error before hitting
// the network instead of only after the server's 400.
export const MAX_SUPPLEMENTARY_FILES = 10;

// Mirrors MAX_COLLABORATORS in server/routes/cheatSheetCollaborators.js.
export const MAX_COLLABORATORS = 8;

// Mirrors MIN_PAID_PRICE in server/routes/cheatSheets.js. A price must be
// exactly 0 (free) or at least this amount — anything between is rejected.
// Ties to Stripe's ฿20 PromptPay minimum: below it, orders silently fall
// back to the unconfirmable legacy QR rail, so we don't let sellers price
// themselves into that gap.
export const MIN_PAID_PRICE = 20;
