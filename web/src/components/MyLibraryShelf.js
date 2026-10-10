import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { purchasesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { meshGradient } from '../utils/meshGradient';

const SHELF_LIMIT = 6;

const ShelfWrapper = styled.div`
  margin-bottom: 2rem;
  background: ${props => props.theme.colors.surface};
  border: ${props => props.$highlight
    ? `1.5px solid ${props.theme.colors.primary}`
    : `1px solid ${props.theme.colors.border}`};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem 1.5rem;
`;

const ShelfHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ShelfTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;

  span {
    color: ${props => props.theme.colors.textSecondary};
    font-weight: ${props => props.theme.typography.weights.medium};
  }
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const ShelfScroll = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tile = styled.div`
  min-width: 150px;
  max-width: 150px;
  cursor: pointer;
  border-radius: ${props => props.theme.radius.md};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const TileImageWrap = styled.div`
  width: 100%;
  height: 90px;
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.theme.colors.borderLight};
  margin-bottom: 0.5rem;
`;

const TileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
`;

const TileCourseCode = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  text-transform: uppercase;
  margin-bottom: 0.15rem;
`;

const TileTitle = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.text};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const handleImageError = (e) => {
  e.target.style.display = 'none';
  const placeholder = e.target.nextSibling;
  if (placeholder) placeholder.style.display = 'flex';
};

// Compact "recently purchased" teaser. Fetches independently from the
// dedicated purchases endpoint (not the paginated browse feed), so it always
// shows the real most-recent purchases regardless of how much of the browse
// grid has loaded. Full management (download, re-download on file update)
// stays on the dedicated /my-purchases page this links out to.
// `searchMatches` (a Set of cheatsheet_ids, or null) narrows the shelf to the
// owned sheets that match the current browse search.
const MyLibraryShelf = ({ searchMatches = null }) => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    // /api/purchases/my deliberately returns every purchase regardless of
    // payment_status (pending/failed/refunded included) for the full
    // transaction-history page at /my-purchases. This shelf represents
    // what the user actually owns, so only "paid" orders count here.
    purchasesAPI.getMyPurchases()
      .then(res => setPurchases((res.data.purchases || []).filter(p => p.payment_status === 'paid')))
      .catch(() => setPurchases([]))
      .finally(() => setLoaded(true));
  }, [isAuthenticated]);

  if (!isAuthenticated || !loaded || purchases.length === 0) {
    return null;
  }

  const searching = searchMatches !== null;
  const matched = searching ? purchases.filter(p => searchMatches.has(p.cheatsheet_id)) : [];
  if (searching && matched.length === 0) {
    return null;
  }

  const recent = searching ? matched : purchases.slice(0, SHELF_LIMIT);

  return (
    <ShelfWrapper $highlight={searching}>
      <ShelfHeader>
        <ShelfTitle>
          {t('myLibrary.title')}{' '}
          <span>{searching ? `· ${t('myLibrary.searchMatches', { count: matched.length })}` : `(${purchases.length})`}</span>
        </ShelfTitle>
        <ViewAllLink to="/my-purchases">
          {t('myLibrary.viewAll')} <ChevronRight size={16} />
        </ViewAllLink>
      </ShelfHeader>
      <ShelfScroll>
        {recent.map(purchase => (
          <Tile
            key={purchase.order_id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/cheatsheet/${purchase.cheatsheet_id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/cheatsheet/${purchase.cheatsheet_id}`);
              }
            }}
          >
            <TileImageWrap>
              {purchase.preview_image_path && purchase.preview_image_path.startsWith('http') ? (
                <TileImage
                  src={purchase.preview_image_path}
                  alt={purchase.title}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              ) : null}
              {(!purchase.preview_image_path || !purchase.preview_image_path.startsWith('http')) && (
                <TilePlaceholder style={{ background: meshGradient(`sheet-${purchase.cheatsheet_id}`) }}>{purchase.course_code}</TilePlaceholder>
              )}
            </TileImageWrap>
            <TileCourseCode>{purchase.course_code}</TileCourseCode>
            <TileTitle>{purchase.title}</TileTitle>
          </Tile>
        ))}
      </ShelfScroll>
    </ShelfWrapper>
  );
};

export default MyLibraryShelf;
