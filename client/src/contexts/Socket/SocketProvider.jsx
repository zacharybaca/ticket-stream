import { useEffect, useState } from 'react';
import { SocketContext } from './SocketContext.jsx';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth.js';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const newSocket = io(backendUrl, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_user_room', user._id);
      if (user.isAdmin || user.role === 'admin') {
        newSocket.emit('join_admin_room');
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
