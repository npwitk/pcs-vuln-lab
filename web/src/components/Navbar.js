import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartIcon } from './Icons';
import PeanutIcon from './PeanutIcon';
import PartyHat from './PartyHat';
import { ChevronDown, BookOpen, LifeBuoy, Info, Upload as UploadIcon, Settings, BarChart3, DollarSign, Gift, FileText, Calendar, UserCircle, Printer, Search, Store, GraduationCap, Home, Library as LibraryIcon, KeyRound, Tags, Smartphone, X } from 'lucide-react';
import SearchCommandPalette from './SearchCommandPalette';
import InstitutionPicker from './InstitutionPicker';
import useUnderlayContrast from '../hooks/useUnderlayContrast';
import useBirthdayHint from '../hooks/useBirthdayHint';
import { isBirthdayWindow } from '../utils/birthday';

const GLASS_TINT = { light: 'rgba(255, 255, 255, 0.62)', dark: 'rgba(26, 26, 26, 0.62)' };

// Search box widths per fit mode (px).
const SEARCH_WIDTH = { full: 220, compact: 160, icon: 36 };
// Desktop spacing the fit check has to account for: Nav's gap between its
// three groups, and NavLinks' gap between items.
const GROUP_GAP = 24;
const ITEM_GAP = 8;
// Which links go into More first when the bar runs out of room: Browse
// (the logo already goes home), then Resources, then Admin, then Library.
// Guests: Transfer Code, then Mock Exams, then Browse. The cart, profile and
// sign-in button always stay.
const COLLAPSE_ORDER = ['browse', 'resources', 'redeem', 'mockExams', 'admin', 'library'];
const GLASS_SATURATION = 1.8;

// Once the page scrolls, the bar turns translucent and blurs what's behind
// it (Apple-style glass). The glass lives on ::before rather than the nav
// itself because backdrop-filter on the nav would become the containing
// block for the mobile menu's position: fixed and break its layout.
const Nav = styled.nav`
  box-shadow: ${props => props.$glass ? '0 1px 12px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.1)'};
  border-bottom: 1px solid ${props => props.$glass
    ? (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
    : props.theme.colors.border};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background: ${props => props.$glass
      ? GLASS_TINT[props.theme.mode]
      : props.theme.colors.surface};
    backdrop-filter: ${props => props.$glass ? `saturate(${GLASS_SATURATION * 100}%) blur(20px)` : 'none'};
    -webkit-backdrop-filter: ${props => props.$glass ? `saturate(${GLASS_SATURATION * 100}%) blur(20px)` : 'none'};
    transition: background ${props => props.theme.transitions.normal};
  }
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all ${props => props.theme.transitions.normal};
  height: 64px;

  @media (min-width: 769px) {
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 56px;
    position: sticky;
  }
`;

/* Desktop layout: logo group | search | links, with the two sides equally
   flexible (flex: 1 1 0) so the search sits dead centre while there's room.
   Each side refuses to shrink below its content (min-width: max-content),
   so when space runs out the search is pushed over rather than overlapped.
   It used to be absolutely centred, which let the links slide under it. */
const NavCenter = styled.div`
  flex: 0 0 auto;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

// Groups the logo with the institution picker so they act as one flex item
// under Nav's `justify-content: space-between` — otherwise the picker would
// float in the middle of the bar instead of sitting right next to the logo.
const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;

  @media (min-width: 769px) {
    flex: 1 1 0;
    min-width: max-content;
  }
`;

// $contrastColor overrides the brand color while whatever is scrolling under
// the glass would make the logo hard to read (see useUnderlayContrast).
const Logo = styled(Link)`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.$contrastColor || props.theme.colors.primary};
  letter-spacing: -0.02em;
  transition: color ${props => props.theme.transitions.fast};
  text-decoration: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1000;
  white-space: nowrap;

  &:hover {
    color: ${props => props.$contrastColor || props.theme.colors.primaryHover};
  }
`;

