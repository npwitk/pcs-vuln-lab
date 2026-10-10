import React, { useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Check, Copy, Gift, LogIn, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { birthdayAPI } from '../services/api';
import Confetti from '../components/Confetti';
import PeanutIcon from '../components/PeanutIcon';
import PartyHat from '../components/PartyHat';
import usePageMeta from '../hooks/usePageMeta';
import { BIRTHDAY_PATH } from '../utils/birthday';
import { rememberPostLoginPath } from '../utils/postLogin';

// Peanut turns 1. Reached by typing "Happy Birthday" or "HBD" into the search
// (SearchCommandPalette). A cake with a "1" candle you can blow out, confetti,
// and a gift box that opens into the student's own discount code.

const noMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

// --- page ----------------------------------------------------------------------

const Page = styled.main`
  position: relative;
  min-height: calc(100vh - 60px);
  padding: 3rem 1rem 5rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, ${props => props.theme.colors.primary}26, transparent 60%),
    ${props => props.theme.colors.background};
`;

const Column = styled.div`
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const rise = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.96); }
  to { opacity: 1; transform: none; }
`;

const Rise = styled.div`
  animation: ${rise} 700ms cubic-bezier(0.34, 1.3, 0.64, 1) ${props => props.$delay || 0}ms both;
  ${noMotion}
`;

const Eyebrow = styled.p`
  margin: 1.75rem 0 0.5rem;
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(3rem, 11vw, 5.25rem);
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: -0.05em;
  line-height: 1;
  color: ${props => props.theme.colors.text};

  em {
    font-style: normal;
    background: linear-gradient(135deg, #F2C58A, ${props => props.theme.colors.primary} 55%, #8F4A22);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const Lede = styled.p`
  max-width: 440px;
  margin: 1rem 0 2.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.lg};
  line-height: 1.55;
`;

// --- the cake ------------------------------------------------------------------

const flicker = keyframes`
  0%, 100% { transform: translateX(-50%) scale(1, 1) rotate(-2deg); }
  25% { transform: translateX(-50%) scale(0.92, 1.08) rotate(2deg); }
  50% { transform: translateX(-50%) scale(1.05, 0.95) rotate(-1deg); }
  75% { transform: translateX(-50%) scale(0.96, 1.06) rotate(3deg); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.8; transform: translateX(-50%) scale(1.12); }
`;

const smokeUp = keyframes`
  0% { opacity: 0.7; transform: translate(-50%, 0) scale(0.6); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), -60px) scale(1.6); }
`;

const CakeStage = styled.div`
  position: relative;
  width: 260px;
  height: 250px;
`;

const CakeButton = styled.button`
  position: absolute;
  inset: 0;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible { outline: 2px solid ${props => props.theme.colors.primary}; outline-offset: 6px; border-radius: 20px; }
`;

// The "1" candle: a striped stem with the numeral's little flag.
const Candle = styled.span`
  position: absolute;
  left: 50%;
  bottom: 118px;
  width: 34px;
  height: 92px;
  transform: translateX(-50%);
  border-radius: 9px 9px 4px 4px;
  background: repeating-linear-gradient(-35deg, ${props => props.theme.colors.primary} 0 9px, #FFF4E6 9px 18px);
  box-shadow: inset -4px 0 0 rgba(0, 0, 0, 0.08);

  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: -20px;
    width: 30px;
    height: 16px;
    border-radius: 8px 4px 4px 8px;
    transform: rotate(-32deg);
    transform-origin: 100% 50%;
    background: ${props => props.theme.colors.primary};
  }
`;

const Wick = styled.span`
  position: absolute;
  left: 50%;
  bottom: 210px;
  width: 3px;
  height: 10px;
  margin-left: -1.5px;
  border-radius: 2px;
  background: #3A2A1E;
`;

const Flame = styled.span`
  position: absolute;
  left: 50%;
  bottom: 216px;
  width: 22px;
  height: 34px;
  transform-origin: 50% 100%;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: radial-gradient(ellipse at 50% 75%, #FFFFFF 0%, #FFE58A 30%, #FFB02E 60%, #FF7A1A 100%);
  transition: opacity 180ms ease, transform 220ms ease;
  opacity: ${props => (props.$out ? 0 : 1)};
  animation: ${flicker} 0.9s ease-in-out infinite;
  ${props => props.$out && css`animation: none; transform: translateX(-50%) scale(0.2);`}
  ${noMotion}
`;

const Glow = styled.span`
  position: absolute;
  left: 50%;
  bottom: 196px;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 196, 77, 0.55), transparent 65%);
  opacity: ${props => (props.$out ? 0 : 1)};
  transition: opacity 300ms ease;
  animation: ${glow} 1.8s ease-in-out infinite;
  ${noMotion}
