import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Send, Download, FileText, User } from 'lucide-react';
import { downloadTransferAPI } from '../services/api';

const DIGIT_COUNT = 6;

const Container = styled.div`
  max-width: 460px;
  margin: 0 auto;
  padding: 3rem 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const IconBadge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${props => props.theme.radius.lg};
  background: ${props => props.theme.colors.primaryLight};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['2xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  text-align: center;
  line-height: ${props => props.theme.typography.lineHeights.relaxed};
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.lg};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const InputLabel = styled.label`
  display: block;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: center;
  margin-bottom: 0.75rem;
`;

const DigitRow = styled.div`
  display: flex;
  gap: 0.6rem;
  justify-content: center;
`;

const DigitInput = styled.input`
  width: 100%;
  max-width: 52px;
  aspect-ratio: 1;
  font-size: 1.5rem;
  font-weight: ${props => props.theme.typography.weights.bold};
  text-align: center;
  font-variant-numeric: tabular-nums;
  border: 1.5px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  transition: border-color ${props => props.theme.transitions.fast}, box-shadow ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const ErrorText = styled.p`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.sizes.sm};
  text-align: center;
  margin-top: 1rem;
`;

const Button = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.875rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.md};
  font-weight: ${props => props.theme.typography.weights.semibold};
  font-size: ${props => props.theme.typography.sizes.base};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all ${props => props.theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: 1.5px solid ${props => props.theme.colors.border};
  margin-top: 0.75rem;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.backgroundSecondary};
    color: ${props => props.theme.colors.text};
  }
`;

const SheetPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 0.875rem;
`;

const SheetIcon = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SheetCourseCode = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.primary};
  text-transform: uppercase;
  margin-bottom: 0.15rem;
`;

const SheetTitle = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const BuyerLine = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0 0.25rem;
`;

const ProgressWrapper = styled.div`
  margin-top: 1.5rem;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.backgroundSecondary};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.primary};
  width: ${props => props.$percent}%;
  transition: width 0.3s ease;
`;

const shimmer = keyframes`
  0% { left: -40%; }
  100% { left: 100%; }
`;

// Shown when we have no size reference at all (file_size_mb missing) — a
// moving band instead of a stalled, meaningless 0% bar.
const ProgressIndeterminate = styled.div`
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  border-radius: ${props => props.theme.radius.full};
  background: ${props => props.theme.colors.primary};
  animation: ${shimmer} 1.1s ease-in-out infinite;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
`;

