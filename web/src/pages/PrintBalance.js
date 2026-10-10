import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { Printer, Wallet, Receipt } from 'lucide-react';
import { safeqAPI } from '../services/api';
import { SAFEQ_TERMINAL_NAMES } from '../constants/safeqTerminals';
import { FormGroup, Label, HelpText } from '../components/ui/FormGroup';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import SafeqVerifyForm from '../components/SafeqVerifyForm';
import PrintPreview3D from '../components/PrintPreview3D';
import { getErrorMessage } from '../utils/getErrorMessage';
import { renderPdfPages, cloneCanvas, toGrayscale, buildProcessedPdf, buildVectorProcessedPdf, DEFAULT_MARGIN_PT } from '../utils/pdfPrintProcessor';

// A named preset rather than just a silent default — confirmed by hand
// against a real printer in this deployment (Rangsit MUL Floor2): 18pt
// (~6.3mm) margin is enough to stop content overflowing the printable area
// without leaving an oversized border, and 600dpi is legible where 150dpi
// came out unreadable on real content during testing. Anyone can still
// adjust either below; this just gives them a known-good starting point.
const PEANUTS_CONFIGURATION = { marginPt: DEFAULT_MARGIN_PT, dpi: 600 };
// Server clamps independently regardless (see MIN_DPI/MAX_DPI in
// server/services/pdfToPclXl.js) - these just keep the slider sane.
const MIN_DPI = 150;
const MAX_DPI = 1200;

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 60px);
  background: ${props => props.theme.colors.background};
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.sizes['3xl']};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.weights.bold};
`;

// Peanut-shell tan, matching "Peanut's Configuration" elsewhere on this page.
const BetaBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.625rem;
  border-radius: ${props => props.theme.radius.full};
  background: #c8955b;
  color: #fff;
  font-size: ${props => props.theme.typography.sizes.xs};
  font-weight: ${props => props.theme.typography.weights.bold};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
`;

const TabRow = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.35rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.full};
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: ${props => props.theme.radius.full};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  background: ${props => props.$active ? props.theme.colors.surface : 'transparent'};
  color: ${props => props.$active ? props.theme.colors.text : props.theme.colors.textSecondary};
  box-shadow: ${props => props.$active ? props.theme.shadows.sm : 'none'};
`;

const Card = styled.form`
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// Same look as Card, but a plain div — for wrapping SafeqVerifyForm, which
// renders its own <form>; forms can't nest.
const CardBox = styled.div`
  background: ${props => props.theme.colors.surface};
  padding: 2rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const PrivacyNote = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const BalanceHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
`;

const BalanceCard = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryHover} 100%);
  padding: 1.75rem 2rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: 2rem;
`;

const BalanceLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
`;

const BalanceValue = styled.div`
  font-size: ${props => props.theme.typography.sizes['4xl']};
  font-weight: ${props => props.theme.typography.weights.bold};
  color: white;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.typography.sizes.lg};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TransactionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1rem 1.25rem;
`;

const TxIcon = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  background: ${props => props.$kind === 'deposit' ? props.theme.colors.success + '22' : props.theme.colors.primaryLight};
  color: ${props => props.$kind === 'deposit' ? props.theme.colors.success : props.theme.colors.primary};
`;

const TxBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const TxTitle = styled.div`
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.sizes.sm};
  overflow-wrap: break-word;
`;

const TxMeta = styled.div`
  font-size: ${props => props.theme.typography.sizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.2rem;
`;

const TxRaw = styled.details`
  margin-top: 0.5rem;

  summary {
    font-size: ${props => props.theme.typography.sizes.xs};
    color: ${props => props.theme.colors.textTertiary};
    cursor: pointer;
    user-select: none;
  }

  p {
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 0.7rem;
    color: ${props => props.theme.colors.textTertiary};
    background: ${props => props.theme.colors.backgroundSecondary};
    border-radius: ${props => props.theme.radius.sm};
    padding: 0.5rem 0.625rem;
    margin: 0.375rem 0 0;
    overflow-wrap: break-word;
  }
`;

const TxAmount = styled.div`
  flex-shrink: 0;
  font-weight: ${props => props.theme.typography.weights.bold};
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.$positive ? props.theme.colors.success : props.theme.colors.text};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.xl};

  h3 {
    font-size: ${props => props.theme.typography.sizes.lg};
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.text};
  }

  p {
    font-size: ${props => props.theme.typography.sizes.sm};
  }
