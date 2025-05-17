import { logout } from "../api/api.auth";
import { SideBarOption } from "../components/common/SideBar";
import { getAuthObserver } from "./AuthObserver";

const logoutSideBar = async () => {
  const { message } = await logout();
  getAuthObserver().emitLogout(message, "success");
};

/**
 * Global options for the sidebar component.
 */
const options: SideBarOption[] = [
  { name: "Dashboard", icon: "fas fa-home", link: "/dashboard" },
  {
    name: "Konto",
    icon: "fas fa-user-cog",
    link: "/account-settings",
  },
  { name: "Wyloguj", icon: "fas fa-sign-out-alt", onClick: logoutSideBar },
];

/**
 * Function to get the sidebar options.
 * @param activeOption - The name of the currently active option.
 * @returns The sidebar options with the active option marked.
 */
export const getOptions = (activeOption?: string) => {
  options.forEach((option) => {
    if (activeOption === option.name) option.active = true;
    else option.active = false;
  });

  return options;
};
