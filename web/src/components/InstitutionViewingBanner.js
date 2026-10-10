import React, { useLayoutEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInstitutions } from '../context/InstitutionContext';
import { resolveLogoUrl } from '../utils/resolveLogoUrl';
import Collapsible from './Collapsible';
import useIsMobile from '../hooks/useIsMobile';

// Full-width strip under the navbar, shown when a signed-in user is browsing
// an institution other than their own. Painted in that institution's
// brand_color (admin-set, falls back to the site primary) so it's obvious at
// a glance whose homepage this is.
//
// Home uses the navbar picker's institution. The cheat sheet page passes
// `institutionId` (the sheet's own) and `variant="sheet"`, which rewords it
// ("This sheet is from …") and makes the button go back to the user's own
// institution's homepage.
//
// Sticks under the navbar, and publishes its current height as
// --institution-banner-height on <html> so other sticky elements (the sheet
// page's preview) can sit below it.

const DISMISS_KEY = 'pcs_institution_banner_dismissed';
const DARK_TEXT = '#1D1D1F';
const LIGHT_TEXT = '#FFFFFF';

const readDismissed = () => {
  try {
    const ids = JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
};

// WCAG relative luminance, as in hooks/useUnderlayContrast.js.
const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

// Whichever of near-black or white contrasts more with the brand color.
const textColorOn = (hex) => {
  const l = luminance(hex);
  return (1.05) / (l + 0.05) >= (l + 0.05) / (luminance(DARK_TEXT) + 0.05) ? LIGHT_TEXT : DARK_TEXT;
};

// Sticky needs to be on the outermost box in the page flow (the Collapsible
// only wraps the strip), so it goes on this wrapper. Just under the navbar's
// z-index (1000) so navbar dropdowns and the mobile menu cover it. `top` is
// set inline from the navbar's measured height (see below); these are only
// the first-paint fallbacks.
const StickyWrap = styled.div`
  position: sticky;
  top: 63px;
  z-index: 998;

  @media (max-width: 768px) {
    top: 55px;
  }
`;

const Strip = styled.div`
  position: relative;
  background: ${props => props.$bg};
  color: ${props => props.$fg};
  font-size: ${props => props.theme.typography.sizes.sm};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Inner = styled.div`
  max-width: 1200px;
  min-height: 44px;
  margin: 0 auto;
  padding: 0.5rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  text-align: center;

  /* One line on mobile: message on the left (name truncates if needed),
     button pushed right next to the X. */
  @media (max-width: 768px) {
    min-height: 44px;
    padding: 0.375rem 2.75rem 0.375rem 1rem;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 0.625rem;
    text-align: left;
  }
`;

const Message = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  line-height: 1.35;
`;

const MessageText = styled.span`
  min-width: 0;

  @media (max-width: 768px) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`;

// White tile behind the logo so transparent or white-background logos still
// read on any brand color.
const LogoTile = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  overflow: hidden;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: ${props => props.theme.radius.sm};
  color: #1D1D1F;
  font-size: 0.6875rem;
  font-weight: ${props => props.theme.typography.weights.bold};

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 2px;
  }
`;

const NameLink = styled.a`
  color: inherit;
  font-weight: ${props => props.theme.typography.weights.bold};
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
  transition: text-decoration-color ${props => props.theme.transitions.fast};

  &:hover {
    color: inherit;
    text-decoration-color: currentColor;
  }
`;

const NameText = styled.strong`
  font-weight: ${props => props.theme.typography.weights.bold};
`;

const BackButton = styled.button`
  background: color-mix(in srgb, currentColor 14%, transparent);
  color: inherit;
  border: 1px solid color-mix(in srgb, currentColor 30%, transparent);
  border-radius: ${props => props.theme.radius.full};
  padding: 0.25rem 0.75rem;
  font: inherit;
  font-weight: ${props => props.theme.typography.weights.semibold};
  white-space: nowrap;
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};

  &:hover {
    background: color-mix(in srgb, currentColor 24%, transparent);
  }

  @media (max-width: 768px) {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0.1875rem 0.625rem;
    font-size: ${props => props.theme.typography.sizes.xs};
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: inherit;
  opacity: 0.75;
  cursor: pointer;
  transition: opacity ${props => props.theme.transitions.fast}, background-color ${props => props.theme.transitions.fast};

  &:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 14%, transparent);
  }
