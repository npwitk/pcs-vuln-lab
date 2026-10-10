// Single source of truth for what legal documents exist, their sidebar
// grouping, and their .md filename (served statically from
// client/public/legal/<slug>.md, fetched at runtime — see LegalDocsLayout).
// Shared between the layout (sidebar) and the search modal (index).
export const LEGAL_DOC_GROUPS = [
  {
    label: 'Core Legal Documents',
    docs: [
      { slug: 'terms-of-service', title: 'Terms of Service' },
      { slug: 'privacy-policy', title: 'Privacy Policy' },
    ],
  },
  {
    label: 'Policies & Agreements',
    docs: [
      { slug: 'refunds-policy', title: 'Refunds Policy' },
      { slug: 'cookie-policy', title: 'Cookie Policy' },
      { slug: 'academic-integrity', title: 'Academic Integrity Policy' },
      { slug: 'acceptable-use', title: 'Acceptable Use Policy' },
      { slug: 'dmca-policy', title: 'Copyright and DMCA Policy' },
    ],
  },
];

export const ALL_LEGAL_DOCS = LEGAL_DOC_GROUPS.flatMap(g => g.docs);

export const DEFAULT_LEGAL_SLUG = 'terms-of-service';

export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}
