import React, { useState } from "react";
import { RegisterFormData } from "../../types/requests";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/api.auth";
import { useAlert } from "../../contexts/AlertContext";
import FormField from "../inputs/FormField";

/**
 * RegisterForm component that handles user registration.
 */
function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    name: "",
    surname: "",
    nickname: "",
    email: "",
    password: "",
    gender: null,
    birthDate: "",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        }) as RegisterFormData,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (registerFormData.password !== confirmPassword) {
      showAlert("Hasła nie są takie same!", "error");
      setIsLoading(false);
      return;
    }

    if (registerFormData.gender === null) {
      showAlert("Wybierz swoją płeć!", "error");
      setIsLoading(false);
      return;
    }

    if (!registerFormData.birthDate) {
      showAlert("Podaj datę urodzenia!", "error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await register(registerFormData);
      showAlert(response.message, "success");
      navigate("/login");
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-3 mt-20 mb-5 sm:mt-0 sm:px-0 py-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-white w-full max-w-md mx-auto p-3 sm:p-5 rounded-lg shadow-md gap-2"
      >
        <h1 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-2 w-full">
          Rejestracja
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="space-y-3">
            <FormField
              label="Imię"
              name="name"
              value={registerFormData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Jan"
            />

            <FormField
              label="Nazwisko"
              name="surname"
              value={registerFormData.surname}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Kowalski"
            />

            <FormField
              label="Nick"
              name="nickname"
              value={registerFormData.nickname}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="janek123"
            />

            <FormField
              label="Email"
              type="email"
              name="email"
              value={registerFormData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="jan@clingclang.com"
            />
          </div>

          <div className="space-y-3">
            <FormField
              label="Data Urodzenia"
              type="date"
              name="birthDate"
              value={registerFormData.birthDate}
              onChange={handleChange}
              required
              disabled={isLoading}
            />

            <FormField
              label="Hasło"
              type="password"
              name="password"
              value={registerFormData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="••••••••••••••••"
            />

            <FormField
              label="Powtórz Hasło"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="••••••••••••••••"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Płeć
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="gender-male"
                    name="gender"
                    value="male"
                    checked={registerFormData?.gender === "male"}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="gender-male"
                    className="ml-1.5 block text-sm text-gray-700"
                  >
                    Mężczyzna
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="gender-female"
                    name="gender"
                    value="female"
                    checked={registerFormData?.gender === "female"}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label
                    htmlFor="gender-female"
                    className="ml-1.5 block text-sm text-gray-700"
                  >
                    Kobieta
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 bg-blue-600 text-white py-2 px-3 text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Rejestrowanie..." : "Zarejestruj się"}
        </button>

        <p className="text-center text-xs sm:text-sm text-gray-600 pt-1 mt-1">
          Masz już konto?{" "}
          <Link
            to="/login"
            className="ml-2 font-medium text-blue-600 hover:text-blue-500"
          >
            Zaloguj się!
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
