import React, { useState } from "react";
import { RegisterFormData } from "../../types/auth.types";
import { Link } from "react-router-dom";
import { register } from "../../api/api.auth";
import { useAlert } from "../../contexts/AlertContext";
import { getAuthObserver } from "../../utils/AuthObserver";

function RegisterForm() {
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

    if (registerFormData.password !== confirmPassword) {
      showAlert("Hasła nie są takie same!", "error");
      return;
    }

    if (registerFormData.gender === null) {
      showAlert("Wybierz swoją płeć!", "error");
      return;
    }

    if (!registerFormData.birthDate) {
      showAlert("Podaj datę urodzenia!", "error");
      return;
    }

    try {
      const response = await register(registerFormData);
      getAuthObserver().emitLogin(response.message, "success");
    } catch (error: any) {
      showAlert(error.message, "error");
    }
  };

  return (
    <div className="flex justify-center items-center mt-8 h-[calc(100vh-100px)]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center bg-white w-full max-w-md mx-auto p-5 rounded-lg shadow-md space-y-3 overflow-auto max-h-full"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Rejestracja
        </h1>

        <div className="w-full">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Imię
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={registerFormData?.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="surname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nazwisko
          </label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={registerFormData?.surname}
            onChange={handleChange}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nick
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={registerFormData?.nickname}
            onChange={handleChange}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={registerFormData?.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data urodzenia
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={registerFormData?.birthDate}
            onChange={handleChange}
            required
            max={new Date().toISOString().split("T")[0]} // Maksymalna data to dzisiaj
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
            value={registerFormData?.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Powtórz Hasło
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              type="radio"
              id="gender-male"
              name="gender"
              value="male"
              checked={registerFormData?.gender === "male"}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="gender-male"
              className="ml-2 block text-sm text-gray-700"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="gender-female"
              className="ml-2 block text-sm text-gray-700"
            >
              Kobieta
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Zarejestruj się
        </button>

        <p className="text-center text-sm text-gray-600">
          Masz już konto?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Zaloguj się!
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
