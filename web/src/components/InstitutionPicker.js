import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Globe2, Check, Plus } from 'lucide-react';
import { useInstitutions } from '../context/InstitutionContext';
import { resolveLogoUrl } from '../utils/resolveLogoUrl';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Wrapper = styled.div`
  position: relative;
`;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem 0.35rem 0.35rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.$isOpen ? props.theme.colors.backgroundSecondary : 'transparent'};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast}, border-color ${props => props.theme.transitions.fast};
  max-width: 200px;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  svg:last-child {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const TriggerLogoCircle = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.primary};
  animation: ${fadeIn} 0.2s ease;
`;

const TriggerLogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TriggerLabel = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
  width: 280px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  // Closed, this is still laid out (visibility: hidden keeps the box), so it
  // must never sit outside the viewport — see the mobile rule below. No
  // invisible click target while closed, either.
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)'};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;

  // On narrow screens the trigger sits far enough right that a 280px panel
  // anchored to its left edge hangs off the side of the page — and since
  // "closed" is only visibility: hidden, that box still counted, adding
  // ~36px of phantom horizontal scroll even with the picker shut. Pinning it
  // to the viewport under the navbar (always at the top — it's the first
  // element in the app, and sticky) keeps it on-screen in both states.
  @media (max-width: 768px) {
    position: fixed;
    top: calc(56px + 0.5rem);
    left: 0.75rem;
    right: 0.75rem;
    width: auto;
    max-width: 320px;
  }
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.$active ? props.theme.colors.primaryLight : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.$active ? props.theme.typography.weights.semibold : props.theme.typography.weights.regular};
  text-align: left;
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.$active ? props.theme.colors.primaryLight : props.theme.colors.backgroundSecondary};
  }
`;

const RowLogoCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.625rem;
  font-weight: ${props => props.theme.typography.weights.bold};
  text-transform: uppercase;
`;

const RowLogoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RowText = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;

  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const RowSub = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textTertiary};
`;

const CheckIcon = styled(Check)`
  flex-shrink: 0;
  color: ${props => props.theme.colors.primary};
`;

const Divider = styled.div`
  height: 1px;
  background: ${props => props.theme.colors.borderLight};
  margin: 0.4rem 0.25rem;
`;

const RequestRow = styled(Row)`
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.typography.weights.medium};
`;

const LoadingRow = styled.div`
  padding: 0.75rem 0.625rem;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const InstitutionPicker = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    institutions,
    institutionsLoading,
    selectedInstitution,
    setSelectedInstitution,
    selectedInstitutionData,
  } = useInstitutions();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (id) => {
    setSelectedInstitution(id);
    setIsOpen(false);
  };

  const handleRequestClick = () => {
    setIsOpen(false);
    navigate('/request-institution');
  };

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger
        type="button"
        $isOpen={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('nav.institutionPicker.ariaLabel')}
      >
        <TriggerLogoCircle key={selectedInstitution}>
          {selectedInstitutionData?.logo_filename ? (
            <TriggerLogoImg src={resolveLogoUrl(selectedInstitutionData.logo_filename)} alt="" />
          ) : (
            <Globe2 size={13} />
          )}
        </TriggerLogoCircle>
        <TriggerLabel>
          {selectedInstitutionData?.short_name || t('nav.institutionPicker.allInstitutions')}
        </TriggerLabel>
        <ChevronDown size={15} />
      </Trigger>

      <Panel $isOpen={isOpen} role="listbox">
        <Row type="button" $active={selectedInstitution === 'all'} onClick={() => handleSelect('all')}>
          <RowLogoCircle><Globe2 size={14} /></RowLogoCircle>
          <RowText><strong>{t('nav.institutionPicker.allInstitutions')}</strong></RowText>
          {selectedInstitution === 'all' && <CheckIcon size={16} />}
        </Row>

        {institutionsLoading ? (
          <LoadingRow>{t('common.loading')}</LoadingRow>
        ) : (
          institutions.map(inst => (
            <Row
              key={inst.institution_id}
              type="button"
              $active={selectedInstitution === inst.institution_id}
              onClick={() => handleSelect(inst.institution_id)}
            >
              <RowLogoCircle>
                {inst.logo_filename
                  ? <RowLogoImg src={resolveLogoUrl(inst.logo_filename)} alt="" />
                  : inst.short_name}
              </RowLogoCircle>
              <RowText>
                <strong>{inst.name}</strong>
                <RowSub>{inst.short_name}</RowSub>
              </RowText>
              {selectedInstitution === inst.institution_id && <CheckIcon size={16} />}
            </Row>
          ))
        )}

        <Divider />

        <RequestRow type="button" onClick={handleRequestClick}>
          <RowLogoCircle><Plus size={14} /></RowLogoCircle>
          <RowText><strong>{t('nav.institutionPicker.requestYours')}</strong></RowText>
        </RequestRow>
      </Panel>
    </Wrapper>
  );
};

export default InstitutionPicker;
