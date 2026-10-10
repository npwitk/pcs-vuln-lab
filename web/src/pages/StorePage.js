import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { storesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CheatSheetCard from '../components/CheatSheetCard';
import Button from '../components/ui/Button';

const Container = styled.div`
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Banner = styled.div`
  width: 100%;
  // Half the previous height on desktop (was 16 / 5) — at 1440px that's
  // ~225px instead of ~450px, so the store's actual content starts above
  // the fold. Mobile keeps its taller crop, where the banner is the only
  // thing establishing the store's identity on a narrow screen.
  aspect-ratio: 32 / 5;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover no-repeat`
    : `linear-gradient(135deg, ${props.theme.colors.primary} 0%, ${props.theme.colors.primaryLight} 100%)`};

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`;

const HeaderSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

// Nothing overlaps the banner any more. The title used to be bottom-anchored
// against the icon and pulled up over the artwork, which meant a store with
// a long enough name to wrap pushed its own title deeper into the image —
// the more there was to read, the harder it was to read. Rather than paper
// over that with a scrim (the title is dark text, so a scrim would have to
// wash the artwork toward white), the whole header now sits on the page
// background below the banner, icon and text centred against each other.
const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 1.25rem;
  }
`;

const Icon = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid ${props => props.theme.colors.background};
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: ${props => props.theme.shadows.md};
`;

const IconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeaderText = styled.div`
  min-width: 0;
`;

const StoreName = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin: 0 0 0.25rem 0;
`;

const StoreDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  max-width: 700px;
  margin: 0 0 1.5rem 0;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

// Replaces the old row of per-member avatar chips: the store is the brand
// here, not the individual people behind it, so this is just a count.
const StoreMeta = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 1.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Closes off the list so the page doesn't just stop — and gives a way out
// of the store back into the full catalogue.
const EndOfList = styled.div`
  text-align: center;
  padding: 2.5rem 1rem 3.5rem;
  margin-top: 2.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const EndOfListText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  margin: 0 0 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.lg};
  margin-bottom: 3rem;
`;

const NotFoundState = styled.div`
  text-align: center;
  padding: 6rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const StorePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [members, setMembers] = useState([]);
  const [cheatSheets, setCheatSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchStore = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const response = await storesAPI.getBySlug(slug);
      setStore(response.data.store);
      setMembers(response.data.members || []);
      setCheatSheets(response.data.cheat_sheets || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        console.error('Failed to fetch flagship store:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (notFound || !store) {
    return (
      <Container>
        <NotFoundState>
          <h2>Store not found</h2>
          <p>This flagship store doesn't exist or is no longer active.</p>
        </NotFoundState>
      </Container>
    );
  }

  return (
    <Container>
      <Banner $image={store.banner_image_path} />

      <HeaderSection>
        <HeaderRow>
          <Icon>
            {store.icon_image_path ? (
              <IconImage src={store.icon_image_path} alt={store.name} />
            ) : (
              store.name.charAt(0).toUpperCase()
            )}
          </Icon>
          <HeaderText>
            <StoreName>{store.name}</StoreName>
            <StoreMeta>
              {[
                members.length > 0 && `${members.length} ${members.length === 1 ? 'member' : 'members'}`,
                `${cheatSheets.length} ${cheatSheets.length === 1 ? 'cheat sheet' : 'cheat sheets'}`,
              ].filter(Boolean).join(' · ')}
            </StoreMeta>
          </HeaderText>
        </HeaderRow>

        {store.description && <StoreDescription>{store.description}</StoreDescription>}

        <SectionTitle>Cheat Sheets</SectionTitle>

        {cheatSheets.length === 0 ? (
          <EmptyState>This store hasn't published any cheat sheets yet.</EmptyState>
        ) : (
          <>
            <Grid>
              {cheatSheets.map(sheet => (
                <CheatSheetCard
                  key={sheet.cheatsheet_id}
                  sheet={sheet}
                  showCreator={false}
                  onClick={() => navigate(`/cheatsheet/${sheet.cheatsheet_id}`)}
                />
              ))}
            </Grid>

            <EndOfList>
              <EndOfListText>
                That's everything from {store.name}.
              </EndOfListText>
              <Button type="button" $variant="secondary" $size="sm" onClick={() => navigate('/')}>
                Browse all cheat sheets
              </Button>
            </EndOfList>
          </>
        )}
      </HeaderSection>
    </Container>
  );
};

export default StorePage;
