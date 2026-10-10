import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StarIcon, EyeIcon, CartIcon, UploadIcon, MapPinIcon, ClockIcon } from './Icons';
import { upcomingExamsAPI, cheatSheetsAPI } from '../services/api';
import AvatarStack from './AvatarStack';
import { meshGradient } from '../utils/meshGradient';
import { TextMorph } from 'torph/react';
import { love } from 'blobatar/expression';
import { useAuth } from '../context/AuthContext';
import { stripMarkdown } from '../utils/stripMarkdown';
import GazingMascot from './GazingMascot';
import Collapsible from './Collapsible';
import useIsMobile from '../hooks/useIsMobile';
import { coversExamType } from '../utils/examTypes';
import ExamTypesPill from './ExamTypesPill';
import { pickUpcomingExams } from '../utils/upcomingExams';

const ribbonShimmer = keyframes`
  from { background-position: 0% 0%; }
  to { background-position: -200% 0%; }
`;

const fadeSwapIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Room around the section for its shadow (theme shadows.md: 12px blur, 4px
// down) while Collapsible clips during the bounce; 16px is the page gutter.
const SHADOW_ROOM = 16;

const FeaturedSection = styled.div`
  margin: 0 0 2.5rem 0;
  padding: 2.5rem;
  background: linear-gradient(135deg, ${props => props.theme.colors.primaryLight} 0%, ${props => props.theme.colors.backgroundSecondary} 100%);
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.xl};
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  /* Own stacking context, so MeshWash's z-index: -1 paints above this
     background but below all content. */
  isolation: isolate;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    // A wider gradient than the strip itself, animated by shifting its
    // background-position, gives a continuous shimmer sweeping across —
    // rather than the flat, static bar this used to be.
    background: linear-gradient(90deg,
      ${props => props.theme.colors.primary} 0%,
      ${props => props.theme.colors.warning} 25%,
      ${props => props.theme.colors.primary} 50%,
      ${props => props.theme.colors.warning} 75%,
      ${props => props.theme.colors.primary} 100%
    );
    background-size: 200% 100%;

    @media (prefers-reduced-motion: no-preference) {
      animation: ${ribbonShimmer} 4s linear infinite;
    }
  }

  @media (max-width: 768px) {
    margin: 0 0 2rem 0;
    padding: 2rem 1.5rem;
  }
`;

// Soft mesh-gradient wash behind the section, seeded by the exam being
// shown so each exam gets its own colours; keyed in JSX so it fades in
// when the user steps to another exam.
const MeshWash = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  /* Fades to opacity 1, its resting value. Dark mode is dimmed through the
     gradient's alpha instead of opacity, or the fade would end at 1 and then
     snap down to the dimmer resting opacity. */
  animation: ${fadeSwapIn} 0.5s ease-out;
`;

const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;

  @media (min-width: 769px) {
    text-align: left;
  }
`;

const fadeSwap = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ExamContent = styled.div``;

// torph's TextMorph forces white-space: nowrap on its wrapping span (its own
// injected global CSS, targeting an internal [torph-root] attribute selector
// this app never overrides), so a long course name has no way to wrap on a
// narrow screen — it just overflows instead. Below the mobile breakpoint,
// skip the morph animation entirely and render plain text so it wraps
// normally; desktop keeps the exact existing morph behavior.
const ResponsiveMorphText = ({ children }) => {
  const isMobile = useIsMobile();
  return isMobile ? <>{children}</> : <TextMorph>{children}</TextMorph>;
};

const NavigationContainer = styled.div`
  display: none;

  @media (min-width: 769px) {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: flex-start;
    margin-top: 0.75rem;
  }
`;

const NavButton = styled.button`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.disabled ? props.theme.colors.borderLight : props.theme.colors.primary};
  color: ${props => props.disabled ? props.theme.colors.textTertiary : props.theme.colors.primary};
  width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.radius.md};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.bold};
  transition: all ${props => props.theme.transitions.fast};
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// Mobile's own prev/next control: unlike NavigationContainer (a below-content
// row, desktop-only), this sits right beside the exam-type label itself
// (‹ MIDTERM EXAM ›) — the label's already the first thing read on mobile, so
// the arrows are immediately next to what they're paging through, no
// swipe/overlay needed.
const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;

  @media (min-width: 769px) {
    justify-content: flex-start;
  }
`;

const InlineNavButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    // Matches SectionLabel's own rendered height (0.75rem text + 0.5rem
    // vertical padding) so the row reads as one aligned unit: ‹ pill ›.
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid ${props => props.disabled ? props.theme.colors.borderLight : props.theme.colors.primary};
    background: ${props => props.theme.colors.surface};
    color: ${props => props.disabled ? props.theme.colors.textTertiary : props.theme.colors.primary};
    font-size: ${props => props.theme.typography.sizes.base};
    font-weight: ${props => props.theme.typography.weights.bold};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    opacity: ${props => props.disabled ? 0.5 : 1};
    transition: transform 0.15s ease;

    &:active:not(:disabled) {
      transform: scale(0.92);
    }
  }
