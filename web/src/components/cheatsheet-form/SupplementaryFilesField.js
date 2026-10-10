import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cheatSheetFilesAPI } from '../../services/api';
import { FormGroup, Label, HelpText } from '../ui/FormGroup';
import { Input } from '../ui/Input';
import Button from '../ui/Button';
import { Paperclip } from 'lucide-react';
import { FileIcon, TrashIcon } from '../Icons';
import { MAX_SUPPLEMENTARY_FILES } from '../../constants/cheatSheetLimits';
import { useTranslation } from 'react-i18next';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
`;

const FileName = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const FileMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const RemoveButton = styled.button`
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

const ProgressBar = styled.div`
  height: 4px;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.borderLight};
  overflow: hidden;
  margin-top: 0.25rem;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress || 0}%;
    background: ${props => props.theme.colors.primary};
    transition: width ${props => props.theme.transitions.normal};
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

function formatSize(mb) {
  return typeof mb === 'number' ? mb.toFixed(2) : mb;
}

// The supplementary-files add/remove list. Operates in one of two modes:
// - cheatsheetId === null (Create, before the cheat sheet row exists yet):
//   picked files are queued locally in pendingFiles, no network calls.
// - cheatsheetId set (Edit, or Create after the row exists): each add
//   immediately uploads (signed URL -> PUT -> register) and each remove
//   immediately deletes.
export default function SupplementaryFilesField({
  cheatsheetId,
  existingFiles,
  onExistingFilesChange,
  pendingFiles,
  onPendingFilesChange,
  disabled
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [uploadingRows, setUploadingRows] = useState([]); // { localId, fileName, progress }

  const totalCount = existingFiles.length + pendingFiles.length + uploadingRows.length;

  const uploadImmediately = async (file) => {
    const localId = `${Date.now()}-${Math.random()}`;
    setUploadingRows(prev => [...prev, { localId, fileName: file.name, progress: 0 }]);

    try {
      const { data: uploadUrlData } = await cheatSheetFilesAPI.getUploadUrl(cheatsheetId, file.name);

      await axios.put(uploadUrlData.uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadingRows(prev => prev.map(r => r.localId === localId ? { ...r, progress: percent } : r));
        }
      });

      const { data } = await cheatSheetFilesAPI.register(cheatsheetId, {
        object_path: uploadUrlData.objectPath,
        original_filename: file.name
      });

      onExistingFilesChange([...existingFiles, data.file]);
    } catch (error) {
      console.error('Supplementary file upload failed:', error);
      toast.error(error.response?.data?.message || t('cheatSheetForm.supplementary.uploadFailed', { name: file.name }));
    } finally {
      setUploadingRows(prev => prev.filter(r => r.localId !== localId));
    }
  };

  const handleFilesPicked = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;

    if (totalCount + files.length > MAX_SUPPLEMENTARY_FILES) {
      toast.error(t('cheatSheetForm.supplementary.max', { max: MAX_SUPPLEMENTARY_FILES }));
      return;
    }

    if (cheatsheetId) {
      files.forEach(file => uploadImmediately(file));
    } else {
      const newPending = files.map(file => ({ localId: `${Date.now()}-${Math.random()}`, file, label: '' }));
      onPendingFilesChange([...pendingFiles, ...newPending]);
    }
  };

  const handleInputChange = (e) => {
    handleFilesPicked(e.target.files);
    e.target.value = '';
  };

  const removeExisting = async (fileId) => {
    try {
      await cheatSheetFilesAPI.delete(cheatsheetId, fileId);
      onExistingFilesChange(existingFiles.filter(f => f.file_id !== fileId));
    } catch (error) {
      console.error('Failed to delete supplementary file:', error);
      toast.error(error.response?.data?.message || t('cheatSheetForm.supplementary.removeFailed'));
    }
  };

  const removePending = (localId) => {
    onPendingFilesChange(pendingFiles.filter(p => p.localId !== localId));
  };

  return (
    <FormGroup>
      <Label><Paperclip size={15} />{t('cheatSheetForm.supplementary.label')}</Label>
      <List>
        {existingFiles.map(f => (
          <FileRow key={`existing-${f.file_id}`}>
            <FileIcon size={20} color="currentColor" />
            <FileMain>
              <FileName>{f.original_filename}</FileName>
              {f.file_size_mb != null && <FileMeta>{formatSize(f.file_size_mb)} MB</FileMeta>}
            </FileMain>
            <RemoveButton type="button" disabled={disabled} onClick={() => removeExisting(f.file_id)} title={t('cheatSheetForm.remove')}>
              <TrashIcon size={18} />
            </RemoveButton>
          </FileRow>
        ))}

        {pendingFiles.map(p => (
          <FileRow key={`pending-${p.localId}`}>
            <FileIcon size={20} color="currentColor" />
            <FileMain>
              <FileName>{p.file.name}</FileName>
              <FileMeta>{t('cheatSheetForm.supplementary.pendingMeta', { size: formatSize(p.file.size / 1024 / 1024) })}</FileMeta>
            </FileMain>
            <RemoveButton type="button" disabled={disabled} onClick={() => removePending(p.localId)} title={t('cheatSheetForm.remove')}>
              <TrashIcon size={18} />
            </RemoveButton>
          </FileRow>
        ))}

        {uploadingRows.map(r => (
          <FileRow key={r.localId}>
            <FileIcon size={20} color="currentColor" />
            <FileMain>
              <FileName>{r.fileName}</FileName>
              <ProgressBar $progress={r.progress} />
            </FileMain>
          </FileRow>
        ))}

        <HiddenInput ref={inputRef} type="file" multiple onChange={handleInputChange} disabled={disabled} />
        <Button
          type="button"
          $variant="secondary"
          $size="sm"
          disabled={disabled || totalCount >= MAX_SUPPLEMENTARY_FILES}
          onClick={() => inputRef.current?.click()}
          style={{ alignSelf: 'flex-start' }}
        >
          {t('cheatSheetForm.supplementary.add')}
        </Button>
      </List>
      <HelpText>
        {t('cheatSheetForm.supplementary.help', { max: MAX_SUPPLEMENTARY_FILES })}
      </HelpText>
    </FormGroup>
  );
}
