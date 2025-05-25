import { Link } from "react-router-dom";
import Logo from "../../components/common/Logo";
import Background from "../../components/common/Background";
import TopBar from "../../components/common/TopBar";
import InfoParagraph from "../../components/unique/InfoParagraph";
import Footer from "../../components/common/Footer";
import {
  mainPageContent,
  mainPageInfoContent,
} from "../../constants/mainPageOptions";
import { getTopBarOptions } from "../../constants/topBarOptions";

/**
 * HomePage for unauthenticated users.
 * Contains main information about the application.
 */
function HomePage() {
  return (
    <div className="flex flex-col text-center">
      <Background>
        <TopBar options={getTopBarOptions(["Logowanie", "Rejestracja"])} />
        <div className="flex flex-col items-center justify-center h-screen pl-6 pr-6">
          <Logo size="xl" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 text-white drop-shadow-xl">
            {mainPageContent.title}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 text-white drop-shadow-lg">
            {mainPageContent.description}
          </h2>
          <Link
            key="/register"
            to="/register"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300"
          >
            {mainPageContent.buttonText}
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center text-center w-full bg-white/70 backdrop-blur-md py-16 px-6 gap-2">
          {mainPageInfoContent.map((paragraph, index) => (
            <InfoParagraph
              key={index}
              title={paragraph.title}
              description={paragraph.text}
            />
          ))}
        </div>
        <Footer />
      </Background>
    </div>
  );
}

export default HomePage;
