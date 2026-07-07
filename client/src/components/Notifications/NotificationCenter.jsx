import { useCallback, useEffect, useState } from 'react';
import { useFetcher } from '../../hooks/useFetcher.js';
import { useSocket } from '../../hooks/useSocket.js';
import {
  acknowledgeAllNotifications,
  acknowledgeNotification,
  fetchNotifications,
} from '../../lib/notificationsApi.js';
import './notification-center.css';

const NotificationCenter = () => {
  const { fetcher } = useFetcher();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const response = await fetchNotifications(fetcher);
    if (response.success) {
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    }
    setLoading(false);
  }, [fetcher]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;

    const onNewNotification = () => {
      loadNotifications();
    };

    socket.on('notification:new', onNewNotification);
    return () => socket.off('notification:new', onNewNotification);
  }, [loadNotifications, socket]);

  const handleAcknowledge = async (notificationId) => {
    const response = await acknowledgeNotification(fetcher, notificationId, true);
    if (!response.success) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification._id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const handleAcknowledgeAll = async () => {
    const response = await acknowledgeAllNotifications(fetcher);
    if (!response.success) return;

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      }))
    );
    setUnreadCount(0);
  };

  return (
    <section className="notification-card">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button
          className="secondary-btn"
          onClick={handleAcknowledgeAll}
          disabled={unreadCount === 0}
        >
          Mark all read
        </button>
      </div>

      <p className="muted-text">Unread: {unreadCount}</p>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="muted-text">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li key={notification._id} className="notification-item">
              <div>
                <p className="entry-title">{notification.title}</p>
                <p className="entry-meta">{notification.message}</p>
              </div>
              {!notification.isRead && (
                <button
                  className="table-link-btn"
                  onClick={() => handleAcknowledge(notification._id)}
                >
                  Acknowledge
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default NotificationCenter;