const LogoText = styled.span`
  /* Full text on mobile (when hamburger is active) */
  @media (max-width: 768px) {
    display: inline;
  }

  /* Hide on tablet/small desktop to prevent wrapping */
  @media (min-width: 769px) and (max-width: 1100px) {
    display: none;
  }

  /* Show on large desktop */
  @media (min-width: 1101px) {
    display: inline;
  }
`;

const LogoTextShort = styled.span`
  display: none;

  /* Show abbreviated on tablet/small desktop */
  @media (min-width: 769px) and (max-width: 1100px) {
    display: inline;
  }
`;

const StyledPeanutIcon = styled(PeanutIcon)`
  width: 32px;
  height: 32px;
  fill: currentColor;
  transition: all ${props => props.theme.transitions.fast};
`;

// Peanut's birthday month: a little party hat on the logo's head, a hint for
// the search Easter egg. It bobs while the logo is hovered.
const hatBob = keyframes`
  0%, 100% { transform: translateX(-50%) rotate(14deg) translateY(0); }
  50% { transform: translateX(-50%) rotate(6deg) translateY(-2px); }
`;

const LogoMark = styled.span`
  position: relative;
  display: inline-flex;
`;

// Centred on top of the peanut, tilted a little, its brim just on the head.
const LogoHat = styled(PartyHat)`
  position: absolute;
  top: -12px;
  left: 50%;
  width: 12px;
  height: 14px;
  transform: translateX(-50%) rotate(14deg);
  transform-origin: 50% 100%;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
  pointer-events: none;

  a:hover & {
    animation: ${hatBob} 0.6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    a:hover & { animation: none; }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (min-width: 769px) {
    flex: 1 1 0;
    min-width: max-content;
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100vh;
    background: ${props => props.theme.colors.surface};
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 5rem 2rem 2rem 2rem;
    opacity: ${props => props.$isOpen ? '1' : '0'};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 0;
    overflow-y: auto;
    z-index: 999;

    /* Add scroll behavior for touch devices */
    -webkit-overflow-scrolling: touch;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1000;
  position: relative;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  span {
    width: 25px;
    height: 3px;
    background: ${props => props.theme.colors.text};
    transition: all 0.3s;
    transform-origin: center;
    border-radius: 2px;

    ${props => props.$isOpen && `
      &:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    `}
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.medium};
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  white-space: nowrap;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(19, 29, 79, 0.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 0;
    border-radius: 0;
    font-size: 1.5rem;
    font-weight: ${props => props.theme.typography.weights.medium};
    text-align: left;
    color: ${props => props.theme.colors.text};
    background: transparent;
    border-bottom: 1px solid ${props => props.theme.colors.border};

    &:hover {
      background: transparent;
      color: ${props => props.theme.colors.primary};
    }
  }
`;

// Dropdown trigger button
const DropdownTrigger = styled.button`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.medium};
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  background: ${props => props.$isOpen ? 'rgba(19, 29, 79, 0.05)' : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;

  svg {
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(19, 29, 79, 0.05);
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

// Dropdown menu container. $alignRight anchors it to the trigger's right
// edge, for the More menu at the far end of the bar.
const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: ${props => props.$alignRight ? 'auto' : '0'};
  right: ${props => props.$alignRight ? '0' : 'auto'};
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  min-width: 240px;
  padding: 0.5rem;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;

  @media (max-width: 768px) {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    padding: 0;
    min-width: auto;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
`;

// Dropdown wrapper for positioning
const DropdownWrapper = styled.div`
  position: relative;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

// Dropdown menu item
const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.15s ease;
  font-size: 0.9375rem;
  line-height: 1.5;

  svg {
    opacity: 0.7;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(19, 29, 79, 0.08);
    color: ${props => props.theme.colors.primary};

    svg {
      opacity: 1;
    }
  }

  &:active {
    background: rgba(19, 29, 79, 0.12);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 0;
    font-size: 1.5rem;
    font-weight: ${props => props.theme.typography.weights.medium};
    background: transparent;
    border-radius: 0;
    justify-content: flex-start;
    border-bottom: 1px solid ${props => props.theme.colors.border};

    svg {
      display: none;
    }

    &:hover {
      background: transparent;
      color: ${props => props.theme.colors.primary};
    }
  }
`;

