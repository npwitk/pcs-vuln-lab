import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, X } from 'lucide-react';
import { ALL_LEGAL_DOCS, slugifyHeading } from '../../pages/legal/legalDocsConfig';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9998;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
  animation: ${fadeIn} 0.15s ease;
`;

const Modal = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 560px;
  margin: 0 1rem;
  overflow: hidden;
  animation: ${slideDown} 0.18s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.25rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.span`
  font-size: 0.8125rem;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
`;

const SearchIcon = styled(Search)`
  width: 20px;
  height: 20px;
  color: ${props => props.theme.colors.textSecondary};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.0625rem;
  color: ${props => props.theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const ResultsList = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  max-height: 360px;
  overflow-y: auto;
`;

const ResultItem = styled.button`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  width: 100%;
  padding: 0.7rem 1.25rem;
  border: none;
  background: ${props => props.$active ? props.theme.colors.backgroundSecondary : 'transparent'};
  text-align: left;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
`;

const ResultHeading = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const ResultDoc = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.primary};
`;

const EmptyState = styled.div`
  padding: 2rem 1.25rem;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ModalFooter = styled.div`
  padding: 0.875rem 1.25rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HintText = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textTertiary};
`;

const Kbd = styled.kbd`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  padding: 0.125rem 0.375rem;
  font-size: 0.6875rem;
  font-family: inherit;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0.125rem;
`;

// Builds a flat {docSlug, docTitle, heading, id}[] index by fetching every
// legal doc's raw markdown once and regex-scanning for ## / ### lines — a
// separate, lighter-weight pass than the real ReactMarkdown render in
// LegalDocsLayout, but uses the same slugifyHeading() so the ids line up
// with the real rendered anchors.
async function buildSearchIndex() {
  const results = await Promise.all(
    ALL_LEGAL_DOCS.map(async (doc) => {
      try {
        const res = await fetch(`/legal/${doc.slug}.md`);
        const text = await res.text();
        const seen = new Map();
        const entries = [{ docSlug: doc.slug, docTitle: doc.title, heading: doc.title, id: null }];
        text.split('\n').forEach((line) => {
          const match = line.match(/^(##|###)\s+(.*)$/);
          if (!match) return;
          const headingText = match[2].trim();
          let slug = slugifyHeading(headingText);
          if (seen.has(slug)) {
            const n = seen.get(slug) + 1;
            seen.set(slug, n);
            slug = `${slug}-${n}`;
          } else {
            seen.set(slug, 1);
          }
          entries.push({ docSlug: doc.slug, docTitle: doc.title, heading: headingText, id: slug });
        });
        return entries;
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}

const LegalSearchModal = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    buildSearchIndex().then(setIndex);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const term = query.trim().toLowerCase();
  const results = !index ? [] : !term ? index.slice(0, 8) : index
    .filter(e => e.heading.toLowerCase().includes(term) || e.docTitle.toLowerCase().includes(term))
    .slice(0, 20);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleSelect = (entry) => {
    onNavigate(`/legal/${entry.docSlug}${entry.id ? `#${entry.id}` : ''}`);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' && results.length > 0) {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % results.length);
        return;
      }
      if (e.key === 'ArrowUp' && results.length > 0) {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + results.length) % results.length);
        return;
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, activeIndex, onClose]);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Search Legal Documents</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close search">
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <SearchRow>
          <SearchIcon />
          <SearchInput
            ref={inputRef}
            type="text"
            placeholder="Search documents and sections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchRow>

        <ResultsList>
          {!index ? (
            <EmptyState>Loading…</EmptyState>
          ) : results.length === 0 ? (
            <EmptyState>No matches for "{query}"</EmptyState>
          ) : (
            results.map((entry, i) => (
              <ResultItem
                key={`${entry.docSlug}-${entry.id || 'title'}`}
                type="button"
                $active={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => handleSelect(entry)}
              >
                <ResultHeading>{entry.heading}</ResultHeading>
                {entry.id && <ResultDoc>{entry.docTitle}</ResultDoc>}
              </ResultItem>
            ))
          )}
        </ResultsList>

        <ModalFooter>
          <HintText>
            <Kbd>&uarr;</Kbd><Kbd>&darr;</Kbd> to navigate &nbsp;&middot;&nbsp; <Kbd>&crarr;</Kbd> to select &nbsp;&middot;&nbsp; <Kbd>Esc</Kbd> to close
          </HintText>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default LegalSearchModal;
