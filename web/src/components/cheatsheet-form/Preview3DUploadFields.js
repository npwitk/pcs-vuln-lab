import React from 'react';
import styled from 'styled-components';
import { Box, RotateCcw, Trash2 } from 'lucide-react';
import { FormGroup, Label, HelpText, Row } from '../ui/FormGroup';
import FileUploadField from './FileUploadField';
import StatusPill from '../ui/StatusPill';
import { useTranslation } from 'react-i18next';

const MAX_BYTES = 10 * 1024 * 1024;

const RemoveButton = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  cursor: pointer;

  &:hover {
    border-color: ${props => props.theme.colors.error};
    color: ${props => props.theme.colors.error};
  }
`;

/**
 * "3D preview (Beta)": photos or scans of the printed front and back, shown
 * as a rotatable sheet on the cheat sheet page (Sheet3DViewer). Used by both
 * the upload and edit forms. `onRemove` (edit only) clears saved images.
 */
export default function Preview3DUploadFields({
  front, back, onFrontChange, onBackChange,
  existingFrontUrl, existingBackUrl, onRemove, removed,
}) {
  const { t } = useTranslation();
  const hasSaved = !removed && (existingFrontUrl || existingBackUrl);
  return (
    <FormGroup>
      <Label><Box size={15} />{t('cheatSheetForm.preview3d.label')}<StatusPill>{t('cheatSheetForm.beta')}</StatusPill></Label>
      <HelpText>
        {t('cheatSheetForm.preview3d.help')}
      </HelpText>
      <Row>
        <FileUploadField
          label={<><Box size={15} />{t('cheatSheetForm.preview3d.front')}</>}
          accept="image/*"
          maxSizeBytes={MAX_BYTES}
          selectedFile={front}
          onFileSelect={onFrontChange}
          existingFileUrl={removed ? undefined : existingFrontUrl}
          helpText={t('cheatSheetForm.preview3d.frontHelp')}
        />
        <FileUploadField
          label={<><RotateCcw size={15} />{t('cheatSheetForm.preview3d.back')}</>}
          accept="image/*"
          maxSizeBytes={MAX_BYTES}
          selectedFile={back}
          onFileSelect={onBackChange}
          existingFileUrl={removed ? undefined : existingBackUrl}
          helpText={t('cheatSheetForm.preview3d.backHelp')}
        />
      </Row>
      {onRemove && hasSaved && !front && !back && (
        <RemoveButton type="button" onClick={onRemove}>
          <Trash2 size={14} /> {t('cheatSheetForm.preview3d.remove')}
        </RemoveButton>
      )}
      {removed && <HelpText>{t('cheatSheetForm.preview3d.removedNote')}</HelpText>}
    </FormGroup>
  );
}