// Dropdown item with description
const DropdownItemWithDesc = styled(DropdownItem)`
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`;

const DropdownItemTitle = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DropdownItemDesc = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.4;
`;

// Dropdown separator
const DropdownSeparator = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.border};
  margin: 0.5rem 0;
`;

// Mobile dropdown label
const MobileDropdownLabel = styled.div`
  display: none;
`;

// Section heading inside the More menu, for a dropdown that was tucked into
// it (Resources, Admin).
const MoreSectionLabel = styled.div`
  padding: 0.375rem 0.875rem 0.25rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textTertiary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

// Invisible copy of every collapsible link and trigger, so their natural
// widths can be measured whether or not they're currently in the bar.
const NavMeasurer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
  display: flex;
  white-space: nowrap;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#131D4F' : 'transparent'};
  color: ${props => props.$primary ? '#fff' : props.theme.colors.text};
  border: ${props => props.$primary ? 'none' : `1.5px solid ${props.theme.colors.border}`};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: ${props => props.theme.typography.weights.semibold};
  transition: all 0.2s ease;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$primary ? '#0F1638' : 'rgba(19, 29, 79, 0.08)'};
    color: ${props => props.$primary ? '#fff' : props.theme.colors.primary};
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 0;
    font-size: 1.5rem;
    font-weight: ${props => props.theme.typography.weights.medium};
    border: none;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    border-radius: 0;
    text-align: left;
    background: transparent;
    color: ${props => props.theme.colors.text};

    &:hover {
      background: transparent;
      color: ${props => props.theme.colors.primary};
      transform: none;
      box-shadow: none;
    }

    &:active {
      transform: none;
    }
  }
`;

// Google Sign-In Button Wrapper
const GoogleSignInButton = styled.div`
  display: inline-block;
  cursor: pointer;

  .gsi-material-button {
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    -webkit-appearance: none;
    background-color: WHITE;
    background-image: none;
    border: 1px solid #747775;
    -webkit-border-radius: 20px;
    border-radius: 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #1f1f1f;
    cursor: pointer;
    font-family: 'Roboto', arial, sans-serif;
    font-size: 14px;
    height: 40px;
    letter-spacing: 0.25px;
    outline: none;
    overflow: hidden;
    padding: 0 12px;
    position: relative;
    text-align: center;
    -webkit-transition: background-color .218s, border-color .218s, box-shadow .218s;
    transition: background-color .218s, border-color .218s, box-shadow .218s;
    vertical-align: middle;
    white-space: nowrap;
    width: auto;
    max-width: 400px;
    min-width: min-content;
  }

  .gsi-material-button .gsi-material-button-icon {
    height: 20px;
    margin-right: 12px;
    min-width: 20px;
    width: 20px;
  }

  .gsi-material-button .gsi-material-button-content-wrapper {
    -webkit-align-items: center;
    align-items: center;
    display: flex;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: nowrap;
    flex-wrap: nowrap;
    height: 100%;
    justify-content: space-between;
    position: relative;
    width: 100%;
  }

  .gsi-material-button .gsi-material-button-contents {
    -webkit-flex-grow: 1;
    flex-grow: 1;
    font-family: 'Roboto', arial, sans-serif;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }

  .gsi-material-button .gsi-material-button-state {
    -webkit-transition: opacity .218s;
    transition: opacity .218s;
    bottom: 0;
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
  }

  .gsi-material-button:disabled {
    cursor: default;
    background-color: #ffffff61;
    border-color: #1f1f1f1f;
  }

  .gsi-material-button:disabled .gsi-material-button-contents {
    opacity: 38%;
  }

  .gsi-material-button:disabled .gsi-material-button-icon {
    opacity: 38%;
  }

  .gsi-material-button:not(:disabled):active .gsi-material-button-state,
  .gsi-material-button:not(:disabled):focus .gsi-material-button-state {
    background-color: #303030;
    opacity: 12%;
  }

  .gsi-material-button:not(:disabled):hover {
    -webkit-box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
    box-shadow: 0 1px 2px 0 rgba(60, 64, 67, .30), 0 1px 3px 1px rgba(60, 64, 67, .15);
  }

  .gsi-material-button:not(:disabled):hover .gsi-material-button-state {
    background-color: #303030;
    opacity: 8%;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #f0f0f0;
  border: 2px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    align-self: center;
  }
`;

const AvatarFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #131D4F 0%, #3B82F6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  border: 2px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
    align-self: center;
  }
`;

const NavLinkWithBadge = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.weights.medium};
  transition: all 0.2s ease;
  position: relative;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9375rem;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(19, 29, 79, 0.05);
  }

  /* Make icon inherit color on hover */
  &:hover svg {
    stroke: ${props => props.theme.colors.primary};
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem 0;
    border-radius: 0;
    font-size: 1.5rem;
    font-weight: ${props => props.theme.typography.weights.medium};
    color: ${props => props.theme.colors.text};
    background: transparent;
    border-bottom: 1px solid ${props => props.theme.colors.border};

    &:hover {
      background: transparent;
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const CartWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  @media (max-width: 768px) {
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #DC2626;
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 999px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
  border: 2px solid ${props => props.theme.colors.surface};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AuthSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    /* Signed in, this sits at the bottom of the full-height menu; for guests
       the Google button follows the links (after Transfer Code) instead. */
    margin-top: ${props => (props.$guest ? '0.5rem' : 'auto')};
    padding-top: 1rem;
  }
`;

const UserName = styled.span`
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 768px) {
    max-width: none;
    font-size: 1.25rem;
  }
`;

const MobileLogoutButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    padding: 1rem 0;
    font-size: 1.5rem;
    font-weight: ${props => props.theme.typography.weights.medium};
    border: none;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    border-radius: 0;
    text-align: left;
    background: transparent;
    color: ${props => props.theme.colors.text};
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const SearchTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4375rem 0.5rem 0.4375rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  /* full / compact / icon, picked by the navbar's fit check (see
     useNavFit): narrows before any link is tucked away, and becomes a
     search-icon button when space is tightest. ⌘K always works. */
  width: ${props => SEARCH_WIDTH[props.$mode] || SEARCH_WIDTH.full}px;
  text-align: left;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
  ${props => props.$clearable && props.$mode !== 'icon' && 'padding-right: 2.125rem;'}

  ${props => props.$mode === 'icon' && `
    justify-content: center;
    padding: 0;
    height: 34px;

    > span, > kbd { display: none; }
  `}

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.backgroundTertiary};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchTriggerWrap = styled.div`
  position: relative;
  display: flex;
`;

// Sits over the right end of SearchTrigger (where ⌘K goes) while a search
// is applied.
const ClearQueryButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0.375rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${props => props.theme.colors.textSecondary};
    color: ${props => props.theme.colors.surface};
  }

  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchTriggerIcon = styled(Search)`
  width: 14px;
  height: 14px;
  flex-shrink: 0;
`;

const SearchTriggerText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${props => props.$hasQuery ? props.theme.colors.text : 'inherit'};
  font-weight: ${props => props.$hasQuery ? props.theme.typography.weights.medium : 'inherit'};
`;

const SearchShortcut = styled.kbd`
  background: ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  border-radius: 4px;
  padding: 0.125rem 0.3125rem;
  font-size: 0.625rem;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
`;

const ProfileDropdownWrapper = styled.div`
  position: relative;
`;

const ProfileMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 4px 6px rgba(0, 0, 0, 0.06);
  min-width: 200px;
  overflow: hidden;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
`;

const ProfileMenuInfo = styled.div`
  padding: 0.875rem 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ProfileMenuName = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileMenuEmail = styled.div`
  font-size: 0.8125rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProfileMenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.625rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 0.9375rem;
  color: ${props => props.$danger ? '#DC2626' : props.theme.colors.text};
  transition: background 0.15s ease;

  &:hover {
    background: ${props => props.$danger ? 'rgba(220, 38, 38, 0.06)' : props.theme.colors.backgroundSecondary};
  }