`;

const ExamCounter = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

const SectionLabel = styled.div`
  display: inline-block;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  // 0 when nested in LabelRow — LabelRow carries the spacing before Title
  // itself there, since an asymmetric margin here (only on the bottom) would
  // make flex's align-items: center vertically center this pill's taller
  // margin box instead of its actual content, throwing it out of line with
  // the arrow buttons beside it.
  margin-bottom: ${props => props.$inRow ? 0 : '1rem'};
  box-shadow: 0 2px 8px rgba(174, 92, 42, 0.25);
  backdrop-filter: blur(10px);
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.sizes['2xl']};
  }
`;

// "(Year 2)" after the course name when every year level is shown.
const TitleYear = styled.span`
  margin-left: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.regular};
  letter-spacing: normal;
  color: ${props => props.theme.colors.textSecondary};
  white-space: nowrap;
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem 1.25rem;
  flex-wrap: wrap;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.medium};

  @media (max-width: 768px) {
    justify-content: center;
  }

  @media (min-width: 769px) {
    justify-content: flex-start;
  }
`;

// One fact in the info row (course code, date, room). Items are separated by
// the row's gap and led by their own icon, not by bullet characters.
const InfoItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  /* Between text and textSecondary: easier to read than the row's grey, but
     softer than the near-black/near-white course code. */
  color: ${props => props.theme.mode === 'dark' ? '#D1D1D6' : '#3A3A3C'};

  svg {
    flex-shrink: 0;
    color: ${props => props.theme.colors.primary};
  }
`;

const CourseCodeText = styled.span`
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
`;

// Countdown pill colours: green a week or more out, orange inside a week, red
// inside two days. Orange is a true orange (systemOrange) with dark text,
// since a deep enough orange for white text reads as red next to `urgent`.
// Every pair is 4.5:1 or better.
const COUNTDOWN_TONES = {
  calm: { background: '#228539', text: '#FFFFFF' },   // 4.7:1
  soon: { background: '#FF9500', text: '#1D1D1F' },   // 7.7:1
  urgent: { background: '#D70015', text: '#FFFFFF' }, // 5.4:1
};

// Solid pill in the tone colour; the numbers carry the weight and size, the
// units and "left" stay small and slightly faded.
const Countdown = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;
  padding: 0.375rem 0.875rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => COUNTDOWN_TONES[props.$tone].background};
  color: ${props => COUNTDOWN_TONES[props.$tone].text};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const CountdownValue = styled.span`
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: -0.01em;
`;

const CountdownUnit = styled.span`
  margin-left: 0.05rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
  opacity: 0.85;
`;

const ScrollContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1rem;
  margin: 0 -2.5rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  animation: ${fadeSwap} 150ms ease-out;

  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    margin: 0 -1.5rem;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    gap: 1rem;
  }
