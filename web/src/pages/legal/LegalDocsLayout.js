import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Search, Menu, X, List as ListIcon } from 'lucide-react';
import LegalSearchModal from '../../components/legal/LegalSearchModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  LEGAL_DOC_GROUPS,
  ALL_LEGAL_DOCS,
  DEFAULT_LEGAL_SLUG,
  slugifyHeading,
} from './legalDocsConfig';
import usePageMeta from '../../hooks/usePageMeta';

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  background: ${props => props.theme.colors.background};
  min-height: calc(100vh - 60px);
`;

const LayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 260px minmax(0, 720px) 240px;
  gap: 2.5rem;
  width: 100%;
  max-width: 1240px;
  padding: 2rem 2rem 4rem;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    padding: 1.25rem 1.25rem 3rem;
  }
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100vh - 3rem);

  @media (max-width: 820px) {
    display: none;
  }
`;

const SidebarLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.textTertiary};
`;

const SearchTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;
  width: 100%;
  text-align: left;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text};
  }
`;

const SearchTriggerKbd = styled.kbd`
  margin-left: auto;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  padding: 0.05rem 0.35rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-family: inherit;
`;

const NavScroll = styled.nav`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-right: 0.25rem;
`;

const NavGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NavGroupLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.textTertiary};
  margin-bottom: 0.4rem;
  margin-top: 0.5rem;

  &:first-child {
    margin-top: 0;
  }
`;

const NavItem = styled(Link)`
  display: block;
  padding: 0.45rem 0.6rem;
  border-radius: ${props => props.theme.radius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.$active ? props.theme.typography.weights.semibold : props.theme.typography.weights.medium};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  background: ${props => props.$active ? props.theme.colors.primaryLight : 'transparent'};
  text-decoration: none;

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primaryLight : props.theme.colors.backgroundSecondary};
    color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text};
  }
`;

const MobileTopBar = styled.div`
  display: none;

  @media (max-width: 820px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const MobileMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;
`;

const MobileDrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const MobileDrawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 1001;
`;

const MobileDrawerClose = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
`;

const ContentColumn = styled.main`
  min-width: 0;
`;

const DocTitle = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const DocMeta = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textTertiary};
  margin-bottom: 2.5rem;
  font-style: italic;
`;

const MarkdownBody = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  line-height: 1.75;

  h2 {
    font-size: ${props => props.theme.typography.sizes['2xl']};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    margin: 2.5rem 0 1rem;
    scroll-margin-top: 5.5rem;
  }

  h3 {
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    margin: 1.75rem 0 0.75rem;
    scroll-margin-top: 5.5rem;
  }

  p {
    margin-bottom: 1rem;
  }

  ul, ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.4rem;
  }

  strong {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 3px solid ${props => props.theme.colors.border};
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
    padding: 0.9rem 1.25rem;
    margin: 1.5rem 0;
    border-radius: 0 ${props => props.theme.radius.sm} ${props => props.theme.radius.sm} 0;

    p:last-child {
      margin-bottom: 0;
    }
  }

  code {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 0.15rem 0.4rem;
    border-radius: ${props => props.theme.radius.sm};
    font-size: 0.9em;
  }
`;

const TocColumn = styled.aside`
  position: sticky;
  top: 1.5rem;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1100px) {
    display: none;
  }
`;

const TocHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.textTertiary};
  margin-bottom: 0.75rem;
`;

const TocList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid ${props => props.theme.colors.borderLight};
`;

const TocItem = styled.li`
  border-left: 2px solid ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  margin-left: -1px;
`;

const TocLink = styled.a`
  display: block;
  padding: 0.3rem 0 0.3rem 0.85rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.$active ? props.theme.typography.weights.semibold : props.theme.typography.weights.regular};
  text-decoration: none;
  padding-left: ${props => props.$level === 3 ? '1.5rem' : '0.85rem'};

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

// Extracts plain text out of a heading's rendered children (strings, or
// nested elements from bold/link markdown inside a heading) so it can be
// slugified into a stable, unique id for anchor scrolling and the TOC.
function getPlainText(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getPlainText).join('');
  if (node.props?.children) return getPlainText(node.props.children);
  return '';
}

const SidebarNav = ({ slug, onNavigate }) => (
  <NavScroll>
    {LEGAL_DOC_GROUPS.map(group => (
      <NavGroup key={group.label}>
        <NavGroupLabel>{group.label}</NavGroupLabel>
        {group.docs.map(doc => (
          <NavItem
            key={doc.slug}
            to={`/legal/${doc.slug}`}
            $active={doc.slug === slug}
            onClick={onNavigate}
          >
            {doc.title}
          </NavItem>
        ))}
      </NavGroup>
    ))}
  </NavScroll>
);

