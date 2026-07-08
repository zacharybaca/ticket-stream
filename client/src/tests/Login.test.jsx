import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Auth/Login/Login';

const mockFetcher = vi.fn();
const mockCheckUserAuth = vi.fn();

vi.mock('../hooks/useFetcher.js', () => ({
  useFetcher: () => ({ fetcher: mockFetcher }),
}));

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ checkUserAuth: mockCheckUserAuth }),
}));

const renderLogin = (initialEntries = ['/login']) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Login />
    </MemoryRouter>
  );

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckUserAuth.mockResolvedValue(undefined);
  });

  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(document.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(
      document.querySelector('input[type="password"]')
    ).toBeInTheDocument();
  });

  it('renders a link to forgot password', () => {
    renderLogin();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('calls fetcher with credentials on submit', async () => {
    mockFetcher.mockResolvedValue({ success: true, data: {} });
    renderLogin();

    fireEvent.change(document.querySelector('input[type="email"]'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(document.querySelector('input[type="password"]'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('user@example.com'),
        })
      );
    });
  });

  it('calls checkUserAuth after a successful login', async () => {
    mockFetcher.mockResolvedValue({ success: true, data: {} });
    renderLogin();

    fireEvent.change(document.querySelector('input[type="email"]'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(document.querySelector('input[type="password"]'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockCheckUserAuth).toHaveBeenCalledTimes(1);
    });
  });
});
