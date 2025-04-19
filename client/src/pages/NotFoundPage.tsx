import TopBar from "../components/common/TopBar";
import { isAuthenticated } from "../utils/AuthInfo";

const topBarOptions = [
  { name: isAuthenticated() ? "DashBoard" : "Strona Główna", link: "/" },
];

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBar options={topBarOptions}></TopBar>
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          STRONA NIE ZNALEZIONA
        </h2>
        <p className="text-gray-600 text-center max-w-lg mb-8">
          Przepraszamy, ale strona której szukasz nie istnieje lub została
          przeniesiona.
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
