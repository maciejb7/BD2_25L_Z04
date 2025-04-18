import { AlertType } from "../contexts/AlertContext";

type LogoutCallback = (message?: string, type?: AlertType) => void;

class AuthObserver {
  private logoutListeners: Set<LogoutCallback> = new Set();

  onLogout(callback: LogoutCallback): () => void {
    this.logoutListeners.add(callback);

    return () => {
      this.logoutListeners.delete(callback);
    };
  }

  emitLogout(message?: string, type?: AlertType): void {
    this.logoutListeners.forEach((callback) => callback(message, type));
  }
}

const authObserver = new AuthObserver();

export const getAuthObserver = (): AuthObserver => authObserver;
