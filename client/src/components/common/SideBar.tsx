import { useEffect, useState } from "react";
import { getUserFromStorage } from "../../utils/userAuthentication";
import { getUserFromAPI } from "../../api/api.user";
import { Link } from "react-router-dom";

export interface SideBarOption {
  name: string;
  icon: string;
  link?: string;
  onClick?: () => void;
  active?: boolean;
}

interface UserInfo {
  nick: string;
  avatarUrl: string;
}

export interface SideBarOptions {
  options: SideBarOption[];
}

function SideBar({ options }: SideBarOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nick: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      let currentUser = getUserFromStorage();
      if (!currentUser) currentUser = await getUserFromAPI();
      setUserInfo({ nick: currentUser.nickname ?? "", avatarUrl: "" });
    };
    fetchUser();
  }, []);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300
        ${isOpen ? "w-56 sm:w-64" : "w-12 sm:w-16"}
`}
      >
        {/* Header */}
        <div
          className={`flex items-center p-4 border-b ${isOpen ? "justify-start" : "justify-center"}`}
        >
          {isOpen ? (
            <>
              <button onClick={() => setIsOpen(false)} className="ml-2 text-xl">
                ✕
              </button>
            </>
          ) : (
            <button onClick={() => setIsOpen(true)} className="text-xl">
              ☰
            </button>
          )}
        </div>

        {/* Avatar */}
        {isOpen && (
          <div className="flex flex-col items-center py-4 border-b">
            {userInfo.avatarUrl ? (
              <img
                src={userInfo.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-blue-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-300" />
            )}
            <span className="text-lg font-semibold">{userInfo.nick}</span>
          </div>
        )}

        {/* Options */}
        <nav className="flex flex-col mt-4 px-2">
          {options.map((option) =>
            option.link ? (
              <Link
                key={option.link}
                to={option.link}
                className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                  option.active
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <i className={`${option.icon} text-base sm:text-lg`}></i>
                {isOpen && <span>{option.name}</span>}
              </Link>
            ) : (
              <button
                key={option.name}
                onClick={option.onClick}
                className="flex items-center gap-3 px-4 py-2 rounded-md text-left transition-colors text-gray-700 hover:bg-gray-100 w-full"
              >
                <i className={option.icon}></i>
                {isOpen && <span>{option.name}</span>}
              </button>
            ),
          )}
        </nav>
      </div>
    </>
  );
}

export default SideBar;
