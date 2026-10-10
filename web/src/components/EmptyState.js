import React, { useEffect, useMemo, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { ShoppingCart } from 'lucide-react';
import { meshGradient } from '../utils/meshGradient';

// Two playful empty states built from miniature cheat sheet cards:
// - default: a small deck of three sheets in front, turning like a carousel.
//   Every couple of seconds the one at the back comes round to the front;
//   hovering an action spreads the fan.
// - variant="cart": the checkout cart, with cards floating around it. Now and
//   then one dives in and pops straight back out (the cart is empty, after
//   all); hovering an action drops them all in and the count goes up.

const SPRING = 'cubic-bezier(0.34, 1.4, 0.64, 1)';
const noMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3.5rem 1.5rem;
  border: 1.5px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.backgroundSecondary};
`;

// --- a cheat sheet card in miniature -------------------------------------------

const MiniCard = styled.div`
  width: 100%;
  border-radius: ${props => (props.$small ? 8 : 12)}px;
  overflow: hidden;
  /* Elevated, so it stands off the box in dark mode too. */
  background: ${props => props.theme.colors.surfaceElevated};
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.md};
`;

const MiniBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => (props.$small ? 3 : 5)}px;
  padding: ${props => (props.$small ? '5px 6px 6px' : '8px 9px 9px')};
`;

const Bar = styled.span`
  display: block;
  height: ${props => props.$h}px;
  width: ${props => props.$w}%;
  border-radius: 999px;
  background: ${props => (props.$accent ? props.theme.colors.primary : props.theme.colors.border)};
  opacity: ${props => (props.$accent ? 0.85 : 1)};
`;

// The brand-gradient cover, then bars where the code, title and price go.
function MiniSheet({ cover, title, small = false }) {
  return (
    <MiniCard $small={small}>
      <div style={{ height: small ? 30 : 54, background: cover }} />
      <MiniBody $small={small}>
        <Bar $w={38} $h={small ? 4 : 7} $accent />
        <Bar $w={title} $h={small ? 3 : 5} />
        <Bar $w={title - 22} $h={small ? 3 : 5} />
      </MiniBody>
    </MiniCard>
  );
}

// --- default: a deck of three sheets, turning -------------------------------------

const DECK_CYCLE = 6;   // s for one sheet to go all the way round
const SHEET_W = 84;

// One sheet's trip: left → front → right → round the back → left.
const carousel = keyframes`
  0%, 18% { transform: translate(-58px, 12px) rotate(-13deg) scale(0.9); z-index: 2; }
  33%, 51% { transform: translate(0, 0) rotate(0deg) scale(1.08); z-index: 3; }
  66%, 84% { transform: translate(58px, 12px) rotate(13deg) scale(0.9); z-index: 2; }
  92% { transform: translate(0, -4px) rotate(0deg) scale(0.78); z-index: 1; }
  100% { transform: translate(-58px, 12px) rotate(-13deg) scale(0.9); z-index: 1; }
`;

const rock = keyframes`
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2.5deg); }
`;

const DeckArt = styled.div`
  position: relative;
  width: 230px;
  height: 140px;
  margin-bottom: 1.5rem;
`;

// Hover spreads the deck; a separate element from the rocking and the
// carousel, so no two animations share a transform.
const Spread = styled.div`
  position: absolute;
  inset: 0;
  transform: ${props => (props.$open ? 'scale(1.1) translateY(-4px)' : 'none')};
  transition: transform 420ms ${SPRING};
  ${noMotion}
`;

const Rock = styled.div`
  position: absolute;
  inset: 0;
  transform-origin: 50% 90%;
  animation: ${rock} ${DECK_CYCLE}s ease-in-out infinite;
  ${noMotion}
`;

