import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketQuantityPicker from './TicketQuantityPicker';

const MockedTicketQuantityPicker = (props: any) => (
  <ChakraProvider>
    <TicketQuantityPicker {...props} />
  </ChakraProvider>
);

describe('TicketQuantityPicker', () => {
  const defaultProps = {
    value: 1,
    max: 10,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial value', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    expect(input).toHaveValue(1);
  });

  it('displays correct button states', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const increaseButton = screen.getByLabelText('Increase quantity');
    
    expect(decreaseButton).not.toBeDisabled();
    expect(increaseButton).not.toBeDisabled();
  });

  it('increments value when plus button is clicked', async () => {
    const onChange = jest.fn();
    render(<MockedTicketQuantityPicker {...defaultProps} onChange={onChange} />);
    
    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);
    
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('decrements value when minus button is clicked', async () => {
    const onChange = jest.fn();
    render(<MockedTicketQuantityPicker {...defaultProps} value={2} onChange={onChange} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseButton);
    
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables decrement button when at minimum', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} value={0} min={0} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    expect(decreaseButton).toBeDisabled();
  });

  it('disables increment button when at maximum', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} value={10} max={10} />);
    
    const increaseButton = screen.getByLabelText('Increase quantity');
    expect(increaseButton).toBeDisabled();
  });

  it('handles manual input changes', async () => {
    const onChange = jest.fn();
    render(<MockedTicketQuantityPicker {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    fireEvent.change(input, { target: { value: '5' } });
    
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('rejects invalid input values', async () => {
    const onChange = jest.fn();
    render(<MockedTicketQuantityPicker {...defaultProps} onChange={onChange} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    
    // Test invalid negative value
    fireEvent.change(input, { target: { value: '-1' } });
    expect(onChange).not.toHaveBeenCalledWith(-1);
    
    // Test value exceeding maximum
    fireEvent.change(input, { target: { value: '15' } });
    expect(onChange).not.toHaveBeenCalledWith(15);
  });

  it('resets input to valid value on blur if invalid', async () => {
    render(<MockedTicketQuantityPicker {...defaultProps} value={5} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    
    // Enter invalid value
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(input).toHaveValue(5);
    });
  });

  it('shows sold out message when max is 0', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} max={0} />);
    
    expect(screen.getByText('Sold Out')).toBeInTheDocument();
  });

  it('is fully disabled when isDisabled prop is true', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} isDisabled={true} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    const increaseButton = screen.getByLabelText('Increase quantity');
    const input = screen.getByLabelText('Ticket quantity');
    
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).toBeDisabled();
    expect(input).toBeDisabled();
  });

  it('respects custom min value', () => {
    const onChange = jest.fn();
    render(<MockedTicketQuantityPicker {...defaultProps} value={2} min={2} onChange={onChange} />);
    
    const decreaseButton = screen.getByLabelText('Decrease quantity');
    expect(decreaseButton).toBeDisabled();
  });

  it('supports custom aria-label', () => {
    render(
      <MockedTicketQuantityPicker 
        {...defaultProps} 
        aria-label="VIP ticket quantity selector" 
      />
    );
    
    expect(screen.getByLabelText('VIP ticket quantity selector')).toBeInTheDocument();
  });

  it('updates input value when prop value changes', () => {
    const { rerender } = render(<MockedTicketQuantityPicker {...defaultProps} value={1} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    expect(input).toHaveValue(1);
    
    rerender(<MockedTicketQuantityPicker {...defaultProps} value={3} />);
    expect(input).toHaveValue(3);
  });

  it('has proper accessibility attributes', () => {
    render(<MockedTicketQuantityPicker {...defaultProps} />);
    
    const input = screen.getByLabelText('Ticket quantity');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '10');
    
    const group = screen.getByRole('group');
    expect(group).toHaveAttribute('aria-label', 'Quantity selector');
  });
});