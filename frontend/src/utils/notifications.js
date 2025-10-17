// Notification utility for handling toast notifications
class NotificationService {
  static toastQueue = [];

  static show(message, type = 'info', duration = 5000) {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };

    this.toastQueue = [...this.toastQueue, notification];

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  static success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  static error(message, duration = 7000) {
    return this.show(message, 'error', duration);
  }

  static warning(message, duration = 6000) {
    return this.show(message, 'warning', duration);
  }

  static info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  static remove(id) {
    this.toastQueue = this.toastQueue.filter(notification => notification.id !== id);
  }

  static getAll() {
    return this.toastQueue;
  }

  static clearAll() {
    this.toastQueue = [];
  }
}

export default NotificationService;