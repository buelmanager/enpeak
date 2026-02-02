import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Example Test Suite', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello, Vitest!</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument();
  });

  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify testing library is working', () => {
    const { container } = render(
      <button>Click me</button>
    );
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toBe('Click me');
  });
});
