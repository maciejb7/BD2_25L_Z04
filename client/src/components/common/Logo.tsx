interface LogoProps {
  size?: "sm" | "md" | "lg";
  shadow?: boolean;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

function Logo({ size = "md", shadow = false }: LogoProps) {
  return (
    <div
      className={`font-bold tracking-tight ${sizeMap[size]} text-blue-600 ${shadow ? "drop-shadow-sm" : ""}`}
    >
      ClingClang
    </div>
  );
}

export default Logo;