`;

const Card = styled.div`
  min-width: 300px;
  max-width: 300px;
  // A hard height (not min-height) matching SkeletonCard/EmptyCard exactly —
  // min-height was only a floor, and with CheatSheetTitle now clamped to one
  // line this is never exceeded in practice; overflow: hidden below is a
  // safety net for the rare case it still is, rather than the load-bearing
  // clip it would have been against unclamped content.
  height: 440px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 2px solid ${props => props.theme.colors.border};
  transition: border-color 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 280px;
  }
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

// Mirrors ScrollContainer's own padding-bottom: 1rem (the populated/skeleton
// states' wrapper) so useHeightAnimation's wrapper.scrollHeight measurement
// includes the same extra space in every state — without this, the empty
// state (which isn't wrapped in ScrollContainer, since it's a single
// full-width block rather than a horizontally-scrolling row) measured 1rem
// shorter than the other two despite EmptyCard's own height matching Card's.
const EmptyStateRow = styled.div`
  padding-bottom: 1rem;
`;

// Unlike the populated/skeleton states (a horizontally-scrolling row of
// fixed-width cards), the empty state is a single block, so it fills the
// section's full content width instead of sitting in a 300px card slot.
// height is a hard 440px at every breakpoint — matching Card/SkeletonCard
// exactly (neither of those changes height on mobile either) so swapping
// between populated/empty/loading never snaps the row's height.
// position: relative + overflow: hidden contain the absolutely-positioned
// scattered mascots (MascotField) so none of them can visually spill past
// the rounded dashed border.
const EmptyCard = styled.div`
  width: 100%;
  height: 440px;
  position: relative;
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.xl};
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  gap: 0.5rem;
  animation: ${fadeSwap} 150ms ease-out;
`;

// Decorative scattered mascots behind the message/button. pointer-events:
// none so they never intercept clicks meant for UploadCTAButton, even though
// their eyes still track the pointer globally regardless of this layer's
// own pointer-events (gaze reads window pointermove, not this element's).
const MascotField = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const EmptyContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

// Mascot positions for the empty card, as the mascot's CENTER in % of the
// card (x, y), so nothing gets clipped at the edges however wide the card
// is. Hand-placed so no two overlap and the centered message + button stay
// clear. Desktop: loose clusters on the left and right thirds, plus two
// small accents above/below the text. Mobile: the middle column is too
// narrow to flank, so fewer, smaller mascots sit in a top and bottom band.
const MASCOT_LAYOUT_DESKTOP = [
  { size: 60, x: 8, y: 18 },
  { size: 36, x: 19, y: 30 },
  { size: 78, x: 11, y: 58 },
  { size: 30, x: 22, y: 74 },
  { size: 46, x: 6, y: 86 },
  { size: 50, x: 91, y: 16 },
  { size: 32, x: 80, y: 26 },
  { size: 84, x: 88, y: 52 },
  { size: 38, x: 78, y: 76 },
  { size: 28, x: 94, y: 84 },
  { size: 30, x: 38, y: 12 },
  { size: 26, x: 63, y: 88 },
];

const MASCOT_LAYOUT_MOBILE = [
  { size: 40, x: 14, y: 12 },
  { size: 24, x: 60, y: 8 },
  { size: 28, x: 36, y: 22 },
  { size: 52, x: 80, y: 14 },
  { size: 48, x: 18, y: 86 },
  { size: 26, x: 44, y: 92 },
  { size: 34, x: 70, y: 80 },
  { size: 44, x: 88, y: 90 },
];

const pulse = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`;

const SkeletonBone = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.sm};
  animation: ${pulse} 1.6s ease-in-out infinite;
`;