`;

const Smoke = styled.span`
  position: absolute;
  left: 50%;
  bottom: 222px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${props => props.theme.colors.textTertiary}66;
  --dx: ${props => props.$dx}px;
  animation: ${smokeUp} 1.4s ease-out ${props => props.$delay}ms both;
  ${noMotion}
`;

// Two tiers with cream frosting dripping over the edge, and sprinkles.
const Tier = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: ${props => props.$bottom}px;
  width: ${props => props.$w}px;
  height: ${props => props.$h}px;
  border-radius: 16px;
  background: linear-gradient(180deg, ${props => props.theme.colors.primary}, #8F4A22);
  box-shadow: 0 14px 30px rgba(143, 74, 34, 0.25);
  overflow: hidden;

  /* Frosting: a cream band with round drips. */
  &::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: ${props => props.$h * 0.42}px;
    background:
      radial-gradient(circle at 10px 0, #FFF4E6 9px, transparent 10px) 0 100% / 26px 18px repeat-x,
      linear-gradient(#FFF4E6, #FFF4E6) 0 0 / 100% calc(100% - 9px) no-repeat;
  }
`;

const Plate = styled.span`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 250px;
  height: 14px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: ${props => props.theme.colors.border};
`;

const SPRINKLES = [
  [-80, 30, 20, '#5E5CE6'], [-46, 18, -30, '#FFD60A'], [-12, 34, 50, '#FF6B9A'], [24, 22, -15, '#30D158'],
  [60, 32, 35, '#64D2FF'], [86, 16, -40, '#FFD60A'], [-64, 86, 10, '#FF6B9A'], [-20, 96, -45, '#64D2FF'],
  [30, 88, 25, '#5E5CE6'], [70, 98, -20, '#30D158'],
];

const Sprinkle = styled.span`
  position: absolute;
  left: calc(50% + ${props => props.$x}px);
  bottom: ${props => props.$y}px;
  width: 9px;
  height: 3px;
  border-radius: 2px;
  background: ${props => props.$c};
  transform: rotate(${props => props.$r}deg);
  z-index: 1;
`;

// Peanut itself (the logo) dances on the top tier in a party hat: swaying to
// the music, and jumping into a flip when the candle goes out or it's tapped.
const sway = keyframes`
  0%, 100% { transform: rotate(-8deg) translateY(0); }
  25% { transform: rotate(0deg) translateY(-4px); }
  50% { transform: rotate(8deg) translateY(0); }
  75% { transform: rotate(0deg) translateY(-4px); }
`;

const flipJump = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  15% { transform: translateY(2px) scale(1.12, 0.86); }
  50% { transform: translateY(-46px) rotate(-180deg) scale(1); }
  82% { transform: translateY(0) rotate(-360deg); }
  90% { transform: translateY(0) rotate(-360deg) scale(1.1, 0.9); }
  100% { transform: translateY(0) rotate(-360deg); }
`;

const DancerButton = styled.button`
  position: absolute;
  z-index: 2;
  left: calc(50% - 80px);
  bottom: 124px;
  width: 36px;
  height: 58px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:focus-visible { outline: 2px solid ${props => props.theme.colors.primary}; outline-offset: 4px; border-radius: 8px; }
`;

const Jumper = styled.span`
  position: absolute;
  inset: 0;
  transform-origin: 50% 100%;
  ${props => props.$hops > 0 && css`animation: ${flipJump} 760ms cubic-bezier(0.3, 0.7, 0.4, 1) both;`}
  ${noMotion}
`;

const Dancer = styled.span`
  position: absolute;
  inset: 0;
  transform-origin: 50% 100%;
  animation: ${sway} 1.15s ease-in-out infinite;
  ${noMotion}

  svg.peanut {
    display: block;
    width: 36px;
    height: 58px;
    fill: ${props => props.theme.colors.primary};
  }
