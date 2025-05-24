import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { ConfirmFormData } from "../../types/auth.types";
import FormField from "../inputs/FormField";
import { getUser } from "../../utils/userAuthentication";

interface ConfirmModalDataProps {
  apiCall: (data: ConfirmFormData) => Promise<any>;
  modalTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ConfirmModal component for confirming actions that require user authentication by nickname and password.
 * It is used for actions like deleting account etc.
 */
function ConfirmModal({
  apiCall,
  modalTitle,
  isOpen,
  onClose,
}: ConfirmModalDataProps) {
  const [confirmFormData, setConfirmFormData] = useState<ConfirmFormData>({
    nickname: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [placeHolder, setPlaceHolder] = useState({
    nickname: "",
  });
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

  useEffect(() => {
    const fetchPlaceholder = async () => {
      const { nickname } = await getUser();
      setPlaceHolder({
        nickname,
      });
    };
    fetchPlaceholder();
  }, []);

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
      setConfirmFormData({ nickname: "", password: "" });
      showAlert(error.message, "error");
      const dialog = dialogRef.current;
      if (!dialog) return;
      dialog.close();
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
            onClick={() => {
              setConfirmFormData({ nickname: "", password: "" });
              dialogRef.current?.close();
            }}
          >
            ✕
          </button>
        </div>

        <FormField
          label="Twój Nick"
          name="nickname"
          value={confirmFormData.nickname}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder={placeHolder.nickname}
        />

        <FormField
          label="Hasło"
          type="password"
          name="password"
          value={confirmFormData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="••••••••••••••••"
        />

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmFormData({ nickname: "", password: "" });
              dialogRef.current?.close();
            }}
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
