import Background from "../components/common/Background";
import SideBar from "../components/common/SideBar";
import { getOptions } from "../utils/sideBarOptions";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <SideBar options={getOptions("Dashboard")} />
      <Background blur="lg">
        <div className="ml-12 sm:ml-16"></div>
      </Background>
    </div>
  );
}

export default DashboardPage;
