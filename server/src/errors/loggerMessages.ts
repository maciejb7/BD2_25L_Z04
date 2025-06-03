export const validationErrorLoggerMessages = (service: string | undefined) => {
  const messages: Record<string, string> = {
    register: "Błąd walidacji danych podczas rejestracji",
    login: "Błąd walidacji danych podczas logowania",
    delete_account_user:
      "Błąd walidacji danych podczas usuwania konta użytkownika",
  };

  return messages[service ?? ""] ?? "Błąd walidacji danych.";
};

export const loggerMessages = (service: string | undefined) => {
  const messages: Record<string, string> = {
    register: "Wystąpił błąd podczas rejestracji użytkownika",
    login: "Wystąpił błąd podczas logowania użytkownika",
    logout: "Wystąpił błąd podczas wylogowywania użytkownika",
    refresh: "Wystąpił błąd podczas odświeżania tokena",
    delete_account_user: "Wystąpił błąd podczas usuwania konta użytkownika",
    logout_from_all_devices:
      "Wystąpił błąd podczas wylogowywania użytkownika ze wszystkich urządzeń",
    user_upload_avatar: "Wystąpił błąd podczas przesyłania awatara użytkownika",
    change_user_details: "Wystąpił błąd podczas zmiany danych użytkownika",
    change_password_user: "Wystąpił błąd podczas zmiany hasła użytkownika",
  };

  return (
    messages[service ?? ""] ?? "Wystąpił błąd podczas przetwarzania żądania."
  );
};
