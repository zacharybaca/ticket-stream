import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Pages/Home';

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: null }),
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe('Home', () => {
  it('renders the marketing content and auth calls to action', () => {
    renderHome();

    expect(
      screen.getByText(/incident management workspace for software teams/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create account/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /login/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /incident triage board/i })
    ).toBeInTheDocument();
  });
});
