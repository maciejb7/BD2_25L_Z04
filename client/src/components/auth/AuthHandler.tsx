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
    // Register to listen for logout events
    const unsubscribe = getAuthObserver().onLogout(
      (message?: string, type?: AlertType) => {
        // Show an alert and go to the login page
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        navigate("/login");
      },
    );

    // Cleanup function to unsubscribe from the logout event
    return () => {
      unsubscribe();
    };
  }, [navigate, showAlert]);

  return null;
}

export default AuthHandler;
