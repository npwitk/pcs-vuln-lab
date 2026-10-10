import React, { useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import CodeMirror from '@uiw/react-codemirror';
import 'katex/dist/katex.min.css';
import { FormGroup, Label } from '../ui/FormGroup';
import Modal from '../ui/Modal';
import { markdownLivePreview, toggleWrap, prefixLines, insertText, insertLink } from './markdownLivePreview';
import { useTranslation } from 'react-i18next';

const MarkdownToolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.medium};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  height: 22px;
  background: ${props => props.theme.colors.border};
  align-self: center;
  margin: 0 0.125rem;
  flex-shrink: 0;
`;

const EditorFrame = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};
  resize: vertical;
  overflow: auto;
  min-height: 150px;

  &:focus-within {
    border-color: ${props => props.theme.colors.primary};
  }

  .cm-editor {
    background: transparent;
    color: inherit;
    min-height: 148px;
    font-size: ${props => props.theme.typography.sizes.base};
    font-family: inherit;
  }
  .cm-editor.cm-focused { outline: none; }
  .cm-scroller {
    font-family: inherit;
    line-height: ${props => props.theme.typography.lineHeights.relaxed};
  }
  .cm-content {
    padding: 0.875rem;
    caret-color: ${props => props.theme.colors.text};
  }
  .cm-line { padding: 0; }
  .cm-cursor { border-left-color: ${props => props.theme.colors.text}; }
  .cm-placeholder { color: ${props => props.theme.colors.textTertiary || props.theme.colors.textSecondary}; }
  &&& .cm-selectionBackground,
  &&& .cm-focused .cm-selectionBackground,
  .cm-content ::selection {
    background: ${props => props.theme.colors.primary}33;
  }

  /* Live-preview formatting, matching the CheatSheetDetail description */
  .cm-md-strong { font-weight: ${props => props.theme.typography.weights.bold}; }
  .cm-md-em { font-style: italic; }
  .cm-md-strike { text-decoration: line-through; }
  .cm-md-done { text-decoration: line-through; color: ${props => props.theme.colors.textSecondary}; }
  .cm-md-link { color: ${props => props.theme.colors.primary}; text-decoration: underline; }
  .cm-md-code {
    background: ${props => props.theme.colors.backgroundSecondary};
    padding: 0.125rem 0.25rem;
    border-radius: ${props => props.theme.radius.sm};
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  .cm-md-codeblock {
    background: ${props => props.theme.colors.backgroundSecondary};
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
    padding: 0 0.75rem;
  }
  .cm-md-quote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: 1rem;
    font-style: italic;
    color: ${props => props.theme.colors.textSecondary};
  }
  .cm-md-h1, .cm-md-h2, .cm-md-h3, .cm-md-h4, .cm-md-h5, .cm-md-h6 {
    font-weight: ${props => props.theme.typography.weights.bold};
  }
  .cm-md-h1 { font-size: ${props => props.theme.typography.sizes['2xl']}; }
  .cm-md-h2 { font-size: ${props => props.theme.typography.sizes.xl}; }
  .cm-md-h3 { font-size: ${props => props.theme.typography.sizes.lg}; }
  .cm-md-h4 { font-size: ${props => props.theme.typography.sizes.base}; }
  .cm-md-h5, .cm-md-h6 { font-size: ${props => props.theme.typography.sizes.sm}; }
  .cm-md-bullet { color: ${props => props.theme.colors.textSecondary}; }
  .cm-md-checkbox {
    margin: 0 0.4rem 0 0;
    vertical-align: middle;
    accent-color: ${props => props.theme.colors.primary};
    cursor: pointer;
  }
  .cm-md-hr {
    display: inline-block;
    width: 100%;
    vertical-align: middle;
    border-top: 1px solid ${props => props.theme.colors.border};
  }
  .cm-md-math { cursor: text; }
  .cm-md-math-display { text-align: center; padding: 0.5rem 0; overflow-x: auto; }
  .katex { font-size: 1.05em; color: ${props => props.theme.colors.text}; }
`;

