import DefaultAvatar from "./DefaultAvatar";

interface AvatarProps {
  src?: string;
  size?: "small" | "medium" | "large";
  editable?: boolean;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
}

const avatarSizes = {
  small: "w-16 h-16",
  medium: "w-24 h-24",
  large: "w-32 h-32 md:w-48 md:h-48",
};

const buttonSizes = {
  small: "w-8 h-8 text-[10px]",
  medium: "w-10 h-10 text-sm",
  large: "w-12 h-12 text-base",
};

/**
 * Avatar component that displays a user's profile picture.
 * If no picture is provided, it shows a default avatar.
 * It can also include edit and delete buttons if specified.
 */
function Avatar({
  src = "",
  size = "medium",
  editable = false,
  onEditClick,
  onDeleteClick,
}: AvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`rounded-full overflow-hidden border-2 border-blue-500 ${avatarSizes[size]}`}
      >
        {src ? (
          <img
            src={src}
            alt="Avatar użytkownika"
            className="w-full h-full object-cover"
          />
        ) : (
          <DefaultAvatar size={size} />
        )}
      </div>

      {editable && (
        <div className="flex gap-3 mt-2">
          <button
            onClick={onEditClick}
            className={`flex items-center justify-center rounded-full border-2 border-white shadow-md
              bg-blue-600 text-white hover:bg-blue-700 transition ${buttonSizes[size]}`}
            title="Zmień zdjęcie profilowe"
          >
            <i className="fas fa-pen" />
          </button>

          <button
            onClick={onDeleteClick}
            className={`flex items-center justify-center rounded-full border-2 border-white shadow-md
              bg-red-600 text-white hover:bg-red-700 transition ${buttonSizes[size]}`}
            title="Usuń zdjęcie profilowe"
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Avatar;
