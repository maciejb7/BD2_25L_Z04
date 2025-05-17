import { useState } from "react";
import { LoginFormData } from "../../types/auth.types";
import { login } from "../../api/api.auth";
import { Link } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { getAuthObserver } from "../../utils/AuthObserver";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    nicknameOrEmail: "",
    password: "",
  });

  const { showAlert } = useAlert();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData((prev) => ({ ...prev, [name]: value }) as LoginFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(loginFormData);
      getAuthObserver().emitLogin(response.message, "success");
    } catch (error: any) {
      console.log(error);
      setLoginFormData({ nicknameOrEmail: "", password: "" });
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-white w-full max-w-sm mx-auto p-4 sm:p-6 rounded-lg shadow-md space-y-6 sm:space-y-8"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800">
          Logowanie
        </h1>

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
            value={loginFormData.nicknameOrEmail}
            onChange={handleChange}
            required
            disabled={isLoading}
            autoComplete="username"
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="Login lub email"
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
            value={loginFormData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
            autoComplete="current-password"
            className="w-full px-3 py-2.5 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 text-base rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <p className="text-center text-sm text-gray-600 pt-2">
          Nie masz konta?
          <Link
            to="/register"
            className="ml-2 font-medium text-blue-600 hover:text-blue-500"
          >
            Zarejestruj się!
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
