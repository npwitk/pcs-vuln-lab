import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cheatSheetsAPI, paymentsAPI, purchasesAPI, cartAPI, reviewsAPI, authAPI, printServiceAPI, analyticsAPI, safeqAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePaymentWatch } from '../context/PaymentWatchContext';
import toast from 'react-hot-toast';
import { StarIcon, EyeIcon, CartIcon, InfoIcon } from '../components/Icons';
import { Printer, RefreshCw, Phone, Store, Share2, Edit, Trash2 } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import StarRating from '../components/StarRating';
import YouTubeEmbed from '../components/YouTubeEmbed';
import SupplementaryFilesSection from '../components/SupplementaryFilesSection';
import CollaboratorCluster from '../components/CollaboratorCluster';
import SafeqVerifyForm from '../components/SafeqVerifyForm';
import LoadingSpinner from '../components/LoadingSpinner';
import FullPreviewViewer from '../components/FullPreviewViewer';
import PaymentSuccessCheck from '../components/PaymentSuccessCheck';
import ExpandableText from '../components/ExpandableText';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { copyTextToClipboard } from '../utils/clipboard';
import Mascot from '../components/mascot/Mascot';
import { useGaze } from '@blobatar/react/gaze';
import { surprised } from 'blobatar/expression';
import 'blobatar/motion.css';
import 'blobatar/gaze.css';
import usePageMeta from '../hooks/usePageMeta';
import InstitutionViewingBanner from '../components/InstitutionViewingBanner';
import { sameOriginPreviewUrl } from '../utils/sameOriginPreview';
import { formatExamTypes } from '../utils/examTypes';
import Breadcrumbs from '../components/ui/Breadcrumb';
import PromptPayLogoImage from '../components/PromptPayLogo';

// three.js is only loaded for sheets that have a 3D preview.
const Sheet3DViewer = lazy(() => import('../components/Sheet3DViewer'));

// No card anywhere — Apple-product-page shape instead: an open two-column
// page (specs/description on the left, one big image on the right, both
// unboxed) with a persistent price+buy bar docked to the bottom of the
// viewport. The bar is `position: sticky` (not fixed) and lives as the last
// item inside Container, which sits directly above <Footer/> in the DOM —
// so it rides the viewport bottom while Container still has room below it,
// then naturally settles into normal flow and scrolls away with the page
// once Container ends, handing off cleanly to the footer instead of
// floating on top of it.
const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  padding-bottom: 0;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
  transition: background ${props => props.theme.transitions.normal};

  @media (min-width: 1024px) {
    max-width: 1240px;
  }
`;

// The two-column layout (specs/description left, sticky image right) is its
// own grid, separate from StickyBuyBar below it — so the image's sticky
// "release" boundary is this grid's own bottom edge (right after Reviews),
// not entangled with wherever the buy bar happens to sit. Otherwise the two
// sticky elements fight over the same row and the image gets clipped
// awkwardly right against the bar instead of releasing cleanly beforehand.
const ContentGrid = styled.div`
  @media (min-width: 1024px) {
    display: grid;
    // No preview image means no second column to lay out at all — a plain
    // single-column grid lets LeftContent below center itself in the full
    // width instead of sitting pinned to the (now-empty) 1.05fr slot with a
    // blank gap where the image column used to be.
    grid-template-columns: ${props => props.$hasImage ? '1.05fr 1fr' : '1fr'};
    column-gap: 4rem;
    align-items: start;
  }
`;

// Split in two (Top: header/badges/title/print-status; Bottom: everything
// from the info grid down through reviews) so the preview image can sit
// between them in DOM order. On mobile that's the only layout that exists —
// ContentGrid isn't a grid below 1024px, it's plain block flow, so whatever
// order these are written in is the order they render in — which is what
// puts the image above the bento box rather than at the very end of the
// page. On desktop, explicit grid-row placement below reassembles them into
// the original single left column, so nothing changes there.
const LeftContentTop = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: 1024px) {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
    // Without an image column to balance against, stretching to the grid's
    // full width would make a very wide, hard-to-read column — cap it at a
    // normal reading width and center it instead.
    ${props => !props.$hasImage && `
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
    `}
  }
`;

const LeftContentBottom = styled(LeftContentTop)`
  @media (min-width: 1024px) {
    grid-row: 2;
  }
`;

// The ENTIRE right side is just the image — sticky so it stays in view
// while the left column scrolls. No frame, no buy box, nothing else here.
const ImageColumn = styled.div`
  margin: 2rem 0;
  position: relative;

  img {
    display: block;
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.22);
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  @media (min-width: 1024px) {
    grid-column: 2;
    // Spans both rows (Top + Bottom) — it needs to release its sticky
    // position at the true bottom of all the left-hand content (the end of
    // Reviews), not just at the end of Top, now that Top/Bottom are two
    // separate grid rows instead of one.
    grid-row: 1 / 3;
    margin: 0;
    position: sticky;
    /* Also clears the sticky institution banner when it's showing. */
    top: calc(60px + 2rem + var(--institution-banner-height, 0px));
    /* Fixed (not max-) height + flex centering so short/landscape previews
       sit in the middle of the sticky area instead of hugging the top —
       a plain max-height only constrains tall images, it doesn't give
       short ones anywhere to center within. The extra 96px leaves out the
       sticky buy bar at the bottom of the window, which would otherwise
       cover the lower part of the area and make previews sit low. */
    height: calc(100vh - 60px - 4rem - 96px);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: auto;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      margin: 0;
    }
  }
`;

// 3D sheet preview (beta), filling the same sticky column as the image.
const Preview3DFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

// Docked to the bottom of the viewport while scrolling — price on one side,
// buy/print/preview actions on the other. Frosted surface so page content
// stays legible as it scrolls underneath. `position: sticky` (not fixed)
// so it releases into normal flow once Container ends, instead of sitting
// on top of the footer forever — see the Container comment above. The
// width: 100vw + negative margin trick keeps it edge-to-edge regardless of
// Container's own max-width/padding, same as position: fixed used to give
// for free.
const StickyBuyBar = styled.div`
  position: sticky;
  bottom: 0;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  z-index: 500;
  background: ${props => props.theme.colors.surface}ee;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const StickyBuyBarInner = styled.div`
  max-width: 1240px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    padding: 0.85rem 1.25rem;
    gap: 0.75rem;
  }
`;

const PriceBlock = styled.div`
  flex-shrink: 0;
`;

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

// Desktop-only flourish — the buy bar is already tight on mobile (price and
// button stack to two rows at this same breakpoint, see StickyBuyBarInner),
// so the mascot drops out there rather than competing for space.
const MascotWrapper = styled.span`
  display: inline-flex;

  @media (max-width: 640px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Header = styled.div`
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  padding-bottom: 2rem;
  margin-bottom: 2rem;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    position: relative;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const EditButton = styled.button`
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.625rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  /* On phones the wrapper drops out of the layout: Share is pinned to the
     header's top-right corner and Edit flows full-width under the title. */
  @media (max-width: 768px) {
    display: contents;
  }
`;

const ShareButton = styled(EditButton)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    right: 0;
    width: auto;
    padding: 0.5rem 0.625rem;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;

  /* Keep badges clear of the Share button pinned top-right on phones. */
  @media (max-width: 768px) {
    padding-right: ${props => (props.$reserveShare ? '3.25rem' : '0')};
  }
`;

const CourseCode = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 0.5rem 1.125rem;
  border-radius: ${props => props.theme.radius.full};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.01em;
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  line-height: ${props => props.theme.typography.lineHeights.tight};
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: ${props => props.theme.typography.sizes['2xl']};
  }
`;

const Meta = styled.div`
  display: flex;
  gap: 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  flex-wrap: wrap;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
`;

// Pre-order "available on <date>" line. Sits directly on the page
// background, so it uses the theme's text-safe amber rather than a fixed
// hex — the previous hardcoded #92400e was ~2:1 against the dark theme.
const PreOrderNotice = styled.div`
  font-size: 0.8rem;
  margin-top: 0.25rem;
  color: ${props => props.theme.colors.warningText};
`;

const PrintServicePill = styled.span`
  display: inline-flex !important;
  align-items: center;
  gap: 0.3rem;
  background: ${props => props.$open
    ? (props.theme.mode === 'dark' ? 'rgba(34,197,94,0.15)' : '#dcfce7')
    : (props.theme.mode === 'dark' ? 'rgba(251,191,36,0.15)' : '#fef3c7')};
  color: ${props => props.$open ? '#16a34a' : props.theme.colors.warningText};
  border: 1px solid ${props => props.$open ? '#86efac' : '#fcd34d'};
  border-radius: 999px;
  padding: 0.2rem 0.65rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;
`;

const UploaderInfo = styled.div`
  display: flex;
  // Centered against the collaborator cluster, whose height changes with the
  // number of people (54px for two, 79px for three or more) — top-aligning
  // the text would leave it drifting higher as the cluster grows. A lone
  // uploader avatar is short and fixed, so that case keeps top alignment.
  align-items: ${props => props.$centered ? 'center' : 'flex-start'};
  gap: 0.75rem;
  padding: 1.25rem 0;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  margin: 0.5rem 0 1.5rem;
`;

const UploaderAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.weights.bold};
  font-size: ${props => props.theme.typography.sizes.sm};
  overflow: hidden;
`;

const UploaderAvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const UploaderDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UploaderLabel = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const UploaderName = styled.span`
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

// "Others" in "A, B and 2 others": hover or focus lists who they are.
const MoreNames = styled.span`
  text-decoration: underline dotted;
  text-underline-offset: 3px;
  cursor: help;
