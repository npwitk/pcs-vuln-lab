import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import Breadcrumbs from './Breadcrumb';

const renderTrail = (items, props = {}) => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={lightTheme}>
      <Breadcrumbs items={items} {...props} />
    </ThemeProvider>
  </MemoryRouter>
);

describe('Breadcrumbs', () => {
  it('links every step but the last, which is the current page', () => {
    renderTrail([{ label: 'Admin', to: '/admin' }, { label: 'Study Tags' }]);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Study Tags')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Study Tags' })).not.toBeInTheDocument();
  });

  it('folds the middle of a long trail into "…", which expands on click', async () => {
    renderTrail([
      { label: 'Home', to: '/' },
      { label: 'Faculty', to: '/f' },
      { label: 'Program', to: '/p' },
      { label: 'Course', to: '/c' },
      { label: 'Sheet' },
    ]);
    expect(screen.queryByRole('link', { name: 'Faculty' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Course' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Show full path' }));
    expect(screen.getByRole('link', { name: 'Faculty' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Program' })).toBeInTheDocument();
  });
});
