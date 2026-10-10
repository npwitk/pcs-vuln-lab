import { EditorSelection, EditorState } from '@codemirror/state';
import { indentListItem, outdentListItem, prefixLines } from './markdownLivePreview';

// Just enough of an EditorView for the commands: state, dispatch, focus.
function editor(doc, anchor, head = anchor) {
  return {
    state: EditorState.create({ doc, selection: EditorSelection.single(anchor, head) }),
    dispatch(spec) { this.state = this.state.update(spec).state; },
    focus() {},
  };
}
const at = (doc, text) => doc.indexOf(text);

describe('list nesting', () => {
  it('nests a bullet under the one above, lined up with its text', () => {
    const doc = '- Types\n- System\n- Application';
    const view = editor(doc, at(doc, 'System'));
    expect(indentListItem(view)).toBe(true);
    expect(view.state.doc.toString()).toBe('- Types\n  - System\n- Application');
  });

  it('nests under a numbered item by its wider marker', () => {
    const doc = '1. SDLC\n2. Planning';
    const view = editor(doc, at(doc, 'Planning'));
    indentListItem(view);
    expect(view.state.doc.toString()).toBe('1. SDLC\n   2. Planning');
  });

  it('goes one level deeper under a nested sibling', () => {
    const doc = '- A\n  - B\n  - C';
    const view = editor(doc, at(doc, 'C'));
    indentListItem(view);
    expect(view.state.doc.toString()).toBe('- A\n  - B\n    - C');
  });

  it('keeps the first item in place but stays in the editor', () => {
    const view = editor('- Only', 3);
    expect(indentListItem(view)).toBe(true);
    expect(view.state.doc.toString()).toBe('- Only');
  });

  it('shifts a selected sub-list together, keeping its shape', () => {
    const doc = '- A\n- B\n  - C';
    const view = editor(doc, at(doc, 'B'), doc.length);
    indentListItem(view);
    expect(view.state.doc.toString()).toBe('- A\n  - B\n    - C');
  });

  it('Shift-Tab moves back out to the parent level', () => {
    const doc = '- A\n  - B\n    - C';
    const view = editor(doc, at(doc, 'C'));
    outdentListItem(view);
    expect(view.state.doc.toString()).toBe('- A\n  - B\n  - C');
    outdentListItem(view);
    expect(view.state.doc.toString()).toBe('- A\n  - B\n- C');
  });

  it('leaves Tab alone outside lists, so it still moves focus', () => {
    const view = editor('Just a paragraph', 4);
    expect(indentListItem(view)).toBe(false);
    expect(outdentListItem(view)).toBe(false);
  });

  it('toolbar list buttons keep a nested line\'s indentation', () => {
    const doc = '- A\n  - B';
    const view = editor(doc, at(doc, 'B'));
    prefixLines(view, '1. ');
    expect(view.state.doc.toString()).toBe('- A\n  1. B');
  });
});
