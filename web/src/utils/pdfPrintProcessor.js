// Reprocesses a PDF in the browser before it's uploaded to /api/safeq/print,
// so paper size (A4), margin, and true color/black-and-white are guaranteed
// correct regardless of anything SafeQ does on its end — bare LPR (what
// that route submits over) has no concept of job options at all, so there's
// nothing to "tell" SafeQ; the only reliable lever is the actual page
// content we send. Duplex/flip-edge USED to be unenforceable for the same
// reason (a physical printer instruction, not something a PDF's content can
// carry) - but SafeQ turns out to honor it when the job is real PCL XL with
// a PJL duplex directive (confirmed: submitted, showed Side: Duplex,
// physically printed duplex). The server (server/services/pdfToPclXl.js)
// converts this route's output to that format when duplex is requested.
//
// Two separate paths, on purpose, so the common case stays genuinely sharp:
//   - buildVectorProcessedPdf: the DEFAULT (color, no rasterization at all).
//     Uses pdf-lib's embedPdf/drawPage to place the ORIGINAL page content as
//     a real embedded PDF page (vector, text stays text) onto a fresh
//     A4-sized page with margin - no resolution ceiling, no quality loss.
//   - buildProcessedPdf: only used when Black & White is selected. True
//     grayscale conversion needs actual pixels, so this one does rasterize
//     (pdfjs-dist renders to canvas, pdf-lib re-embeds as a PNG image) - but
//     only for this one path, at a real print DPI passed in by the caller
//     at submit time, not the low-res canvases used for the on-screen preview.
//
// renderPdfPages (below) is ONLY for the on-screen 2D/3D preview - cheap and
// low-res on purpose (see PREVIEW_DPI). It is never used to build what
// actually gets uploaded.

import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// A plain static path (client/public/pdf.worker.min.mjs), not
// `new URL('pdfjs-dist/...', import.meta.url)` — that bundler-asset-resolution
// approach worked in a local CRA build but broke on the actual Vercel
// deployment (pdf.js's internal worker fallback ended up referencing a raw
// build-machine filesystem path as a URL). A checked-in static file sidesteps
// bundler/deploy-pipeline differences entirely. Must be re-copied from
// node_modules/pdfjs-dist/build/pdf.worker.min.mjs if pdfjs-dist is ever
// upgraded, to keep the worker version in lockstep with the library version.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// A4 in PDF points (72pt/inch).
export const A4_WIDTH_PT = 595.28;
export const A4_HEIGHT_PT = 841.89;

// PDF user space is 72 DPI by default, so scale = target DPI / 72.
function dpiToScale(dpi) {
  return dpi / 72;
}

// Cheap, screen-appropriate resolution for the on-screen 2D/3D preview only -
// this never touches what actually gets uploaded. ~144 DPI is plenty sharp
// on a monitor at preview size and keeps per-page canvas memory small
// (a 600 DPI canvas would be ~17x the pixel count of this per page, held for
// every page of the document at once for as long as the preview is showing -
// not something the preview step needs).
const PREVIEW_DPI = 144;

/**
 * Renders every page of `file` (a File/Blob) to an offscreen canvas via
 * pdfjs-dist, at `dpi` (default: the cheap preview resolution - pass a
 * higher one only for an actual print-quality rasterization, e.g. the
 * Black & White submission path). Returns
 * { pages: [{ canvas, width, height }], totalPages }. `maxPages` caps how
 * many are actually rendered (a defensive limit — this all runs on the
 * visitor's own device).
 */
export async function renderPdfPages(file, { dpi = PREVIEW_DPI, maxPages = 50 } = {}) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = Math.min(pdf.numPages, maxPages);
  const pages = [];

  for (let i = 1; i <= pageCount; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: dpiToScale(dpi) });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    // eslint-disable-next-line no-await-in-loop
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push({ canvas, width: viewport.width, height: viewport.height });
  }

  return { pages, totalPages: pdf.numPages };
}

// A fresh copy of a canvas — used so grayscale conversion (which mutates in
// place) never touches the pristine canvases from renderPdfPages, letting
// the user toggle Color/Black & White back and forth without re-rendering.
export function cloneCanvas(canvas) {
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  copy.getContext('2d').drawImage(canvas, 0, 0);
  return copy;
}

