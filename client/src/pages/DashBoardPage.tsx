import MainBackground from "../components/common/MainBackground";
import SideBar from "../components/common/SideBar";
import { getOptions } from "../utils/SideBarOptions";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <SideBar options={getOptions("Dashboard")} />
      <MainBackground blur="80"></MainBackground>
    </div>
  );
}

export default DashboardPage;
