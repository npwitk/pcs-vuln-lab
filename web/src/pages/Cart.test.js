import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { lightTheme } from '../styles/theme';
import i18n from '../i18n';
import { cartAPI, paymentsAPI } from '../services/api';
import Cart from './Cart';

jest.mock('../services/api', () => ({
  cartAPI: { getCart: jest.fn(), removeFromCart: jest.fn(), addToCart: jest.fn(), checkout: jest.fn() },
  paymentsAPI: { createBundlePayment: jest.fn() },
  discountCodesAPI: { validate: jest.fn() },
}));
// Not under test: mascots (a blobatar sub-path Jest 27 can't resolve) and
// the app ThemeContext spinner.
jest.mock('../components/EmptyState', () => {
  const EmptyState = ({ title }) => <div>{title}</div>;
  EmptyState.EmptyStateButton = 'button';
  return { __esModule: true, default: EmptyState, EmptyStateButton: 'button' };
});
jest.mock('../components/LoadingSpinner', () => () => <div>Loading</div>);
jest.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: true }) }));
jest.mock('../context/CartContext', () => ({ useCart: () => ({ refreshCartCount: jest.fn() }) }));
let mockEndedOrder = null;
const mockClearEndedOrder = jest.fn(() => { mockEndedOrder = null; });
jest.mock('../context/PaymentWatchContext', () => ({
  usePaymentWatch: () => ({
    paidOrder: null, startWatching: jest.fn(), acknowledgePaid: jest.fn(), registerActiveLocalOrder: jest.fn(),
    endedOrder: mockEndedOrder, clearEndedOrder: mockClearEndedOrder,
  }),
}));

const ITEMS = [
  { cart_id: 1, cheatsheet_id: 11, course_code: 'CSS221', title: 'Data Structures', price: '120.00', preview_image_path: null },
  { cart_id: 2, cheatsheet_id: 12, course_code: 'MAS116', title: 'Calculus I', price: '150.00', preview_image_path: null },
];
const summaryFor = (items) => ({
  item_count: items.length,
  subtotal: items.reduce((s, i) => s + parseFloat(i.price), 0).toFixed(2),
  total: items.reduce((s, i) => s + parseFloat(i.price), 0).toFixed(2),
  is_bundle: false, discount_amount: 0, max_discount_percentage: 0,
});
const cartResponse = (items) => ({ data: { cart_items: items, summary: summaryFor(items) } });

// The amount beside "Total" (the subtotal can show the same figure).
const totalText = () => screen.getByText('Total').nextSibling.textContent;

const tree = () => (
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider theme={lightTheme}>
      <Cart />
      <Toaster />
    </ThemeProvider>
  </MemoryRouter>
);
const renderCart = () => render(tree());

describe('Cart', () => {
  beforeAll(() => {
    i18n.changeLanguage('en');
    // jsdom has neither; the page scrolls to top and react-hot-toast asks
    // about reduced motion.
    window.scrollTo = jest.fn();
    window.matchMedia = window.matchMedia || ((query) => ({
      matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn(),
      addListener: jest.fn(), removeListener: jest.fn(),
    }));
  });
  beforeEach(() => {
    jest.clearAllMocks();
    cartAPI.getCart.mockResolvedValue(cartResponse(ITEMS));
  });

  it('removes an item in place, updates the total, and can undo', async () => {
    renderCart();
    await screen.findByText('Data Structures');
    expect(totalText()).toBe('฿270');

    cartAPI.removeFromCart.mockResolvedValue({});
    cartAPI.getCart.mockResolvedValue(cartResponse([ITEMS[1]]));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Data Structures' }));

    await waitFor(() => expect(screen.queryByText('Data Structures')).not.toBeInTheDocument());
    expect(cartAPI.removeFromCart).toHaveBeenCalledWith(1);
    await waitFor(() => expect(totalText()).toBe('฿150'));

    cartAPI.addToCart.mockResolvedValue({});
    cartAPI.getCart.mockResolvedValue(cartResponse(ITEMS));
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(cartAPI.addToCart).toHaveBeenCalledWith(11);
    expect(await screen.findByText('Data Structures')).toBeInTheDocument();
  });

  it('brings an item back if removing it fails', async () => {
    renderCart();
    await screen.findByText('Data Structures');
    cartAPI.removeFromCart.mockRejectedValue(new Error('offline'));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Data Structures' }));
    expect(await screen.findByText('Failed to remove item')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Data Structures')).toBeVisible());
  });

  it('shows checkout progress, then the QR with the amount', async () => {
    let finishPayment;
    cartAPI.checkout.mockResolvedValue({ data: { bundle_order_id: 'B1', total_amount: '270.00', fully_covered: false } });
    paymentsAPI.createBundlePayment.mockReturnValue(new Promise(resolve => { finishPayment = resolve; }));

    renderCart();
    await screen.findByText('Data Structures');
    await userEvent.click(screen.getByRole('button', { name: 'Proceed to Checkout' }));

    // The sheets drop into the cart while the order, then the QR, is made.
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('status')).toHaveTextContent('Preparing your PromptPay QR'));

    finishPayment({ data: { bundle: { qr_code: 'data:image/png;base64,QR' } } });
    // Then the receipt: items, total and the QR (after the scene finishes).
    expect(await within(dialog).findByText('Scan to Pay', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(within(dialog).getByText(/CSS221 Data Structures/)).toBeInTheDocument();
    expect(within(dialog).getByText('฿270.00')).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'PromptPay QR code' })).toHaveAttribute('src', 'data:image/png;base64,QR');
    expect(within(dialog).getByRole('status')).toHaveTextContent('Waiting for your payment');
  });

  it('shows the order as expired, with the sheets back in the cart, when its QR expires', async () => {
    cartAPI.checkout.mockResolvedValue({ data: { bundle_order_id: 'B1', total_amount: '270.00', fully_covered: false } });
    paymentsAPI.createBundlePayment.mockResolvedValueOnce({ data: { bundle: { qr_code: 'data:image/png;base64,OLD' } } });

    const { rerender } = renderCart();
    await screen.findByText('Data Structures');
    await userEvent.click(screen.getByRole('button', { name: 'Proceed to Checkout' }));
    const dialog = await screen.findByRole('dialog');
    await within(dialog).findByRole('img', { name: 'PromptPay QR code' }, { timeout: 3000 });
    const cartLoads = cartAPI.getCart.mock.calls.length;

    // The watcher reports the bundle closed because its QR expired.
    // CRA's resetMocks wipes implementations before each test, so set it here.
    mockClearEndedOrder.mockImplementation(() => { mockEndedOrder = null; });
    mockEndedOrder = { type: 'bundle', id: 'B1', reason: 'expired' };
    rerender(tree());

    expect(await within(dialog).findByText('QR expired')).toBeInTheDocument();
    expect(within(dialog).getByText('EXPIRED')).toBeInTheDocument();
    expect(within(dialog).getByRole('status')).toHaveTextContent('Nothing was charged');
    expect(within(dialog).queryByRole('button', { name: /pay later/i })).not.toBeInTheDocument();
    expect(mockClearEndedOrder).toHaveBeenCalled();
    // No new QR is fetched; the cart behind it reloads with the sheets back.
    expect(paymentsAPI.createBundlePayment).toHaveBeenCalledTimes(1);
    expect(cartAPI.getCart.mock.calls.length).toBeGreaterThan(cartLoads);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Back to cart' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
