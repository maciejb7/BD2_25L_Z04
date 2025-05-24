import Footer from "../components/common/Footer";
import Background from "../components/common/Background";
import TopBar from "../components/common/TopBar";
import { isUserAuthenticatedByStorage } from "../utils/userAuthentication";
import { getTopBarOptions } from "../constants/topBarOptions";

function NotFoundPage() {
  return (
    <div>
      <Background blur={`${isUserAuthenticatedByStorage() ? "lg" : "md"}`}>
        <TopBar options={getTopBarOptions(["Strona Główna"])} />
        <div className="flex flex-col items-center justify-center min-h-screen">
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
      </Background>
    </div>
  );
}

export default NotFoundPage;
