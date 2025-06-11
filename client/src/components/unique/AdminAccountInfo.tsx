import { useEffect, useState } from "react";
import { UserWithSessions } from "../../types/others";
import EditableField from "../inputs/EditableField";
import Avatar from "../common/Avatar";
import AvatarCropModal from "../modals/CropAvatarModal";
import { useAlert } from "../../contexts/AlertContext";
import { twoWayGenderMap, twoWayRoleMap } from "../../constants/maps";
import { getDateFormatter } from "../../utils/formatters";
import {
  deleteUserAvatarAdmin,
  getUserAvatarAdmin,
  getUserFromAPIAdmin,
} from "../../api/api.admin";

interface AdminAccountInfoProps {
  userId: string;
}

/**
 * AccountInfo component displays user information and allows editing it (avatar, name, surname, nickname, email).
 */
function AdminAccountInfo({ userId }: AdminAccountInfoProps) {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>("");
  const [cropAvatar, setCropAvatar] = useState<string>("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [user, setUser] = useState<UserWithSessions>({
    userId: "",
    nickname: "",
    name: "",
    surname: "",
    email: "",
    gender: "",
    role: "",
    birthDate: "",
    createdAt: "",
    lastIp: null,
    lastDevice: null,
    lastLogin: null,
    sessions: [],
  });

  const fetchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await getUserFromAPIAdmin(userId);
      const fetchedUser = response.user;
      const mappedGender = twoWayGenderMap.to(fetchedUser.gender);
      const mappedRole = twoWayRoleMap.to(fetchedUser.role);
      if (mappedGender) fetchedUser.gender = mappedGender;
      if (mappedRole) fetchedUser.role = mappedRole;
      setUser(fetchedUser);
    } catch (error: any) {
      showAlert(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvatar = async (userId: string) => {
    const avatarUrl = await getUserAvatarAdmin(userId);
    setAvatar(avatarUrl ?? "");
  };

  useEffect(() => {
    fetchUser(userId);
    fetchAvatar(userId);
  }, []);

  const onConfirm = (fieldName: string, newValue: string) =>
    setUser((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

  const handleAvatarChangeClick = () => {
    document.getElementById("avatarInput")?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "image/jpeg") return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropAvatar(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleAvatarDelete = async (userId: string) => {
    if (!avatar) {
      showAlert("Nie masz zdjęcia profilowego do usunięcia.", "info");
      return;
    }

    try {
      const response = await deleteUserAvatarAdmin(userId);
      showAlert(response.message, "success");
      setAvatar("");
      setCropAvatar("");
    } catch (error: any) {
      showAlert(error.message, "error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-5">
      <div className="relative">
        <Avatar
          src={avatar}
          size="large"
          editable={true}
          onEditClick={handleAvatarChangeClick}
          onDeleteClick={() => handleAvatarDelete(userId)}
        />
        <input
          type="file"
          id="avatarInput"
          accept="image/jpeg"
          onChange={handleAvatarFileChange}
          className="hidden"
        />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 mt-1">
        <EditableField
          label="Imię"
          name="name"
          value={user.name}
          onConfirm={onConfirm}
          isLoading={isLoading}
          userId={userId}
        />
        <EditableField
          label="Nazwisko"
          name="surname"
          value={user.surname}
          onConfirm={onConfirm}
          isLoading={isLoading}
          userId={userId}
        />
        <EditableField
          label="Nick"
          name="nickname"
          value={user.nickname}
          onConfirm={onConfirm}
          isLoading={isLoading}
          userId={userId}
        />
        <EditableField
          label="Mail"
          name="email"
          value={user.email}
          onConfirm={onConfirm}
          isLoading={isLoading}
          userId={userId}
        />
        <EditableField
          label="Typ Konta"
          name="role"
          value={user.role}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="select"
          options={["Użytkownik", "Administrator"]}
          editable={user.role !== "Administrator"}
          inputMap={twoWayRoleMap}
          userId={userId}
        />
        <EditableField
          label="Płeć"
          name="gender"
          value={user.gender}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="select"
          options={["Kobieta", "Mężczyzna"]}
          inputMap={twoWayGenderMap}
          userId={userId}
        />
        <EditableField
          label="Data urodzenia"
          name="birthDate"
          value={
            getDateFormatter(user.birthDate)?.getDMY() ?? "Nieprawidłowa Data"
          }
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="date"
          userId={userId}
        />
        <EditableField
          label="Data utworzenia konta"
          name="createdAt"
          value={
            getDateFormatter(user.createdAt)?.getDMYWithTime() ??
            "Nieprawidłowa Data"
          }
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
          userId={userId}
        />
        <EditableField
          label="Ostatnie IP"
          name="lastIp"
          value={user.lastIp || "Brak IP"}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
          userId={userId}
        />
        <EditableField
          label="Ostatnie Urządzenie"
          name="lastDevice"
          value={user.lastDevice || "Brak Urządzenia"}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
          userId={userId}
        />
        <EditableField
          label="Ostatnie Logowanie"
          name="lastLogin"
          value={
            getDateFormatter(user.lastLogin)?.getDMYWithTime() ??
            "Brak Logowania"
          }
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
          userId={userId}
        />
      </div>

      {cropAvatar && isCropModalOpen && (
        <AvatarCropModal
          imageSrc={cropAvatar}
          onClose={() => {
            setCropAvatar("");
            setIsCropModalOpen(false);
          }}
          onSave={(newAvatar) => {
            setAvatar(newAvatar);
            setCropAvatar("");
            setIsCropModalOpen(false);
          }}
          userId={userId}
        />
      )}
    </div>
  );
}

export default AdminAccountInfo;
