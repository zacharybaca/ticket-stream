import { useEffect, useState } from 'react';
import { SocketContext } from './SocketContext.jsx';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

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
