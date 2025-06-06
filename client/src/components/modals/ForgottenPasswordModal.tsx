import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import FormField from "../inputs/FormField";
import { createResetPasswordLink } from "../../api/api.user";

interface ForgottenPasswordModalProps {
  modalTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

function ForgottenPasswordModal({
  modalTitle,
  isOpen,
  onClose,
}: ForgottenPasswordModalProps) {
  const [email, setEmail] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!email) {
      showAlert("Musisz podać adres e-mail, aby zresetować hasło.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createResetPasswordLink(email);
      showAlert(response.message, "success");
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      setEmail("");
      setIsLoading(false);
      dialog.close();
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
              setEmail("");
              dialogRef.current?.close();
            }}
          >
            ✕
          </button>
        </div>

        <FormField
          label="Twój Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          placeholder="jan@clingclang.com"
        />

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setEmail("");
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

export default ForgottenPasswordModal;
