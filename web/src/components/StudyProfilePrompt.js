import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { X, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudyTagPicker, { useStudyTags, StudyTagMessage } from './StudyTagPicker';

// Home's personalization prompt, one banner at a time:
// 1. "What year are you in?" when year_level is missing
// 2. "What are you studying?" when the server says study_profile_due: the
//    user's institution has study tags and they haven't answered since the
//    academic year began, or ("Pick your track") once when their program's
//    tracks open for them (server/services/studyTags.js). Save or Skip both
//    count as an answer (Skip keeps any earlier picks); dismissing only hides
//    it for this session.

const Banner = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, #3B82F6 100%);
  color: white;
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  box-shadow: ${props => props.theme.shadows.md};
  position: relative;
`;

const BannerIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${props => props.theme.radius.full};
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const BannerBody = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  /* Clear the dismiss button in the corner. */
  padding-right: 1.5rem;
`;

const BannerText = styled.div`
  h3 {
    font-size: ${props => props.theme.typography.sizes.base};
    font-weight: ${props => props.theme.typography.weights.semibold};
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: ${props => props.theme.typography.sizes.sm};
    opacity: 0.9;
    margin: 0;
  }
`;

const Buttons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PillButton = styled.button`
  background: ${props => (props.$primary ? 'white' : 'rgba(255, 255, 255, 0.2)')};
  color: ${props => (props.$primary ? props.theme.colors.primary : 'white')};
  border: 2px solid ${props => (props.$primary ? 'white' : 'rgba(255, 255, 255, 0.5)')};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const DismissButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: white;
  }
`;

const YEAR_LEVELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const DISMISS_KEY = 'study_profile_prompt_dismissed';

function readDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

const StudyProfilePrompt = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, updateYearLevel, updateStudyTags } = useAuth();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [saving, setSaving] = useState(false);
  const [picked, setPicked] = useState(null);

  const needsYear = isAuthenticated && !user?.year_level;
  const needsTags = isAuthenticated && !!user?.study_profile_due;
  // Only fetch the tag list once the tags step is actually next.
  const { tags, failed } = useStudyTags(!needsYear && needsTags ? user.institution_id : null);

  if (dismissed || (!needsYear && !needsTags)) return null;
  // Tags step: wait for the list, and stay hidden if there's nothing to pick.
  if (!needsYear && (tags === null || (tags.length === 0 && !failed))) return null;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Private mode or blocked storage: it hides now and may show again on reload.
    }
    setDismissed(true);
  };

  const handleSelectYear = async (yearLevel) => {
    setSaving(true);
    try {
      await updateYearLevel(yearLevel);
      toast.success(t('studyProfile.yearSaved', { year: yearLevel }));
    } catch {
      toast.error(t('studyProfile.yearSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const saveTags = async (tagIds) => {
    setSaving(true);
    try {
      await updateStudyTags(tagIds);
      if (tagIds.length > 0) toast.success(t('studyProfile.saved'));
    } catch {
      toast.error(t('studyProfile.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const selection = picked ?? user?.study_tag_ids ?? [];

  return (
    <Banner>
      <DismissButton onClick={handleDismiss} title={t('studyProfile.dismiss')} aria-label={t('studyProfile.dismiss')}>
        <X size={16} />
      </DismissButton>
      <BannerIcon>
        <GraduationCap size={20} />
      </BannerIcon>
      {needsYear ? (
        <BannerBody>
          <BannerText>
            <h3>{t('studyProfile.yearTitle')}</h3>
            <p>{t('studyProfile.yearSubtitle')}</p>
          </BannerText>
          <Buttons>
            {YEAR_LEVELS.map(level => (
              <PillButton key={level} onClick={() => handleSelectYear(level)} disabled={saving}>
                {level}
              </PillButton>
            ))}
          </Buttons>
        </BannerBody>
      ) : (
        <BannerBody>
          <BannerText>
            {user?.study_profile_reason === 'tracks' ? (
              <>
                <h3>{t('studyProfile.trackTitle')}</h3>
                <p>{t('studyProfile.trackSubtitle')}</p>
              </>
            ) : (
              <>
                <h3>{t('studyProfile.title')}</h3>
                <p>{t('studyProfile.subtitle')}</p>
              </>
            )}
          </BannerText>
          {failed ? (
            <StudyTagMessage $onColor>{t('studyProfile.loadFailed')}</StudyTagMessage>
          ) : (
            <StudyTagPicker tags={tags} value={selection} onChange={setPicked} disabled={saving} onColor />
          )}
          <Buttons>
            <PillButton $primary onClick={() => saveTags(selection)} disabled={saving || failed || selection.length === 0}>
              {saving ? t('studyProfile.saving') : t('studyProfile.save')}
            </PillButton>
            {/* Skip keeps whatever was picked before (e.g. last year) and stops asking. */}
            <PillButton onClick={() => saveTags(user?.study_tag_ids ?? [])} disabled={saving || failed}>
              {t('studyProfile.skip')}
            </PillButton>
          </Buttons>
        </BannerBody>
      )}
    </Banner>
  );
};

export default StudyProfilePrompt;