`;

const VerifiedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.surface};
  padding: 1.25rem 1.5rem;
  border-radius: ${props => props.theme.radius.xl};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: 1.25rem;
`;

const VerifiedText = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};

  strong {
    color: ${props => props.theme.colors.text};
  }
`;

const FormatNote = styled.p`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FixedValue = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.text};
  padding: 0.5rem 0;
`;

const PillRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Pill = styled.button`
  padding: 0.4rem 0.875rem;
  border-radius: ${props => props.theme.radius.full};
  border: 1.5px solid ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? '#fff' : props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// "Print job '<filename>' (id: <job id>) for user '<name>' on terminal
// '<terminal code>' (<n>), <N> pages." — SafeQ's own raw transaction text.
const PRINT_JOB_RE = /^Print job '(.+)' \(id: \d+\) for user '.*?' on terminal '([^']+)'(?:\s*\([^)]*\))?,\s*(\d+)\s*pages?\.?$/;

const TX_ICONS = { print: Printer, deposit: Wallet, other: Receipt };

function interpretTransaction(tx) {
  const match = (tx.description || '').match(PRINT_JOB_RE);
  if (match) {
    const [, filename, terminalCode, pages] = match;
    const location = SAFEQ_TERMINAL_NAMES[terminalCode] || terminalCode;
    return {
      kind: 'print',
      title: filename,
      meta: `${pages} ${pages === '1' ? 'page' : 'pages'} · ${location}`,
    };
  }
  if (/deposit/i.test(tx.type || '')) {
    return { kind: 'deposit', title: tx.type || 'Deposit', meta: null };
  }
  return { kind: 'other', title: tx.type || 'Transaction', meta: null };
}

// "Sep 21, 2026, 9:06 PM" -> "Sep 21, 2026 · 9:06 PM" (SafeQ's own date text,
// just swapping the last comma for a visual separator).
function formatTxDate(raw) {
  if (!raw) return raw;
  const idx = raw.lastIndexOf(',');
  return idx === -1 ? raw : `${raw.slice(0, idx)} ·${raw.slice(idx + 1)}`;
}

