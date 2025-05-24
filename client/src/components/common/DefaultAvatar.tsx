interface DefaultAvatarProps {
  size?: "small" | "medium" | "large";
}

const avatarSizes = {
  small: "w-10 h-10 sm:w-12 sm:h-12 text-xl sm:text-2xl",
  medium: "w-16 h-16 sm:w-28 sm:h-28 text-4xl sm:text-7xl",
  large: "w-20 h-20 sm:w-32 sm:h-32 md:w-60 md:h-60 text-5xl sm:text-8xl",
};

function DefaultAvatar({ size = "medium" }: DefaultAvatarProps) {
  const classNames = `rounded-full bg-gray-200 border-2 border-blue-500 flex items-center justify-center text-gray-500 ${avatarSizes[size]}`;

  return (
    <div className={classNames}>
      <i className="fas fa-user" />
    </div>
  );
}

export default DefaultAvatar;
