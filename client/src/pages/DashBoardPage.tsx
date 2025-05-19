import MainBackground from "../components/common/MainBackground";
import SideBar from "../components/common/SideBar";
import { getOptions } from "../utils/sideBarOptions";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <SideBar options={getOptions("Dashboard")} />
      <MainBackground blur="80">
        <div className="ml-12 sm:ml-16"></div>
      </MainBackground>
    </div>
  );
}

export default DashboardPage;
