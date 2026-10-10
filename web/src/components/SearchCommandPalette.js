import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, X, Cake, PartyPopper } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { coursesAPI } from '../services/api';
import { useInstitutions } from '../context/InstitutionContext';
import Collapsible from './Collapsible';
import useBirthdayHint from '../hooks/useBirthdayHint';
import { BIRTHDAY_PATH, isBirthdayPhrase, isBirthdayPrefix, isBirthdayWindow } from '../utils/birthday';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-20px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

// Each suggestion fades and slides in, a beat after the one above it. Rows
// that stay between keystrokes keep their key, so only new ones animate.
const suggestionIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
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
  transition: all 0.15s ease;

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
    opacity: ${props => (props.$fading ? 0 : 1)};
    transition: opacity 0.2s ease;
  }
`;

// Peanut's birthday: a cake stands in for the search icon while someone types
// the magic words, wiggling, then hopping once they're complete.
const wiggle = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-12deg); }
  75% { transform: rotate(12deg); }
`;

const hopUp = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  40% { transform: translateY(-4px) scale(1.15); }
`;

const CakeIcon = styled(Cake)`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: ${props => props.theme.colors.primary};
  animation: ${props => (props.$done ? hopUp : wiggle)} ${props => (props.$done ? '0.7s' : '0.5s')} ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SuggestionsList = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  max-height: 260px;
  overflow-y: auto;
`;

const SuggestionItem = styled.button`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  width: 100%;
  padding: 0.7rem 1.25rem;
  border: none;
  background: ${props => props.$active ? props.theme.colors.backgroundSecondary : 'transparent'};
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  animation: ${suggestionIn} 180ms ease-out both;
  animation-delay: ${props => Math.min(props.$index, 8) * 25}ms;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const SuggestionCode = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const SuggestionName = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${props => props.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchCommandPalette = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Suggestions rank the institution picked in the navbar first
  const { selectedInstitution } = useInstitutions();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  // What the list shows: the current suggestions, or the last ones while it
  // folds away after they're cleared.
  const lastSuggestionsRef = useRef([]);
  if (suggestions.length > 0) lastSuggestionsRef.current = suggestions;
  const shownSuggestions = suggestions.length > 0 ? suggestions : lastSuggestionsRef.current;
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const placeholderHint = useBirthdayHint();
  const birthdayLive = isBirthdayWindow();
  const celebrate = birthdayLive && isBirthdayPhrase(query);
  const typingBirthday = birthdayLive && isBirthdayPrefix(query);

  // Populate input from current URL when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery(searchParams.get('q') || '');
      setSuggestions([]);
      setActiveIndex(-1);
      // Select the previous query so typing replaces it straight away
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(debounceRef.current);
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }
    debounceRef.current = setTimeout(() => {
      coursesAPI.suggest(term, selectedInstitution)
        .then(res => {
          setSuggestions(res.data.courses || []);
          setActiveIndex(-1);
        })
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isOpen, selectedInstitution]);

  const runSearch = (searchTerm) => {
    const existing = Object.fromEntries(searchParams.entries());
    const term = (searchTerm ?? query).trim();
    // The magic words open the birthday party instead of searching.
    if (isBirthdayWindow() && isBirthdayPhrase(term)) {
      navigate(BIRTHDAY_PATH);
      onClose();
      return;
    }
    if (term) {
      existing.q = term;
    } else {
      delete existing.q;
    }
    // Global search should search everything, not just the logged-in
    // user's own year level — Home.js otherwise defaults the year filter
    // from the user's profile, which silently hid results like "LAS101"
    // for a Year 4 student searching a Year 2 course. Explicitly writing
    // year=all (rather than just omitting it) is what's needed to make
    // Home's year-sync effect actually reset an already-narrower filter.
    existing.year = 'all';
    navigate(`/?${new URLSearchParams(existing).toString()}`);
    onClose();
  };

  const handleSelectSuggestion = (course) => {
    setQuery(course.course_code);
    runSearch(course.course_code);
  };

  // ESC closes, Enter submits (or picks the highlighted suggestion), arrows navigate
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        // Without this, Safari's own default action for Escape still fires
        // alongside closing the modal — harmless normally, but when the
        // browser window itself is in native macOS full screen, Safari also
        // binds Escape to exiting full screen. preventDefault suppresses
        // that native action while leaving our own onClose() handling intact.
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp' && suggestions.length > 0) {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter') {
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelectSuggestion(suggestions[activeIndex]);
        } else {
          runSearch();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, query, suggestions, activeIndex]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{t('searchPalette.title')}</ModalTitle>
          <CloseButton onClick={onClose} aria-label={t('searchPalette.closeAriaLabel')}>
            <X size={16} />
          </CloseButton>
        </ModalHeader>

        <SearchRow>
          {celebrate || typingBirthday ? <CakeIcon $done={celebrate} aria-hidden="true" /> : <SearchIcon />}
          <SearchInput
            ref={inputRef}
            type="text"
            $fading={placeholderHint.fading}
            placeholder={placeholderHint.hint ? t('birthday.searchHint') : t('searchPalette.inputPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchRow>

        {/* The list grows open and folds away rather than snapping; while
            it folds, the last suggestions stay visible. */}
        <Collapsible open={suggestions.length > 0} duration={220} bounce={false}>
          <SuggestionsList>
            {shownSuggestions.map((course, index) => (
              <SuggestionItem
                key={course.course_code}
                type="button"
                $index={index}
                $active={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelectSuggestion(course)}
              >
                <SuggestionCode>{course.course_code}</SuggestionCode>
                <SuggestionName>{course.course_name}</SuggestionName>
              </SuggestionItem>
            ))}
          </SuggestionsList>
        </Collapsible>

        <ModalFooter>
          <HintText>
            {t('searchPalette.hintPrefix')} <Kbd>↵</Kbd> {t('searchPalette.hintSearch')} &nbsp;·&nbsp; <Kbd>Esc</Kbd> {t('searchPalette.hintOr')} <Kbd>⌘K</Kbd> {t('searchPalette.hintClose')}
          </HintText>
          <SearchButton onClick={() => runSearch()}>
            {celebrate && <PartyPopper size={15} aria-hidden="true" />}
            {celebrate ? t('birthday.celebrate') : t('searchPalette.searchButton')}
          </SearchButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default SearchCommandPalette;
