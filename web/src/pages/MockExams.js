import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  Search, X, FileText, FileCode, Box, KeyRound, Lock, Clock, BookOpen, CheckCircle2, AlertCircle, Mail,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { mockExamsAPI, analyticsAPI } from '../services/api';
import { useInstitutions } from '../context/InstitutionContext';
import usePageMeta from '../hooks/usePageMeta';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

// Mock exam collection. Each institution has its own set (migration 079); the
// page follows the navbar's institution picker, like Home. Exams are grouped
// by year and semester, newest first, as cards in the same style as the
// cheat sheet cards.

const TEMPLATE_URL = 'https://github.com/npwitk/Peanut-Mock-Exam-Template';
const CONTACT_EMAIL = 'hey@npwitk.com';
// Matches server/routes/mockExams.js: an exam opens 3 days before exam_date.
const LOCK_THRESHOLD_DAYS = 3;

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const YEAR_ORDER = { '4th Year': 0, '3rd Year': 1, '2nd Year': 2, '1st Year': 3 };
const SEM_ORDER = { '2nd Semester': 0, '1st Semester': 1 };
const TYPE_ORDER = { Final: 0, Midterm: 1, Quiz: 2 };

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 2rem 3rem;
  min-height: calc(100vh - 60px);

  @media (max-width: 768px) {
    padding: 1rem 1rem 2.5rem;
  }
`;

// Centred and stacked, with a big title so its bubble and pen X lead.
const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0 2.75rem;
`;

const Title = styled.h1`
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  font-weight: ${props => props.theme.typography.weights.bold};
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.75rem;
`;

// The "o" in the title as a multiple-choice bubble: an "A" in a circle,
// shaded in with pencil. The scribble draws itself in once on load.
const shadeIn = keyframes`
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
`;

const BubbleSvg = styled.svg`
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  margin: 0 0.035em;
  /* Sits on the baseline like the other lowercase letters. */
  vertical-align: -0.05em;
  overflow: visible;

  .scribble {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: ${shadeIn} 0.9s ease-in-out 0.35s both;
  }

  @media (prefers-reduced-motion: reduce) {
    .scribble { animation: none; }
  }
`;

// Zigzag pencil strokes, close enough together to read as a filled bubble.
const SCRIBBLE = 'M34 11 L66 9 L20 20 L80 16 L15 30 L85 25 L12 40 L88 35 L11 50 L89 45 L12 60 L88 55 L14 70 L86 65 L19 80 L81 76 L30 89 L70 88';

function AnswerBubble() {
  return (
    <BubbleSvg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="mock-bubble-clip">
          <circle cx="50" cy="50" r="41" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" />
      <text x="50" y="66" textAnchor="middle" fontSize="46" fontWeight="700" fill="currentColor">A</text>
      <path
        className="scribble"
        d={SCRIBBLE}
        pathLength="1"
        clipPath="url(#mock-bubble-clip)"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.92"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BubbleSvg>
  );
}

// The "x" as a hand-drawn X mark, two pen strokes drawn in after the
// bubble has been shaded.
const MarkSvg = styled.svg`
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  margin: 0 0.02em;
  vertical-align: -0.02em;
  overflow: visible;

  path {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
    animation: ${shadeIn} 0.28s ease-out both;
  }
  path:first-of-type { animation-delay: 1.3s; }
  path:last-of-type { animation-delay: 1.6s; }

  @media (prefers-reduced-motion: reduce) {
    path { animation: none; }
  }
`;

function CrossMark() {
  return (
    <MarkSvg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path d="M12 10 Q46 46 90 92" pathLength="1" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
      <path d="M88 8 Q52 50 10 90" pathLength="1" fill="none" stroke="currentColor" strokeWidth="15" strokeLinecap="round" />
    </MarkSvg>
  );
}

