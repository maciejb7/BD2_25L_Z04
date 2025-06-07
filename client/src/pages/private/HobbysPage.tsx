import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function HobbyPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Hobby")} />
        <div className="ml-12 sm:ml-16"></div>
      </Background>
    </div>
  );
}

export default HobbyPage;