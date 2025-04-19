import { logout } from "../api/api.auth";
import { useAlert } from "../contexts/AlertContext";
import { getAuthObserver } from "../utils/AuthObserver";

function DashboardPage() {
  const { showAlert } = useAlert();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <button
        onClick={async () => {
          try {
            const response = await logout();
            getAuthObserver().emitLogout(response.message, "success");
          } catch (error: any) {
            showAlert(error.message, "error");
          }
        }}
      >
        Wyloguj
      </button>
    </div>
  );
}

export default DashboardPage;