const DeckSheet = styled.div`
  position: absolute;
  top: 12px;
  left: calc(50% - ${SHEET_W / 2}px);
  width: ${SHEET_W}px;
  transform-origin: 50% 100%;
  animation: ${carousel} ${DECK_CYCLE}s cubic-bezier(0.5, 0, 0.2, 1) ${props => -props.$i * (DECK_CYCLE / 3)}s infinite;

  /* Still: a plain fan, the middle one in front. */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    z-index: ${props => (props.$i === 1 ? 3 : 2)};
    transform: ${props => [
      'translate(-58px, 12px) rotate(-13deg) scale(0.9)',
      'scale(1.08)',
      'translate(58px, 12px) rotate(13deg) scale(0.9)',
    ][props.$i]};
  }
`;

function SheetDeck({ seed, open }) {
  const covers = useMemo(() => [0, 1, 2].map(i => meshGradient(`${seed}-deck-${i}`)), [seed]);
  return (
    <DeckArt aria-hidden="true">
      <Spread $open={open}>
        <Rock>
          {covers.map((cover, i) => (
            <DeckSheet key={i} $i={i}>
              <MiniSheet cover={cover} title={[72, 60, 80][i]} />
            </DeckSheet>
          ))}
        </Rock>
      </Spread>
    </DeckArt>
  );
}

// --- variant="cart": the checkout cart, still empty -------------------------------

const CART_CYCLE = 8;   // s: each card hops in and out once per cycle
const HOP_EVERY = CART_CYCLE / 4;
const HOP_AT = 0.78;    // where in a card's cycle it reaches the cart
// Starts the cycle part-way in, so the first hop comes soon after load.
const HEAD_START = 4.5;

// Floats, then dives into the cart and bounces back out.
const hop = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(var(--rot)) scale(1); opacity: 1; }
  30% { transform: translate(0, -6px) rotate(calc(var(--rot) + 3deg)) scale(1); opacity: 1; }
  62% { transform: translate(0, 0) rotate(var(--rot)) scale(1); opacity: 1; }
  ${HOP_AT * 100}% { transform: translate(var(--tx), var(--ty)) rotate(0deg) scale(0.35); opacity: 0; }
  ${HOP_AT * 100 + 1}% { transform: translate(var(--tx), var(--ty)) rotate(0deg) scale(0.35); opacity: 0; }
  86% { transform: translate(calc(var(--tx) * 0.35), calc(var(--ty) * 0.35 - 18px)) rotate(calc(var(--rot) * -1)) scale(0.85); opacity: 1; }
  93% { transform: translate(0, 0) rotate(var(--rot)) scale(1.04); opacity: 1; }
`;

// A squash each time a card lands in it.
const cartBump = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  6% { transform: translateY(5px) scale(1.07, 0.93); }
  14% { transform: translateY(-2px) scale(0.98, 1.02); }
  22% { transform: translateY(0) scale(1); }
`;

const CartArt = styled.div`
  position: relative;
  width: 280px;
  height: 176px;
  margin-bottom: 1.25rem;
`;

const CART_SIZE = 88;
const CART = { x: 140, y: 176 - CART_SIZE / 2 - 4 }; // centre of the cart mark

// Where each floating card rests (centre), and its tilt.
const ORBIT = [
  { x: 36, y: 62, rot: -14 },
  { x: 96, y: 26, rot: 8 },
  { x: 186, y: 30, rot: -7 },
  { x: 246, y: 66, rot: 13 },
];
const MINI_W = 46;

// Hover: the card flies into the cart and stays there.
const Orbit = styled.div`
  position: absolute;
  left: ${props => props.$x - MINI_W / 2}px;
  top: ${props => props.$y - 32}px;
  width: ${MINI_W}px;
  z-index: 1;
  transform: ${props => (props.$in
    ? `translate(${CART.x - props.$x}px, ${CART.y - props.$y}px) scale(0.3)`
    : 'translate(0, 0) scale(1)')};
  opacity: ${props => (props.$in ? 0 : 1)};
  transition:
    transform ${props => (props.$in ? '420ms cubic-bezier(0.55, 0, 0.75, 0.4)' : `560ms ${SPRING}`)} ${props => props.$delay}ms,
    opacity 200ms ease ${props => (props.$in ? props.$delay + 220 : props.$delay)}ms;
  ${noMotion}
`;

