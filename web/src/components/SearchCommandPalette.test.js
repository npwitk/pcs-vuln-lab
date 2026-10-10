import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import i18n from '../i18n';
import SearchCommandPalette from './SearchCommandPalette';

jest.mock('../services/api', () => ({
  coursesAPI: { suggest: jest.fn(() => Promise.resolve({ data: { courses: [] } })) },
}));
jest.mock('../context/InstitutionContext', () => ({ useInstitutions: () => ({ selectedInstitution: 1 }) }));
// The campaign hasn't started yet as this is written; pretend it's on.
jest.mock('../utils/birthday', () => ({
  ...jest.requireActual('../utils/birthday'),
  isBirthdayWindow: () => true,
}));

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname + location.search}</div>;
}

const renderPalette = () => render(
  <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={lightTheme}>
      <Routes><Route path="*" element={<><SearchCommandPalette isOpen onClose={() => {}} /><Where /></>} /></Routes>
    </ThemeProvider>
  </MemoryRouter>
);

// The palette focuses and selects its input 50 ms after opening; type after.
const settle = () => new Promise(r => setTimeout(r, 80));

describe('SearchCommandPalette birthday Easter egg', () => {
  beforeAll(() => i18n.changeLanguage('en'));

  it('opens the party for "Happy Birthday"', async () => {
    renderPalette();
    await settle();
    await userEvent.type(screen.getByRole('textbox'), 'Happy Birthday');
    expect(screen.getByRole('button', { name: /Celebrate/ })).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox'), '{enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/happy-birthday');
  });

  it('searches normally for anything else', async () => {
    renderPalette();
    await settle();
    await userEvent.type(screen.getByRole('textbox'), 'CSS221{enter}');
    expect(screen.getByTestId('where')).toHaveTextContent('/?q=CSS221');
  });
});
