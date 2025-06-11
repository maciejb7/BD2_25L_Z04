import Background from "../../components/common/Background";
import SideBar from "../../components/common/SideBar";
import { getSideBarOptions } from "../../constants/sideBarOptions";

function MediaPage() {
  return (
    <div className="relative min-h-screen flex">
      <Background blur="lg">
        <SideBar options={getSideBarOptions("muzyka/filmy/książki")} />
        <div className="ml-12 sm:ml-16 py-8 px-4">
          <h2 className="flex flex-row items-center justify-start gap-4 text-2xl font-bold mb-6 text-gray-800">
            <i className="fas fa-music"></i>Media
          </h2>
          <hr className="my-6" />
          {/* Content for media page goes here */}
        </div>
      </Background>
    </div>
  );
}

export default MediaPage;
