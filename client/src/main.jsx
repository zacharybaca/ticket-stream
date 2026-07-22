import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/react-router';
import { AppProvider } from './contexts/AppProvider.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'modern-normalize';
import './index.css';

import App from './App.jsx';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const appTree = (
  <BrowserRouter>
    <AppProvider>
      <App />
      <ToastContainer position="top-right" autoClose={4000} />
    </AppProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{appTree}</ClerkProvider>
    ) : (
      appTree
    )}
  </StrictMode>
);
