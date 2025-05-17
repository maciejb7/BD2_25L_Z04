import { Link } from "react-router-dom";
import Logo from "./Logo";

function Footer() {
  return (
    <footer className="bottom-0 w-full bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-row items-center justify-center text-gray-600 text-sm sm:text-base font-medium gap-2">
        <span>&copy; 2025</span>
        <Logo size="sm" />
        <span>by</span>
        <Link
          key="https://github.com/maciejb7/BD2_25L_Z04"
          to="https://github.com/maciejb7/BD2_25L_Z04"
          className="text-blue-600 font-semibold"
        >
          AMBH Team
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
