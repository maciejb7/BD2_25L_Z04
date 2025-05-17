import { ReactNode } from "react";
import bgImage from "../../assets/home.jpg";

interface MainBackgroundProps {
  blur?: "50" | "80";
  children?: ReactNode;
}

const blurMap = {
  "50": "bg-white/50",
  "80": "bg-white/80",
};

function MainBackground({ children, blur = "50" }: MainBackgroundProps) {
  return (
    <div
      className="w-full min-h-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`backdrop-blur-sm ${blurMap[blur]} w-full min-h-screen`}>
        {children}
      </div>
    </div>
  );
}

export default MainBackground;