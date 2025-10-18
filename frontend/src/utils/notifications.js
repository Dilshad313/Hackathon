import { toast } from 'react-toastify';

// Notification utility for handling toast notifications
class NotificationService {
  static defaultOptions = {
    position: "top-right",
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  static success(message, duration = 3000) {
    return toast.success(message, {
      ...this.defaultOptions,
      autoClose: duration,
    });
  }

  static error(message, duration = 5000) {
    return toast.error(message, {
      ...this.defaultOptions,
      autoClose: duration,
    });
  }

  static warning(message, duration = 4000) {
    return toast.warn(message, {
      ...this.defaultOptions,
      autoClose: duration,
    });
  }

  static info(message, duration = 3000) {
    return toast.info(message, {
      ...this.defaultOptions,
      autoClose: duration,
    });
  }
}

export default NotificationService;