// In-place grayscale conversion (Rec. 601 luma weighting — standard
// perceptual grayscale, matches what most print/scan pipelines use).
export function toGrayscale(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function canvasToPngBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas failed to encode'));
      blob.arrayBuffer().then(resolve, reject);
    }, 'image/png');
  });
}

// Default safe-area inset (points, 1/72in) between the A4 edge and where
// content is scaled to fit. Printers can't physically print all the way to
// the paper edge (a hardware-enforced unprintable border) - without this,
// content scaled to fill the full A4 rectangle can get clipped on the
// actual printout, exactly like a system print dialog's "Fit" option is for.
// 18pt (~6.3mm) confirmed by hand against a real printer in this deployment
// (Rangsit MUL Floor2) - see "Peanut's Configuration" in PrintBalance.js.
export const DEFAULT_MARGIN_PT = 18;

/**
 * Builds a new PDF from rendered pages: one A4 page per input page, each
 * canvas embedded as an image and scaled to fit within A4 minus marginPt on
 * every side (centered), optionally grayscale-converted first. Returns a
 * Blob ready to upload. Never mutates the pristine canvases passed in (works
 * off clones), so this is safe to call repeatedly (e.g. the user
 * re-submitting) without needing to re-render the source PDF each time.
 */
export async function buildProcessedPdf(pages, { grayscale = false, marginPt = DEFAULT_MARGIN_PT } = {}) {
  const pdfDoc = await PDFDocument.create();

  for (const { canvas: original } of pages) {
    const canvas = grayscale ? toGrayscale(cloneCanvas(original)) : original;
    // eslint-disable-next-line no-await-in-loop
    const pngBytes = await canvasToPngBytes(canvas);
    // eslint-disable-next-line no-await-in-loop
    const pngImage = await pdfDoc.embedPng(pngBytes);

    // Landscape source content (wider than tall) gets a landscape A4 page
    // (dimensions swapped) instead of always forcing portrait - otherwise a
    // landscape page shrinks down small with huge wasted top/bottom margin
    // to fit inside a portrait box. Still real A4 paper either way, printers
    // handle a landscape-oriented page on a portrait-fed sheet natively -
    // this only affects the page's declared width/height, per page (a mixed
    // portrait+landscape document is handled correctly page by page).
    const isLandscape = pngImage.width > pngImage.height;
    const pageWidth = isLandscape ? A4_HEIGHT_PT : A4_WIDTH_PT;
    const pageHeight = isLandscape ? A4_WIDTH_PT : A4_HEIGHT_PT;
    const safeWidth = pageWidth - 2 * marginPt;
    const safeHeight = pageHeight - 2 * marginPt;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const scale = Math.min(safeWidth / pngImage.width, safeHeight / pngImage.height);
    const width = pngImage.width * scale;
    const height = pngImage.height * scale;
    page.drawImage(pngImage, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
  }

  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Builds a new PDF straight from the ORIGINAL file: one A4 page per source
 * page, the original page content embedded as a real vector PDF object
 * (pdf-lib's embedPdf/drawPage - an XObject reference, not a rasterized
 * image) and scaled/centered to fit within A4 minus marginPt. No canvas
 * rendering at all, so there's no resolution ceiling and no quality loss -
 * this is the default (color) path; only the Black & White path needs
 * actual pixels (see buildProcessedPdf) since true grayscale conversion
 * needs to touch pixel values.
 */
export async function buildVectorProcessedPdf(file, { marginPt = DEFAULT_MARGIN_PT } = {}) {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = srcDoc.getPageCount();

  const outDoc = await PDFDocument.create();
  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const embeddedPages = await outDoc.embedPdf(srcDoc, indices);

  for (const embeddedPage of embeddedPages) {
    const isLandscape = embeddedPage.width > embeddedPage.height;
    const pageWidth = isLandscape ? A4_HEIGHT_PT : A4_WIDTH_PT;
    const pageHeight = isLandscape ? A4_WIDTH_PT : A4_HEIGHT_PT;
    const safeWidth = pageWidth - 2 * marginPt;
    const safeHeight = pageHeight - 2 * marginPt;

    const scale = Math.min(safeWidth / embeddedPage.width, safeHeight / embeddedPage.height);
    const width = embeddedPage.width * scale;
    const height = embeddedPage.height * scale;

    const page = outDoc.addPage([pageWidth, pageHeight]);
    page.drawPage(embeddedPage, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
  }

  const bytes = await outDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