const PrintBalance = () => {
  const [activeTab, setActiveTab] = useState('balance');

  // Balance-check form — unchanged behavior, still asks for a password every
  // time (SafeQ requires a live session for this, which is never cached).
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Thammasat Printer verification status (30-day trust) — drives whether
  // the Print tab shows the verify form or the file-submit form.
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [file, setFile] = useState(null);
  const [printing, setPrinting] = useState(false);

  // Print options — paper size/color are guaranteed (we reprocess the PDF
  // ourselves before upload). Duplex/flip-edge is now real too: the server
  // converts to PCL XL + PJL when requested, the one format confirmed to
  // make SafeQ's queue actually honor it (see server/services/pdfToPclXl.js).
  const [colorMode, setColorMode] = useState('color');
  const [duplex, setDuplex] = useState(false);
  const [flipEdge, setFlipEdge] = useState('long');
  const [marginPt, setMarginPt] = useState(PEANUTS_CONFIGURATION.marginPt);
  // Only actually used when duplex is on - that's the only path that goes
  // through Ghostscript (server/services/pdfToPclXl.js); a plain simplex
  // PDF upload has no DPI concept of its own to control.
  const [dpi, setDpi] = useState(PEANUTS_CONFIGURATION.dpi);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Pristine rendered pages (never mutated) from the selected file, used to
  // both build the final upload and derive the live preview below.
  const [renderedPages, setRenderedPages] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [previewFront, setPreviewFront] = useState(null);
  const [previewBack, setPreviewBack] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  // Derives the live preview canvases from the pristine rendered pages
  // whenever the source file or color mode changes — always works off
  // clones (cloneCanvas), so the pristine renderedPages never get mutated
  // and toggling Color/Black & White back and forth never re-renders the PDF.
  useEffect(() => {
    if (!renderedPages || renderedPages.length === 0) {
      setPreviewFront(null);
      setPreviewBack(null);
      return;
    }

    const front = cloneCanvas(renderedPages[0].canvas);
    if (colorMode === 'bw') toGrayscale(front);
    setPreviewFront(front);

    if (renderedPages.length > 1) {
      const back = cloneCanvas(renderedPages[1].canvas);
      if (colorMode === 'bw') toGrayscale(back);
      setPreviewBack(back);
    } else {
      setPreviewBack(null);
    }
  }, [renderedPages, colorMode]);

  const fetchStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await safeqAPI.getStatus();
      setStatus(response.data);
      // Pre-fill the balance form's username once we know it, but don't
      // clobber anything the visitor already typed themselves.
      if (response.data.safeqUsername) {
        setUsername((prev) => prev || response.data.safeqUsername);
      }
    } catch (error) {
      console.error('Failed to fetch SafeQ status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    setBalanceLoading(true);
    try {
      const response = await safeqAPI.getBalance(username, password);
      // A wrong password resolves as a 401 here (validateStatus lets it
      // through instead of throwing) rather than rejecting — check success
      // explicitly instead of relying on catch for that case.
      if (!response.data.success) {
        toast.error(response.data.error || 'Failed to check balance');
        return;
      }
      setResult({
        balance: response.data.balance,
        transactions: response.data.transactions || [],
      });
      // Cleared right after a successful lookup — nothing about the
      // credentials needs to stick around once the request is done.
      setPassword('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to check balance'));
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setResult(null);
  };

  const resetPrintOptions = () => {
    setRenderedPages(null);
    setTotalPages(0);
    setRenderError(false);
    setColorMode('color');
    setDuplex(false);
    setFlipEdge('long');
    setMarginPt(PEANUTS_CONFIGURATION.marginPt);
    setDpi(PEANUTS_CONFIGURATION.dpi);
  };

  const applyPeanutsConfiguration = () => {
    setMarginPt(PEANUTS_CONFIGURATION.marginPt);
    setDpi(PEANUTS_CONFIGURATION.dpi);
    toast.success("Applied Peanut's Configuration");
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    resetPrintOptions();
    if (!selected) return;

    setRendering(true);
    try {
      const { pages, totalPages: count } = await renderPdfPages(selected);
      setRenderedPages(pages);
      setTotalPages(count);
    } catch (error) {
      // Not fatal — printing still works, just without options/preview for
      // this file (e.g. it isn't a PDF, or pdfjs couldn't parse it).
      console.error('Failed to render PDF for print preview:', error);
      setRenderError(true);
    } finally {
      setRendering(false);
    }
  };

  const handlePrintSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setPrinting(true);
    try {
      let uploadBlob = file;
      let uploadName = file.name;

      if (!renderError) {
        try {
          if (colorMode === 'bw') {
            // True grayscale conversion needs actual pixels - render fresh
            // at the chosen print resolution specifically for this
            // submission, not the cheap low-res canvases kept around for
            // the on-screen preview (renderedPages stays untouched, so it
            // never has to hold a heavier-than-preview-needs render).
            const { pages: highResPages } = await renderPdfPages(file, { dpi });
            uploadBlob = await buildProcessedPdf(highResPages, { grayscale: true, marginPt });
          } else {
            // Default: no rasterization at all - the original vector
            // content is embedded directly, so there's no resolution
            // ceiling and no quality loss.
            uploadBlob = await buildVectorProcessedPdf(file, { marginPt });
          }
          uploadName = file.name.replace(/\.pdf$/i, '') + '-print.pdf';
        } catch (buildError) {
          console.error('Failed to apply print options, sending original file instead:', buildError);
          toast('Could not apply print options, sending your original file instead.');
          uploadBlob = file;
          uploadName = file.name;
        }
      }

      const wantsDuplex = duplex && totalPages >= 2;
      const formData = new FormData();
      formData.append('file', uploadBlob, uploadName);
      formData.append('duplex', wantsDuplex ? 'true' : 'false');
      formData.append('edge', flipEdge);
      formData.append('color', colorMode);
      formData.append('dpi', String(dpi));
      const response = await safeqAPI.submitPrint(formData);

      if (wantsDuplex && !response.data.duplexApplied) {
        toast('Sent, but duplex could not be applied to this file — it went through as single-sided.');
      } else {
        toast.success('Sent! Check the "Waiting" queue on the Thammasat Printer dashboard to release it.');
      }
      setFile(null);
      resetPrintOptions();
      e.target.reset();
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error === 'verification_required') {
        toast.error('Your verification expired, please verify again.');
        setStatus((prev) => (prev ? { ...prev, verified: false } : prev));
      } else {
        toast.error(getErrorMessage(error, 'Failed to submit print job'));
      }
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Container>
      <Header>
        <TitleRow>
          <Title>Thammasat Printer</Title>
          <BetaBadge>Beta</BetaBadge>
        </TitleRow>
        <Subtitle>Check your print account balance and send files to print</Subtitle>
      </Header>

      <TabRow>
        <TabButton type="button" $active={activeTab === 'balance'} onClick={() => setActiveTab('balance')}>
          Balance
        </TabButton>
        <TabButton type="button" $active={activeTab === 'print'} onClick={() => setActiveTab('print')}>
          Print
        </TabButton>
      </TabRow>

      {activeTab === 'balance' ? (
        !result ? (
          <Card onSubmit={handleBalanceSubmit}>
            <FormGroup>
              <Label htmlFor="safeq-username">Thammasat Printer Username</Label>
              <Input
                id="safeq-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your university ID"
                autoComplete="off"
                required
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="safeq-password">Thammasat Printer Password</Label>
              <Input
                id="safeq-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="off"
                required
              />
              <HelpText>The same login you use at the university's print stations.</HelpText>
            </FormGroup>
            <Button type="submit" $variant="primary" disabled={balanceLoading}>
              {balanceLoading ? 'Checking...' : 'Check Balance'}
            </Button>
            <PrivacyNote>
              Your username and password are sent directly to Thammasat Printer to look
              up your balance and are never stored or logged by this site.
            </PrivacyNote>
          </Card>
        ) : (
          <>
            <BalanceHeaderRow>
              <SectionTitle>Recent Activity</SectionTitle>
              <Button type="button" $variant="secondary" $size="sm" onClick={handleCheckAnother}>
                Check another account
              </Button>
            </BalanceHeaderRow>

            <BalanceCard>
              <BalanceLabel>Current Balance</BalanceLabel>
              <BalanceValue>{result.balance?.raw || '—'}</BalanceValue>
            </BalanceCard>

            {result.transactions.length === 0 ? (
              <EmptyState>
                <h3>No transactions</h3>
                <p>Recent print account activity will show up here.</p>
              </EmptyState>
            ) : (
              <TransactionList>
                {result.transactions.map((tx, index) => {
                  const interpreted = interpretTransaction(tx);
                  const isPositive = tx.amount?.trim().startsWith('+');
                  const TxIconComponent = TX_ICONS[interpreted.kind] || Receipt;
                  return (
                    <TransactionRow key={index}>
                      <TxIcon $kind={interpreted.kind}><TxIconComponent size={18} /></TxIcon>
                      <TxBody>
                        <TxTitle>{interpreted.title}</TxTitle>
                        <TxMeta>
                          {formatTxDate(tx.date)}
                          {interpreted.meta ? ` · ${interpreted.meta}` : ''}
                        </TxMeta>
                        <TxRaw>
                          <summary>Raw data</summary>
                          <p>{tx.type} — {tx.description || '(no description)'}</p>
                        </TxRaw>
                      </TxBody>
                      <TxAmount $positive={isPositive}>{tx.amount}</TxAmount>
                    </TransactionRow>
                  );
                })}
              </TransactionList>
            )}
          </>
        )
      ) : statusLoading ? (
        <p>Loading...</p>
      ) : status?.verified ? (
        <>
          <VerifiedRow>
            <VerifiedText>
              Verified as <strong>{status.safeqUsername}</strong>, good until{' '}
              <strong>{new Date(status.expiresAt).toLocaleDateString()}</strong>
            </VerifiedText>
          </VerifiedRow>

          <Card onSubmit={handlePrintSubmit}>
            <FormGroup>
              <Label htmlFor="print-file">File to Print</Label>
              <Input
                id="print-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
              />
            </FormGroup>

            {rendering && <HelpText>Analyzing file...</HelpText>}

            {renderedPages && !renderError && (
              <>
                <OptionsGrid>
                  <OptionGroup>
                    <Label as="span">Paper Size</Label>
                    <FixedValue>A4</FixedValue>
                    <HelpText>
                      Your file is automatically resized to fit A4, portrait or landscape
                      per page to match your content.
                    </HelpText>
                  </OptionGroup>

                  <OptionGroup>
                    <Label as="span">Color</Label>
                    <PillRow>
                      <Pill type="button" $active={colorMode === 'color'} onClick={() => setColorMode('color')}>
                        Color
                      </Pill>
                      <Pill type="button" $active={colorMode === 'bw'} onClick={() => setColorMode('bw')}>
                        Black &amp; White
                      </Pill>
                    </PillRow>
                  </OptionGroup>
                </OptionsGrid>

                <OptionGroup>
                  <Label as="span">Duplex (double-sided)</Label>
                  <PillRow>
                    <Pill type="button" $active={!duplex} onClick={() => setDuplex(false)}>
                      Off
                    </Pill>
                    <Pill type="button" $active={duplex} disabled={totalPages < 2} onClick={() => setDuplex(true)}>
                      On
                    </Pill>
                  </PillRow>
                  {duplex && totalPages >= 2 && (
                    <PillRow>
                      <Pill type="button" $active={flipEdge === 'long'} onClick={() => setFlipEdge('long')}>
                        Flip long edge
                      </Pill>
                      <Pill type="button" $active={flipEdge === 'short'} onClick={() => setFlipEdge('short')}>
                        Flip short edge
                      </Pill>
                    </PillRow>
                  )}
                  <HelpText>
                    {totalPages < 2
                      ? "This file only has one page, there's nothing to flip."
                      : "Applied to the actual print job. If it can't be applied to your file for some reason, it falls back to single-sided and we'll tell you."}
                  </HelpText>
                </OptionGroup>

                <OptionGroup>
                  <Label as="span">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced((prev) => !prev)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                    >
                      Advanced {showAdvanced ? '▾' : '▸'}
                    </button>
                  </Label>
                  {showAdvanced && (
                    <>
                      <PillRow>
                        <Button type="button" $variant="secondary" $size="sm" onClick={applyPeanutsConfiguration}>
                          Use Peanut's Configuration
                        </Button>
                      </PillRow>
                      <FormGroup>
                        <Label htmlFor="print-margin">Margin ({marginPt}pt, ~{(marginPt / 72 * 25.4).toFixed(1)}mm)</Label>
                        <Input
                          id="print-margin"
                          type="range"
                          min={0}
                          max={36}
                          step={1}
                          value={marginPt}
                          onChange={(e) => setMarginPt(Number(e.target.value))}
                        />
                        <HelpText>
                          Blank border kept between your content and the A4 edge, so nothing gets
                          clipped by the printer's own unprintable border. 18pt is the confirmed-safe
                          default for the printers here; lower it if you want content closer to the edge.
                        </HelpText>
                      </FormGroup>
                      <FormGroup>
                        <Label htmlFor="print-dpi">Resolution ({dpi} DPI)</Label>
                        <Input
                          id="print-dpi"
                          type="range"
                          min={MIN_DPI}
                          max={MAX_DPI}
                          step={50}
                          value={dpi}
                          onChange={(e) => setDpi(Number(e.target.value))}
                        />
                        <HelpText>
                          {duplex || colorMode === 'bw'
                            ? `DPI (dots per inch) is how finely the page gets rasterized ${
                                duplex && colorMode === 'bw'
                                  ? 'for Black & White and the duplex conversion'
                                  : duplex ? 'for the duplex conversion' : 'for Black & White'
                              } - higher looks sharper but takes longer and makes a bigger file. ` +
                              `600 is the confirmed-legible default (150 came out unreadable on real ` +
                              `content); most printers don't resolve any real extra detail past 1200.`
                            : "Doesn't apply right now - a Color, single-sided job sends the original " +
                              'vector PDF content directly, with no rasterization step at all (sharper ' +
                              'than any DPI number could give you). This only matters for Black & White ' +
                              '(true grayscale needs real pixels) or Duplex (needs a real print format).'}
                        </HelpText>
                      </FormGroup>
                    </>
                  )}
                </OptionGroup>

                <PrintPreview3D
                  frontCanvas={previewFront}
                  backCanvas={previewBack}
                  duplex={duplex}
                  flipEdge={flipEdge}
                />
              </>
            )}

            {renderError && (
              <HelpText>
                Couldn't generate a preview for this file, it'll still be sent as-is.
              </HelpText>
            )}

            <Button type="submit" $variant="primary" disabled={printing || rendering || !file}>
              {printing ? 'Sending...' : rendering ? 'Analyzing...' : 'Send to Print'}
            </Button>
            <FormatNote>
              The job lands in "Waiting" on your Thammasat Printer dashboard, nothing prints or
              gets charged until you release it at a terminal. Paper size, margin, color, and
              duplex are all applied to the job itself before sending.
            </FormatNote>
          </Card>
        </>
      ) : (
        <CardBox>
          <SafeqVerifyForm
            initialUsername={username}
            submitLabel="Verify to Enable Printing"
            onVerified={setStatus}
          />
          <PrivacyNote>
            Verifying confirms this is really your account — only your username is
            remembered afterward (never your password), so printing for the next 30
            days needs no further password entry.
          </PrivacyNote>
        </CardBox>
      )}
    </Container>
  );
};

export default PrintBalance;
