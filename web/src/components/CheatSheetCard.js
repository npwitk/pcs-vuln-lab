import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { StarIcon, EyeIcon, CartIcon } from './Icons';
import { Printer, Lock } from 'lucide-react';
import { stripMarkdown } from '../utils/stripMarkdown';
import AvatarStack from './AvatarStack';
import { meshGradient } from '../utils/meshGradient';
import { resolveLogoUrl } from '../utils/resolveLogoUrl';
import ExamTypesPill from './ExamTypesPill';

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  border: 1px solid ${props => props.theme.colors.border};
  transition: transform ${props => props.theme.transitions.normal},
              box-shadow ${props => props.theme.transitions.normal},
              border-color ${props => props.theme.transitions.normal};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
    border-color: ${props => props.theme.colors.primary};
  }

  &:hover img {
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

const BadgeStack = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
`;

const PurchasedBadge = styled.div`
  background: ${props => props.theme.colors.success};
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: ${props => props.theme.typography.weights.bold};
  box-shadow: ${props => props.theme.shadows.md};
`;

const PillBadge = styled.div`
  background: ${props => props.$variant === 'new' ? props.theme.colors.accent : '#f59e0b'};
  color: white;
  padding: 0.3rem 0.65rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: ${props => props.theme.shadows.md};
`;

const SponsoredBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #1a1a1a;
  padding: 0.375rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const InstitutionRestrictedBadge = styled.div`
  background: rgba(31, 41, 55, 0.85);
  color: white;
  padding: 0.3rem 0.65rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: ${props => props.theme.shadows.md};
`;

const PreviewImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
`;

const NoPreviewPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes['4xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: 0.05em;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
`;

const CardContent = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CourseCode = styled.span`
  display: inline-block;
  white-space: nowrap;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

// The creator avatar stays pinned right on the tag row; only the tags on
// the left wrap if a narrow card can't fit them.
const TagsContainer = styled.div`
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: space-between;

  & > :not(:first-child) {
    flex-shrink: 0;
  }
`;

// Institution logo before the course code (course codes only mean something
// alongside their school). Shown when browsing All Institutions.
// Same height as the course-code and exam-type pills beside it: 12px text at
// the body line-height of 1.5 (18px) plus 12px of vertical padding (the exam
// pill is 10px padding + 2px border). A fixed height, not align-self:
// stretch, because a stretched <img> at height:100% feeds its own intrinsic
// size back into the row height and balloons the whole row.
// It stays mounted and collapses (width 0, cancelled row gap, faded, nudged
// left) when hidden, so toggling All Institutions slides it in and out.
const TAG_HEIGHT = '30px';
const markIn = keyframes`
  from { max-width: 0; margin-right: -0.5rem; opacity: 0; transform: translateX(-10px); }
  to { max-width: 96px; margin-right: 0; opacity: 1; transform: translateX(0); }
`;

const InstitutionMarkWrap = styled.span`
  position: relative;
  display: flex;
  height: ${TAG_HEIGHT};
  flex-shrink: 0;
  overflow: hidden;
  max-width: ${props => (props.$visible ? '96px' : '0px')};
  margin-right: ${props => (props.$visible ? '0' : '-0.5rem')};
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: translateX(${props => (props.$visible ? '0' : '-10px')});
  transition:
    max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    margin-right 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
  /* Switching to All Institutions reloads the list, so cards usually mount
     already visible; the same slide-in then runs as an entrance animation. */
  ${props => props.$visible && css`
    animation: ${markIn} 0.4s cubic-bezier(0.34, 1.3, 0.64, 1) both;
  `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    animation: none;
  }
`;

const InstitutionLogo = styled.img`
  width: ${TAG_HEIGHT};
  height: ${TAG_HEIGHT};
  padding: 3px;
  box-sizing: border-box;
  object-fit: contain;
  border-radius: 8px;
  /* Logos are drawn for light backgrounds, so keep a white tile in dark mode. */
  background: #fff;
  border: 1px solid ${props => props.theme.colors.border};
`;

const InstitutionChip = styled.span`
  display: inline-flex;
  align-items: center;
  height: ${TAG_HEIGHT};
  box-sizing: border-box;
  padding: 0 0.6rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.02em;
  white-space: nowrap;
`;

// Institution-only sheets: a tiny lock on the mark instead of a separate
// "Institution only" badge on the cover.
const InstitutionLock = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: #fff;
  border: 1.5px solid ${props => props.theme.colors.surface};
`;

const InstitutionMark = ({ sheet, restrictedLabel, visible }) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = resolveLogoUrl(sheet.institution_logo_filename);
  const title = sheet.institution_restricted
    ? `${sheet.institution_name || sheet.institution_short_name} · ${restrictedLabel}`
    : (sheet.institution_name || sheet.institution_short_name);

  if (!logoUrl && !sheet.institution_short_name) return null;

  return (
    <InstitutionMarkWrap $visible={visible} title={visible ? title : undefined} aria-hidden={!visible}>
      {logoUrl && !logoFailed ? (
        <InstitutionLogo src={logoUrl} alt={sheet.institution_short_name || ''} loading="lazy" onError={() => setLogoFailed(true)} />
      ) : (
        <InstitutionChip>{sheet.institution_short_name}</InstitutionChip>
      )}
      {!!sheet.institution_restricted && (
        <InstitutionLock aria-label={restrictedLabel}><Lock size={8} strokeWidth={3} /></InstitutionLock>
      )}
    </InstitutionMarkWrap>
  );
};

// Takes all the room beside the avatar, so ExamTypesPill can tell whether
// "Midterm + Final" fits or it should say "Mid + Final".
const TagsLeft = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  min-width: 0;
`;

const MetaTag = styled.span`
  display: inline-block;
  white-space: nowrap;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  /* The border is what separates it from the card in dark mode, where
     backgroundSecondary and surface are the same colour. */
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.3125rem 0.8125rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const ProfilePicture = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const ProfilePlaceholder = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  border: 2px solid ${props => props.theme.colors.border};
`;

const CheatSheetTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.lg};
  margin: 0.5rem 0;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  line-height: ${props => props.theme.typography.lineHeights.tight};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  margin-top: auto;
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.primary};
  letter-spacing: -0.01em;
