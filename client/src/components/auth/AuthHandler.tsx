import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthObserver } from "../../utils/AuthObserver";
import { AlertType, useAlert } from "../../contexts/AlertContext";

function AuthHandler() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    const unsubscribe = getAuthObserver().onLogout(
      (message?: string, type?: AlertType) => {
        if (message) {
          if (!type) type = "error";
          showAlert(message, type);
        }

        navigate("/login");
      },
    );

    return () => {
      unsubscribe();
    };
  }, [navigate, showAlert]);

  return null;
}

export default AuthHandler;
