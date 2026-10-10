// Copies text to the clipboard, trying the modern async Clipboard API first
// and falling back to a hidden-textarea + document.execCommand('copy') if
// that fails. The async API is known to be flaky on mobile right after a
// native share-sheet closes (document-focus/user-activation timing quirks,
// especially on Safari) — execCommand is deprecated but still broadly
// supported and isn't subject to the same timing requirements, so it's a
// reliable defensive fallback rather than a redundant first choice.
export async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard API copy failed, falling back:', err);
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (ok) return true;
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
  }

  return false;
}