// Shows the page title with its first "o" as an answer bubble and the first
// "x" after it as a pen X (the English "Mock Exams"). Titles without them,
// like the Thai one, stay plain text.
function BubbleTitle({ text }) {
  const o = text.indexOf('o');
  const x = text.indexOf('x', o + 1);
  if (o < 0 && x < 0) return <Title>{text}</Title>;

  const parts = [];
  let from = 0;
  [[o, <AnswerBubble key="o" />], [x, <CrossMark key="x" />]]
    .filter(([at]) => at >= 0)
    .forEach(([at, mark]) => {
      parts.push(text.slice(from, at), mark);
      from = at + 1;
    });
  parts.push(text.slice(from));

  return (
    <Title aria-label={text}>
      <span aria-hidden="true">{parts}</span>
    </Title>
  );
}

const Subtitle = styled.p`
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  font-weight: ${props => props.theme.typography.weights.medium};
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
  max-width: 620px;
  margin-bottom: 1.25rem;
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1.5px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

// ---------------------------------------------------------------------------
// Search and filters (Home's field and pills)
// ---------------------------------------------------------------------------

// Centred under the header: search, then the filter pills.
const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 2.25rem;
`;

const SearchField = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 480px;
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
`;

const SearchInput = styled.input`
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

const IconButton = styled.button`
  display: flex;
  padding: 0.25rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
`;

// The year and exam-type pills, centred as one group.
const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem 1.25rem;
  flex-wrap: wrap;
`;

const Pills = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Pill = styled.button`
  padding: 0.375rem 0.875rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: 0.875rem;
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1.5px solid ${props => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  background: ${props => (props.$active ? props.theme.colors.primary : 'transparent')};
  color: ${props => (props.$active ? '#fff' : props.theme.colors.textSecondary)};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => (props.$active ? '#fff' : props.theme.colors.primary)};
  }
`;

const FilterDivider = styled.span`
  width: 1px;
  height: 22px;
  background: ${props => props.theme.colors.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

// ---------------------------------------------------------------------------
// Sections and cards
// ---------------------------------------------------------------------------

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

// Double rule underneath, like the header of an exam paper.
const SectionHeading = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px double ${props => props.theme.colors.border};
`;

const Count = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Each exam is a sheet of answer paper: faint ruled lines, a red margin line
// down the left, and a folded corner top right. All from theme colours (hex
// plus an alpha suffix), so it holds up in dark mode.
const RULE = 28; // px between ruled lines
const FOLD = 22; // px, the folded corner
const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.25rem 1.25rem 1.25rem 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  border-top-right-radius: 0;
  background-color: ${props => props.theme.colors.surface};
  background-image:
    linear-gradient(to right,
      transparent 1.25rem,
      ${props => props.theme.colors.error}38 1.25rem,
      ${props => props.theme.colors.error}38 calc(1.25rem + 1px),
      transparent calc(1.25rem + 1px)),
    repeating-linear-gradient(to bottom,
      transparent 0,
      transparent ${RULE - 1}px,
      ${props => props.theme.colors.border}55 ${RULE - 1}px,
      ${props => props.theme.colors.border}55 ${RULE}px);
  background-position: 0 0, 0 0.5rem;
  /* The folded corner is cut off the sheet for real, so nothing (not even
     the hover shadow, see Sheet) shows behind it. */
  clip-path: polygon(0 0, calc(100% - ${FOLD}px) 0, 100% ${FOLD}px, 100% 100%, 0 100%);

  /* The flap: folded down over the corner, with the crease along its edge. */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: ${FOLD}px;
    height: ${FOLD}px;
    background: linear-gradient(225deg,
      transparent calc(50% - 0.5px),
      ${props => props.theme.colors.border} calc(50% - 0.5px) calc(50% + 0.5px),
      ${props => props.theme.colors.backgroundSecondary} calc(50% + 0.5px));
    box-shadow: -1px 1px 0 ${props => props.theme.colors.border};
    pointer-events: none;
  }
`;

// Lifts the sheet on hover. The shadow is a drop-shadow on this wrapper, so
// it follows the sheet's cut outline instead of a rectangle.
const Sheet = styled.div`
  display: flex;
  transition: filter ${props => props.theme.transitions.fast}, transform ${props => props.theme.transitions.fast};

  > article { flex: 1; min-width: 0; }

  &:hover {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12));
    transform: translateY(-2px);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover { transform: none; }
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  /* Clear of the folded corner. */
  padding-right: 0.5rem;
`;

const Tags = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: 0;
`;

const CodePill = styled.span`
  padding: 0.3rem 0.75rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.02em;
  text-transform: uppercase;
  white-space: nowrap;
`;

const MetaPill = styled.span`
  padding: 0.25rem 0.7rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.medium};
  white-space: nowrap;
