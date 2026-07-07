import { FetcherProvider } from './Fetcher/FetcherProvider';
import { AuthProvider } from './Auth/AuthProvider';
import { SocketProvider } from './Socket/SocketProvider';

export const AppProvider = ({ children }) => {
  return (
    <FetcherProvider>
      <AuthProvider>
        <SocketProvider>{children}</SocketProvider>
      </AuthProvider>
    </FetcherProvider>
  );
};
