import { useState, useCallback, useMemo } from 'react';
import { FetcherContext } from './FetcherContext.jsx';

const CSRF_STORAGE_KEY = 'ticket-stream.csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

// Pure utility — defined once at module level to avoid recreation on every render.
const getCookieValue = (name) => {
  // Guard tests and any non-browser execution paths where cookies are unavailable.
  if (typeof document === 'undefined') {
    return '';
  }

  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : '';
};

const getStoredCsrfToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.sessionStorage.getItem(CSRF_STORAGE_KEY) || '';
  } catch {
    return '';
  }
};

const setStoredCsrfToken = (csrfToken) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (csrfToken) {
      window.sessionStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
      return;
    }

    window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
  } catch {
    // Ignore storage failures (e.g., disabled storage) so requests still succeed.
  }
};

// Use VITE_BACKEND_URL when set (e.g., cross-origin production deployment).
// Otherwise fall back to a relative URL so the Vite dev-proxy handles routing
// and avoids CORS entirely in development.
const backendUrl = import.meta.env.VITE_BACKEND_URL || '';

export const FetcherProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const fetcher = useCallback(async (
    url,
    options = {},
    fallbackError = 'An error occurred.'
  ) => {
    // 1. Construct final URL
    const finalUrl = url.startsWith('/') ? `${backendUrl}${url}` : url;

    // 2. SMART HEADERS: Check if we are sending a file (FormData)
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      // Keep the cookie fallback for same-origin/local setups where the readable
      // cookie is still the first CSRF source before any response header sync occurs.
      const csrfToken = getStoredCsrfToken() || getCookieValue('csrfToken');

      if (csrfToken) {
        headers[CSRF_HEADER_NAME] = csrfToken;
      }
    }

    // 3. Config (Ensuring credentials are sent for JWT cookies)
    const config = {
      credentials: 'include',
      ...options,
      headers,
    };

    try {
      let response = await fetch(finalUrl, config);
      const responseCsrfToken = response.headers.get(CSRF_HEADER_NAME);
      const isApiRequest =
        (backendUrl && finalUrl.startsWith(`${backendUrl}/api`)) ||
        (!backendUrl && finalUrl.startsWith('/api'));

      if (isApiRequest && responseCsrfToken !== null) {
        setStoredCsrfToken(responseCsrfToken);
      }

      // 1. Handle Rate Limiting (429)
      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        return {
          success: false,
          error: data?.message || 'Whoa, slow down! Please wait a moment.',
          status: 429,
        };
      }

      // 2. Handle Unauthorized (401)
      // Parse the body once; we return immediately, so it will never be read again.
      if (response.status === 401) {
        const data = await response.json().catch(() => null);
        return {
          success: false,
          error: data?.message || 'Unauthorized',
          status: 401,
        };
      }

      // 3. Parse JSON safely
      const data = await response.json().catch(() => ({}));

      // 4. Handle other errors (400, 404, 500)
      if (!response.ok || data.success === false) {
        const errorMessage = data?.message || fallbackError;
        return {
          success: false,
          error: errorMessage,
          status: response.status,
          data: data,
        };
      }

      // 5. Success
      return { success: true, data };
    } catch (err) {
      console.error('Fetcher error:', err);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        status: null,
      };
    } finally {
      setIsLoaded(true);
    }
  }, [setIsLoaded]);

  const contextValue = useMemo(
    () => ({ fetcher, isLoaded, setIsLoaded }),
    [fetcher, isLoaded]
  );

  return (
    <FetcherContext.Provider value={contextValue}>
      {children}
    </FetcherContext.Provider>
  );
};
