interface DefaultAvatarProps {
  size?: "small" | "medium" | "large";
}

const avatarSizes = {
  small: "text-xl",
  medium: "text-4xl",
  large: "text-6xl md:text-7xl",
};

/**
 * DefaultAvatar component that displays a placeholder avatar icon.
 */
function DefaultAvatar({ size = "medium" }: DefaultAvatarProps) {
  const classNames = `bg-gray-200 flex items-center justify-center text-gray-500 w-full h-full ${avatarSizes[size]}`;

  return (
    <div className={classNames}>
      <i className="fas fa-user" />
    </div>
  );
}

export default DefaultAvatar;
