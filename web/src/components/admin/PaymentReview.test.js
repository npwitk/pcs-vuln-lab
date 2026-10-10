import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../styles/theme';
import { adminAPI } from '../../services/api';
import PaymentReview, { groupOrders } from './PaymentReview';

jest.mock('../../services/api', () => ({
  adminAPI: { approveBundle: jest.fn(), rejectBundle: jest.fn(), approvePayment: jest.fn(), rejectPayment: jest.fn() },
}));
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn() } }));

const row = (over) => ({
  user_name: 'Nina', user_email: 'nina@g.siit.tu.ac.th', user_avatar: null, purchase_date: new Date().toISOString(),
  is_stripe: false, discount_code: null, preview_image_path: null, ...over,
});
const ROWS = [
  row({ order_id: 1, bundle_order_id: 'B1', course_code: 'CSS452', cheatsheet_title: 'IoT Midterm', original_price: '58.50', payment_amount: '56.74' }),
  row({ order_id: 2, bundle_order_id: 'B1', course_code: 'CSS453', cheatsheet_title: 'Forensics', original_price: '58.50', payment_amount: '56.75' }),
  row({ order_id: 3, bundle_order_id: null, course_code: 'CSS484', cheatsheet_title: 'Ethical Hacking', original_price: '106.56', payment_amount: '106.56', is_stripe: true }),
];

const renderReview = (onChanged = jest.fn()) => {
  render(<ThemeProvider theme={lightTheme}><PaymentReview payments={ROWS} onChanged={onChanged} /></ThemeProvider>);
  return onChanged;
};

describe('groupOrders', () => {
  it('makes one order per bundle, with its full price, total and discount', () => {
    const [bundle, single] = groupOrders(ROWS);
    expect(bundle).toMatchObject({ bundleId: 'B1', orderId: null, isStripe: false });
    expect(bundle.items).toHaveLength(2);
    expect(bundle.full).toBeCloseTo(117);
    expect(bundle.total).toBeCloseTo(113.49);
    expect(bundle.discount).toBeCloseTo(3.51);
    expect(single).toMatchObject({ bundleId: null, orderId: 3, isStripe: true });
  });
});

describe('PaymentReview', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows orders that need a person first, one card per bundle', () => {
    renderReview();
    expect(screen.getByText(/1 order needs you/)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    const card = screen.getByRole('article');
    expect(within(card).getByText('IoT Midterm')).toBeInTheDocument();
    expect(within(card).getByText('Forensics')).toBeInTheDocument();
    expect(within(card).getByText('Bundle discount')).toBeInTheDocument();
  });

  it('approves a bundle as one order, after a second tap', async () => {
    adminAPI.approveBundle.mockResolvedValue({ data: {} });
    const onChanged = renderReview();
    const card = screen.getByRole('article');
    await userEvent.click(within(card).getByRole('button', { name: /Approve/ }));
    expect(adminAPI.approveBundle).not.toHaveBeenCalled();
    await userEvent.click(within(card).getByRole('button', { name: /Confirm ฿113.49/ }));
    expect(adminAPI.approveBundle).toHaveBeenCalledWith('B1');
    expect(adminAPI.approvePayment).not.toHaveBeenCalled();
    await waitFor(() => expect(onChanged).toHaveBeenCalled());
  });

  it('rejects a bundle with a reason', async () => {
    adminAPI.rejectBundle.mockResolvedValue({ data: {} });
    renderReview();
    const card = screen.getByRole('article');
    await userEvent.click(within(card).getByRole('button', { name: 'Reject' }));
    await userEvent.type(within(card).getByRole('textbox'), 'No transfer found');
    await userEvent.click(within(card).getByRole('button', { name: 'Reject order' }));
    expect(adminAPI.rejectBundle).toHaveBeenCalledWith('B1', 'No transfer found');
  });

  it('lists Stripe orders under their own filter', async () => {
    renderReview();
    await userEvent.click(screen.getByRole('radio', { name: /Stripe/ }));
    const card = screen.getByRole('article');
    expect(within(card).getByText('Auto-approves when paid')).toBeInTheDocument();
    expect(within(card).getByText('Ethical Hacking')).toBeInTheDocument();
  });
});
