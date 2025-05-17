import { Link } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";

interface TopBarOption {
  name: string;
  link: string;
}

interface TopBarProps {
  options: TopBarOption[];
}

function TopBar({ options }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="z-10 w-full bg-white shadow-md px-6 py-3 fixed top-0 left-0">
      {/* TopBar Content */}
      <div className="flex flex-row items-center justify-between">
        {/* Right Side */}
        <Logo size="md" />
        {/* Left Side */}
        <div className="hidden sm:flex justify-end gap-4">
          {options.map((option) => (
            <Link
              key={option.link}
              to={option.link}
              className="px-5 py-2 text-gray-700 font-semibold rounded-md hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
            >
              {option.name}
            </Link>
          ))}
        </div>
        {/* Button for mobile menu */}
        <button
          className="sm:hidden text-gray-700 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Menu for mobile */}
      {isOpen && (
        <div className="sm:hidden absolute top-full right-0 w-max bg-white rounded-b-md shadow-lg p-2 z-20">
          {options.map((option) => (
            <Link
              key={option.link}
              to={option.link}
              className="block text-right text-gray-700 font-semibold px-4 py-2 rounded hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-600 hover:text-white transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              {option.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default TopBar;
