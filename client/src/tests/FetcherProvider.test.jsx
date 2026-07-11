import { describe, expect, it, beforeEach, afterAll, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { FetcherProvider } from '../contexts/Fetcher/FetcherProvider.jsx';
import { useFetcher } from '../hooks/useFetcher.js';

const mockFetch = vi.fn();

vi.stubGlobal('fetch', mockFetch);

afterAll(() => {
  vi.unstubAllGlobals();
});
const FetchProbe = ({ request }) => {
  const { fetcher } = useFetcher();

  useEffect(() => {
    fetcher(request.url, request.options);
  }, [fetcher, request]);

  return null;
};

describe('FetcherProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    window.sessionStorage.clear();
    document.cookie = 'csrfToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('reuses a csrf token returned in a prior response header for later unsafe requests', async () => {
    mockFetch
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers({ 'X-CSRF-Token': 'header-token' }),
        json: vi.fn().mockResolvedValue({}),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: vi.fn().mockResolvedValue({}),
      });

    const { rerender } = render(
      <FetcherProvider>
        <FetchProbe request={{ url: '/api/users/profile', options: {} }} />
      </FetcherProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    rerender(
      <FetcherProvider>
        <FetchProbe
          request={{
            url: '/api/incidents/123/status',
            options: { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) },
          }}
        />
      </FetcherProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/api/incidents/123/status',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'header-token',
        }),
      })
    );
  });

  it('clears the stored csrf token when the server clears the response header', async () => {
    window.sessionStorage.setItem('ticket-stream.csrf-token', 'stale-token');

    mockFetch.mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers({ 'X-CSRF-Token': '' }),
      json: vi.fn().mockResolvedValue({}),
    });

    render(
      <FetcherProvider>
        <FetchProbe request={{ url: '/api/auth/logout', options: { method: 'POST' } }} />
      </FetcherProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(window.sessionStorage.getItem('ticket-stream.csrf-token')).toBeNull();
  });
});
