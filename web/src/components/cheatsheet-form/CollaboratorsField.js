import React, { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { cheatSheetCollaboratorsAPI } from '../../services/api';
import { FormGroup, Label, HelpText } from '../ui/FormGroup';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { TrashIcon } from '../Icons';
import { MAX_COLLABORATORS } from '../../constants/cheatSheetLimits';
import { useTranslation } from 'react-i18next';

const List = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem 0.375rem 0.375rem;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.borderLight};
`;

const ChipAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ChipLabel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ChipName = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
`;

const ChipMeta = styled.span`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ChipRemove = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  padding: 0.25rem;
  border-radius: ${props => props.theme.radius.sm};
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover {
    background: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.error};
  }
`;

const AddRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The collaborators add/remove list. Operates in one of two modes, same
// contract as SupplementaryFilesField.js:
// - cheatsheetId === null (Create, before the cheat sheet row exists yet):
//   typed emails are queued locally in pendingEmails, no network calls.
// - cheatsheetId set (Edit, or Create after the row exists): each add
//   immediately calls the API (which resolves an existing account or saves
//   a pending invite) and each remove immediately deletes.
export default function CollaboratorsField({
  cheatsheetId,
  existingCollaborators,
  onExistingCollaboratorsChange,
  pendingEmails,
  onPendingEmailsChange,
  disabled
}) {
  const { t } = useTranslation();
  const [emailInput, setEmailInput] = useState('');
  const [adding, setAdding] = useState(false);

  const totalCount = existingCollaborators.length + pendingEmails.length;

  const handleAdd = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      toast.error(t('cheatSheetForm.collaborators.invalidEmail'));
      return;
    }
    if (totalCount >= MAX_COLLABORATORS) {
      toast.error(t('cheatSheetForm.collaborators.max', { max: MAX_COLLABORATORS }));
      return;
    }
    if (pendingEmails.includes(email) || existingCollaborators.some(c => c.email === email)) {
      toast.error(t('cheatSheetForm.collaborators.duplicate'));
      return;
    }

    if (cheatsheetId) {
      setAdding(true);
      try {
        const { data } = await cheatSheetCollaboratorsAPI.add(cheatsheetId, { email });
        onExistingCollaboratorsChange([...existingCollaborators, data.collaborator]);
        setEmailInput('');
      } catch (error) {
        toast.error(error.response?.data?.message || t('cheatSheetForm.collaborators.addFailed'));
      } finally {
        setAdding(false);
      }
    } else {
      onPendingEmailsChange([...pendingEmails, email]);
      setEmailInput('');
    }
  };

  const removeExisting = async (collaboratorId) => {
    try {
      await cheatSheetCollaboratorsAPI.delete(cheatsheetId, collaboratorId);
      onExistingCollaboratorsChange(existingCollaborators.filter(c => c.collaborator_id !== collaboratorId));
    } catch (error) {
      toast.error(error.response?.data?.message || t('cheatSheetForm.collaborators.removeFailed'));
    }
  };

  const removePending = (email) => {
    onPendingEmailsChange(pendingEmails.filter(e => e !== email));
  };

  return (
    <FormGroup>
      <Label>{t('cheatSheetForm.collaborators.label')}</Label>
      <List>
        {existingCollaborators.map(c => (
          <Chip key={`existing-${c.collaborator_id}`}>
            <ChipAvatar>
              {c.avatar_url ? <img src={c.avatar_url} alt={c.name || c.email} /> : (c.name || c.email).charAt(0).toUpperCase()}
            </ChipAvatar>
            <ChipLabel>
              <ChipName>{c.name || c.email}</ChipName>
              {c.is_pending && <ChipMeta>{t('cheatSheetForm.collaborators.pending')}</ChipMeta>}
            </ChipLabel>
            <ChipRemove type="button" disabled={disabled} onClick={() => removeExisting(c.collaborator_id)} title={t('cheatSheetForm.remove')}>
              <TrashIcon size={16} />
            </ChipRemove>
          </Chip>
        ))}

        {pendingEmails.map(email => (
          <Chip key={`pending-${email}`}>
            <ChipAvatar>{email.charAt(0).toUpperCase()}</ChipAvatar>
            <ChipLabel>
              <ChipName>{email}</ChipName>
              <ChipMeta>{t('cheatSheetForm.collaborators.addedAfterCreate')}</ChipMeta>
            </ChipLabel>
            <ChipRemove type="button" disabled={disabled} onClick={() => removePending(email)} title={t('cheatSheetForm.remove')}>
              <TrashIcon size={16} />
            </ChipRemove>
          </Chip>
        ))}
      </List>

      <AddRow>
        <Input
          type="email"
          placeholder={t('cheatSheetForm.collaborators.placeholder')}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          disabled={disabled || totalCount >= MAX_COLLABORATORS}
        />
        <Button
          type="button"
          $variant="secondary"
          $size="sm"
          disabled={disabled || adding || totalCount >= MAX_COLLABORATORS}
          onClick={handleAdd}
        >
          {adding ? t('cheatSheetForm.collaborators.adding') : t('cheatSheetForm.collaborators.add')}
        </Button>
      </AddRow>
      <HelpText>
        {t('cheatSheetForm.collaborators.help', { max: MAX_COLLABORATORS })}
      </HelpText>
    </FormGroup>
  );
}
