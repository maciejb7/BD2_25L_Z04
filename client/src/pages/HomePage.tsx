import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";
import MainBackground from "../components/common/MainBackground";
import TopBar from "../components/common/TopBar";
import InfoParagraph from "../components/home/InfoParagraph";
import Footer from "../components/common/Footer";

const topBarOptions = [
  { name: "Rejestracja", link: "/register" },
  { name: "Logowanie", link: "/login" },
];

const mainContent = {
  title: "Szukasz przyjaciela, wspólnika albo kochanki, ale to za trudne?",
  description: "Dzięki nam to już przeszłość!",
  buttonText: "Dołącz do nas!",
};

const infoContent = [
  {
    title: "Kim jesteśmy?",
    text: "ClingClang to nowoczesna i jedyna w swoim rodzaju aplikacja, która upraszcza proces poznawanie nowych ludzi do minimum. Miasz problem ze znalezieniem kolegów? To już nie masz.",
  },
  {
    title: "Jak to działa?",
    text: "Zarejestruj się, wypełnij swój profil swoimi zainteresowaniami i informacjami o sobie, a następnie rozpocznij wyszukiwanie innych osób podobnych do ciebie. Ot co, nic prostszego! Dzięki naszemu super nowoczesnemu algorytmowi, który dopasowuje potencjalne osoby według zainteresowań szybko znajdziesz innych ludzi do rozmowy, zabawy i czegokolwiek innego.",
  },
  {
    title: "Kogo mogę tu znaleźć?",
    text: "Ludzi takich jak ty (którzy też szukają)! Potencjalnych przyjaciół, wspólników do biznesu, a nawet miłość swojego życia albo ewentualnie jednej nocy, ale mimo wszystko warto spróbować!",
  },
  {
    title: "Opinie",
    text: "Nie wierzysz nam? Sprawdź opinie naszych użytkowników! Mamy mnóstwo pozytywnych opinii, a ich liczba rośnie z dnia na dzień. Nie czekaj, dołącz do nas i przekonaj się sam!",
  },
];

function HomePage() {
  return (
    <div className="flex flex-col">
      <TopBar options={topBarOptions} />
      <MainBackground>
        {/* Main Section */}
        <div className="flex flex-col items-center justify-center h-screen pl-6 pr-6">
          <Logo size="xl" shadow />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 text-white drop-shadow-xl">
            {mainContent.title}
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 text-white drop-shadow-lg">
            {mainContent.description}
          </h2>
          <Link
            key="/register"
            to="/register"
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300"
          >
            {mainContent.buttonText}
          </Link>
        </div>
        {/* Info Section */}
        <div className="flex flex-col items-center justify-center text-center w-full bg-white/70 backdrop-blur-md py-16 px-6 gap-16">
          {infoContent.map((paragraph, index) => (
            <InfoParagraph
              key={index}
              title={paragraph.title}
              description={paragraph.text}
            />
          ))}
        </div>
      </MainBackground>
      <Footer />
    </div>
  );
}

export default HomePage;
