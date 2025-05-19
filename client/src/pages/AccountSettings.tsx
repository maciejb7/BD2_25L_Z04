import MainBackground from "../components/common/MainBackground";
import SideBar from "../components/common/SideBar";
import { getOptions } from "../utils/sideBarOptions";
import AccountSettingsWrapper from "../components/account/AccountSettingsWrapper";

function AccountSettings() {
  return (
    <div className="relative min-h-screen flex">
      <SideBar options={getOptions("Konto")} />
      <MainBackground blur="80">
        <div className="ml-12 sm:ml-16">
          <AccountSettingsWrapper />
        </div>
      </MainBackground>
    </div>
  );
}

export default AccountSettings;
