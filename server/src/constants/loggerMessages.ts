export const getloggerMessage = (service: string | undefined) => {
  const messages: Record<string, string> = {
    default: "Wystąpił błąd podczas przetwarzania żądania",
    register: "Wystąpił błąd podczas rejestracji użytkownika",
    activate_user_account: "Wystąpił błąd podczas aktywacji konta użytkownika",
    login: "Wystąpił błąd podczas logowania użytkownika",
    logout: "Wystąpił błąd podczas wylogowywania użytkownika",
    logout_from_all_devices:
      "Wystąpił błąd podczas wylogowywania użytkownika ze wszystkich urządzeń",
    refresh: "Wystąpił błąd podczas odświeżania tokena",
    get_user_details_by_user:
      "Wystąpił błąd podczas pobierania danych użytkownika przez użytkownika",
    get_user_details_by_admin:
      "Wystąpił błąd podczas pobierania danych użytkownika przez administratora",
    get_user_avatar_by_user:
      "Wystąpił błąd podczas pobierania awatara użytkownika przez użytkownika",
    get_user_avatar_by_admin:
      "Wystąpił błąd podczas pobierania awatara użytkownika przez administratora",
    upload_user_avatar_by_user:
      "Wystąpił błąd podczas przesyłania awatara użytkownika przez użytkownika",
    upload_user_avatar_by_admin:
      "Wystąpił błąd podczas przesyłania awatara użytkownika przez administratora",
    delete_user_avatar_by_user:
      "Wystąpił błąd podczas usuwania awatara użytkownika przez użytkownika",
    delete_user_avatar_by_admin:
      "Wystąpił błąd podczas usuwania awatara użytkownika przez administratora",
    change_user_details_by_user:
      "Wystąpił błąd podczas zmiany danych użytkownika przez użytkownika",
    change_user_details_by_admin:
      "Wystąpił błąd podczas zmiany danych użytkownika przez administratora",
    reset_user_password_by_user:
      "Wystąpił błąd podczas resetowania hasła użytkownika przez użytkownika",
    change_user_password_by_user:
      "Wystąpił błąd podczas zmiany hasła użytkownika przez użytkownika",
    change_user_password_by_admin:
      "Wystąpił błąd podczas zmiany hasła użytkownika przez administratora",
    delete_account_by_user:
      "Wystąpił błąd podczas usuwania konta użytkownika przez użytkownika",
    delete_account_by_admin:
      "Wystąpił błąd podczas usuwania konta użytkownika przez administratora",
    extract_user_payload: "Wystąpił błąd w funkcji extract_user_payload",
    extract_path_parameter: "Wystąpił błąd w funkcji extract_path_parameter",
    extract_token: "Wystąpił błąd w funkcji extract_token",
    extract_fields: "Wystąpił błąd w funkcji extract_fields",
    get_authenticated_user: "Wystąpił błąd w funkcji get_authenticated_user",
    is_nickname_taken:
      "Wystąpił błąd podczas sprawdzania dostępności pseudonimu",
    is_email_taken:
      "Wystąpił błąd podczas sprawdzania dostępności adresu e-mail",
    check_if_image_has_correct_size:
      "Wystąpił błąd podczas sprawdzania rozmiaru obrazu",
    check_if_value_matches_enum:
      "Wystąpił błąd podczas sprawdzania, czy wartość pasuje do enum",
    check_if_value_is_valid:
      "Wystąpił błąd podczas sprawdzania, czy wartość jest poprawna",
    check_if_email_is_valid:
      "Wystąpił błąd podczas sprawdzania, czy adres e-mail jest poprawny",
    check_if_password_is_valid:
      "Wystąpił błąd podczas sprawdzania, czy hasło jest poprawne",
    get_date_time_from_date:
      "Wystąpił błąd podczas pobierania daty i godziny z daty",
  };

  return (
    messages[service ?? ""] ?? "Wystąpił błąd podczas przetwarzania żądania"
  );
};
