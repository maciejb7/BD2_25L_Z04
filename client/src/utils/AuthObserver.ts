import { AlertType } from "../contexts/AlertContext";

type LogoutCallback = (message?: string, type?: AlertType) => void;

/**
 * AuthObserver is a singleton class that allows components to subscribe to logout events.
 */
class AuthObserver {
  private logoutListeners: Set<LogoutCallback> = new Set();

  /**
   * Subscribes to logout events.
   * @param callback - The callback function to be called when a logout event occurs.
   * @returns A function to unsubscribe from the logout event.
   */
  onLogout(callback: LogoutCallback): () => void {
    this.logoutListeners.add(callback);

    return () => {
      this.logoutListeners.delete(callback);
    };
  }

  /**
   * Emits a logout event to all subscribed listeners.
   * @param message - Optional message to be passed to the listeners.
   * @param type - Optional type of alert to be passed to the listeners.
   */
  emitLogout(message?: string, type?: AlertType): void {
    this.logoutListeners.forEach((callback) => callback(message, type));
  }
}

// Singleton instance of AuthObserver
const authObserver = new AuthObserver();

export const getAuthObserver = (): AuthObserver => authObserver;
