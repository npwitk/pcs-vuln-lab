// Preview images are public files on the CDN (cdn.cheatsheets.npwitk.com,
// Cloudflare in front of the GCS bucket; older rows use the raw
// storage.googleapis.com URL). Neither sends CORS headers. <img> doesn't
// care, but WebGL textures do, so the 3D viewer loads them through the
// site's own /media/previews/* path (a Vercel rewrite in vercel.json, and
// src/setupProxy.js in development).
const PREVIEW_URL_PREFIXES = [
  'https://cdn.cheatsheets.npwitk.com/previews/',
  'https://storage.googleapis.com/siit-cheatsheets/previews/',
];

export function sameOriginPreviewUrl(url) {
  if (!url) return url;
  const prefix = PREVIEW_URL_PREFIXES.find(p => url.startsWith(p));
  return prefix ? `/media/previews/${url.slice(prefix.length)}` : url;
}
