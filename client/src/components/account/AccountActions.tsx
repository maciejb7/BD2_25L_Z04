import { useState } from "react";
import {
  deleteAccount,
  logout,
  logoutFromAllDevices,
} from "../../api/api.auth";
import { getAuthObserver } from "../../utils/AuthObserver";
import ConfirmModal from "../auth/ConfirmModal";

function AccountActions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div>
      <ConfirmModal
        apiCall={deleteAccount}
        modalTitle={"Potwierdź usunięcie konta"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-4">
        <button
          className="flex flex-row items-center justify-center space-x-2 w-full bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          onClick={async () => {
            const response = await logout();
            getAuthObserver().emitLogout(response.message, "success");
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Wyloguj się</span>
        </button>
        <button
          className="flex flex-row items-center justify-center space-x-2 w-full bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200"
          onClick={async () => {
            const response = await logoutFromAllDevices();
            getAuthObserver().emitLogout(response.message, "success");
          }}
        >
          <i className="fas fa-sign-out-alt"></i>
          <span>Wyloguj się ze wszystkich urządzeń</span>
        </button>
        <button
          className="flex flex-row items-center justify-center space-x-2 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fas fa-user-slash"></i>
          <span>Usuń konto</span>
        </button>
      </div>
    </div>
  );
}

export default AccountActions;
