import DefaultAvatar from "./DefaultAvatar";

interface AvatarProps {
  src?: string;
  size?: "small" | "medium" | "large";
  editable?: boolean;
  onEditClick?: () => void;
}

const avatarSizes = {
  small: "w-10 h-10 sm:w-12 sm:h-12",
  medium: "w-16 h-16 sm:w-28 sm:h-28",
  large: "w-20 h-20 sm:w-32 sm:h-32 md:w-60 md:h-60",
};

const editButtonSizes = {
  small: "w-5 h-5 text-[10px]",
  medium: "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-xs sm:text-sm md:text-base",
  large:
    "w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-sm sm:text-base md:text-lg",
};

const editButtonOffsets = {
  small: "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  medium: "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  large: "bottom-0.5 right-0.5 sm:bottom-2 sm:right-2 md:bottom-3 md:right-3",
};

function Avatar({
  src = "",
  size = "medium",
  editable = false,
  onEditClick,
}: AvatarProps) {
  return (
    <div className={`relative ${avatarSizes[size]} rounded-full`}>
      {src ? (
        <img
          src={src}
          alt="Avatar Użytkownika"
          className="w-full h-full object-cover rounded-full border-2 border-blue-500"
        />
      ) : (
        <DefaultAvatar size={size} />
      )}

      {editable && (
        <button
          onClick={onEditClick}
          className={`absolute ${editButtonSizes[size]} 
            bg-blue-600 text-white rounded-full flex items-center justify-center
            border-2 border-white shadow-md hover:bg-blue-700 transition duration-200
            ${editButtonOffsets[size]}`}
          title="Zmień avatar"
        >
          <i className="fas fa-pen" />
        </button>
      )}
    </div>
  );
}

export default Avatar;
