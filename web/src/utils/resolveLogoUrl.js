// Institution logos: newly-uploaded ones (via the admin logo upload) store
// the full GCS/CDN URL in logo_filename. The original handful that shipped
// as static files in client/public/logos/ still store a bare filename
// (e.g. "siit.png") — handles both until any remaining legacy ones get
// re-uploaded through the new admin flow.
export function resolveLogoUrl(logoFilename) {
  if (!logoFilename) return null;
  if (/^https?:\/\//.test(logoFilename)) return logoFilename;
  return `/logos/${logoFilename}`;
}
