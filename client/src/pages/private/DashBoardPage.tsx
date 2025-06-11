import Background from "../../components/common/Background";
import Logo from "../../components/common/Logo";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Dashboard")} />
        <div className="flex flex-col items-center justify-center ml-12 sm:ml-16 h-screen">
          <Logo size="xl" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 text-white drop-shadow-xl">
            WITAJ!
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 text-white drop-shadow-lg">
            Przejdź do menu po lewej stronie, aby rozpocząć korzystanie z
            aplikacji.
          </h2>
        </div>
      </Background>
    </div>
  );
}

export default DashboardPage;
