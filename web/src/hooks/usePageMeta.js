import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://cheatsheets.npwitk.com';
export const SITE_NAME = 'Peanut Cheat Sheets';
export const DEFAULT_TITLE = `${SITE_NAME} · Student-made cheat sheets`;

// Per-page <title> and canonical URL. The static index.html only has
// site-wide defaults (it's served for every route), so without this every
// tab and search result read "Peanut Cheat Sheets".
//
// `title` is suffixed with the site name; pass null while data is loading
// to leave the current title alone. Restores the default on unmount, so a
// page that doesn't call this never inherits the previous page's title.
export default function usePageMeta(title, { canonicalPath } = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!title) return undefined;
    document.title = title === DEFAULT_TITLE || title.endsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);

  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    // Query strings (search, filters) never change what the page is.
    link.href = `${SITE_URL}${canonicalPath ?? pathname}`;
  }, [pathname, canonicalPath]);
}
