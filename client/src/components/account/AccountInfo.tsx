import { useEffect, useState } from "react";
import { User } from "../../types/general.types";
import { getUserAvatar } from "../../api/api.user";
import { getUser, getUserFromStorage } from "../../utils/userAuthentication";
import AccountField from "./AccountField";
import { formatDate } from "../../utils/dateFormatter";

/**
 * AccountInfo component displays user information and allows editing it (avatar, name, surname, nickname, email).
 */
function AccountInfo() {
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>("");
  const [userInfo, setUserInfo] = useState<User>(
    getUserFromStorage() ?? {
      userId: "",
      nickname: "",
      name: "",
      surname: "",
      email: "",
      gender: "",
      role: "",
      birthDate: "",
      createdAt: "",
    },
  );

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const user = await getUser();
      if (user.gender === "female") user.gender = "Kobieta";
      if (user.gender === "male") user.gender = "Mężczyzna";
      if (user.role === "user") user.role = "Użytkownik";
      else if (user.role === "admin") user.role = "Administrator";
      else user.role = "";

      setUserInfo(user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      const avatarUrl = await getUserAvatar();
      setAvatar(avatarUrl ?? "");
    };
    fetchAvatar();
  }, []);

  const onConfirm = (fieldName: string, newValue: string) =>
    setUserInfo((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-5">
      <div className="relative w-20 h-20 sm:w-32 sm:h-32 md:w-60 md:h-60">
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full rounded-full border-2 object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-300" />
        )}
        <button
          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3 
               p-1 sm:p-1.5 md:p-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
          title="Zmień avatar"
        >
          <i className="fas fa-pen text-xs sm:text-sm md:text-base"></i>
        </button>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-1">
        <AccountField
          label="Imię"
          name="name"
          value={userInfo.name}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <AccountField
          label="Nazwisko"
          name="surname"
          value={userInfo.surname}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <AccountField
          label="Nick"
          name="nickname"
          value={userInfo.nickname}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <AccountField
          label="Mail"
          name="email"
          value={userInfo.email}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <AccountField
          label="Typ Konta"
          name="role"
          value={userInfo.role}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
        />
        <AccountField
          label="Płeć"
          name="gender"
          value={userInfo.gender}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="select"
          options={["Kobieta", "Mężczyzna"]}
        />
        <AccountField
          label="Data urodzenia"
          name="birthDate"
          value={formatDate(userInfo.birthDate) ?? "Nieprawidłowa Data"}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="date"
        />
        <AccountField
          label="Data utworzenia konta"
          name="createdAt"
          value={formatDate(userInfo.createdAt) ?? "Nieprawidłowa Data"}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
        />
      </div>
    </div>
  );
}

export default AccountInfo;
