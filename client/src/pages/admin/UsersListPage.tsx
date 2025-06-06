import AdminChecker from "../../components/common/AdminChecker";
import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function UsersListPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <AdminChecker>
        <Background blur="lg">
          <SideBar options={getSideBarOptions("Użytkownicy")} />
          <div className="ml-12 sm:ml-16 py-8 px-4">
            <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
              <i className="fas fa-user-cog"></i>Użytkownicy
            </h2>
            <hr className="my-6" />
          </div>
        </Background>
      </AdminChecker>
    </div>
  );
}

export default UsersListPage;