`;

const Stats = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

// Pre-order "releases on <date>" line — theme-aware amber so it stays
// legible on the dark background (was a hardcoded #92400e at ~2:1).
const PreOrderNotice = styled.div`
  font-size: 0.7rem;
  margin-top: 2px;
  color: ${props => props.theme.colors.warningText};
`;

const PrintPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.$open
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : '#dcfce7')
    : (props.theme.mode === 'dark' ? 'rgba(251,191,36,0.15)' : '#fef3c7')};
  color: ${props => props.$open ? '#16a34a' : props.theme.colors.warningText};
  border: 1px solid ${props => props.$open ? '#86efac' : '#fcd34d'};
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 0.5rem;
  width: fit-content;
`;

const isRecent = (createdAt) => {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < NEW_WINDOW_MS;
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
  const placeholder = e.target.nextSibling;
  if (placeholder) placeholder.style.display = 'flex';
};

/**
 * Shared cheat sheet card used by the home browse grid, a seller's store
 * page, and the My Library shelf. `sheet` fields are all read defensively
 * (optional chaining / falsy checks) since different list endpoints return
 * different subsets of columns.
 */
const CheatSheetCard = ({ sheet, isPurchased = false, showCreator = true, showInstitution = false, onClick }) => {
  const { t } = useTranslation();
  const showNewBadge = !isPurchased && isRecent(sheet.created_at);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <BadgeStack>
        {isPurchased && <PurchasedBadge>✓</PurchasedBadge>}
        {!!sheet.is_pre_order && <PillBadge $variant="preorder">{parseFloat(sheet.price || 0) === 0 ? t('cheatSheetCard.comingSoon') : t('cheatSheetCard.preOrder')}</PillBadge>}
        {showNewBadge && <PillBadge $variant="new">{t('cheatSheetCard.new')}</PillBadge>}
        {!!sheet.institution_restricted && !showInstitution && <InstitutionRestrictedBadge>{t('cheatSheetCard.institutionRestricted')}</InstitutionRestrictedBadge>}
      </BadgeStack>
      {!!sheet.is_sponsored && <SponsoredBadge>{t('cheatSheetCard.sponsored')}</SponsoredBadge>}
      <PreviewImageContainer>
        {sheet.preview_image_path && sheet.preview_image_path.startsWith('http') ? (
          <PreviewImage
            src={sheet.preview_image_path}
            alt={sheet.title}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : null}
        {(!sheet.preview_image_path || !sheet.preview_image_path.startsWith('http')) && (
          <NoPreviewPlaceholder style={{ background: meshGradient(`sheet-${sheet.cheatsheet_id}`) }}>{sheet.course_code}</NoPreviewPlaceholder>
        )}
      </PreviewImageContainer>
      <CardContent>
        <TagsContainer>
          <TagsLeft>
            <InstitutionMark sheet={sheet} visible={showInstitution} restrictedLabel={t('cheatSheetCard.institutionRestricted')} />
            <CourseCode>{sheet.course_code}</CourseCode>
            <ExamTypesPill sheet={sheet} pill={MetaTag} />
          </TagsLeft>
          {showCreator && (
            sheet.collaborators?.length > 0 ? (
              <AvatarStack
                people={[
                  { name: sheet.creator_name || t('cheatSheetCard.uploader'), avatar_url: sheet.creator_avatar },
                  ...sheet.collaborators
                ]}
                size={32}
              />
            ) : sheet.creator_avatar ? (
              <ProfilePicture
                src={sheet.creator_avatar}
                alt={sheet.creator_name || t('cheatSheetCard.uploader')}
                title={sheet.creator_name || t('cheatSheetCard.uploader')}
              />
            ) : (
              <ProfilePlaceholder title={sheet.creator_name || t('cheatSheetCard.uploader')}>
                {(sheet.creator_name || 'U').charAt(0).toUpperCase()}
              </ProfilePlaceholder>
            )
          )}
        </TagsContainer>
        <CheatSheetTitle>{sheet.title}</CheatSheetTitle>
        {!!sheet.has_print_service && (
          <PrintPill $open={!!sheet.print_accepting_requests}>
            <Printer size={10} />
            {sheet.print_accepting_requests ? t('cheatSheetCard.printAvailable') : t('cheatSheetCard.printingClosed')}
          </PrintPill>
        )}
        <Description>{stripMarkdown(sheet.description)}</Description>
        <CardFooter>
          <div>
            <Price>
              {parseFloat(sheet.price || 0) === 0 ? t('common.free') : `${parseFloat(sheet.price).toFixed(2)} ฿`}
            </Price>
            {sheet.is_pre_order && sheet.release_at && (
              <PreOrderNotice>
                {t('cheatSheetCard.releases', {
                  date: new Date(sheet.release_at).toLocaleDateString('en-GB', {
                    timeZone: 'Asia/Bangkok',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                })}
              </PreOrderNotice>
            )}
          </div>
          <Stats>
            <span>
              <StarIcon size={14} /> {parseFloat(sheet.average_rating || 0).toFixed(1)}
              {sheet.review_count > 0 ? ` (${sheet.review_count})` : ''}
            </span>
            <span><EyeIcon size={14} /> {sheet.view_count}</span>
            <span><CartIcon size={14} /> {sheet.purchase_count}</span>
          </Stats>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default CheatSheetCard;
