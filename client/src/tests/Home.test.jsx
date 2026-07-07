import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Pages/Home';

const { mockDownloadImplementationChecklist } = vi.hoisted(() => ({
  mockDownloadImplementationChecklist: vi.fn(),
}));

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../lib/implementationChecklist.js', () => ({
  implementationChecklistSections: [
    {
      title: 'Project foundation',
      description: 'Stand up the shared baseline before feature work starts.',
      tasks: ['Confirm product goals.'],
    },
    {
      title: 'Dashboard and triage experience',
      description: 'Give operators a fast view of active work and overall system state.',
      tasks: ['Create dashboard summary cards.'],
    },
  ],
  downloadImplementationChecklist: mockDownloadImplementationChecklist,
}));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the implementation checklist section', () => {
    renderHome();

    expect(
      screen.getByRole('heading', { name: /implementation checklist/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/project foundation/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dashboard and triage experience/i)
    ).toBeInTheDocument();
  });

  it('downloads the checklist when the action is clicked', async () => {
    mockDownloadImplementationChecklist.mockResolvedValue(
      'ticket-stream-implementation-checklist.docx'
    );

    renderHome();
    fireEvent.click(
      screen.getByRole('button', { name: /download word checklist/i })
    );

    await waitFor(() => {
      expect(mockDownloadImplementationChecklist).toHaveBeenCalledTimes(1);
    });
  });
});
