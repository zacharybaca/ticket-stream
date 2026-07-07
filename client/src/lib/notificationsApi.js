export const fetchNotifications = (fetcher, limit = 30) =>
  fetcher(`/api/notifications?limit=${limit}`);

export const acknowledgeNotification = (fetcher, notificationId, isRead = true) =>
  fetcher(`/api/notifications/${notificationId}/acknowledge`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead }),
  });

export const acknowledgeAllNotifications = (fetcher) =>
  fetcher('/api/notifications/acknowledge-all', {
    method: 'PATCH',
  });
