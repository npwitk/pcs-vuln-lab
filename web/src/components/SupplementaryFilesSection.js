import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { cheatSheetFilesAPI } from '../services/api';
import { FileIcon, DownloadIcon } from './Icons';

const Section = styled.div`
  margin-top: 2.5rem;
`;

const Title = styled.h3`
  font-size: ${props => props.theme.typography.sizes.xl};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1.5rem;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
`;

const FileMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const FileName = styled.div`
  font-size: ${props => props.theme.typography.sizes.base};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.875rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Visibility is decided by the caller (CheatSheetDetail.js) using the
// is_purchased/is_free/institution flags GET /:id already returns — that's
// only a UI hint, though. This component's own listForBuyer call re-verifies
// entitlement server-side, so a stale/tampered client flag can't leak the
// file list.
export default function SupplementaryFilesSection({ cheatsheetId }) {
  const [files, setFiles] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    cheatSheetFilesAPI.listForBuyer(cheatsheetId)
      .then(({ data }) => { if (!cancelled) setFiles(data.files || []); })
      .catch(() => { if (!cancelled) setFiles([]); });
    return () => { cancelled = true; };
  }, [cheatsheetId]);

  if (files.length === 0) return null;

  const handleDownload = async (file) => {
    setDownloadingId(file.file_id);
    try {
      const response = await cheatSheetFilesAPI.download(cheatsheetId, file.file_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Supplementary file download failed:', error);
      toast.error(error.response?.data?.message || 'Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Section>
      <Title>Supplementary Files</Title>
      <FileList>
        {files.map(file => (
          <FileRow key={file.file_id}>
            <FileIcon size={20} color="currentColor" />
            <FileMain>
              <FileName>{file.label || file.original_filename}</FileName>
              <FileMeta>
                {file.original_filename}
                {file.file_size_mb != null && ` · ${Number(file.file_size_mb).toFixed(2)} MB`}
              </FileMeta>
            </FileMain>
            <DownloadButton
              type="button"
              disabled={downloadingId === file.file_id}
              onClick={() => handleDownload(file)}
            >
              <DownloadIcon size={16} color="#fff" />
              {downloadingId === file.file_id ? 'Downloading...' : 'Download'}
            </DownloadButton>
          </FileRow>
        ))}
      </FileList>
    </Section>
  );
}
