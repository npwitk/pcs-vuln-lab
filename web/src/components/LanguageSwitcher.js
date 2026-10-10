import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

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
  width: 44px;
  height: 36px;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.surfaceElevated};
  box-shadow: ${props => props.theme.shadows.sm};
  transform: translateX(${props => props.$index * 48}px);
  transition: transform ${props => props.theme.transitions.normal};
`;

const SwitcherOption = styled.button`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 36px;
  border: none;
  border-radius: ${props => props.theme.radius.full};
  cursor: pointer;
  background: transparent;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'EN', titleKey: 'languageSwitcher.english' },
  { code: 'th', label: 'TH', titleKey: 'languageSwitcher.thai' },
];

const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const activeIndex = LANGUAGE_OPTIONS.findIndex(({ code }) => code === language);

  return (
    <SwitcherContainer role="radiogroup" aria-label="Language">
      <SwitcherIndicator $index={activeIndex === -1 ? 0 : activeIndex} />
      {LANGUAGE_OPTIONS.map(({ code, label, titleKey }) => (
        <SwitcherOption
          key={code}
          type="button"
          role="radio"
          aria-checked={language === code}
          aria-label={t(titleKey)}
          title={t(titleKey)}
          $active={language === code}
          onClick={() => setLanguage(code)}
        >
          {label}
        </SwitcherOption>
      ))}
    </SwitcherContainer>
  );
};

export default LanguageSwitcher;
