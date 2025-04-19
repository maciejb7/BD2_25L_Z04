import { useState } from "react";
import { LoginFormData } from "../../types/auth.types";
import { login } from "../../api/api.auth";
import { Link } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { getAuthObserver } from "../../utils/AuthObserver";

function LoginForm() {
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

    try {
      const response = await login(loginFormData);
      getAuthObserver().emitLogin(response.message, "success");
    } catch (error: any) {
      console.log(error);
      setLoginFormData({ nicknameOrEmail: "", password: "" });
      showAlert(error.message, "error");
    }
  };

  return (
    <div className="flex justify-center items-center mt-8 h-[calc(100vh-100px)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-white w-full max-w-md mx-auto p-5 rounded-lg shadow-md space-y-8 overflow-auto max-h-full"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Logowanie
        </h1>

        <div className="w-full">
          <label
            htmlFor="name"
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
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Zaloguj się
        </button>

        <p className="text-center text-sm text-gray-600">
          Nie masz konta?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Zarejestruj się!
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
