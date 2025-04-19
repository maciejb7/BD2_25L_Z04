import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthObserver } from "../../utils/AuthObserver";
import { AlertType, useAlert } from "../../contexts/AlertContext";

/**
 * AuthHandler component listens for authentication events and handles logout.
 * @returns null
 */
function AuthHandler() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
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

    // Register to listen for logout events
    const logoutUnsubscribe = getAuthObserver().onLogout(
      (message?: string, type?: AlertType) => {
        // Show an alert and go to the login page
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        setTimeout(() => {
          navigate("/login");
        }, 0);
      },
    );

    return () => {
      loginUnsubscribe();
      logoutUnsubscribe();
    };
  }, [navigate, showAlert]);

  return null;
}

export default AuthHandler;
