import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUser } from "../../utils/userAuthentication";
import Logo from "./Logo";
import { getUserAvatar } from "../../api/api.user";

export interface SideBarOption {
  name: string;
  icon: string;
  link?: string;
  onClick?: () => void;
  active?: boolean;
}

interface UserSideBarInfo {
  name: string;
  surname: string;
  nickname: string;
}

export interface SideBarOptions {
  options: SideBarOption[];
}

function SideBar({ options }: SideBarOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserSideBarInfo>({
    name: "",
    surname: "",
    nickname: "",
  });
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getUser();
      setUserInfo({
        name: currentUser.name ?? "",
        surname: currentUser.surname ?? "",
        nickname: currentUser.nickname ?? "",
      });
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchAvatar = async () => {
      const avatarUrl = await getUserAvatar();
      setAvatar(avatarUrl ?? "");
    };
    fetchAvatar();
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40
        transition-[width] duration-300 ease-in-out
        ${isOpen ? "w-56 sm:w-64" : "w-12 sm:w-16"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center p-4 border-b 
          ${isOpen ? "justify-between" : "justify-center"}`}
        >
          {isOpen ? (
            <>
              <button onClick={() => setIsOpen(false)} className="ml-2 text-xl">
                ✕
              </button>
              <Logo size="sm" />
            </>
          ) : (
            <button onClick={() => setIsOpen(true)} className="text-xl">
              ☰
            </button>
          )}
        </div>

        {isOpen && (
          <div className="flex flex-col items-center py-4 border-b transition-opacity duration-300">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300" />
            )}
            <span className="text-sm font-semibold text-gray-600">
              {userInfo.name} {userInfo.surname}
            </span>
            <span className="text-lg font-semibold transition-opacity duration-300">
              {userInfo.nickname}
            </span>
          </div>
        )}

        {/* Options */}
        <nav className={`flex flex-col mt-4 px-2`}>
          {options.map((option) =>
            option.link ? (
              <Link
                key={option.link}
                to={option.link}
                className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-2"} py-2 rounded-md transition-colors ${
                  option.active
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i
                  className={`${option.icon} ${
                    isOpen ? "text-base sm:text-lg" : "text-sm sm:text-base"
                  } transition-all duration-200`}
                ></i>
                {isOpen && (
                  <span className="transition-opacity duration-300">
                    {option.name}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={option.name}
                onClick={option.onClick}
                className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-2"} py-2 rounded-md text-left transition-colors text-gray-700 hover:bg-gray-100 w-full`}
              >
                <i
                  className={`${option.icon} ${
                    isOpen ? "text-base sm:text-lg" : "text-sm sm:text-base"
                  } transition-all duration-200`}
                ></i>
                {isOpen && (
                  <span className="transition-opacity duration-300">
                    {option.name}
                  </span>
                )}
              </button>
            ),
          )}
        </nav>
      </div>
    </>
  );
}

export default SideBar;
