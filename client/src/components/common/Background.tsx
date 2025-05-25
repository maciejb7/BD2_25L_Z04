import { ReactNode } from "react";
import bgImage from "../../assets/home.jpg";

interface BackgroundProps {
  blur?: "sm" | "md" | "lg";
  children?: ReactNode;
}

const blurMap = {
  sm: "bg-white/30",
  md: "bg-white/50",
  lg: "bg-white/80",
};

/**
 * Background component that displays a full-screen background image with blur effect.
 */
function Background({ children, blur = "md" }: BackgroundProps) {
  return (
    <div
      className="w-full min-h-screen bg-fixed bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`backdrop-blur-sm ${blurMap[blur]} w-full min-h-screen`}>
        {children}
      </div>
    </div>
  );
}

export default Background;
