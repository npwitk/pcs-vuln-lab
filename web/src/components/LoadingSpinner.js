import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ThinkingOrb } from 'thinking-orbs';
import { useTheme } from '../context/ThemeContext';

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$fullHeight ? 'calc(100vh - 60px)' : '200px'};
  gap: 1rem;
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

// `size` keeps accepting the old CSS-length strings ('64px', '20px', ...)
// used elsewhere in the app and maps them to the orb's two tuned scales —
// no call site needs to change. Anything not recognizably the inline-text
// scale falls back to the chat-avatar scale (64).
const resolveOrbSize = (size) => {
  const px = parseInt(size, 10);
  return px === 20 ? 20 : 64;
};

const LoadingSpinner = ({ text, size, fullHeight = true }) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const displayText = text === undefined ? t('common.loading') : text;

  return (
    <SpinnerContainer $fullHeight={fullHeight}>
      <div role="status" aria-label={displayText || t('common.loading')}>
        <ThinkingOrb state="connecting" size={resolveOrbSize(size)} dark={isDark} />
      </div>
      {displayText && <LoadingText>{displayText}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
