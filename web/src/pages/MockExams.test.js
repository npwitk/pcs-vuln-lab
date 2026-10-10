import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import i18n from '../i18n';
import { mockExamsAPI } from '../services/api';
import MockExams, { parseFileLabel } from './MockExams';

jest.mock('../services/api', () => ({
  mockExamsAPI: { getPublic: jest.fn(), unlock: jest.fn() },
  analyticsAPI: { track: jest.fn(() => Promise.resolve()) },
}));
// Its mascots import a blobatar sub-path Jest 27 can't resolve; not under test.
jest.mock('../components/EmptyState', () => ({ title }) => <div>{title}</div>);
// Reads the app's own ThemeContext; not under test.
jest.mock('../components/LoadingSpinner', () => () => <div>Loading</div>);
jest.mock('../context/InstitutionContext', () => ({
  useInstitutions: () => ({
    selectedInstitution: 1,
    selectedInstitutionData: { institution_id: 1, short_name: 'SIIT' },
  }),
}));

const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const EXAMS = [
  {
    exam_id: 1, course_code: 'CSS221', course_name: 'Data Structures', exam_type: 'Midterm',
    year_display: '2nd Year', semester: '1st Semester', accuracy: 3, exam_date: null,
    institution_short_name: 'SIIT', is_locked: false, has_password: false,
    files: [
      { file_id: 10, kind: 'question', label: null, url: 'https://x/q.pdf' },
      { file_id: 11, kind: 'answer', label: null, url: 'https://x/a.pdf' },
    ],
  },
  {
    exam_id: 2, course_code: 'CSS326', course_name: 'Database Lab', exam_type: 'Final',
    year_display: '3rd Year', semester: '2nd Semester', accuracy: 2, exam_date: future,
    institution_short_name: 'SIIT', is_locked: true, has_password: true, files: null,
  },
];

const renderPage = () => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={lightTheme}>
      <MockExams />
    </ThemeProvider>
  </MemoryRouter>
);

describe('MockExams', () => {
  beforeAll(() => i18n.changeLanguage('en'));
  beforeEach(() => mockExamsAPI.getPublic.mockResolvedValue({ data: { exams: EXAMS } }));

  it("loads the selected institution's set, grouped by year and semester, newest first", async () => {
    renderPage();
    expect(await screen.findByText('Data Structures')).toBeInTheDocument();
    expect(mockExamsAPI.getPublic).toHaveBeenCalledWith(1);
    // Each heading is "<year> · <semester>" followed by its count badge.
    const headings = screen.getAllByRole('heading', { level: 2 }).map(h => h.firstChild.textContent);
    expect(headings.slice(0, 2)).toEqual(['Year 3 · Semester 2', 'Year 2 · Semester 1']);
  });

  it('shows question and answer buttons for open exams, and the opening date for locked ones', async () => {
    renderPage();
    const open = (await screen.findByText('Data Structures')).closest('article');
    expect(within(open).getByRole('link', { name: /Questions/ })).toHaveAttribute('href', 'https://x/q.pdf');
    expect(within(open).getByRole('link', { name: /Answer key/ })).toHaveAttribute('href', 'https://x/a.pdf');

    const locked = screen.getByText('Database Lab').closest('article');
    expect(within(locked).getByText(/Opens/)).toBeInTheDocument();
    expect(within(locked).getByRole('button', { name: 'Have a password?' })).toBeInTheDocument();
  });

  it('shows files for an exam whose accuracy is not rated yet (-1)', async () => {
    mockExamsAPI.getPublic.mockResolvedValue({ data: { exams: [{
      ...EXAMS[0], exam_id: 3, course_code: 'CSS452', course_name: 'Internet of Things', year_display: '4th Year', accuracy: -1,
    }] } });
    renderPage();
    const card = (await screen.findByText('Internet of Things')).closest('article');
    expect(within(card).getByRole('link', { name: /Questions/ })).toBeInTheDocument();
    expect(within(card).queryByText('Coming soon')).not.toBeInTheDocument();
    expect(within(card).queryByText('Accuracy')).not.toBeInTheDocument();
  });

  it('keeps the drawn title readable as "Mock Exams"', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { level: 1, name: 'Mock Exams' })).toBeInTheDocument();
  });

  it('groups labelled files by set, as rows with their format', async () => {
    const file = (id, label) => ({ file_id: id, kind: 'question', label, url: `https://x/${id}` });
    mockExamsAPI.getPublic.mockResolvedValue({ data: { exams: [{
      ...EXAMS[0], exam_id: 4, course_name: 'Computer Graphics Lab',
      files: [
        file(1, 'Set 1 - Solution (NB)'), file(2, 'Set 1 - Problem (PDF)'),
        file(3, 'Set 2 - Solution (NB)'), file(4, 'Set 2 - Problem (PDF)'), file(5, 'Set 1 - Model (STL)'),
      ],
    }] } });
    renderPage();
    const card = (await screen.findByText('Computer Graphics Lab')).closest('article');
    const text = card.textContent;
    // Set 1 (with the model) comes before Set 2, each file once.
    expect(text.indexOf('Set 1')).toBeLessThan(text.indexOf('Set 2'));
    expect(within(card).getAllByRole('link')).toHaveLength(5);
    expect(within(card).getAllByRole('link', { name: /Solution\s*NB/ })).toHaveLength(2);
    expect(within(card).getByRole('link', { name: /Model\s*STL/ })).toHaveAttribute('href', 'https://x/5');
  });

  it('filters by year and search', async () => {
    renderPage();
    await screen.findByText('Data Structures');
    await userEvent.click(screen.getByRole('radio', { name: 'Year 3' }));
    expect(screen.queryByText('Data Structures')).not.toBeInTheDocument();
    expect(screen.getByText('Database Lab')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'All years' }));
    await userEvent.type(screen.getByRole('searchbox'), 'css221');
    expect(screen.getByText('Data Structures')).toBeInTheDocument();
    expect(screen.queryByText('Database Lab')).not.toBeInTheDocument();
  });
});

describe('parseFileLabel', () => {
  it.each([
    ['Set 1 - Solution (NB)', { set: '1', name: 'Solution', format: 'NB' }],
    ['Set 2 – Problem (pdf)', { set: '2', name: 'Problem', format: 'PDF' }],
    ['Set A', { set: 'A', name: null, format: null }],
    ['Answer Key', { set: null, name: 'Answer Key', format: null }],
    [null, { set: null, name: null, format: null }],
  ])('%p', (label, expected) => {
    expect(parseFileLabel(label)).toEqual(expected);
  });
});