const RedeemTransferCode = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [sheetInfo, setSheetInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  // 0-100 while we can compute a real percentage, null while indeterminate
  // (no known file size to compare bytes-received against).
  const [downloadProgress, setDownloadProgress] = useState(null);
  const inputRefs = useRef([]);

  const handleCheckCode = async (candidate = code) => {
    if (candidate.length !== DIGIT_COUNT) return;
    setChecking(true);
    setError('');
    try {
      const response = await downloadTransferAPI.checkCode(candidate);
      setSheetInfo(response.data);
    } catch (err) {
      setSheetInfo(null);
      setError(t('transferCode.invalidOrExpired'));
    } finally {
      setChecking(false);
    }
  };

  // Auto-check the moment the 6th digit is entered, so a valid code doesn't
  // need an extra click — the button stays as a manual fallback/retry.
  useEffect(() => {
    if (code.length === DIGIT_COUNT && !sheetInfo) {
      handleCheckCode(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleDigitChange = (index, e) => {
    const digits = e.target.value.replace(/\D/g, '');
    setError('');

    if (!digits) {
      const next = code.split('');
      next[index] = '';
      setCode(next.join(''));
      return;
    }

    setCode((prev) => {
      const next = prev.split('');
      const chars = digits.split('');
      for (let i = 0; i < chars.length && index + i < DIGIT_COUNT; i++) {
        next[index + i] = chars[i];
      }
      return next.join('').slice(0, DIGIT_COUNT);
    });

    const nextIndex = Math.min(index + digits.length, DIGIT_COUNT - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, DIGIT_COUNT);
    if (pasted) {
      e.preventDefault();
      setCode(pasted);
      inputRefs.current[Math.min(pasted.length, DIGIT_COUNT - 1)]?.focus();
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadProgress(null);

    // The download response is chunked (no Content-Length — see
    // server/routes/downloadTransfer.js), so progressEvent.total is never
    // set. The uploaded file size we already fetched in checkCode() stands
    // in as the denominator instead, computed from real bytes received.
    const totalBytes = sheetInfo.file_size_mb ? sheetInfo.file_size_mb * 1024 * 1024 : null;
    const onProgress = (progressEvent) => {
      const total = progressEvent.total || totalBytes;
      if (total) {
        // Capped just under 100 — the watermarked file is written and
        // streamed only after we already know its rough size, so the last
        // sliver (headers/stream teardown) shouldn't visually claim "done"
        // before the browser has actually finished saving it.
        setDownloadProgress(Math.min(99, Math.round((progressEvent.loaded / total) * 100)));
      }
    };

    try {
      const response = await downloadTransferAPI.downloadWithCode(code, onProgress);
      setDownloadProgress(100);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${sheetInfo.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(t('transferCode.downloadCompleted'));
    } catch (err) {
      toast.error(t('transferCode.downloadFailed'));
      // The code is single-use. Whether redemption failed or succeeded
      // server-side, it's no longer valid, so send them back to a fresh one.
      setSheetInfo(null);
      setCode('');
      inputRefs.current[0]?.focus();
    } finally {
      setDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleStartOver = () => {
    setSheetInfo(null);
    setCode('');
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <Container>
      <IconBadge><Send size={26} /></IconBadge>
      <Title>{t('transferCode.pageTitle')}</Title>
      <Subtitle>{t('transferCode.pageSubtitle')}</Subtitle>

      <Card>
        {!sheetInfo ? (
          <>
            <InputLabel>{t('transferCode.inputLabel')}</InputLabel>
            <DigitRow onPaste={handlePaste}>
              {Array.from({ length: DIGIT_COUNT }).map((_, i) => (
                <DigitInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={code[i] || ''}
                  onChange={(e) => handleDigitChange(i, e)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  disabled={checking}
                  autoFocus={i === 0}
                />
              ))}
            </DigitRow>
            {error && <ErrorText>{error}</ErrorText>}
            <Button onClick={() => handleCheckCode()} disabled={checking || code.length !== DIGIT_COUNT}>
              {checking ? t('transferCode.checking') : t('transferCode.checkCode')}
            </Button>
          </>
        ) : (
          <>
            <SheetPreview>
              <SheetIcon><FileText size={20} /></SheetIcon>
              <div>
                <SheetCourseCode>{sheetInfo.course_code}</SheetCourseCode>
                <SheetTitle>{sheetInfo.title}</SheetTitle>
              </div>
            </SheetPreview>
            {sheetInfo.buyer_name && (
              <BuyerLine>
                <User size={14} />
                {t('transferCode.downloadingFor', { name: sheetInfo.buyer_name })}
              </BuyerLine>
            )}
            {downloading ? (
              <ProgressWrapper>
                <ProgressTrack>
                  {downloadProgress === null ? (
                    <ProgressIndeterminate />
                  ) : (
                    <ProgressFill $percent={downloadProgress} />
                  )}
                </ProgressTrack>
                <ProgressLabel>
                  <span>{t('transferCode.downloading')}</span>
                  {downloadProgress !== null && <span>{downloadProgress}%</span>}
                </ProgressLabel>
              </ProgressWrapper>
            ) : (
              <Button onClick={handleDownload}>
                <Download size={18} />
                {t('transferCode.downloadPdf')}
              </Button>
            )}
            <SecondaryButton onClick={handleStartOver} disabled={downloading}>
              {t('transferCode.enterAnotherCode')}
            </SecondaryButton>
          </>
        )}
      </Card>
    </Container>
  );
};

export default RedeemTransferCode;
