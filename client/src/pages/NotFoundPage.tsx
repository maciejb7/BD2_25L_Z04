import Footer from "../components/common/Footer";
import MainBackground from "../components/common/MainBackground";
import TopBar from "../components/common/TopBar";
import { isUserAuthenticatedByStorage } from "../utils/userAuthentication";

const topBarOptions = [
  {
    name: isUserAuthenticatedByStorage() ? "DashBoard" : "Strona Główna",
    link: "/",
  },
];

function NotFoundPage() {
  return (
    <div>
      <TopBar options={topBarOptions} />
      <MainBackground blur={`${isUserAuthenticatedByStorage() ? "80" : "50"}`}>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-center px-6 py-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-blue-600 mb-4">
              404
            </h1>
            <h2 className="text-lg sm:text-2xl font-semibold text-gray-700 mb-6">
              STRONA NIE ZNALEZIONA
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xs sm:max-w-lg">
              Przepraszamy, ale strona której szukasz nie istnieje lub została
              przeniesiona.
            </p>
          </div>
        </div>
        <Footer />
      </MainBackground>
    </div>
  );
}

export default NotFoundPage;
