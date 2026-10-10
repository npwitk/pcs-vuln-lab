import styled, { keyframes } from 'styled-components';

const drawCircle = keyframes`
  from { stroke-dashoffset: 151; }
  to { stroke-dashoffset: 0; }
`;

const drawCheck = keyframes`
  from { stroke-dashoffset: 40; }
  to { stroke-dashoffset: 0; }
`;

const popIn = keyframes`
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
`;

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${popIn} 0.35s ease-out;
`;

const Svg = styled.svg`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  overflow: visible;
`;

const Circle = styled.circle`
  fill: none;
  stroke: ${props => props.theme.colors.success};
  stroke-width: 4;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: ${drawCircle} 0.5s ease-out forwards;
`;

const Check = styled.path`
  fill: none;
  stroke: ${props => props.theme.colors.success};
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  /* Longer than the path itself (~33) so it draws fully with no visible gap. */
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: ${drawCheck} 0.35s 0.45s ease-out forwards;
`;

// Circle-draw-then-checkmark-draw success animation, shared by any payment
// flow that polls status and needs to react the moment it flips to 'paid'.
function PaymentSuccessCheck({ size = 96 }) {
  return (
    <Wrap>
      <Svg viewBox="0 0 52 52" $size={size} aria-hidden="true">
        <Circle cx="26" cy="26" r="24" />
        <Check d="M14 27l7 7 16-16" />
      </Svg>
    </Wrap>
  );
}

export default PaymentSuccessCheck;
