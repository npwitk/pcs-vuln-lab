import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { cheatSheetsAPI } from '../services/api';

const ViewerShell = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ToolbarButton = styled.button`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.backgroundSecondary};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const ZoomLabel = styled.span`
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  min-width: 42px;
  text-align: center;
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${props => props.theme.colors.border};
`;

const PageJumpForm = styled.form`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  font-size: ${props => props.theme.typography.sizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const PageInput = styled.input`
  width: 42px;
  text-align: center;
  padding: 0.3rem;
  border-radius: ${props => props.theme.radius.sm};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
`;

const ScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-height: 70vh;
  overflow: auto;
  padding: 1rem;
  background: ${props => props.theme.colors.background};
`;

const PageWrapper = styled.div`
  width: 100%;
  max-width: 900px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 300px;
`;

// The canvas, not an <img>, is the actual protection here — any rendered
// <img> is right-click-saveable in every browser regardless of its URL
// scheme (blob: included), but a <canvas> shows no "Save image as" option
// once its own context menu is suppressed below.
const PreviewCanvas = styled.canvas`
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.md};
  background: ${props => props.theme.colors.backgroundSecondary};
  user-select: none;
  -webkit-touch-callout: none;
  display: block;
`;

const StatusBox = styled.div`
  min-height: 300px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.sizes.base};
  text-align: center;
  padding: 2rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};
`;

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

// Reads a 2xx blob response and, if it's actually a JSON "still preparing"
// or error body rather than an image, parses it out. A 202 is a 2xx status,
// so axios resolves it normally here — it never hits a catch block, which is
// why this check has to happen on every successful response.
async function readPreviewResponse(response) {
  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/json')) {
    const text = await response.data.text();
    return { kind: 'json', body: JSON.parse(text), status: response.status };
  }
  return { kind: 'image', blob: response.data };
}

const PreviewPage = ({ cheatsheetId, page, zoom, registerRef }) => {
  const [status, setStatus] = useState('pending'); // pending | loading | loaded | error
  const [errorMessage, setErrorMessage] = useState(null);
  const [naturalSize, setNaturalSize] = useState(null); // { width, height } in real pixels
  const canvasRef = useRef(null);
  const hasStartedRef = useRef(false);
  const retryTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchAndDraw = useCallback(async () => {
    if (!mountedRef.current) return;
    setStatus('loading');
    setErrorMessage(null);

    try {
      const response = await cheatSheetsAPI.getPreviewPage(cheatsheetId, page);
      if (!mountedRef.current) return;
      const result = await readPreviewResponse(response);

      if (result.kind === 'json') {
        if (response.status === 202) {
          retryTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) fetchAndDraw();
          }, 3000);
          return;
        }
        setErrorMessage(result.body.message || 'Could not load this page.');
        setStatus('error');
        return;
      }

      const objectUrl = URL.createObjectURL(result.blob);
      const img = new Image();
      img.onload = () => {
        if (!mountedRef.current) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d').drawImage(img, 0, 0);
        }
        // Drop the blob URL and the Image reference immediately once
        // drawn — nothing keeps a copy of the raw page bytes around.
        URL.revokeObjectURL(objectUrl);
        setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        setStatus('loaded');
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        if (mountedRef.current) {
          setErrorMessage('Could not load this page.');
          setStatus('error');
        }
      };
      img.src = objectUrl;
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(err.response?.data?.message || 'Could not load this page.');
      setStatus('error');
    }
  }, [cheatsheetId, page]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  const setWrapperRef = useCallback((el) => {
    registerRef(page, el);
    if (el && !hasStartedRef.current) {
      // Lazy-load: only fetch once the page is about to scroll into view,
      // rather than fetching every page upfront — keeps a large document
      // from firing dozens of requests at once (staying well under the
      // endpoint's per-IP rate limit) while still feeling like continuous
      // scroll once the user actually gets there.
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasStartedRef.current) {
            hasStartedRef.current = true;
            fetchAndDraw();
            observer.disconnect();
          }
        },
        { rootMargin: '300px 0px' }
      );
      observer.observe(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, registerRef]);

  return (
    <PageWrapper ref={setWrapperRef} data-page={page}>
      {status !== 'loaded' && (
        <StatusBox>
          {status === 'error'
            ? errorMessage
            : status === 'loading'
              ? `Loading page ${page}…`
              : `Page ${page}`}
        </StatusBox>
      )}
      <PreviewCanvas
        ref={canvasRef}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: status === 'loaded' ? 'block' : 'none',
          // 100% = fits PageWrapper's 900px max column width; zooming past
          // that overflows horizontally, which ScrollContainer's `overflow:
          // auto` picks up as a scrollbar.
          width: `${zoom}%`,
          height: 'auto',
          // Pins height to the canvas's real pixel proportions so it scales
          // uniformly with width instead of being fought over by the flex
          // parent's cross-axis sizing (which is what produced the
          // non-uniform "stretch" on zoom before this was set explicitly).
          aspectRatio: naturalSize ? `${naturalSize.width} / ${naturalSize.height}` : undefined,
        }}
      />
    </PageWrapper>
  );
};

const FullPreviewViewer = ({ cheatsheetId, pageCount }) => {
  const [zoom, setZoom] = useState(100);
  const [visiblePage, setVisiblePage] = useState(1);
  const [jumpValue, setJumpValue] = useState('1');
  const containerRef = useRef(null);
  const pageRefs = useRef({});

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const registerRef = useCallback((page, el) => {
    pageRefs.current[page] = el;
  }, []);

  // Tracks which page is most in view for the toolbar's "Page X / N"
  // indicator — separate from each PreviewPage's own lazy-load observer.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best) {
          const page = parseInt(best.target.dataset.page, 10);
          setVisiblePage(page);
          setJumpValue(String(page));
        }
      },
      { root: container, threshold: [0.25, 0.5, 0.75] }
    );

    Object.values(pageRefs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const jumpToPage = (page) => {
    const clamped = Math.min(pageCount, Math.max(1, page));
    const el = pageRefs.current[clamped];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    jumpToPage(parseInt(jumpValue, 10) || 1);
  };

  return (
    <ViewerShell>
      <Toolbar>
        <ToolbarButton
          onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
        >
          −
        </ToolbarButton>
        <ZoomLabel>{zoom}%</ZoomLabel>
        <ToolbarButton
          onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
        >
          +
        </ToolbarButton>
        <ToolbarDivider />
        <PageJumpForm onSubmit={handleJumpSubmit}>
          <PageInput
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value.replace(/\D/g, ''))}
            onBlur={handleJumpSubmit}
            inputMode="numeric"
          />
          <span>/ {pageCount}</span>
        </PageJumpForm>
      </Toolbar>
      <ScrollContainer ref={containerRef}>
        {pages.map((page) => (
          <PreviewPage
            key={page}
            cheatsheetId={cheatsheetId}
            page={page}
            zoom={zoom}
            registerRef={registerRef}
          />
        ))}
      </ScrollContainer>
    </ViewerShell>
  );
};

export default FullPreviewViewer;
