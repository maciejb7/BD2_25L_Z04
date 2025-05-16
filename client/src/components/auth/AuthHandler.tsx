import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthObserver } from "../../utils/AuthObserver";
import { AlertType, useAlert } from "../../contexts/AlertContext";

/**
 * AuthHandler component listens for authentication events and navigates the user accordingly.
 */
function AuthHandler() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    // Show an alert and navigate to dashboard on successful login.
    const loginUnsubscribe = getAuthObserver().onLogin(
      (message?: string, type?: AlertType) => {
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        setTimeout(() => {
          navigate("/");
        }, 0);
      },
    );

    // Show an alert and navigate to login on successful logout.
    const logoutUnsubscribe = getAuthObserver().onLogout(
      (message?: string, type?: AlertType) => {
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        setTimeout(() => {
          navigate("/login");
        }, 0);
      },
    );

    const timeoutUnsubscribe = getAuthObserver().onTimeout(
      (message?: string, type?: AlertType) => {
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        setTimeout(() => {
          navigate("/");
        }, 0);
      },
    );

    return () => {
      loginUnsubscribe();
      logoutUnsubscribe();
      timeoutUnsubscribe();
    };
  }, [navigate, showAlert]);

  return null;
}

export default AuthHandler;
