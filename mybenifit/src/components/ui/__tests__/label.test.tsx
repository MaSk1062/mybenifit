import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label Component', () => {
  it('should render label with default props', () => {
    render(<Label>Test Label</Label>);
    
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70');
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label">Custom Label</Label>);
    
    const label = screen.getByText('Custom Label');
    expect(label).toHaveClass('custom-label');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Label ref={ref}>Ref Label</Label>);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should handle htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Input Label</Label>);
    
    const label = screen.getByText('Input Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should handle additional props', () => {
    render(<Label data-testid="test-label">Test Label</Label>);
    
    const label = screen.getByTestId('test-label');
    expect(label).toBeInTheDocument();
  });

  it('should handle aria attributes', () => {
    render(<Label aria-label="Accessible label">Label</Label>);
    
    const label = screen.getByLabelText('Accessible label');
    expect(label).toBeInTheDocument();
  });

  it('should work with form controls', () => {
    render(
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input id="email" type="email" />
      </div>
    );
    
    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');
    
    expect(label).toHaveAttribute('for', 'email');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('should handle required indicator', () => {
    render(<Label>Required Field *</Label>);
    
    const label = screen.getByText('Required Field *');
    expect(label).toBeInTheDocument();
  });

  it('should handle long text', () => {
    const longText = 'This is a very long label text that should wrap properly and maintain readability across different screen sizes and viewports';
    render(<Label>{longText}</Label>);
    
    const label = screen.getByText(longText);
    expect(label).toBeInTheDocument();
  });

  it('should handle special characters', () => {
    render(<Label>Label with special chars: &lt;&gt;&amp;&quot;&#39;</Label>);
    
    const label = screen.getByText('Label with special chars: &lt;&gt;&amp;&quot;&#39;');
    expect(label).toBeInTheDocument();
  });

  it('should handle empty content', () => {
    render(<Label></Label>);
    
    const label = screen.getByRole('generic');
    expect(label).toBeInTheDocument();
  });

  it('should handle numeric content', () => {
    render(<Label>123</Label>);
    
    const label = screen.getByText('123');
    expect(label).toBeInTheDocument();
  });

  it('should handle multiple labels in a form', () => {
    render(
      <form>
        <Label htmlFor="name">Name</Label>
        <input id="name" type="text" />
        
        <Label htmlFor="email">Email</Label>
        <input id="email" type="email" />
        
        <Label htmlFor="password">Password</Label>
        <input id="password" type="password" />
      </form>
    );
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
  });

  it('should handle disabled state styling', () => {
    render(<Label className="peer-disabled:opacity-50">Disabled Label</Label>);
    
    const label = screen.getByText('Disabled Label');
    expect(label).toHaveClass('peer-disabled:opacity-50');
  });

  it('should handle focus state', () => {
    render(<Label className="focus-within:text-blue-600">Focus Label</Label>);
    
    const label = screen.getByText('Focus Label');
    expect(label).toHaveClass('focus-within:text-blue-600');
  });
}); 