import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, BookOpen, Phone, Share2, AlertTriangle, ShieldAlert, UserX } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';
import { SiLine } from 'react-icons/si';
import { authAPI, supportAPI } from '../services/api';
import usePageMeta from '../hooks/usePageMeta';
import StudyTagPicker, { useStudyTags, StudyTagMessage } from '../components/StudyTagPicker';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const Section = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.xl};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${props => props.theme.colors.backgroundSecondary};
  }

  &:focus:not(:disabled) {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const HelpText = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

// Programs block under the year level, inside Academic Information.
const SubSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.borderLight};
`;

const SaveButton = styled.button`
  padding: 0.75rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-size: ${props => props.theme.typography.sizes.base};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.theme.colors.border};
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.sizes['2xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  border: 3px solid ${props => props.theme.colors.border};
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProfileDetails = styled.div`
  flex: 1;
`;

const ProfileName = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.semibold};
  margin-bottom: 0.25rem;
`;

const ProfileEmail = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const SocialInputRow = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const SocialIconPrefix = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  border-right: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.backgroundSecondary};
  height: 100%;
  min-height: 46px;
`;

const SocialInput = styled.input`
  flex: 1;
  padding: 0.875rem;
  border: none;
  outline: none;
  font-size: ${props => props.theme.typography.sizes.base};
  background: transparent;
  color: ${props => props.theme.colors.text};

  &::placeholder {
    color: ${props => props.theme.colors.textTertiary};
  }
`;

const DangerZone = styled.div`
  border: 1.5px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.radius.lg};
  overflow: hidden;
`;

const DangerZoneHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem 1.5rem;
  background: ${props => props.theme.colors.error}18;
  border-bottom: 1.5px solid ${props => props.theme.colors.error}40;
  color: ${props => props.theme.colors.error};
`;

const DangerZoneTitle = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.error};
  margin: 0;
`;

const DangerZoneBody = styled.div`
  padding: 1.5rem;
`;

const WarningCard = styled.div`
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
  background: ${props => props.theme.colors.error}0C;
  border: 1px solid ${props => props.theme.colors.error}30;
  border-radius: ${props => props.theme.radius.md};
  padding: 1rem 1.125rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.error};
`;

const WarningCardContent = styled.div`
  flex: 1;
`;

const WarningCardTitle = styled.p`
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.error};
  margin-bottom: 0.375rem;
`;

const WarningCardDesc = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.65;
  margin: 0;
