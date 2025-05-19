import AccountActions from "./AccountActions";
import AccountInfo from "./AccountInfo";

function AccountSettingsWrapper() {
  return (
    <div className="max-w-8xl mx-auto rounded-2xl shadow-lg p-8">
      <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
        <i className="fas fa-user"></i>Twoje Konto
      </h2>
      <hr className="my-6" />
      <AccountInfo />
      <hr className="my-6" />
      <AccountActions />
    </div>
  );
}

export default AccountSettingsWrapper;