`;

const DancerHat = styled(PartyHat)`
  position: absolute;
  top: -17px;
  left: 50%;
  width: 17px;
  height: 20px;
  transform: translateX(-50%) rotate(-12deg);
  transform-origin: 50% 100%;
`;

function Cake({ out, puffs, onToggle, label, hops, onPeanut, peanutLabel }) {
  return (
    <CakeStage>
      <CakeButton type="button" onClick={onToggle} aria-label={label}>
        <Glow $out={out} />
        <Plate />
        <Tier $bottom={8} $w={230} $h={70} />
        <Tier $bottom={74} $w={170} $h={52} />
        {SPRINKLES.map(([x, y, r, c], i) => (
          <Sprinkle key={i} $x={x} $y={y + 8} $r={r} $c={c} />
        ))}
        <Candle />
        <Wick />
        <Flame $out={out} />
        {out && puffs > 0 && [0, 1, 2].map(i => (
          <Smoke key={`${puffs}-${i}`} $delay={i * 160} $dx={(i - 1) * 14} />
        ))}
      </CakeButton>
      <DancerButton type="button" onClick={onPeanut} aria-label={peanutLabel}>
        {/* Keyed by the hop count, so each one plays the flip afresh. */}
        <Jumper key={hops} $hops={hops}>
          <Dancer>
            <PeanutIcon className="peanut" />
            <DancerHat />
          </Dancer>
        </Jumper>
      </DancerButton>
    </CakeStage>
  );
}

// --- the gift ------------------------------------------------------------------

const beg = keyframes`
  0%, 80%, 100% { transform: rotate(0deg); }
  84% { transform: rotate(-6deg); }
  88% { transform: rotate(6deg); }
  92% { transform: rotate(-4deg); }
  96% { transform: rotate(3deg); }
