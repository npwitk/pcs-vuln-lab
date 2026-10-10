import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cheatSheetsAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInstitutions } from '../context/InstitutionContext';
import AnnouncementBanner from '../components/AnnouncementBanner';
import UpcomingExamsCarousel from '../components/UpcomingExamsCarousel';
import Collapsible from '../components/Collapsible';
import StudyProfilePrompt from '../components/StudyProfilePrompt';
import InstitutionViewingBanner from '../components/InstitutionViewingBanner';
import MyLibraryShelf from '../components/MyLibraryShelf';
import CheatSheetCard from '../components/CheatSheetCard';
import EmptyState, { EmptyStateButton } from '../components/EmptyState';
import { CardGridSkeleton } from '../components/skeletons/HomeSkeleton';
import useIsMobile from '../hooks/useIsMobile';
import { Search, X } from 'lucide-react';
import usePageMeta, { DEFAULT_TITLE } from '../hooks/usePageMeta';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 2rem 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
  transition: background ${props => props.theme.transitions.normal};
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  text-align: center;

  @media (min-width: 769px) {
    text-align: left;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['4xl']};
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.sizes['3xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.sizes.lg};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const YearPills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const YearPill = styled.button`
  padding: 0.375rem 0.875rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? '#fff' : props.theme.colors.textSecondary};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.$active ? '#fff' : props.theme.colors.primary};
  }
`;

const SortSelect = styled.select`
  padding: 0.375rem 0.75rem;
  border: 1.5px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-weight: ${props => props.theme.typography.weights.medium};
  outline: none;

  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadMoreSentinel = styled.div`
  display: flex;
  justify-content: center;
  padding: 2.5rem 0 1rem;
`;

const LoadMoreButton = styled.button`
  padding: 0.75rem 2rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1.5px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: border-color ${props => props.theme.transitions.fast}, color ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const SectionHeader = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  margin-bottom: 1.5rem;
  margin-top: 3rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${props => props.theme.colors.border};

  &:first-of-type {
    margin-top: 0;
  }
`;

// The navbar's search box is hidden on mobile, so the browse page gets its
// own plain search field above My Library; it searches on Enter. Desktop
// keeps the navbar one.
const MobileSearchField = styled.form`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    padding: 0 0.75rem;
    border: 1.5px solid ${props => props.theme.colors.border};
    border-radius: 10px;
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.textSecondary};
    transition: border-color ${props => props.theme.transitions.fast};

    &:focus-within {
      border-color: ${props => props.theme.colors.primary};
    }

    svg { flex-shrink: 0; }
  }
`;

const MobileSearchInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0;
  border: none;
  background: transparent;
  color: ${props => props.theme.colors.text};
  /* 16px keeps iOS Safari from zooming in on focus */
  font-size: 16px;
  outline: none;

  &::-webkit-search-cancel-button { display: none; }
  &::placeholder { color: ${props => props.theme.colors.textSecondary}; }
`;

const ClearSearchButton = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
`;

// After the upcoming-exams section collapses, the content below "lands":
// it overshoots upward a touch, dips, and settles. Two keyframes alternate
// so the animation restarts every time without remounting. They must not be
// byte-identical: styled-components names keyframes by a hash of their CSS,
// so identical ones would share a name and never restart. (0px vs 0 below.)
const landingKeyframes = (zero) => `
  0% { transform: translateY(${zero}); }
  35% { transform: translateY(-8px); }
  70% { transform: translateY(2px); }
  100% { transform: translateY(${zero}); }
`;
const landA = keyframes`${landingKeyframes('0')}`;
const landB = keyframes`${landingKeyframes('0px')}`;