`;

const CourseName = styled.h3`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  line-height: 1.35;
  color: ${props => props.theme.colors.text};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Accuracy = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

// Accuracy as answer-sheet bubbles: filled up to the rating.
const Bubbles = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`;

const Bubble = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px solid ${props => (props.$on ? props.theme.colors.primary : props.theme.colors.border)};
  background: ${props => (props.$on ? props.theme.colors.primary : 'transparent')};
`;

// Files sit right under the course name; extra card height is blank ruled
// paper below.
const Files = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const GroupLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${props => props.theme.colors.textSecondary};
`;

// One slim row per file: type icon, name, format tag on the right.
const FileLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  text-decoration: none;
  transition: border-color ${props => props.theme.transitions.fast}, color ${props => props.theme.transitions.fast};

  svg {
    flex-shrink: 0;
    color: ${props => props.theme.colors.primary};
  }

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const FileName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FormatTag = styled.span`
  flex-shrink: 0;
  padding: 0.0625rem 0.4rem;
  border-radius: ${props => props.theme.radius.sm};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.6875rem;
  font-weight: ${props => props.theme.typography.weights.semibold};
  letter-spacing: 0.03em;
`;

const Muted = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const LockedPanel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem 0.9rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

const TextButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

// ---------------------------------------------------------------------------
// Contribute callout
// ---------------------------------------------------------------------------

const Callout = styled.aside`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 1.5rem;
  border: 1.5px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.backgroundSecondary};

  h2 {
    font-size: ${props => props.theme.typography.sizes.lg};
    font-weight: ${props => props.theme.typography.weights.bold};
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.25rem;
  }

  p {
    color: ${props => props.theme.colors.textSecondary};
    max-width: 560px;
  }
`;

const CalloutActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  border: 1.5px solid ${props => (props.$primary ? props.theme.colors.primary : props.theme.colors.border)};
  background: ${props => (props.$primary ? props.theme.colors.primary : props.theme.colors.surface)};
  color: ${props => (props.$primary ? 'white' : props.theme.colors.text)};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    ${props => (props.$primary ? `background: ${props.theme.colors.primaryHover};` : `color: ${props.theme.colors.primary};`)}
  }
`;

// ---------------------------------------------------------------------------
// Guidelines and password dialogs
// ---------------------------------------------------------------------------

const GuideList = styled.ol`
  padding-left: 1.25rem;
  margin: 0 0 1.25rem;

  li {
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }

  strong { color: ${props => props.theme.colors.text}; }
`;

const Note = styled.div`
  display: flex;
  gap: 0.75rem;
  margin: 0 0 1.25rem;
  padding: 0.875rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  border-left: 3px solid ${props => props.theme.colors.warning};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;

  svg { flex-shrink: 0; color: ${props => props.theme.colors.warning}; margin-top: 2px; }
`;

