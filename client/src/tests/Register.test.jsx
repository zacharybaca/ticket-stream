import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../components/Auth/Register/Register';

const mockFetcher = vi.fn();

vi.mock('../hooks/useFetcher.js', () => ({
  useFetcher: () => ({ fetcher: mockFetcher }),
}));

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    renderRegister();
    expect(
      screen.getByRole('heading', { name: 'Create Account' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument();
  });

  it('renders all required input fields', () => {
    renderRegister();
    const inputs = document.querySelectorAll('input');
    expect(inputs).toHaveLength(4); // name, username, email, password
  });

  it('renders a link to the login page', () => {
    renderRegister();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