const BelowExams = styled.div`
  ${props => props.$landCount > 0 && css`
    animation: ${props.$landCount % 2 ? landA : landB} 480ms cubic-bezier(0.33, 1, 0.68, 1);
  `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const YEAR_OPTIONS = [
  { labelKey: 'home.yearAll', value: 'all' },
  { labelKey: 'home.year1', shortLabelKey: 'home.year1Short', value: 'Year 1' },
  { labelKey: 'home.year2', shortLabelKey: 'home.year2Short', value: 'Year 2' },
  { labelKey: 'home.year3', shortLabelKey: 'home.year3Short', value: 'Year 3' },
  { labelKey: 'home.year4', shortLabelKey: 'home.year4Short', value: 'Year 4' },
];

const PAGE_SIZE = 24;

const Home = () => {
  usePageMeta(DEFAULT_TITLE);
  const { t } = useTranslation();
  const [cheatSheets, setCheatSheets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { isAuthenticated, user, canUpload, loading: authLoading } = useAuth();
  const { selectedInstitution, setSelectedInstitution, selectedInstitutionData } = useInstitutions();
  // While the carousel fades out after switching to "All Institutions", keep
  // it on the previous institution so it doesn't refetch and change mid-fade.
  const lastInstitutionRef = React.useRef(selectedInstitution);
  if (selectedInstitution !== 'all') lastInstitutionRef.current = selectedInstitution;
  const carouselInstitution = lastInstitutionRef.current !== 'all' ? lastInstitutionRef.current : null;
  const [landCount, setLandCount] = useState(0);

  // Switching institution swaps the whole page's content, so start from the
  // top rather than wherever the previous list was scrolled to.
  const prevInstitutionRef = React.useRef(selectedInstitution);
  useEffect(() => {
    if (prevInstitutionRef.current === selectedInstitution) return;
    prevInstitutionRef.current = selectedInstitution;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedInstitution]);
  const handleExamsCollapsed = React.useCallback(() => setLandCount(n => n + 1), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') || '');
  const [sort, setSort] = useState(() => searchParams.get('sort') || 'relevance');
  const [yearFilter, setYearFilter] = useState(() => searchParams.get('year') || 'all');
  const sentinelRef = React.useRef(null);
  const isMobile = useIsMobile();

  // Check for authentication errors from URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      switch (error) {
        case 'invalid_domain':
          toast.error(t('home.errors.invalidDomain'), { duration: 6000 });
          break;
        case 'auth_failed':
          toast.error(t('home.errors.authFailed'), { duration: 5000 });
          break;
        case 'auth_error':
          toast.error(t('home.errors.authError'), { duration: 5000 });
          break;
        case 'login_error':
          toast.error(t('home.errors.loginError'), { duration: 5000 });
          break;
        default:
          toast.error(t('home.errors.authErrorGeneric'), { duration: 5000 });
      }
      
      // Clear the error from URL
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, t]);

  const isFirstFilterSync = React.useRef(true);

  // A bookmarked/shared link with an old-style ?institution= param still
  // works — it seeds the shared preference once, then gets stripped from the
  // URL (institution selection now lives in InstitutionContext, not here).
  useEffect(() => {
    const urlInstitution = searchParams.get('institution');
    if (!urlInstitution) return;
    setSelectedInstitution(urlInstitution === 'all' ? 'all' : parseInt(urlInstitution));
    const params = Object.fromEntries(searchParams.entries());
    delete params.institution;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for auth check to resolve so we can default the year filter from
  // the user's profile without ever putting it in the URL.
  useEffect(() => {
    if (authLoading) return;
    window.scrollTo(0, 0);
    const urlYear = searchParams.get('year');
    const initialYear = urlYear || user?.year_level || 'all';
    setYearFilter(initialYear);
    fetchCheatSheets({ reset: true, institutionOverride: selectedInstitution, yearOverride: initialYear });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Sync q/year/sort from the URL, plus institution from the shared context,
  // and refetch once whenever any of them change. This used to be several
  // separate effects, one per filter — but a navigation that changes two at
  // once (e.g. the command palette setting q + year together) fired two of
  // them together, and each read the *other* filter from React state that
  // was still stale (the sibling effect's setState hadn't committed yet).
  // That raced two incomplete fetches — e.g. "search=LAS101 + old year"
  // against "old search + year=all" — and whichever response landed last
  // silently clobbered the correct combined result. Reading everything in
  // one effect and firing a single fetch avoids that; institution joining
  // this effect (instead of getting its own) keeps that guarantee even
  // though it now changes via context rather than the URL.
  useEffect(() => {
    if (isFirstFilterSync.current) { isFirstFilterSync.current = false; return; }
    const q = searchParams.get('q') || '';
    const y = searchParams.get('year') || 'all';
    const s = searchParams.get('sort') || 'relevance';

    setSearch(q);
    setYearFilter(y);
    setSort(s);
    fetchCheatSheets({
      reset: true,
      searchOverride: q,
      yearOverride: y,
      sortOverride: s,
      institutionOverride: selectedInstitution,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q'), searchParams.get('year'), searchParams.get('sort'), selectedInstitution]);

  // Saving study tags (Home prompt) reorders the default sort, so refetch.
  const studyTagsKey = (user?.study_tag_ids || []).join(',');
  const lastStudyTagsKey = React.useRef(null);
  useEffect(() => {
    if (authLoading) return;
    if (lastStudyTagsKey.current !== null && lastStudyTagsKey.current !== studyTagsKey) {
      fetchCheatSheets({ reset: true });
    }
    lastStudyTagsKey.current = studyTagsKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyTagsKey, authLoading]);

  // Fetches one page (PAGE_SIZE items). `reset: true` replaces the list and
  // starts from offset 0 (any filter change); otherwise appends the next
  // page starting after what's already loaded (infinite scroll).
  const fetchCheatSheets = async (opts = {}) => {
    const { reset = false, searchOverride, institutionOverride, sortOverride, yearOverride } = opts;
    const effectiveSearch = searchOverride !== undefined ? searchOverride : search;
    const effectiveInstitution = institutionOverride !== undefined ? institutionOverride : selectedInstitution;
    const effectiveSort = sortOverride !== undefined ? sortOverride : sort;
    const effectiveYear = yearOverride !== undefined ? yearOverride : yearFilter;
    try {
      if (reset) setLoading(true); else setLoadingMore(true);
      const response = await cheatSheetsAPI.getAll({
        search: effectiveSearch,
        institution_id: effectiveInstitution !== 'all' ? effectiveInstitution : undefined,
        sort: effectiveSort,
        year_level: effectiveYear !== 'all' ? effectiveYear : undefined,
        limit: PAGE_SIZE,
        offset: reset ? 0 : cheatSheets.length,
      });
      const newSheets = response.data.cheat_sheets || [];
      setTotal(response.data.total || 0);
      setCheatSheets(prev => reset ? newSheets : [...prev, ...newSheets]);

      // Track search event if there's a search query
      if (reset && effectiveSearch && effectiveSearch.trim()) {
        analyticsAPI.track('search', {
          additional_data: { query: effectiveSearch.trim() },
          page_url: window.location.pathname + window.location.search
        }).catch(err => console.error('Analytics tracking failed:', err));
      }
    } catch (error) {
      console.error('Failed to fetch cheat sheets:', error);
      if (reset) setCheatSheets([]);
      if (error.code === 'ECONNABORTED') {
        toast.error(t('home.errors.requestTimeout'));
      } else if (!error.response) {
        toast.error(t('home.errors.connectionError'));
      }
    } finally {
      if (reset) setLoading(false); else setLoadingMore(false);
    }
  };

  const hasMore = cheatSheets.length < total;

  // Load the next page when the sentinel scrolls near the viewport.
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchCheatSheets();
      }
    }, { rootMargin: '600px' });

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, cheatSheets.length]);

  // Purchased items are excluded from the browse grid — they're reachable
  // via the MyLibraryShelf teaser and the full /my-purchases page instead.
  const unpurchasedSheets = cheatSheets.filter(sheet => !sheet.is_purchased);
  // During a search, owned hits would otherwise just vanish, so the library
  // shelf narrows to them instead. null = not searching (or still loading).
  const librarySearchMatches = search.trim() && !loading
    ? new Set(cheatSheets.filter(sheet => sheet.is_purchased).map(sheet => sheet.cheatsheet_id))
    : null;

  // Mobile search field: writes q to the URL, which the sync effect above
  // turns into a fetch. Like the navbar palette, a search widens to all
  // years so a profile-defaulted year filter doesn't hide results.
  const commitSearch = (value) => {
    const term = value.trim();
    if (term === (searchParams.get('q') || '')) return;
    const params = Object.fromEntries(searchParams.entries());
    if (term) {
      params.q = term;
      params.year = 'all';
    } else {
      delete params.q;
    }
    setSearchParams(params, { replace: true });
  };

  // Keep the field in step when q changes elsewhere (navbar palette, back button).
  useEffect(() => {
    const q = searchParams.get('q') || '';
    // Compare trimmed so a pause after typing a space doesn't eat the space.
    setSearchInput(prev => (prev.trim() === q ? prev : q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('q')]);

  const handleYearChange = (newYear) => {
    setYearFilter(newYear);

    // The profile-default year (e.g. Year 4 on a fresh load) is never put in
    // the URL, so picking "All" then leaves the URL unchanged and the
    // URL-sync effect above never refetches. Fetch directly in that case.
    if ((searchParams.get('year') || 'all') === newYear) {
      fetchCheatSheets({ reset: true, yearOverride: newYear });
      return;
    }

    const params = Object.fromEntries(searchParams.entries());
    if (newYear === 'all') {
      delete params.year;
    } else {
      params.year = newYear;
    }
    setSearchParams(params, { replace: true });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const params = Object.fromEntries(searchParams.entries());
    if (newSort === 'relevance') {
      delete params.sort;
    } else {
      params.sort = newSort;
    }
    setSearchParams(params, { replace: true });
  };

  // Tailored to why the list is empty: a search, a year filter, or an
  // institution nobody has uploaded to yet.
  const renderEmptyState = () => {
    const query = search.trim();
    if (query) {
      return (
        <EmptyState
          seed={`empty-search-${query}`}
          title={t('home.empty.searchTitle', { query })}
          body={t('home.empty.searchBody')}
          actions={(
            <>
              <EmptyStateButton $primary onClick={() => { setSearchInput(''); commitSearch(''); }}>{t('home.empty.clearSearch')}</EmptyStateButton>
              {yearFilter !== 'all' && (
                <EmptyStateButton onClick={() => handleYearChange('all')}>{t('home.empty.allYears')}</EmptyStateButton>
              )}
            </>
          )}
        />
      );
    }

    if (yearFilter !== 'all') {
      return (
        <EmptyState
          seed={`empty-year-${yearFilter}`}
          title={t('home.empty.yearTitle', { year: yearFilter })}
          body={t('home.empty.yearBody')}
          actions={<EmptyStateButton $primary onClick={() => handleYearChange('all')}>{t('home.empty.allYears')}</EmptyStateButton>}
        />
      );
    }

    const institutionName = selectedInstitutionData?.short_name || selectedInstitutionData?.name;
    return (
      <EmptyState
        seed={`empty-institution-${selectedInstitution}`}
        title={institutionName ? t('home.empty.institutionTitle', { name: institutionName }) : t('home.noCheatSheetsFound')}
        body={t('home.empty.institutionBody')}
        actions={(
          <>
            <EmptyStateButton $primary onClick={() => navigate(canUpload ? '/admin/upload' : '/apply-seller')}>
              {canUpload ? t('home.empty.upload') : t('home.empty.becomeSeller')}
            </EmptyStateButton>
            {selectedInstitution !== 'all' && (
              <EmptyStateButton onClick={() => setSelectedInstitution('all')}>{t('home.empty.allInstitutions')}</EmptyStateButton>
            )}
          </>
        )}
      />
    );
  };

  const handleCardClick = React.useCallback((id) => {
    navigate(`/cheatsheet/${id}`);
  }, [navigate]);

  return (
    <>
      {/* Full-bleed, outside Container's max-width, directly under the navbar. */}
      <InstitutionViewingBanner />
    <Container>
      <AnnouncementBanner />

      <StudyProfilePrompt />

      {/* Exams are per institution, so a mixed "All Institutions" list isn't
          useful, and during a search the results matter more, so it steps
          aside until the search is cleared. Collapsible fades it out instead
          of popping it away. */}
      <Collapsible open={selectedInstitution !== 'all' && !search.trim()} onCollapsed={handleExamsCollapsed}>
        <UpcomingExamsCarousel
          yearFilter={yearFilter}
          institutionFilter={carouselInstitution}
          onCollapsed={handleExamsCollapsed}
        />
      </Collapsible>

      <BelowExams $landCount={landCount}>

      <MobileSearchField
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commitSearch(searchInput);
          e.currentTarget.querySelector('input')?.blur();
        }}
      >
        <Search size={16} />
        <MobileSearchInput
          type="search"
          enterKeyHint="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('nav.searchPlaceholder')}
          aria-label={t('nav.openSearch')}
        />
        {searchInput && (
          <ClearSearchButton type="button" onClick={() => { setSearchInput(''); commitSearch(''); }} aria-label={t('nav.clearSearch')}>
            <X size={16} />
          </ClearSearchButton>
        )}
      </MobileSearchField>

      <MyLibraryShelf searchMatches={librarySearchMatches} />

      <FilterBar>
        <YearPills>
          {YEAR_OPTIONS.map((opt) => {
            const isActive = yearFilter === opt.value;
            // Unselected pills go compact on mobile ("1" instead of "Year 1")
            // so all five fit on one row instead of Year 4 wrapping onto its
            // own line — the active one still shows its full label.
            const useShort = isMobile && !isActive && opt.shortLabelKey;
            return (
              <YearPill
                key={opt.value}
                $active={isActive}
                onClick={() => handleYearChange(opt.value)}
              >
                {t(useShort ? opt.shortLabelKey : opt.labelKey)}
              </YearPill>
            );
          })}
        </YearPills>
        <SortSelect aria-label={t('home.sortBy')} value={sort} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="relevance">{t('home.sortRelevance')}</option>
          <option value="newest">{t('home.sortNewest')}</option>
          <option value="popular">{t('home.sortPopular')}</option>
          <option value="price_low">{t('home.sortPriceLow')}</option>
          <option value="price_high">{t('home.sortPriceHigh')}</option>
          <option value="rating">{t('home.sortRating')}</option>
        </SortSelect>
      </FilterBar>

      {loading ? (
        <>
          <SectionHeader>{t('home.availableCheatSheets')}</SectionHeader>
          <CardGridSkeleton />
        </>
      ) : cheatSheets.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Available Cheat Sheets Section */}
          {unpurchasedSheets.length > 0 && (
            <>
              <SectionHeader>{t('home.availableCheatSheets')}</SectionHeader>
              <Grid>
                {unpurchasedSheets.map((sheet) => (
                  <CheatSheetCard
                    key={sheet.cheatsheet_id}
                    sheet={sheet}
                    showInstitution={selectedInstitution === 'all'}
                    onClick={() => handleCardClick(sheet.cheatsheet_id)}
                  />
                ))}
              </Grid>
            </>
          )}

          {/* Everything matching is already owned (owned sheets are hidden
              from this grid), e.g. the only Year 3 sheet was a free one you
              saved. Say so instead of showing a blank page. */}
          {unpurchasedSheets.length === 0 && !hasMore && (
            <EmptyState
              seed={`empty-owned-${selectedInstitution}-${yearFilter}`}
              title={t('home.empty.allOwnedTitle')}
              body={t('home.empty.allOwnedBody', { count: cheatSheets.length })}
              actions={(
                <>
                  <EmptyStateButton $primary onClick={() => navigate('/my-purchases')}>{t('home.empty.openLibrary')}</EmptyStateButton>
                  {yearFilter !== 'all' ? (
                    <EmptyStateButton onClick={() => handleYearChange('all')}>{t('home.empty.allYears')}</EmptyStateButton>
                  ) : selectedInstitution !== 'all' ? (
                    <EmptyStateButton onClick={() => setSelectedInstitution('all')}>{t('home.empty.allInstitutions')}</EmptyStateButton>
                  ) : null}
                </>
              )}
            />
          )}

          {hasMore && (
            <LoadMoreSentinel ref={sentinelRef}>
              <LoadMoreButton onClick={() => fetchCheatSheets()} disabled={loadingMore}>
                {loadingMore ? t('home.loadingMore') : t('home.loadMore')}
              </LoadMoreButton>
            </LoadMoreSentinel>
          )}
        </>
      )}
      </BelowExams>
    </Container>
    </>
  );
};

export default Home;
