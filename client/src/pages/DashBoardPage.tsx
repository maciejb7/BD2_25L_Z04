import { useState } from "react";
import { deleteAccount, logout, logoutFromAllDevices } from "../api/api.auth";
import ConfirmForm from "../components/auth/ConfirmModal";
import { useAlert } from "../contexts/AlertContext";
import { getAuthObserver } from "../utils/AuthObserver";

function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showAlert } = useAlert();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <button
        onClick={async () => {
          const response = await logout();
          getAuthObserver().emitLogout(response.message, "success");
        }}
      >
        Wyloguj
      </button>
      <button
        onClick={async () => {
          try {
            await logoutFromAllDevices();
          } catch (error: any) {
            showAlert(error.message, "error");
          }
        }}
      >
        Wyloguj ze wszystkich urządzeń
      </button>
      <button onClick={() => setIsModalOpen(true)}>Usuń konto</button>

      <ConfirmForm
        apiCall={deleteAccount}
        modalTitle={"Potwierdź usunięcie konta"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default DashboardPage;
