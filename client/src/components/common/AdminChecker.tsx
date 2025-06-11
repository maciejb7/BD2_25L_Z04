import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useEffect } from "react";
import { isUserAdmin } from "../../utils/userAuthentication";

/**
 * AdminChecker is a component that checks if the user is an admin.
 */
function AdminChecker({ children }: { children: React.ReactNode }) {
  const { showAlert } = useAlert();
  const navigation = useNavigate();

  useEffect(() => {
    const checkIfAdmin = async () => {
      const isAdmin = await isUserAdmin();
      if (!isAdmin) {
        showAlert(
          "Nie posiadasz uprawnień, aby skorzystać z tej strony.",
          "error",
        );
        navigation("/");
      }
    };

    checkIfAdmin();
  });

  return <>{children}</>;
}

export default AdminChecker;
