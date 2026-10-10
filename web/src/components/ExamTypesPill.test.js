import React from 'react';
import { render, screen } from '@testing-library/react';
import ExamTypesPill from './ExamTypesPill';

// jsdom has no layout, so fake it: text is 7px per character, the pill adds
// 20px of padding, and the row is `rowWidth` wide with an 8px gap.
let rowWidth;
const originals = {};
beforeAll(() => {
  originals.offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  originals.clientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
  originals.rect = Element.prototype.getBoundingClientRect;
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      const text = this.querySelector?.('[data-label]')?.textContent ?? this.textContent;
      return text.length * 7 + (this.dataset.pill ? 20 : 0);
    },
  });
  Object.defineProperty(Element.prototype, 'clientWidth', {
    configurable: true,
    get() { return this.dataset.row ? rowWidth : 0; },
  });
  Element.prototype.getBoundingClientRect = function rect() {
    return { width: this.textContent.length * 7 + 20 };
  };
});
afterAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originals.offsetWidth);
  Object.defineProperty(Element.prototype, 'clientWidth', originals.clientWidth);
  Element.prototype.getBoundingClientRect = originals.rect;
});

const Pill = React.forwardRef((props, ref) => <span ref={ref} data-pill="1" {...props} />);

const renderRow = (width, examTypes = ['Midterm', 'Final']) => {
  rowWidth = width;
  render(
    <div data-row="1" style={{ columnGap: '8px' }}>
      <span>CSS221</span>
      <ExamTypesPill sheet={{ exam_types: examTypes }} pill={Pill} />
    </div>
  );
};

// "CSS221" takes 6*7+20 = 62px + 8px gap; "Midterm + Final" needs 15*7+20 = 125px.
describe('ExamTypesPill', () => {
  it('shows the full label when it fits', () => {
    renderRow(200);
    expect(screen.getByText('Midterm + Final', { selector: '[data-label]' })).toBeInTheDocument();
  });

  it('shortens to "Mid + Final" when it does not, keeping the full label as a tooltip', () => {
    renderRow(150);
    const label = screen.getByText('Mid + Final', { selector: '[data-label]' });
    expect(label.parentElement).toHaveAttribute('title', 'Midterm + Final');
  });

  it('leaves a single exam type alone', () => {
    renderRow(50, ['Midterm']);
    expect(screen.getByText('Midterm')).toBeInTheDocument();
  });
});
