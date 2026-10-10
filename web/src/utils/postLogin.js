// A page can ask to be brought back to after Google sign-in (the birthday
// page does); AuthCallback takes it. Only a path on this site counts: one
// leading slash, never "//host".
const KEY = 'postLoginPath';

export function rememberPostLoginPath(path) {
  try { sessionStorage.setItem(KEY, path); } catch {}
}

export function takePostLoginPath() {
  let path = null;
  try {
    path = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {}
  return path && /^\/(?!\/)/.test(path) ? path : null;
}
