import AccountActions from "../../components/unique/AccountActions";
import AccountInfo from "../../components/unique/AccountInfo";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function AccountSettings() {
  return (
    <div className="relative min-h-screen flex">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("Konto")} />
        <div className="ml-12 sm:ml-16 py-8 px-4">
          <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
            <i className="fas fa-user"></i>Twoje Konto
          </h2>
          <hr className="my-6" />
          <AccountInfo />
          <hr className="my-6" />
          <AccountActions />
        </div>
      </Background>
    </div>
  );
}

export default AccountSettings;