`;

const Navbar = () => {
  const { t, i18n } = useTranslation();
  // Peanut's birthday month: the Easter egg's hints.
  const birthdayLive = isBirthdayWindow();
  const searchHint = useBirthdayHint();
  const { user, isAuthenticated, isAdmin, isSeller, isStaff, canUpload, canManageApprovals, login, logout } = useAuth();
  const { cartCount } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const theme = useTheme();
  const logoRef = useRef(null);
  const isGlass = isScrolled && !isMenuOpen;
  const logoContrastColor = useUnderlayContrast(logoRef, {
    enabled: isGlass,
    color: theme.colors.primary,
    tint: GLASS_TINT[theme.mode],
    saturation: GLASS_SATURATION,
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const currentQuery = searchParams.get('q') || '';

  // The ✕ on the search box: drops just the query, keeping the other filters.
  const clearSearch = () => {
    const params = Object.fromEntries(searchParams.entries());
    delete params.q;
    setSearchParams(params, { replace: true });
  };

  // DEBUG: Uncomment for troubleshooting user roles (SECURITY: Remove in production)
  // React.useEffect(() => {
  //   if (user) {
  //     console.log('🔍 User Roles:', {
  //       is_admin: user.is_admin,
  //       is_seller: user.is_seller,
  //       is_staff: user.is_staff,
  //       isAdmin,
  //       isSeller,
  //       isStaff,
  //       shouldShowStaffOnly: isStaff && !isAdmin
  //     });
  //   }
  // }, [user, isAdmin, isSeller, isStaff]);

  // Get user initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Reset error state when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.user_id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // ⌘K / Ctrl+K toggles the command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown and menu on route change
  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  // Browse / the logo while already on the home page: the path doesn't
  // change, so App's ScrollToTop never fires. Scroll back up ourselves,
  // like tapping the active tab in an app.
  const handleHomeClick = () => {
    handleLinkClick();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // ---- Menu contents, shared by the bar, the More menu and the measurer.
  const resourcesItems = [
    <DropdownItem key="settings" to="/settings" onClick={handleLinkClick}>
      <UserCircle size={16} />
      <div>{t('nav.settings')}</div>
    </DropdownItem>,
    <DropdownItem key="support" to="/support" onClick={handleLinkClick}>
      <LifeBuoy size={16} />
      <div>{t('nav.support')}</div>
    </DropdownItem>,
    <DropdownItem key="mock" to="/mock-exams" onClick={handleLinkClick}>
      <FileText size={16} />
      <div>{t('nav.mockExams')}</div>
    </DropdownItem>,
    user?.university_group === 'thammasat' && (
      <DropdownItem key="print" to="/print-balance" onClick={handleLinkClick}>
        <Printer size={16} />
        <div>{t('nav.printBalance')}</div>
      </DropdownItem>
    ),
    !isSeller && !isAdmin && !isStaff && (
      <DropdownItem key="apply" to="/apply-seller" onClick={handleLinkClick}>
        <BookOpen size={16} />
        <div>{t('nav.applyToBeSeller')}</div>
      </DropdownItem>
    ),
    canUpload && (
      <DropdownItem key="flagship" to="/request-flagship-store" onClick={handleLinkClick}>
        <Store size={16} />
        <div>{t('nav.requestFlagshipStore')}</div>
      </DropdownItem>
    ),
  ].filter(Boolean);

  const staff = isStaff || isAdmin;
  const adminItems = [
    canUpload && ['/admin/upload', UploadIcon, t('nav.uploadCheatSheet')],
    canUpload && ['/seller/my-cheatsheets', FileText, t('nav.myCheatSheets')],
    canUpload && ['/seller/earnings', DollarSign, t('nav.myEarnings')],
    canUpload && ['/seller/print-requests', Printer, t('nav.printRequests')],
    canUpload && ['/store-management', Store, t('nav.myStore')],
    staff && ['/admin', Settings, isAdmin ? t('nav.adminPanel') : t('nav.approvals')],
    staff && ['/admin/upcoming-exams', Calendar, t('nav.upcomingExams')],
    staff && ['/admin/flagship-store-requests', Store, t('nav.flagshipStoreRequests')],
    staff && ['/admin/courses', GraduationCap, t('nav.courseManagement')],
    staff && ['/admin/study-tags', Tags, t('nav.studyTags')],
    isAdmin && ['/admin/analytics', BarChart3, t('nav.analytics')],
    isAdmin && ['/admin/mobile-app', Smartphone, t('nav.mobileApp')],
    isAdmin && ['/admin/seller-summary', DollarSign, t('nav.sellerSummary')],
    isAdmin && ['/admin/giveaway', Gift, t('nav.giveawayManagement')],
  ].filter(Boolean).map(([to, Icon, label]) => (
    <DropdownItem key={to} to={to} onClick={handleLinkClick}>
      <Icon size={16} />
      <div>{label}</div>
    </DropdownItem>
  ));

  // Collapsible entries: a link, or a dropdown of `items`. `icon` is used
  // when a link is shown inside More.
  const navItems = isAuthenticated
    ? [
        { key: 'browse', to: '/', label: t('nav.browse'), icon: Home, onClick: handleHomeClick },
        { key: 'library', to: '/my-purchases', label: t('nav.library'), icon: LibraryIcon },
        { key: 'resources', label: t('nav.resources'), items: resourcesItems },
        (canUpload || staff) && {
          key: 'admin',
          label: isAdmin ? t('nav.admin') : isSeller ? t('nav.seller') : t('nav.staff'),
          items: adminItems,
        },
      ].filter(Boolean)
    : [
        { key: 'browse', to: '/', label: t('nav.browse'), icon: Home, onClick: handleHomeClick },
        { key: 'mockExams', to: '/mock-exams', label: t('nav.mockExams'), icon: FileText },
        { key: 'redeem', to: '/redeem', label: t('nav.transferCode'), icon: KeyRound },
      ];

  // ---- Fit check: which search size, and which items go into More.
  const navRef = useRef(null);
  const leftRef = useRef(null);
  const cartRef = useRef(null);
  const authRef = useRef(null);
  const measureRefs = useRef({});
  const [fit, setFit] = useState({ search: 'full', collapsed: [] });
  const itemKeys = navItems.map(i => i.key).join(',');

  const computeFit = useCallback(() => {
    const nav = navRef.current;
    if (!nav || !leftRef.current) return;
    const apply = (next) => setFit(prev => (
      prev.search === next.search && prev.collapsed.join() === next.collapsed.join() ? prev : next
    ));
    // The mobile menu lists everything; nothing is tucked away there.
    if (window.matchMedia('(max-width: 768px)').matches) {
      apply({ search: 'full', collapsed: [] });
      return;
    }
    const cs = getComputedStyle(nav);
    const inner = nav.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const width = (key) => measureRefs.current[key]?.offsetWidth || 0;
    const keys = itemKeys.split(',').filter(Boolean);
    const fixed = [cartRef.current, authRef.current].filter(Boolean).map(el => el.offsetWidth);
    const order = COLLAPSE_ORDER.filter(k => keys.includes(k));

    // Candidates, most generous first: shrink the search before hiding any
    // link, and only turn it into an icon once two links have gone.
    const candidates = [['full', []], ['compact', []]];
    order.forEach((_, n) => {
      const collapsed = order.slice(0, n + 1);
      candidates.push(['compact', collapsed]);
      if (n >= 1) candidates.push(['icon', collapsed]);
    });

    // The logo group's *content* width (logo + institution picker), not its
    // box: the box is a flexible column that absorbs spare space, so
    // measuring it would feed the current layout back into the check and
    // keep a once-cramped bar collapsed after the window grows again.
    const leftEl = leftRef.current;
    const leftKids = [...leftEl.children];
    const leftWidth = leftKids.reduce((sum, el) => sum + el.offsetWidth, 0)
      + parseFloat(getComputedStyle(leftEl).columnGap || 0) * Math.max(0, leftKids.length - 1);

    const fits = ([search, collapsed]) => {
      const shown = keys.filter(k => !collapsed.includes(k));
      const widths = [...shown.map(width), ...(collapsed.length ? [width('more')] : []), ...fixed];
      const right = widths.reduce((a, b) => a + b, 0) + ITEM_GAP * Math.max(0, widths.length - 1);
      return leftWidth + SEARCH_WIDTH[search] + right + 2 * GROUP_GAP <= inner;
    };
    const [search, collapsed] = candidates.find(fits) || candidates[candidates.length - 1];
    apply({ search, collapsed });
  }, [itemKeys]);

  useLayoutEffect(() => {
    computeFit();
    const observer = new ResizeObserver(() => computeFit());
    [navRef.current, ...(leftRef.current ? [...leftRef.current.children] : []),
      cartRef.current, authRef.current, ...Object.values(measureRefs.current)]
      .filter(Boolean)
      .forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [computeFit, isAuthenticated, i18n.language]);

  const collapsedItems = navItems.filter(i => fit.collapsed.includes(i.key));

  return (
    <>
      <SearchCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
      <Nav $glass={isGlass} ref={navRef}>
        <NavMeasurer aria-hidden="true">
          {navItems.map(item => (item.items ? (
            <DropdownTrigger as="span" key={item.key} ref={el => { measureRefs.current[item.key] = el; }}>
              {item.label}
              <ChevronDown size={16} />
            </DropdownTrigger>
          ) : (
            <NavLink as="span" key={item.key} ref={el => { measureRefs.current[item.key] = el; }}>
              {item.label}
            </NavLink>
          )))}
          <DropdownTrigger as="span" ref={el => { measureRefs.current.more = el; }}>
            {t('nav.more')}
            <ChevronDown size={16} />
          </DropdownTrigger>
        </NavMeasurer>

        <LogoGroup ref={leftRef}>
          <Logo ref={logoRef} to="/" onClick={handleHomeClick} $contrastColor={logoContrastColor}>
            <LogoMark title={birthdayLive ? t('birthday.hatHint') : undefined}>
              <StyledPeanutIcon />
              {birthdayLive && <LogoHat />}
            </LogoMark>
            <LogoText>Peanut Cheat Sheets</LogoText>
            <LogoTextShort>PCS</LogoTextShort>
          </Logo>
          <InstitutionPicker />
        </LogoGroup>

        <HamburgerButton
          $isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={t('nav.toggleMenu')}
        >
          <span></span>
          <span></span>
          <span></span>
        </HamburgerButton>

        <NavCenter>
          <SearchTriggerWrap>
            <SearchTrigger
              $mode={fit.search}
              $clearable={!!currentQuery}
              onClick={() => setIsPaletteOpen(prev => !prev)}
              aria-label={t('nav.openSearch')}
              title={fit.search === 'icon' ? t('nav.openSearch') : undefined}
            >
              <SearchTriggerIcon />
              <SearchTriggerText
                $hasQuery={!!currentQuery}
                style={!currentQuery ? { opacity: searchHint.fading ? 0 : 1, transition: 'opacity 0.2s ease' } : undefined}
              >
                {currentQuery || (searchHint.hint ? t('birthday.searchHint') : t('nav.searchPlaceholder'))}
              </SearchTriggerText>
              {!currentQuery && <SearchShortcut>⌘K</SearchShortcut>}
            </SearchTrigger>
            {/* A sibling, not inside the trigger: a button can't hold a button. */}
            {currentQuery && fit.search !== 'icon' && (
              <ClearQueryButton
                type="button"
                onClick={clearSearch}
                aria-label={t('nav.clearSearch')}
                title={t('nav.clearSearch')}
              >
                <X size={14} />
              </ClearQueryButton>
            )}
          </SearchTriggerWrap>
        </NavCenter>

        <NavLinks $isOpen={isMenuOpen} ref={dropdownRef}>
          {/* Transfer Code is deliberately not offered to signed-in users —
              it exists for redeeming a code on a device you're NOT logged
              into. Print Balance is Thammasat-only and needs a login. */}
          {navItems.filter(item => !fit.collapsed.includes(item.key)).map(item => (item.items ? (
            <DropdownWrapper key={item.key}>
              <DropdownTrigger
                $isOpen={openDropdown === item.key}
                onClick={() => toggleDropdown(item.key)}
              >
                {item.label}
                <ChevronDown size={16} />
              </DropdownTrigger>
              {/* Opens leftwards: these triggers sit at the right end of
                  the bar, and a menu hanging off the window's edge (even
                  while hidden) makes the whole page scroll sideways. */}
              <DropdownMenu $isOpen={openDropdown === item.key} $alignRight>
                {item.items}
              </DropdownMenu>
            </DropdownWrapper>
          ) : (
            <NavLink key={item.key} to={item.to} onClick={item.onClick || handleLinkClick}>
              {item.label}
            </NavLink>
          )))}

          {/* Desktop only: whatever didn't fit in the bar, lowest priority
              first (see COLLAPSE_ORDER). Never shown on mobile, where the
              fit check collapses nothing. */}
          {collapsedItems.length > 0 && (
            <DropdownWrapper>
              <DropdownTrigger
                $isOpen={openDropdown === 'more'}
                onClick={() => toggleDropdown('more')}
              >
                {t('nav.more')}
                <ChevronDown size={16} />
              </DropdownTrigger>
              <DropdownMenu $isOpen={openDropdown === 'more'} $alignRight>
                {collapsedItems.filter(item => !item.items).map(item => {
                  const Icon = item.icon;
                  return (
                    <DropdownItem key={item.key} to={item.to} onClick={item.onClick || handleLinkClick}>
                      <Icon size={16} />
                      <div>{item.label}</div>
                    </DropdownItem>
                  );
                })}
                {collapsedItems.filter(item => item.items).map((item, i) => (
                  <React.Fragment key={item.key}>
                    {(i > 0 || collapsedItems.some(c => !c.items)) && <DropdownSeparator />}
                    <MoreSectionLabel>{item.label}</MoreSectionLabel>
                    {item.items}
                  </React.Fragment>
                ))}
              </DropdownMenu>
            </DropdownWrapper>
          )}

          {isAuthenticated && (
            <>
              {/* Cart with badge */}
              <NavLinkWithBadge ref={cartRef} to="/cart" onClick={handleLinkClick} aria-label={t('nav.cart')}>
                <CartWrapper>
                  <CartIcon size={20} />
                  {cartCount > 0 && <CartBadge>{cartCount}</CartBadge>}
                </CartWrapper>
              </NavLinkWithBadge>

              {/* Mobile-only Logout button */}
              <MobileLogoutButton onClick={() => { logout(); handleLinkClick(); }}>
                {t('nav.logout')}
              </MobileLogoutButton>
            </>
          )}

          <AuthSection $guest={!isAuthenticated} ref={authRef}>
            {isAuthenticated ? (
              <UserInfo>
                <ProfileDropdownWrapper>
                  <div
                    onClick={() => toggleDropdown('profile')}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    aria-label={t('nav.profileMenu')}
                  >
                    {user?.avatar_url && !imageError ? (
                      <Avatar
                        src={user.avatar_url}
                        alt={user.name}
                        onError={handleImageError}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <AvatarFallback title={user?.name}>
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    )}
                  </div>
                  <ProfileMenu $isOpen={openDropdown === 'profile'}>
                    <ProfileMenuInfo>
                      <ProfileMenuName>{user?.name}</ProfileMenuName>
                      {user?.email && <ProfileMenuEmail>{user.email}</ProfileMenuEmail>}
                    </ProfileMenuInfo>
                    <ProfileMenuItem $danger onClick={() => { logout(); handleLinkClick(); }}>
                      {t('nav.logout')}
                    </ProfileMenuItem>
                  </ProfileMenu>
                </ProfileDropdownWrapper>
              </UserInfo>
            ) : (
              <GoogleSignInButton onClick={() => { login(); handleLinkClick(); }}>
                <button className="gsi-material-button">
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">Sign in with Google</span>
                  </div>
                </button>
              </GoogleSignInButton>
            )}
          </AuthSection>
        </NavLinks>
      </Nav>
    </>
  );
};

export default Navbar;
