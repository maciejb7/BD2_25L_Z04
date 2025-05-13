import { ReactNode } from "react";
import bgImage from "../../assets/home.jpg";

interface MainBackgroundProps {
  children?: ReactNode;
}

function MainBackground({ children }: MainBackgroundProps) {
  return (
    <div
      className="w-full h-min-screen bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="backdrop-blur-sm bg-white/50 h-full">{children}</div>
    </div>
  );
}

export default MainBackground;
