import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotificationService from '../../utils/notifications';

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNewNotification = () => {
      const allNotifications = NotificationService.getAll();
      setNotifications(allNotifications);
    };

    // We'll use a simple interval to check for new notifications
    // In a real app, you might want to use a more sophisticated approach
    const interval = setInterval(handleNewNotification, 100);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (notification) => {
    const toastOptions = {
      position: "top-right",
      autoClose: notification.duration,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast.warn(notification.message, toastOptions);
        break;
      case 'info':
        toast.info(notification.message, toastOptions);
        break;
      default:
        toast(notification.message, toastOptions);
    }
  };

  useEffect(() => {
    notifications.forEach(notification => {
      showNotification(notification);
    });
  }, [notifications]);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

export default NotificationProvider;