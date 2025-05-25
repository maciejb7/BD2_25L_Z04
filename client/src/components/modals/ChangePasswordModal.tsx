import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { ResetPasswordFormData } from "../../types/requests";
import FormField from "../inputs/FormField";

interface PasswordModalProps {
  apiCall: (data: ResetPasswordFormData) => Promise<any>;
  modalTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * PasswordModal component that allows users to change their password.
 */
function PasswordModal({
  apiCall,
  modalTitle,
  isOpen,
  onClose,
}: PasswordModalProps) {
  const [passwordFormData, setPasswordFormData] =
    useState<ResetPasswordFormData>({
      oldPassword: "",
      newPassword: "",
    });
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>("");
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
    setPasswordFormData(
      (prev) => ({ ...prev, [name]: value }) as ResetPasswordFormData,
    );
  };

  const clearForm = () => {
    setPasswordFormData({
      oldPassword: "",
      newPassword: "",
    });
    setPasswordConfirmation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const dialog = dialogRef.current;
    if (!dialog) return;

    let errorMessage = "";

    if (passwordFormData.oldPassword === passwordFormData.newPassword) {
      errorMessage = "Nowe hasło nie może być takie samo jak stare.";
    } else if (passwordFormData.newPassword !== passwordConfirmation) {
      errorMessage = "Nowe hasło i potwierdzenie hasła muszą być takie same.";
    }

    if (errorMessage) {
      showAlert(errorMessage, "error");
      setIsLoading(false);
      clearForm();
      dialog.close();
      return;
    }

    try {
      const response = await apiCall(passwordFormData);
      showAlert(response.message, "success");
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      clearForm();
      dialog.close();
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
              clearForm();
              dialogRef.current?.close();
            }}
          >
            ✕
          </button>
        </div>

        <FormField
          label="Stare Hasło"
          type="password"
          name="oldPassword"
          value={passwordFormData.oldPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="••••••••••••••••"
        />

        <FormField
          label="Nowe Hasło"
          type="password"
          name="newPassword"
          value={passwordFormData.newPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="••••••••••••••••"
        />

        <FormField
          label="Potwierdź Nowe Hasło"
          type="password"
          name="passwordConfirmation"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          disabled={isLoading}
          placeholder="••••••••••••••••"
        />

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              clearForm();
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
            {isLoading ? "Przetwarzanie..." : "Zmień Hasło"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default PasswordModal;