const Hop = styled.div`
  --rot: ${props => props.$rot}deg;
  --tx: ${props => CART.x - props.$x}px;
  --ty: ${props => CART.y - props.$y}px;
  transform: rotate(var(--rot));
  animation: ${hop} ${CART_CYCLE}s cubic-bezier(0.45, 0, 0.55, 1) ${props => props.$i * HOP_EVERY - HEAD_START}s infinite;
  ${noMotion}
`;

// The same cart mark as the checkout animation (Cart.js CartScene).
const CartMark = styled.div`
  position: absolute;
  left: ${CART.x - CART_SIZE / 2}px;
  top: ${CART.y - CART_SIZE / 2}px;
  width: ${CART_SIZE}px;
  height: ${CART_SIZE}px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${props => props.theme.colors.surfaceElevated};
  border: 1px solid ${props => props.theme.colors.borderLight};
  color: ${props => props.theme.colors.primary};
  box-shadow: ${props => props.theme.shadows.lg};
  /* First bump lands with card 0's first hop, then one per hop after it. */
  animation: ${cartBump} ${HOP_EVERY}s ease-out ${HOP_AT * CART_CYCLE - HEAD_START}s infinite;
  ${noMotion}
`;

const CartCount = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: ${props => (props.$full ? props.theme.colors.primary : props.theme.colors.textTertiary)};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  transform: scale(${props => (props.$full ? 1.15 : 1)});
  transition: background 200ms ease, transform 300ms ${SPRING};
`;

function CartScene({ seed, full }) {
  const covers = useMemo(() => ORBIT.map((_, i) => meshGradient(`${seed}-cart-${i}`)), [seed]);
  // While full, count up as each card lands.
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!full) { setCount(0); return undefined; }
    const timers = ORBIT.map((_, i) => setTimeout(() => setCount(i + 1), 360 + i * 70));
    return () => timers.forEach(clearTimeout);
  }, [full]);

  return (
    <CartArt aria-hidden="true">
      {ORBIT.map((o, i) => (
        <Orbit key={i} $x={o.x} $y={o.y} $in={full} $delay={i * 70}>
          <Hop $i={i} $x={o.x} $y={o.y} $rot={o.rot}>
            <MiniSheet small cover={covers[i]} title={50 + ((i * 17) % 30)} />
          </Hop>
        </Orbit>
      ))}
      <CartMark>
        <ShoppingCart size={40} strokeWidth={1.75} />
        <CartCount $full={count > 0}>{count}</CartCount>
      </CartMark>
    </CartArt>
  );
}

// --- the box ----------------------------------------------------------------------

const Title = styled.h2`
  margin: 0 0 0.5rem;
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
`;

const Body = styled.p`
  max-width: 440px;
  margin: 0 0 1.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  line-height: 1.55;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
`;

export const EmptyStateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.25rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: 1.5px solid ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$primary ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${props => props.$primary ? '#fff' : props.theme.colors.text};

  &:hover {
    background: ${props => props.$primary ? props.theme.colors.primaryHover : props.theme.colors.backgroundTertiary};
    border-color: ${props => props.theme.colors.primary};
  }
`;

export default function EmptyState({ title, body, actions, seed = 'empty', variant = 'cards' }) {
  // While an action is hovered: the deck spreads, the cart fills.
  const [hovered, setHovered] = useState(false);

  return (
    <Wrapper>
      {variant === 'cart' ? <CartScene seed={seed} full={hovered} /> : <SheetDeck seed={seed} open={hovered} />}
      <Title>{title}</Title>
      {body && <Body>{body}</Body>}
      {actions && (
        <Actions onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          {actions}
        </Actions>
      )}
    </Wrapper>
  );
}