const LegalDocsLayout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const contentRef = useRef(null);

  const doc = ALL_LEGAL_DOCS.find(d => d.slug === slug);
  usePageMeta(doc ? doc.title : 'Legal');

  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    setLoading(true);
    setContent(null);
    window.scrollTo(0, 0);

    fetch(`/legal/${doc.slug}.md`)
      .then(res => res.text())
      .then(text => { if (!cancelled) setContent(text); })
      .catch(() => { if (!cancelled) setContent('# Could not load this document\n\nPlease try again shortly.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [doc]);

  // Builds the TOC from the *actually rendered* headings (rather than a
  // separate markdown parse pass) so it can never drift from what's really
  // on the page, and wires up an IntersectionObserver to track which
  // section is currently in view for the active-TOC-item highlight.
  useEffect(() => {
    if (!content || !contentRef.current) return undefined;

    const nodes = Array.from(contentRef.current.querySelectorAll('h2[id], h3[id]'));
    setHeadings(nodes.map(node => ({
      id: node.id,
      text: node.textContent,
      level: node.tagName === 'H3' ? 3 : 2,
    })));

    // Deep-link support: a search result or external link pointing at
    // /legal/<slug>#<heading-id> should land on that section, not the top
    // of the document — this runs after headings exist in the DOM, unlike
    // the browser's own native hash-scroll which fires before content loads.
    const hashId = window.location.hash.replace('#', '');
    if (hashId) {
      const target = nodes.find(node => node.id === hashId);
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    }

    if (nodes.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: [0, 1] }
    );
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [content]);

  // "/" opens search, matching common docs-site convention — deliberately
  // not Cmd+K, since the main site's Navbar already binds that globally
  // (it's still mounted around this page) to its own course-search palette;
  // reusing the same shortcut here would fire both at once. Ignored while
  // focus is already in a text field, so normal typing still works.
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== '/' || searchOpen) return;
      const tag = document.activeElement?.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (isEditable) return;
      e.preventDefault();
      setSearchOpen(true);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [searchOpen]);

  // Deliberately NOT memoized across renders (no useRef/useCallback with []
  // deps) — this component re-renders on every scroll tick (activeId state
  // changes as the IntersectionObserver fires), and a persistent counter
  // would keep incrementing on each of those re-renders, silently changing
  // every heading's id after the first scroll and breaking both TOC clicks
  // and the active-highlight match. A fresh Map per render, shared by both
  // heading levels within that one render pass, gives the exact same slugs
  // every time the same content renders — which is what "stable id" means.
  const seenHeadingSlugs = new Map();
  const headingRenderer = (level) => {
    const Tag = `h${level}`;
    return ({ children }) => {
      const text = getPlainText(children);
      let slug = slugifyHeading(text);
      if (seenHeadingSlugs.has(slug)) {
        const n = seenHeadingSlugs.get(slug) + 1;
        seenHeadingSlugs.set(slug, n);
        slug = `${slug}-${n}`;
      } else {
        seenHeadingSlugs.set(slug, 1);
      }
      return <Tag id={slug}>{children}</Tag>;
    };
  };

  const handleTocClick = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!doc) {
    return <Navigate to={`/legal/${DEFAULT_LEGAL_SLUG}`} replace />;
  }

  const titleLine = content?.split('\n').find(line => line.startsWith('# '))?.slice(2) || doc.title;
  const metaLine = content?.split('\n').find(line => line.startsWith('_Last updated')) || '';

  return (
    <PageWrapper>
      <LayoutGrid>
        <MobileTopBar>
          <MobileMenuButton onClick={() => setMobileNavOpen(true)}>
            <Menu size={16} /> Documents
          </MobileMenuButton>
          <MobileMenuButton onClick={() => setSearchOpen(true)}>
            <Search size={16} />
          </MobileMenuButton>
        </MobileTopBar>

        <Sidebar>
          <div>
            <SidebarLabel style={{ marginBottom: '0.75rem' }}>Legal Documentation</SidebarLabel>
            <SearchTrigger onClick={() => setSearchOpen(true)}>
              <Search size={15} />
              Search
              <SearchTriggerKbd>/</SearchTriggerKbd>
            </SearchTrigger>
          </div>
          <SidebarNav slug={slug} />
        </Sidebar>

        {mobileNavOpen && (
          <MobileDrawerOverlay onClick={() => setMobileNavOpen(false)}>
            <MobileDrawer onClick={e => e.stopPropagation()}>
              <MobileDrawerClose onClick={() => setMobileNavOpen(false)}><X size={20} /></MobileDrawerClose>
              <SidebarNav slug={slug} onNavigate={() => setMobileNavOpen(false)} />
            </MobileDrawer>
          </MobileDrawerOverlay>
        )}

        <ContentColumn ref={contentRef}>
          {loading || !content ? (
            <LoadingSpinner />
          ) : (
            <>
              <DocTitle>{titleLine}</DocTitle>
              {metaLine && <DocMeta>{metaLine.replace(/_/g, '')}</DocMeta>}
              <MarkdownBody>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: () => null,
                    h2: headingRenderer(2),
                    h3: headingRenderer(3),
                    p: ({ node, ...props }) => {
                      // Drop the leading "_Last updated: ..._" line and any
                      // top-level "# Title" — both are rendered separately
                      // above from the raw text, not through ReactMarkdown.
                      const text = getPlainText(props.children);
                      if (text.startsWith('Last updated:')) return null;
                      return <p {...props} />;
                    },
                    a: ({ node, href, ...props }) => {
                      if (href?.startsWith('/')) {
                        return <Link to={href} {...props} />;
                      }
                      if (href?.startsWith('mailto:')) {
                        return <a href={href} {...props} />;
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
                    },
                  }}
                >
                  {content}
                </ReactMarkdown>
              </MarkdownBody>
            </>
          )}
        </ContentColumn>

        <TocColumn>
          {headings.length > 0 && (
            <>
              <TocHeader><ListIcon size={13} /> On this page</TocHeader>
              <TocList>
                {headings.map(h => (
                  <TocItem key={h.id} $active={h.id === activeId}>
                    <TocLink
                      href={`#${h.id}`}
                      $active={h.id === activeId}
                      $level={h.level}
                      onClick={(e) => handleTocClick(e, h.id)}
                    >
                      {h.text}
                    </TocLink>
                  </TocItem>
                ))}
              </TocList>
            </>
          )}
        </TocColumn>
      </LayoutGrid>

      {searchOpen && (
        <LegalSearchModal
          onClose={() => setSearchOpen(false)}
          onNavigate={(path) => { setSearchOpen(false); navigate(path); }}
        />
      )}
    </PageWrapper>
  );
};

export default LegalDocsLayout;
