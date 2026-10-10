import React, { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Check, CornerDownRight } from 'lucide-react';
import { studyTagsAPI } from '../services/api';
import { indexTagTree, isTagOn, toggleTag } from '../utils/studyTags';

// Multi-select of an institution's study tags, up to three levels (e.g.
// faculty -> program -> track). Only top-level chips show at first; selecting
// one with sub-tags reveals them underneath, e.g. picking Computer
// Engineering shows Cyber Security and AI. The value keeps only the most
// specific picks (utils/studyTags.js). Used by the Home prompt (on the brand
// gradient, onColor), Settings, and the admin course list (compact).

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => (props.$compact ? '0.375rem' : '0.75rem')};
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => (props.$compact ? '0.375rem' : '0.5rem')};
`;

const SubLevel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => (props.$compact ? '0.375rem' : '0.5rem')};
  padding-left: ${props => (props.$compact ? '0.75rem' : '1rem')};
  border-left: 2px solid ${props => (props.$onColor ? 'rgba(255, 255, 255, 0.4)' : props.theme.colors.borderLight)};
`;

const SubLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => (props.$onColor ? 'rgba(255, 255, 255, 0.85)' : props.theme.colors.textSecondary)};
`;

const Optional = styled.span`
  font-weight: ${props => props.theme.typography.weights.regular};
  opacity: 0.8;
`;

const Chip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: ${props => (props.$compact ? '0.3rem 0.7rem' : '0.4375rem 0.875rem')};
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => (props.$compact ? props.theme.typography.sizes.xs : props.theme.typography.sizes.sm)};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-align: left;

  ${props => (props.$onColor ? css`
    background: ${props.$selected ? 'white' : 'rgba(255, 255, 255, 0.15)'};
    color: ${props.$selected ? props.theme.colors.primary : 'white'};
    border: 2px solid ${props.$selected ? 'white' : 'rgba(255, 255, 255, 0.5)'};

    &:hover {
      border-color: white;
    }
  ` : css`
    background: ${props.$selected ? props.theme.colors.primary : props.theme.colors.backgroundSecondary};
    color: ${props.$selected ? 'white' : props.theme.colors.text};
    border: 1px solid ${props.$selected ? props.theme.colors.primary : props.theme.colors.border};

    &:hover {
      border-color: ${props.theme.colors.primary};
    }
  `)}

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
`;

const ShortName = styled.span`
  opacity: 0.7;
`;

const Message = styled.p`
  margin: 0;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => (props.$onColor ? 'rgba(255, 255, 255, 0.85)' : props.theme.colors.textSecondary)};
`;

// A tag's name in the site's language: the Thai name in Thai when staff gave
// one, otherwise the English name.
export function localizedTagName(tag, language) {
  return String(language || '').startsWith('th') && tag.name_th ? tag.name_th : tag.name;
}

// Loads the active tag tree for an institution. `tags` is null while loading.
export function useStudyTags(institutionId) {
  const [tags, setTags] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!institutionId) {
      setTags([]);
      return undefined;
    }
    let cancelled = false;
    setTags(null);
    setFailed(false);
    studyTagsAPI.list(institutionId)
      .then(res => { if (!cancelled) setTags(res.data.tags || []); })
      .catch(() => {
        if (!cancelled) {
          setTags([]);
          setFailed(true);
        }
      });
    return () => { cancelled = true; };
  }, [institutionId]);

  return { tags, failed };
}

const StudyTagPicker = ({ tags, value, onChange, disabled = false, onColor = false, compact = false }) => {
  const { t, i18n } = useTranslation();
  const index = useMemo(() => indexTagTree(tags), [tags]);
  const nameOf = (tag) => localizedTagName(tag, i18n.language);

  const renderChip = (tag) => {
    const selected = isTagOn(index, value, tag.tag_id);
    // Compact (admin) chips use the short name to fit many on a row.
    const label = compact ? tag.short_name || tag.name : nameOf(tag);
    return (
      <Chip
        key={tag.tag_id}
        type="button"
        $onColor={onColor}
        $compact={compact}
        $selected={selected}
        aria-pressed={selected}
        title={compact ? [tag.name, tag.name_th].filter(Boolean).join(' · ') : undefined}
        disabled={disabled}
        onClick={() => onChange(toggleTag(index, value, tag.tag_id))}
      >
        {selected && !compact && <Check size={14} aria-hidden="true" />}
        {label}
        {!compact && tag.short_name && <ShortName>{tag.short_name}</ShortName>}
      </Chip>
    );
  };

  // A row of chips, then, for each selected chip that has sub-tags, an
  // indented block with those (and so on down).
  const renderLevel = (nodes) => (
    <>
      <Chips $compact={compact}>{nodes.map(renderChip)}</Chips>
      {nodes
        .filter(tag => tag.children.length > 0 && isTagOn(index, value, tag.tag_id))
        .map(tag => (
          <SubLevel key={tag.tag_id} $onColor={onColor} $compact={compact}>
            {!compact && (
              <SubLabel $onColor={onColor}>
                <CornerDownRight size={12} aria-hidden="true" />
                {nameOf(tag)}
                <Optional>({t('studyProfile.optional')})</Optional>
              </SubLabel>
            )}
            {renderLevel(tag.children)}
          </SubLevel>
        ))}
    </>
  );

  return <Wrap $compact={compact}>{renderLevel(tags)}</Wrap>;
};

export const StudyTagMessage = Message;

export default StudyTagPicker;