`;

/**
 * The credit line: everyone who made the sheet, uploader first. Two names
 * are both written out; from three on it's the first two and "N others",
 * with the rest in the tooltip. Pending invites never reach here (the API
 * leaves them out until they sign in).
 */
function CreditNames({ uploader, collaborators }) {
  const { t } = useTranslation();
  const names = [uploader, ...(collaborators || []).map(c => c.name).filter(Boolean)];
  if (names.length === 1) return names[0];
  if (names.length === 2) return t('cheatSheetDetail.credit.two', { a: names[0], b: names[1] });
  const rest = names.slice(2);
  const [before, after] = t('cheatSheetDetail.credit.many', { a: names[0], b: names[1], others: '\u0000' }).split('\u0000');
  return (
    <>
      {before}
      <MoreNames title={rest.join(', ')} tabIndex={0}>
        {t('cheatSheetDetail.credit.others', { count: rest.length })}
      </MoreNames>
      {after}
    </>
  );
}

const StoreBadge = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
  padding: 0.2rem 0.6rem 0.2rem 0.3rem;
  border-radius: 999px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  text-decoration: none;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
  width: fit-content;
  transition: color 0.15s, border-color 0.15s;

  &:hover {
    color: ${props => props.theme.colors.text};
    border-color: ${props => props.theme.colors.border};
  }
`;

const StoreBadgeIcon = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
`;

const markdownTableStyles = css`
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.25rem;
    font-size: ${props => props.theme.typography.sizes.sm};
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  th, td {
    border: 1px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : '#cbd5e1'};
    padding: 0.6rem 0.875rem;
    text-align: center;
    white-space: nowrap;
  }

  th {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#f1f5f9'};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    border-bottom: 2px solid ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.25)' : '#94a3b8'};
  }

  tr:nth-child(even) td {
    background: ${props => props.theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc'};
  }
`;

// Shared rendering for any ReactMarkdown output on this page — Description
// and ExclusiveContentBody both render arbitrary user-authored markdown, so
// this is defined once rather than duplicated (a prior duplication is what
// left ExclusiveContentBody's bullet lists with no indentation at all, since
// it only ever picked up markdownTableStyles).
const markdownContentStyles = css`
  p {
    margin-bottom: 1rem;
  }

  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  /* Nested lists (Tab in the editor) sit tight under their parent item. */
  li > ul, li > ol {
    margin-top: 0.5rem;
    margin-bottom: 0;
  }

  strong {
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};
  }

  em {
    font-style: italic;
  }

  del, s {
    text-decoration: line-through;
  }

  code {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 0.125rem 0.375rem;
    border-radius: ${props => props.theme.radius.sm};
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 1rem;
    border-radius: ${props => props.theme.radius.md};
    overflow-x: auto;
    margin-bottom: 1rem;

    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1rem;
    font-style: italic;
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.bold};
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
  }

  h1 { font-size: ${props => props.theme.typography.sizes['2xl']}; }
  h2 { font-size: ${props => props.theme.typography.sizes.xl}; }
  h3 { font-size: ${props => props.theme.typography.sizes.lg}; }
  h4 { font-size: ${props => props.theme.typography.sizes.base}; }
  h5, h6 { font-size: ${props => props.theme.typography.sizes.sm}; }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: underline;

    &:hover {
      color: ${props => props.theme.colors.primaryHover};
    }
  }

  hr {
    border: none;
    border-top: 1px solid ${props => props.theme.colors.border};
    margin: 1.5rem 0;
  }

  ${markdownTableStyles}

  /* GFM task list checkboxes */
  input[type="checkbox"] {
    margin-right: 0.4rem;
    accent-color: ${props => props.theme.colors.primary};
    cursor: default;
  }

  /* LaTeX Math Styles */
  .math {
    font-size: 1.05em;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .math-inline {
    display: inline;
    margin: 0 0.1em;
  }

  .math-display {
    display: block;
    margin: 1rem 0;
    padding: 0.5rem;
    overflow-x: auto;
    text-align: center;
  }

  .katex {
    font-size: 1.05em;
    color: ${props => props.theme.colors.text};
  }

  .katex-display {
    margin: 1rem 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 0.625rem;
  margin-top: 0.375rem;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textTertiary};
  text-decoration: none;
  transition: color 0.15s;

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const Description = styled.div`
  font-size: ${props => props.theme.typography.sizes.lg};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  overflow-wrap: break-word;
  word-break: break-word;

  ${markdownContentStyles}
`;

// Apple "Tech Specs" style: no boxes, no backgrounds — just a small muted
// uppercase label over a bold value, in a grid that reflows on its own.
// Bento grid. Fixed column counts rather than auto-fit: with six tiles and
// auto-fit the row breaks wherever the container happens to land (4 + 2 at
// the two-column detail width), which reads as ragged. 3 × 2 on desktop and
// 2 × 3 on mobile stays even. One `gap` value, so the vertical and
// horizontal gutters are identical.
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1.75rem 0 2rem;

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.md};
  transition: background ${props => props.theme.transitions.fast}, border-color ${props => props.theme.transitions.fast};

  strong {
    color: ${props => props.theme.colors.textSecondary};
    font-weight: ${props => props.theme.typography.weights.semibold};
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  span {
    color: ${props => props.theme.colors.text};
    font-size: 1.05rem;
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const Price = styled.div`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  letter-spacing: -0.02em;

  @media (max-width: 640px) {
    font-size: ${props => props.theme.typography.sizes['2xl']};
  }
`;

const Button = styled.button`
  background: ${props => props.disabled ? props.theme.colors.textTertiary : props.theme.colors.primary};
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.disabled ? 'none' : props.theme.shadows.sm};
  letter-spacing: 0.01em;

  &:hover {
    background: ${props => props.disabled ? props.theme.colors.textTertiary : props.theme.colors.primaryHover};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : props.theme.shadows.md};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const QRModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const QRContent = styled.div`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  text-align: center;
`;

// White card behind the QR in both themes: Stripe's PNG isn't guaranteed an
// opaque background, and banking apps scan dark-on-light most reliably.
const QRImage = styled.img`
  width: 300px;
  height: 300px;
  max-width: 100%;
  margin: 1rem 0;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
`;

// Centred above the QR (components/PromptPayLogo).
const PromptPayLogo = styled(PromptPayLogoImage)`
  margin: 0 auto 0.5rem;
`;

const Instructions = styled.div`
  text-align: left;
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 1rem;
  border-radius: 5px;
  margin-top: 1rem;

  ol {
    margin-left: 1.5rem;
    li {
      margin-bottom: 0.5rem;
    }
  }
`;

const Badge = styled.span`
  background: ${props => props.theme.colors.success};
  color: white;
  padding: 0.5rem 1.125rem;
  border-radius: ${props => props.theme.radius.full};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.sm};
  display: inline-flex;
  align-items: center;
  letter-spacing: 0.02em;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const YouTubeSection = styled.div`
  margin-top: 2.5rem;
`;

const YouTubeTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const YouTubeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: ${props => props.$singleVideo ? '1fr' : 'repeat(2, 1fr)'};
  }
`;

const redGlow = keyframes`
  0%, 100% { box-shadow: 0 0 6px 1px rgba(239, 68, 68, 0.4); border-color: rgba(239, 68, 68, 0.5); }
  50% { box-shadow: 0 0 18px 4px rgba(239, 68, 68, 0.75); border-color: rgba(239, 68, 68, 0.9); }
`;

const ExclusiveContentSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.backgroundAlt || props.theme.colors.surface};
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 8px;
  animation: ${redGlow} 2.5s ease-in-out infinite;
`;

const ExclusiveContentTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const ExclusiveContentBody = styled.div`
  font-size: ${props => props.theme.typography.sizes.md};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
  overflow-wrap: break-word;
  word-break: break-word;
  ${markdownContentStyles}
`;

const VersionSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1rem 1.25rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const VersionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-variant-numeric: tabular-nums;
`;

const HashText = styled.code`
  font-family: 'SFMono-Regular', Consolas, monospace;
  font-size: 0.7rem;
  letter-spacing: 0.03em;
  color: ${props => props.theme.colors.textTertiary};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  word-break: break-all;

  // Not meaningful to a buyer and just adds clutter on a row that's already
  // tight on width — VersionHistoryRow is a plain flex row, so hiding this
  // just lets the date/current-badge reflow into the freed space, no layout
  // gap to patch.
  @media (max-width: 640px) {
    display: none;
  }
`;

const VersionHistoryTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.25rem;
`;

const VersionEntry = styled.div`
  display: flex;
  flex-direction: column;
`;

const VersionNotes = styled(ExpandableText)`
  margin: 0.15rem 0 0.35rem 2.9rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  line-height: 1.55;
  color: ${props => props.theme.colors.textSecondary};

  @media (max-width: 640px) {
    margin-left: 0.5rem;
  }
`;

const VersionHistoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  background: ${props => props.$current ? props.theme.colors.backgroundSecondary : 'transparent'};
`;

const ReviewSection = styled.div`
  margin-top: 3rem;
  margin-bottom: 2rem;
  padding-top: 2rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const ReviewHeader = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const ReviewForm = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 2rem;
  border-radius: ${props => props.theme.radius.lg};
  margin-bottom: 2rem;
  border: 1px solid ${props => props.theme.colors.borderLight};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.borderLight};
`;

const ReviewHeader2 = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.weights.bold};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const ReviewerDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ReviewerName = styled.span`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const ReviewDate = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
`;

const ReviewComment = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  margin-top: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${props => props.theme.colors.textTertiary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const PurchaseRequired = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.theme.colors.borderLight};
  text-align: center;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
`;

