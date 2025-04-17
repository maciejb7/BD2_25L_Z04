import { Link } from "react-router-dom";

interface TopBarOption {
  name: string;
  link: string;
}

interface TopBarProps {
  options: TopBarOption[];
}

function TopBar({ options }: TopBarProps) {
  return (
    <nav className="z-10 flex justify-between items-center px-6 py-3 bg-white shadow-md">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-blue-600">ClingClang</h1>
      </div>

      <div className="flex items-center space-x-5">
        {options.map((option) => (
          <Link
            key={option.link}
            to={option.link}
            className="relative px-5 py-2.5 text-gray-700 font-medium rounded-lg group overflow-hidden hover:text-white"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
            <span className="relative transition-colors duration-300 ease-in-out">
              {option.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default TopBar;
