import { useState } from "react";
import { LoginFormData } from "../../types/requests";
import { login } from "../../api/api.auth";
import { Link } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import FormField from "../inputs/FormField";
import ForgottenPasswordModal from "../modals/ForgottenPasswordModal";

/**
 * LoginForm component that handles user login.
 */
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    nicknameOrEmail: "",
    password: "",
  });
  const [forgottenPasswordModalOpen, setForgottenPasswordModalOpen] =
    useState(false);

  const { showAlert } = useAlert();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }) as LoginFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginFormData);
    } catch (error: any) {
      setLoginFormData({ nicknameOrEmail: "", password: "" });
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-0 py-6">
      <ForgottenPasswordModal
        modalTitle="Resetowanie Hasła"
        isOpen={forgottenPasswordModalOpen}
        onClose={() => setForgottenPasswordModalOpen(false)}
      />
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded-lg shadow-md space-y-6 sm:space-y-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
          Logowanie
        </h1>

        <FormField
          label="Login"
          name="nicknameOrEmail"
          value={loginFormData.nicknameOrEmail}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="Nick Lub Email"
        />

        <FormField
          label="Hasło"
          type="password"
          name="password"
          value={loginFormData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
          placeholder="••••••••••••••••"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Nie masz konta?
          <Link
            to="/register"
            className="ml-2 font-medium text-blue-600 hover:text-blue-500"
          >
            Zarejestruj się!
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600">
          <button
            type="button"
            onClick={() => setForgottenPasswordModalOpen(true)}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
          >
            Zapomniałeś hasła?
          </button>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