`;

const DangerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme.colors.error};
  color: white;
  border: none;
  padding: 0.75rem 1.375rem;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  box-shadow: ${props => props.theme.shadows.sm};

  &:hover:not(:disabled) {
    filter: brightness(0.88);
    transform: translateY(-1px);
    box-shadow: ${props => props.theme.shadows.md};
  }

  &:disabled {
    background: ${props => props.theme.colors.textTertiary};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

function Settings() {
  const { t } = useTranslation();
  usePageMeta(t('settings.title'));
  const { user, updateYearLevel, updateStudyTags } = useAuth();
  const [yearLevel, setYearLevel] = useState(user?.year_level || '');
  const [saving, setSaving] = useState(false);
  const { tags: studyTags, failed: studyTagsFailed } = useStudyTags(user?.institution_id);
  const [pickedTags, setPickedTags] = useState(null);
  const [savingTags, setSavingTags] = useState(false);
  const savedTagIds = user?.study_tag_ids || [];
  const tagSelection = pickedTags ?? savedTagIds;
  const tagsChanged = tagSelection.length !== savedTagIds.length
    || tagSelection.some(id => !savedTagIds.includes(id));
  const [social, setSocial] = useState({
    instagram: user?.instagram || '',
    line_id: user?.line_id || '',
    phone_number: user?.phone_number || '',
  });
  const [savingSocial, setSavingSocial] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivateAccount = async () => {
    if (!window.confirm(t('settings.dangerZone.confirm'))) return;
    if (!window.confirm(t('settings.dangerZone.confirmFinal'))) return;

    setDeactivating(true);
    try {
      await supportAPI.deleteAccount();
      toast.success(t('settings.dangerZone.success'));
      localStorage.removeItem('auth_token');
      // Full reload so the in-memory auth state is cleared too.
      setTimeout(() => window.location.assign('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || t('settings.dangerZone.failed'));
      setDeactivating(false);
    }
  };


  const handleSaveSocial = async () => {
    setSavingSocial(true);
    try {
      await authAPI.updateSocial(social);
      toast.success(t('settings.toasts.socialUpdated'));
    } catch (error) {
      console.error('Failed to update social links:', error);
      toast.error(t('settings.toasts.socialUpdateFailed'));
    } finally {
      setSavingSocial(false);
    }
  };

  const handleSaveStudyTags = async () => {
    setSavingTags(true);
    try {
      await updateStudyTags(tagSelection);
      setPickedTags(null);
      toast.success(t('studyProfile.saved'));
    } catch {
      toast.error(t('studyProfile.saveFailed'));
    } finally {
      setSavingTags(false);
    }
  };

  const handleSaveYearLevel = async () => {
    if (!yearLevel) {
      toast.error(t('settings.toasts.selectYearLevelRequired'));
      return;
    }

    setSaving(true);
    try {
      await updateYearLevel(yearLevel);
      toast.success(t('settings.toasts.yearLevelUpdated'));
    } catch (error) {
      console.error('Failed to update year level:', error);
      toast.error(error.response?.data?.message || t('settings.toasts.yearLevelUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{t('settings.title')}</Title>
        <Subtitle>{t('settings.subtitle')}</Subtitle>
      </Header>

      <Section>
        <SectionHeader>
          <User size={24} />
          <SectionTitle>{t('settings.profileInformation')}</SectionTitle>
        </SectionHeader>

        <ProfileInfo>
          {user?.avatar_url ? (
            <Avatar src={user.avatar_url} alt={user.name} />
          ) : (
            <AvatarPlaceholder>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarPlaceholder>
          )}
          <ProfileDetails>
            <ProfileName>{user?.name || t('settings.userFallback')}</ProfileName>
            <ProfileEmail>{user?.email || 'user@example.com'}</ProfileEmail>
          </ProfileDetails>
        </ProfileInfo>

        <FormGroup>
          <Label>{t('settings.name')}</Label>
          <Input
            type="text"
            value={user?.name || ''}
            disabled
          />
          <HelpText>{t('settings.nameHelp')}</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>{t('settings.email')}</Label>
          <Input
            type="email"
            value={user?.email || ''}
            disabled
          />
          <HelpText>{t('settings.emailHelp')}</HelpText>
        </FormGroup>
      </Section>

      <Section>
        <SectionHeader>
          <BookOpen size={24} />
          <SectionTitle>{t('settings.academicInformation')}</SectionTitle>
        </SectionHeader>

        <FormGroup>
          <Label>{t('settings.yearLevel')}</Label>
          <Select
            aria-label={t('settings.yearLevel')}
            value={yearLevel}
            onChange={(e) => setYearLevel(e.target.value)}
          >
            <option value="">{t('settings.selectYear')}</option>
            <option value="Year 1">{t('home.year1')}</option>
            <option value="Year 2">{t('home.year2')}</option>
            <option value="Year 3">{t('home.year3')}</option>
            <option value="Year 4">{t('home.year4')}</option>
          </Select>
          <HelpText>
            {t('settings.yearLevelHelp')}
          </HelpText>
        </FormGroup>

        <SaveButton
          onClick={handleSaveYearLevel}
          disabled={saving || yearLevel === user?.year_level}
        >
          {saving ? t('settings.saving') : t('settings.saveChanges')}
        </SaveButton>

        {/* Only for institutions with study tags; otherwise Settings is unchanged. */}
        {(studyTagsFailed || studyTags?.length > 0) && (
          <SubSection>
            <FormGroup>
              <Label as="div">{t('settings.studyProfile')}</Label>
              {studyTagsFailed ? (
                <StudyTagMessage>{t('studyProfile.loadFailed')}</StudyTagMessage>
              ) : (
                <StudyTagPicker tags={studyTags} value={tagSelection} onChange={setPickedTags} disabled={savingTags} />
              )}
              <HelpText>{t('settings.studyProfileHelp')}</HelpText>
            </FormGroup>
            {!studyTagsFailed && (
              <SaveButton onClick={handleSaveStudyTags} disabled={savingTags || !tagsChanged}>
                {savingTags ? t('settings.saving') : t('settings.saveStudyProfile')}
              </SaveButton>
            )}
          </SubSection>
        )}
      </Section>

      {!!user?.is_seller && (
        <Section>
          <SectionHeader>
            <Share2 size={24} />
            <SectionTitle>{t('settings.contactSocial')}</SectionTitle>
          </SectionHeader>

          <HelpText style={{ marginBottom: '1.25rem' }}>
            {t('settings.contactSocialHelp')}
          </HelpText>

          <FormGroup>
            <Label>{t('settings.instagram')}</Label>
            <SocialInputRow>
              <SocialIconPrefix>
                <FaInstagram size={16} />
              </SocialIconPrefix>
              <SocialInput
                type="text"
                placeholder="your_handle"
                value={social.instagram}
                onChange={(e) => setSocial(prev => ({ ...prev, instagram: e.target.value.replace(/^@/, '') }))}
                maxLength={100}
              />
            </SocialInputRow>
            <HelpText>{t('settings.instagramHelp')}</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>{t('settings.lineId')}</Label>
            <SocialInputRow>
              <SocialIconPrefix>
                <SiLine size={16} />
              </SocialIconPrefix>
              <SocialInput
                type="text"
                placeholder="your_line_id"
                value={social.line_id}
                onChange={(e) => setSocial(prev => ({ ...prev, line_id: e.target.value }))}
                maxLength={100}
              />
            </SocialInputRow>
          </FormGroup>

          <FormGroup>
            <Label>{t('settings.phoneNumber')}</Label>
            <SocialInputRow>
              <SocialIconPrefix>
                <Phone size={16} />
              </SocialIconPrefix>
              <SocialInput
                type="tel"
                placeholder="0812345678"
                value={social.phone_number}
                onChange={(e) => setSocial(prev => ({ ...prev, phone_number: e.target.value }))}
                maxLength={20}
              />
            </SocialInputRow>
          </FormGroup>

          <SaveButton onClick={handleSaveSocial} disabled={savingSocial}>
            {savingSocial ? t('settings.saving') : t('settings.saveSocialLinks')}
          </SaveButton>
        </Section>
      )}


      <DangerZone>
        <DangerZoneHeader>
          <AlertTriangle size={20} strokeWidth={2.25} />
          <DangerZoneTitle>{t('settings.dangerZone.title')}</DangerZoneTitle>
        </DangerZoneHeader>
        <DangerZoneBody>
          <WarningCard>
            <ShieldAlert size={20} strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
            <WarningCardContent>
              <WarningCardTitle>{t('settings.dangerZone.warningTitle')}</WarningCardTitle>
              <WarningCardDesc>{t('settings.dangerZone.warningBody')}</WarningCardDesc>
            </WarningCardContent>
          </WarningCard>
          <DangerButton onClick={handleDeactivateAccount} disabled={deactivating}>
            <UserX size={17} strokeWidth={2.25} />
            {deactivating ? t('settings.dangerZone.deactivating') : t('settings.dangerZone.button')}
          </DangerButton>
        </DangerZoneBody>
      </DangerZone>
    </Container>
  );
}

export default Settings;