const SkeletonCard = styled.div`
  min-width: 300px;
  max-width: 300px;
  // Matches Card/EmptyCard's height exactly (its bones already sum to
  // ~440px, so this is a literal-match consistency fix, not a visible
  // change) — without this the skeleton settles at whatever height its own
  // bones add up to, which could differ from a real card's, causing a snap.
  height: 440px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};
  overflow: hidden;
  border: 2px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    min-width: 280px;
    max-width: 280px;
  }
`;

const SkeletonImage = styled(SkeletonBone)`
  width: 100%;
  height: 200px;
  border-radius: 0;
`;

const SkeletonCardBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Mirrors CardFooter's border-top/padding-top/margin-top:auto so the
// skeleton's bottom bar sits in the same place a real Card's price+stats row
// would, instead of the skeleton just stopping short after the description.
const SkeletonCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  margin-top: auto;
`;

// Reuses ScrollContainer so the loading state is structurally identical to
// the populated/empty states — same flex row, same padding — rather than a
// differently-shaped placeholder.
const SkeletonCardRow = ({ count = 3 }) => (
  <ScrollContainer aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i}>
        <SkeletonImage />
        <SkeletonCardBody>
          <SkeletonBone style={{ width: '72px', height: '24px', borderRadius: '999px', marginBottom: '0.75rem' }} />
          <SkeletonBone style={{ width: '70%', height: '22px', marginBottom: '0.75rem' }} />
          <SkeletonBone style={{ width: '100%', height: '14px', marginBottom: '0.4rem' }} />
          <SkeletonBone style={{ width: '80%', height: '14px', marginBottom: '1rem' }} />
          <SkeletonCardFooter>
            <SkeletonBone style={{ width: '56px', height: '26px' }} />
            <SkeletonBone style={{ width: '90px', height: '14px' }} />
          </SkeletonCardFooter>
        </SkeletonCardBody>
      </SkeletonCard>
    ))}
  </ScrollContainer>
);

const UploadCTAButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

// Wraps whichever row/card-slot is showing and smooths the height transition
// when swapping between them. The populated row, the loading skeleton row,
// and the empty-state card slot are now all close to the same height (see
// EmptyCard/SkeletonCard above), so this only needs to smooth small
// differences, not paper over a dramatic size jump.
const HeightAnimatedWrapper = styled.div`
  overflow: hidden;
