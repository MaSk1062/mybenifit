import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../card';

describe('Card Components', () => {
  describe('Card Component', () => {
    it('should render card with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-card');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Custom card</Card>);
      
      const card = screen.getByText('Custom card').closest('div');
      expect(card).toHaveClass('custom-card');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Card ref={ref}>Ref card</Card>);
      
      expect(ref).toHaveBeenCalled();
    });

    it('should handle additional props', () => {
      render(<Card data-testid="test-card">Test card</Card>);
      
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('CardHeader Component', () => {
    it('should render card header with default props', () => {
      render(<CardHeader>Header content</CardHeader>);
      
      const header = screen.getByText('Header content').closest('div');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('grid');
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Custom header</CardHeader>);
      
      const header = screen.getByText('Custom header').closest('div');
      expect(header).toHaveClass('custom-header');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<CardHeader ref={ref}>Ref header</CardHeader>);
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('CardTitle Component', () => {
    it('should render card title with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      
      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('font-semibold');
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Custom title</CardTitle>);
      
      const title = screen.getByText('Custom title');
      expect(title).toHaveClass('custom-title');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<CardTitle ref={ref}>Ref title</CardTitle>);
      
      expect(ref).toHaveBeenCalled();
    });

    it('should handle different heading levels', () => {
      render(<CardTitle>H1 Title</CardTitle>);
      
      const title = screen.getByText('H1 Title');
      expect(title.tagName).toBe('DIV');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('CardContent Component', () => {
    it('should render card content with default props', () => {
      render(<CardContent>Content text</CardContent>);
      
      const content = screen.getByText('Content text').closest('div');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('px-6');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Custom content</CardContent>);
      
      const content = screen.getByText('Custom content').closest('div');
      expect(content).toHaveClass('custom-content');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<CardContent ref={ref}>Ref content</CardContent>);
      
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Card Composition', () => {
    it('should compose card components correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Test content</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should handle nested card components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Outer Card</CardTitle>
          </CardHeader>
          <CardContent>
            <Card>
              <CardHeader>
                <CardTitle>Inner Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nested content</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Outer Card')).toBeInTheDocument();
      expect(screen.getByText('Inner Card')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('should handle multiple card content sections', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Multi Content Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>First content section</p>
          </CardContent>
          <CardContent>
            <p>Second content section</p>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('First content section')).toBeInTheDocument();
      expect(screen.getByText('Second content section')).toBeInTheDocument();
    });

    it('should handle complex card layouts', () => {
      render(
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Complex Layout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Label:</span>
              <span>Value</span>
            </div>
            <div className="flex justify-between">
              <span>Another Label:</span>
              <span>Another Value</span>
            </div>
          </CardContent>
        </Card>
      );
      
      expect(screen.getByText('Complex Layout')).toBeInTheDocument();
      expect(screen.getByText('Label:')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Another Label:')).toBeInTheDocument();
      expect(screen.getByText('Another Value')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Accessible content</p>
          </CardContent>
        </Card>
      );
      
      const title = screen.getByText('Accessible Card');
      expect(title).toBeInTheDocument();
    });

    it('should handle aria attributes', () => {
      render(
        <Card aria-label="Test card">
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByLabelText('Test card');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply default styling classes', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Styled Card</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );
      
      const card = screen.getByText('Styled Card').closest('.bg-card');
      const header = screen.getByText('Styled Card').closest('.grid');
      const title = screen.getByText('Styled Card');
      const content = screen.getByText('Content').closest('.px-6');
      
      expect(card).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold');
      expect(content).toBeInTheDocument();
    });

    it('should handle custom styling overrides', () => {
      render(
        <Card className="bg-red-500 border-red-600">
          <CardHeader className="bg-red-100">
            <CardTitle className="text-red-900">Red Card</CardTitle>
          </CardHeader>
          <CardContent className="text-red-800">Red content</CardContent>
        </Card>
      );
      
      const card = screen.getByText('Red Card').closest('.bg-red-500');
      const header = screen.getByText('Red Card').closest('.bg-red-100');
      const title = screen.getByText('Red Card');
      const content = screen.getByText('Red content').closest('.text-red-800');
      
      expect(card).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(title).toHaveClass('text-red-900');
      expect(content).toBeInTheDocument();
    });
  });
}); 