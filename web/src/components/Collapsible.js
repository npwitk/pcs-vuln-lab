import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// Animates `grid-template-rows` 1fr <-> 0fr, so the height collapses without
// measuring anything, while the content fades. Overflow is clipped only while
// animating or closed, so an open child's shadow isn't cut off.
const Outer = styled.div`
  display: grid;
  /* minmax(0, 1fr), not the default auto column: an auto column grows to its
     content's min-content width, so a non-wrapping row (e.g. the upcoming
     exams card scroller) would widen the whole section, and the page,
     instead of scrolling inside it. */
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: ${props => (props.$expanded ? '1fr' : '0fr')};
  opacity: ${props => (props.$expanded ? 1 : 0)};
  transition:
    grid-template-rows ${props => props.$duration}ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity ${props => Math.round(props.$duration * 0.7)}ms ease;
  pointer-events: ${props => (props.$expanded ? 'auto' : 'none')};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// $room widens the clip box by that many px on every side (padding, undone
// by an equal negative margin so layout doesn't move), so a child's drop
// shadow stays visible while clipped instead of popping in when the clip
// comes off. Keep it within the page gutter, or it can scroll sideways.
const Inner = styled.div`
  min-height: 0;
  min-width: 0;
  overflow: ${props => (props.$clip ? 'hidden' : 'visible')};
  ${props => (props.$room ? `padding: ${props.$room}px; margin: -${props.$room}px;` : '')}
`;

// The bounce: opening drops the content in from slightly above and
// overshoots before settling (ease-out-back); closing dips first, then
// lifts away (ease-in-back) while the height collapses around it.
const Content = styled.div`
  transform-origin: top center;
  transform: ${props => (props.$expanded || !props.$bounce ? 'none' : 'translateY(-18px) scale(0.96)')};
  transition: transform ${props => Math.round(props.$duration * (props.$expanded ? 1.4 : 1))}ms
    ${props => (props.$expanded
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.36, 0, 0.66, -0.56)')};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;

// Show/hide with a fade + height collapse instead of popping in and out.
// Children stay mounted while closing (so there's something to fade out) and
// are unmounted once it's done.
// `onCollapsed` fires once a close finishes, but only if there was actually
// something visible to collapse (so callers can react to the layout shift).
// `shadowRoom` (px): room left around the content for its shadow; see Inner.
// `bounce={false}` keeps just the height and fade, for quieter spots.
export default function Collapsible({ open, children, duration = 400, onCollapsed, shadowRoom = 0, bounce = true }) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  const [settled, setSettled] = useState(open);
  const frames = useRef([]);
  const contentRef = useRef(null);
  const onCollapsedRef = useRef(onCollapsed);
  onCollapsedRef.current = onCollapsed;

  useEffect(() => {
    const cancelFrames = () => frames.current.forEach(cancelAnimationFrame);
    let timer;

    if (open) {
      setMounted(true);
      // Two frames so the collapsed state paints before expanding; otherwise
      // the browser skips straight to the open state with no transition.
      frames.current = [requestAnimationFrame(() => {
        frames.current.push(requestAnimationFrame(() => setExpanded(true)));
      })];
      // Wait out the (longer) bounce before un-clipping.
      timer = setTimeout(() => setSettled(true), Math.round(duration * 1.4));
    } else {
      const hadHeight = (contentRef.current?.offsetHeight || 0) > 0;
      setSettled(false);
      setExpanded(false);
      timer = setTimeout(() => {
        setMounted(false);
        if (hadHeight) onCollapsedRef.current?.();
      }, duration);
    }

    return () => {
      cancelFrames();
      clearTimeout(timer);
    };
  }, [open, duration]);

  if (!mounted) return null;

  return (
    <Outer $expanded={expanded} $duration={duration} aria-hidden={!open}>
      <Inner $clip={!settled} $room={shadowRoom}>
        <Content ref={contentRef} $expanded={expanded} $duration={duration} $bounce={bounce}>{children}</Content>
      </Inner>
    </Outer>
  );
}
