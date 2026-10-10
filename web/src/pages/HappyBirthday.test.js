import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../styles/theme';
import i18n from '../i18n';
import { birthdayAPI } from '../services/api';
import HappyBirthday from './HappyBirthday';

jest.mock('../services/api', () => ({ birthdayAPI: { status: jest.fn(), claim: jest.fn() } }));
// Canvas isn't available in jsdom; the confetti isn't under test.
jest.mock('../components/Confetti', () => {
  const R = require('react');
  return R.forwardRef(() => null);
});
const mockLogin = jest.fn();
let mockAuthed = true;
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: mockAuthed, loading: false, login: mockLogin }),
}));

const GIFT = { percentage: 10, max_discount: 100, valid_until: '2026-12-31T16:59:59.000Z' };
const status = (over) => ({ data: { live: true, gift: GIFT, signed_in: mockAuthed, claim: null, ...over } });

const renderPage = () => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={lightTheme}><HappyBirthday /></ThemeProvider>
  </MemoryRouter>
);

describe('HappyBirthday', () => {
  beforeAll(() => i18n.changeLanguage('en'));
  beforeEach(() => { mockAuthed = true; sessionStorage.clear(); });

  it('opens the gift into the code, and says it was emailed', async () => {
    birthdayAPI.status.mockResolvedValue(status());
    birthdayAPI.claim.mockResolvedValue({ data: { code: 'HBD1-7K3QXP', valid_until: GIFT.valid_until, emailed: true } });
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /Open your gift/ }));
    expect(await screen.findByLabelText('HBD1-7K3QXP', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByText(/emailed it to you too/)).toBeInTheDocument();
    expect(screen.getByText(/10% off your cart, up to ฿100 · one use · until 31 Dec 2026/)).toBeInTheDocument();
  });

  it('shows a code already claimed straight away', async () => {
    birthdayAPI.status.mockResolvedValue(status({ claim: { code: 'HBD1-ABCDEF', valid_until: GIFT.valid_until } }));
    renderPage();
    expect(await screen.findByLabelText('HBD1-ABCDEF')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open your gift/ })).not.toBeInTheDocument();
  });

  it('asks a signed-out visitor to sign in, and comes back here after', async () => {
    mockAuthed = false;
    birthdayAPI.status.mockResolvedValue(status());
    renderPage();
    await userEvent.click(await screen.findByRole('button', { name: /Sign in to claim/ }));
    expect(mockLogin).toHaveBeenCalled();
    expect(sessionStorage.getItem('postLoginPath')).toBe('/happy-birthday');
    expect(birthdayAPI.claim).not.toHaveBeenCalled();
  });

  it('says the party is over once it is', async () => {
    birthdayAPI.status.mockResolvedValue(status({ live: false }));
    renderPage();
    expect(await screen.findByText(/That party's over/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open your gift/ })).not.toBeInTheDocument();
  });
});
