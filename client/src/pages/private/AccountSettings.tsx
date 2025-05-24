import AccountSettingsWrapper from "../../components/account/AccountSettingsWrapper";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function AccountSettings() {
  return (
    <div className="relative min-h-screen flex">
      <SideBar options={getSideBarOptions("Konto")} />
      <Background blur="lg">
        <div className="ml-12 sm:ml-16">
          <AccountSettingsWrapper />
        </div>
      </Background>
    </div>
  );
}

export default AccountSettings;
