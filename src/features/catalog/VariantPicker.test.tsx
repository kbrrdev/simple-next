import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VariantPicker } from './VariantPicker';

const variants = [
  { id: 's-red', option1Value: 'S', option2Value: 'Red', priceCents: 19900, stock: 3 },
  { id: 'm-red', option1Value: 'M', option2Value: 'Red', priceCents: 21900, stock: 0 },
  { id: 'm-blue', option1Value: 'M', option2Value: 'Blue', priceCents: 22900, stock: 2 },
];

describe('VariantPicker', () => {
  it('shows the chosen variant, and updates its price and stock', async () => {
    const user = userEvent.setup();
    render(<VariantPicker option1Name="Size" option2Name="Color" variants={variants} />);

    expect(screen.getByText('₱199.00')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'M' }));

    expect(screen.getByText('₱219.00')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Blue' }));

    expect(screen.getByText('₱229.00')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
  });

  it('highlights exactly the chosen values, even when one option moves the other', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <VariantPicker option1Name="Size" option2Name="Color" variants={variants} />,
    );
    const highlighted = () =>
      [...container.querySelectorAll('label[data-selected]')].map((label) => label.textContent);

    expect(highlighted()).toEqual(['S', 'Red']);

    await user.click(screen.getByRole('radio', { name: 'M' }));
    expect(highlighted()).toEqual(['M', 'Red']);

    await user.click(screen.getByRole('radio', { name: 'Blue' }));
    expect(highlighted()).toEqual(['M', 'Blue']);

    // S only comes in Red, so choosing it moves the color too.
    await user.click(screen.getByRole('radio', { name: 'S' }));
    expect(highlighted()).toEqual(['S', 'Red']);
    expect(screen.getByRole('radio', { name: 'Red' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Blue' })).not.toBeChecked();
  });

  it('shows only the price for products without options', () => {
    render(
      <VariantPicker
        option1Name={null}
        option2Name={null}
        variants={[
          { id: 'a', option1Value: null, option2Value: null, priceCents: 59900, stock: 0 },
        ]}
      />,
    );

    expect(screen.getByText('₱599.00')).toBeInTheDocument();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