`;

function useHeightAnimation(swapKey) {
  const wrapperRef = useRef(null);
  const hasMountedRef = useRef(false);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;

    // First paint — nothing to animate from yet.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    const endHeight = wrapper.scrollHeight;
    // Read the box's live rendered height rather than remembering the last
    // target in a ref — if a previous swap's transition is still mid-flight
    // (e.g. someone clicks prev/next twice quickly), this picks up wherever
    // the box actually is right now instead of snapping back to its last
    // settled height before animating onward.
    const startHeight = wrapper.getBoundingClientRect().height;
    if (Math.round(startHeight) === endHeight) return undefined;

    wrapper.style.transition = 'none';
    wrapper.style.height = `${startHeight}px`;
    // Force a reflow so the browser registers the starting height as a real
    // style before the next line changes it — otherwise both assignments
    // collapse into one and there's nothing to transition between.
    // eslint-disable-next-line no-unused-expressions
    wrapper.offsetHeight;
    wrapper.style.transition = 'height 200ms ease';
    wrapper.style.height = `${endHeight}px`;

    const handleTransitionEnd = (e) => {
      if (e.propertyName !== 'height') return;
      wrapper.style.transition = '';
      wrapper.style.height = 'auto';
    };
    wrapper.addEventListener('transitionend', handleTransitionEnd);
    return () => wrapper.removeEventListener('transitionend', handleTransitionEnd);
  }, [swapKey]);

  return wrapperRef;
}

const computeCountdown = (examDate) => {
  const now = new Date();
  const diff = new Date(examDate) - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
};

// Owns its own 1s tick so the rest of the carousel (card images, scroll
// container) doesn't re-render every second along with it.
const CountdownTicker = ({ examDate }) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(() => computeCountdown(examDate));

  useEffect(() => {
    setCountdown(computeCountdown(examDate));
    const interval = setInterval(() => {
      setCountdown(computeCountdown(examDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [examDate]);

  if (!countdown) return null;

  // Hours and minutes are zero-padded once a larger unit leads, so the
  // numbers keep a steady width ("57d 09h 04m" rather than "57d 9h 4m").
  const pad = n => String(n).padStart(2, '0');
  const parts = [];
  if (countdown.days > 0) parts.push({ value: String(countdown.days), unit: 'd' });
  if (countdown.hours > 0 || countdown.days > 0) {
    parts.push({ value: countdown.days > 0 ? pad(countdown.hours) : String(countdown.hours), unit: 'h' });
  }
  parts.push({ value: parts.length ? pad(countdown.minutes) : String(countdown.minutes), unit: 'm' });

  const tone = countdown.days >= 7 ? 'calm' : countdown.days >= 2 ? 'soon' : 'urgent';

  // Split the translated sentence around the time so word order stays
  // per-locale ("{{time}} left" in English, "เหลือ {{time}}" in Thai).
  const [prefix, suffix] = t('upcomingExams.timeLeft', { time: '\u0000' }).split('\u0000');

  return (
    <Countdown $tone={tone}>
      {prefix && <CountdownUnit>{prefix.trim()}</CountdownUnit>}
      {parts.map(({ value, unit }) => (
        <span key={unit}>
          <CountdownValue><ResponsiveMorphText>{value}</ResponsiveMorphText></CountdownValue>
          <CountdownUnit>{unit}</CountdownUnit>
        </span>
      ))}
      {suffix && <CountdownUnit>{suffix.trim()}</CountdownUnit>}
    </Countdown>
  );
};

const UpcomingExamsCarousel = ({ yearFilter = 'all', institutionFilter = null, onCollapsed }) => {
  const { t } = useTranslation();
  const [futureExams, setFutureExams] = useState([]);
  const fetchSeqRef = useRef(0);
  const isMobile = useIsMobile();
  const lastSectionRef = useRef(null);
  const [currentExamIndex, setCurrentExamIndex] = useState(0);
  // Related cheat sheets for every exam in futureExams, keyed by
  // "courseCode|examType" — preloaded up front (see the effect below)
  // rather than fetched on each next/previous click.
  const [relatedCache, setRelatedCache] = useState({});
  const [examsLoading, setExamsLoading] = useState(true);
  // Love face on all empty-state mascots while hovering the upload CTA —
  // same trigger pattern as CheatSheetDetail.js's buy-button mascot, just
  // fanned out to every scattered mascot instead of one.
  const [mascotExpression, setMascotExpression] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, canUpload, login, loading: authLoading } = useAuth();
  // Refetch when the user saves new study tags: they change the order.
  const studyTagsKey = (user?.study_tag_ids || []).join(',');

  const closestExam = futureExams[currentExamIndex] || null;

  useEffect(() => {
    // Wait for auth to settle: Home swaps yearFilter from 'all' to the
    // user's profile year once it knows it, and fetching before that would
    // briefly show every year's exams. (Stale responses are also ignored in
    // fetchUpcomingExams, in case the two still overlap.)
    if (authLoading) return;
    fetchUpcomingExams();
  }, [yearFilter, institutionFilter, authLoading, studyTagsKey]);

  // Self-fetches by course_code instead of filtering a `cheatSheets` prop —
  // Home.js only holds one paginated page at a time (infinite scroll), so
  // that prop can no longer be trusted to contain every matching sheet.
  //
  // Preloads EVERY exam in futureExams up front, once per exam list, so
  // next/previous never waits on the network. One batched request covers all
  // courses (top 12 sheets each): a request per exam meant ~50 at once, which
  // queued behind the browser's connection limit and used up half the API's
  // per-IP rate limit on a single page view.
  useEffect(() => {
    if (futureExams.length === 0) {
      setRelatedCache({});
      return;
    }
    let cancelled = false;

    // Seed every exam as "loading" up front so whichever one is currently
    // selected renders the skeleton rather than an incorrectly-empty state
    // while its own fetch is still in flight.
    setRelatedCache(() => {
      const seeded = {};
      futureExams.forEach(exam => {
        seeded[`${exam.courseCode}|${exam.examType}`] = { sheets: [], loading: true };
      });
      return seeded;
    });

    const courseCodes = [...new Set(futureExams.map(exam => exam.courseCode))];
    const fillCache = (sheetsByCourse) => {
      const filled = {};
      futureExams.forEach(exam => {
        filled[`${exam.courseCode}|${exam.examType}`] = {
          sheets: (sheetsByCourse[exam.courseCode] || []).filter(
            // Combined sheets (e.g. Midterm + Final) count for each exam they cover.
            sheet => coversExamType(sheet, exam.examType)
          ),
          loading: false,
        };
      });
      setRelatedCache(filled);
    };

    cheatSheetsAPI.getAll({ course_codes: courseCodes.join(','), per_course: 12 })
      .then(res => {
        if (cancelled) return;
        const sheetsByCourse = {};
        (res.data.cheat_sheets || []).forEach(sheet => {
          if (!sheetsByCourse[sheet.course_code]) sheetsByCourse[sheet.course_code] = [];
          sheetsByCourse[sheet.course_code].push(sheet);
        });
        fillCache(sheetsByCourse);
      })
      .catch(() => {
        if (!cancelled) fillCache({});
      });

    return () => { cancelled = true; };
  }, [futureExams]);

  const theme = useTheme();
  const closestExamKey = closestExam ? `${closestExam.courseCode}|${closestExam.examType}` : null;
  const closestExamCache = closestExamKey ? relatedCache[closestExamKey] : undefined;
  const relatedCheatSheets = closestExamCache?.sheets || [];
  const relatedLoading = !closestExamCache || closestExamCache.loading;

  const fetchUpcomingExams = async () => {
    // Home can change yearFilter while a fetch is in flight (e.g. 'all' ->
    // the profile's year once auth resolves), so only the latest request
    // may update state.
    const seq = ++fetchSeqRef.current;
    const applyExams = (exams) => {
      if (seq !== fetchSeqRef.current) return;
      setFutureExams(exams);
      setCurrentExamIndex(0);
    };

    try {
      // Try fetching from API first
      const params = {};
      // 'all' means every year level (each exam's title then shows its year).
      if (yearFilter && yearFilter !== 'all') {
        params.year_level = yearFilter;
      }
      if (institutionFilter) {
        params.institution_id = institutionFilter;
      }

      const response = await upcomingExamsAPI.getUpcoming(params);
      const data = response.data;

      if (data.enabled && data.exams && data.exams.length > 0) {
        applyExams(pickUpcomingExams(data.exams));
      } else {
        applyExams([]);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming exams from API:', error);
      // Fallback to JSON file for backward compatibility
      try {
        const response = await fetch('/upcoming-exams.json', {
          headers: { 'Accept': 'application/json' }
        });

        const data = await response.json();

        if (data.enabled && data.exams && data.exams.length > 0) {
          applyExams(pickUpcomingExams(data.exams));
        } else {
          applyExams([]);
        }
      } catch (fallbackError) {
        console.error('Failed to fetch upcoming exams from JSON fallback:', fallbackError);
      }
    } finally {
      setExamsLoading(false);
    }
  };

  const handleCardClick = (cheatSheetId) => {
    navigate(`/cheatsheet/${cheatSheetId}`);
  };

  const formatExamDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
    });
  };

  const handleNextExam = () => {
    if (currentExamIndex < futureExams.length - 1) {
      setCurrentExamIndex(currentExamIndex + 1);
    }
  };

  const handlePreviousExam = () => {
    if (currentExamIndex > 0) {
      setCurrentExamIndex(currentExamIndex - 1);
    }
  };

  const handleUploadCTA = () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    navigate(canUpload ? '/admin/upload' : '/apply-seller');
  };

  const heightSwapKey = closestExam
    ? `${closestExam.courseCode}-${closestExam.examDate}-${relatedCheatSheets.length}`
    : 'none';
  const cardRowRef = useHeightAnimation(heightSwapKey);

  // Every state renders through the same Collapsible, so React keeps one
  // instance and animates between them. While loading, show nothing (not a
  // skeleton): we don't know yet whether this institution/year has any exams,
  // and a skeleton that then vanishes reads as a glitchy flash. The section
  // bounces in once real exams arrive.
  if (examsLoading) {
    return <Collapsible open={false} onCollapsed={onCollapsed} shadowRoom={SHADOW_ROOM}>{lastSectionRef.current}</Collapsible>;
  }

  // No exam for this filter: fade out the last section shown instead of
  // vanishing (Collapsible keeps it rendered until the animation ends).
  if (!closestExam) {
    return <Collapsible open={false} onCollapsed={onCollapsed} shadowRoom={SHADOW_ROOM}>{lastSectionRef.current}</Collapsible>;
  }

  const section = (
    <FeaturedSection>
      <MeshWash
        key={closestExamKey}
        aria-hidden="true"
        style={{ background: meshGradient(`exam-${closestExamKey}`, { alpha: theme.mode === 'dark' ? 0.16 : 0.28, base: 'transparent' }) }}
      />
      <SectionHeader>
        <ExamContent>
          {futureExams.length > 1 ? (
            <LabelRow>
              <InlineNavButton
                type="button"
                onClick={handlePreviousExam}
                disabled={currentExamIndex === 0}
                aria-label={t('upcomingExams.previousExam')}
              >
                ‹
              </InlineNavButton>
              <SectionLabel $inRow><ResponsiveMorphText>{t('upcomingExams.upcomingExamType', { examType: closestExam.examType })}</ResponsiveMorphText></SectionLabel>
              <InlineNavButton
                type="button"
                onClick={handleNextExam}
                disabled={currentExamIndex === futureExams.length - 1}
                aria-label={t('upcomingExams.nextExam')}
              >
                ›
              </InlineNavButton>
            </LabelRow>
          ) : (
            <SectionLabel><ResponsiveMorphText>{t('upcomingExams.upcomingExamType', { examType: closestExam.examType })}</ResponsiveMorphText></SectionLabel>
          )}
          <Title>
            <ResponsiveMorphText>{closestExam.courseName}</ResponsiveMorphText>
            {yearFilter === 'all' && closestExam.yearLevel && (
              <TitleYear><ResponsiveMorphText>{`(${closestExam.yearLevel})`}</ResponsiveMorphText></TitleYear>
            )}
          </Title>
          <ExamInfo>
            <CourseCodeText><ResponsiveMorphText>{closestExam.courseCode}</ResponsiveMorphText></CourseCodeText>
            <InfoItem>
              <ClockIcon size={15} />
              <ResponsiveMorphText>{formatExamDateTime(closestExam.examDate)}</ResponsiveMorphText>
            </InfoItem>
            {closestExam.location && (
              <InfoItem title={t('upcomingExams.location')}>
                <MapPinIcon size={15} />
                <ResponsiveMorphText>{closestExam.location}</ResponsiveMorphText>
              </InfoItem>
            )}
            <CountdownTicker examDate={closestExam.examDate} />
          </ExamInfo>
        </ExamContent>
        {futureExams.length > 1 && (
          <NavigationContainer>
            <NavButton
              onClick={handlePreviousExam}
              disabled={currentExamIndex === 0}
              aria-label={t('upcomingExams.previousExam')}
            >
              ‹
            </NavButton>
            <ExamCounter>
              {t('upcomingExams.examCounter', { current: currentExamIndex + 1, total: futureExams.length })}
            </ExamCounter>
            <NavButton
              onClick={handleNextExam}
              disabled={currentExamIndex === futureExams.length - 1}
              aria-label={t('upcomingExams.nextExam')}
            >
              ›
            </NavButton>
          </NavigationContainer>
        )}
      </SectionHeader>

      <HeightAnimatedWrapper ref={cardRowRef}>
        {relatedLoading ? (
          <SkeletonCardRow key="loading" />
        ) : relatedCheatSheets.length > 0 ? (
          <ScrollContainer key={heightSwapKey}>
          {relatedCheatSheets.map(sheet => (
            <Card key={sheet.cheatsheet_id} onClick={() => handleCardClick(sheet.cheatsheet_id)}>
              <PreviewImageContainer>
                {sheet.preview_image_path && sheet.preview_image_path.startsWith('http') ? (
                  <PreviewImage
                    src={sheet.preview_image_path}
                    alt={sheet.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const placeholder = e.target.nextSibling;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                {(!sheet.preview_image_path || !sheet.preview_image_path.startsWith('http')) && (
                  <NoPreviewPlaceholder style={{ background: meshGradient(`sheet-${sheet.cheatsheet_id}`) }}>
                    {sheet.course_code}
                  </NoPreviewPlaceholder>
                )}
              </PreviewImageContainer>

              <CardContent>
                <TagsContainer>
                  <TagsLeft>
                    <CourseCode>{sheet.course_code}</CourseCode>
                    <ExamTypesPill sheet={sheet} pill={MetaTag} />
                  </TagsLeft>
                  {sheet.collaborators?.length > 0 ? (
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
                  )}
                </TagsContainer>
                <CheatSheetTitle>{sheet.title}</CheatSheetTitle>
                <Description>{stripMarkdown(sheet.description)}</Description>
                <CardFooter>
                  <Price>
                    {parseFloat(sheet.price || 0) === 0 ? t('common.free') : `${parseFloat(sheet.price).toFixed(2)} ฿`}
                  </Price>
                  <Stats>
                    <span><StarIcon size={14} /> {parseFloat(sheet.average_rating || 0).toFixed(1)}</span>
                    <span><EyeIcon size={14} /> {sheet.view_count}</span>
                    <span><CartIcon size={14} /> {sheet.purchase_count}</span>
                  </Stats>
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </ScrollContainer>
        ) : (
          <EmptyStateRow key={heightSwapKey}>
            <EmptyCard>
              <MascotField>
                {(isMobile ? MASCOT_LAYOUT_MOBILE : MASCOT_LAYOUT_DESKTOP).map((m, i) => (
                  <GazingMascot
                    key={`${isMobile ? 'm' : 'd'}-${i}`}
                    name={`${closestExam.courseCode}-${closestExam.examType}-empty-${i}`}
                    size={m.size}
                    style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}
                    expression={mascotExpression}
                  />
                ))}
              </MascotField>
              <EmptyContent>
                <div>{t('upcomingExams.noSheetsYet', { courseCode: closestExam.courseCode, examType: closestExam.examType })}</div>
                <UploadCTAButton
                  onClick={handleUploadCTA}
                  onMouseEnter={() => setMascotExpression(love)}
                  onMouseLeave={() => setMascotExpression(null)}
                >
                  <UploadIcon size={16} color="#fff" />
                  {t('upcomingExams.uploadOne')}
                </UploadCTAButton>
              </EmptyContent>
            </EmptyCard>
          </EmptyStateRow>
        )}
      </HeightAnimatedWrapper>
    </FeaturedSection>
  );
  lastSectionRef.current = section;

  return <Collapsible open onCollapsed={onCollapsed} shadowRoom={SHADOW_ROOM}>{section}</Collapsible>;
};

export default UpcomingExamsCarousel;