const MathExample = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ExampleLabel = styled.div`
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InsertButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.radius.sm};
  font-size: ${props => props.theme.typography.sizes.sm};
  font-weight: ${props => props.theme.typography.weights.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-top: 0.5rem;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const basicSetup = {
  lineNumbers: false,
  foldGutter: false,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  syntaxHighlighting: false,
  autocompletion: false,
  closeBrackets: false,
  bracketMatching: false,
  highlightSelectionMatches: false,
  searchKeymap: false,
};

export default function MarkdownEditorField({ value, onChange, label, required = true }) {
  const { t } = useTranslation();
  const [showMathHelp, setShowMathHelp] = useState(false);
  const viewRef = useRef(null);
  const placeholder = t('cheatSheetForm.editor.placeholder');
  const extensions = useMemo(() => markdownLivePreview({ placeholder }), [placeholder]);

  // Toolbar actions run against the editor view so they land in undo history.
  const run = (command, ...args) => () => {
    if (viewRef.current) command(viewRef.current, ...args);
  };

  return (
    <FormGroup>
      <Label>{label ?? t('cheatSheetForm.editor.label')} {required && <span>*</span>}</Label>
      <MarkdownToolbar>
        <ToolbarButton type="button" onClick={run(toggleWrap, '**')} title={`${t('cheatSheetForm.editor.bold')} (⌘B)`}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton type="button" onClick={run(toggleWrap, '*')} title={`${t('cheatSheetForm.editor.italic')} (⌘I)`}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton type="button" onClick={run(toggleWrap, '~~')} title={`${t('cheatSheetForm.editor.strikethrough')} (⌘⇧X)`} style={{ textDecoration: 'line-through' }}>
          S
        </ToolbarButton>
        <ToolbarButton type="button" onClick={run(toggleWrap, '`')} title={`${t('cheatSheetForm.editor.inlineCode')} (⌘E)`}>
          &lt;/&gt;
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton type="button" onClick={run(prefixLines, '# ')} title={t('cheatSheetForm.editor.heading', { level: 1 })}>H1</ToolbarButton>
        <ToolbarButton type="button" onClick={run(prefixLines, '## ')} title={t('cheatSheetForm.editor.heading', { level: 2 })}>H2</ToolbarButton>
        <ToolbarButton type="button" onClick={run(prefixLines, '### ')} title={t('cheatSheetForm.editor.heading', { level: 3 })}>H3</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton type="button" onClick={run(prefixLines, '> ')} title={t('cheatSheetForm.editor.blockquote')}>❝</ToolbarButton>
        <ToolbarButton type="button" onClick={run(insertText, '\n---\n')} title={t('cheatSheetForm.editor.divider')}>—</ToolbarButton>
        <ToolbarButton type="button" onClick={run(toggleWrap, '```\n', '\n```')} title={t('cheatSheetForm.editor.codeBlock')}>{'{ }'}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton type="button" onClick={run(prefixLines, '- ')} title={t('cheatSheetForm.editor.bulletList')}>• {t('cheatSheetForm.editor.list')}</ToolbarButton>
        <ToolbarButton type="button" onClick={run(prefixLines, '1. ')} title={t('cheatSheetForm.editor.numberedList')}>1. {t('cheatSheetForm.editor.list')}</ToolbarButton>
        <ToolbarButton type="button" onClick={run(prefixLines, '- [ ] ')} title={t('cheatSheetForm.editor.taskList')}>☑ {t('cheatSheetForm.editor.task')}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton type="button" onClick={run(insertLink)} title={`${t('cheatSheetForm.editor.link')} (⌘K)`}>{t('cheatSheetForm.editor.link')}</ToolbarButton>
        <ToolbarButton type="button" onClick={() => setShowMathHelp(true)} title={t('cheatSheetForm.editor.latexMath')}>∑ {t('cheatSheetForm.editor.math')}</ToolbarButton>
      </MarkdownToolbar>

      <EditorFrame>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          basicSetup={basicSetup}
          theme="none"
          indentWithTab={false}
          onCreateEditor={(view) => { viewRef.current = view; }}
        />
      </EditorFrame>

      {showMathHelp && (
        <Modal onClose={() => setShowMathHelp(false)}>
          <h3>{t('cheatSheetForm.math.title')}</h3>
          <p>{t('cheatSheetForm.math.intro')}</p>

          <h4>{t('cheatSheetForm.math.inline')}</h4>
          <p>{t('cheatSheetForm.math.inlineHow')} <code>$...$</code></p>
          <MathExample>
            <ExampleLabel>{t('cheatSheetForm.math.syntax')}</ExampleLabel>
            <pre><code>The equation $E = mc^2$ is Einstein's famous formula.</code></pre>
            <ExampleLabel>{t('cheatSheetForm.math.result')}</ExampleLabel>
            <p>The equation $E = mc^2$ is Einstein's famous formula.</p>
            <InsertButton onClick={() => { toggleWrap(viewRef.current, '$'); setShowMathHelp(false); }}>
              {t('cheatSheetForm.math.insertInline')}
            </InsertButton>
          </MathExample>

          <h4>{t('cheatSheetForm.math.block')}</h4>
          <p>{t('cheatSheetForm.math.blockHow')} <code>$$...$$</code></p>
          <MathExample>
            <ExampleLabel>{t('cheatSheetForm.math.syntax')}</ExampleLabel>
            <pre><code>$$\int_{'{-\\infty}'}^{'{\\infty}'} e^{'{-x^2}'} dx = \sqrt{'{\\pi}'}$$</code></pre>
            <ExampleLabel>{t('cheatSheetForm.math.result')}</ExampleLabel>
            <div>$$\int_{'{-\\infty}'}^{'{\\infty}'} e^{'{-x^2}'} dx = \sqrt{'{\\pi}'}$$</div>
            <InsertButton onClick={() => { toggleWrap(viewRef.current, '$$\n', '\n$$'); setShowMathHelp(false); }}>
              {t('cheatSheetForm.math.insertBlock')}
            </InsertButton>
          </MathExample>

          <h4>{t('cheatSheetForm.math.examples')}</h4>

          <MathExample>
            <ExampleLabel>{t('cheatSheetForm.math.quadratic')}</ExampleLabel>
            <pre><code>$x = \frac{'{-b \\pm \\sqrt{b^2-4ac}}'}{'{2a}'}$</code></pre>
            <p>$x = \frac{'{-b \\pm \\sqrt{b^2-4ac}}'}{'{2a}'}$</p>
            <InsertButton onClick={() => { insertText(viewRef.current, '$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$'); setShowMathHelp(false); }}>
              {t('cheatSheetForm.math.insertExample')}
            </InsertButton>
          </MathExample>

          <MathExample>
            <ExampleLabel>{t('cheatSheetForm.math.summation')}</ExampleLabel>
            <pre><code>$\sum_{'{i=1}'}^{'{n}'} i = \frac{'{n(n+1)}'}{'{2}'}$</code></pre>
            <p>$\sum_{'{i=1}'}^{'{n}'} i = \frac{'{n(n+1)}'}{'{2}'}$</p>
            <InsertButton onClick={() => { insertText(viewRef.current, '$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$'); setShowMathHelp(false); }}>
              {t('cheatSheetForm.math.insertExample')}
            </InsertButton>
          </MathExample>

          <MathExample>
            <ExampleLabel>{t('cheatSheetForm.math.matrix')}</ExampleLabel>
            <pre><code>$$\begin{'{bmatrix}'} a & b \\ c & d \end{'{bmatrix}'}$$</code></pre>
            <div>$$\begin{'{bmatrix}'} a & b \\ c & d \end{'{bmatrix}'}$$</div>
            <InsertButton onClick={() => { insertText(viewRef.current, '$$\\begin{bmatrix}\na & b \\\\\nc & d\n\\end{bmatrix}$$'); setShowMathHelp(false); }}>
              {t('cheatSheetForm.math.insertExample')}
            </InsertButton>
          </MathExample>

        </Modal>
      )}
    </FormGroup>
  );
}
