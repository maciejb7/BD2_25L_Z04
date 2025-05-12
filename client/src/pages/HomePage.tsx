import Logo from "../components/common/Logo";
import MainBackground from "../components/common/MainBackground";
import TopBar from "../components/common/TopBar";

const topBarOptions = [
  { name: "Rejestracja", link: "/register" },
  { name: "Logowanie", link: "/login" },
];

function HomePage() {
  return (
    <div>
      <TopBar options={topBarOptions} />

      <MainBackground>
        <div className="flex flex-col items-center justify-center text-center h-screen -mt-16">
          <Logo size="xl" shadow />

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 text-white drop-shadow-lg">
            Szukasz przyjaciela, wspólnika albo kochanki?
          </h1>

          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 text-white drop-shadow-lg">
            Nic prostszego!
          </h2>

          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300">
            Dołącz do nas!
          </button>
        </div>
      </MainBackground>
    </div>
  );
}

export default HomePage;
