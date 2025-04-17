import { Link } from "react-router-dom";

function TopBar() {
  return (
    <nav className="flex justify-end items-center p-4 space-x-4">
      <Link
        to="/login"
        className="border border-black px-4 py-2 rounded hover:text-gray-300 hover:border-gray-300"
      >
        Logowanie
      </Link>
      <Link
        to="/register"
        className="border border-black px-4 py-2 rounded hover:text-gray-300 hover:border-gray-300"
      >
        Rejestracja
      </Link>
    </nav>
  );
}

export default TopBar;
