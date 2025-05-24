import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Dashboard")} />
        <div className="ml-12 sm:ml-16"></div>
      </Background>
    </div>
  );
}

export default DashboardPage;