`;

const InstitutionViewingBanner = ({ institutionId, variant = 'browse' }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const { institutions, selectedInstitution, selectedInstitutionData, setSelectedInstitution } = useInstitutions();
  const [dismissed, setDismissed] = useState(readDismissed);
  // Last strip shown, so it can collapse away with its old contents after
  // the conditions stop holding (e.g. "Back to SIIT" was just clicked).
  const lastStripRef = useRef(null);
  const wrapRef = useRef(null);
  const [stickyTop, setStickyTop] = useState(null);

  const homeId = user?.institution_id;
  const viewing = institutionId !== undefined
    ? institutions.find(inst => inst.institution_id === institutionId) || null
    : (selectedInstitution === 'all' ? null : selectedInstitutionData);
  const visible = Boolean(
    isAuthenticated
    && homeId
    && viewing
    && viewing.institution_id !== homeId
    && !dismissed.includes(viewing.institution_id)
  );

  // Keep --institution-banner-height in step with the strip, including
  // mid-collapse, and reset it when this page unmounts.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const root = document.documentElement;
    if (!el) return undefined;
    const publish = () => root.style.setProperty('--institution-banner-height', `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.setProperty('--institution-banner-height', '0px');
    };
  }, []);

  // Pin exactly to the navbar's real bottom edge rather than a hard-coded
  // height, tucked 1px under it (the navbar paints above) so no sliver of
  // page content shows through between the two.
  useLayoutEffect(() => {
    const nav = document.querySelector('nav');
    if (!nav) return undefined;
    const measure = () => setStickyTop(Math.max(0, Math.floor(nav.getBoundingClientRect().height) - 1));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  if (visible) {
    const home = institutions.find(inst => inst.institution_id === homeId);
    const bg = viewing.brand_color || theme.colors.primary;
    const logoUrl = resolveLogoUrl(viewing.logo_filename);
    const isSheet = variant === 'sheet';

    const handleDismiss = () => {
      const next = [...dismissed, viewing.institution_id];
      setDismissed(next);
      try { localStorage.setItem(DISMISS_KEY, JSON.stringify(next)); } catch {}
    };

    const handleBack = () => {
      setSelectedInstitution(home.institution_id);
      if (isSheet) navigate('/');
    };

    // Mobile shortens everything: "Viewing SIIT" rather than the full
    // sentence and full name, so the button fits on the same line.
    const messageKey = isSheet
      ? (isMobile ? 'institutionBanner.sheetFromShort' : 'institutionBanner.sheetFrom')
      : (isMobile ? 'institutionBanner.viewingShort' : 'institutionBanner.viewing');
    const displayName = isMobile ? (viewing.short_name || viewing.name) : viewing.name;

    // Split the translated sentence around the name so word order stays
    // per-locale.
    const [prefix, suffix] = t(messageKey, { name: '\u0000' }).split('\u0000');
    const name = viewing.website_url ? (
      <NameLink href={viewing.website_url} target="_blank" rel="noopener noreferrer" title={viewing.name}>{displayName}</NameLink>
    ) : (
      <NameText title={viewing.name}>{displayName}</NameText>
    );

    lastStripRef.current = (
      <Strip
        role="region"
        aria-label={t('institutionBanner.label')}
        $bg={bg}
        $fg={textColorOn(bg)}
      >
        <Inner>
          <Message>
            <LogoTile aria-hidden="true">
              {logoUrl ? <img src={logoUrl} alt="" /> : viewing.short_name?.charAt(0)}
            </LogoTile>
            <MessageText>{prefix}{name}{suffix}</MessageText>
          </Message>
          {home && (
            <BackButton type="button" onClick={handleBack}>
              {t(isSheet ? 'institutionBanner.browseHome' : 'institutionBanner.backTo', { name: home.short_name })}
            </BackButton>
          )}
        </Inner>
        <DismissButton type="button" onClick={handleDismiss} aria-label={t('institutionBanner.dismiss')}>
          <X size={16} />
        </DismissButton>
      </Strip>
    );
  }

  return (
    <StickyWrap ref={wrapRef} style={stickyTop !== null ? { top: stickyTop } : undefined}>
      <Collapsible open={visible} duration={300}>{lastStripRef.current}</Collapsible>
    </StickyWrap>
  );
};

export default InstitutionViewingBanner;