const Checklist = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    gap: 0.6rem;
    color: ${props => props.theme.colors.textSecondary};
    line-height: 1.6;
    margin-bottom: 0.6rem;
  }

  svg { flex-shrink: 0; color: ${props => props.theme.colors.success}; margin-top: 3px; }
  strong { color: ${props => props.theme.colors.text}; }
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border: 1.5px solid ${props => (props.$error ? props.theme.colors.error : props.theme.colors.border)};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 16px;
  outline: none;

  &:focus { border-color: ${props => props.theme.colors.primary}; }
`;

const ErrorText = styled.p`
  && {
    color: ${props => props.theme.colors.error};
    font-size: ${props => props.theme.typography.sizes.sm};
    margin-bottom: 0.75rem;
  }
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;

  &:hover:not(:disabled) { background: ${props => props.theme.colors.primaryHover}; }
  &:disabled { opacity: 0.6; cursor: default; }
`;

// ---------------------------------------------------------------------------

function opensOn(examDate, language) {
  if (!examDate) return null;
  const date = new Date(new Date(examDate).getTime() - LOCK_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
  return date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' });
}

// Reads the labels staff give files, e.g. "Set 1 - Solution (NB)":
// { set: '1', name: 'Solution', format: 'NB' }. Anything missing is null.
export function parseFileLabel(label) {
  let rest = (label || '').trim();
  let format = null;
  const formatMatch = /\s*\(([^()]{1,8})\)\s*$/.exec(rest);
  if (formatMatch) {
    format = formatMatch[1].trim().toUpperCase();
    rest = rest.slice(0, formatMatch.index).trim();
  }
  let set = null;
  const setMatch = /^set\s*([\w]+)\s*(?:[-–—:]\s*(.*))?$/i.exec(rest);
  if (setMatch) {
    set = setMatch[1];
    rest = (setMatch[2] || '').trim();
  }
  return { set, name: rest || null, format };
}

// The file's format: from its label, else its URL's extension.
function fileFormat(file, parsed) {
  if (parsed.format) return parsed.format;
  const ext = /\.([a-z0-9]{2,5})(?:$|[?#])/i.exec(file.url || '');
  return ext ? ext[1].toUpperCase() : null;
}

const CODE_FORMATS = new Set(['NB', 'IPYNB', 'PY', 'ZIP', 'SQL', 'JAVA', 'C', 'CPP', 'JS']);
const MODEL_FORMATS = new Set(['STL', 'OBJ', '3MF', 'STEP']);
function FileIcon({ format, answer }) {
  if (answer) return <KeyRound size={15} aria-hidden="true" />;
  if (CODE_FORMATS.has(format)) return <FileCode size={15} aria-hidden="true" />;
  if (MODEL_FORMATS.has(format)) return <Box size={15} aria-hidden="true" />;
  return <FileText size={15} aria-hidden="true" />;
}

// Question files grouped by set ("Set 1", "Set 2", in order), then the
// answer keys as their own group.
function groupFiles(exam, t) {
  const groups = new Map();
  exam.questionFiles.forEach((file, i) => {
    const parsed = parseFileLabel(file.label);
    const key = parsed.set ? `set-${parsed.set}` : 'questions';
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        order: parsed.set ? (parseInt(parsed.set, 10) || 0) : -1,
        label: parsed.set ? t('mockExams.setN', { n: parsed.set }) : null,
        files: [],
      });
    }
    groups.get(key).files.push({
      file,
      name: parsed.name || (parsed.set ? t('mockExams.questions')
        : exam.questionFiles.length > 1 ? t('mockExams.setN', { n: i + 1 }) : t('mockExams.questions')),
      format: fileFormat(file, parsed),
    });
  });
  const ordered = [...groups.values()].sort((a, b) => a.order - b.order);
  // A lone unlabelled group needs no heading.
  if (ordered.length > 1) ordered.forEach(g => { if (!g.label) g.label = t('mockExams.questions'); });
  return ordered;
}

function AccuracyMeter({ value, t }) {
  if (!(value > 0)) return null;
  return (
    <Accuracy title={t('mockExams.accuracyHint')}>
      {t('mockExams.accuracy')}
      <Bubbles role="img" aria-label={t('mockExams.accuracyOf', { value })}>
        {[1, 2, 3, 4].map(level => <Bubble key={level} $on={level <= value} />)}
      </Bubbles>
    </Accuracy>
  );
}

function MockExamCard({ exam, showInstitution, onUnlock, onOpenFile, t, language }) {
  // Only an exam with no question paper yet is "coming soon". accuracy -1 is
  // just "not rated yet" (e.g. before the real exam has happened); those
  // exams still show their files, without the meter.
  const comingSoon = !exam.isLocked && exam.questionFiles.length === 0;

  return (
    <Sheet>
      <Card>
        <CardTop>
          <Tags>
            <CodePill>{exam.courseCode}</CodePill>
            <MetaPill>{t(`mockExams.types.${exam.examType}`, exam.examType)}</MetaPill>
            {showInstitution && exam.institution && <MetaPill>{exam.institution}</MetaPill>}
          </Tags>
          <AccuracyMeter value={exam.accuracy} t={t} />
        </CardTop>

        <CourseName title={exam.title}>{exam.title}</CourseName>

        {exam.isLocked ? (
          <LockedPanel>
            <Muted>
              <Lock size={14} />
              {exam.examDate ? t('mockExams.opensOn', { date: opensOn(exam.examDate, language) }) : t('mockExams.locked')}
            </Muted>
            {exam.hasPassword && (
              <TextButton type="button" onClick={() => onUnlock(exam)}>{t('mockExams.havePassword')}</TextButton>
            )}
          </LockedPanel>
        ) : comingSoon ? (
          <Files>
            <Muted><Clock size={14} />{t('mockExams.comingSoon')}</Muted>
          </Files>
        ) : (
          <Files>
            {groupFiles(exam, t).map(group => (
              <FileGroup key={group.key}>
                {group.label && <GroupLabel>{group.label}</GroupLabel>}
                {group.files.map(({ file, name, format }) => (
                  <FileLink
                    key={file.file_id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onOpenFile(exam, 'question')}
                  >
                    <FileIcon format={format} />
                    <FileName>{name}</FileName>
                    {format && <FormatTag>{format}</FormatTag>}
                  </FileLink>
                ))}
              </FileGroup>
            ))}
            {exam.answerFiles.length > 0 ? (
              <FileGroup>
                <GroupLabel>{t('mockExams.answerKey')}</GroupLabel>
                {exam.answerFiles.map(file => {
                  const parsed = parseFileLabel(file.label);
                  const format = fileFormat(file, parsed);
                  const name = [parsed.set && t('mockExams.setN', { n: parsed.set }), parsed.name]
                    .filter(Boolean).join(' · ') || t('mockExams.answerKey');
                  return (
                    <FileLink
                      key={file.file_id}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onOpenFile(exam, 'answer')}
                    >
                      <FileIcon answer />
                      <FileName>{name}</FileName>
                      {format && <FormatTag>{format}</FormatTag>}
                    </FileLink>
                  );
                })}
              </FileGroup>
            ) : (
              <Muted><Clock size={14} />{t('mockExams.answerKeySoon')}</Muted>
            )}
          </Files>
        )}
      </Card>
    </Sheet>
  );
}

const MockExams = () => {
  const { t, i18n } = useTranslation();
  usePageMeta(t('mockExams.title'));
  const { selectedInstitution, selectedInstitutionData } = useInstitutions();
  const institutionId = selectedInstitution === 'all' ? null : selectedInstitution;

  const [exams, setExams] = useState(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [examType, setExamType] = useState('all');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [lockedExam, setLockedExam] = useState(null);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setExams(null);
    mockExamsAPI.getPublic(institutionId)
      .then(res => { if (!cancelled) setExams(res.data.exams || []); })
      .catch(() => { if (!cancelled) setExams([]); });
    return () => { cancelled = true; };
  }, [institutionId]);

  // `files` is null while locked (see server/routes/mockExams.js).
  const mapped = useMemo(() => (exams || []).map(e => ({
    id: e.exam_id,
    courseCode: e.course_code,
    title: e.course_name,
    examType: e.exam_type,
    year: e.year_display,
    semester: e.semester,
    accuracy: e.accuracy,
    examDate: e.exam_date,
    institution: e.institution_short_name,
    isLocked: e.is_locked,
    hasPassword: e.has_password,
    questionFiles: (e.files || []).filter(f => f.kind === 'question'),
    answerFiles: (e.files || []).filter(f => f.kind === 'answer'),
  })), [exams]);

  // Which years and exam types exist here, so filters only offer real choices.
  const availableYears = useMemo(() => YEARS.filter(y => mapped.some(e => e.year === y)), [mapped]);
  const availableTypes = useMemo(
    () => Object.keys(TYPE_ORDER).filter(type => mapped.some(e => e.examType === type)),
    [mapped]
  );

  const sections = useMemo(() => {
    const term = search.trim().toLowerCase();
    const visible = mapped
      .filter(e => (year === 'all' || e.year === year) && (examType === 'all' || e.examType === examType))
      .filter(e => !term || e.courseCode.toLowerCase().includes(term) || e.title.toLowerCase().includes(term))
      .sort((a, b) => (YEAR_ORDER[a.year] ?? 9) - (YEAR_ORDER[b.year] ?? 9)
        || (SEM_ORDER[a.semester] ?? 9) - (SEM_ORDER[b.semester] ?? 9)
        || (TYPE_ORDER[a.examType] ?? 9) - (TYPE_ORDER[b.examType] ?? 9)
        || a.courseCode.localeCompare(b.courseCode));

    const groups = [];
    for (const exam of visible) {
      const key = `${exam.year}|${exam.semester}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.exams.push(exam);
      else groups.push({ key, year: exam.year, semester: exam.semester, exams: [exam] });
    }
    return groups;
  }, [mapped, search, year, examType]);

  const hasPills = availableYears.length > 1 || availableTypes.length > 1;
  const clearFilters = () => { setSearch(''); setYear('all'); setExamType('all'); };

  const trackOpen = (exam, kind) => {
    analyticsAPI.track('mock_exam_subject_click', {
      additional_data: { subject: exam.courseCode, exam_type: exam.examType, kind },
    }).catch(() => {});
  };

  const openUnlock = (exam) => { setLockedExam(exam); setPassword(''); setUnlockError(''); };
  const closeUnlock = () => { setLockedExam(null); setPassword(''); setUnlockError(''); };

  const handleUnlock = async () => {
    if (!password.trim()) {
      setUnlockError(t('mockExams.unlock.required'));
      return;
    }
    setUnlocking(true);
    setUnlockError('');
    try {
      const res = await mockExamsAPI.unlock(lockedExam.id, password);
      if (res.status !== 200) {
        setUnlockError(res.data?.error || t('mockExams.unlock.wrong'));
        return;
      }
      // Show the real files on this card, like any other open exam.
      setExams(prev => prev.map(e => (
        e.exam_id === lockedExam.id ? { ...e, is_locked: false, files: res.data.files || [] } : e
      )));
      closeUnlock();
    } catch {
      setUnlockError(t('mockExams.unlock.failed'));
    } finally {
      setUnlocking(false);
    }
  };

  const yearLabel = (value) => t(`mockExams.years.${value}`, value);
  const semesterLabel = (value) => t(`mockExams.semesters.${value}`, value);
  const institutionName = selectedInstitutionData?.short_name;

  const contribute = (
    <Callout>
      <div>
        <h2>{t('mockExams.contribute.title')}</h2>
        <p>{t('mockExams.contribute.body')}</p>
      </div>
      <CalloutActions>
        <LinkButton $primary href={TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
          <FaGithub size={16} />
          {t('mockExams.contribute.template')}
        </LinkButton>
        <LinkButton href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={16} />
          {t('mockExams.contribute.email')}
        </LinkButton>
      </CalloutActions>
    </Callout>
  );

  return (
    <Container>
      <Header>
        <BubbleTitle text={t('mockExams.title')} />
        <Subtitle>
          {institutionName
            ? t('mockExams.subtitleFor', { institution: institutionName })
            : t('mockExams.subtitle')}
        </Subtitle>
        <SecondaryButton type="button" onClick={() => setShowGuidelines(true)}>
          <BookOpen size={16} />
          {t('mockExams.howWeMake')}
        </SecondaryButton>
      </Header>

      {exams === null ? (
        <LoadingSpinner />
      ) : mapped.length === 0 ? (
        <EmptyState
          seed="mock-exams-empty"
          title={institutionName
            ? t('mockExams.emptyFor', { institution: institutionName })
            : t('mockExams.empty')}
          body={t('mockExams.contribute.body')}
          actions={(
            <>
              <LinkButton $primary href={TEMPLATE_URL} target="_blank" rel="noopener noreferrer">
                <FaGithub size={16} />
                {t('mockExams.contribute.template')}
              </LinkButton>
              <LinkButton href={`mailto:${CONTACT_EMAIL}`}>
                <Mail size={16} />
                {t('mockExams.contribute.email')}
              </LinkButton>
            </>
          )}
        />
      ) : (
        <>
          <Toolbar>
            <SearchField>
              <Search size={16} />
              <SearchInput
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('mockExams.searchPlaceholder')}
                aria-label={t('mockExams.searchPlaceholder')}
              />
              {search && (
                <IconButton type="button" onClick={() => setSearch('')} aria-label={t('nav.clearSearch')}>
                  <X size={16} />
                </IconButton>
              )}
            </SearchField>
            {hasPills && (
              <FilterGroup>
                {availableYears.length > 1 && (
                  <Pills role="radiogroup" aria-label={t('mockExams.filterYear')}>
                    <Pill type="button" role="radio" aria-checked={year === 'all'} $active={year === 'all'} onClick={() => setYear('all')}>
                      {t('mockExams.allYears')}
                    </Pill>
                    {availableYears.map(value => (
                      <Pill key={value} type="button" role="radio" aria-checked={year === value} $active={year === value} onClick={() => setYear(value)}>
                        {yearLabel(value)}
                      </Pill>
                    ))}
                  </Pills>
                )}
                {availableYears.length > 1 && availableTypes.length > 1 && <FilterDivider />}
                {availableTypes.length > 1 && (
                  <Pills role="radiogroup" aria-label={t('mockExams.filterType')}>
                    <Pill type="button" role="radio" aria-checked={examType === 'all'} $active={examType === 'all'} onClick={() => setExamType('all')}>
                      {t('mockExams.allTypes')}
                    </Pill>
                    {availableTypes.map(value => (
                      <Pill key={value} type="button" role="radio" aria-checked={examType === value} $active={examType === value} onClick={() => setExamType(value)}>
                        {t(`mockExams.types.${value}`, value)}
                      </Pill>
                    ))}
                  </Pills>
                )}
              </FilterGroup>
            )}
          </Toolbar>

          {sections.length === 0 ? (
            <EmptyState
              seed="mock-exams-no-match"
              title={t('mockExams.noMatch')}
              body={t('mockExams.noMatchBody')}
              actions={<SecondaryButton type="button" onClick={clearFilters}>{t('mockExams.clearFilters')}</SecondaryButton>}
            />
          ) : sections.map(section => (
            <Section key={section.key} aria-labelledby={`mock-${section.key}`}>
              <SectionHeading id={`mock-${section.key}`}>
                {`${yearLabel(section.year)} · ${semesterLabel(section.semester)}`}
                <Count>{section.exams.length}</Count>
              </SectionHeading>
              <Grid>
                {section.exams.map(exam => (
                  <MockExamCard
                    key={exam.id}
                    exam={exam}
                    showInstitution={!institutionId}
                    onUnlock={openUnlock}
                    onOpenFile={trackOpen}
                    t={t}
                    language={i18n.language}
                  />
                ))}
              </Grid>
            </Section>
          ))}

          {contribute}
        </>
      )}

      {showGuidelines && (
        <Modal onClose={() => setShowGuidelines(false)}>
          <h3>How We Create Mock Exams</h3>
          <h4>Our creation process</h4>
          <GuideList>
            <li>
              <strong>Prioritize course materials first.</strong> We start with questions and problems from textbooks
              related to the subject or materials given by the instructor. You can find recommended textbooks in the
              course syllabus.
            </li>
            <li>
              <strong>Create original questions based on class discussions.</strong> We develop questions inspired by
              instructors&apos; &ldquo;What if…&rdquo; scenarios discussed during lectures. When we adapt existing course
              materials, we always credit the original source (see our <em>EES271</em> mock exam for an example).
            </li>
            <li>
              <strong>Use AI assistance strategically for courses without textbooks.</strong> We only use generative AI
              together with hints or the exam structure the instructor said would be covered.
            </li>
            <li>
              <strong>Never rely solely on AI.</strong> Without structural hints, think about what the lectures suggest
              will be examined, and use those insights as prompts. Don&apos;t let AI generate a whole mock exam unguided.
            </li>
            <li>
              <strong>Use our official template.</strong> Build with the{' '}
              <a href={TEMPLATE_URL} target="_blank" rel="noopener noreferrer">Peanut Mock Exam Template</a>{' '}
              (LaTeX) so every mock exam looks and reads the same.
            </li>
          </GuideList>

          <Note>
            <AlertCircle size={18} />
            <div>
              <strong>Important:</strong> if you use generative AI at any stage, check its output against the actual
              course material, and solve the questions yourself before sharing them.
            </div>
          </Note>

          <h4>Best practices</h4>
          <Checklist>
            {[
              ['Review past exams if available.', "Learn the instructor's style and common question patterns."],
              ['Collaborate with classmates.', 'Check accuracy and get different views on what might be covered.'],
              ['Mix difficulty levels.', 'Easy, medium and challenging questions make for better practice.'],
              ['Time yourself.', 'It should be doable within the real exam time.'],
              ['Include answer keys when possible.', 'Students learn more when they can see the reasoning.'],
              ['Focus on understanding, not memorization.', 'Test concepts and application.'],
              ['Cover all major topics.', 'Represent the full scope of the exam, not just a few topics.'],
              ['Stay updated.', `Fix errors you hear about and resend to ${CONTACT_EMAIL}.`],
            ].map(([title, body]) => (
              <li key={title}>
                <CheckCircle2 size={16} />
                <span><strong>{title}</strong> {body}</span>
              </li>
            ))}
          </Checklist>
        </Modal>
      )}

      {lockedExam && (
        <Modal onClose={closeUnlock}>
          <h3>{t('mockExams.unlock.title')}</h3>
          <p>
            {lockedExam.courseCode} · {lockedExam.title}
            <br />
            {t('mockExams.unlock.body')}
          </p>
          <PasswordInput
            type="password"
            placeholder={t('mockExams.unlock.placeholder')}
            value={password}
            onChange={e => { setPassword(e.target.value); setUnlockError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            $error={!!unlockError}
            autoFocus
          />
          {unlockError && <ErrorText>{unlockError}</ErrorText>}
          <PrimaryButton type="button" onClick={handleUnlock} disabled={unlocking}>
            {unlocking ? t('mockExams.unlock.checking') : t('mockExams.unlock.submit')}
          </PrimaryButton>
        </Modal>
      )}
    </Container>
  );
};

export default MockExams;
