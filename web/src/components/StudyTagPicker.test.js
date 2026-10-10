import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import StudyTagPicker from './StudyTagPicker';

jest.mock('../services/api', () => ({ studyTagsAPI: {} }));
let mockLanguage = 'en';
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: mockLanguage } }),
}));

// SIIT-style: CPE (1) with tracks Cyber (3) and AI (4); BA (2) on its own.
const TAGS = [
  { tag_id: 1, parent_id: null, name: 'Computer Engineering', name_th: 'วิศวกรรมคอมพิวเตอร์', short_name: 'CPE', children: [
    { tag_id: 3, parent_id: 1, name: 'Cyber Security', short_name: null, children: [] },
    { tag_id: 4, parent_id: 1, name: 'Artificial Intelligence', short_name: 'AI', children: [] },
  ] },
  { tag_id: 2, parent_id: null, name: 'Business Analytics', short_name: 'BA', children: [] },
];

const renderPicker = (value, onChange = jest.fn()) => {
  render(
    <ThemeProvider theme={lightTheme}>
      <StudyTagPicker tags={TAGS} value={value} onChange={onChange} />
    </ThemeProvider>
  );
  return onChange;
};

describe('StudyTagPicker', () => {
  afterEach(() => { mockLanguage = 'en'; });

  it('shows tracks only once their program is picked', () => {
    renderPicker([]);
    expect(screen.queryByRole('button', { name: /Cyber Security/ })).not.toBeInTheDocument();
  });

  it('reveals tracks under a picked program, and a track replaces the program', async () => {
    const onChange = renderPicker([1]);
    await userEvent.click(screen.getByRole('button', { name: /Cyber Security/ }));
    expect(onChange).toHaveBeenLastCalledWith([3]);
  });

  it('shows the program as picked through its track', () => {
    renderPicker([4]);
    expect(screen.getByRole('button', { name: /Computer Engineering/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Artificial Intelligence/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Cyber Security/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('un-picking the last track keeps the program; un-picking the program clears both', async () => {
    const onChange = renderPicker([4]);
    await userEvent.click(screen.getByRole('button', { name: /Artificial Intelligence/ }));
    expect(onChange).toHaveBeenLastCalledWith([1]);
    await userEvent.click(screen.getByRole('button', { name: /Computer Engineering/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('uses Thai names in Thai, falling back to English', () => {
    mockLanguage = 'th';
    renderPicker([1]);
    expect(screen.getByRole('button', { name: /วิศวกรรมคอมพิวเตอร์/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cyber Security/ })).toBeInTheDocument();
  });
});
