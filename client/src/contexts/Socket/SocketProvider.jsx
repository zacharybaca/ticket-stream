import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketContext.jsx';
import { io } from 'socket.io-client';
import { AuthContext } from '../Auth/AuthContext.jsx';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const authContext = useContext(AuthContext);
  const hasAuthContext = authContext != null;
  const user = hasAuthContext ? authContext.user : null;

  useEffect(() => {
    if (!hasAuthContext) {
      console.warn(
        'SocketProvider requires AuthProvider context. Ensure SocketProvider is wrapped by AuthProvider in the component tree.'
      );
    }
  }, [hasAuthContext]);

  useEffect(() => {
    if (!user) return;

    // Initialize connection
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
    });

    // Authenticate/Join targeted room
    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user._id);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
