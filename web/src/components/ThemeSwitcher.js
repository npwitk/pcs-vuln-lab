import React from 'react';
import styled from 'styled-components';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SwitcherContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.full};
`;

const SwitcherIndicator = styled.div`
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.theme.colors.surfaceElevated};
  box-shadow: ${props => props.theme.shadows.sm};
  transform: translateX(${props => props.$index * 40}px);
  transition: transform ${props => props.theme.transitions.normal};
`;

const SwitcherOption = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: transparent;
  color: ${props => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const THEME_OPTIONS = [
  { mode: 'system', icon: Monitor, label: 'Use system theme' },
  { mode: 'light', icon: Sun, label: 'Use light theme' },
  { mode: 'dark', icon: Moon, label: 'Use dark theme' },
];

const ThemeSwitcher = () => {
  const { preference, setTheme } = useTheme();
  const activeIndex = THEME_OPTIONS.findIndex(({ mode }) => mode === preference);

  return (
    <SwitcherContainer role="radiogroup" aria-label="Theme">
      <SwitcherIndicator $index={activeIndex === -1 ? 0 : activeIndex} />
      {THEME_OPTIONS.map(({ mode, icon: Icon, label }) => (
        <SwitcherOption
          key={mode}
          type="button"
          role="radio"
          aria-checked={preference === mode}
          aria-label={label}
          title={label}
          $active={preference === mode}
          onClick={() => setTheme(mode)}
        >
          <Icon />
        </SwitcherOption>
      ))}
    </SwitcherContainer>
  );
};

export default ThemeSwitcher;
