import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from './StarRating';

const stars = (container) => container.querySelectorAll('span > span:first-child');

describe('StarRating', () => {
  it('renders max stars and the numeric value', () => {
    const { container } = render(<StarRating value={3.5} max={5} showValue />);
    expect(stars(container)).toHaveLength(5);
    expect(screen.getByText('3.5 / 5')).toBeInTheDocument();
  });

  it('reports the clicked star, and toggles to a half star on a second click', async () => {
    const onChange = jest.fn();
    const { container, rerender } = render(<StarRating value={0} onChange={onChange} />);

    await userEvent.click(stars(container)[3].parentElement);
    expect(onChange).toHaveBeenLastCalledWith(4);

    rerender(<StarRating value={4} onChange={onChange} />);
    await userEvent.click(stars(container)[3].parentElement);
    expect(onChange).toHaveBeenLastCalledWith(3.5);
  });

  it('ignores clicks when disabled', async () => {
    const onChange = jest.fn();
    const { container } = render(<StarRating value={2} onChange={onChange} disabled />);
    await userEvent.click(stars(container)[0].parentElement);
    expect(onChange).not.toHaveBeenCalled();
  });
});
