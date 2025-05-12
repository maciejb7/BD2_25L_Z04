import { ReactNode } from "react";

import bgImage from "../../assets/home.jpg";

interface MainBackgroundProps {
  children: ReactNode;
}

function MainBackground({ children }: MainBackgroundProps) {
  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-white/50">
        {children}
      </div>
    </div>
  );
}

export default MainBackground;