`;

const lidOff = keyframes`
  0% { transform: translate(-50%, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(-50%, -150px) rotate(-28deg); opacity: 0; }
`;

const boxAway = keyframes`
  0% { transform: scale(1); opacity: 1; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(0.6); opacity: 0; }
`;

const GiftWrap = styled.div`
  position: relative;
  width: 170px;
  height: 160px;
  margin: 0 auto 1.5rem;
  transform-origin: 50% 100%;
  animation: ${props => (props.$opening ? css`${boxAway} 600ms ease-in 250ms both` : css`${beg} 3.2s ease-in-out 1.5s infinite`)};
  ${noMotion}
`;

const Box = styled.span`
  position: absolute;
  left: 15px;
  bottom: 0;
  width: 140px;
  height: 110px;
  border-radius: 10px;
  background:
    linear-gradient(90deg, transparent 58px, #FF6B9A 58px 82px, transparent 82px),
    linear-gradient(180deg, ${props => props.theme.colors.primary}, #8F4A22);
  box-shadow: 0 16px 30px rgba(143, 74, 34, 0.28);
`;

const Lid = styled.span`
  position: absolute;
  left: 50%;
  bottom: 104px;
  width: 162px;
  height: 34px;
  border-radius: 8px;
  transform: translate(-50%, 0);
  background:
    linear-gradient(90deg, transparent 69px, #FF6B9A 69px 93px, transparent 93px),
    linear-gradient(180deg, #D4793D, ${props => props.theme.colors.primary});
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  ${props => props.$opening && css`animation: ${lidOff} 520ms cubic-bezier(0.3, 0, 0.6, 1) both;`}
  ${noMotion}

  /* The bow: two loops. */
  &::before, &::after {
    content: '';
    position: absolute;
    top: -22px;
    width: 34px;
    height: 26px;
    border: 6px solid #FF6B9A;
    border-radius: 50% 50% 10% 50%;
  }
  &::before { left: 46px; transform: rotate(-20deg); }
  &::after { right: 46px; transform: scaleX(-1) rotate(-20deg); }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  border: none;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.primary};
  color: #fff;
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.bold};
  cursor: pointer;
  box-shadow: 0 10px 24px ${props => props.theme.colors.primary}55;
  transition: transform 180ms ease, filter 180ms ease;

  &:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.06); }
  &:disabled { opacity: 0.7; cursor: default; }
`;

const GhostButton = styled(PrimaryButton)`
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border: 1.5px solid ${props => props.theme.colors.border};
  box-shadow: none;
`;

const Note = styled.p`
  margin-top: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

// --- the ticket ------------------------------------------------------------------

const ticketIn = keyframes`
  0% { opacity: 0; transform: perspective(800px) rotateX(70deg) translateY(30px) scale(0.9); }
  60% { opacity: 1; transform: perspective(800px) rotateX(-8deg) translateY(-4px) scale(1.02); }
  100% { opacity: 1; transform: none; }
`;

const letterIn = keyframes`
  0% { opacity: 0; transform: translateY(14px) rotateX(90deg); }
  100% { opacity: 1; transform: none; }
`;

const Ticket = styled.section`
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 1.75rem 1.5rem 1.5rem;
  border-radius: 18px;
  border: 2px dashed ${props => props.theme.colors.primary}88;
  /* Notches cut into both sides, like a real ticket. */
  background:
    radial-gradient(circle at 0 50%, ${props => props.theme.colors.background} 14px, transparent 15px),
    radial-gradient(circle at 100% 50%, ${props => props.theme.colors.background} 14px, transparent 15px),
    ${props => props.theme.colors.surface};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: ${ticketIn} 750ms cubic-bezier(0.3, 1.3, 0.6, 1) both;
  ${noMotion}
`;

const TicketLabel = styled.p`
  margin: 0 0 0.6rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: 0.14em;
  text-transform: uppercase;
`;

const CodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Code = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: clamp(1.6rem, 7vw, 2.1rem);
  font-weight: 800;
  letter-spacing: 0.12em;
  color: ${props => props.theme.colors.primary};
  perspective: 400px;

  span {
    display: inline-block;
    animation: ${letterIn} 420ms cubic-bezier(0.3, 1.4, 0.6, 1) both;
    ${noMotion}
  }
`;

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.85rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1.5px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.$done ? props.theme.colors.success : props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
`;

const Terms = styled.p`
  margin: 0.9rem 0 0;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.75rem;
`;

// ---------------------------------------------------------------------------------

export default function HappyBirthday() {
  const { t, i18n } = useTranslation();
  usePageMeta(t('birthday.pageTitle'));
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const confetti = useRef(null);
  const giftRef = useRef(null);
  const cakeRef = useRef(null);

  const [status, setStatus] = useState(null);
  const [claim, setClaim] = useState(null);       // { code, valid_until, emailed, welcomeBack }
  const [opening, setOpening] = useState(false);
  const [candleOut, setCandleOut] = useState(false);
  const [puffs, setPuffs] = useState(0);
  const [hops, setHops] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    birthdayAPI.status()
      .then(({ data }) => {
        setStatus(data);
        if (data.claim) setClaim({ ...data.claim, emailed: null, welcomeBack: true });
      })
      .catch(() => setStatus({ live: false, gift: null, signed_in: isAuthenticated, claim: null }));
  }, [authLoading, isAuthenticated]);

  // The party starts as the page opens: bursts from both corners, then a
  // light rain (just a sprinkle once it's over).
  useEffect(() => {
    if (!status) return undefined;
    const c = confetti.current;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const timers = [];
    if (status.live || status.claim) {
      timers.push(setTimeout(() => c?.burst({ x: 0, y: h, angle: -60, spread: 40, count: 140, power: 1300 }), 250));
      timers.push(setTimeout(() => c?.burst({ x: w, y: h, angle: -120, spread: 40, count: 140, power: 1300 }), 400));
      timers.push(setTimeout(() => c?.rain(5, 26), 900));
    } else {
      timers.push(setTimeout(() => c?.rain(3, 8), 400));
    }
    return () => timers.forEach(clearTimeout);
  }, [status]);

  const burstFrom = (el, opts = {}) => {
    const r = el?.getBoundingClientRect();
    if (!r) return;
    confetti.current?.burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, ...opts });
  };

  const peanutHop = () => {
    setHops(h => h + 1);
    const r = cakeRef.current?.getBoundingClientRect();
    if (r) confetti.current?.burst({ x: r.left + r.width / 2 - 57, y: r.top + 90, spread: 90, count: 50, power: 650 });
  };

  const toggleCandle = () => {
    if (!candleOut) {
      setPuffs(p => p + 1);
      setHops(h => h + 1);
      const r = cakeRef.current?.getBoundingClientRect();
      if (r) confetti.current?.burst({ x: r.left + r.width / 2, y: r.top + 30, spread: 120, count: 60, power: 700 });
    }
    setCandleOut(v => !v);
  };

  const openGift = async () => {
    if (!isAuthenticated) {
      rememberPostLoginPath(BIRTHDAY_PATH);
      login();
      return;
    }
    setOpening(true);
    // Wide and high, so it rains around the ticket rather than onto it.
    setTimeout(() => burstFrom(giftRef.current, { count: 200, power: 1500, spread: 150 }), 280);
    try {
      const [{ data }] = await Promise.all([birthdayAPI.claim(), new Promise(r => setTimeout(r, 850))]);
      setClaim({ ...data, welcomeBack: false });
    } catch (error) {
      setOpening(false);
      toast.error(error.response?.data?.message || t('birthday.claimFailed'));
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(claim.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(t('birthday.copyFailed'));
    }
  };

  const until = (claim?.valid_until || status?.gift?.valid_until)
    ? new Date(claim?.valid_until || status.gift.valid_until).toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok',
    })
    : '';
  const terms = t('birthday.terms', {
    percent: status?.gift?.percentage ?? 10,
    cap: status?.gift?.max_discount ?? 100,
    date: until,
  });
  const emailLine = claim
    ? (claim.emailed === false ? t('birthday.emailFailed') : claim.emailed ? t('birthday.emailed') : t('birthday.emailedBefore'))
    : '';

  const over = status && !status.live && !claim;

  return (
    <Page>
      <Confetti ref={confetti} />
      <Column>
        <Rise ref={cakeRef}>
          <Cake
            out={candleOut}
            puffs={puffs}
            onToggle={toggleCandle}
            label={candleOut ? t('birthday.relight') : t('birthday.blowOut')}
            hops={hops}
            onPeanut={peanutHop}
            peanutLabel={t('birthday.peanutHop')}
          />
        </Rise>
        <Rise $delay={150}>
          <Eyebrow>{t('birthday.eyebrow')}</Eyebrow>
          <Headline>{t('birthday.headlineLead')} <em>1.</em></Headline>
        </Rise>
        <Rise $delay={280}>
          <Lede>{over ? t('birthday.overLede') : t('birthday.lede')}</Lede>
        </Rise>

        {status && !claim && !over && (
          <Rise $delay={420}>
            <GiftWrap ref={giftRef} $opening={opening} aria-hidden="true">
              <Box />
              <Lid $opening={opening} />
            </GiftWrap>
            <PrimaryButton type="button" onClick={openGift} disabled={opening}>
              {isAuthenticated ? <Gift size={18} aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
              {isAuthenticated ? t('birthday.openGift') : t('birthday.signInToClaim')}
            </PrimaryButton>
            <Note>{isAuthenticated ? terms : t('birthday.signInNote')}</Note>
          </Rise>
        )}

        {claim && (
          <>
            <Ticket aria-live="polite">
              <TicketLabel>{claim.welcomeBack ? t('birthday.welcomeBack') : t('birthday.yourCode')}</TicketLabel>
              <CodeRow>
                <Code aria-label={claim.code}>
                  {claim.code.split('').map((ch, i) => (
                    <span key={i} aria-hidden="true" style={{ animationDelay: `${250 + i * 55}ms` }}>{ch}</span>
                  ))}
                </Code>
                <CopyButton type="button" onClick={copy} $done={copied}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? t('birthday.copied') : t('birthday.copy')}
                </CopyButton>
              </CodeRow>
              <Terms>{terms}</Terms>
              <Terms>{emailLine}</Terms>
            </Ticket>
            <Actions>
              <PrimaryButton type="button" onClick={() => navigate('/')}>
                <ShoppingBag size={18} aria-hidden="true" /> {t('birthday.shop')}
              </PrimaryButton>
              <GhostButton type="button" onClick={() => navigate('/cart')}>
                <ShoppingCart size={18} aria-hidden="true" /> {t('birthday.goToCart')}
              </GhostButton>
            </Actions>
          </>
        )}

        {over && (
          <Rise $delay={420}>
            <PrimaryButton type="button" onClick={() => navigate('/')}>
              <ShoppingBag size={18} aria-hidden="true" /> {t('birthday.shop')}
            </PrimaryButton>
          </Rise>
        )}

        <Note style={{ marginTop: '3rem', opacity: 0.8 }}>{t('birthday.candleHint')}</Note>
      </Column>
    </Page>
  );
}
