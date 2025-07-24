import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  const user = userEvent.setup();

  it('should render input with default props', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex h-10 w-full rounded-md border');
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
  });

  it('should handle value changes', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} placeholder="Test input" />);
    
    const input = screen.getByPlaceholderText('Test input');
    await user.type(input, 'Hello World');
    
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('Hello World');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
  });

  it('should not accept input when disabled', async () => {
    const handleChange = vi.fn();
    render(<Input disabled onChange={handleChange} placeholder="Disabled" />);
    
    const input = screen.getByPlaceholderText('Disabled');
    await user.type(input, 'test');
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    
    expect(screen.getByPlaceholderText('Custom')).toHaveClass('custom-class');
  });

  it('should handle controlled input', () => {
    const handleChange = vi.fn();
    render(<Input value="Controlled value" onChange={handleChange} placeholder="Controlled" />);
    
    const input = screen.getByPlaceholderText('Controlled');
    expect(input).toHaveValue('Controlled value');
  });

  it('should handle focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        placeholder="Focus test" 
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  it('should handle keyboard events', async () => {
    const handleKeyDown = vi.fn();
    const handleKeyUp = vi.fn();
    
    render(
      <Input 
        onKeyDown={handleKeyDown} 
        onKeyUp={handleKeyUp} 
        placeholder="Keyboard test" 
      />
    );
    
    const input = screen.getByPlaceholderText('Keyboard test');
    
    await user.type(input, 'a');
    
    expect(handleKeyDown).toHaveBeenCalled();
    expect(handleKeyUp).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <Input 
        id="test-input"
        name="test"
        aria-label="Test input"
        placeholder="Accessibility test"
      />
    );
    
    const input = screen.getByLabelText('Test input');
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'test');
  });

  it('should handle required attribute', () => {
    render(<Input required placeholder="Required input" />);
    
    const input = screen.getByPlaceholderText('Required input');
    expect(input).toBeRequired();
  });

  it('should handle min and max attributes for number inputs', () => {
    render(
      <Input 
        type="number" 
        min="0" 
        max="100" 
        placeholder="Number range" 
      />
    );
    
    const input = screen.getByPlaceholderText('Number range');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  it('should handle step attribute for number inputs', () => {
    render(<Input type="number" step="0.1" placeholder="Step input" />);
    
    const input = screen.getByPlaceholderText('Step input');
    expect(input).toHaveAttribute('step', '0.1');
  });

  it('should handle pattern attribute', () => {
    render(<Input pattern="[A-Za-z]{3}" placeholder="Pattern input" />);
    
    const input = screen.getByPlaceholderText('Pattern input');
    expect(input).toHaveAttribute('pattern', '[A-Za-z]{3}');
  });

  it('should handle autocomplete attribute', () => {
    render(<Input autoComplete="email" placeholder="Email" />);
    
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} placeholder="Ref test" />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should handle form submission', async () => {
    const handleSubmit = vi.fn();
    render(
      <form onSubmit={handleSubmit}>
        <Input name="test" placeholder="Form input" />
        <button type="submit">Submit</button>
      </form>
    );
    
    const input = screen.getByPlaceholderText('Form input');
    await user.type(input, 'test value');
    
    await user.click(screen.getByRole('button'));
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('should handle placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('should handle readOnly attribute', () => {
    render(<Input readOnly placeholder="Read only" />);
    
    const input = screen.getByPlaceholderText('Read only');
    expect(input).toHaveAttribute('readonly');
  });

  it('should handle size attribute', () => {
    render(<Input size={20} placeholder="Size test" />);
    
    const input = screen.getByPlaceholderText('Size test');
    expect(input).toHaveAttribute('size', '20');
  });

  it('should handle multiple attributes together', () => {
    render(
      <Input 
        type="email"
        required
        disabled
        readOnly
        placeholder="Multiple attributes"
        className="test-class"
      />
    );
    
    const input = screen.getByPlaceholderText('Multiple attributes');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveClass('test-class');
  });
}); 