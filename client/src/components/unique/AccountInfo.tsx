import { useEffect, useState } from "react";
import { User } from "../../types/others";
import {
  deleteUserAvatar,
  getUserAvatar,
  getUserFromAPI,
} from "../../api/api.user";
import EditableField from "../inputs/EditableField";
import Avatar from "../common/Avatar";
import AvatarCropModal from "../modals/CropAvatarModal";
import { useAlert } from "../../contexts/AlertContext";
import { twoWayGenderMap, twoWayRoleMap } from "../../constants/maps";
import { getDateFormatter } from "../../utils/formatters";

/**
 * AccountInfo component displays user information and allows editing it (avatar, name, surname, nickname, email).
 */
function AccountInfo() {
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState<string>("");
  const [cropAvatar, setCropAvatar] = useState<string>("");
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const [user, setUser] = useState<User>({
    userId: "",
    nickname: "",
    name: "",
    surname: "",
    email: "",
    gender: "",
    role: "",
    birthDate: "",
    createdAt: "",
  });

  const fetchUser = async () => {
    setIsLoading(true);
    const user = await getUserFromAPI();
    const mappedGender = twoWayGenderMap.to(user.gender);
    const mappedRole = twoWayRoleMap.to(user.role);
    if (mappedGender) user.gender = mappedGender;
    if (mappedRole) user.role = mappedRole;
    setUser(user);
    setIsLoading(false);
  };

  const fetchAvatar = async () => {
    try {
      const avatarUrl = await getUserAvatar();
      setAvatar(avatarUrl);
    } catch {
      setAvatar("");
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAvatar();
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

  const handleAvatarDelete = async () => {
    if (!avatar) {
      showAlert("Nie masz zdjęcia profilowego do usunięcia.", "info");
      return;
    }

    try {
      const response = await deleteUserAvatar();
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
          onDeleteClick={handleAvatarDelete}
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
        />
        <EditableField
          label="Nazwisko"
          name="surname"
          value={user.surname}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <EditableField
          label="Nick"
          name="nickname"
          value={user.nickname}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <EditableField
          label="Mail"
          name="email"
          value={user.email}
          onConfirm={onConfirm}
          isLoading={isLoading}
        />
        <EditableField
          label="Typ Konta"
          name="role"
          value={user.role}
          onConfirm={onConfirm}
          isLoading={isLoading}
          type="text"
          editable={false}
          inputMap={twoWayRoleMap}
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
        />
      )}
    </div>
  );
}

export default AccountInfo;
