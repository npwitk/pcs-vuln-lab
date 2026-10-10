import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { FormGroup, Label, HelpText } from '../ui/FormGroup';
import { UploadIcon, FileIcon, TrashIcon } from '../Icons';
import { useTranslation } from 'react-i18next';

const Dropzone = styled.div`
  border: 2px dashed ${props => props.$isDragActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.$isDragActive ? props.theme.colors.primaryLight : props.theme.colors.backgroundSecondary};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primaryLight};
  }
`;

const DropzoneText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const SelectedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
`;

const SelectedInfo = styled.div`
  flex: 1;
  min-width: 0;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ClearButton = styled.button`
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
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.error};
  }
`;

const Thumbnail = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
  object-fit: cover;
  margin-top: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 4px;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.borderLight};
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress || 0}%;
    background: ${props => props.theme.colors.primary};
    transition: width ${props => props.theme.transitions.normal};
  }
`;

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2);
}

// A single reusable drag-and-drop-capable file picker, used for the PDF,
// preview image, and each supplementary-file slot alike. Controlled:
// selectedFile/onFileSelect own the actual File object.
export default function FileUploadField({
  label,
  required,
  helpText,
  accept,
  maxSizeBytes,
  selectedFile,
  onFileSelect,
  existingFileUrl,
  existingFileName,
  uploadProgress,
  disabled
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const validateAndSelect = (file) => {
    if (!file) return;

    if (accept && accept !== '*') {
      const acceptList = accept.split(',').map(a => a.trim());
      const matches = acceptList.some(pattern => {
        if (pattern.endsWith('/*')) {
          return file.type.startsWith(pattern.slice(0, -1));
        }
        return file.type === pattern;
      });
      if (!matches) {
        toast.error(t('cheatSheetForm.file.invalidType', { accept }));
        return;
      }
    }

    if (maxSizeBytes && file.size > maxSizeBytes) {
      toast.error(t('cheatSheetForm.file.tooLarge', { size: Math.floor(maxSizeBytes / 1024 / 1024) }));
      return;
    }

    onFileSelect(file);
  };

  const handleInputChange = (e) => {
    validateAndSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;
    validateAndSelect(e.dataTransfer.files[0]);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = '';
    onFileSelect(null);
  };

  // Shown whenever there's a URL to preview (the server's existing image, or
  // a fresh blob URL the parent swapped in after a new pick — see
  // EditCheatSheet's handlePreviewImageSelect) — independent of whether
  // selectedFile is also set, so the thumbnail keeps showing after replacing
  // the image, not just before.
  const isImageThumbnail = existingFileUrl && (!accept || accept.startsWith('image/'));

  return (
    <FormGroup>
      {label && <Label>{label} {required && <span>*</span>}</Label>}

      <HiddenInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />

      {selectedFile ? (
        <SelectedRow>
          <FileIcon size={20} color="currentColor" />
          <SelectedInfo>{selectedFile.name} ({formatSize(selectedFile.size)} MB)</SelectedInfo>
          <ClearButton type="button" onClick={handleClear} title={t('cheatSheetForm.remove')}>
            <TrashIcon size={18} />
          </ClearButton>
        </SelectedRow>
      ) : (
        <Dropzone
          $isDragActive={isDragActive}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragActive(true); }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
        >
          <UploadIcon size={24} color="currentColor" />
          <DropzoneText>
            {existingFileName ? t('cheatSheetForm.file.current', { name: existingFileName }) : t('cheatSheetForm.file.dropzone')}
          </DropzoneText>
        </Dropzone>
      )}

      {isImageThumbnail && <Thumbnail src={existingFileUrl} alt={t('cheatSheetForm.file.previewAlt')} />}

      {typeof uploadProgress === 'number' && uploadProgress > 0 && uploadProgress < 100 && (
        <ProgressBar $progress={uploadProgress} />
      )}

      {helpText && <HelpText>{helpText}</HelpText>}
    </FormGroup>
  );
}
