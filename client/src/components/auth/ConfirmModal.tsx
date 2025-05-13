import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { ConfirmFormData } from "../../api/api.auth";

interface ConfirmModalDataProps {
  apiCall: (data: ConfirmFormData) => Promise<any>;
  modalTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

function ConfirmModal({
  apiCall,
  modalTitle,
  isOpen,
  onClose,
}: ConfirmModalDataProps) {
  const [confirmFormData, setConfirmFormData] = useState<ConfirmFormData>({
    nicknameOrEmail: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { showAlert } = useAlert();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfirmFormData(
      (prev) => ({ ...prev, [name]: value }) as ConfirmFormData,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiCall(confirmFormData);
    } catch (error: any) {
      setConfirmFormData({ nicknameOrEmail: "", password: "" });
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="p-6 rounded-lg shadow-md max-w-md w-full border-0 backdrop:bg-black backdrop:bg-opacity-50"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center justify-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">{modalTitle}</h1>
          <button
            type="button"
            className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 z-10"
            onClick={() => dialogRef.current?.close()}
          >
            ✕
          </button>
        </div>

        <div className="w-full">
          <label
            htmlFor="nicknameOrEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Login
          </label>
          <input
            type="text"
            id="nicknameOrEmail"
            name="nicknameOrEmail"
            value={confirmFormData.nicknameOrEmail}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Hasło
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={confirmFormData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {isLoading ? "Przetwarzanie..." : "Potwierdź"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default ConfirmModal;
