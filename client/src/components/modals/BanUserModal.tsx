import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import FormField from "../inputs/FormField";
import { banUserAccount } from "../../api/api.admin";

interface BanUserModalProps {
  userId: string;
  isOpen: boolean;
  onBan: () => void;
  onClose: () => void;
}

/**
 * BanUserModal is a modal component that allows administrators to ban a user account.
 */
function BanUserModal({ userId, isOpen, onBan, onClose }: BanUserModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDialogClose = () => {
      onClose();
    };

    dialog.addEventListener("close", handleDialogClose);
    return () => {
      dialog.removeEventListener("close", handleDialogClose);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    setIsLoading(true);
    try {
      const reponse = await banUserAccount(userId, banReason);
      showAlert(reponse.message, "success");
      onBan();
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      setBanReason("");
      setIsLoading(false);
      dialog.close();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="p-6 rounded-lg shadow-md max-w-md w-full border-0 backdrop:bg-black backdrop:bg-opacity-50"
    >
      <div className="space-y-4">
        <div className="relative flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Nadaj Blokadę Konta
          </h1>
          <button
            type="button"
            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 z-10"
            onClick={() => {
              setBanReason("");
              dialogRef.current?.close();
            }}
          >
            ✕
          </button>
        </div>

        <FormField
          label="Powód Bana"
          name="reason"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Łamanie regulaminu serwisu..."
        />

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setBanReason("");
              dialogRef.current?.close();
            }}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {isLoading ? "Przetwarzanie..." : "Nadaj"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default BanUserModal;
