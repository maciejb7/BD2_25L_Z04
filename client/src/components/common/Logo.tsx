interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  shadow?: boolean;
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl",
  xxl: "text-8xl",
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