const UsageNotice = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 152, 0, 0.1)'
    : 'rgba(255, 152, 0, 0.08)'};
  border: 1px solid ${props => props.theme.colors.warning};
  color: ${props => props.theme.colors.textSecondary};
  padding: 1rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  text-align: left;

  strong {
    color: ${props => props.theme.colors.text};
    font-weight: ${props => props.theme.typography.weights.semibold};
  }
`;

const PrintModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const FullPreviewModal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const FullPreviewContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  max-width: 720px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
`;

const FullPreviewCloseButton = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.25rem 0.5rem;
`;

const PrintContent = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.radius.lg};
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
  border: 1px solid ${props => props.theme.colors.border};
`;

const PrintModalTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.25rem;
`;

const MethodCards = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const MethodCard = styled.div`
  padding: 1rem;
  border-radius: ${props => props.theme.radius.md};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$selected ? props.theme.colors.primaryLight : props.theme.colors.backgroundSecondary};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: center;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  strong {
    display: block;
    font-size: ${props => props.theme.typography.sizes.sm};
    font-weight: ${props => props.theme.typography.weights.semibold};
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
  }

  span {
    font-size: ${props => props.theme.typography.sizes.xs};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const CostSummary = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem;
  margin-bottom: 1.25rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  strong {
    color: ${props => props.theme.colors.primary};
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.bold};
  }
`;

const PrivacyNotice = styled.div`
  background: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 152, 0, 0.1)'
    : 'rgba(255, 152, 0, 0.08)'};
  border: 1px solid ${props => props.theme.colors.warning};
  border-left: 4px solid ${props => props.theme.colors.warning};
  padding: 0.875rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.25rem;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};

  strong {
    display: block;
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
    font-size: ${props => props.theme.typography.sizes.sm};
  }
`;

const PrintFormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const PrintLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;

  span { color: ${props => props.theme.colors.error}; }
`;

const PrintInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  box-sizing: border-box;
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
`;

const PrintButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const PrintQRImage = styled.img`
  width: 240px;
  height: 240px;
  display: block;
  margin: 1rem auto;
`;

const SuccessBox = styled.div`
  background: ${props => props.theme.mode === 'dark' ? 'rgba(76,175,80,0.15)' : '#e8f5e9'};
  border: 1px solid ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.radius.md};
  padding: 1.25rem;
  text-align: center;
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;

  p { margin: 0.5rem 0; font-size: ${props => props.theme.typography.sizes.sm}; color: ${props => props.theme.colors.textSecondary}; }
`;

const GreenButton = styled(Button)`
  background: ${props => props.disabled ? props.theme.colors.textTertiary : props.theme.colors.success};
  &:hover {
    background: ${props => props.disabled ? props.theme.colors.textTertiary : '#388e3c'};
  }
`;

// The canvas-based preview viewer is a heavier, desktop-oriented experience
// (large scroll area, hover-driven right-click deterrence) — deliberately
// not offered on mobile viewports.
const DesktopOnly = styled.div`
  display: contents;

  @media (max-width: 768px) {
    display: none;
  }
`;

const STATUS_META = {
  pending_payment:  { labelKey: 'cheatSheetDetail.printStatus.awaitingPayment', step: 0, accent: '#f59e0b' },
  confirmed:        { labelKey: 'cheatSheetDetail.printStatus.confirmed',       step: 1, accent: '#3b82f6' },
  printing:         { labelKey: 'cheatSheetDetail.printStatus.beingPrinted',    step: 2, accent: '#3b82f6' },
  ready_for_pickup: { labelKey: 'cheatSheetDetail.printStatus.readyForPickup',  step: 3, accent: '#22c55e' },
  completed:        { labelKey: 'cheatSheetDetail.printStatus.completed',       step: 4, accent: '#6b7280' },
  cancelled:        { labelKey: 'cheatSheetDetail.printStatus.cancelled',       step: -1, accent: '#ef4444' },
};
// Keys stay stable/English for React `key` props; STEP_LABEL_KEYS (same
// order) supplies the translated display text at render time.
const STEPS = ['Awaiting Payment', 'Confirmed', 'Printing', 'Ready', 'Done'];
const STEP_LABEL_KEYS = [
  'cheatSheetDetail.printSteps.awaitingPayment',
  'cheatSheetDetail.printSteps.confirmed',
  'cheatSheetDetail.printSteps.printing',
  'cheatSheetDetail.printSteps.ready',
  'cheatSheetDetail.printSteps.done',
];

const PrintStatusBanner = styled.div`
  margin: 0 0 1.5rem;
  border-radius: ${props => props.theme.radius.lg};
  border: 1px solid ${props => props.$accent}55;
  background: ${props => props.theme.mode === 'dark'
    ? `${props.$accent}18`
    : `${props.$accent}0f`};
  padding: 1.25rem 1.5rem;
`;

const PrintStatusTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
`;

const PrintStatusLabel = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${props => props.theme.colors.textSecondary};
`;

const PrintStatusValue = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.$accent};
  margin-left: auto;
`;

const PrintStepper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.75rem;

  @media (max-width: 480px) {
    display: none;
  }
`;

const PrintStepNode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 44px;
`;

/* ── Mobile 3-step view ── */
const PrintStepperMobile = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  gap: 0;

  @media (max-width: 480px) {
    display: flex;
  }
`;

const MobileStepNode = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: ${props => props.$current ? '0 0 auto' : '0 0 auto'};
  min-width: ${props => props.$current ? '90px' : '64px'};
`;

const MobileDot = styled.div`
  width: ${props => props.$current ? '18px' : '10px'};
  height: ${props => props.$current ? '18px' : '10px'};
  border-radius: 50%;
  position: relative;
  background: ${props => props.$filled ? props.$accent : props.theme.colors.borderLight};
  border: 2px solid ${props => props.$filled ? props.$accent : props.theme.colors.border};
  opacity: ${props => props.$dim ? 0.45 : 1};
  transition: all 0.2s;
  flex-shrink: 0;

  ${props => props.$current && css`
    &::before, &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid ${props.$accent};
      animation: ${ripple} 1.6s ease-out infinite;
    }
    &::after { animation-delay: 0.8s; }
  `}
`;

const MobileStepLabel = styled.span`
  font-size: ${props => props.$current ? '11px' : '10px'};
  font-weight: ${props => props.$current ? 700 : 400};
  color: ${props => props.$current
    ? props.$accent
    : props.$done
      ? props.$accent
      : props.theme.colors.textTertiary};
  text-align: center;
  line-height: 1.3;
  opacity: ${props => props.$dim ? 0.5 : 1};
`;

const MobileLine = styled.div`
  flex: 1;
  height: 2px;
  min-width: 20px;
  max-width: 40px;
  background: ${props => props.$done ? props.$accent : props.theme.colors.borderLight};
  margin-bottom: 18px;
  opacity: ${props => props.$dim ? 0.35 : 1};
`;

const ripple = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0; }
`;

const PrintStepDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  background: ${props => props.$done ? props.$accent : props.theme.colors.borderLight};
  border: 2px solid ${props => props.$done ? props.$accent : props.theme.colors.border};
  transition: background 0.2s;
  margin-bottom: 4px;

  ${props => props.$active && css`
    &::before, &::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 50%;
      border: 2px solid ${props.$accent};
      animation: ${ripple} 1.6s ease-out infinite;
    }
    &::after {
      animation-delay: 0.8s;
    }
  `}
`;

const PrintStepLine = styled.div`
  flex: 1;
  height: 2px;
  background: ${props => props.$done ? props.$accent : props.theme.colors.borderLight};
  transition: background 0.2s;
  margin-top: 4px;
`;

const PrintStepName = styled.span`
  font-size: 10px;
  color: ${props => props.$done ? props.$accent : props.theme.colors.textTertiary};
  font-weight: ${props => props.$done ? props.theme.typography.weights.semibold : props.theme.typography.weights.normal};
  text-align: center;
  line-height: 1.2;
`;

const PrintStatusDetail = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

// "1 Oct, 10:00" in Bangkok time, for free pre-order labels.
const formatReleaseLabel = (releaseAt) => (releaseAt
  ? new Date(releaseAt).toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '');

const CheatSheetDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { isAuthenticated, login, user } = useAuth();
  const { refreshCartCount } = useCart();
  const { paidOrder, startWatching, acknowledgePaid, registerActiveLocalOrder } = usePaymentWatch();
  const navigate = useNavigate();
  const [cheatSheet, setCheatSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  // <Mascot>/<Blobatar> is a plain function component, not wrapped in forwardRef, so
  // under this project's React 18 (forwardRef-required for function-component
  // refs — only React 19 allows ref as a normal prop) a ref passed to it
  // directly would just warn and never attach. Anchoring a ref on a wrapping
  // <span> instead and handing the gaze driver its actual svg/img child
  // manually sidesteps that entirely, regardless of React version.
  const mascotWrapperRef = useRef(null);
  const { ref: mascotGazeRef } = useGaze({ travel: 3, lookAt: 'pointer' });

  useEffect(() => {
    const node = mascotWrapperRef.current?.querySelector('svg, img') || null;
    mascotGazeRef(node);
    return () => mascotGazeRef(null);
  }, [mascotGazeRef, cheatSheet?.cheatsheet_id]);

  // Surprised face while hovering the buy button — null falls back to the
  // idle pose the rest of the time.
  const [mascotExpression, setMascotExpression] = useState(null);
  const handleMascotHoverIn = () => setMascotExpression(surprised);
  const handleMascotHoverOut = () => setMascotExpression(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQRCode] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null);
  const paymentConfirmed = Boolean(
    paidOrder && paidOrder.type === 'single' && String(paidOrder.id) === String(orderId)
  );
  const [addingToCart, setAddingToCart] = useState(false);
  const [claimingFree, setClaimingFree] = useState(false);
  // 3D preview (beta): set if WebGL or its textures fail, to fall back to the image.
  const [preview3dFailed, setPreview3dFailed] = useState(false);
  usePageMeta(cheatSheet
    ? `${[cheatSheet.course_code, formatExamTypes(cheatSheet)].filter(Boolean).join(' ')} · ${cheatSheet.title}`
    : null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [searchParams] = useSearchParams();
  const hasTrackedShareClickRef = useRef(false);

  // Print service states
  const [printSettings, setPrintSettings] = useState(null);
  const [activePrintRequest, setActivePrintRequest] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printPaymentMethod, setPrintPaymentMethod] = useState('promptpay');
  const [printStudentId, setPrintStudentId] = useState('');
  const [printIdCardNumber, setPrintIdCardNumber] = useState('');
  const [submittingPrint, setSubmittingPrint] = useState(false);

  // Thammasat Printer fulfillment — 'seller_prints' (default) keeps today's
  // behavior; the other two route through the buyer's own verified print
  // queue instead. Only ever shown/allowed for user?.university_group === 'thammasat'.
  const [printFulfillmentMethod, setPrintFulfillmentMethod] = useState('seller_prints');
  const [printSafeqPassword, setPrintSafeqPassword] = useState('');
  const [safeqStatus, setSafeqStatus] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  useEffect(() => {
    fetchCheatSheet();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Silent click-tracking for Share-button links (?src=<label>) — fires once
  // per mount regardless of whether the visitor is logged in; user_id is
  // filled in server-side from the JWT when present. No visible UI change,
  // by design — see the Share button's own handler below for the other half.
  useEffect(() => {
    const source = searchParams.get('src');
    if (!source || hasTrackedShareClickRef.current) return;
    hasTrackedShareClickRef.current = true;
    analyticsAPI.track('share_link_click', {
      cheatsheet_id: id,
      additional_data: { source }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && cheatSheet?.is_purchased) {
      if (!printSettings) {
        printServiceAPI.getSettings(id)
          .then(res => setPrintSettings(res.data.setting))
          .catch(() => {});
      }
      printServiceAPI.getMyRequests()
        .then(res => {
          const match = res.data.requests.find(r => String(r.cheatsheet_id) === String(id));
          setActivePrintRequest(match || null);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, cheatSheet?.is_purchased]);

  const fetchCheatSheet = async () => {
    try {
      const response = await cheatSheetsAPI.getById(id);
      const sheet = response.data.cheat_sheet;
      setCheatSheet(sheet);

      // Fetch print service settings if the user has purchased this sheet
      if (isAuthenticated && sheet.is_purchased) {
        try {
          const psRes = await printServiceAPI.getSettings(id);
          setPrintSettings(psRes.data.setting);
        } catch { /* non-critical */ }
      }
    } catch (error) {
      console.error('Failed to fetch cheat sheet:', error);
      toast.error(t('cheatSheetDetail.toasts.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const buildAutoSource = () => `${user?.is_seller ? 'seller' : 'user'}-${user?.user_id}`;

  // Tries the native OS share sheet first (iOS/Android Safari & Chrome) —
  // falls back to clipboard-copy where the Web Share API isn't available
  // (most desktop browsers). Either way, ends with a fire-and-forget
  // tracking call — silent background tracking, not something the sharer
  // should ever see fail. Same one-tap behavior for every user including
  // admins — admins who want a named, trackable promotional link instead
  // of this auto-tagged one use the dedicated Campaign Links admin page.
  const shareLinkAndTrack = async (source) => {
    const url = `${window.location.origin}/cheatsheet/${id}?src=${encodeURIComponent(source)}`;
    let shared = false;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: cheatSheet?.title, url });
        shared = true;
      } catch (err) {
        // User backed out of the share sheet — nothing was actually shared,
        // so skip the fallback and the tracking call entirely.
        if (err?.name === 'AbortError') return;
        // Any other failure (rare) falls through to the clipboard fallback.
      }
    }

    if (!shared) {
      const copied = await copyTextToClipboard(url);
      if (copied) {
        toast.success(t('cheatSheetDetail.share.copied'));
      } else {
        toast.error(t('cheatSheetDetail.share.copyFailed'));
        return;
      }
    }

    analyticsAPI.track('share_link_generated', {
      cheatsheet_id: id,
      additional_data: { source }
    }).catch(() => {});
  };

  const handleShareClick = () => {
    shareLinkAndTrack(buildAutoSource());
  };

  const openPrintModal = () => {
    setShowPrintModal(true);
    if (user?.university_group === 'thammasat' && !safeqStatus) {
      safeqAPI.getStatus().then(res => setSafeqStatus(res.data)).catch(() => {});
    }
  };

  const handleSubmitPrintRequest = async () => {
    setSubmittingPrint(true);
    try {
      const body = {
        cheatsheet_id: id,
        payment_method: printPaymentMethod,
        ...(printPaymentMethod === 'tu_credit' && {
          student_id: printStudentId.trim(),
          id_card_number: printIdCardNumber.trim()
        }),
        fulfillment_method: printFulfillmentMethod,
        ...(printFulfillmentMethod === 'assisted_release' && {
          safeq_password: printSafeqPassword.trim()
        })
      };
      const res = await printServiceAPI.createRequest(body);
      setActivePrintRequest(res.data.request);
      setShowPrintModal(false);
      setPrintStudentId('');
      setPrintIdCardNumber('');
      setPrintPaymentMethod('promptpay');
      setPrintFulfillmentMethod('seller_prints');
      setPrintSafeqPassword('');
      toast.success(t('cheatSheetDetail.toasts.printRequestSubmitted'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('cheatSheetDetail.toasts.printRequestFailed'));
    } finally {
      setSubmittingPrint(false);
    }
  };

  const closePrintModal = () => {
    setShowPrintModal(false);
    setPrintStudentId('');
    setPrintIdCardNumber('');
    setPrintPaymentMethod('promptpay');
    setPrintFulfillmentMethod('seller_prints');
    setPrintSafeqPassword('');
  };

  const handleClaimFree = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }
    setClaimingFree(true);
    try {
      await cheatSheetsAPI.claimFree(id);
      toast.success(t('cheatSheetDetail.toasts.savedFree', { date: formatReleaseLabel(cheatSheet.release_at) }));
      await fetchCheatSheet();
    } catch (error) {
      toast.error(error.response?.data?.message || t('cheatSheetDetail.toasts.saveFreeFailed'));
    } finally {
      setClaimingFree(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t('cheatSheetDetail.toasts.loginToAddToCart'));
      login();
      return;
    }

    setAddingToCart(true);
    try {
      const response = await cartAPI.addToCart(cheatSheet.cheatsheet_id);

      // Check if item was already in cart
      if (response.data.already_in_cart) {
        toast(t('cheatSheetDetail.toasts.itemAlreadyInCart'), {
          icon: <InfoIcon size={20} color="#3b82f6" />
        });
      } else {
        toast.success(t('cheatSheetDetail.toasts.addedToCart'));
      }

      // Refresh cart count badge
      refreshCartCount();

      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(t('cheatSheetDetail.toasts.itemAlreadyInCart'));
        navigate('/cart');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || t('cheatSheetDetail.toasts.cannotAddToCart'));
      } else {
        toast.error(t('cheatSheetDetail.toasts.addToCartFailed'));
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      const response = await paymentsAPI.createPayment(id);
      setQRCode(response.data.purchase.qr_code);
      setOrderId(response.data.purchase.order_id);
      setPaymentInstructions(response.data.instructions || null);
      startWatching('single', response.data.purchase.order_id);
      setShowQR(true);
      toast.success(t('cheatSheetDetail.toasts.qrGenerated'));
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error(error.response?.data?.message || t('cheatSheetDetail.toasts.purchaseFailed'));
    }
  };

  // Payment status is polled centrally by PaymentWatchContext (persisted
  // across navigation/reload, not just while this modal is mounted — see
  // that file for why). This just tells it which order is currently visible
  // inline on this page, so the global fallback overlay stays out of the way.
  useEffect(() => {
    if (!showQR || !orderId) return undefined;
    registerActiveLocalOrder('single', orderId);
    return () => registerActiveLocalOrder(null, null);
  }, [showQR, orderId, registerActiveLocalOrder]);

  // Hold the success animation on screen briefly, then close the modal and
  // send the buyer straight to their library.
  useEffect(() => {
    if (!paymentConfirmed) return undefined;
    const timeout = setTimeout(() => {
      setShowQR(false);
      acknowledgePaid();
      navigate('/my-purchases');
    }, 1800);
    return () => clearTimeout(timeout);
  }, [paymentConfirmed, acknowledgePaid, navigate]);

  const handleDownload = async () => {
    setIsDownloading(true);

    // Show loading toast with file size info
    const fileSizeInfo = cheatSheet.file_size_mb ? ` (${cheatSheet.file_size_mb} MB)` : '';
    const downloadToast = toast.loading(t('cheatSheetDetail.toasts.preparingDownload', { fileSizeInfo }));

    try {
      // Check if it's a free cheat sheet
      const isFree = parseFloat(cheatSheet.price) === 0;

      // Progress callback
      const onProgress = (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          toast.loading(t('cheatSheetDetail.toasts.downloadingProgress', { fileSizeInfo, percent: percentCompleted }), { id: downloadToast });
        } else {
          // If total size is unknown, show a generic message
          const loadedMB = (progressEvent.loaded / (1024 * 1024)).toFixed(2);
          toast.loading(t('cheatSheetDetail.toasts.downloadingReceived', { loaded: loadedMB }), { id: downloadToast });
        }
      };

      let response;
      if (isFree) {
        // Use the free download endpoint
        response = await cheatSheetsAPI.downloadFree(id, onProgress);
      } else {
        // Use the regular purchase download endpoint
        response = await purchasesAPI.downloadCheatSheet(cheatSheet.order_id, onProgress);
      }

      // Extract student ID from email (part before @g.siit.tu.ac.th)
      const studentId = user?.email ? user.email.split('@')[0] : 'unknown';

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cheatSheet.title} - ${studentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Dismiss loading toast and show success
      toast.success(t('cheatSheetDetail.toasts.downloadCompleted'), { id: downloadToast });
      // A free download also adds it to My Library; refresh so the page shows that.
      if (isFree && !cheatSheet.in_library) fetchCheatSheet();
    } catch (error) {
      console.error('Download failed:', error);
      // Dismiss loading toast and show error
      toast.error(error.response?.data?.message || t('cheatSheetDetail.toasts.downloadFailed'), { id: downloadToast });
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getReviewsForCheatSheet(id, { sort: 'recent' });
      setReviews(response.data.reviews || []);
      setReviewStats(response.data.stats || { average_rating: 0, total_reviews: 0, verified_reviews: 0 });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Set empty state on error instead of leaving undefined
      setReviews([]);
      setReviewStats({ average_rating: 0, total_reviews: 0, verified_reviews: 0 });
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await reviewsAPI.getMyReview(id);
      if (response.data && response.data.review) {
        setMyReview(response.data.review);
        setRating(response.data.review.rating || 0);
        setComment(response.data.review.comment || '');
      }
    } catch (error) {
      // No review found - that's okay
      if (error.response?.status !== 404) {
        console.error('Failed to fetch my review:', error);
      }
      // Reset to default state
      setMyReview(null);
      setRating(0);
      setComment('');
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error(t('cheatSheetDetail.toasts.selectRating'));
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewsAPI.createOrUpdateReview(id, rating, comment);
      toast.success(myReview ? t('cheatSheetDetail.toasts.reviewUpdated') : t('cheatSheetDetail.toasts.reviewSubmitted'));

      // Clear the form
      setRating(0);
      setComment('');
      setIsEditingReview(false);

      // Refresh data — fetchCheatSheet() too, since the page header's
      // average_rating/review_count is a separate fetch from reviewStats
      // and would otherwise go stale until a manual reload.
      await fetchReviews();
      await fetchMyReview();
      await fetchCheatSheet();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || t('cheatSheetDetail.toasts.reviewSubmitFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartEditReview = () => {
    setIsEditingReview(true);
  };

  const handleCancelEditReview = () => {
    // Revert the working rating/comment back to the last-saved review —
    // myReview itself is never touched, so this just re-derives from it.
    setRating(myReview?.rating || 0);
    setComment(myReview?.comment || '');
    setIsEditingReview(false);
  };

  const handleDeleteReview = async () => {
    if (!myReview) return;
    if (!window.confirm(t('cheatSheetDetail.confirmDeleteReview'))) return;

    setDeletingReview(true);
    try {
      await reviewsAPI.deleteReview(myReview.review_id);
      toast.success(t('cheatSheetDetail.toasts.reviewDeleted'));
      setMyReview(null);
      setRating(0);
      setComment('');
      setIsEditingReview(false);
      await fetchReviews();
      await fetchCheatSheet();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error(error.response?.data?.message || t('cheatSheetDetail.toasts.reviewDeleteFailed'));
    } finally {
      setDeletingReview(false);
    }
  };

  const formatDate = React.useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cheatSheet) {
    return <Container>{t('cheatSheetDetail.notFound')}</Container>;
  }

  const isFreeSheet = parseFloat(cheatSheet.price || 0) === 0;
  const flatPreviewSrc = cheatSheet.preview_image_path
    ? (cheatSheet.preview_image_path.startsWith('http')
      ? cheatSheet.preview_image_path
      : `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/${cheatSheet.preview_image_path.replace(/\\/g, '/')}`)
    : null;
  const has3dPreview = !!cheatSheet.preview_3d_front_path && !preview3dFailed;
  const hasPreview = !!flatPreviewSrc || has3dPreview;
  // 3D when the seller added it (and it loads); otherwise the flat image.
  const show3dPreview = has3dPreview;
  const releaseLabel = formatReleaseLabel(cheatSheet.release_at);
  // For free sheets is_purchased just means "accessible", so the pre-order
  // Save/Saved state has to use whether it's really in the library.
  const ownsPreOrder = isFreeSheet ? !!cheatSheet.in_library : !!cheatSheet.is_purchased;

  return (
    <>
    {/* Full-bleed, outside Container's max-width, directly under the navbar. */}
    <InstitutionViewingBanner institutionId={cheatSheet.institution_id ?? null} variant="sheet" />
    <Container>
      <Breadcrumbs
        items={[
          { label: t('nav.browse'), to: '/' },
          // year=all: without it Home falls back to the viewer's own year
          // level, which hides a course from another year entirely.
          { label: cheatSheet.course_code, to: `/?q=${encodeURIComponent(cheatSheet.course_code)}&year=all` },
          { label: cheatSheet.title },
        ]}
      />
      <ContentGrid $hasImage={hasPreview}>
      <LeftContentTop $hasImage={hasPreview}>
        <Header>
          <HeaderTop>
            <HeaderContent>
              <BadgeContainer $reserveShare={isAuthenticated}>
                <CourseCode>{cheatSheet.course_code}</CourseCode>
                {cheatSheet.is_purchased && parseFloat(cheatSheet.price || 0) > 0 && <Badge>{t('cheatSheetDetail.badges.purchased')}</Badge>}
                {cheatSheet.is_pre_order && !ownsPreOrder && <Badge style={{ background: '#f59e0b', color: '#fff' }}>{isFreeSheet ? t('cheatSheetDetail.badges.comingSoon') : t('cheatSheetDetail.badges.preOrder')}</Badge>}
                {cheatSheet.is_pre_order && ownsPreOrder && <Badge style={{ background: '#8b5cf6', color: '#fff' }}>{isFreeSheet ? t('cheatSheetDetail.badges.saved') : t('cheatSheetDetail.badges.preOrdered')}</Badge>}
                {cheatSheet.institution_restricted && (
                  <Badge style={{ background: '#6b7280', color: '#fff' }}>
                    {t('cheatSheetDetail.badges.institutionRestricted', {
                      institution: cheatSheet.institution_short_name || cheatSheet.institution_name || t('cheatSheetDetail.institutionRestrictedFallback')
                    })}
                  </Badge>
                )}
              </BadgeContainer>
              <Title>{cheatSheet.title}</Title>
            </HeaderContent>
            {isAuthenticated && (
              <HeaderActions>
                <ShareButton onClick={handleShareClick} aria-label={t('cheatSheetDetail.share.button')} title={t('cheatSheetDetail.share.button')}>
                  <Share2 size={15} />
                </ShareButton>
                {(user?.is_admin || user?.user_id === cheatSheet.created_by) && (
                  <EditButton onClick={() => navigate(`/cheatsheet/${id}/edit`)}>
                    {t('cheatSheetDetail.editCheatSheet')}
                  </EditButton>
                )}
              </HeaderActions>
            )}
          </HeaderTop>
          <Meta>
            <span><StarIcon size={16} /> {t('cheatSheetDetail.ratingReviews', { rating: parseFloat(cheatSheet.average_rating || 0).toFixed(1), count: cheatSheet.review_count || 0 })}</span>
            <span><EyeIcon size={16} /> {t('cheatSheetDetail.viewsCount', { count: cheatSheet.view_count || 0 })}</span>
            <span><CartIcon size={16} /> {t('cheatSheetDetail.purchasesCount', { count: cheatSheet.purchase_count || 0 })}</span>
            {!!cheatSheet.has_print_service && (
              <PrintServicePill $open={!!cheatSheet.print_accepting_requests}>
                <Printer size={11} />
                {cheatSheet.print_accepting_requests ? t('cheatSheetCard.printAvailable') : t('cheatSheetCard.printingClosed')}
              </PrintServicePill>
            )}
          </Meta>
        </Header>

        {activePrintRequest && (() => {
          const meta = STATUS_META[activePrintRequest.status] || STATUS_META.pending_payment;
          const step = meta.step;
          const accent = meta.accent;
          const isCancelled = activePrintRequest.status === 'cancelled';
          return (
            <PrintStatusBanner $accent={accent}>
              <PrintStatusTop>
                <Printer size={16} color={accent} />
                <PrintStatusLabel>{t('cheatSheetDetail.printRequest')}</PrintStatusLabel>
                <PrintStatusValue $accent={accent}>{t(meta.labelKey)}</PrintStatusValue>
              </PrintStatusTop>

              {!isCancelled && (
                <>
                  {/* Desktop: all steps */}
                  <PrintStepper>
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <PrintStepNode>
                          <PrintStepDot $done={step >= i} $active={step === i} $accent={accent} />
                          <PrintStepName $done={step >= i} $accent={accent}>{t(STEP_LABEL_KEYS[i])}</PrintStepName>
                        </PrintStepNode>
                        {i < STEPS.length - 1 && <PrintStepLine $done={step > i} $accent={accent} />}
                      </React.Fragment>
                    ))}
                  </PrintStepper>

                  {/* Mobile: prev → current → next */}
                  <PrintStepperMobile>
                    {step > 0 && (
                      <>
                        <MobileStepNode>
                          <MobileDot $filled $accent={accent} $dim />
                          <MobileStepLabel $done $accent={accent} $dim>{t(STEP_LABEL_KEYS[step - 1])}</MobileStepLabel>
                        </MobileStepNode>
                        <MobileLine $done $accent={accent} />
                      </>
                    )}

                    <MobileStepNode $current>
                      <MobileDot $current $filled $accent={accent} />
                      <MobileStepLabel $current $accent={accent}>{t(STEP_LABEL_KEYS[step])}</MobileStepLabel>
                    </MobileStepNode>

                    {step < STEPS.length - 1 && (
                      <>
                        <MobileLine $accent={accent} $dim />
                        <MobileStepNode>
                          <MobileDot $accent={accent} $dim />
                          <MobileStepLabel $accent={accent} $dim>{t(STEP_LABEL_KEYS[step + 1])}</MobileStepLabel>
                        </MobileStepNode>
                      </>
                    )}
                  </PrintStepperMobile>
                </>
              )}

              {activePrintRequest.status === 'pending_payment' && activePrintRequest.qr_code_data && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                  <PrintQRImage src={activePrintRequest.qr_code_data} alt="PromptPay QR" style={{ width: 180, height: 180 }} />
                  <PrintStatusDetail style={{ justifyContent: 'center' }}>
                    {t('cheatSheetDetail.amountLabel')} <strong style={{ color: accent }}>{parseFloat(activePrintRequest.total_price).toFixed(2)} ฿</strong>
                  </PrintStatusDetail>
                </div>
              )}

              {activePrintRequest.status === 'ready_for_pickup' && activePrintRequest.pickup_location && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  background: `${accent}18`,
                  border: `1px solid ${accent}55`,
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accent, marginBottom: '0.25rem' }}>
                    {t('cheatSheetDetail.pickupLocation')}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {activePrintRequest.pickup_location}
                  </div>
                </div>
              )}
            </PrintStatusBanner>
          );
        })()}
      </LeftContentTop>

      {hasPreview && (
        <ImageColumn>
          {show3dPreview ? (
            <Preview3DFrame>
              <Suspense fallback={flatPreviewSrc ? <img src={flatPreviewSrc} alt={`${cheatSheet.title} preview`} /> : null}>
                <Sheet3DViewer
                  frontUrl={sameOriginPreviewUrl(cheatSheet.preview_3d_front_path)}
                  backUrl={sameOriginPreviewUrl(cheatSheet.preview_3d_back_path)}
                  hint={t('cheatSheetDetail.preview3d.hint')}
                  onError={(err) => {
                    console.error('3D preview failed, showing the image instead:', err);
                    setPreview3dFailed(true);
                  }}
                />
              </Suspense>
            </Preview3DFrame>
          ) : flatPreviewSrc && (
            <img
              src={flatPreviewSrc}
              alt={`${cheatSheet.title} preview`}
              onError={(e) => {
                console.error('Failed to load preview image:', cheatSheet.preview_image_path);
                e.target.parentElement.style.display = 'none';
              }}
            />
          )}
        </ImageColumn>
      )}

      <LeftContentBottom $hasImage={hasPreview}>
        <InfoGrid>
          {cheatSheet.semester && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.semester')}</strong>
              <span>{cheatSheet.semester}</span>
            </InfoItem>
          )}
          {cheatSheet.academic_year && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.academicYear')}</strong>
              <span>{cheatSheet.academic_year}</span>
            </InfoItem>
          )}
          {cheatSheet.year_level && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.yearLevel')}</strong>
              <span>{cheatSheet.year_level}</span>
            </InfoItem>
          )}
          {formatExamTypes(cheatSheet) && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.examType')}</strong>
              <span>{formatExamTypes(cheatSheet)}</span>
            </InfoItem>
          )}
          {cheatSheet.page_count && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.pages')}</strong>
              <span>{t('cheatSheetDetail.info.pagesValue', { count: cheatSheet.page_count })}</span>
            </InfoItem>
          )}
          {cheatSheet.file_size_mb && (
            <InfoItem>
              <strong>{t('cheatSheetDetail.info.fileSize')}</strong>
              <span>{cheatSheet.file_size_mb} MB</span>
            </InfoItem>
          )}
        </InfoGrid>

        {isAuthenticated && cheatSheet.is_purchased && parseFloat(cheatSheet.price || 0) > 0 && (
          <UsageNotice>
            <strong>{t('cheatSheetDetail.usageNoticeTitle')}</strong> {t('cheatSheetDetail.usageNoticeBody')}
          </UsageNotice>
        )}

        {cheatSheet.exclusive_content && (
          <ExclusiveContentSection>
            <ExclusiveContentTitle>{t('cheatSheetDetail.exclusiveContent')}</ExclusiveContentTitle>
            <ExclusiveContentBody>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  a: ({node, ...props}) => {
                    const href = props.href || '';
                    const fixedHref = href.match(/^https?:\/\//) ? href : `https://${href}`;
                    return <a {...props} href={fixedHref} target="_blank" rel="noopener noreferrer" />;
                  }
                }}
              >
                {cheatSheet.exclusive_content}
              </ReactMarkdown>
            </ExclusiveContentBody>
          </ExclusiveContentSection>
        )}

        <Description>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              a: ({node, ...props}) => {
                const href = props.href || '';
                // Ensure external links have proper protocol
                const fixedHref = href.match(/^https?:\/\//) ? href : `https://${href}`;
                return <a {...props} href={fixedHref} target="_blank" rel="noopener noreferrer" />;
              }
            }}
          >
            {cheatSheet.description}
          </ReactMarkdown>
        </Description>

        {cheatSheet.creator_name && (
          <UploaderInfo $centered={cheatSheet.collaborators?.length > 0}>
            {cheatSheet.collaborators?.length > 0 ? (
              <CollaboratorCluster
                uploaderName={cheatSheet.creator_name}
                uploaderAvatar={cheatSheet.creator_avatar}
                collaborators={cheatSheet.collaborators}
              />
            ) : (
              <UploaderAvatar>
                {cheatSheet.creator_avatar ? (
                  <UploaderAvatarImg
                    src={cheatSheet.creator_avatar}
                    alt={cheatSheet.creator_name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerText = cheatSheet.creator_name.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  cheatSheet.creator_name.charAt(0).toUpperCase()
                )}
              </UploaderAvatar>
            )}
            <UploaderDetails>
              <UploaderLabel>{t('cheatSheetDetail.madeBy')}</UploaderLabel>
              <UploaderName>
                <CreditNames uploader={cheatSheet.creator_name} collaborators={cheatSheet.collaborators} />
              </UploaderName>
              {cheatSheet.store_slug && (
                <StoreBadge to={`/store/${cheatSheet.store_slug}`} onClick={(e) => e.stopPropagation()}>
                  {cheatSheet.store_icon ? (
                    <StoreBadgeIcon src={cheatSheet.store_icon} alt={cheatSheet.store_name} />
                  ) : (
                    <Store size={14} />
                  )}
                  {cheatSheet.store_name}
                </StoreBadge>
              )}
              {(cheatSheet.creator_instagram || cheatSheet.creator_line_id || cheatSheet.creator_phone) && (
                <SocialLinks>
                  {cheatSheet.creator_instagram && (
                    <SocialLink
                      href={`https://instagram.com/${cheatSheet.creator_instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t('cheatSheetDetail.social.instagram', { handle: cheatSheet.creator_instagram })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaInstagram size={15} />
                    </SocialLink>
                  )}
                  {cheatSheet.creator_line_id && (
                    <SocialLink
                      href={`https://line.me/ti/p/~${cheatSheet.creator_line_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t('cheatSheetDetail.social.line', { id: cheatSheet.creator_line_id })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SiLine size={15} />
                    </SocialLink>
                  )}
                  {cheatSheet.creator_phone && (
                    <SocialLink
                      href={`tel:${cheatSheet.creator_phone}`}
                      title={t('cheatSheetDetail.social.call', { phone: cheatSheet.creator_phone })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={15} />
                    </SocialLink>
                  )}
                </SocialLinks>
              )}
            </UploaderDetails>
          </UploaderInfo>
        )}

        {cheatSheet.youtube_links && (() => {
          try {
            const links = typeof cheatSheet.youtube_links === 'string'
              ? JSON.parse(cheatSheet.youtube_links)
              : cheatSheet.youtube_links;

            if (Array.isArray(links) && links.length > 0) {
              return (
                <YouTubeSection>
                  <YouTubeTitle>{t('cheatSheetDetail.relatedVideos')}</YouTubeTitle>
                  <YouTubeGrid $singleVideo={links.length === 1}>
                    {links.map((url, index) => (
                      <YouTubeEmbed
                        key={index}
                        url={url}
                        title={`${cheatSheet.title} - Video ${index + 1}`}
                      />
                    ))}
                  </YouTubeGrid>
                </YouTubeSection>
              );
            }
          } catch (e) {
            console.warn('Failed to parse youtube_links:', e);
          }
          return null;
        })()}

        {cheatSheet.is_purchased && (!cheatSheet.institution_restricted || cheatSheet.can_access_restricted) && (
          <SupplementaryFilesSection cheatsheetId={cheatSheet.cheatsheet_id} />
        )}

        {cheatSheet.file_version_history && cheatSheet.file_version_history.length > 0 && (
          <VersionSection>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={12} /> {t('cheatSheetDetail.versionHistory')}
            </div>
            <VersionHistoryTable>
              {[...cheatSheet.file_version_history].reverse().map((entry) => (
                <VersionEntry key={entry.version}>
                <VersionHistoryRow $current={entry.version === cheatSheet.file_version}>
                  <VersionBadge>v{entry.version}</VersionBadge>
                  <span>{new Date(entry.updated_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' })} ICT</span>
                  <HashText title={entry.hash}>{entry.hash.slice(0, 6)}</HashText>
                  {entry.version === cheatSheet.file_version && (
                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600 }}>{t('cheatSheetDetail.current')}</span>
                  )}
                </VersionHistoryRow>
                {entry.notes && <VersionNotes lines={3}>{entry.notes}</VersionNotes>}
                </VersionEntry>
              ))}
            </VersionHistoryTable>
          </VersionSection>
        )}

        <ReviewSection>
          <ReviewHeader>
            {t('cheatSheetDetail.reviewsHeader', { count: reviewStats.total_reviews || reviews.length })}
          </ReviewHeader>

          {/* Review Form - Show for free cheat sheets or users who purchased, either for a first-time review or while editing an existing one */}
          {isAuthenticated && (!myReview || isEditingReview) && (
            (parseFloat(cheatSheet.price || 0) === 0) ||
            (cheatSheet.is_purchased && cheatSheet.purchase_status === 'paid')
          ) && (
            <ReviewForm>
              <FormGroup>
                <Label>{t('cheatSheetDetail.yourRating')}</Label>
                <StarRating
                  value={rating}
                  onChange={setRating}
                  allowHalf={true}
                  showValue={true}
                  size="32px"
                />
              </FormGroup>

              <FormGroup>
                <Label>{t('cheatSheetDetail.yourReview')}</Label>
                <TextArea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('cheatSheetDetail.reviewPlaceholder')}
                  maxLength={500}
                />
              </FormGroup>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button onClick={handleSubmitReview} disabled={submittingReview || !rating}>
                  {submittingReview ? t('cheatSheetDetail.submitting') : t('cheatSheetDetail.submitReview')}
                </Button>
                {isEditingReview && (
                  <button
                    type="button"
                    onClick={handleCancelEditReview}
                    disabled={submittingReview}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      opacity: 0.7,
                      cursor: submittingReview ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </ReviewForm>
          )}

          {/* Message for users who already reviewed */}
          {isAuthenticated && myReview && !isEditingReview && (
            (parseFloat(cheatSheet.price || 0) === 0) ||
            (cheatSheet.is_purchased && cheatSheet.purchase_status === 'paid')
          ) && (
            <div style={{
              background: '#e8f5e9',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #4caf50',
              color: '#2e7d32',
              fontSize: '14px'
            }}>
              <div>✓ {t('cheatSheetDetail.alreadyReviewed', { date: formatDate(myReview.created_at) })}</div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleStartEditReview}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2e7d32',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0
                  }}
                >
                  <Edit size={13} /> {t('cheatSheetDetail.editReview')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  disabled={deletingReview}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#c62828',
                    fontWeight: 600,
                    cursor: deletingReview ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: 0,
                    opacity: deletingReview ? 0.6 : 1
                  }}
                >
                  <Trash2 size={13} /> {deletingReview ? t('cheatSheetDetail.deleting') : t('cheatSheetDetail.deleteReview')}
                </button>
              </div>
            </div>
          )}

          {/* Message for non-purchasers (only for paid cheat sheets) */}
          {isAuthenticated && parseFloat(cheatSheet.price || 0) > 0 && (!cheatSheet.is_purchased || cheatSheet.purchase_status !== 'paid') && (
            <PurchaseRequired>
              <p>{t('cheatSheetDetail.purchaseRequiredToReview')}</p>
            </PurchaseRequired>
          )}

          {/* Reviews List - Show ALL reviews for everyone */}
          {reviews && reviews.length > 0 ? (
            <ReviewList>
              {reviews.map((review) => {
                const userInitial = review.user_name ? review.user_name.charAt(0).toUpperCase() : '?';
                const ratingValue = parseFloat(review.rating) || 0;

                return (
                  <ReviewCard key={review.review_id}>
                    <ReviewHeader2>
                      <ReviewerInfo>
                        {review.avatar_url ? (
                          <Avatar
                            src={review.avatar_url}
                            alt={review.user_name || 'User'}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <AvatarPlaceholder>
                            {userInitial}
                          </AvatarPlaceholder>
                        )}
                        <ReviewerDetails>
                          <ReviewerName>{review.user_name || t('cheatSheetDetail.anonymous')}</ReviewerName>
                          <ReviewDate>{review.created_at ? formatDate(review.created_at) : t('cheatSheetDetail.unknownDate')}</ReviewDate>
                        </ReviewerDetails>
                      </ReviewerInfo>
                    </ReviewHeader2>

                    <StarRating
                      value={ratingValue}
                      showValue={false}
                      size="20px"
                    />

                    {review.comment && (
                      /* VULN(V6): stored XSS -- review rendered as raw HTML (prod uses React escaping) */
                      <ReviewComment dangerouslySetInnerHTML={{ __html: review.comment }} />
                    )}
                  </ReviewCard>
                );
              })}
            </ReviewList>
          ) : (
            <EmptyState>
              {t('cheatSheetDetail.noReviewsYet')}
            </EmptyState>
          )}
        </ReviewSection>
      </LeftContentBottom>
      </ContentGrid>

      <StickyBuyBar>
        <StickyBuyBarInner>
          <PriceBlock>
            <PriceRow>
              <Price>
                {parseFloat(cheatSheet.price || 0) === 0 ? t('common.free') : `${parseFloat(cheatSheet.price).toFixed(2)} ฿`}
              </Price>
              <MascotWrapper ref={mascotWrapperRef}>
                <Mascot
                  name={`cheatsheet-${cheatSheet.cheatsheet_id}`}
                  size={56}
                  animate="always"
                  expression={mascotExpression}
                  aria-hidden="true"
                />
              </MascotWrapper>
            </PriceRow>
            {cheatSheet.is_pre_order && cheatSheet.release_at && (
              <PreOrderNotice>
                {t('cheatSheetDetail.availableToDownloadOn')}{' '}
                <strong>
                  {new Date(cheatSheet.release_at).toLocaleString('en-GB', {
                    timeZone: 'Asia/Bangkok',
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </strong>{' '}{t('cheatSheetDetail.bkkTime')}
              </PreOrderNotice>
            )}
          </PriceBlock>
          <Actions>
            {cheatSheet.institution_restricted && !cheatSheet.can_access_restricted ? (
              <Button disabled style={{ background: '#6b7280', cursor: 'default' }}>
                {t('cheatSheetDetail.institutionRestricted', {
                  institution: cheatSheet.institution_short_name || cheatSheet.institution_name || t('cheatSheetDetail.institutionRestrictedFallback')
                })}
              </Button>
            ) : cheatSheet.is_pre_order ? (
              ownsPreOrder ? (
                <Button disabled style={{ background: '#8b5cf6', cursor: 'default' }}>
                  {isFreeSheet
                    ? t('cheatSheetDetail.savedUnlocksOn', { date: releaseLabel })
                    : t('cheatSheetDetail.preOrderedDownloadingOn', { date: new Date(cheatSheet.release_at).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short' }) })}
                </Button>
              ) : isFreeSheet ? (
                // Free pre-order: one click puts it in the library; no cart.
                <Button
                  onClick={handleClaimFree}
                  onMouseEnter={handleMascotHoverIn}
                  onMouseLeave={handleMascotHoverOut}
                  disabled={claimingFree}
                >
                  {isAuthenticated ? t('cheatSheetDetail.getFreeOnRelease') : t('cheatSheetDetail.loginToSaveFree')}
                </Button>
              ) : cheatSheet.purchase_status === 'pending' ? (
                <Button disabled>{t('cheatSheetDetail.preOrderPendingPayment')}</Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  onMouseEnter={handleMascotHoverIn}
                  onMouseLeave={handleMascotHoverOut}
                  disabled={addingToCart}
                >
                  <CartIcon size={20} color="#fff" />
                  {addingToCart ? t('cheatSheetDetail.adding') : (isAuthenticated ? t('cheatSheetDetail.preOrderNow') : t('cheatSheetDetail.loginToPreOrder'))}
                </Button>
              )
            ) : cheatSheet.is_purchased || parseFloat(cheatSheet.price || 0) === 0 ? (
              isAuthenticated ? (
                <Button onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? t('cheatSheetDetail.downloading') : t('cheatSheetDetail.downloadPdf')}
                </Button>
              ) : (
                <Button onClick={() => authAPI.loginWithGoogle()}>{t('cheatSheetDetail.loginToDownload')}</Button>
              )
            ) : cheatSheet.purchase_status === 'pending' ? (
              <Button disabled>{t('cheatSheetDetail.paymentPendingApproval')}</Button>
            ) : (
              <Button
                onClick={handleAddToCart}
                onMouseEnter={handleMascotHoverIn}
                onMouseLeave={handleMascotHoverOut}
                disabled={addingToCart}
              >
                <CartIcon size={20} color="#fff" />
                {addingToCart ? t('cheatSheetDetail.adding') : (isAuthenticated ? t('cheatSheetDetail.addToCart') : t('cheatSheetDetail.loginToAddToCartButton'))}
              </Button>
            )}
            {isAuthenticated && cheatSheet.is_purchased && printSettings?.is_enabled && !activePrintRequest && (
              printSettings.is_accepting_requests
                ? (
                  <GreenButton onClick={openPrintModal}>
                    <Printer size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    {t('cheatSheetDetail.printForMe')}
                  </GreenButton>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    color: '#92400e',
                    background: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: '8px',
                    padding: '0.5rem 0.85rem',
                  }}>
                    <Printer size={14} />
                    {t('cheatSheetDetail.printingUnavailable')}
                  </div>
                )
            )}
            {cheatSheet.full_preview_enabled && cheatSheet.full_preview_generated_at && !cheatSheet.is_purchased && cheatSheet.page_count > 0 && (
              <DesktopOnly>
                <Button
                  onClick={() => setShowFullPreview(true)}
                  style={{ background: 'transparent', border: `1px solid`, color: 'inherit' }}
                >
                  {t('cheatSheetDetail.previewFullDocument')}
                </Button>
              </DesktopOnly>
            )}
          </Actions>
        </StickyBuyBarInner>
      </StickyBuyBar>

      {showPrintModal && (
        <PrintModal onClick={closePrintModal}>
          <PrintContent onClick={(e) => e.stopPropagation()}>
            <PrintModalTitle>{t('cheatSheetDetail.printForMe')}</PrintModalTitle>

            <CostSummary>
              {cheatSheet.page_count ? (
                <>
                  {t('cheatSheetDetail.print.pageCostLine', { count: cheatSheet.page_count, pricePerPage: parseFloat(printSettings.price_per_page).toFixed(2) })}
                  {' = '}
                  <strong>{(cheatSheet.page_count * parseFloat(printSettings.price_per_page)).toFixed(2)} ฿</strong>
                </>
              ) : (
                <>{t('cheatSheetDetail.print.priceLabel')} <strong>{t('cheatSheetDetail.print.pricePerPage', { price: parseFloat(printSettings.price_per_page).toFixed(2) })}</strong></>
              )}
            </CostSummary>

            <PrintLabel as="p" style={{ marginBottom: '0.75rem' }}>{t('cheatSheetDetail.print.choosePaymentMethod')}</PrintLabel>
            <MethodCards>
              <MethodCard
                $selected={printPaymentMethod === 'promptpay'}
                onClick={() => setPrintPaymentMethod('promptpay')}
              >
                <strong>PromptPay</strong>
                <span>{t('cheatSheetDetail.print.promptpayDescription')}</span>
              </MethodCard>
              <MethodCard
                $selected={printPaymentMethod === 'tu_credit'}
                onClick={() => setPrintPaymentMethod('tu_credit')}
              >
                <strong>{t('cheatSheetDetail.print.tuCredit')}</strong>
                <span>{t('cheatSheetDetail.print.tuCreditDescription')}</span>
              </MethodCard>
            </MethodCards>

            {printPaymentMethod === 'tu_credit' && (
              <>
                <PrivacyNotice>
                  <strong>{t('cheatSheetDetail.print.privacyNoticeTitle')}</strong>
                  {t('cheatSheetDetail.print.privacyNoticeBody')}
                </PrivacyNotice>

                <PrintFormGroup>
                  <PrintLabel htmlFor="print-student-id">
                    {t('cheatSheetDetail.print.studentId')} <span>*</span>
                  </PrintLabel>
                  <PrintInput
                    id="print-student-id"
                    type="text"
                    value={printStudentId}
                    onChange={(e) => setPrintStudentId(e.target.value)}
                    placeholder="e.g. 6401234567"
                    maxLength={20}
                  />
                </PrintFormGroup>

                <PrintFormGroup>
                  <PrintLabel htmlFor="print-id-card-number">
                    {t('cheatSheetDetail.print.idCardNumber')} <span>*</span>
                  </PrintLabel>
                  <PrintInput
                    id="print-id-card-number"
                    type="text"
                    value={printIdCardNumber}
                    onChange={(e) => setPrintIdCardNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('cheatSheetDetail.print.idCardPlaceholder')}
                    maxLength={13}
                    inputMode="numeric"
                  />
                </PrintFormGroup>
              </>
            )}

            {user?.university_group === 'thammasat' && (
              <>
                <PrintLabel as="p" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                  Fulfillment
                </PrintLabel>
                <MethodCards>
                  <MethodCard
                    $selected={printFulfillmentMethod === 'seller_prints'}
                    onClick={() => setPrintFulfillmentMethod('seller_prints')}
                  >
                    <strong>Seller prints it</strong>
                    <span>The seller physically prints and hands you the pages.</span>
                  </MethodCard>
                  <MethodCard
                    $selected={printFulfillmentMethod === 'self_release'}
                    onClick={() => setPrintFulfillmentMethod('self_release')}
                  >
                    <strong>Thammasat Printer — I'll release it myself</strong>
                    <span>Sent straight to your own print queue — release it at any campus terminal.</span>
                  </MethodCard>
                  <MethodCard
                    $selected={printFulfillmentMethod === 'assisted_release'}
                    onClick={() => setPrintFulfillmentMethod('assisted_release')}
                  >
                    <strong>Thammasat Printer — someone releases it for me</strong>
                    <span>Also sent to your queue, but someone else picks it up using your password.</span>
                  </MethodCard>
                </MethodCards>

                {printFulfillmentMethod !== 'seller_prints' && (
                  safeqStatus?.verified ? (
                    <PrivacyNotice>
                      Verified as <strong>{safeqStatus.safeqUsername}</strong> — good until{' '}
                      {new Date(safeqStatus.expiresAt).toLocaleDateString()}.
                    </PrivacyNotice>
                  ) : (
                    <>
                      <PrivacyNotice>
                        <strong>Verify your Thammasat Printer account first.</strong>
                        {' '}One real login confirms it's really you — only your username is
                        remembered afterward, never your password.
                      </PrivacyNotice>
                      <SafeqVerifyForm onVerified={setSafeqStatus} submitLabel="Verify" />
                    </>
                  )
                )}

                {printFulfillmentMethod === 'assisted_release' && safeqStatus?.verified && (
                  <PrintFormGroup>
                    <PrintLabel htmlFor="print-safeq-password">
                      Thammasat Printer Password <span>*</span>
                    </PrintLabel>
                    <PrintInput
                      id="print-safeq-password"
                      type="password"
                      value={printSafeqPassword}
                      onChange={(e) => setPrintSafeqPassword(e.target.value)}
                      placeholder="Your password"
                      autoComplete="off"
                    />
                    <PrivacyNotice>
                      This will be visible to the seller so they (or whoever helps you) can
                      release your job. Consider changing your Thammasat Printer password
                      after pickup.
                    </PrivacyNotice>
                  </PrintFormGroup>
                )}
              </>
            )}

            <PrintButtonGroup>
              <Button
                onClick={handleSubmitPrintRequest}
                disabled={
                  submittingPrint ||
                  (printPaymentMethod === 'tu_credit' && (!printStudentId.trim() || printIdCardNumber.length < 13)) ||
                  (printFulfillmentMethod !== 'seller_prints' && !safeqStatus?.verified) ||
                  (printFulfillmentMethod === 'assisted_release' && !printSafeqPassword.trim())
                }
                style={{ flex: 1 }}
              >
                {submittingPrint ? t('cheatSheetDetail.submitting') : t('cheatSheetDetail.print.submitRequest')}
              </Button>
              <Button
                onClick={closePrintModal}
                style={{ flex: 1, background: 'transparent', border: `1px solid`, color: 'inherit' }}
              >
                {t('common.cancel')}
              </Button>
            </PrintButtonGroup>
          </PrintContent>
        </PrintModal>
      )}

      {showFullPreview && (
        <FullPreviewModal onClick={() => setShowFullPreview(false)}>
          <FullPreviewContent onClick={(e) => e.stopPropagation()}>
            <FullPreviewCloseButton onClick={() => setShowFullPreview(false)}>×</FullPreviewCloseButton>
            <h2 style={{ marginBottom: '1rem' }}>{cheatSheet.title}</h2>
            <FullPreviewViewer
              cheatsheetId={cheatSheet.cheatsheet_id}
              pageCount={cheatSheet.page_count}
            />
          </FullPreviewContent>
        </FullPreviewModal>
      )}

      {showQR && (
        <QRModal onClick={() => { if (!paymentConfirmed) setShowQR(false); }}>
          <QRContent onClick={(e) => e.stopPropagation()}>
            {paymentConfirmed ? (
              <>
                <PaymentSuccessCheck />
                <h2 style={{ marginTop: '1rem' }}>{t('cart.paymentConfirmed.title')}</h2>
                <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                  {t('cart.paymentConfirmed.redirecting')}
                </p>
              </>
            ) : (
              <>
                <h2>{t('cart.scanToPay.title')}</h2>
                <PromptPayLogo width={130} />
                <QRImage src={qrCode} alt="PromptPay QR Code" />
                <p>{t('myPurchases.modal.amount', { amount: parseFloat(cheatSheet.price || 0).toFixed(2) })}</p>
                <Instructions>
                  <ol>
                    {paymentInstructions
                      ? Object.values(paymentInstructions).map((step, i) => <li key={i}>{step}</li>)
                      : (
                        <>
                          <li>{t('cheatSheetDetail.qr.openBankingApp')}</li>
                          <li>{t('cheatSheetDetail.qr.scanQrCode')}</li>
                          <li>{t('cheatSheetDetail.qr.payExactly', { amount: parseFloat(cheatSheet.price || 0).toFixed(2) })}</li>
                        </>
                      )}
                  </ol>
                </Instructions>
                <Button onClick={() => setShowQR(false)} style={{ marginTop: '1rem' }}>
                  {t('common.close')}
                </Button>
              </>
            )}
          </QRContent>
        </QRModal>
      )}
    </Container>
    </>
  );
};

export default CheatSheetDetail;
