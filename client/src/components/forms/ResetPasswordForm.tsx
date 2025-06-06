import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/api.user";
import { useAlert } from "../../contexts/AlertContext";
import FormField from "../inputs/FormField";

interface ResetPasswordFormProps {
  linkId: string;
}

function ResetPasswordForm({ linkId }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log(linkId);

    try {
      const response = await resetPassword(linkId!, password);
      showAlert(response.message, "success");
      navigate("/login");
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded-lg shadow-md space-y-6 sm:space-y-8"
    >
      <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
        Ustaw Nowe Hasło
      </h1>

      <FormField
        label="Hasło"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
        placeholder="••••••••••••••••"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
        disabled={isLoading}
      >
        {isLoading ? "Przetwarzanie..." : "Resetuj Hasło"}
      </button>
    </form>
  );
}

export default ResetPasswordForm;
